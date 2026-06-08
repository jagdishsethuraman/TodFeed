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
  
  // Tab panels
  const panelHome = document.getElementById('panel-home');
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

  // Settings Tab Switching
  const settingsTabBtns = settingsDialog.querySelectorAll('.settings-tab-btn');
  const settingsTabContents = settingsDialog.querySelectorAll('.settings-tab-content');

  function switchSettingsTab(tabName) {
    settingsTabBtns.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
        btn.style.color = 'var(--color-primary)';
        btn.style.fontWeight = '800';
        btn.style.borderBottom = '3px solid var(--color-primary)';
      } else {
        btn.classList.remove('active');
        btn.style.color = 'var(--color-text-light)';
        btn.style.fontWeight = '700';
        btn.style.borderBottom = 'none';
      }
    });

    settingsTabContents.forEach(content => {
      if (content.id === `settings-tab-${tabName}`) {
        content.style.display = 'flex';
      } else {
        content.style.display = 'none';
      }
    });
  }

  settingsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSettingsTab(btn.dataset.tab);
    });
  });

  // Expose global openSettings method for other panels to use
  window.openSettings = function(tabName = 'profile') {
    btnSettings.click();
    switchSettingsTab(tabName);
  };

  // Settings trigger (Open modal and load values)
  btnSettings.addEventListener('click', () => {
    settingsDialog.classList.add('active');
    switchSettingsTab('profile'); // Default to profile tab on open
    
    // Load current profile state into fields
    const profile = getActiveProfile();
    document.getElementById('settings-baby-name').value = profile.name || "";
    document.getElementById('settings-baby-age').value = profile.age || 6;
    document.getElementById('settings-parent-name').value = profile.parentName || "";
    document.getElementById('settings-parent-role').value = profile.parentRole || "Mom";
    document.getElementById('settings-baby-country').value = profile.country || "us";
    
    // Select diet chips
    document.getElementById('settings-diet-veg').selected = profile.diet.includes('vegetarian');
    document.getElementById('settings-diet-vegan').selected = profile.diet.includes('vegan');
    document.getElementById('settings-diet-df').selected = profile.diet.includes('dairy-free');
    document.getElementById('settings-diet-gf').selected = profile.diet.includes('gluten-free');
    
    // Select allergy chips
    const allergyChips = settingsDialog.querySelectorAll('.settings-allergy-chip');
    allergyChips.forEach(chip => {
      chip.selected = profile.allergies.includes(chip.dataset.allergy);
    });
    
    // Load API Key
    const key = localStorage.getItem('gemini_api_key') || "";
    inputApiKey.value = key;
  });

  btnSettingsCancel.addEventListener('click', () => {
    settingsDialog.classList.remove('active');
  });

  btnSettingsSave.addEventListener('click', () => {
    // Validate inputs
    const babyNameVal = document.getElementById('settings-baby-name').value.trim();
    const babyAgeVal = parseInt(document.getElementById('settings-baby-age').value, 10) || 6;
    const parentNameVal = document.getElementById('settings-parent-name').value.trim();
    const parentRoleVal = document.getElementById('settings-parent-role').value || "Mom";
    const countryVal = document.getElementById('settings-baby-country').value || "us";

    if (!babyNameVal || !parentNameVal) {
      alert("Please fill in both Baby's Name and Your Name.");
      return;
    }

    // Read selected diets
    const diet = [];
    if (document.getElementById('settings-diet-veg').selected) diet.push('vegetarian');
    if (document.getElementById('settings-diet-vegan').selected) diet.push('vegan');
    if (document.getElementById('settings-diet-df').selected) diet.push('dairy-free');
    if (document.getElementById('settings-diet-gf').selected) diet.push('gluten-free');

    // Read selected allergies
    const allergies = [];
    const allergyChips = settingsDialog.querySelectorAll('.settings-allergy-chip');
    allergyChips.forEach(chip => {
      if (chip.selected) {
        allergies.push(chip.dataset.allergy);
      }
    });

    // Save profile state
    const updatedProfile = {
      name: babyNameVal,
      age: babyAgeVal,
      country: countryVal,
      diet,
      allergies,
      parentName: parentNameVal,
      parentRole: parentRoleVal
    };
    localStorage.setItem('todfeed_profile', JSON.stringify(updatedProfile));

    // Save API key
    const key = inputApiKey.value.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }

    settingsDialog.classList.remove('active');

    // Call update handler to refresh other active views
    handleProfileUpdated(updatedProfile);
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
