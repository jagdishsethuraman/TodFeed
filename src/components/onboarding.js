/* Todfeed - Onboarding Flow Component */

import { generateDailyMealSheet } from '../utils/recipeEngine.js';
import { saveScheduleToFirestore } from '../utils/firebaseSync.js';

export function initializeOnboarding(overlayContainer, onComplete) {
  let currentSlide = 0; // 0 to 7
  let babyName = "My Baby";
  let babyAge = 6;
  let babyCountry = "us";
  let babyDiet = [];
  let babyAllergies = [];
  let parentName = "";
  let parentRole = "Mom";

  const totalSlides = 8;

  // Mascot image states
  const mascotImages = {
    winking: "/todfeed_mascot.png", // Excited dino holding a bowl
    broccoli: "/public/todfeed_dino_mascot_variations.png", // Or we can use the same file with object positions, but wait!
    // Since we generated public/todfeed_dino_spoon_variations.png as a 2x2 grid, we can use CSS crop / background-position,
    // or just use `/todfeed_mascot.png` for all slides, but style it with different border/shadow card colors,
    // or we can slice them!
    // Wait! `/todfeed_mascot.png` is the main Option C. We can just use `/todfeed_mascot.png` as it is extremely cute,
    // and style it with subtle animations, or use the main grid `/public/todfeed_dino_spoon_variations.png` and crop via CSS
    // to show different corners of the 2x2 grid! That's incredibly smart!
    // Let's check:
    // Top-Left (Quadrant 1): Classic Dino winking with spoon (A)
    // Top-Right (Quadrant 2): Dino eating broccoli (B)
    // Bottom-Left (Quadrant 3): Excited Dino with bowl (C) (the primary mascot)
    // Bottom-Right (Quadrant 4): Dino with apple (D)
    // We can crop them dynamically in CSS using background-image and background-position!
    // This is super clever. Let's do that!
  };

  function render() {
    overlayContainer.innerHTML = `
      <div class="onboarding-card">
        <!-- Progress Bar at Top -->
        <div class="onboarding-progress-bar-container">
          <div class="onboarding-progress-bar-fill" style="width: ${((currentSlide + 1) / totalSlides) * 100}%"></div>
        </div>

        <div class="onboarding-card-body">
          <!-- Slide Content Slot -->
          <div class="onboarding-slide-content">
            ${renderSlideContent()}
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="onboarding-footer">
          <button id="btn-onboard-back" class="duo-btn duo-btn-outline" style="height: 48px; border-radius: 14px; min-width: 90px; visibility: ${currentSlide === 0 ? 'hidden' : 'visible'};" type="button">
            Back
          </button>
          
          <!-- Indicator Dots -->
          <div class="onboarding-dots">
            ${Array.from({ length: totalSlides }).map((_, idx) => `
              <div class="onboarding-dot ${idx === currentSlide ? 'active' : ''}"></div>
            `).join('')}
          </div>

          <button id="btn-onboard-next" class="duo-btn duo-btn-primary" style="height: 48px; border-radius: 14px; min-width: 90px;" type="button">
            ${currentSlide === totalSlides - 1 ? 'Let\'s Feed!' : 'Next'}
          </button>
        </div>
      </div>
    `;

    setupEventListeners();
  }

  function renderSlideContent() {
    switch (currentSlide) {
      case 0:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q3">
              <!-- Uses CSS crop for Q3 Excited Dino -->
              <div class="onboard-mascot-sprite sprite-q3"></div>
            </div>
            <div class="onboard-text-frame">
              <h2>Welcome to Todfeed! 🦖</h2>
              <p>Your premium companion for toddler feeding. Let's take the daily stress out of meal prep, schedules, and safety checking.</p>
              <p style="font-size: 13px; color: var(--color-text-light); font-weight: 700;">We'll get you set up in just a few clicks!</p>
            </div>
          </div>
        `;
      case 1:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q1">
              <div class="onboard-mascot-sprite sprite-q1"></div>
            </div>
            <div class="onboard-text-frame">
              <h2>Smart AI Recipes 🍉</h2>
              <p>Select ingredients in your pantry, check safety warnings instantly, and generate custom, texture-correct recipes powered by Gemini AI.</p>
            </div>
          </div>
        `;
      case 2:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q2">
              <div class="onboard-mascot-sprite sprite-q2"></div>
            </div>
            <div class="onboard-text-frame">
              <h2>Log Meals & Reactions 📝</h2>
              <p>Mark meals as eaten in your daily schedule timeline. Record your baby's reactions (Loved 😊, neutral 😐, or spit out 😠) to build feeding logs.</p>
            </div>
          </div>
        `;
      case 3:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q4">
              <div class="onboard-mascot-sprite sprite-q4"></div>
            </div>
            <div class="onboard-text-frame">
              <h2>Who are we cooking for? 👶</h2>
              <p>Let's personalize your experience. What is your little one's name?</p>
              <md-outlined-text-field
                id="input-onboard-name"
                label="Baby's Name"
                placeholder="E.g., Rhea, Leo, Arya"
                value="${babyName === 'My Baby' ? '' : babyName}"
                style="width: 100%; margin-top: 12px;"
                required>
              </md-outlined-text-field>
              <p id="onboard-name-error" style="color: var(--md-sys-color-error); font-size: 11px; font-weight: 800; margin-top: 4px; display: none; text-align: left;">
                Please enter a name to continue!
              </p>

              <div style="display: flex; gap: 12px; margin-top: 20px; align-items: flex-start;">
                <md-outlined-text-field
                  id="input-onboard-parent-name"
                  label="Your Name"
                  placeholder="E.g., Sarah, John"
                  value="${parentName}"
                  style="flex: 1;"
                  required>
                </md-outlined-text-field>

                <md-outlined-select id="input-onboard-parent-role" style="width: 140px;">
                  <md-select-option value="Mom" ${parentRole === 'Mom' ? 'selected' : ''}>
                    <div slot="headline">Mom 👩</div>
                  </md-select-option>
                  <md-select-option value="Dad" ${parentRole === 'Dad' ? 'selected' : ''}>
                    <div slot="headline">Dad 👨</div>
                  </md-select-option>
                  <md-select-option value="Caregiver" ${parentRole === 'Caregiver' ? 'selected' : ''}>
                    <div slot="headline">Caregiver 🧑</div>
                  </md-select-option>
                  <md-select-option value="Grandparent" ${parentRole === 'Grandparent' ? 'selected' : ''}>
                    <div slot="headline">Grandparent 👵</div>
                  </md-select-option>
                </md-outlined-select>
              </div>
              <p id="onboard-parent-error" style="color: var(--md-sys-color-error); font-size: 11px; font-weight: 800; margin-top: 4px; display: none; text-align: left;">
                Please enter your name to continue!
              </p>
            </div>
          </div>
        `;
      case 4:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q3">
              <div class="onboard-mascot-sprite sprite-q3"></div>
            </div>
            <div class="onboard-text-frame">
              <h2>How old is ${babyName}? 📅</h2>
              <p>We use their age in months to suggest correct texture sizes (purees vs finger foods) and milestones.</p>
              
              <div style="margin-top: 16px;">
                <label style="font-size: 12px; font-weight:800; color: var(--color-primary-dark); text-transform: uppercase;">Age: <span id="onboard-age-val" style="font-size: 18px; font-weight: 800;">${babyAge}</span> months</label>
                <input 
                  type="range" 
                  id="input-onboard-age" 
                  min="4" 
                  max="24" 
                  value="${babyAge}" 
                  style="width: 100%; height: 8px; border-radius: 4px; background: var(--color-border); accent-color: var(--color-primary); cursor: pointer; margin-top: 12px;"
                />
              </div>
              <div id="onboard-age-milestone" style="background: var(--color-background); color: var(--color-text); border: 2.5px solid var(--color-border); border-bottom-width: 5px; border-bottom-color: var(--color-border-dark); padding: 12px; border-radius: 12px; margin-top: 16px; font-size: 12px; line-height:1.4; text-align: left;">
                <!-- Filled dynamically by JS -->
              </div>
            </div>
          </div>
        `;
      case 5:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q4">
              <div class="onboard-mascot-sprite sprite-q4"></div>
            </div>
            <div class="onboard-text-frame">
              <h2>Country/Region Menu 🌍</h2>
              <p>Adapt scheduled recipes to regional cuisines and cultural weaning practices.</p>
              
              <md-outlined-select id="input-onboard-country" style="width: 100%; margin-top: 16px;">
                <md-select-option value="us" ${babyCountry === 'us' ? 'selected' : ''}>
                  <div slot="headline">United States / Western Weaning</div>
                </md-select-option>
                <md-select-option value="in" ${babyCountry === 'in' ? 'selected' : ''}>
                  <div slot="headline">India / Traditional Khichdi & Ragi Weaning</div>
                </md-select-option>
                <md-select-option value="jp" ${babyCountry === 'jp' ? 'selected' : ''}>
                  <div slot="headline">Japan / Rice Okayu & Dashi Weaning</div>
                </md-select-option>
                <md-select-option value="it" ${babyCountry === 'it' ? 'selected' : ''}>
                  <div slot="headline">Italy / Semolina & Olive Oil Weaning</div>
                </md-select-option>
              </md-outlined-select>
            </div>
          </div>
        `;
      case 6:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q1">
              <div class="onboard-mascot-sprite sprite-q1"></div>
            </div>
            <div class="onboard-text-frame" style="max-height: 380px; overflow-y: auto; padding-right: 4px;">
              <h2>Diet & Allergies 🥗</h2>
              <p>Filter out meals containing restrictions or allergens automatically.</p>

              <h4 style="font-size: 12px; text-transform: uppercase; color: var(--color-primary-dark); font-weight:800; margin: 12px 0 6px 0; text-align: left;">Dietary Preferences</h4>
              <div class="ingredient-chips-grid">
                ${["Vegetarian", "Vegan", "Dairy-Free", "Gluten-Free"].map(item => {
                  const isSel = babyDiet.includes(item);
                  return `<md-filter-chip class="onboard-diet-chip" label="${item}" data-val="${item}" ${isSel ? 'selected' : ''}></md-filter-chip>`;
                }).join('')}
              </div>

              <h4 style="font-size: 12px; text-transform: uppercase; color: var(--color-primary-dark); font-weight:800; margin: 16px 0 6px 0; text-align: left;">Allergen Exclusions</h4>
              <div class="ingredient-chips-grid">
                ${["Egg", "Peanut", "Dairy", "Wheat", "Soy"].map(item => {
                  const isSel = babyAllergies.includes(item);
                  return `<md-filter-chip class="onboard-allergy-chip" label="${item}" data-val="${item}" ${isSel ? 'selected' : ''}></md-filter-chip>`;
                }).join('')}
              </div>
            </div>
          </div>
        `;
      case 7:
        return `
          <div class="onboard-slide-grid">
            <div class="onboard-mascot-frame frame-q3 animate-bounce-slow">
              <div class="onboard-mascot-sprite sprite-q3"></div>
            </div>
            <div class="onboard-text-frame">
              <h2>All Set! Let's Feed! 🎉</h2>
              <p>We've created a custom daily planner tailored specifically for <strong>${babyName}</strong>.</p>
              <p style="font-size: 13px; color: var(--color-text-dark); line-height: 1.4; margin-top: 10px;">
                You are ready to match local pantry items, generate AI recipes, and track meals!
              </p>
            </div>
          </div>
        `;
    }
  }

  function setupEventListeners() {
    const btnBack = overlayContainer.querySelector('#btn-onboard-back');
    const btnNext = overlayContainer.querySelector('#btn-onboard-next');

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (currentSlide > 0) {
          saveCurrentSlideState();
          currentSlide--;
          render();
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (!validateCurrentSlide()) return;

        saveCurrentSlideState();
        if (currentSlide < totalSlides - 1) {
          currentSlide++;
          render();
        } else {
          // Finish onboarding
          completeOnboarding();
        }
      });
    }

    // Dynamic Slider behavior for Slide 4 (Age)
    if (currentSlide === 4) {
      const ageSlider = overlayContainer.querySelector('#input-onboard-age');
      const ageValLabel = overlayContainer.querySelector('#onboard-age-val');
      const milestoneCard = overlayContainer.querySelector('#onboard-age-milestone');

      const updateAgeDisplay = (val) => {
        babyAge = parseInt(val, 10);
        if (ageValLabel) ageValLabel.textContent = babyAge;

        // Display developmental milestones
        if (milestoneCard) {
          let text = "";
          if (babyAge >= 4 && babyAge <= 6) {
            text = "<strong>Milestone: Smooth Purees (4-6 months)</strong><br/>Introduction to solids. Single ingredients, runny/watery purées only. Focus is purely on allergen introduction and swallowing.";
          } else if (babyAge >= 7 && babyAge <= 9) {
            text = "<strong>Milestone: Mashes & Textures (7-9 months)</strong><br/>Thicker, lumpy purées, mashed bananas/avocados, and soft scoopable porridge. Baby learns to chew soft lumps.";
          } else if (babyAge >= 10 && babyAge <= 12) {
            text = "<strong>Milestone: Soft Finger Foods (10-12 months)</strong><br/>Minced meats, soft scrambled eggs, and finger-sized soft cooked fruits/veggies. Baby develops fine pincer grasp.";
          } else {
            text = "<strong>Milestone: Toddler Table Food (12-24 months)</strong><br/>Baby can chew family food chopped into bite-sized safe bits. Whole cow's milk can be introduced as a beverage.";
          }
          milestoneCard.innerHTML = text;
        }
      };

      if (ageSlider) {
        ageSlider.addEventListener('input', (e) => {
          updateAgeDisplay(e.target.value);
        });
        // Run once on load
        updateAgeDisplay(ageSlider.value);
      }
    }

    // Diet chip clicks
    if (currentSlide === 6) {
      const dietChips = overlayContainer.querySelectorAll('.onboard-diet-chip');
      dietChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          const val = chip.dataset.val;
          if (babyDiet.includes(val)) {
            babyDiet = babyDiet.filter(v => v !== val);
          } else {
            babyDiet.push(val);
          }
        });
      });

      const allergyChips = overlayContainer.querySelectorAll('.onboard-allergy-chip');
      allergyChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          const val = chip.dataset.val;
          if (babyAllergies.includes(val)) {
            babyAllergies = babyAllergies.filter(v => v !== val);
          } else {
            babyAllergies.push(val);
          }
        });
      });
    }
  }

  function validateCurrentSlide() {
    if (currentSlide === 3) {
      const nameInput = overlayContainer.querySelector('#input-onboard-name');
      const errorMsg = overlayContainer.querySelector('#onboard-name-error');
      const name = nameInput ? nameInput.value.trim() : "";

      const parentNameInput = overlayContainer.querySelector('#input-onboard-parent-name');
      const parentErrorMsg = overlayContainer.querySelector('#onboard-parent-error');
      const pName = parentNameInput ? parentNameInput.value.trim() : "";

      let isValid = true;

      if (name === "") {
        if (errorMsg) errorMsg.style.display = 'block';
        if (nameInput) nameInput.style.borderColor = 'var(--md-sys-color-error)';
        isValid = false;
      } else {
        if (errorMsg) errorMsg.style.display = 'none';
      }

      if (pName === "") {
        if (parentErrorMsg) parentErrorMsg.style.display = 'block';
        if (parentNameInput) parentNameInput.style.borderColor = 'var(--md-sys-color-error)';
        isValid = false;
      } else {
        if (parentErrorMsg) parentErrorMsg.style.display = 'none';
      }

      if (!isValid) return false;

      babyName = name;
      parentName = pName;
      
      const roleSelect = overlayContainer.querySelector('#input-onboard-parent-role');
      if (roleSelect) {
        parentRole = roleSelect.value;
      }
    }
    return true;
  }

  function saveCurrentSlideState() {
    if (currentSlide === 5) {
      const countrySelect = overlayContainer.querySelector('#input-onboard-country');
      if (countrySelect) {
        babyCountry = countrySelect.value;
      }
    }
  }

  function completeOnboarding() {
    const profile = {
      name: babyName,
      age: babyAge,
      country: babyCountry,
      diet: babyDiet,
      allergies: babyAllergies,
      parentName: parentName,
      parentRole: parentRole
    };

    // Save profile to LocalStorage
    localStorage.setItem('todfeed_profile', JSON.stringify(profile));

    // Generate fresh daily planner routine for this child
    const baseSchedule = generateDailyMealSheet(profile);
    const scheduleState = baseSchedule.map(slot => ({
      ...slot,
      completed: false,
      reaction: null
    }));
    const scheduleKey = `todfeed_schedule_${babyName.replace(/\s+/g, '_')}`;
    localStorage.setItem(scheduleKey, JSON.stringify(scheduleState));

    // Save schedule to Firestore
    saveScheduleToFirestore(scheduleState);

    // Clear pantry list to default empty for this new child
    localStorage.removeItem('todfeed_pantry');

    // Mark as onboarded
    localStorage.setItem('todfeed_onboarded', 'true');

    // Fire success callback
    if (onComplete) {
      onComplete();
    }
  }

  // Initial Boot
  render();
}
