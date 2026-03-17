import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
 
const OTPVerification = ({ email, mobilenumber,onOTPVerified,  onOTPSendSuccess, onOTPSendFail,candidateOTPVerifyingInProgress, setCandidateOTPVerifyingInProgress }) => {
  const [otp, setOTP] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [otpVerified, setOTPVerified] = useState(false);
  const [otpResendTimer, setOTPResendTimer] = useState(60);
  const [resendButtonDisabled, setResendButtonDisabled] = useState(true);
 
  const handleVerifyOTP = async () => {
    try {
      setCandidateOTPVerifyingInProgress(true);
      await axios.post(`${apiUrl}/applicant/applicantverify-otp`, { email, otp });
      setOTPVerified(true);
      onOTPVerified();
    } catch (error) {
      setVerificationError('Invalid OTP. Please try again.');
      setOTPResendTimer(0);
     
      setResendButtonDisabled(false);
     
    } finally {
      setCandidateOTPVerifyingInProgress(false);
    }
  };
 
  const handleResendOTP = async () => {
    try {
      setResendButtonDisabled(true);
      await axios.post(`${apiUrl}/applicant/applicantsendotp`, { email, mobilenumber });
      setOTPResendTimer(60);
      onOTPSendSuccess();
      setVerificationError('');
    } catch (error) {
      console.error('Error resending OTP:', error);
      onOTPSendFail();
      setVerificationError('');
    }
  };
 
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setOTPResendTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
 
    return () => {
      clearInterval(timerInterval);
    };
  }, []);
 
  useEffect(() => {
    if (otpResendTimer === 0) {
      setResendButtonDisabled(false);
    }
  }, [otpResendTimer]);
 
  if (otpVerified) {
    return (
      <div className="otp-verification">
        <p>OTP verified successfully!</p>
      </div>
    );
  }
 
  return (
    <div className="otp-verification">
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
      />
      <button type="button" onClick={handleVerifyOTP}>
        {candidateOTPVerifyingInProgress ? (
          <div className="spinner"></div>
        ) : (
          'Verify OTP'
        )}
      </button>
      {otpResendTimer > 0 ? (
        <div style={{ color: 'red' }}>
          Please verify OTP within {otpResendTimer} seconds.
        </div>
      ) : (
        <div>        
          <button type="button" onClick={handleResendOTP} disabled={resendButtonDisabled}>
            Resend OTP
          </button>
        </div>
      )}
      {verificationError && (
        <div className="error-message">{verificationError}</div>
      )}
    </div>
  );
};
 
export default OTPVerification;