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

// Import Firebase and Sync helpers
import { auth, googleProvider } from './firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { syncFromFirestore, saveProfileToFirestore, saveOnboardingStateToFirestore } from './utils/firebaseSync.js';

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
  const authOverlay = document.getElementById('auth-overlay');
  const btnGoogleSignin = document.getElementById('btn-google-signin');
  
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
  const btnSettingsLogout = document.getElementById('btn-settings-logout');
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

    // Sync profile to Firestore
    saveProfileToFirestore(updatedProfile);

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

  // Google Sign-In click listener
  if (btnGoogleSignin) {
    btnGoogleSignin.addEventListener('click', async () => {
      try {
        btnGoogleSignin.disabled = true;
        btnGoogleSignin.textContent = "Signing in...";
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Authentication failed:", error);
        alert("Sign-in failed. Please try again.");
        btnGoogleSignin.disabled = false;
        btnGoogleSignin.innerHTML = `
          <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        `;
      }
    });
  }

  // Logout button click listener
  if (btnSettingsLogout) {
    btnSettingsLogout.addEventListener('click', async () => {
      if (confirm("Are you sure you want to sign out?")) {
        settingsDialog.classList.remove('active');
        await signOut(auth);
      }
    });
  }

  // Auth State Lifecycle Listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log(`Authenticated as user: ${user.uid}`);
      
      // 1. Sync data from Firestore
      await syncFromFirestore();
      
      // 2. Hide Auth Screen
      if (authOverlay) authOverlay.classList.remove('active');

      // 3. Routing: Onboarding vs Dashboard
      const onboarded = localStorage.getItem('todfeed_onboarded') === 'true';
      if (!onboarded && onboardingOverlay) {
        onboardingOverlay.classList.add('active');
        initializeOnboarding(onboardingOverlay, async () => {
          // On onboarding complete, save profile/state to Firestore
          const profile = getActiveProfile();
          await saveProfileToFirestore(profile);
          await saveOnboardingStateToFirestore(true);

          onboardingOverlay.classList.remove('active');
          initializeHome();
          initializePlanner();
          initializeRecipeGenerator();
          initializeSafety();
          switchPanel('home');
        });
      } else {
        if (onboardingOverlay) onboardingOverlay.classList.remove('active');
        initializeHome();
        initializePlanner();
        initializeRecipeGenerator();
        initializeSafety();
        switchPanel('home');
      }
    } else {
      console.log("Unauthenticated state");
      
      // Reset Google Sign-In button state to allow logging back in
      if (btnGoogleSignin) {
        btnGoogleSignin.disabled = false;
        btnGoogleSignin.innerHTML = `
          <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        `;
      }
      
      // Clear LocalStorage except user's custom API key
      const tempApiKey = localStorage.getItem('gemini_api_key');
      localStorage.clear();
      if (tempApiKey) {
        localStorage.setItem('gemini_api_key', tempApiKey);
      }

      // Show Auth Screen
      if (authOverlay) authOverlay.classList.add('active');
    }
  });
});
