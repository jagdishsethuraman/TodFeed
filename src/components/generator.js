/* Todfeed - Recipe Generator Component */

import { runSafetyChecks, matchLocalRecipes, generateAiRecipe } from '../utils/recipeEngine.js';
import { savePantryToFirestore } from '../utils/firebaseSync.js';
import { db, auth } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

export function renderGeneratorPanel(container, getProfile, onAddRecipeToPlanner) {
  let selectedIngredients = JSON.parse(localStorage.getItem('todfeed_pantry') || '[]');

  async function getRemainingGenerations() {
    const user = auth.currentUser;
    if (!user) return 0;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.limits && data.limits.date === todayStr) {
          return Math.max(0, 5 - data.limits.count);
        }
      }
    } catch (e) {
      console.error("Error reading daily limits:", e);
    }
    return 5; // Default free generations
  }

  async function updateCountdownUI() {
    const indicator = container.querySelector('#ai-countdown-indicator');
    const generateBtn = container.querySelector('#btn-generate-ai');
    if (!indicator) return;

    // Check if custom key exists
    const customKey = localStorage.getItem('gemini_api_key');
    if (customKey) {
      indicator.innerHTML = `<span style="color: var(--color-primary);">★ Unlimited (using custom key)</span>`;
      if (generateBtn && selectedIngredients.length > 0) {
        generateBtn.disabled = false;
      }
      return;
    }

    // Otherwise, check Firestore daily limit
    try {
      const remaining = await getRemainingGenerations();
      indicator.innerHTML = `${remaining} of 5 free generations remaining today`;
      if (remaining === 0) {
        indicator.innerHTML = `<span style="color: #ba1a1a; font-weight: 700;">0 of 5 free generations remaining. <a href="#" id="link-upgrade-settings" style="color: var(--color-primary); text-decoration: underline; font-weight: 800;">Add Gemini API key in Settings</a> for unlimited!</span>`;
        
        const settingsLink = indicator.querySelector('#link-upgrade-settings');
        if (settingsLink) {
          settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.openSettings) {
              window.openSettings('api');
            } else {
              document.querySelector('#settings-dialog').classList.add('active');
            }
          });
        }

        if (generateBtn) {
          generateBtn.disabled = true;
        }
      }
    } catch (e) {
      console.error("Error updating countdown UI:", e);
      indicator.textContent = "Error loading daily limit.";
    }
  }

  function savePantry() {
    localStorage.setItem('todfeed_pantry', JSON.stringify(selectedIngredients));
    savePantryToFirestore(selectedIngredients);
  }

  let currentRecipeResult = null;

  const categories = {
    "Vegetables": ["Sweet Potato", "Carrot", "Spinach", "Broccoli", "Pumpkin", "Zucchini"],
    "Fruits": ["Apple", "Pear", "Banana", "Avocado"],
    "Grains & Proteins": ["Oats", "Rice", "Lentils", "Tofu", "Egg Yolk"],
    "Cautions (for warnings)": ["Honey", "Cow's Milk", "Salt", "Sugar"]
  };

  function render() {
    const profile = getProfile();
    const warnings = runSafetyChecks(selectedIngredients, profile.age);

    container.innerHTML = `
      <div class="card">
        <div class="card-title-row">
          <span class="material-symbols-rounded">restaurant</span>
          <h2>AI Recipe Generator</h2>
        </div>
        <p style="font-size: 14px; color: var(--md-sys-color-secondary); margin-bottom: 16px;">
          Select the ingredients you have available. Todfeed will verify their age safety and recommend custom recipes.
        </p>

        <!-- Selected Ingredients Display -->
        <div class="selected-ingredients-bar">
          <p>Selected Ingredients (${selectedIngredients.length}):</p>
          <div id="selected-chips-container" class="ingredient-chips-grid">
            ${selectedIngredients.length === 0 
              ? `<span style="font-size: 13px; color: var(--md-sys-color-on-surface-variant); font-style: italic;">No ingredients selected yet. Select from the categories below!</span>`
              : selectedIngredients.map(ing => `
                  <md-input-chip label="${ing}" remove-only class="active-ingredient-chip" data-ing="${ing}">
                  </md-input-chip>
                `).join('')
            }
          </div>
          ${selectedIngredients.length > 0 ? `
            <div style="display: flex; justify-content: flex-end;">
              <md-text-button id="btn-clear-ingredients" style="--md-text-button-label-text-color: var(--md-sys-color-error);">
                Clear All
              </md-text-button>
            </div>
          ` : ''}
        </div>

        <!-- Safety Checker Alert Box -->
        <div id="safety-warnings-container">
          ${warnings.map(warn => `
            <div class="safety-alert-card">
              <span class="material-symbols-rounded" style="color: ${warn.type === 'DANGER' ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)'}">
                ${warn.type === 'DANGER' ? 'report' : 'warning'}
              </span>
              <div class="content">
                <h4>${warn.title}</h4>
                <p>${warn.message}</p>
              </div>
            </div>
          `).join('')}
        </div>
        <!-- Custom Ingredient Input Field -->
        <div style="background-color: var(--md-sys-color-surface-container-high); border: 2px dashed var(--color-border); border-radius: var(--border-radius-sm); padding: 16px; margin-bottom: 20px;">
          <h3 style="font-family: var(--font-heading); font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-dark); margin-bottom: 8px;">
            Add Custom Ingredient
          </h3>
          <p style="font-size: 12px; color: var(--color-text-light); margin-bottom: 12px;">
            If your ingredient is not in the presets below, type it in and add it directly:
          </p>
          <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
            <md-outlined-text-field
              id="input-custom-ingredient"
              label="E.g., Quinoa, Salmon, Blueberries"
              style="flex: 1;">
            </md-outlined-text-field>
            <button id="btn-add-custom-ingredient" class="duo-btn duo-btn-primary" style="height: 56px; border-radius: 16px; min-width: 80px;" type="button">
              Add
              <span class="material-symbols-rounded">add</span>
            </button>
          </div>
        </div>

        <!-- Ingredient Picker Grid -->
        <div class="pantry-section">
          ${Object.entries(categories).map(([catName, items]) => `
            <div class="category-group" style="margin-bottom: 16px;">
              <h3 style="font-size: 13px; font-weight:600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--md-sys-color-secondary); margin-bottom: 8px;">
                ${catName}
              </h3>
              <div class="ingredient-chips-grid">
                ${items.map(item => {
                  const isSelected = selectedIngredients.includes(item);
                  return `<md-filter-chip 
                            class="pantry-chip" 
                            label="${item}" 
                            data-ing="${item}"
                            ${isSelected ? 'selected' : ''}>
                          </md-filter-chip>`;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Generator Actions -->
        <div class="generate-actions">
          <button id="btn-match-local" class="duo-btn duo-btn-primary" type="button" ${selectedIngredients.length === 0 ? 'disabled' : ''}>
            Match Recipes
            <span class="material-symbols-rounded">menu_book</span>
          </button>

          <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; width: 100%;">
            <button id="btn-generate-ai" class="duo-btn duo-btn-tertiary" type="button" ${selectedIngredients.length === 0 ? 'disabled' : ''}>
              Generate with Gemini AI
              <span class="material-symbols-rounded">auto_awesome</span>
            </button>
            <div id="ai-countdown-indicator" style="font-size: 12px; font-weight: 700; color: var(--color-text-light); margin-top: 4px; text-align: center;">
              Checking remaining free generations...
            </div>
          </div>
        </div>

        <!-- Loading Spinner Container -->
        <div id="generation-loader" class="loading-container" style="display: none;">
          <md-linear-progress indeterminate style="width: 100%; max-width: 300px;"></md-linear-progress>
          <p>Gemini is preparing your baby's custom nutrition recipe sheet...</p>
        </div>
      </div>

      <!-- Recipe Results Output Container -->
      <div id="recipe-result-container"></div>
    `;

    setupEventListeners();
    updateCountdownUI();
  }

  function setupEventListeners() {
    // Custom ingredient adder
    const addCustomBtn = container.querySelector('#btn-add-custom-ingredient');
    const customInput = container.querySelector('#input-custom-ingredient');
    if (addCustomBtn && customInput) {
      const addCustom = () => {
        const value = customInput.value.trim();
        if (value) {
          const formatted = value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          if (!selectedIngredients.includes(formatted)) {
            selectedIngredients.push(formatted);
            savePantry();
            render();
          } else {
            alert(`"${formatted}" is already in your selected list!`);
          }
          customInput.value = '';
        }
      };

      addCustomBtn.addEventListener('click', addCustom);
      customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustom();
        }
      });
    }

    // Ingredient filter chips select
    const pantryChips = container.querySelectorAll('.pantry-chip');
    pantryChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const item = e.target.dataset.ing;
        if (selectedIngredients.includes(item)) {
          selectedIngredients = selectedIngredients.filter(i => i !== item);
        } else {
          selectedIngredients.push(item);
        }
        savePantry();
        render();
      });
    });

    // Ingredient remove chips
    const inputChips = container.querySelectorAll('.active-ingredient-chip');
    inputChips.forEach(chip => {
      chip.addEventListener('remove', (e) => {
        const item = e.target.dataset.ing;
        selectedIngredients = selectedIngredients.filter(i => i !== item);
        savePantry();
        render();
      });
    });

    // Clear ingredients button
    const clearBtn = container.querySelector('#btn-clear-ingredients');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        selectedIngredients = [];
        savePantry();
        render();
      });
    }

    // Match local database recipes
    const matchLocalBtn = container.querySelector('#btn-match-local');
    if (matchLocalBtn) {
      matchLocalBtn.addEventListener('click', () => {
        const profile = getProfile();
        const matches = matchLocalRecipes(selectedIngredients, profile);
        displayRecipeMatches(matches);
      });
    }

    // Generate recipe via Gemini AI
    const generateAiBtn = container.querySelector('#btn-generate-ai');
    if (generateAiBtn) {
      generateAiBtn.addEventListener('click', async () => {
        const profile = getProfile();
        const loader = container.querySelector('#generation-loader');
        const resultDiv = container.querySelector('#recipe-result-container');
        
        loader.style.display = 'flex';
        resultDiv.innerHTML = '';
        generateAiBtn.disabled = true;

        try {
          const aiRecipe = await generateAiRecipe(selectedIngredients, profile);
          currentRecipeResult = aiRecipe;
          displaySingleRecipe(aiRecipe, true);
        } catch (err) {
          resultDiv.innerHTML = `
            <div class="card" style="border-color: var(--md-sys-color-error);">
              <div class="card-title-row" style="color: var(--md-sys-color-error);">
                <span class="material-symbols-rounded">error</span>
                <h3>AI Generation Failed</h3>
              </div>
              <p style="font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
                ${err.message}
              </p>
              <button id="btn-open-settings-err" class="duo-btn duo-btn-primary" type="button">
                Open Settings
              </button>
            </div>
          `;
          
          const settingsBtn = resultDiv.querySelector('#btn-open-settings-err');
          if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
              document.querySelector('#settings-dialog').classList.add('active');
            });
          }
        } finally {
          loader.style.display = 'none';
          generateAiBtn.disabled = false;
          updateCountdownUI();
        }
      });
    }
  }

  // Display matched recipes from local catalog
  function displayRecipeMatches(recipes) {
    const resultDiv = container.querySelector('#recipe-result-container');
    if (recipes.length === 0) {
      resultDiv.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <span class="material-symbols-rounded" style="font-size: 48px; color: var(--md-sys-color-secondary); margin-bottom: 12px;">receipt_long</span>
          <h3 style="font-size:18px; font-weight:600; margin-bottom: 8px;">No Direct Matches Found</h3>
          <p style="font-size: 13px; color: var(--md-sys-color-on-surface-variant); max-width: 400px; margin: 0 auto;">
            We couldn't find a local database recipe containing those exact items. Try selecting more general ingredients, or run Gemini AI to generate a brand new recipe!
          </p>
        </div>
      `;
      return;
    }

    resultDiv.innerHTML = `
      <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">
        Matched Recipes (${recipes.length})
      </h3>
      <div id="recipe-list-container">
        ${recipes.map((recipe, index) => `
          <div class="card recipe-summary-card" data-idx="${index}" style="cursor: pointer; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 600; color: var(--md-sys-color-primary); margin-bottom: 4px;">
                  ${recipe.recipeName}
                </h3>
                <p style="font-size: 13px; color: var(--md-sys-color-secondary); font-weight:500;">
                  Suitable for ages: ${recipe.ageMin}-${recipe.ageMax} months
                </p>
              </div>
              <span class="material-symbols-rounded" style="color: var(--md-sys-color-outline)">arrow_forward_ios</span>
            </div>
            <p style="font-size: 13px; line-height:1.4; color: var(--md-sys-color-on-surface-variant); margin-top: 12px;">
              Ingredients: ${recipe.ingredients.join(', ')}
            </p>
          </div>
        `).join('')}
      </div>
    `;

    // Add click listener to show specific recipe details
    const summaryCards = resultDiv.querySelectorAll('.recipe-summary-card');
    summaryCards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        currentRecipeResult = recipes[idx];
        displaySingleRecipe(recipes[idx], false);
      });
    });
  }

  // Display a single recipe view
  function displaySingleRecipe(recipe, isAiGenerated) {
    const resultDiv = container.querySelector('#recipe-result-container');
    
    resultDiv.innerHTML = `
      <div class="card recipe-container">
        <div class="recipe-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h3>${recipe.recipeName}</h3>
              <p style="font-size: 12px; color: var(--md-sys-color-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                ${isAiGenerated ? '★ Live Gemini AI Recommendation' : 'Local Approved Recipe'}
              </p>
            </div>
            <md-outlined-icon-button id="btn-back-to-list" style="margin-top: -4px;">
              <span class="material-symbols-rounded">arrow_back</span>
            </md-outlined-icon-button>
          </div>
          <div class="recipe-meta-row" style="margin-top: 12px;">
            <div class="recipe-meta-item">
              <span class="material-symbols-rounded">texture</span>
              <span>Texture: ${recipe.texture || 'Puree'}</span>
            </div>
            <div class="recipe-meta-item">
              <span class="material-symbols-rounded">schedule</span>
              <span>Prep: ${recipe.prepTime || '5m'} | Cook: ${recipe.cookTime || '10m'}</span>
            </div>
          </div>
        </div>

        <!-- Safety note (if any) -->
        ${recipe.safetyAlerts ? `
          <div style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 12px; border-radius: var(--border-radius-sm); font-size: 13px; line-height: 1.4; margin-bottom: 20px; display:flex; gap: 8px;">
            <span class="material-symbols-rounded" style="font-size: 20px; flex-shrink:0;">info</span>
            <div><strong>Pediatric Note:</strong> ${recipe.safetyAlerts}</div>
          </div>
        ` : ''}

        <!-- Ingredients list -->
        <h4 class="recipe-section-title">
          <span class="material-symbols-rounded">shopping_basket</span> Ingredients
        </h4>
        <ul class="recipe-list">
          ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>

        <!-- Cooking Instructions -->
        <h4 class="recipe-section-title">
          <span class="material-symbols-rounded">cooking</span> Instructions
        </h4>
        <div class="recipe-steps">
          ${recipe.instructions.map((step, index) => `
            <div class="recipe-step">
              <div class="recipe-step-num">${index + 1}</div>
              <div>${step}</div>
            </div>
          `).join('')}
        </div>

        <!-- Nutritional Benefit -->
        ${recipe.nutritionBenefit ? `
          <div class="recipe-benefit">
            <strong>Nutritional Value:</strong> ${recipe.nutritionBenefit}
          </div>
        ` : ''}

        <!-- Planner Add Actions -->
        <div style="margin-top: 24px; border-top: 2px solid var(--color-border); padding-top: 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 12px;">
          <span style="font-size:14px; font-weight:800; text-transform: uppercase; color: var(--color-secondary-dark);">Add to Daily Schedule:</span>
          <div style="display:flex; gap: 8px;">
            <button class="duo-btn duo-btn-outline btn-add-to-slot" data-slot="Breakfast" style="height:38px; padding:0 12px; font-size:13px; border-radius:12px;">Breakfast</button>
            <button class="duo-btn duo-btn-outline btn-add-to-slot" data-slot="Lunch" style="height:38px; padding:0 12px; font-size:13px; border-radius:12px;">Lunch</button>
            <button class="duo-btn duo-btn-outline btn-add-to-slot" data-slot="Dinner" style="height:38px; padding:0 12px; font-size:13px; border-radius:12px;">Dinner</button>
          </div>
        </div>
      </div>
    `;

    // Add back to matches list button listener
    const backBtn = resultDiv.querySelector('#btn-back-to-list');
    if (backBtn) {
      if (isAiGenerated) {
        backBtn.style.display = 'none'; // AI recipe stands alone
      } else {
        backBtn.addEventListener('click', () => {
          const profile = getProfile();
          const matches = matchLocalRecipes(selectedIngredients, profile);
          displayRecipeMatches(matches);
        });
      }
    }

    // Add to slot listeners
    const addSlotBtns = resultDiv.querySelectorAll('.btn-add-to-slot');
    addSlotBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slotName = e.target.dataset.slot;
        onAddRecipeToPlanner(slotName, {
          title: recipe.recipeName,
          desc: `Ingredients: ${recipe.ingredients.join(', ')}. Texture: ${recipe.texture}. ${recipe.instructions[0]}`
        });
        alert(`Successfully added "${recipe.recipeName}" to your daily ${slotName} slot!`);
      });
    });
  }

  // Initial render call
  render();
}
