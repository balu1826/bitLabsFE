import React, { useState,useEffect } from 'react';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { Link } from 'react-router-dom';
import BackButton from '../common/BackButton';
import { useNavigate } from "react-router-dom";
import Snackbar from '../common/Snackbar';
import CryptoJS from "crypto-js";

function ApplicantChangePassword() {
  const { user } = useUserContext();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmedPassword: '',
  });
  const [touchedFields, setTouchedFields] = useState({
  oldPassword: false,
  newPassword: false,
  confirmedPassword: false,
});
 const [submitAttempted, setSubmitAttempted] = useState(false);
 const handleBlur = (field) => {
  const updatedTouched = { ...touchedFields, [field]: true };
  setTouchedFields(updatedTouched);
  validateForm(updatedTouched);
};
const validateForm = (customTouched = touchedFields) => {
  let isValid = true;
  const errors = {};
 
  if ((customTouched.oldPassword || submitAttempted) && !oldPassword.trim()) {
    errors.oldPassword = 'Old password is required.';
    isValid = false;
  }
 
  if (customTouched.newPassword || submitAttempted) {
    if (!newPassword.trim()) {
      errors.newPassword = 'New password is required.';
      isValid = false;
    } else if (!isValidPassword(newPassword)) {
      errors.newPassword =
        'New password must be at least 6 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.';
      isValid = false;
    }
  }
 
  if (customTouched.confirmedPassword || submitAttempted) {
    if (!confirmedPassword.trim()) {
      errors.confirmedPassword = 'Confirm password is required.';
      isValid = false;
    } else if (newPassword !== confirmedPassword) {
      errors.confirmedPassword = 'Passwords do not match.';
      isValid = false;
    }
  }
 
  setFormErrors(errors);
  return isValid;
};
 
  const handleTogglePassword = (type) => {
    switch (type) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirmed':
        setShowConfirmedPassword(!showConfirmedPassword);
        break;
      default:
        break;
    }
  };


  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!validateForm()) {
      return;
    }
    const secretKey = "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p";
    // Generate a random IV for each encryption
    const ivOld = CryptoJS.lib.WordArray.random(16);
    const ivNew = CryptoJS.lib.WordArray.random(16);
  
    // Encrypt oldPassword
    const encryptedOldPassword = CryptoJS.AES.encrypt(
      oldPassword,
      CryptoJS.enc.Utf8.parse(secretKey),
      {
        iv: ivOld,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString();
  
    // Encrypt newPassword
    const encryptedNewPassword = CryptoJS.AES.encrypt(
      newPassword,
      CryptoJS.enc.Utf8.parse(secretKey),
      {
        iv: ivNew,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString();
  
    const formData = {
      oldPassword: encryptedOldPassword,
      newPassword: encryptedNewPassword,
      ivOld: ivOld.toString(CryptoJS.enc.Base64), // Send IV for oldPassword
      ivNew: ivNew.toString(CryptoJS.enc.Base64), // Send IV for newPassword
    };
  
    try {
      const jwtToken =localStorage.getItem('jwtToken'); // Replace with the actual JWT token

const response = await axios.post(
  `${apiUrl}/applicant/authenticateUsers/${user.id}`, 
  formData, 
  {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      // Add other headers if required, e.g., Content-Type
    }
  }
);

      if (response.data === 'Password updated and stored') {
        setSnackbar({ 
          open: true, 
          message: 'Password changed successfully', 
          type: 'success' 
        });
        setTimeout(() => {
          navigate('/applicanthome');
        }, 1000);
      } else {
        setSnackbar({ open: true, message: 'Password change failed. Old password is wrong.', type: 'error' });
      }
    } 
  catch (error) {
      console.error('Password change failed. Old password is wrong.:', error);
          const errorMessage = error.response.data;
      if(errorMessage === 'Your old password not matching with data base password'){
        setSnackbar({ open: true, message: 'old password is incorrect', type: 'error' });
      }
      else if(errorMessage === 'your new password should not be same as old password'){
        setSnackbar({ open: true, message: 'old password and new password should not be same', type: 'error' });
      }
    }
  };
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const isFormValid = () => {
    return (
      oldPassword.trim() !== '' &&
      newPassword.trim() !== '' &&
      confirmedPassword.trim() !== '' &&
      isValidPassword(newPassword) &&
      newPassword === confirmedPassword
    );
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  return (
    <div>
      <>
       <div className="border-style">

        <div className="blur-border-style"></div>
        <div class="dashboard__content">
        <section className="page-title-dashboard extraSpace">
      <div className="themes-container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="title-dashboard">            
               
              <div className="title-dash flex2">Change Password</div>
            </div>
          </div>
        </div>
      </div>
    </section>
          <section className="flat-dashboard-password">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="change-password bg-white">
                   
                    <form action="#">
                      <div className="form-password">
                        <div className="inner info-wd">
                          <label className="title-url fs-16">
                            Old Password<span className="color-red">*</span>
                          </label>                          
<div className="inputs-group auth-pass-inputgroup relative flex2">
        <input
          type={showOldPassword ? 'text' : 'password'}
          className="input-form password-input"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          onBlur={() => handleBlur('oldPassword')}
           required=""
        />
        <div className="password-toggle-icon" onClick={() => handleTogglePassword('old')} id="password-addon">
          {showOldPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
      </div>
                           {(formErrors.oldPassword && (touchedFields.oldPassword || submitAttempted)) &&  (
                            <div className="error-message">{formErrors.oldPassword}</div>
                          )}
                        </div>
                        {/* New Password */}
                        <div className="inner info-wd">
                          <label className="title-url fs-16">
                            New Password <span className="color-red">*</span>
                          </label>
                         
                          <div className="inputs-group auth-pass-inputgroup relative flex2">
        <input
          type={showNewPassword ? 'text' : 'password'}
          className="input-form"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onBlur={() => handleBlur('newPassword')}
          required=""
        />
        <div className="password-toggle-icon" onClick={() => handleTogglePassword('new')} id="password-addon">
          {showNewPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
      </div>
                          {(formErrors.newPassword && (touchedFields.newPassword || submitAttempted)) && (
                            <div className="error-message">{formErrors.newPassword}</div>
                          )}
                        </div>
                        {/* Confirm Password */}
                        <div className="inner info-wd">
                          <label className="title-url fs-16">
                            Confirm Password<span className="color-red">*</span>
                          </label>
                         
                          <div className="inputs-group auth-pass-inputgroup relative flex2">
        <input
          type={showConfirmedPassword ? 'text' : 'password'}
          className="input-form password-input"
          value={confirmedPassword}
          onChange={(e) => setConfirmedPassword(e.target.value)}
          onBlur={() => handleBlur('confirmedPassword')}
          required=""
        />
        <div className="password-toggle-icon" onClick={() => handleTogglePassword('confirmed')} id="password-addon">
          {showConfirmedPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
      </div>
{(formErrors.confirmedPassword && (touchedFields.confirmedPassword || submitAttempted)) && (
                            <div className="error-message">{formErrors.confirmedPassword}</div>
                          )}
                        </div>
                        <div className="tt-button submit">
                          <button 
                            type="button" 
                            className={`button-status ${!isFormValid() ? 'disabled' : ''}`} 
                            onClick={handleChangePassword}
                            disabled={!isFormValid()}
                            style={!isFormValid() ? {
                              cursor: 'not-allowed',
                              opacity: 0.7
                            } : {}}
                          >
                            Change Password
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <br></br>
        </div>
        </div>
      </>
      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      )}
    </div>
  );
}
export default ApplicantChangePassword;