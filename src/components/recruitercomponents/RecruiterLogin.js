import React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import ApplicantAPIService,{ apiUrl } from '../../services/ApplicantAPIService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function RecruiterLogin({handleLogin}) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();
    const registrationSuccess = location.state?.registrationSuccess;
    const navigate = useNavigate();
    const { setUser } = useUserContext();
    const { setUserType } = useUserContext();
    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };
    const isFormValid = () => {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter required details to login');
        return false;
      }
      return true;
    };
    const setJwtToken = (token) => {
      localStorage.setItem('jwtToken', token);
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isFormValid()) {
        return;
      }
      try {
        let loginEndpoint;
        let count;
  
        if (email === 'admin' && password === 'admin') {
          count = 0;
          loginEndpoint = `${apiUrl}/adminlogin`; 
        } else {
          count = 1;
          loginEndpoint = `${apiUrl}/recuriters/recruiterLogin`; 
        }
        console.log('Email:', email);
        

        // Explicitly remove the Authorization header for this request
        delete axios.defaults.headers.common['Authorization'];

        const response = await axios.post(loginEndpoint, {
          email,
          password,
        }, {
          headers: {
            // No Authorization header will be sent in this request
          },
        });

        
        if (response.status === 200) {
          setErrorMessage('');
          const userData = response.data;
          console.log('this is response ', userData);
          console.log('this is token ', userData.data.jwt);
          localStorage.setItem('jwtToken', userData.data.jwt);
          let userType1 = '';
          if (userData.message.includes('ROLE_JOBAPPLICANT')) {
            userType1 = 'jobseeker';
          } else if (userData.message.includes('ROLE_JOBRECRUITER')) {
            userType1 = 'employer';
          } else {
            userType1 = 'unknown';
          }
          console.log('this userType ', userType1);
          localStorage.setItem('userType', userType1);
          const jwtToken = response.headers.authorization;
          setErrorMessage('');
          handleLogin();
          setUser(userData);
          setUserType(userData.userType);
          console.log('Login successful', userData);
  
          if (count === 0) {
            navigate('/admin');
          } else {
            navigate('/recruiterhome');
          }
        } else {
          if (response.data && response.data.message) {
            if (response.data.message.includes('Invalid username')) {
              setErrorMessage('Invalid email');
            } else if (response.data.message.includes('Invalid password')) {
              setErrorMessage('Invalid password');
            } else {
              setErrorMessage('Login failed. Please check your user name and password.');
            }
          } else {
            setErrorMessage('Login failed. Please check your user name and password.');
          }
          console.error('Login failed');
        }
      } catch (error) {
        setErrorMessage('Login failed. Please check your user name and password.');
        console.error('Login failed', error);
      }
    };
  return (
    <div>
<div>
      <section className="bg-f5">
        <div className="tf-container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-title">
                <div className="widget-menu-link">
                  <ul>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="account-section">
        <div className="tf-container">
          <div className="row">
            <div className="wd-form-login">
            {registrationSuccess && (
          <div className="success-message">
            Registration successful! Please log in to continue.
          </div>
        )}
              <h4>Recruiter's Login</h4>
              <form  onSubmit={handleSubmit}>
                <div className="ip">
                  <label>
                    Email address<span>*</span>
                  </label>
                  <input
                        type="text"
                        placeholder="Enter your Email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                   />
                </div>
                <div className="ip">
                  <label>
                    Password<span>*</span>
                  </label>
                  <div className="inputs-group auth-pass-inputgroup">
                  <input
                       type={showPassword ? 'text' : 'password'}
                         placeholder="Password"
                         value={password}
                          onChange={(e) => setPassword(e.target.value)}
                    />
                  <div className="password-toggle-icon" onClick={handleTogglePassword} id="password-addon">
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </div>
                  </div>
                </div>
                <div className="group-ant-choice">
                  <div className="sub-ip">
                  </div>
                  <a href="/recruiter-forgot-password" className="forgot">
                    Forgot password?
                  </a>
                </div>
                <button type="submit">Login</button>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="sign-up">
                  Not registered yet? <a href="/register" >Sign Up</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
     </div>
  )
}

export default RecruiterLogin;