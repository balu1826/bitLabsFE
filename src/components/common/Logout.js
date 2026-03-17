import React, { useEffect } from 'react';
import clearJWTToken from './clearJWTToken';

const Logout = ({ onLogout }) => {
  useEffect(() => {
    const logoutUser = async () => {
      try {
        await clearJWTToken();
        onLogout();
      } catch (error) {
        console.error('Logout failed', error);
      }
    };
    logoutUser();
  }, [onLogout]);

  return <div>Logging out...</div>;
};

export default Logout;