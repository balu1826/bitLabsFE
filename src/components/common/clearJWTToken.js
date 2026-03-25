
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';

const clearUserData = () => {
  try {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    sessionStorage.clear();
      const keys = Object.keys(localStorage);
    const streakKeys = keys.filter(key => key.startsWith('streak_modal_shown_') || key.startsWith('streak_backup_'));
    console.log('🔍 Found streak keys to clear:', streakKeys.length > 0 ? streakKeys : 'None');

    streakKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`  ✅ Removed: ${key}`);
    });
  } catch (error) {
    console.error('❌ Error clearing user data:', error);  }
};

const clearJWTToken = async () => {
  try {
    await axios.post(`${apiUrl}/applicant/applicantsignOut`);
    clearUserData();
  } catch (error) {
    console.error('Error logging out:', error);
     // Still clear user data even if API fails
    try {
      clearUserData();
      console.log('✅ clearUserData executed despite API error');
    } catch (clearError) {
      console.error('❌ Error in clearUserData:', clearError);
    }
    throw new Error('Logout failed');
  }
};

export default clearJWTToken;
