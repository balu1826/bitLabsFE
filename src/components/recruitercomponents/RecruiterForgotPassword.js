import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { apiUrl } from '../../services/ApplicantAPIService';
import logoCompany1 from '../../images/bitlabs-logo.png';
import Snackbar from '../common/Snackbar';
 
function RecruiterForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState(''); 
    const [confirmedPassword, setConfirmedPassword] = useState(''); 
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(true); 
    const [showPassword, setShowPassword] = useState(false);
    const [otpResendTimer, setOTPTimerResend] = useState(0);
    const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });

    
    const [isEmailFieldDisabled, setIsEmailFieldDisabled] = useState(false);
  
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };
  
    const handleEmailBlur = () => {
      setIsEmailFieldDisabled(true);
    };

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };
 
    const validatePassword = (value) => {
      const isLengthValid = value.length >= 6;
      const hasUppercase = /[A-Z]/.test(value);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
      const hasNoSpaces = !/\s/.test(value);
      const isValid = isLengthValid && hasUppercase && hasSpecialChar && hasNoSpaces;
      setIsPasswordValid(isValid);
      return isValid;
    };
    const handleSendOTP = async () => {
      try {
        const response = await axios.post(`${apiUrl}/forgotpassword/recuritersend-otp`, { email });
        setOTPTimerResend(60);
      const timerInterval = setInterval(() => {
        setOTPTimerResend((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
      setTimeout(() => {
        clearInterval(timerInterval);
        setResendButtonDisabled(false);
      }, 60000);
 if (response.data === 'OTP sent successfully') {
          setOtpSent(true);
          setResetSuccess(false);
          setResetError('');
        } else {
          setOtpSent(false);
          setOtpVerified(false);
          setResetError('User with given Email Id was not found in the system');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        setOtpSent(false);
        setOtpVerified(false);
        setResetError('Enter valid email address');
      }
    };
    const handleResendOTP = async () => {
      try {
        setResendButtonDisabled(true);
        await axios.post(`${apiUrl}/forgotpassword/recuritersend-otp`, { email });
        setOTPTimerResend(60);
        const timerInterval = setInterval(() => {
          setOTPTimerResend((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
        }, 1000);
        setTimeout(() => {
          clearInterval(timerInterval);
          setResendButtonDisabled(false);
        }, 60000);
      
       setSnackbar({ open: true, message: 'OTP resent successfully', type: 'success' });
      } catch (error) {
        console.error('Error resending OTP:', error);
      }
    };
 
    const handleVerifyOTP = async () => {
      try {
        const response = await axios.post(`${apiUrl}/forgotpassword/recuriterverify-otp`, { email, otp });
        if (response.data === 'OTP verified successfully') {
          setOtpVerified(true);
          setResetError('');
        } else {
          setOtpVerified(false);
          setResetError('OTP verification failed. Please enter a valid OTP.');
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        setOtpVerified(false);
        setResetError('OTP verification failed. Please enter a valid OTP.');
      }
    };
    const handleResetPassword = async () => {
      if (password !== confirmedPassword) {
        setResetSuccess(false);
        setResetError('Passwords do not match. Please make sure the passwords match.');
        return;
      }
  if (!validatePassword(password)) {
    setResetSuccess(false);
    setResetError('Password Should not be empty.');
    return;
  }
      try {
        const response = await axios.post(`${apiUrl}/forgotpassword/recuriterreset-password/set-new-password/${email}`, {
          password,
          confirmedPassword,
        });
        if (response.data === 'Password reset was done successfully') {
          setResetSuccess(true);
          console.log("Api is called");
          setResetError('');
        } else {
          setResetSuccess(false);
          setResetError('Password reset failed. Please try again later.');
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        setResetSuccess(false);
        setResetError('An error occurred. Please try again later.');
      }
    };

    const handleCloseSnackbar = () => {
      setSnackbar({ open: false, message: '', type: '' });
    };
 
  return (
    <div className='full-page' style={{backgroundColor:"white",width:"100%",height:"100vh"}}>
      <div>
        <section className="">
          <div className="tf-container">
            <div className="row">
              <div className="wd-form-login1">
                {resetSuccess ? (
                  <div className="success-message">
                    <h5>Password reset was done successfully. Please click on <a href="/recruiter" style={{color:'blue'}}>Login</a> to continue</h5>
                  </div>
                ) : (
                  <div>
                    <h4><a href="/"><img src={logoCompany1} width="80px" height="80px"/></a> </h4><br />
                    <div className="div-style">
                      <label className="label-style">
  Email Address<span>*</span>
</label>

      <input
  type="email"
  placeholder="Enter your Email"
  value={email}
  onChange={handleEmailChange}
  onBlur={handleEmailBlur}
  // disabled={isEmailFieldDisabled}
  className="input-style"
/>

    </div>
                      {otpSent ? (
                        otpVerified ? (
                          <div className="ip2">
                             <div className="inputs-group2 auth-pass-inputgroup">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="New Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                               className="input-style"
                            />
                            <div className="password-toggle-icon" onClick={handleTogglePassword} id="password-addon">
        {showPassword ? <FaEye /> : <FaEyeSlash />}
</div>
                           </div><br />
                           <div className="inputs-group2 auth-pass-inputgroup">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Confirm New Password"
                              value={confirmedPassword}
                              onChange={(e) => setConfirmedPassword(e.target.value)}
                               className="input-style"
                            />
                           <div className="password-toggle-icon" onClick={handleTogglePassword} id="password-addon">
        {showPassword ? <FaEye /> : <FaEyeSlash />}
</div>
                            </div><br></br>
                            <div className="helpful-line">
                              Password must be at least 6 characters long, contain one uppercase letter,
                              one lowercase letter, one number, one special character, and no spaces.
                            </div>
 
                            <button type="button" className="button-style"onClick={handleResetPassword}>Reset Password </button>
                            <p style={{ color: 'green',textAlign:'center' }}>OTP verified successfully!</p>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="text"
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="input-style"
                            />
                           <button type="button"  className="button-style" onClick={() => {
                                   handleVerifyOTP();
                                   setOTPTimerResend(0);
                                }}>
                                  Verify OTP
</button>
                            {otpResendTimer > 0 ? (
<div style={{ color: 'red' }}>
                                      Please verify OTP within {otpResendTimer} seconds.
</div>
                                    ) : (
<div>        
<button type="button"  className="button-style" onClick={() => { setResetError(null); 
                                        handleResendOTP();  }} disabled={resendButtonDisabled}>
                                             Resend OTP
</button>
</div>
                            )}
 
                          </div>
                        )
                      ) : (
                        <button type="button" onClick={handleSendOTP} className="button-style">
  Send OTP
</button>
                      )}
                      {resetError && <div className="error-message">{resetError}</div>}
                   
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
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
export default RecruiterForgotPassword;

