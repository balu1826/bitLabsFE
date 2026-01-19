import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation,Link } from 'react-router-dom';
import './css/ApplicantTakeTest.css';
import Alibaba from '../../images/ZumZum.png';
import TestExitPopup from './TestExitPopup';
import TestTimeUp from './TestTimeUp';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import TestPassAcknowledgment from './TestPassAcknowledgment';
import TestFailAcknowledgment from './TestFailAcknowledgment';
import axios from 'axios';


const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const ApplicantTakeTest = () => {
  const [currentPage, setCurrentPage] = useState('instructions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [remainingTime, setRemainingTime] = useState(3600);
  const [testStarted, setTestStarted] = useState(false);
  const [timer, setTimer] = useState(3600); // Assuming 1 hour (3600 seconds)
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState({ questions: [], duration: 0, numberOfQuestions: 0, topicsCovered: [] });
  const [acknowledgmentVisible, setAcknowledgmentVisible] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [showGoBackButton, setShowGoBackButton] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { testName } = location.state || {};
  const { user } = useUserContext();
  const userId = user.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violationDetected, setViolationDetected] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
    const [visitedQuestions, setVisitedQuestions] = useState({});
  const handleQuestionClick = (index) => {
  setVisitedQuestions(prev => ({ ...prev, [index]: true }));
  setCurrentQuestionIndex(index);
};
useEffect(() => {
  setVisitedQuestions(prev => ({
    ...prev,
    [currentQuestionIndex]: true
  }));
}, [currentQuestionIndex]);
 useEffect(() => {
 
const fetchQuestion = async() => {
    const jwtToken = localStorage.getItem('jwtToken');
    const response = await axios.get(`${apiUrl}/test/getTestByName/${testName}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const data = response.data;
        setQuestions(data);
        if(testName === 'General Aptitude Test'){
          setTimer(30* 60); // 60 minutes for General Aptitude Test
          setRemainingTime(30 * 60);
        }else{
          setTimer(30* 60);
          setRemainingTime(30 * 60);
        }
  }
  if(testName){
 
    fetchQuestion();
  }
 
  }, [testName])
 

  window.addEventListener('keydown', function (e) {
  if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault();
  }
  });
  useEffect(() => {
    // Shuffle the questions array when the component mounts
    const shuffled = shuffleArray(questions.questions);
    setShuffledQuestions(shuffled);
  }, [questions.questions]);
  

   const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Make the entire document full screen 

  const enterFullScreen = () => {
    const elem = document.documentElement; 
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      
      elem.msRequestFullscreen();
    }
    setIsFullScreen(true);
    setShowGoBackButton(false); 
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullScreen(false);
    setShowGoBackButton(true); // Show the "Go Back to Test" button when exiting full screen
  };

  const handleTestCompletion = () => {
    setIsTestCompleted(true);
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
       exitFullScreen();
   }
  };

  useEffect(() => {
    const onFullScreenChange = () => {
      if (!document.fullscreenElement && !isTestCompleted) {
        //setIsFullScreen(false);
        setShowGoBackButton(true); // Show the "Go Back to Test" button when user exits full screen
      } else {
        //setIsFullScreen(true);
        setShowGoBackButton(false); // Hide the button when full screen is active
      }
    };

    document.addEventListener('fullscreenchange', onFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
    };
  }, []);

  const handleGoBackToTest = () => {
    enterFullScreen();
    setViolationDetected(false);
    setShowGoBackButton(false); 
  };

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      handleTestInterruption(); // Handle the case when the user loses connection
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if(violationCount === 2){
       handleSubmitTest();
    }
  }, [violationCount]);

  useEffect(() => {
    const handleViolation = async (reason) => {
      if (!isTestCompleted && !violationDetected) {
        console.warn(`Violation detected: ${reason}`);
        setViolationDetected(true);
       if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        exitFullScreen();
    }
        setViolationCount(violationCount + 1);
      }
    };
 
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && testStarted && !isTestCompleted) {
        handleViolation('Exited fullscreen');
      }
    };
 
    const handleVisibilityChange = () => {
      if (document.hidden && testStarted && !isTestCompleted) {
        handleViolation('Tab switch or minimized');
      }
    };
 
    const handleWindowBlur = () => {
      if (testStarted && !isTestCompleted) {
        handleViolation('Window lost focus');
      }
    };
 
    const handleKeyDown = (e) => {
      if (
        testStarted &&
        !isTestCompleted &&
        !violationDetected &&
        (
          e.key === 'Meta' ||
          e.key === 'Alt' ||
          (e.ctrlKey && e.key === 'Tab') ||
          (e.altKey && e.key === 'Tab')
        )
      ) {
        handleViolation('Prohibited key press');
      }
    };
 
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
 
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [testStarted, isTestCompleted, violationDetected]);

  useEffect(() => {
    let interval;
    if (testStarted && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleTestCompletion();
            setShowGoBackButton(false);
            handleTimesUp();
            return 0; // Ensure the timer doesn't go below 0
          }
          return prevTime - 1; // Decrease by 1 second
        });
      }, 1000);
    }
    return () => clearInterval(interval); // Cleanup on unmount or test stop
  }, [testStarted, remainingTime]);

  const handleTestInterruption = () => {
      console.log("Test interrupted");
      setTestStarted(false);
      setCurrentPage('interrupted'); // Show a page or message indicating test interruption
      // Optionally save the current state or handle submission logic here
  };

  const startTest = () => {
    setCurrentPage('test');
    setTestStarted(true);
    enterFullScreen();
  };

  const handleNextQuestion = () => {

    setValidationMessage('');
    if (currentQuestionIndex < questions.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setValidationMessage('');
    }
  };


  const handleOptionChange = (event) => {
    const selectedOption = event.target.value;
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestionIndex]: selectedOption,
    });
  };

  

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.questions.forEach((question, index) => {
      if (selectedOptions[index] === question.answer) {
        correctAnswers += 1;
      }
    });
     const calculatedScore = (correctAnswers / questions.questions.length) * 100;
    setScore(calculatedScore);
    return calculatedScore;
  };

  
  const handleSubmitTest = async () => {
   
     if (isSubmitting) return;
  setIsSubmitting(true);
    setValidationMessage('');
  
    const calculatedScore = calculateScore();
    const testStatus = calculatedScore >= 70 ? 'P' : 'F';
    const jwtToken = localStorage.getItem('jwtToken');

    if (isOnline) {
    try {
    if(testName === 'General Aptitude Test' || testName === 'Technical Test'){
       // Submit the test result to the API
    fetch(`${apiUrl}/applicant1/saveTest/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testName,
        testScore: calculatedScore,
        testStatus,
        applicant: {
          id: userId,
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Test submitted successfully:', data);
      })
      .catch((error) => {
        console.error('Error submitting the test:', error);
      });
    }else{
      const skillBadgeStatus = calculatedScore >= 70 ? 'PASSED' : 'FAILED';
      // Submit the skill badge information to the API
  fetch(`${apiUrl}/skill-badges/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`, // Add jwtToken for authorization
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicantId: userId, // Use the applicant's ID
      skillBadgeName: testName, // Use the test name as the skill badge name
      status: skillBadgeStatus, // Use PASS or FAILED based on score
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Skill badge saved successfully:', data);
    })
    .catch((error) => {
      console.error('Error saving the skill badge:', error);
    });
    }

    // Update Zoho API
    const roundedScore = Math.round(calculatedScore);
    const zohoPayload = {
      data: [{
      Owner: { id: "4569859000019865042" },
      ...(testName === 'General Aptitude Test' && {
      GAT: testStatus === 'P' ? 'PASS' : 'FAIL',
      GAT_Score: roundedScore
      }),
      ...(testName === 'Technical Test' && {
      TT: testStatus === 'P' ? 'PASS' : 'FAIL',
      TT_Score: roundedScore
      }),
      }]
    };

    const zohoUserId = sessionStorage.getItem('zohoUserId');
    const response = await axios.put(`${apiUrl}/zoho/update/${zohoUserId}`, zohoPayload, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (response.status === 200 || response.status === 201) {
      console.log("Zoho API updated successfully", response.data);
    } else {
      console.error("Failed to update Zoho API", response.data);
    }
  } 
  catch (error) {
    if (!navigator.onLine || error.message === 'Failed to fetch') {
      setValidationMessage('Network error. Please check your connection and try again.');
      setCurrentPage('interrupted');
    }
    return;
  }
  }
    handleTestCompletion();
  setShowGoBackButton(false);
    // Show the acknowledgment popup based on the test result
    if (testStatus === 'P') {
     
      setCurrentPage('passAcknowledgment');
    } else {
      
      setCurrentPage('failAcknowledgment');
    }
  };
  

  const handleExit = () => {
    setShowExitPopup(true); // Show exit confirmation popup
  };

  const handleConfirmExit = () => {
    setShowExitPopup(false);
    if(testStarted && testName !== 'General Aptitude Test' && testName !== 'Technical Test'){
      handleTestCompletion();
    setShowGoBackButton(false);
      const jwtToken = localStorage.getItem('jwtToken');
      // Submit the skill badge information to the API
  fetch(`${apiUrl}/skill-badges/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`, // Add jwtToken for authorization
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicantId: userId, // Use the applicant's ID
      skillBadgeName: testName, // Use the test name as the skill badge name
      status: 'FAILED', // Use PASS or FAILED based on score
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Skill badge saved successfully:', data);
    })
    .catch((error) => {
      console.error('Error saving the skill badge:', error);
    });
    }
    else if (testStarted) { // Ensure test has started
      handleTestCompletion();
    setShowGoBackButton(false);
      const calculatedScore = 0; // Calculate the test score
      const testStatus = calculatedScore >= 70 ? 'P' : 'F'; // Determine pass/fail status
      const jwtToken = localStorage.getItem('jwtToken');
      // Submit the test result to the API
      fetch(`${apiUrl}/applicant1/saveTest/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testName,
          testScore: calculatedScore,
          testStatus,
          applicant: {
            id: userId,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Test result submitted successfully:', data);
        })
        .catch((error) => {
          console.error('Error submitting test result:', error);
        });
    }
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
  exitFullScreen();
}
    // Navigate to the next page after the API call
    navigate("/applicant-verified-badges");
  };
  

  const handleCancelExit = () => {
    setShowExitPopup(false); // Close the exit popup without navigating
  };

  const handleTimesUp = () => {
    setCurrentPage('timesup');
  };

  const handleTimesUpClose = () => {
    setCurrentPage(false);
  };

  const handleClosePopup = () => {
    setCurrentPage('instructions'); // Or navigate to a different page if needed
  };

  const handleTakeTest = (testName) => {
    setAcknowledgmentVisible(false); // Hide the acknowledgment component
    window.location.reload();
    navigate('/applicant-take-test', { state: { testName } }); // Then navigate to the test
  };

  const handleViewResults = () => {
  
    const calculatedScore = calculateScore();
    const testStatus = calculatedScore >= 70 ? 'P' : 'F';
    const jwtToken = localStorage.getItem('jwtToken');
    
    if(testStarted && testName !== 'General Aptitude Test' && testName !== 'Technical Test'){
      const jwtToken = localStorage.getItem('jwtToken');
      const testStatus = calculatedScore >= 70 ? 'PASSED' : 'FAILED';
      // Submit the skill badge information to the API
  fetch(`${apiUrl}/skill-badges/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`, // Add jwtToken for authorization
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicantId: userId, // Use the applicant's ID
      skillBadgeName: testName, // Use the test name as the skill badge name
      status: testStatus, // Use PASS or FAILED based on score
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Skill badge saved successfully:', data);
    })
    .catch((error) => {
      console.error('Error saving the skill badge:', error);
    });
    }
    else if (testStarted) { // Ensure test has started
      const calculatedScore = calculateScore(); // Calculate the test score
      const testStatus = calculatedScore >= 70 ? 'P' : 'F'; // Determine pass/fail status
      const jwtToken = localStorage.getItem('jwtToken');
      // Submit the test result to the API
      fetch(`${apiUrl}/applicant1/saveTest/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testName,
          testScore: calculatedScore,
          testStatus,
          applicant: {
            id: userId,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Test result submitted successfully:', data);
        })
        .catch((error) => {
          console.error('Error submitting test result:', error);
        });
    }
    // Show the acknowledgment popup based on the test result
    if (testStatus === 'P') {
      setCurrentPage('passAcknowledgment');
    } else {
      setCurrentPage('failAcknowledgment');
    }
  };

  return (
    <div className="test-container">
      {showExitPopup && (
  <TestExitPopup
    onConfirm={handleConfirmExit}
    onCancel={handleCancelExit}
    exitMessage={!testStarted ? undefined : "Exiting will erase your progress and prevent retaking the test for 7 days. Proceed?"}
  />
)}
      {currentPage === 'instructions' && (
        <div className="instructions-page">
          {/* <div style={{
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: "15px"
}}>
  <button
    className="exit-btn"
    onClick={handleExit}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "500",
      color: "#7F7F7F"
    }}
  >
    Exit
    <svg
      className='exit-svg'
      style={{ marginTop: '-3px' }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 25 25"
      fill="none"
    >
      <path d="M9.58398 21.5H5.58398C5.05355 21.5 4.54484 21.2893 4.16977 20.9142C3.7947 20.5391 3.58398 20.0304 3.58398 19.5V5.5C3.58398 4.96957 3.7947 4.46086 4.16977 4.08579C4.54484 3.71071 5.05355 3.5 5.58398 3.5H9.58398"
        stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M16.584 17.5L21.584 12.5L16.584 7.5"
        stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M21.584 12.5H9.58398"
        stroke="#7F7F7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  </button>
</div> */}
{/* <div style={{
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: "15px"
}}>
  <button
    onClick={handleExit}
    style={{
      width: "25px",
      height: "25px",
      borderRadius: "50%",
      background: "linear-gradient(0deg, #E3E3E3 0%, #FFFFFF 100%)",
      // border: "1px solid #E0E0E0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      padding: 0
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </button>
</div> */}


          <div className="instructions-header">
            
            <div style={{ marginLeft: '2%' }}>
  <h2
    className="text-name"
    style={{
      textAlign: 'center',
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px'
    }}
  >
    {testName} exam summary
  </h2>

          <div style={{ display: "flex", gap: "20px" }}>
  {/* Duration Card */}
  <div
    style={{
      width: "160px",
      height: "150px",
      background: "#fff",
      borderRadius: "10px",
      border: "1px solid #E0E0E0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
    }}
  >
      <span className="duration-text" style={{ fontSize: "26px", fontWeight: "600", marginTop: "30px" }}>
      {questions.duration}
    </span>

    <span
      style={{
        width: "100%",
        textAlign: "center",
        fontSize: "16px",
        padding: "8px 0",
        color: "#fff",
        background: "linear-gradient(281deg, #FBBB5C 0%, #E66A0E 100%)",
      }}
    >
      Duration
    </span>
                </div>

  {/* Questions Card */}
  <div
    style={{
      width: "160px",
      height: "150px",
      background: "#fff",
      borderRadius: "10px",
      border: "1px solid #E0E0E0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
    }}
  >
      <span className="duration-text" style={{ fontSize: "26px", fontWeight: "600", marginTop: "30px" }}>
      {questions.numberOfQuestions}
    </span>

    <span
      style={{
        width: "100%",
        textAlign: "center",
        fontSize: "16px",
        padding: "8px 0",
        color: "#fff",
        background: "linear-gradient(281deg, #FBBB5C 0%, #E66A0E 100%)",
      }}
    >
      Questions
    </span>
              </div>

    {/* Topics Covered */}
              <div
                style={{
        background: "#ffffff",
        borderRadius: "10px",
        border: "1px solid #E0E0E0",
        padding: "15px",
        width: "200px",
        fontFamily: "Plus Jakarta Sans",
      }}
    >
      <span style={{ fontSize: "18px", fontWeight: "600", color: "#000" }}>
        Topics covered
      </span>

      <ul style={{ marginTop: "10px", paddingLeft: "18px" }}>
        {questions.topicsCovered.map((topic, index) => (
          <li
            key={index}
            style={{
              fontSize: "14px",
              fontWeight: "400",
              color: "#696969",
              marginBottom: "6px",
            }}
          >
            {topic}
          </li>
        ))}
      </ul>
              </div>
            </div>
</div>

          </div>
          <br />
          <div className="instructions" style={{ paddingLeft: '2%',backgroundColor:'#F8F8F8',padding:'10px',maxHeight: '270px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
            <span className="instructions-title">Instructions</span>
            <ul className="instructions-list">
              <li>You need to score at least 70% to pass the exam.</li>
              <li>Once started, the test cannot be paused or reattempted during the same session.</li>
              <li>Do not refresh the page during the test.</li>
              <li>If you score below 70%, you can retake the exam after 7 days.</li>
              <li>Ensure all questions are answered before submitting, as your first submission will be final.</li>
              <li>All the questions are mandatory.</li>
              <li>Please complete the test independently. External help is prohibited.</li>
              <li>
              Make sure your device is fully charged and has a stable internet connection before starting the test.
              </li>
              <li>
              To avoid interruptions, take the test on a PC, as calls may disrupt it on mobile.
              </li>
              <li>
              Any attempt to switch tabs, change windows, or engage in suspicious activity will result in automatic test submission.
              </li>
            </ul>
          </div>
     <div 
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    gap: "12px",
    marginTop: "20px"
  }}
>
  {/* Start Button */}
  <button
    onClick={startTest}
    style={{
      background: "linear-gradient(286deg, #FBBB5C 0%, #E66A0E 100%)",
      color: "#fff",
      padding: "10px 40px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    Start
  </button>

  {/* Exit Button */}
  <button
    onClick={handleExit}
    style={{
      background: "#fff",
      color: "#E66A0E",
      padding: "10px 40px",
      border: "2px solid #E66A0E",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    Exit
  </button>
</div>


        </div>
      )}

      {/* ====== Test Header (Logo + Title) ====== */}

{currentPage === 'test' && (
<div className={`test-page ${showGoBackButton ? 'blur-background' : ''}`}>
 
    {/* ================= Close Button (Top-Right) ================= */}
<div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "15px",
        paddingRight: "10px",
        marginTop: "10px",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
>
<button
        onClick={handleExit}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "linear-gradient(0deg, #E3E3E3 0%, #FFFFFF 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          border: "none",
          boxShadow: "0px 0px 4px rgba(0,0,0,0.1)",
          padding: 0,
        }}
>
<svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
>
<path
            d="M18 6L6 18M6 6L18 18"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
          />
</svg>
</button>
</div>
    {/* ============================================================ */}
 
 
    <img
      src={Alibaba}
      alt="bitLabs Logo"
      className="Alibaba"
      style={{
        width: "160px",
        height: "60px",
        objectFit: "contain",
      }}
    />
 
    <h2
      className="exam-title"
      style={{
        left: "140px",
        width: "258px",
        height: "45px",
        textAlign: "left",
        fontFamily: "Poppins",
        fontWeight: 600,
        fontSize: "25px",
        lineHeight: "48px",
        letterSpacing: "0px",
        color: "#EF8C2F",
        opacity: 1,
      }}
>
      {testName}
</h2>
 
    <div className="test-content">
 
      {/* ================= Left Section ================= */}
<div className="test-left">
<div className="header">
<div>
<h4
              className="test-sub"
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
>
              Question {currentQuestionIndex + 1}/{questions.numberOfQuestions}
</h4>
 
            {/* Progress Bar */}
<div className="progress-bar-container">
<div
                className="progress-bar-fill"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.numberOfQuestions) * 100}%`,
                }}
></div>
</div>
</div>
</div>
 
        {/* Question Section */}
<div className="question no-select" style={{ marginTop: "25px" }}>
<ul>
<li>
<p
                className="question1 no-select"
                style={{ fontSize: "16px", fontWeight: "500" }}
>
                {currentQuestionIndex + 1}.&nbsp;
<span
                  dangerouslySetInnerHTML={{
                    __html: shuffledQuestions[currentQuestionIndex]?.question
                      .replace(/\n/g, "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
                      .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
                      .replace(/```/g, ""),
                  }}
                />
