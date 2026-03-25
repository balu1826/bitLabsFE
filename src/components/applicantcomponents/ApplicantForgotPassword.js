import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoCompany1 from '../../images/bitlabs-logo.png';
import Snackbar from '../common/Snackbar';
import PropTypes from 'prop-types';

const EmailInputSection = ({ email, handleEmailChange, handleEmailBlur, isEmailFieldDisabled }) => (
  <div>
    <h4><a href="/"><img src={logoCompany1} width="80px" height="80px" alt='logo' /></a></h4><br />
    <div className="div-style">
      <label className="label-style" htmlFor="email">
        Email Address<span>*</span>
      </label>
      <input
        id="email"
        type="email"
        placeholder="Enter your Email"
        value={email}
        onChange={handleEmailChange}
        onBlur={handleEmailBlur}
        className="input-style"
        disabled={isEmailFieldDisabled}
      />
    </div>
  </div>
);

EmailInputSection.propTypes = {
  email: PropTypes.string.isRequired,
  handleEmailChange: PropTypes.func.isRequired,
  handleEmailBlur: PropTypes.func.isRequired,
  isEmailFieldDisabled: PropTypes.bool.isRequired,
};

const PasswordResetSection = ({
  password, confirmedPassword, showPassword, showConfirmPassword,
  handleTogglePassword, handleToggleConfirmPassword,
  setPassword, setConfirmedPassword, handleResetPassword
}) => (
  <div className="ip">
    <div className="inputs-group2 auth-pass-inputgroup">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value.trim())}
        className="input-style"
      />
      <button className="password-toggle-icon" onClick={handleTogglePassword}>
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div><br />
    <div className="inputs-group2 auth-pass-inputgroup">
      <input
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Confirm New Password"
        value={confirmedPassword}
        onChange={(e) => setConfirmedPassword(e.target.value.trim())}
        className="input-style"
      />
      <button className="password-toggle-icon" onClick={handleToggleConfirmPassword}>
        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div><br />
    <div className="helpful-line">
      Password must be at least 6 characters long, contain one uppercase letter,
      one lowercase letter, one number, one special character, and no spaces.
    </div>
    <button type="button" className="button-style" onClick={handleResetPassword}>
      Reset Password
    </button>
    <p style={{ color: 'green', textAlign: 'center' }}>OTP verified successfully!</p>
  </div>
);

PasswordResetSection.propTypes = {
  password: PropTypes.string.isRequired,
  confirmedPassword: PropTypes.string.isRequired,
  showPassword: PropTypes.bool.isRequired,
  showConfirmPassword: PropTypes.bool.isRequired,
  handleTogglePassword: PropTypes.func.isRequired,
  handleToggleConfirmPassword: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  setConfirmedPassword: PropTypes.func.isRequired,
  handleResetPassword: PropTypes.func.isRequired,
};

const OTPSection = ({
  otp, setOtp, otpResendTimer, resendButtonDisabled,
  handleVerifyOTP, handleResendOTP, setOtpResendTimer, setResetError
}) => (
  <div>
    <input
      type="text"
      placeholder="Enter OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value.trim())}
    />
    <button type="button" className="button-style" onClick={() => {
      handleVerifyOTP();
      setOtpResendTimer(0);
    }}>
      Verify OTP
    </button>
    {otpResendTimer > 0 ? (
      <div style={{ color: 'red' }}>
        Please verify OTP within {otpResendTimer} seconds.
      </div>
    ) : (
      <div>
        <button type="button" className="button-style" onClick={() => {
          setResetError(null);
          handleResendOTP();
        }} disabled={resendButtonDisabled}>
          Resend OTP
        </button>
      </div>
    )}

  </div>
);

OTPSection.propTypes = {
  otp: PropTypes.string.isRequired,
  setOtp: PropTypes.func.isRequired,
  otpResendTimer: PropTypes.number.isRequired,
  resendButtonDisabled: PropTypes.bool.isRequired,
  handleVerifyOTP: PropTypes.func.isRequired,
  handleResendOTP: PropTypes.func.isRequired,
  setOtpResendTimer: PropTypes.func.isRequired,
  setResetError: PropTypes.func.isRequired,
};


function ApplicantForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailFieldDisabled, setIsEmailFieldDisabled] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });

  useEffect(() => {
    if (resetSuccess) {
      setSnackbar({ open: true, message: 'Password has been reset successfully', type: 'success' });
      window.location.href = '/candidate';
    }
  }, [resetSuccess]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleEmailBlur = () => {
    setIsEmailFieldDisabled(true);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSendOTP = async () => {
    try {
      setIsEmailFieldDisabled(true);
      const response = await axios.post(`${apiUrl}/applicant/forgotpasswordsendotp`, { email });
      setOtpResendTimer(60);
      const timerInterval = setInterval(() => {
        setOtpResendTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
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
        setResetError('User with the given Email Id was not found in the system');
      }
    } catch (error) {
      setOtpSent(false);
      setOtpVerified(false);
      setResetError('Enter valid email address');
      setIsEmailFieldDisabled(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${apiUrl}/applicant/applicantverify-otp`, { email, otp });
      if (response.data === 'OTP verified successfully') {
        setOtpVerified(true);
        setResetError('');
      } else {
        setOtpVerified(false);
        setResetError('OTP verification failed. Please enter a valid OTP.');
      }
    } catch (error) {
      setOtpVerified(false);
      setResetError('OTP verification failed. Please enter a valid OTP.');
    }
  };

  const getPasswordValidationError = (password) => {
    if (!password || password.trim() === '') {
      return 'Password should not be empty.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number.';
    }
    if (!/[\W_]/.test(password)) {
      return 'Password must contain at least one special character.';
    }
    if (/\s/.test(password)) {
      return 'Password must not contain spaces.';
    }
    return '';
  };

  const handleResendOTP = async () => {
    try {
      setResendButtonDisabled(true);
      await axios.post(`${apiUrl}/applicant/forgotpasswordsendotp`, { email });
      setOtpResendTimer(60);
      const timerInterval = setInterval(() => {
        setOtpResendTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
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
  const handleResetPassword = async () => {
    if (password !== confirmedPassword) {
      setResetSuccess(false);
      setResetError('Passwords do not match. Please make sure the passwords match.');
      return;
    }

    const errorMessage = getPasswordValidationError(password);
    if (errorMessage) {
      setResetSuccess(false);
      setResetError(errorMessage);
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/applicant/applicantreset-password/${email}`,
        {
          password,
          confirmedPassword,
        }
      );

      if (response.data === 'Password reset was done successfully') {
        setResetSuccess(true);
        setResetError('');
      } else {
        setResetSuccess(false);
        setResetError('Password reset failed. Please try again later.');
      }
    } catch (error) {
      setResetSuccess(false);
      setResetError('An error occurred. Please try again later.');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  let content;

  if (otpSent) {
    if (otpVerified) {
      content = (
        <PasswordResetSection
          password={password}
          confirmedPassword={confirmedPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          handleTogglePassword={handleTogglePassword}
          handleToggleConfirmPassword={handleToggleConfirmPassword}
          setPassword={setPassword}
          setConfirmedPassword={setConfirmedPassword}
          handleResetPassword={handleResetPassword}
        />
      );
    } else {
      content = (
        <OTPSection
          otp={otp}
          setOtp={setOtp}
          otpResendTimer={otpResendTimer}
          resendButtonDisabled={resendButtonDisabled}
          handleVerifyOTP={handleVerifyOTP}
          handleResendOTP={handleResendOTP}
          setOtpResendTimer={setOtpResendTimer}
          setResetError={setResetError}
        />
      );
    }
  } else {
    content = (
      <button type="button" onClick={handleSendOTP} className="button-style">
        Send OTP
      </button>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', height: '100vh', width: '100%' }}>
      <div>
        <section className="">
          <div className="tf-container">
            <div className="row">
              <div className="wd-form-login1">
                {resetSuccess ? (
                  <div className="success-message">
                  </div>
                ) : (
                  <div>
                     <EmailInputSection
                      email={email}
                      handleEmailChange={handleEmailChange}
                      handleEmailBlur={handleEmailBlur}
                      isEmailFieldDisabled={isEmailFieldDisabled}
                    />
                    {content}
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
export default ApplicantForgotPassword;

