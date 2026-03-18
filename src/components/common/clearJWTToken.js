
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';

const clearUserData = () => {
  try {
    console.log('🔍 clearUserData called');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    console.log('✅ Removed: jwtToken, user, userType');
    
    // Clear all streak-related localStorage keys
    const keys = Object.keys(localStorage);
    const streakKeys = keys.filter(key => key.startsWith('streak_modal_shown_') || key.startsWith('streak_backup_'));
    console.log('🔍 Found streak keys to clear:', streakKeys.length > 0 ? streakKeys : 'None');
    
    streakKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`  ✅ Removed: ${key}`);
    });
    
    console.log('🔍 Clearing sessionStorage...');
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
  }
};

const clearJWTToken = async () => {
  try {
    console.log('🔍 clearJWTToken called - Starting logout process...');
    console.log('📦 About to call clearUserData...');
    
    await axios.post(`${apiUrl}/applicant/applicantsignOut`);
    console.log('✅ API logout successful');
    
    clearUserData();
    console.log('✅ clearUserData executed - All storage cleared');
    console.log('📋 sessionStorage after clear:', sessionStorage.length === 0 ? 'EMPTY ✓' : 'NOT EMPTY ❌');
    console.log('📋 localStorage streak keys remaining:', Object.keys(localStorage).filter(k => k.startsWith('streak')).length);
  } catch (error) {
    console.error('❌ Error logging out:', error);
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
