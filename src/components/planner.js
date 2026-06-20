/* Todfeed - Daily Planner Component */

import { escapeHtml } from '../utils/sanitize.js';

import { generateDailyMealSheet } from '../utils/recipeEngine.js';
import { triggerConfetti } from '../utils/confetti.js';
import { saveScheduleToFirestore } from '../utils/firebaseSync.js';

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
    saveScheduleToFirestore(scheduleState);
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
          <h2>${escapeHtml(profile.name)}'s Feed Sheet</h2>
          <p style="font-size: 13px; color: var(--color-primary-dark); font-weight: 700;">
            Daily feeding routine for age ${escapeHtml(profile.age)}m (${escapeHtml(profile.country.toUpperCase())})
          </p>
        </div>
        
        <button id="btn-reset-schedule" class="duo-btn duo-btn-outline" style="height: 38px; padding: 0 12px; font-size: 12px; border-radius: 12px;">
          Reset Routine
          <span class="material-symbols-rounded" style="font-size: 16px;">autorenew</span>
        </button>
      </div>

      <!-- Timeline Container -->
      <div class="timeline-container">
        ${scheduleState.map((slot, idx) => `
          <div class="timeline-item ${slot.completed ? 'completed' : ''}">
            <!-- Timeline Node Indicator -->
            <div class="timeline-dot">
              <span class="material-symbols-rounded">
                ${slot.isSolid ? 'restaurant' : 'child_care'}
              </span>
            </div>

            <!-- Card detailing the slot -->
            <div class="card meal-slot-card ${slot.completed ? 'completed' : ''}" data-idx="${idx}">
              <div class="meal-slot-header">
                <span class="meal-slot-time">${escapeHtml(slot.time)}</span>
                <span class="meal-slot-label">${escapeHtml(slot.mealType)}</span>
              </div>

              <div>
                <h3 class="meal-slot-title">${escapeHtml(slot.title)}</h3>
                <p class="meal-slot-desc">${escapeHtml(slot.desc)}</p>
              </div>

              <div class="meal-slot-actions">
                <!-- Playful Button to Toggle Eaten Status -->
                <button class="duo-btn duo-btn-outline btn-toggle-eaten ${slot.completed ? 'eaten' : ''}" data-idx="${idx}" type="button">
                  ${slot.completed ? '✓ Eaten' : 'Mark Eaten'}
                </button>

                <!-- Reaction logs for solids (Disabled until Eaten is Checked) -->
                ${slot.isSolid ? `
                  <div class="rating-container ${slot.completed ? '' : 'disabled'}">
                    <span class="rating-label">Reaction:</span>
                    <div class="rating-buttons">
                      <button class="rating-btn ${slot.reaction === 'disliked' ? 'active' : ''}" 
                              data-reaction="disliked" data-idx="${idx}" title="Rejected/Spit Out" type="button">
                        😠
                      </button>
                      <button class="rating-btn ${slot.reaction === 'some' ? 'active' : ''}" 
                              data-reaction="some" data-idx="${idx}" title="Ate Some" type="button">
                        😐
                      </button>
                      <button class="rating-btn ${slot.reaction === 'loved' ? 'active' : ''}" 
                              data-reaction="loved" data-idx="${idx}" title="Eaten All/Loved" type="button">
                        😊
                      </button>
                    </div>
                  </div>
                ` : ''}
              </div>
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

    // Toggle eaten status button triggers
    const toggleEatenBtns = container.querySelectorAll('.btn-toggle-eaten');
    toggleEatenBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const wasCompleted = scheduleState[idx].completed;
        scheduleState[idx].completed = !scheduleState[idx].completed;
        
        // Reset reaction if marked not eaten
        if (!scheduleState[idx].completed) {
          scheduleState[idx].reaction = null;
        } else if (!wasCompleted) {
          // Trigger confetti burst from button center
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          triggerConfetti(centerX, centerY, { particleCount: 50 });
        }

        saveScheduleState();
        render(); // Re-render to update classes, icons, and disabled states
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
          // Trigger emoji confetti on loved rating!
          if (reactionType === 'loved') {
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            triggerConfetti(centerX, centerY, { particleCount: 25 });
          }
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

  // Expose renderer for dashboard sync
  window.refreshPlannerState = render;

  // Initial render
  render();
}
