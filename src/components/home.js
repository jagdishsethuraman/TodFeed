/* Todfeed - Home Dashboard Component */

import { escapeHtml } from '../utils/sanitize.js';

import { generateDailyMealSheet } from '../utils/recipeEngine.js';
import { triggerConfetti } from '../utils/confetti.js';
import { saveScheduleToFirestore } from '../utils/firebaseSync.js';

export function renderHomePanel(container, getProfile, switchPanel) {
  let schedule = [];

  function loadSchedule() {
    const profile = getProfile();
    const storageKey = `todfeed_schedule_${profile.name.replace(/\s+/g, '_')}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      schedule = JSON.parse(stored);
    } else {
      const baseSchedule = generateDailyMealSheet(profile);
      schedule = baseSchedule.map(slot => ({
        ...slot,
        completed: false,
        reaction: null
      }));
      localStorage.setItem(storageKey, JSON.stringify(schedule));
      saveScheduleToFirestore(schedule);
    }
  }

  function saveSchedule() {
    const profile = getProfile();
    const storageKey = `todfeed_schedule_${profile.name.replace(/\s+/g, '_')}`;
    localStorage.setItem(storageKey, JSON.stringify(schedule));
    saveScheduleToFirestore(schedule);
  }

  function render() {
    const profile = getProfile();
    loadSchedule();

    const totalMeals = schedule.length;
    const completedMeals = schedule.filter(s => s.completed).length;
    const progressPercent = totalMeals ? Math.round((completedMeals / totalMeals) * 100) : 0;

    const babyAge = parseInt(profile.age, 10) || 6;
    let ageGroup = 'active';
    if (babyAge >= 4 && babyAge <= 6) {
      ageGroup = 'baby';
    } else if (babyAge >= 7 && babyAge <= 9) {
      ageGroup = 'crawler';
    } else if (babyAge >= 10 && babyAge <= 12) {
      ageGroup = 'active';
    } else {
      ageGroup = 'toddler';
    }

    // Get the first uncompleted meal
    const upcomingMealIndex = schedule.findIndex(s => !s.completed);
    const upcomingMeal = upcomingMealIndex !== -1 ? schedule[upcomingMealIndex] : null;

    container.innerHTML = `
      <!-- Welcome Header Card -->
      <div class="card welcome-card">
        <div class="welcome-card-content">
          <div class="welcome-text-slot">
            <h2>Hi, ${escapeHtml(profile.parentName || 'Caregiver')}! 👋</h2>
            <p class="welcome-message">
              Ready to feed <strong>${escapeHtml(profile.name)}</strong> today? Let's track their meal milestones and keep feeding stress-free!
            </p>
            <div class="baby-badge-row">
              <span class="baby-badge">🦖 ${escapeHtml(profile.age)} Months Old</span>
              <span class="baby-badge">${profile.diet.length > 0 ? escapeHtml(profile.diet.join(', ')) : 'Standard Diet'}</span>
            </div>
          </div>
          <div class="welcome-mascot-slot mascot-container age-${ageGroup}">
            <img src="/todfeed_mascot.png" class="welcome-mascot-img" alt="Winking Dino Mascot" />
          </div>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Daily Progress Card -->
        <div class="card stat-card">
          <div class="stat-header">
            <span class="material-symbols-rounded stat-icon-progress">donut_large</span>
            <h3>Daily Progress</h3>
          </div>
          <div class="stat-progress-summary">
            <span class="stat-main-number">${completedMeals} / ${totalMeals}</span>
            <span class="stat-subtext">Meals completed today</span>
          </div>
          <div class="duo-progress-bar">
            <div class="duo-progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
          <span class="progress-percent-label">${progressPercent}% Completed</span>
        </div>

        <!-- Baby Profile Summary Card -->
        <div class="card stat-card" id="link-to-profile-stat">
          <div class="stat-header">
            <span class="material-symbols-rounded stat-icon-profile">child_care</span>
            <h3>Diet & Allergies</h3>
          </div>
          <div class="profile-summary-details">
            <p><strong>Diet Limits:</strong> ${profile.diet.length > 0 ? escapeHtml(profile.diet.join(', ')) : 'None'}</p>
            <p><strong>Allergen Filters:</strong> ${profile.allergies.length > 0 ? escapeHtml(profile.allergies.join(', ')) : 'None'}</p>
          </div>
          <span class="stat-action-link">Edit Profile <span class="material-symbols-rounded">arrow_forward</span></span>
        </div>
      </div>

      <!-- Upcoming Meal Card Section -->
      <div class="upcoming-section-title">
        <h3>Today's Next Step</h3>
      </div>

      ${upcomingMeal ? `
        <div class="card upcoming-meal-card">
          <div class="upcoming-badge">
            <span class="material-symbols-rounded" style="font-size: 14px;">schedule</span>
            Upcoming • ${escapeHtml(upcomingMeal.time)}
          </div>
          <div class="upcoming-meal-body">
            <div class="upcoming-meal-info">
              <span class="upcoming-meal-type">${escapeHtml(upcomingMeal.mealType)}</span>
              <h4 class="upcoming-meal-title">${escapeHtml(upcomingMeal.title)}</h4>
              <p class="upcoming-meal-desc">${escapeHtml(upcomingMeal.desc)}</p>
            </div>
            <div class="upcoming-meal-action">
              <button class="duo-btn duo-btn-primary btn-dashboard-mark-eaten" data-idx="${upcomingMealIndex}" type="button">
                Mark Eaten
              </button>
            </div>
          </div>
        </div>
      ` : `
        <div class="card upcoming-meal-card completed-all">
          <span class="material-symbols-rounded completed-all-icon">task_alt</span>
          <h4>All Meals Completed!</h4>
          <p>You have tracked all scheduled meals and bottles for today. Great job! 🎉</p>
        </div>
      `}

      <!-- Quick Actions Grid -->
      <div class="quick-actions-section">
        <h3>Quick Actions</h3>
        <div class="quick-actions-grid">
          <div class="card quick-action-card" id="action-go-recipe">
            <span class="material-symbols-rounded action-icon icon-recipe">auto_awesome</span>
            <h4>AI Prep</h4>
            <p>Generate matching recipes</p>
          </div>

          <div class="card quick-action-card" id="action-go-planner">
            <span class="material-symbols-rounded action-icon icon-planner">restaurant_menu</span>
            <h4>Daily Sheet</h4>
            <p>View routine timeline</p>
          </div>

          <div class="card quick-action-card" id="action-go-safety">
            <span class="material-symbols-rounded action-icon icon-safety">health_and_safety</span>
            <h4>Safety Check</h4>
            <p>Browse weaning safety</p>
          </div>
        </div>
      </div>
    `;

    setupEventListeners();
  }

  function setupEventListeners() {
    // Quick link to profile stat card
    const profileStatLink = container.querySelector('#link-to-profile-stat');
    if (profileStatLink) {
      profileStatLink.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('todfeed:open-settings', { detail: { tab: 'profile' } }));
      });
    }

    // Quick Action button listeners
    const actionRecipe = container.querySelector('#action-go-recipe');
    if (actionRecipe) {
      actionRecipe.addEventListener('click', () => {
        switchPanel('recipe');
      });
    }

    const actionPlanner = container.querySelector('#action-go-planner');
    if (actionPlanner) {
      actionPlanner.addEventListener('click', () => {
        switchPanel('planner');
      });
    }

    const actionSafety = container.querySelector('#action-go-safety');
    if (actionSafety) {
      actionSafety.addEventListener('click', () => {
        switchPanel('safety');
      });
    }

    // Mark Eaten button on Dashboard
    const markEatenBtn = container.querySelector('.btn-dashboard-mark-eaten');
    if (markEatenBtn) {
      markEatenBtn.addEventListener('click', () => {
        const idx = parseInt(markEatenBtn.dataset.idx, 10);
        schedule[idx].completed = true;
        saveSchedule();
        
        // Trigger confetti burst from button center
        const rect = markEatenBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        triggerConfetti(centerX, centerY, { particleCount: 60 });

        render(); // Re-render in place
        
        // Notify other panels to refresh state if they are loaded
        document.dispatchEvent(new CustomEvent('todfeed:refresh-planner'));
      });
    }

    // Interactive Mascot click easter egg
    const mascotImg = container.querySelector('.welcome-mascot-img');
    if (mascotImg) {
      mascotImg.addEventListener('click', () => {
        if (mascotImg.classList.contains('jump-animation')) return;
        mascotImg.classList.add('jump-animation');
        
        const rect = mascotImg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        triggerConfetti(centerX, centerY, { particleCount: 20 });

        setTimeout(() => {
          mascotImg.classList.remove('jump-animation');
        }, 600);
      });
    }
  }

  // Initial render
  render();
}