</p>
</li>
 
            {shuffledQuestions[currentQuestionIndex]?.options.map((option, index) => (
<li key={index}>
<label className="question-label no-select">
<input
                    type="radio"
                    value={option}
                    checked={selectedOptions[currentQuestionIndex] === option}
                    onChange={handleOptionChange}
                    className="question-radio"
                  />
<span
                    className="no-select"
                    dangerouslySetInnerHTML={{
                      __html: option.replace(/\n/g, "<br/>").replace(/```/g, ""),
                    }}
                  />
</label>
</li>
            ))}
 
            {validationMessage && (
<p className="validation">{validationMessage}</p>
            )}
</ul>
</div>
 
        {/* Navigation Buttons */}
<div className="footer1">
<button
            disabled={currentQuestionIndex === 0}
            onClick={handleBackQuestion}
            className="second-btn"
>
            Previous
</button>
 
          {currentQuestionIndex < questions.questions.length - 1 ? (
<button onClick={handleNextQuestion} className="navigation-btn">
              Next
</button>
          ) : (
<button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="navigation-btn"
>
              Submit exam
</button>
          )}
</div>
</div>
 
      {/* ================= Right Section ================= */}
<div className="test-right">
 
        {/* Timer Section */}
<div className="timer-box">
<h4 className="timer-title">Time durations</h4>
<div className="timer-digits">
<div>
<span className="time-num">
                {String(Math.floor(remainingTime / 3600)).padStart(2, "0")}
</span>
<p>Hrs</p>
</div>
<div>
<span className="time-num">
                {String(Math.floor((remainingTime % 3600) / 60)).padStart(2, "0")}
</span>
<p>Mins</p>
</div>
<div>
<span className="time-num">
                {String(remainingTime % 60).padStart(2, "0")}
</span>
<p>Secs</p>
</div>
</div>
<div className="divider-line"></div>
</div>
 
        {/* Question Tracker Section */}
<div className="questions-box">
<h4 className="questions-title">Questions</h4>
 
          <div className="question-grid">
            {questions.questions.map((_, index) => {
              const isCurrent = index === currentQuestionIndex;
              const isAnswered = !!selectedOptions[index];
               const isVisited = visitedQuestions[index]; // only true if clicked
              const isNotAnswered = isVisited && !isAnswered && !isCurrent;
              return (
<div
                  key={index}
                  onClick={() =>  handleQuestionClick(index)}
                  className={`question-indicator 
                    ${isCurrent ? "current" : ""}
                    ${isAnswered ? "answered" : ""}
                    ${isNotAnswered ? "not-answered" : ""}
                  `}
>
                  {String(index + 1).padStart(2, "0")}
</div>
              );
            })}
</div>
 
<div className="question-legend">
  <div>
    <span className="legend-box not-attempted"></span>Not visited
  </div>
  <div>
    <span className="legend-box answered"></span>Answered
  </div>
  <div>
    <span className="legend-box not-answered"></span>Visited
  </div>
  <div>
    <span className="legend-box current"></span>Current
  </div>
</div>
</div>
</div>
</div>
</div>
)}




     {currentPage === 'passAcknowledgment' && (
        <TestPassAcknowledgment onClose={handleClosePopup} score={score} testName={testName}  handleTakeTest={handleTakeTest} setTestStarted={setTestStarted}/>
      )}
      {currentPage === 'failAcknowledgment' && (
        <TestFailAcknowledgment onClose={handleClosePopup} setTestStarted={setTestStarted} setShowGoBackButton={setShowGoBackButton} />
      )}


     {currentPage === 'timesup' && (
        <TestTimeUp onViewResults={handleViewResults} onCancel={handleViewResults} />
      )}
      {violationDetected && !isTestCompleted && (
    <div className="go-back-button-overlay">
      <p>
        <strong>
          {isSubmitting
            ? 'This test has been terminated and submitted automatically due to repeated exam violations.'
            : 'Shortcuts are not allowed during the test. If any such action is detected again, your test will be automatically submitted.'}
        </strong>
      </p>
      <br />
      <button className="exit-popup-btn exit-popup-confirm-btn"
        onClick={!isSubmitting ? handleGoBackToTest : undefined}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting' : 'Go Back to Test'}
      </button>
    </div>
)}

{currentPage === 'interrupted' && (
  <div className="go-back-button-overlay">
    <p>Your test has been interrupted. Kindly try again later.</p>
    <br />
  </div>
)}

      {currentPage === 'exitConfirmed' && (
        <div className="exit-confirmation">
          <p>You can retake the test in 7 days.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicantTakeTest;