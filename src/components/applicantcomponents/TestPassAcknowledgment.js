import React from 'react';
import {useState,useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TestPass from '../../images/testpassed.png';
import './css/TestAcknowledgment.css';

const TestPassAcknowledgment = ({ score, testName, handleTakeTest, setTestStarted}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setTestStarted(false);
  }, [setTestStarted]);

  const handleTakeTest1 = () => {
    navigate("/applicant-verified-badges"); // Navigate back to the previous page
  };

  const handleExit = () => {
    setIsVisible(false); // Close the popup
    navigate("/applicant-verified-badges");
  };

  const renderContent = () => {
    if (testName === 'General Aptitude Test') {
      return (
        <div className="acknowledgment-content">
          <img src={TestPass} className="acknowledgment-image" alt="Test Passed" />
          <p className="acknowledgment-score">You Scored {Math.round(score)}%</p>
          <p className="acknowledgment-text" style={{ color: '#8C8C8C', fontSize: '24px', marginTop: '-10px' }}>
            Congratulations! You’re now verified for the General Aptitude Test
          </p>
          <p className="acknowledgment-subtext">
            You are now eligible to take the technical test
          </p>
          <div className="but-link">
            <button
              className="acknowledgment-btn"
              onClick={() => handleTakeTest('Technical Test')}
            >
              Take Test
            </button>
            <Link
              className="link-but"
              onClick={handleTakeTest1}
              style={{ color: '#0D4CC5', fontSize: '20px', textDecoration: 'underline', fontWeight: 'bold' }}
            >
              I’ll take it later
            </Link>
          </div>
        </div>
      );
    } else if (testName === 'Technical Test') {
      return (
        <div className="acknowledgment-content">
          <img src={TestPass} className="acknowledgment-image" alt="Test Passed" />
          <p className="acknowledgment-score">You Scored {Math.round(score)}%</p>
          <p style={{ color: '#8C8C8C', fontSize: '24px', lineHeight: '30px' }}>
          Congratulations! You’re now verified for Technical test.
          </p>
          <button className="acknowledgment-btn" onClick={handleExit} style={{margin:'30px'}}>
          Exit &nbsp;
          <svg style={{marginTop:'-5px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.334 14.1663L17.5007 9.99967L13.334 5.83301" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17.5 10H7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </button>
          </div>
      );
    } else {
      return (
        <div className="acknowledgment-content">
          <img src={TestPass} className="acknowledgment-image" alt="Test Passed" />
          <p className="acknowledgment-score">You Scored {Math.round(score)}%</p>
          <p style={{ color: '#8C8C8C', fontSize: '24px', lineHeight: '30px' }}>
          Congratulations! You’re now verified for {testName} test.
          </p>
          <button className="acknowledgment-btn" onClick={handleExit} style={{margin:'30px'}}>
          Exit &nbsp;
          <svg style={{marginTop:'-5px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.334 14.1663L17.5007 9.99967L13.334 5.83301" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17.5 10H7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </button>
        </div>
      );
    }
  };

  // Only render the popup if it is visible
  return (
    isVisible && (
      <div className="acknowledgment-container">
        {renderContent()}
      </div>
    )
  );
};

export default TestPassAcknowledgment;

