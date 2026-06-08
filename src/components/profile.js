/* Todfeed - Profile Component */

export function renderProfilePanel(container, onProfileUpdated) {
  // Load existing profile or set defaults
  const stored = localStorage.getItem('todfeed_profile');
  const profile = stored ? JSON.parse(stored) : {
    name: "My Baby",
    age: 6,
    country: "us",
    diet: [],
    allergies: []
  };

  container.innerHTML = `
    <div class="card">
      <div class="card-title-row">
        <span class="material-symbols-rounded">child_care</span>
        <h2>Baby's Profile</h2>
      </div>
      <p style="font-size: 14px; color: var(--md-sys-color-secondary); margin-bottom: 24px;">
        Tailor Todfeed's recipe suggestions and daily feeding schedules to your baby's developmental stage.
      </p>

      <form id="form-profile" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="grid-2">
          <md-outlined-text-field
            id="baby-name"
            label="Baby's Name"
            value="${profile.name || ''}"
            required
            style="width: 100%;">
          </md-outlined-text-field>

          <md-outlined-text-field
            id="baby-age"
            label="Age (in months)"
            type="number"
            min="4"
            max="24"
            value="${profile.age || 6}"
            required
            supporting-text="Recommended solid food starts at 6m"
            style="width: 100%;">
          </md-outlined-text-field>
        </div>

        <div class="grid-2">
          <md-outlined-text-field
            id="parent-name"
            label="Your Name (Parent/Caregiver)"
            value="${profile.parentName || ''}"
            required
            style="width: 100%;">
          </md-outlined-text-field>

          <md-outlined-select id="parent-role" label="Relation" style="width: 100%;">
            <md-select-option value="Mom" ${profile.parentRole === 'Mom' ? 'selected' : ''}>
              <div slot="headline">Mom 👩</div>
            </md-select-option>
            <md-select-option value="Dad" ${profile.parentRole === 'Dad' ? 'selected' : ''}>
              <div slot="headline">Dad 👨</div>
            </md-select-option>
            <md-select-option value="Caregiver" ${profile.parentRole === 'Caregiver' ? 'selected' : ''}>
              <div slot="headline">Caregiver 🧑</div>
            </md-select-option>
            <md-select-option value="Grandparent" ${profile.parentRole === 'Grandparent' ? 'selected' : ''}>
              <div slot="headline">Grandparent 👵</div>
            </md-select-option>
          </md-outlined-select>
        </div>

        <div class="form-group">
          <label for="baby-country">Country / Culture Style</label>
          <md-outlined-select id="baby-country" style="width: 100%;">
            <md-select-option value="us" ${profile.country === 'us' ? 'selected' : ''}>
              <div slot="headline">United States (Oats, Avocado, Squash)</div>
            </md-select-option>
            <md-select-option value="in" ${profile.country === 'in' ? 'selected' : ''}>
              <div slot="headline">India (Dal Khichdi, Cumin, Ghee)</div>
            </md-select-option>
            <md-select-option value="jp" ${profile.country === 'jp' ? 'selected' : ''}>
              <div slot="headline">Japan (Rice Okayu, Tofu, Kabocha)</div>
            </md-select-option>
            <md-select-option value="it" ${profile.country === 'it' ? 'selected' : ''}>
              <div slot="headline">Italy (Semolina, Olive Oil, Zucchini)</div>
            </md-select-option>
          </md-outlined-select>
        </div>

        <div class="form-group">
          <label>Dietary Preferences</label>
          <div class="diet-chips">
            <md-chip-set>
              <md-filter-chip id="diet-veg" label="Vegetarian" ${profile.diet.includes('vegetarian') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip id="diet-vegan" label="Vegan" ${profile.diet.includes('vegan') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip id="diet-df" label="Dairy-Free" ${profile.diet.includes('dairy-free') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip id="diet-gf" label="Gluten-Free" ${profile.diet.includes('gluten-free') ? 'selected' : ''}></md-filter-chip>
            </md-chip-set>
          </div>
        </div>

        <div class="form-group">
          <label>Known Allergies (Excludes matching recipes)</label>
          <p style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); margin-bottom: 8px;">
            Select any foods your pediatrician recommended avoiding or monitoring.
          </p>
          <div class="diet-chips">
            <md-chip-set>
              <md-filter-chip class="allergy-chip" data-allergy="egg" label="Egg" ${profile.allergies.includes('egg') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip class="allergy-chip" data-allergy="dairy" label="Dairy" ${profile.allergies.includes('dairy') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip class="allergy-chip" data-allergy="peanut" label="Peanuts" ${profile.allergies.includes('peanut') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip class="allergy-chip" data-allergy="wheat" label="Wheat/Gluten" ${profile.allergies.includes('wheat') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip class="allergy-chip" data-allergy="soy" label="Soy" ${profile.allergies.includes('soy') ? 'selected' : ''}></md-filter-chip>
              <md-filter-chip class="allergy-chip" data-allergy="fish" label="Fish" ${profile.allergies.includes('fish') ? 'selected' : ''}></md-filter-chip>
            </md-chip-set>
          </div>
        </div>

        <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
          <button id="btn-save-profile" class="duo-btn duo-btn-primary" type="button">
            Save Baby Profile
            <span class="material-symbols-rounded">check</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Informational Card based on age milestones -->
    <div class="card" id="milestone-card" style="background-color: var(--md-sys-color-surface-container-low);">
      <div class="card-title-row">
        <span class="material-symbols-rounded" style="color: var(--md-sys-color-secondary);">info</span>
        <h3 id="milestone-title" style="font-size: 16px; font-weight:600;">Developmental Stage</h3>
      </div>
      <p id="milestone-desc" style="font-size: 13px; line-height: 1.5; color: var(--md-sys-color-on-surface-variant);"></p>
    </div>
  `;

  // Get milestone helper text
  function updateMilestoneCard(age) {
    const titleEl = container.querySelector('#milestone-title');
    const descEl = container.querySelector('#milestone-desc');
    if (!titleEl || !descEl) return;

    if (age >= 4 && age <= 6) {
      titleEl.innerText = "Developmental Stage: 4-6 Months (First Tastes)";
      descEl.innerText = "Your baby is starting their solid food journey! Focus on single-ingredient, smooth, runny purees (breastmilk/formula + vegetable or fruit). The goal is learning swallow mechanics and introducing new flavors, not replacing full milk feeds.";
    } else if (age >= 7 && age <= 9) {
      titleEl.innerText = "Developmental Stage: 7-9 Months (Mashes & Textures)";
      descEl.innerText = "Your baby can sit upright and starts chewing motions. Gradually introduce thicker purees, lumpier mashes (fork-mashed avocado, banana, or khichdi), and very soft finger foods. You can start introducing mild spices and herbs now.";
    } else if (age >= 10 && age <= 12) {
      titleEl.innerText = "Developmental Stage: 10-12 Months (Pincer Grasp & Finger Foods)";
      descEl.innerText = "Your baby is mastering the pincer grasp (picking up items with thumb and forefinger). Serve soft-cooked, bite-sized finger foods (broccoli trees, cooked carrots, soft pancakes). Ensure foods are cut small and easily mashable with gums.";
    } else {
      titleEl.innerText = "Developmental Stage: 12+ Months (Family Table Foods)";
      descEl.innerText = "Your child can eat modified family meals! Keep salt/sugar minimal, but they can enjoy similar spices, textures, and varieties. Monitor chewing carefully and ensure round foods (like grapes/cherry tomatoes) are cut into quarters.";
    }
  }

  // Initial milestone description render
  updateMilestoneCard(profile.age);

  // Add event listener to age field to dynamically update milestone card
  const ageInput = container.querySelector('#baby-age');
  ageInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 4 && val <= 24) {
      updateMilestoneCard(val);
    }
  });

  // Save profile trigger
  const saveBtn = container.querySelector('#btn-save-profile');
  saveBtn.addEventListener('click', () => {
    const nameVal = container.querySelector('#baby-name').value || "My Baby";
    const ageVal = parseInt(container.querySelector('#baby-age').value, 10) || 6;
    const countryVal = container.querySelector('#baby-country').value || "us";
    const parentNameVal = container.querySelector('#parent-name').value || "";
    const parentRoleVal = container.querySelector('#parent-role').value || "Mom";

    // Read selected diets
    const diet = [];
    if (container.querySelector('#diet-veg').selected) diet.push('vegetarian');
    if (container.querySelector('#diet-vegan').selected) diet.push('vegan');
    if (container.querySelector('#diet-df').selected) diet.push('dairy-free');
    if (container.querySelector('#diet-gf').selected) diet.push('gluten-free');

    // Read selected allergies
    const allergies = [];
    const allergyChips = container.querySelectorAll('.allergy-chip');
    allergyChips.forEach(chip => {
      if (chip.selected) {
        allergies.push(chip.dataset.allergy);
      }
    });

    const updatedProfile = {
      name: nameVal,
      age: ageVal,
      country: countryVal,
      diet,
      allergies,
      parentName: parentNameVal,
      parentRole: parentRoleVal
    };

    localStorage.setItem('todfeed_profile', JSON.stringify(updatedProfile));
    
    // Create a beautiful visual snackbar indicator (simulated with standard alerts or custom M3 element)
    alert("Profile saved successfully!");

    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }
  });
}
