import React, { useState,useEffect } from 'react';
import{ apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import { useNavigate,useLocation } from 'react-router-dom';
import { useUserContext } from '../common/UserProvider';
import OTPVerification1 from '../recruitercomponents/OTPVerification1';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logoCompany1 from '../../images/bitlabs-logo.png';
import Snackbar from '../common/Snackbar';
import CryptoJS from "crypto-js";
import Background from '../../images/user/avatar/Recruiterloginbg.png';
import logo from '../../images/user/avatar/bitlabslogo.svg';
import Backgroundimagemobile1 from '../../images/user/avatar/backgroundimage-mobile-recruiter.png';

 
 function RegisterBody({handleLogin}) {
  const [activeTab, setActiveTab] = useState('Candidate');
  const navigate = useNavigate();
   const [candidateName, setCandidateName] = useState('');
   const [candidateEmail, setCandidateEmail] = useState('');
   const [candidateMobileNumber, setCandidateMobileNumber] = useState('');
   const [candidatePassword, setCandidatePassword] = useState('');
   const [companyName, setCompanyName] = useState('');
   const [employerEmail, setEmployerEmail] = useState('');
   const [employerMobileNumber, setEmployerMobileNumber] = useState('');
   const [employerPassword, setEmployerPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allErrors, setAllErrors] = useState(false);
const [candidateNameError, setCandidateNameError] = useState('');
const [candidateEmailError, setCandidateEmailError] = useState('');
const [candidateMobileNumberError, setCandidateMobileNumberError] = useState('');
const [candidatePasswordError, setCandidatePasswordError] = useState('');
const [employerNameError, setEmployerNameError] = useState('');
const [employerEmailError, setEmployerEmailError] = useState('');
const [employerMobileNumberError, setEmployerMobileNumberError] = useState('');
const [employerPasswordError, setEmployerPasswordError] = useState('');
  const [recruiterOTPSent, setRecruiterOTPSent] = useState(false);
  const [recruiterOTPVerified, setRecruiterOTPVerified] = useState(false);
  const [recruiterOTPVerifyingInProgress, setRecruiterOTPVerifyingInProgress] = useState(false);
  const [recruiterRegistrationSuccess, setRecruiterRegistrationSuccess] = useState(false);
  const [recruiterRegistrationInProgress, setRecruiterRegistrationInProgress] = useState(false);
  const [recruiterOTPSendingInProgress, setRecruiterOTPSendingInProgress] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [candidateOTPSent, setCandidateOTPSent] = useState(false);
  const [candidateOTPVerified, setCandidateOTPVerified] = useState(false);
  const [candidateOTPVerifyingInProgress, setCandidateOTPVerifyingInProgress] = useState(false);
  const [candidateOTPSendingInProgress, setCandidateOTPSendingInProgress] = useState(false);
  const [candidateRegistrationSuccess, setCandidateRegistrationSuccess] = useState(false);
  const [candidateRegistrationInProgress, setCandidateRegistrationInProgress] = useState(false);
  const [allFieldsDisabled, setAllFieldsDisabled] = useState(false);
  const [resendOtpMessage, setResendOtpMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [message, setMessage] = useState('Welcome Back!');
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [recruiterPassword, setRecruiterPassword] = useState('');
  const location = useLocation();
  const registrationSuccess = location.state?.registrationSuccess;
  const { setUser, setUserType } = useUserContext();
  const [recruiterEmailError, setRecruiterEmailError] = useState('');
  const [recruiterPasswordError, setRecruiterPasswordError] = useState('');
 const [candidateLoginInProgress, setCandidateLoginInProgress] = useState(false);

 useEffect(()=>{
  if (recruiterEmail || recruiterPassword){
    setErrorMessage("")
  }

},[recruiterEmail,recruiterPassword])
 
 
 
 
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const handleSendOTP = async () => {
    if (!isFormValid()) {
      setAllErrors(true);
      return;
    }
    try {
      setCandidateOTPSendingInProgress(true);
      console.log("email is:", candidateEmail);
      const response=await axios.post(`${apiUrl}/applicant/applicantsendotp`, { email: candidateEmail , mobilenumber: candidateMobileNumber});
      console.log("email is:", candidateEmail);
      setCandidateOTPSent(true);
      setCandidateOTPSendingInProgress(false);
      if (response.data === "Email already registered recruiter"){
        setCandidateOTPSent(false);
     
     
     setSnackbar({ open: true, message: 'Email already registered as recruiter,please try to login', type: 'error' });
       }
       if(response.data === ('Email already registered as applicant')){
        setCandidateOTPSent(false);
     
        
        setSnackbar({ open: true, message: 'Email already registered as candidate,please try to login', type: 'error' });
       }
       if(response.data === "Mobile number already existed in recruiter"){
        setCandidateOTPSent(false);
     
       
        setSnackbar({ open: true, message: 'Mobile number already existed as recruiter', type: 'error' });
       }
       if(response.data === 'Mobile number already existed in applicant'){
        setCandidateOTPSent(false);
     
        setSnackbar({ open: true, message: 'Mobile number already existed as candidate', type: 'error' });
       }
    } catch (error) {
      console.error('Error sending OTP:', error);
      if (error.response && error.response.status === 400) {
       
       setSnackbar({ open: true, message: 'Email is already registered.', type: 'error' });
      } else {
       
       setSnackbar({ open: true, message: 'An error occurred while sending OTP.', type: 'error' });
      }
      setCandidateOTPSendingInProgress(false);
    }
  };
  const handleSendOTP1 = async () => {
  if (!isFormValid1()) {
    setAllErrors(true);
    return;
  }
 
  try {
    setRecruiterOTPSendingInProgress(true);
 
    const response = await axios.post(`${apiUrl}/recuriters/registration-send-otp`, {
      email: employerEmail,
      mobilenumber: employerMobileNumber,
    });
 
    setRecruiterOTPSent(true);
    setRecruiterOTPSendingInProgress(false);
 
    if (response.data === "Email already registered recruiter") {
      setRecruiterOTPSent(false);
     
     setSnackbar({ open: true, message: 'Email already registered as recruiter,please try to login', type: 'error' });

    } else if (response.data === 'Email already registered as applicant') {
      setRecruiterOTPSent(false);
      
      setSnackbar({ open: true, message: 'Email already registered as candidate,please try to login', type: 'error' }); 
    } else if (response.data === "Mobile number already existed in recruiter") {
      setRecruiterOTPSent(false);
      
      setSnackbar({ open: true, message: 'Mobile number already existed as recruiter', type: 'error' });
    } else if (response.data === 'Mobile number already existed in applicant') {
      setRecruiterOTPSent(false);
      setSnackbar({ open: true, message: 'Mobile number already existed as candidate', type: 'error' });
    } else {
  
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    if (error.response && error.response.status === 400) {
     
     setSnackbar({ open: true, message: 'Email is already registered.', type: 'error' });
    } else {
      setSnackbar({ open: true, message: 'An error occurred while sending OTP.', type: 'error' });
    }
    setRecruiterOTPSendingInProgress(false);
  }
};
  const handleRecruiterSubmit = async (e) => {
    e.preventDefault();
    if (!isRecruiterFormValid()) {
      return;
    }
    const secretKey = "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p";
const iv = CryptoJS.lib.WordArray.random(16); // Generate a random IV (16 bytes for AES)
const encryptedPassword = CryptoJS.AES.encrypt(recruiterPassword, CryptoJS.enc.Utf8.parse(secretKey), {
  iv: iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
}).toString();

    try {
      let loginEndpoint = `${apiUrl}/recuriters/recruiterLogin`;
      const response = await axios.post(loginEndpoint, {
        email: recruiterEmail,
        password: encryptedPassword,
        iv: iv.toString(CryptoJS.enc.Base64),
      });
 
      console.log('Response:', response);
 
      if (response && response.status === 200) {
        const userData = response.data;
 
        if (userData && userData.data && userData.data.jwt) {
         
          setErrorMessage('');
          localStorage.setItem('jwtToken', userData.data.jwt);
 
          let userType1 = '';
          if (userData.message.includes('ROLE_JOBAPPLICANT')) {
            userType1 = 'jobseeker';
          } else if (userData.message.includes('ROLE_JOBRECRUITER')) {
            userType1 = 'employer';
          } else {
            userType1 = 'unknown';
          }
 
          localStorage.setItem('userType', userType1);
          setErrorMessage('');
          handleLogin();
          setUser(userData);
          setUserType(userType1);
          console.log('Recruiter Login successful', userData);
          navigate('/recruiterhome');
        } else {
          
          console.error('Login failed. Token not found in response:', response);
          setErrorMessage('Login failed. Please check your user name and password.');
        }
      } else {
       
        console.error('Login failed. Invalid response:', response);
        setErrorMessage('Login failed. Please check your user name and password.');
      }
    } catch (error) {
      console.error('Login failed', error);
      
      if(error.response.data==="No account found with this email address")
          setErrorMessage('No account found with this email address');
      if(error.response.data==="Incorrect password")
          setErrorMessage('Incorrect password');
    }
  };

  
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      return;
    }
    try {
      setCandidateRegistrationInProgress(true);
      const response = await axios.post(`${apiUrl}/applicant/saveApplicant`, {
        name: candidateName,
        email: candidateEmail,
        mobilenumber: candidateMobileNumber,
        password: candidatePassword,
      });
     if (response.data === 'Email is already registered.') {
       
       setSnackbar({ open: true, message: 'Email is already registered.', type: 'error' });
      }
      setErrorMessage('');
      setCandidateRegistrationSuccess(true);
      console.log('Registration successful', response.data);
      setCandidateName('');
      setCandidateEmail('');
      setCandidateMobileNumber('');
      setCandidatePassword('');
      setCandidateRegistrationInProgress(false);
      if (candidateOTPSent && candidateOTPVerified) {
        navigate('/recruiter', { state: { registrationSuccess: true } });
      }
    } catch (error) {
      setErrorMessage('Registration failed. Please try again later.');
      setCandidateRegistrationInProgress(false);
        console.error('Registration failed', error);
        if (error.response && error.response.status === 400) {
          if (error.response.data === 'Email already registered') {
          
           setSnackbar({ open: true, message: 'Registration failed.User with this email already exists', type: 'error' });
          } else if (error.response.data === 'Mobile number already existed') {
        
            setSnackbar({ open: true, message: 'Registration failed.Mobile number already exists', type: 'error' });
          }
        }
    }
  };
  const isFullNameValid = (fullName) => {
    if (!fullName.trim()) {
      return 'Full name is required.';
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      return 'Please enter a valid full name and should not have any numbers and special char.';
    }
    if (fullName.trim().length < 3) {
      return 'Full name should be at least three characters long.';
    }
    return '';
  };
  const isCompanyNameValid = (companyName) => {
    if (!companyName.trim()) {
      return 'Company name is required.';
    }
    if (/^\s/.test(companyName)) {
      return 'Company name should not start with a space.';
    }
    if (/\s$/.test(companyName)) {
      return 'Company name should not end with a space.';
    }
    if (/ {2,}/.test(companyName)) {
      return 'Company name should not contain consecutive spaces.';
    }
    if (!/^[\w .'&-]*$/.test(companyName)) {
      return 'Company name can only contain letters, digits, and special characters (.\'&-).';
    }
    if (companyName.trim().length < 3) {
      return 'Company name should be at least three characters long.';
    }
    return '';
  };
  const isEmailValid = (email) => {
    if (!email.trim()) {
      return 'Email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
  };  
  const isEmailValid1 = (email) => {
    if (!email.trim()) {
      return 'Email is required.';
    }
    const excludedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'aol.com',
      'mail.com',
      'icloud.com',
      'zoho.com',
      'yandex.com',
      'protonmail.com',
      'tutanota.com',
    ];
    const domain = email.split('@')[1];
    if (!email.includes('@')) {
      return 'Please enter a valid email.';
    }

    if (excludedDomains.includes(domain)) {
      return 'Please enter your official email ID.';
    }
    return '';
  };
  const isPasswordValid = (password) => {
    if (!password.trim()) {
      return 'Password is required.';
    }
     // Regular expression to match the password criteria
     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

     if (!passwordRegex.test(password)) {
         return 'Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces.';
     }
    return '';
  };
  const isMobileNumberValid = (mobilenumber) => {
    if (!mobilenumber.trim()) {
      return 'Mobile number is required.';
    }
    if (!/^\d+$/.test(mobilenumber)) {
      return 'Mobile number must contain only numeric digits.';
    }
    if (mobilenumber.length !== 10) {
      return 'Mobile number must have a specific length (e.g., 10 digits).';
    }
    if (/\s/.test(mobilenumber)) {
      return 'Mobile number cannot contain spaces.';
    }
    const firstDigit = mobilenumber.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return 'Mobile number should begin with 6, 7, 8, or 9.';
    }
    return '';
  };
  const isFormValid = () => {
    setAllErrors(false);
    const nameError = isFullNameValid(candidateName);
    const emailError = isEmailValid(candidateEmail);
    const mobileNumberError = isMobileNumberValid(candidateMobileNumber);
    const passwordError = isPasswordValid(candidatePassword);
    setCandidateNameError(nameError);
    setCandidateEmailError(emailError);
    setCandidateMobileNumberError(mobileNumberError);
    setCandidatePasswordError(passwordError);
    return !(nameError || emailError || mobileNumberError || passwordError);
  };
  const isFormValid1 = () => {
    setAllErrors(false);
    const nameError = isCompanyNameValid(companyName);
    const emailError = isEmailValid1(employerEmail);
    const mobileNumberError = isMobileNumberValid(employerMobileNumber);
    const passwordError = isPasswordValid(employerPassword);
    setEmployerNameError(nameError);
    setEmployerEmailError(emailError);
    setEmployerMobileNumberError(mobileNumberError);
    setEmployerPasswordError(passwordError);
    return !(nameError || emailError || mobileNumberError || passwordError);
  };
  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
    setEmployerNameError('');
  };
  const handleEmployerEmailChange = (e) => {
    setEmployerEmail(e.target.value);
    setEmployerEmailError('');
  };
  const handleEmployerMobileNumberChange = (e) => {
    setEmployerMobileNumber(e.target.value);
    setEmployerMobileNumberError('');
  };
  const handleEmployerPasswordChange = (e) => {
    setEmployerPassword(e.target.value);
    setEmployerPasswordError('');
  };
  const handleSubmit1 = async (e) => {
   
    if (!isFormValid1()) {
      return;
    }
 
    try {
      setRecruiterRegistrationInProgress(true);
 
      
   
      const response = await axios.post(`${apiUrl}/recuriters/saverecruiters`, {
        companyname: companyName,
        mobilenumber: employerMobileNumber,
        email: employerEmail,
        password: employerPassword,
      });
 
      setErrorMessage('');
      setRecruiterRegistrationSuccess(true);
      setRegistrationSuccessMessage('Registration successful!');
      setActiveTab('Candidate');
      console.log('Registration successful', response.data);
 
     
      setCompanyName('');
      setEmployerEmail('');
      setEmployerMobileNumber('');
      setEmployerPassword('');
      setRecruiterRegistrationInProgress(false);
     
     
 
      navigate('/recruiter', { state: { registrationSuccess: true } });
     
   
    } catch (error) {
      setErrorMessage('Registration failed. Please try again later.');
     
      setSnackbar({ open: true, message: 'Registration failed or User with this email already exists.', type: 'error' });
      console.error('Registration failed', error);
 
      if (error.response && error.response.status === 400) {
        if (error.response.data === 'Email already registered') {
        
         setSnackbar({ open: true, message: 'Registration failed.User with this email already exists', type: 'error' });
        } else if (error.response.data === 'Mobile number already existed') {
          
          setSnackbar({ open: true, message: 'Registration failed.Mobile number already exists', type: 'error' });
        }
      }
      setRecruiterRegistrationInProgress(false);
    }
  };
  const handleOTPSendSuccess = () => {

  setSnackbar({ open: true, message: 'OTP resend successfully', type: 'success' });
   setResendOtpMessage('OTP Resent successfully. Check your email.');
  };
  const handleOTPSendFail = () => {
  
  setSnackbar({ open: true, message: 'Failed to resend OTP.Please try again.', type: 'error' });
   setResendOtpMessage('Failed to Resent OTP. Please try again.');
  };
  const isRecruiterFormValid = () => {
    const emailError = validateEmail(recruiterEmail);
    setRecruiterEmailError(emailError);
    const passwordError = validatePassword(recruiterPassword);
    setRecruiterPasswordError(passwordError);
    if (!recruiterEmail.trim()) {
      setRecruiterEmailError('Email is required.');
    }
    if (!recruiterPassword.trim()) {
      setRecruiterPasswordError('Password is required.');
    }
    if (emailError || passwordError) {
      return false;
    }
    return true;
  };
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required.';
    }
    const excludedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'aol.com',
      'mail.com',
      'icloud.com',
      'zoho.com',
      'yandex.com',
      'protonmail.com',
      'tutanota.com',
    ];
    const domain = email.split('@')[1];
    if (excludedDomains.includes(domain)) {
      return 'Please enter  official email ID.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address.';
  };
  const validatePassword = (password) => {
    if (!password.trim()) {
      return 'Password is required.';
    }
    // if (password.length < 6) {
    //   return 'Password must be at least 6 characters long.';
    // }
    // if (!/[A-Z]/.test(password)) {
    //   return 'Password must contain at least one uppercase letter.';
    // }
    // if (!/[^A-Za-z0-9]/.test(password)) {
    //   return 'Password must contain at least one special character (non-alphanumeric).';
    // }
    // if (/\s/.test(password)) {
    //   return 'Password cannot contain spaces.';
    // }
    return '';
  };


  const handleTabClick1 = (tab) => {
    setActiveTab(tab);
    if (tab === 'Candidate') {
      setMessage('Welcome Back!');
      console.log("login");
    } else if (tab === 'Employer') {
      setMessage('Hi Recruiter!');
    }
  };
  
  const getTabStyle = (tab) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: activeTab === tab ? '#F97316' : 'transparent',
    color: activeTab === tab ? '#fff' : '#000',
    transition: 'background-color 1s ease;',
    display: 'inline-block',
    textAlign: 'center',
    borderRadius: '4px',
    marginRight: tab === 'Candidate' ? '0px' : '0',
    flex: 1,
  });
  
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  return (
    <div className='full-page'>
      <div style={{position:'relative'}}>
      <img
        src={Backgroundimagemobile1}
        alt="Background"
        className="responsive-image1"
        style={{
          position: 'relative',
          top: '0',
          left: '0',
          objectFit: 'cover',
          zIndex: '1',
        }}
      />

      <div style={{position:'absolute' , zIndex:'1' , display:'flex',bottom:0,justifyContent:'center',width:'100%'}}>
        <h1 className='find-your2'>Find the Best freshers, fuel your workforce!</h1>
      </div>
      <div>
      <img
        src={logo}
        alt="logo"
        className="logo-image"
        style={{
          zIndex: '1',
        }}
      />
    </div>
      </div>
      <a id="scroll-top" />
    <section className="account-section">
      <div className="tf-container">
        <div className="row">
          <div className="wd-form-login tf-tab">
          <div className="custom-div-style" style={{textAlign:"left"}}>
      {message}
    </div>
    <div className="myComponent">
        
      <div
  style={{
    ...getTabStyle('Candidate'),
    fontWeight: 'bold' 
  }}
  onClick={() => handleTabClick1('Candidate')}
>
  Login
</div>

<div
  style={{
    ...getTabStyle('Employer'),
    fontWeight: 'bold' 
  }}
  onClick={() => handleTabClick1('Employer')}
>
  Sign Up
</div>
</div>

            
            <div className="content-tab">
              <div className="inner" style={{ display: activeTab === 'Candidate' ? 'block' : 'none' }}>
              <p><span>  {registrationSuccessMessage && (
              <div style={{ color: 'green', marginBottom: '10px' }}>{registrationSuccessMessage}</div>
            )}</span></p>
              <form onSubmit={handleRecruiterSubmit}>
                      <div className="ip">
                       
                        <input
                          type="text"
                          className="name"
                          placeholder="Email"
                          value={recruiterEmail}
                          onChange={(e) => {
                            setRecruiterEmail(e.target.value);
                            setRecruiterEmailError('');
                          }}
                        />
                        {recruiterEmailError && <div className="error-message" style={{ textAlign: 'left' }}>{recruiterEmailError}</div>}
                      </div>
                      <div className="ip">
                    
                        <div className="inputs-group auth-pass-inputgroup">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="name"
                            placeholder="Password"
                            value={recruiterPassword}
                            onChange={(e) => {
                              setRecruiterPassword(e.target.value);
                               setRecruiterPasswordError('');
                                }}
                           
                       />
                          <div className="new-password-icon" onClick={handleTogglePassword} id="password-addon">
      {showPassword ? <FaEye /> : <FaEyeSlash />}
    </div>
                        </div>
                        {recruiterPasswordError && <div className="error-message" style={{ textAlign: 'left' }}>{recruiterPasswordError}</div>}
                      </div>
                   
                      <button type="submit" class="custom-button">Login</button>
                      <div className="group-ant-choice">
                        <div className="sub-ip"></div>
                        <a href="/recruiter-forgot-password" className="forgot"><br />
                          Forgot password?
                        </a>
                      </div>
                      {errorMessage && <div className="error-message">{errorMessage}</div>}
                    </form>
              </div>
            </div>
            <div className="content-tab">
              <div className="inner" style={{ display: activeTab === 'Employer' ? 'block' : 'none' }}>
              
                <form onSubmit={handleSubmit1}>
                <div className="ip">
                   
                    <input
                      type="text"
                      className="name"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setEmployerNameError('');
                      }}
                      disabled={allFieldsDisabled}
                    />
                     {employerNameError && <div className="error-message" style={{ textAlign: 'left' }}>{employerNameError}</div>}
                  </div>
                  <div className="ip">
                    
                    <input
                      type="email"
                      className="name"
                      placeholder="Email"
                      value={employerEmail}
                     
                      onChange={(e) => {
                        setEmployerEmail(e.target.value);
                        setEmployerEmailError('');
                      }}
                      disabled={allFieldsDisabled}
                    />
                     {employerEmailError && <div className="error-message" style={{ textAlign: 'left' }}>{employerEmailError}</div>}
                  </div>
                  <div className="ip">
                    
                    <input
                      type="text"
                      className="name"
                      placeholder="Mobile Number"
                      value={employerMobileNumber}
                     
                      onChange={(e) => {
                        setEmployerMobileNumber(e.target.value);
                        setEmployerMobileNumberError('');
                      }}
                      disabled={allFieldsDisabled}
                    />
                    {employerMobileNumberError && <div className="error-message" style={{ textAlign: 'left' }}>{employerMobileNumberError}</div>}
                  </div>
                  <div className="ip">
                    
                    <div className="inputs-group2 auth-pass-inputgroup">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="name"
                        placeholder="Password"
                        value={employerPassword}
                       
                        onChange={(e) => {
                          setEmployerPassword(e.target.value);
                          setEmployerPasswordError('');
                        }}
                        disabled={allFieldsDisabled}
                      />
                        <div className="new-password-icon" onClick={handleTogglePassword} id="password-addon">
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </div>
                    </div>
                    {employerPasswordError && <div className="error-message" style={{ textAlign: 'left' }}>{employerPasswordError}</div>}
                  </div>
                  {recruiterOTPSent && !recruiterOTPVerified ? (
  <div>
    <p style={{ color: 'green' }}>OTP sent to your email. Please check and enter below:</p>
    <OTPVerification1
            email={employerEmail}
            mobilenumber={employerMobileNumber}
            onOTPVerified={() => {
              setTimeout(() => {
                setRecruiterOTPVerified(true);
                setAllFieldsDisabled(true);
              }, 0);
              setTimeout(() => {console.log(recruiterOTPVerified);
               
                handleSubmit1();
              }, 10);
             
            }}
            onOTPSendSuccess={handleOTPSendSuccess}
            onOTPSendFail={handleOTPSendFail}
            recruiterOTPVerifyingInProgress={recruiterOTPVerifyingInProgress}
            setRecruiterOTPVerifyingInProgress={setRecruiterOTPVerifyingInProgress}
          />
  </div>
) : (
  <div>
    {recruiterOTPVerified ? (
      <div style={{ color: 'green'  }}>
       
       
      </div>
    ) : (
      <div>
         <div className="helpful-line">Click on send OTP to verify your email</div>
        <button
          type="button"
          // class="custom-button"
          onClick={handleSendOTP1}
          disabled={recruiterOTPSent || recruiterRegistrationInProgress || recruiterOTPSendingInProgress}
        >
          {recruiterOTPSendingInProgress ? (
             <div className="status-container">
             <div className="spinner"></div>
             <div className="status-text">Sending OTP</div>
           </div>
          ) : (
            'Send OTP'
          )}
        </button>
      </div>
    )}
  </div>
)}

                </form>
              </div>
            </div>
            <div style={{position:'relative'}}>
                <img
  src={Background}
  alt="Background"
  className="responsive-image2"
  style={{
    position: "fixed",
    top: "0px",
    left: "-20px",
    paddingRight: "10px"
  }}
  
/>
<div className='hide'>
<div align='left' style={{position:'fixed' ,bottom:0,width:'30%',left:'5%',alignContent:'left'}}>
        <h1 className='find-your2' style={{ marginBottom: '-50px',fontSize:'35px' }}>Find The</h1>
        <h1 className='find-your2' style={{ marginBottom: '-50px',fontSize:'35px' }}>Best Freshers,</h1>
        <h1 className='find-your2' style={{ marginBottom: '5px',fontSize:'35px' }}>Fuel Your Workforce!</h1>
      </div>
</div>

<div>
      <img
        src={logo}
        alt="logo"
        className="logo-image1"
        style={{
          zIndex: '1',
        }}
      />
    </div>

</div>
          </div>
        </div>
      </div>
    </section>
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
export default RegisterBody;