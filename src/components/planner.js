/* Todfeed - Daily Planner Component */

import { generateDailyMealSheet } from '../utils/recipeEngine.js';

export function renderPlannerPanel(container, getProfile) {
  let scheduleState = [];

  function loadScheduleState() {
    const profile = getProfile();
    const storageKey = `todfeed_schedule_${profile.name.replace(/\s+/g, '_')}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      scheduleState = JSON.parse(stored);
    } else {
      // Generate standard base routine
      const baseSchedule = generateDailyMealSheet(profile);
      scheduleState = baseSchedule.map(slot => ({
        ...slot,
        completed: false,
        reaction: null // 'disliked', 'some', 'loved'
      }));
      saveScheduleState();
    }
  }

  function saveScheduleState() {
    const profile = getProfile();
    const storageKey = `todfeed_schedule_${profile.name.replace(/\s+/g, '_')}`;
    localStorage.setItem(storageKey, JSON.stringify(scheduleState));
  }

  // Exposed interface to add generated recipes
  window.addRecipeToSlot = function(slotName, recipeDetails) {
    const profile = getProfile();
    loadScheduleState();

    // Find closest slot by mealType name matching (e.g. Breakfast, Lunch, Dinner)
    const idx = scheduleState.findIndex(slot => 
      slot.mealType.toLowerCase().includes(slotName.toLowerCase())
    );

    if (idx !== -1) {
      scheduleState[idx].title = recipeDetails.title;
      scheduleState[idx].desc = recipeDetails.desc;
      scheduleState[idx].isSolid = true;
      scheduleState[idx].completed = false;
      scheduleState[idx].reaction = null;
      saveScheduleState();
    }
  };

  function render() {
    const profile = getProfile();
    loadScheduleState();

    container.innerHTML = `
      <div class="planner-header-actions">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight:700;">
            ${profile.name}'s Feed Sheet
          </h2>
          <p style="font-size: 13px; color: var(--md-sys-color-secondary); font-weight: 500;">
            Daily meal schedule for age ${profile.age}m (${profile.country.toUpperCase()})
          </p>
        </div>
        
        <button id="btn-reset-schedule" class="duo-btn duo-btn-outline" style="height: 38px; padding: 0 12px; font-size: 12px; border-radius: 12px;">
          Reset Routine
          <span class="material-symbols-rounded" style="font-size: 16px;">autorenew</span>
        </button>
      </div>

      <div class="schedule-slots-container">
        ${scheduleState.map((slot, idx) => `
          <div class="card meal-slot-card ${slot.completed ? 'completed' : ''}" data-idx="${idx}">
            <div class="meal-slot-header">
              <span class="meal-slot-time">${slot.time}</span>
              <span style="font-size: 12px; font-weight:600; text-transform: uppercase; color: var(--md-sys-color-secondary); letter-spacing:0.5px;">
                ${slot.mealType}
              </span>
            </div>

            <div>
              <h3 class="meal-slot-title">${slot.title}</h3>
              <p class="meal-slot-desc">${slot.desc}</p>
            </div>

            <div class="meal-slot-actions">
              <!-- Checkbox to mark eaten status -->
              <div class="flex-row-gap">
                <md-checkbox 
                  id="chk-slot-${idx}" 
                  class="chk-meal-completed" 
                  data-idx="${idx}"
                  ${slot.completed ? 'checked' : ''}>
                </md-checkbox>
                <label for="chk-slot-${idx}" style="font-size: 13px; font-weight: 600; cursor: pointer; color: var(--md-sys-color-on-surface);">
                  Mark Eaten
                </label>
              </div>

              <!-- Reaction logs for solids -->
              ${slot.isSolid ? `
                <div class="rating-container">
                  <span class="rating-label">Reaction:</span>
                  <div class="rating-buttons">
                    <button class="rating-btn ${slot.reaction === 'disliked' ? 'active' : ''}" 
                            data-reaction="disliked" data-idx="${idx}" title="Rejected/Spit Out">
                      😠
                    </button>
                    <button class="rating-btn ${slot.reaction === 'some' ? 'active' : ''}" 
                            data-reaction="some" data-idx="${idx}" title="Ate Some">
                      😐
                    </button>
                    <button class="rating-btn ${slot.reaction === 'loved' ? 'active' : ''}" 
                            data-reaction="loved" data-idx="${idx}" title="Eaten All/Loved">
                      😊
                    </button>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- PDF Download Floating Action Button -->
      <div class="fab-container">
        <md-fab id="fab-print" label="Print Sheet" variant="primary">
          <span slot="icon" class="material-symbols-rounded">print</span>
        </md-fab>
      </div>
    `;

    setupEventListeners();
  }

  function setupEventListeners() {
    // Reset schedule button
    const resetBtn = container.querySelector('#btn-reset-schedule');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset today's feeding schedule to default recommendations? This will clear custom recipe overrides and eaten ratings.")) {
          const profile = getProfile();
          const storageKey = `todfeed_schedule_${profile.name.replace(/\s+/g, '_')}`;
          localStorage.removeItem(storageKey);
          render();
        }
      });
    }

    // Checkbox eaten triggers
    const checkBoxes = container.querySelectorAll('.chk-meal-completed');
    checkBoxes.forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        scheduleState[idx].completed = e.target.checked;
        
        // Add visual transition class
        const card = container.querySelector(`.meal-slot-card[data-idx="${idx}"]`);
        if (e.target.checked) {
          card.classList.add('completed');
        } else {
          card.classList.remove('completed');
        }

        saveScheduleState();
      });
    });

    // Rating reactions triggers
    const ratingBtns = container.querySelectorAll('.rating-btn');
    ratingBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.idx, 10);
        const reactionType = btn.dataset.reaction;

        // Toggle active status
        if (scheduleState[idx].reaction === reactionType) {
          scheduleState[idx].reaction = null;
        } else {
          scheduleState[idx].reaction = reactionType;
        }

        saveScheduleState();
        render(); // Re-render to update selected states
      });
    });

    // Print button print call
    const printFab = container.querySelector('#fab-print');
    if (printFab) {
      printFab.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // Initial render
  render();
}
