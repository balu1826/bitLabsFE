
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';

const clearUserData = () => {
  try {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

const clearJWTToken = async () => {
  try {
    await axios.post(`${apiUrl}/applicant/applicantsignOut`);
    clearUserData();
  } catch (error) {
    console.error('Error logging out:', error);
    throw new Error('Logout failed');
  }
};

export default clearJWTToken;
