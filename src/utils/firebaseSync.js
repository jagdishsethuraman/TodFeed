import { db, auth } from '../firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Helper to get active profile name for schedule storage key
function getProfileKey(profile) {
  const name = profile && profile.name ? profile.name : 'My_Baby';
  return `todfeed_schedule_${name.replace(/\s+/g, '_')}`;
}

// Save the profile to Firestore
export async function saveProfileToFirestore(profile) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { profile }, { merge: true });
  } catch (error) {
    console.error('Error saving profile to Firestore:', error);
  }
}

// Save pantry items to Firestore
export async function savePantryToFirestore(pantry) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { pantry }, { merge: true });
  } catch (error) {
    console.error('Error saving pantry to Firestore:', error);
  }
}

// Save onboarding state to Firestore
export async function saveOnboardingStateToFirestore(onboarded) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { onboarded }, { merge: true });
  } catch (error) {
    console.error('Error saving onboarding state to Firestore:', error);
  }
}

// Save daily sheet/schedule to Firestore
export async function saveScheduleToFirestore(schedule) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { schedule }, { merge: true });
  } catch (error) {
    console.error('Error saving schedule to Firestore:', error);
  }
}

// Sync all data from Firestore to local storage when user logs in
export async function syncFromFirestore() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // 1. Sync Profile
      if (userData.profile) {
        localStorage.setItem('todfeed_profile', JSON.stringify(userData.profile));
      }
      
      // 2. Sync Pantry
      if (userData.pantry) {
        localStorage.setItem('todfeed_pantry', JSON.stringify(userData.pantry));
      } else {
        localStorage.removeItem('todfeed_pantry');
      }

      // 3. Sync Onboarded flag
      if (userData.onboarded !== undefined) {
        localStorage.setItem('todfeed_onboarded', userData.onboarded ? 'true' : 'false');
      }

      // 4. Sync Schedule
      // Clear any legacy local schedule keys first
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('todfeed_schedule_')) {
          localStorage.removeItem(key);
        }
      }
      if (userData.schedule && userData.profile) {
        const scheduleKey = getProfileKey(userData.profile);
        localStorage.setItem(scheduleKey, JSON.stringify(userData.schedule));
      }
    } else {
      // If user document does not exist in Firestore, upload current LocalStorage values
      const localProfileStr = localStorage.getItem('todfeed_profile');
      const localPantryStr = localStorage.getItem('todfeed_pantry');
      const localOnboarded = localStorage.getItem('todfeed_onboarded') === 'true';
      
      let localSchedule = null;
      let profile = null;
      if (localProfileStr) {
        profile = JSON.parse(localProfileStr);
        const scheduleKey = getProfileKey(profile);
        const localScheduleStr = localStorage.getItem(scheduleKey);
        if (localScheduleStr) {
          localSchedule = JSON.parse(localScheduleStr);
        }
      }

      const initialData = {};
      if (profile) initialData.profile = profile;
      if (localPantryStr) initialData.pantry = JSON.parse(localPantryStr);
      initialData.onboarded = localOnboarded;
      if (localSchedule) initialData.schedule = localSchedule;

      await setDoc(userRef, initialData);
    }
  } catch (error) {
    console.error('Error syncing from Firestore:', error);
  }
}
