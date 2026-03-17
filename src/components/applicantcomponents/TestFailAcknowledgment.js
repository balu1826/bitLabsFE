import React,{useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import TestFail from '../../images/testfail.png';
import './css/TestAcknowledgment.css';

const TestFailAcknowledgment = ({setTestStarted}) => {
  const navigate = useNavigate();

  useEffect(() => {
    setTestStarted(false);
  }, [setTestStarted]);

  const handleExit = () => {
    navigate("/applicant-verified-badges"); // Redirect to the home page or any desired route
  };

  return (
    <div className="acknowledgment-container">
      <div className="acknowledgment-content">
        <img src={TestFail} alt="Test Failed" className="acknowledgment-image"/>
        <div className="acknowledgment-text1">
        Unfortunately, you’ve scored less than 70% and haven’t qualified
        </div>
        <p className="acknowledgment-subtext1">
        You can retake this test after 7 days
        </p>
        <button className="acknowledgment-btn" onClick={handleExit}>
          Close &nbsp;
          <svg style={{marginTop:'-5px'}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.334 14.1663L17.5007 9.99967L13.334 5.83301" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17.5 10H7.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </button>
      </div>
    </div>
  );
};

export default TestFailAcknowledgment;
