/* Todfeed - Main Application Shell Coordinator */

// Import Styles for Bundler Hot Module Replacement
import './theme.css';

// Import Material Design 3 Web Components
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/input-chip.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/dialog/dialog.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/fab/fab.js';
import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';

// Import Modular Panel Renderers
import { initializeOnboarding } from './components/onboarding.js';
import { renderHomePanel } from './components/home.js';
import { renderProfilePanel } from './components/profile.js';
import { renderGeneratorPanel } from './components/generator.js';
import { renderPlannerPanel } from './components/planner.js';
import { renderSafetyPanel } from './components/safety.js';

// Global Profile Getter
function getActiveProfile() {
  const stored = localStorage.getItem('todfeed_profile');
  return stored ? JSON.parse(stored) : {
    name: "My Baby",
    age: 6,
    country: "us",
    diet: [],
    allergies: []
  };
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  const onboardingOverlay = document.getElementById('onboarding-overlay');
  const panelHome = document.getElementById('panel-home');
  const panelProfile = document.getElementById('panel-profile');
  const panelRecipe = document.getElementById('panel-recipe');
  const panelPlanner = document.getElementById('panel-planner');
  const panelSafety = document.getElementById('panel-safety');
  
  const bottomNav = document.getElementById('bottom-nav');
  const btnSettings = document.getElementById('btn-settings');
  const settingsDialog = document.getElementById('settings-dialog');
  const btnSettingsCancel = document.getElementById('btn-settings-cancel');
  const btnSettingsSave = document.getElementById('btn-settings-save');
  const btnSettingsReset = document.getElementById('btn-settings-reset');
  const inputApiKey = document.getElementById('input-api-key');

  // Reset App / Onboarding trigger
  if (btnSettingsReset) {
    btnSettingsReset.addEventListener('click', () => {
      if (confirm("Are you sure you want to reset all baby preferences, profile details, and meal timeline history? This will restart the onboarding wizard. Your Gemini API key will be kept.")) {
        localStorage.removeItem('todfeed_onboarded');
        localStorage.removeItem('todfeed_profile');
        localStorage.removeItem('todfeed_pantry');
        
        // Clear all baby schedules
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith('todfeed_schedule_')) {
            localStorage.removeItem(key);
          }
        }
        
        location.reload();
      }
    });
  }

  // Load existing API key to display in settings
  const existingApiKey = localStorage.getItem('gemini_api_key');
  if (existingApiKey) {
    inputApiKey.value = existingApiKey;
  }

  // Settings trigger
  btnSettings.addEventListener('click', () => {
    settingsDialog.classList.add('active');
  });

  btnSettingsCancel.addEventListener('click', () => {
    settingsDialog.classList.remove('active');
  });

  btnSettingsSave.addEventListener('click', () => {
    const key = inputApiKey.value.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    settingsDialog.classList.remove('active');
  });

  // Close settings dialog when clicking the blurred background overlay
  settingsDialog.addEventListener('click', (e) => {
    if (e.target === settingsDialog) {
      settingsDialog.classList.remove('active');
    }
  });

  // Re-render panels on profile update
  const handleProfileUpdated = (updatedProfile) => {
    // Regenerate home, planner and recipe views with new age settings
    initializeHome();
    initializePlanner();
    initializeRecipeGenerator();
  };

  // Helper to init specific panels
  const initializeHome = () => {
    renderHomePanel(panelHome, getActiveProfile, switchPanel);
  };

  const initializeProfile = () => {
    renderProfilePanel(panelProfile, handleProfileUpdated);
  };

  const initializeRecipeGenerator = () => {
    renderGeneratorPanel(panelRecipe, getActiveProfile, (slotName, recipeDetails) => {
      // Add recipe to planner slot
      if (window.addRecipeToSlot) {
        window.addRecipeToSlot(slotName, recipeDetails);
      }
      // Switch view to planner panel
      switchPanel('planner');
    });
  };

  const initializePlanner = () => {
    renderPlannerPanel(panelPlanner, getActiveProfile);
  };

  const initializeSafety = () => {
    renderSafetyPanel(panelSafety);
  };

  // Panel switching coordinator
  const switchPanel = (panelValue) => {
    const panels = {
      'home': panelHome,
      'profile': panelProfile,
      'recipe': panelRecipe,
      'planner': panelPlanner,
      'safety': panelSafety
    };

    // Deactivate all panels
    Object.values(panels).forEach(p => p.classList.remove('active'));
    
    // Activate target panel
    if (panels[panelValue]) {
      panels[panelValue].classList.add('active');
    }

    // Update bottom nav active tab matching
    const tabs = bottomNav.querySelectorAll('md-navigation-tab');
    tabs.forEach((tab, index) => {
      if (tab.getAttribute('value') === panelValue) {
        bottomNav.activeIndex = index;
      }
    });

    // Lazy load panels on entry
    if (panelValue === 'home') initializeHome();
    else if (panelValue === 'profile') initializeProfile();
    else if (panelValue === 'recipe') initializeRecipeGenerator();
    else if (panelValue === 'planner') initializePlanner();
    else if (panelValue === 'safety') initializeSafety();
  };

  // Bottom Navigation Change listener
  bottomNav.addEventListener('navigation-bar-activated', (e) => {
    const activeIndex = e.detail.activeIndex;
    const tabs = bottomNav.querySelectorAll('md-navigation-tab');
    const selectedValue = tabs[activeIndex].getAttribute('value');
    switchPanel(selectedValue);
  });

  // Onboarding Logic Gate
  const onboarded = localStorage.getItem('todfeed_onboarded') === 'true';
  if (!onboarded && onboardingOverlay) {
    onboardingOverlay.classList.add('active');
    initializeOnboarding(onboardingOverlay, () => {
      onboardingOverlay.classList.remove('active');
      // Re-initialize views with the newly set profile
      initializeHome();
      initializeProfile();
      initializePlanner();
      initializeRecipeGenerator();
      initializeSafety();
      switchPanel('home');
    });
  } else {
    if (onboardingOverlay) onboardingOverlay.classList.remove('active');
    switchPanel('home');
  }
});
