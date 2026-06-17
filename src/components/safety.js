/* Todfeed - Safety & Tips Component */

import { generateAiPairings } from '../utils/recipeEngine.js';
import { savePantryToFirestore } from '../utils/firebaseSync.js';

export function renderSafetyPanel(container) {
  let activeTab = "weaning"; // "weaning", "choking", "allergens"
  let checkerResult = null;
  let aiPairingsResult = null;

  // Curated database for the choking hazard checker
  const hazardDB = {
    "honey": {
      status: "red",
      title: "Extremely Unsafe (< 12 months)",
      desc: "Contains infant botulism risk. Botulism spores can grow in a baby's immature gut. Avoid completely until after the first birthday."
    },
    "grape": {
      status: "red",
      title: "High Choking Hazard (Cut in Quarters)",
      desc: "Whole grapes match the exact size of an infant airway. Never serve whole. Slice into quarters lengthwise (long thin strips) before feeding."
    },
    "grapes": {
      status: "red",
      title: "High Choking Hazard (Cut in Quarters)",
      desc: "Never serve whole. Slice into quarters lengthwise (long thin strips) before feeding."
    },
    "cherry tomato": {
      status: "red",
      title: "High Choking Hazard (Slice Lengthwise)",
      desc: "Round, slick skin makes them slide down the throat easily. Cut into quarters lengthwise."
    },
    "cherry tomatoes": {
      status: "red",
      title: "High Choking Hazard (Slice Lengthwise)",
      desc: "Cut into quarters lengthwise."
    },
    "apple": {
      status: "orange",
      title: "Raw Hard Apple (Steam or Grate)",
      desc: "Raw, hard apples can break into hard chunks. Cook, steam, or bake until completely soft, or grate finely before serving."
    },
    "carrot": {
      status: "orange",
      title: "Raw Carrot (Steam or Grate)",
      desc: "Hard raw carrots are dangerous choking hazards. Steam until completely mashable or grate finely."
    },
    "carrots": {
      status: "orange",
      title: "Raw Carrots (Steam or Grate)",
      desc: "Steam until mushy or grate finely."
    },
    "nut": {
      status: "red",
      title: "Whole Nuts (High Choking Hazard)",
      desc: "Never feed whole nuts or chunky nut butters. Dilute smooth nut butters with warm water, breastmilk, or puree to make a thin, safe paste."
    },
    "nuts": {
      status: "red",
      title: "Whole Nuts (High Choking Hazard)",
      desc: "Never feed whole nuts or chunky nut butters. Dilute smooth nut butters to a thin paste."
    },
    "peanut butter": {
      status: "orange",
      title: "Thick Sticky Paste (Dilute)",
      desc: "Thick, sticky dollops of peanut butter can get stuck in a baby's throat. Thin it out by mixing it into oats, purees, or warm water."
    },
    "blueberry": {
      status: "orange",
      title: "Firm Round Fruit (Smash)",
      desc: "Round, firm blueberries can block airways. Smash them flat between your fingers before offering."
    },
    "blueberries": {
      status: "orange",
      title: "Firm Round Fruits (Smash)",
      desc: "Smash them flat between your fingers before offering."
    },
    "cow's milk": {
      status: "orange",
      title: "Primary Drink Limitation (< 12 months)",
      desc: "Can strain immature kidneys and cause gut blood loss. A splash cooked into meals is fine, but do not give as a drinking replacement for breastmilk/formula."
    },
    "salt": {
      status: "orange",
      title: "Immature Kidneys Warning (< 12 months)",
      desc: "Babies require very little sodium. Do not add salt to home-prepared baby meals."
    },
    "sugar": {
      status: "orange",
      title: "Tooth Decay & Taste Preferences",
      desc: "Avoid added sugars. Encourages preference for sweet tastes and can damage emerging primary teeth."
    }
  };

  function render() {
    container.innerHTML = `
      <!-- Choking Hazard Checker Tool -->
      <div class="card" style="border-color: var(--md-sys-color-secondary);">
        <div class="card-title-row">
          <span class="material-symbols-rounded" style="color: var(--md-sys-color-secondary);">search_check</span>
          <h2>Quick Safety Ingredient Checker</h2>
        </div>
        <p style="font-size: 13px; color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px;">
          Type in any ingredient (e.g. "grape", "honey", "carrot") to check if it's safe and how to prepare it.
        </p>

        <div style="display:flex; gap: 8px; align-items:center;">
          <md-outlined-text-field
            id="input-hazard-search"
            label="Search ingredient..."
            style="flex: 1;">
          </md-outlined-text-field>
          <button id="btn-hazard-check" class="duo-btn duo-btn-primary" style="height: 54px; margin-bottom: 2px;" type="button">Check</button>
        </div>

        <div id="hazard-check-result" style="margin-top: 16px;">
          ${checkerResult ? `
            <div class="safety-grid-card">
              <div class="safety-icon-box ${checkerResult.status}">
                <span class="material-symbols-rounded">
                  ${checkerResult.status === 'red' ? 'report' : 'warning'}
                </span>
              </div>
              <div class="safety-info">
                <h3 style="color: ${checkerResult.status === 'red' ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)'}">
                  ${checkerResult.title}
                </h3>
                <p>${checkerResult.desc}</p>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- AI Pairing Suggestions Box -->
        <div id="ai-pairings-container" style="margin-top: 8px;"></div>
      </div>

      <!-- Tab Switcher for Educational Guides -->
      <div style="margin-top: 24px;">
        <md-tabs id="safety-guide-tabs">
          <md-primary-tab id="tab-weaning" ${activeTab === 'weaning' ? 'active' : ''}>Weaning Styles</md-primary-tab>
          <md-primary-tab id="tab-choking" ${activeTab === 'choking' ? 'active' : ''}>Gagging vs Choking</md-primary-tab>
          <md-primary-tab id="tab-allergens" ${activeTab === 'allergens' ? 'active' : ''}>Allergen Guide</md-primary-tab>
        </md-tabs>
      </div>

      <div id="safety-guide-content" style="margin-top: 20px;">
        ${renderActiveTabContent()}
      </div>
    `;

    setupEventListeners();
    renderPairingsArea();
  }

  function renderPairingsArea() {
    const pairingsContainer = container.querySelector('#ai-pairings-container');
    if (!pairingsContainer) return;

    if (!checkerResult) {
      pairingsContainer.innerHTML = '';
      return;
    }

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey && !aiPairingsResult) {
      pairingsContainer.innerHTML = `
        <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
          <button id="btn-get-ai-pairings" class="duo-btn duo-btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; height: 44px; font-size: 13px; font-weight: 700; border-color: var(--color-primary); color: var(--color-primary);">
            <span class="material-symbols-rounded" style="font-size: 18px;">auto_awesome</span>
            Suggest Food Pairings (Uses 1 daily credit)
          </button>
          <p style="font-size: 11px; color: var(--color-text-light); text-align: center; margin: 0;">
            Want unlimited suggestions? Enter your own Gemini API key in <a href="#" id="link-safety-settings" style="color: var(--color-primary); text-decoration: underline;">Settings</a>.
          </p>
        </div>
      `;

      const getPairingsBtn = pairingsContainer.querySelector('#btn-get-ai-pairings');
      if (getPairingsBtn) {
        getPairingsBtn.addEventListener('click', () => {
          const query = container.querySelector('#input-hazard-search').value.toLowerCase().trim();
          if (!query) return;

          aiPairingsResult = 'loading';
          renderPairingsArea();

          generateAiPairings(query)
            .then(result => {
              aiPairingsResult = result;
              renderPairingsArea();
            })
            .catch(err => {
              aiPairingsResult = { error: err.message };
              renderPairingsArea();
            });
        });
      }

      const settingsLink = pairingsContainer.querySelector('#link-safety-settings');
      if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
          e.preventDefault();
          const settingsBtn = document.querySelector('#btn-settings');
          if (settingsBtn) settingsBtn.click();
        });
      }
      return;
    }

    if (aiPairingsResult === 'loading') {
      pairingsContainer.innerHTML = `
        <div class="ai-pairings-loading" style="margin-top: 12px; padding: 16px; background: var(--color-bg); border: 2.5px solid var(--color-border); border-radius: 12px;">
          <md-linear-progress indeterminate style="width: 100%; height: 6px; border-radius: 3px;"></md-linear-progress>
          <p style="font-size: 12px; color: var(--color-primary-dark); font-weight: 700; margin-top: 8px; text-align: left;">
            🦖 Asking Dino's AI Kitchen for delicious food pairings...
          </p>
        </div>
      `;
      return;
    }

    if (aiPairingsResult && aiPairingsResult.error) {
      pairingsContainer.innerHTML = `
        <div style="color: var(--md-sys-color-error); font-size: 12px; margin-top: 12px; display: flex; align-items: center; gap: 6px; background: #fff1f1; border: 1.5px solid #ffcccc; padding: 10px; border-radius: 10px;">
          <span class="material-symbols-rounded" style="font-size: 16px;">error</span>
          <span style="text-align: left;">Failed to fetch pairings: ${aiPairingsResult.error}</span>
        </div>
      `;
      return;
    }

    if (aiPairingsResult && aiPairingsResult.pairings) {
      pairingsContainer.innerHTML = `
        <div class="card ai-pairings-result-card" style="border: 2px solid var(--color-primary-light); border-bottom-width: 6px; border-bottom-color: var(--color-primary-dark); background-color: var(--color-bg); margin-top: 12px; padding: 16px;">
          <h4 style="font-family: var(--font-heading); font-size: 14px; font-weight: 800; color: var(--color-primary-dark); display: flex; align-items: center; gap: 6px; margin: 0 0 12px 0; text-align: left;">
            <span class="material-symbols-rounded" style="font-size: 18px; color: var(--color-primary);">auto_awesome</span>
            Dino's Kitchen Matches: What goes with "${aiPairingsResult.ingredient}"?
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${aiPairingsResult.pairings.map(pair => {
              const currentPantry = JSON.parse(localStorage.getItem('todfeed_pantry') || '[]');
              const alreadyAdded = currentPantry.includes(pair.name);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1.5px solid var(--color-border); border-bottom: 3.5px solid var(--color-border-dark); padding: 10px 14px; border-radius: 12px; gap: 10px;">
                  <div style="flex: 1; text-align: left;">
                    <strong style="color: var(--color-text-dark); font-size: 13px;">${pair.name}</strong>
                    <p style="font-size: 12px; color: var(--color-text-light); margin: 2px 0 0 0; line-height: 1.3;">${pair.reason}</p>
                  </div>
                  <button class="duo-btn duo-btn-outline btn-add-pairing-to-pantry" data-ing="${pair.name}" style="height: 32px; padding: 0 10px; font-size: 11px; border-radius: 8px; flex-shrink: 0;" type="button" ${alreadyAdded ? 'disabled' : ''}>
                    ${alreadyAdded ? '✓ Added' : '+ Pantry'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
          ${aiPairingsResult.tips ? `
            <p style="font-size: 12px; color: var(--color-text-dark); line-height: 1.4; margin: 12px 0 0 0; font-style: italic; text-align: left;">
              <strong>Dino's Prep Tip:</strong> ${aiPairingsResult.tips}
            </p>
          ` : ''}
        </div>
      `;

      // Set up click handlers for adding to pantry
      const addBtns = pairingsContainer.querySelectorAll('.btn-add-pairing-to-pantry');
      addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ing = btn.dataset.ing;
          const currentPantry = JSON.parse(localStorage.getItem('todfeed_pantry') || '[]');
          if (!currentPantry.includes(ing)) {
            currentPantry.push(ing);
            localStorage.setItem('todfeed_pantry', JSON.stringify(currentPantry));
            savePantryToFirestore(currentPantry);
            
            // Disable button and change label
            btn.textContent = '✓ Added';
            btn.disabled = true;
          }
        });
      });
    }
  }

  function renderActiveTabContent() {
    if (activeTab === "weaning") {
      return `
        <div class="card">
          <h3 style="font-family: var(--font-heading); font-size:18px; font-weight:600; margin-bottom:12px; color: var(--md-sys-color-primary);">
            Baby-Led Weaning (BLW) vs Spoon Feeding
          </h3>
          <p style="font-size:14px; line-height:1.5; color: var(--md-sys-color-on-surface-variant); margin-bottom: 20px;">
            There are two primary styles of introducing solid foods. Many modern pediatricians recommend a hybrid model combining both.
          </p>

          <div class="grid-2">
            <div style="background-color: var(--md-sys-color-surface-container-low); padding: 16px; border-radius: var(--border-radius-sm); border: 1px solid var(--md-sys-color-outline-variant); text-align: left;">
              <h4 style="font-weight:700; margin-bottom: 8px;">Traditional Spoon Feeding</h4>
              <ul style="padding-left:16px; font-size:13px; line-height:1.6; color: var(--md-sys-color-on-surface-variant);">
                <li>Starts with smooth, single-ingredient purees (4-6 months).</li>
                <li>Allows easy tracking of how much a baby consumes.</li>
                <li>Less messy and quicker meals.</li>
                <li>Gradually transition to mashed and lumpy foods around 7-8 months.</li>
              </ul>
            </div>

            <div style="background-color: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); padding: 16px; border-radius: var(--border-radius-sm); border: 1px solid var(--md-sys-color-outline-variant); text-align: left;">
              <h4 style="font-weight:700; margin-bottom: 8px;">Baby-Led Weaning (BLW)</h4>
              <ul style="padding-left:16px; font-size:13px; line-height:1.6;">
                <li>Skips purees entirely; baby eats soft finger foods from start (6m+).</li>
                <li>Baby sits with family and feeds themselves with hands.</li>
                <li>Promotes fine motor skills (pincer grasp) and self-regulation.</li>
                <li>Messy, but helps babies recognize satiety cues early.</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === "choking") {
      return `
        <div class="card">
          <h3 style="font-family: var(--font-heading); font-size:18px; font-weight:600; margin-bottom:12px; color: var(--md-sys-color-error);">
            Understanding Gagging vs Choking
          </h3>
          <p style="font-size:14px; line-height:1.5; color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px;">
            Gagging is a normal, healthy safety reflex that babies use to push food forward when it gets too far back. Choking is an emergency where the airway is blocked.
          </p>

          <div class="safety-grid-card">
            <div class="safety-icon-box green">
              <span class="material-symbols-rounded">check_circle</span>
            </div>
            <div class="safety-info" style="text-align: left;">
              <h3>Gagging (Normal Reflex)</h3>
              <p><strong>Signs:</strong> Coughing, sputtering, watery eyes, retching noises, face turns slightly red. Baby is actively coughing to clear their throat.</p>
              <p style="margin-top: 6px; font-weight:600; color: var(--md-sys-color-secondary);">Action: Stay calm, watch, and let them cough it out. Do not stick your fingers in their mouth, which could push the food further back.</p>
            </div>
          </div>

          <div class="safety-grid-card">
            <div class="safety-icon-box red">
              <span class="material-symbols-rounded">cancel</span>
            </div>
            <div class="safety-info" style="text-align: left;">
              <h3>Choking (Emergency)</h3>
              <p><strong>Signs:</strong> Silent, unable to cry or cough, turns blue/purple, hands clutching throat, eyes wide with panic.</p>
              <p style="margin-top: 6px; font-weight:700; color: var(--md-sys-color-error);">Action: Act immediately. Call emergency services and perform infant back blows and chest thrusts if trained.</p>
            </div>
          </div>
        </div>
      `;
    } else {
      // Allergens
      return `
        <div class="card">
          <h3 style="font-family: var(--font-heading); font-size:18px; font-weight:600; margin-bottom:12px; color: var(--md-sys-color-primary);">
            Safely Introducing High-Risk Allergens
          </h3>
          <p style="font-size:14px; line-height:1.5; color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px;">
            Modern research shows that early allergen introduction (around 6 months) can significantly reduce the risk of food allergies.
          </p>

          <div class="safety-info" style="font-size:13px; line-height:1.6; color: var(--md-sys-color-on-surface-variant); text-align: left;">
            <h4 style="font-weight:700; margin-bottom: 6px; color: var(--md-sys-color-on-surface);">The Rule of Three Days:</h4>
            <ol style="padding-left:16px; margin-bottom: 16px;">
              <li>Introduce only **one** new allergen at a time (e.g. smooth peanut butter).</li>
              <li>Wait **3 full days** before introducing any other new foods.</li>
              <li>Monitor baby closely for reactions: hives, vomiting, swelling, diarrhea, or coughing.</li>
            </ol>

            <h4 style="font-weight:700; margin-bottom: 6px; color: var(--md-sys-color-on-surface);">Major Allergen Categories:</h4>
            <ul style="padding-left:16px;">
              <li><strong>Eggs:</strong> Start with fully cooked egg yolk scrambled or mashed.</li>
              <li><strong>Peanuts:</strong> Mix a teaspoon of smooth, creamy peanut butter into warm water or applesauce. Never feed whole nuts or sticky spoonfuls.</li>
              <li><strong>Dairy:</strong> Offer plain, whole-milk yogurt or soft pasteurized cheese. Avoid whole cow's milk as a beverage before 12 months.</li>
              <li><strong>Wheat:</strong> Soft wheat semolina porridge or wheat toast strips.</li>
            </ul>
          </div>
        </div>
      `;
    }
  }

  function setupEventListeners() {
    // Tab switching
    const tabs = container.querySelector('#safety-guide-tabs');
    if (tabs) {
      tabs.addEventListener('change', (e) => {
        const selectedIndex = tabs.activeTabIndex;
        if (selectedIndex === 0) activeTab = "weaning";
        else if (selectedIndex === 1) activeTab = "choking";
        else if (selectedIndex === 2) activeTab = "allergens";
        
        // Update content container only
        container.querySelector('#safety-guide-content').innerHTML = renderActiveTabContent();
      });
    }

    // Hazard search check action
    const searchBtn = container.querySelector('#btn-hazard-check');
    const searchInput = container.querySelector('#input-hazard-search');

    if (searchBtn && searchInput) {
      const handleCheck = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query === "") {
          checkerResult = null;
          aiPairingsResult = null;
          render();
          return;
        }

        // Try exact match or partial match in hazardDB
        let found = hazardDB[query];
        if (!found) {
          // Check for plural/singular variations or substrings
          const key = Object.keys(hazardDB).find(k => query.includes(k) || k.includes(query));
          if (key) {
            found = hazardDB[key];
          }
        }

        if (found) {
          checkerResult = found;
        } else {
          checkerResult = {
            status: "green",
            title: `${query.charAt(0).toUpperCase() + query.slice(1)} is generally safe`,
            desc: "This ingredient is not flagged as a primary high-risk choking hazard or allergen. Prepare to an age-appropriate texture (pureed or soft fingers) and enjoy!"
          };
        }
        
        // Reset pairings and trigger loading
        aiPairingsResult = null;
        render();

        const apiKey = localStorage.getItem('gemini_api_key');
        if (apiKey) {
          aiPairingsResult = 'loading';
          renderPairingsArea();

          generateAiPairings(query)
            .then(result => {
              aiPairingsResult = result;
              renderPairingsArea();
            })
            .catch(err => {
              aiPairingsResult = { error: err.message };
              renderPairingsArea();
            });
        }
      };

      searchBtn.addEventListener('click', handleCheck);
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === "Enter") handleCheck();
      });
    }
  }

  // Initial render
  render();
}
