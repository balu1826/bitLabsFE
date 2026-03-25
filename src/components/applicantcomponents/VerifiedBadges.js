import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import './VerifiedBadges.css';
import Taketest from '../../images/user/avatar/Taketest.png';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import javaPNG from '../../images/Icons1/Icons/Java.svg';
import htmlPNG from '../../images/Icons1/Icons/HTML.svg';
import cssPNG from '../../images/Icons1/Icons/CSS.svg';
import mysqlPNG from '../../images/Icons1/Icons/MySQL.svg';
import angularPNG from '../../images/Icons1/Icons/Angular.svg';
import reactPNG from '../../images/Icons1/Icons/React.svg';
import manualTestingPNG from '../../images/Icons1/Icons/Manual Testing.svg';
import sqlPNG from '../../images/Icons1/Icons/SQL.svg';
import jspPNG from '../../images/Icons1/Icons/JSP.svg';
import cPlusPlusPNG from '../../images/Icons1/Icons/CPlusPlus.svg';
import paythonPNG from '../../images/Icons1/Icons/Python.svg';
import regressionPNG from '../../images/Icons1/Icons/Regression Testing.svg';
import hibernatePNG from '../../images/Icons1/Icons/Hibernate.svg';
import netPNG from '../../images/Icons1/Icons/Dot Net.svg';
import servletsPNG from '../../images/Icons1/Icons/Servlets.svg';
import typeScriptPNG from '../../images/Icons1/Icons/TypeScript.svg';
import cSharpPNG from '../../images/Icons1/Icons/C Sharp.svg';
import cPNG from '../../images/Icons1/Icons/C.svg';
import seleniumPNG from '../../images/Icons1/Icons/Selenium.svg';
import javaScriptPNG from '../../images/Icons1/Icons/JavaScript.svg';
import springPNG from '../../images/Icons1/Icons/Spring.svg';
import springBootPNG from '../../images/Icons1/Icons/Spring Boot.svg';
import vuePNG from '../../images/Icons1/Icons/Vue.svg';
import mongodbPNG from '../../images/Icons1/Icons/Mongo DB.svg';
import sqlServerPNG from '../../images/Icons1/Icons/SQL-Server.svg';
import djangoPNG from '../../images/Icons1/Icons/Django.svg';
import flaskPNG from '../../images/Icons1/Icons/Flask.png';
import { useNavigate, useLocation } from 'react-router-dom';
import aptitudeIcon from '../../images/user/avatar/problem-solve.png';
import technicalIcon from '../../images/user/avatar/coding.png';
import verificationIcon from "../../images/user/avatar/verificationdone.png";



const isLargeScreen = typeof window !== "undefined" && window.innerWidth > 1400;

export const SkillBadgeCard = ({ skillName, status, badgeIcon, retakeTest, testFailedAt }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isRetakeAvailable, setIsRetakeAvailable] = useState(false);
  const navigate = useNavigate();
 
    // Map skill names to images
    const skillImages = {
      'JAVA': javaPNG,
      'HTML': htmlPNG,
      'CSS': cssPNG,
      'Python': paythonPNG,
      'MySQL' : mysqlPNG,
      'Angular' : angularPNG,
      'React' : reactPNG,
      'Manual Testing' : manualTestingPNG,
      "SQL" : sqlPNG,
      "JSP" : jspPNG,
      "C++" : cPlusPlusPNG,
      "Regression Testing" : regressionPNG,
      "Hibernate" : hibernatePNG,
      ".Net" : netPNG,
      "Servlets" : servletsPNG,
      "TypeScript" : typeScriptPNG,
      "C Sharp" : cSharpPNG,
      "C" : cPNG,
      "Selenium" : seleniumPNG,
      "JavaScript" : javaScriptPNG,
      "Spring" : springPNG,
      "Spring Boot" : springBootPNG,
      "Vue" : vuePNG,
      "Mongo DB" : mongodbPNG,
      "SQL-Server" : sqlServerPNG,
      "Django" : djangoPNG,
      "Flask" : flaskPNG,
      // Add other skills here...
    };
  
    // Get the image based on skill name, default to javaPNG if not found
    const skillImage = skillImages[skillName] || javaPNG;

  useEffect(() => {
    if (status === 'FAILED') {
       // Convert `testFailedAt` to Date object, which is when the test failed
       
      // const testFailedAt = [2024, 8, 20, 17, 32, 22];  // Exclude milliseconds
      // Create a Date object by using the array elements
  const failedDate = new Date(
    testFailedAt[0], // year
    testFailedAt[1] - 1, // month (JavaScript Date is 0-based for months)
    testFailedAt[2], // day
    testFailedAt[3], // hour
    testFailedAt[4], // minute
    testFailedAt[5] // second
    
  );
      
      // Calculate the total 7 days (or 168 hours) from the failure time
      const futureTime = new Date(failedDate.getTime() + 7 * 24 * 60 * 60 * 1000 + (5 * 60 * 60 * 1000) + (30 * 60 * 1000));



      const calculateTimeLeft = () => {
        const currentTime = new Date();
        const difference = futureTime - currentTime;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
      
          return { days, hours, minutes };
        } else {
          setIsRetakeAvailable(true);
          return null;
        }
      };

      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        if (newTimeLeft) {
          setTimeLeft(newTimeLeft);
        }
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [status]);

  const handleTakeTest = (testName) => {

    navigate('/applicant-take-test', { state: { testName } });
  };

  return (
    <div className={`skill-badge-card ${status === 'PASSED' ? 'passed' : status === 'FAILED' ? 'failed' : ''}`}>
      {/* Top Section: Status */}
      {/* <div className="status">
        <span className={status ? (status === 'PASSED' ? 'status-text status-passed' : 'status-text status-failed') : 'status-empty'}>
          &nbsp;&nbsp;{status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'empty'}&nbsp;&nbsp;
        </span>
      </div> */}

      {/* Second Section: Badge */}
      <div className="badge">
        <img src={skillImage} alt={skillName} className="skill-image" />
        <span className="skill-name">{skillName}</span>
      </div>

      {/* Third Section: Actions */}
      <div className="test">
        {status === 'FAILED' && (
          <div className="test-action retake" onClick={isRetakeAvailable ? () => handleTakeTest(skillName) : null}
          style={{
            backgroundColor: isRetakeAvailable ? 'black' : '#e0e0e0', // Red background if retake is available, grey otherwise
            color: isRetakeAvailable ? '#ffffff' : '#000000', // White text if retake is available, black otherwise
            cursor: isRetakeAvailable ? 'pointer' : 'not-allowed', // Pointer cursor if retake is available
            padding: '20px', // Adjust padding as needed
            borderRadius: '0px', // Rounded corners
            textAlign: 'center' // Center text
          }}
          >
            {isRetakeAvailable ? (
                <>
                Retake Test
                {/* <i className="fa fa-external-link" aria-hidden="true" style={{ marginLeft: '10px' }}></i> */}
              </>
            ) : (
              <>
              
              <div style={{ marginTop: '-20px', textAlign: 'center', lineHeight: '1.4' }}>
  <p style={{ margin: 0 }}>
    Retake test after
  </p>
  <p style={{ margin: 0, fontWeight: '600', color: '#F46F16' }}>
    {timeLeft.days > 0 && `${timeLeft.days}d `}
    {timeLeft.hours > 0 && `${timeLeft.hours}h `}
    {timeLeft.minutes !== undefined && `${timeLeft.minutes}m`}
  </p>
</div>

            </>
            

            )}
          </div>
        )}
        {status === 'PASSED' && (
          <div className="test-action verified" onClick={retakeTest}>
            <span className="tick-mark">✔&nbsp;Verified</span>
          </div>
        )}
        {!status && (
          <div className="test-action take" style={{textAlign:'center'}}onClick={() => handleTakeTest(skillName)}>
            Start test
          </div>
        )}
      </div>
    </div>
  );
};
const SkillBadgeSkeleton = () => {
  return (
    <div className="skill-badge-card skeleton-card">

      {/* ICON + SKILL NAME */}
      <div className="badge" style={{ alignItems: "center" }}>
        <div className="skeleton-icon"></div>
        <div className="skeleton-text"></div>
      </div>

      {/* BUTTON */}
      <div className="test">
        <div className="skeleton-button"></div>
      </div>

    </div>
  );
};

const VerifiedBadges = () => {
  const [isHovered, setIsHovered] = useState(false); 
  const [currentStep, setCurrentStep] = useState(1); 
  const [hideSteps, setHideSteps] = useState(false); // New state variable
  const [isMobile, setIsMobile] = useState(window.innerWidth < 767);
  const [skillBadges, setSkillBadges] = useState({ skillsRequired: [], applicantSkillBadges: [] }); // Initialize with default values

  
  
 
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 767);
  const isSmallScreen1 = window.innerWidth < 767;
  const [testData, setTestData] = useState(null); 
  const { user } = useUserContext();
  const userId = user.id;
  const [timer, setTimer] = useState(null);
  const [isDisabled, setIsDisabled] = useState(!timer);
  const [isTimerComplete, setIsTimerComplete] = useState(false); // Track if the timer has completed
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
    
        const newData = {
          identifier: response.data.applicant.email,
          password: response.data.applicant.password,
          localResume: response.data.applicant.localResume,
          firstName: response.data.basicDetails != null && response.data.basicDetails.firstName != null ? response.data.basicDetails.firstName : ""
        };
  
        // Store newData in local storage
        localStorage.setItem('userData', JSON.stringify(newData));
  
        setUserData(newData);
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
    };
  
    fetchUserData();
  }, []);
const CongratulationsLoader = () => (
  <div
    style={{
      backgroundColor: "#F9FAFB", // light grey card
      padding: "32px 24px",
      borderRadius: "14px",
      width: "100%",
      minHeight: "160px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "14px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}
  >
    {/* Medal placeholder */}
    <div
      className="skeleton"
      style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
      }}
    />

    {/* Title placeholder */}
    <div
      className="skeleton"
      style={{
        width: "240px",
        height: "26px",
        borderRadius: "8px",
      }}
    />

    {/* Description placeholder */}
    <div
      className="skeleton"
      style={{
        width: "520px",
        maxWidth: "90%",
        height: "18px",
        borderRadius: "6px",
      }}
    />
  </div>
);



  useEffect(() => {
    // if (!testData) return;
    const fetchTestData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicant1/tests/${user.id}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setTestData(response.data);  // Use setTestData here
         setVerificationLoading(false);
      } catch (error) {
        console.error('Error fetching test data:', error);
          setVerificationLoading(false);
      }
    };

    setTimeout(() => {
    fetchTestData();
    }, 500);
  }, [user.id]);

  useEffect(() => {
    const fetchSkillBadges = async () => {
      try {
        // Assuming JWT token is stored in localStorage
        const jwtToken = localStorage.getItem('jwtToken'); // Retrieve from localStorage
        console.log(jwtToken);

        const skillBadgesResponse = await axios.get(`${apiUrl}/skill-badges/${userId}/skill-badges`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Pass the JWT token in headers
          },
        });

        const skillBadgeData = skillBadgesResponse.data;
        setSkillBadges(skillBadgeData); // Update state with the fetched data
        // setSkillsRequired(skillBadgeData.skillsRequired);
        // setApplicantSkillBadges(skillBadgeData.applicantSkillBadges);
        if(skillBadgeData){
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching skill badges:', error);
      } 
    };

   setTimeout(() => {
    fetchSkillBadges();
    }, 500);
  }, [userId]);
const [aptitudeScore, setAptitudeScore] = useState(0);
const [technicalScore, setTechnicalScore] = useState(0);
const [passedBothTests, setPassedBothTests] = useState(false);

 useEffect(() => {
  if (!testData) return;

  const aptitudeTest = testData.find(test =>
    test.testName.toLowerCase().includes("aptitude")
  );

  const technicalTest = testData.find(test =>
    test.testName.toLowerCase().includes("technical")
  );

  // Store scores
  setAptitudeScore(aptitudeTest ? aptitudeTest.testScore : 0);
  setTechnicalScore(technicalTest ? technicalTest.testScore : 0);

  // ---------------------------------------------------
  // ✅ NEW CONDITION: If both tests passed (P) OR score ≥ 60
  // ---------------------------------------------------
  // NEW CONDITION — both tests passed or score >= 60
const bothPassed =
  aptitudeTest &&
  technicalTest &&
  (aptitudeTest.testStatus.toLowerCase() === "p" ||
    aptitudeTest.testScore >= 60) &&
  (technicalTest.testStatus.toLowerCase() === "p" ||
    technicalTest.testScore >= 60);

// UPDATE STATE
setPassedBothTests(bothPassed);

if (bothPassed) {
  setCurrentStep(3);
  setHideSteps(true);
  setTimer(null);
  setIsDisabled(false);
  return;
}
  // ---------------------------------------------------

  // --------- APTITUDE FAILED ----------
  if (aptitudeTest && aptitudeTest.testStatus.toLowerCase() === "f") {
    setCurrentStep(1);
    setHideSteps(false);

    const testDateTime = new Date(
      aptitudeTest.testDateTime[0],
      aptitudeTest.testDateTime[1] - 1,
      aptitudeTest.testDateTime[2],
      aptitudeTest.testDateTime[3],
      aptitudeTest.testDateTime[4],
      aptitudeTest.testDateTime[5]
    );

    const retakeDate = new Date(testDateTime);
    retakeDate.setDate(retakeDate.getDate() + 7);
    retakeDate.setHours(retakeDate.getHours() + 5);
    retakeDate.setMinutes(retakeDate.getMinutes() + 30);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = retakeDate - now;

      if (diff > 0) {
        setTimer({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
        setIsTimerComplete(false);
      } else {
        setTimer(null);
        setIsTimerComplete(true);
        setIsDisabled(false);
      }
    };

    calculateTimeLeft();
    const timerInterval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timerInterval);
  }

  // --------- APTITUDE PASSED ----------
  if (aptitudeTest && aptitudeTest.testStatus.toLowerCase() === "p") {
    // FIRST TIME → technical not taken yet
    if (!technicalTest || !technicalTest.testStatus) {
      setCurrentStep(2);
      setHideSteps(false);
      setTimer(null);
      setIsDisabled(false);
      return;
    }

    // ---------- TECHNICAL FAILED ----------
    if (technicalTest.testStatus.toLowerCase() === "f") {
      setCurrentStep(2);
      setHideSteps(false);

      const testDateTime = new Date(
        technicalTest.testDateTime[0],
        technicalTest.testDateTime[1] - 1,
        technicalTest.testDateTime[2],
        technicalTest.testDateTime[3],
        technicalTest.testDateTime[4],
        technicalTest.testDateTime[5]
      );

      const retakeDate = new Date(testDateTime);
      retakeDate.setDate(retakeDate.getDate() + 7);
      retakeDate.setHours(retakeDate.getHours() + 5);
      retakeDate.setMinutes(retakeDate.getMinutes() + 30);

      const calculateTimeLeft = () => {
        const now = new Date();
        const diff = retakeDate - now;

        if (diff > 0) {
          setTimer({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          });
          setIsTimerComplete(false);
        } else {
          setTimer(null);
          setIsTimerComplete(true);
          setIsDisabled(false);
        }
      };

      calculateTimeLeft();
      const timerInterval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timerInterval);
    }
  }

  // DEFAULT
  setCurrentStep(1);
  setHideSteps(false);
  setTimer(null);
  setIsDisabled(false);
}, [testData]);

  
  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
      setIsSmallScreen(window.innerWidth < 767);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const getWidthStyle = () => {
    if (screenSize < 430) {
      return 'clamp(30px, 23vw, 200px)'; // Small screens
    } else if (screenSize < 767) {
      return 'clamp(30px, 25vw, 250px)'; // Medium screens
    } else {
      return 'clamp(30px, 12vw, 300px)'; // Large screens
    }
  };

 

  

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 780);
    };

    // Initialize the state on component mount
    handleResize();

    // Add event listener for resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  

  const buttonStyle = () => ({
    backgroundColor: isDisabled ? "#DDDDDD" : "#F46F16", // Grey when disabled, orange when active
    color: isDisabled ? "#6c757d" : "#ffffff", // Text color based on active state
    padding: '1px 10px',
    borderRadius: '5px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '15px',
    width: 'clamp(100px, 20vw, 120px)',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    cursor: isDisabled ? 'not-allowed' : 'pointer', // Show not-allowed cursor when disabled
    position: 'relative', // Needed for the overlay to position correctly
    height: 'clamp(40px, 6vw, 40px)', 
  });
 


 // Update button state based on the presence of the timer and current step
 useEffect(() => {
  console.log(`currentStep: ${currentStep}, timer: ${timer}`); // Debugging statement
  if (timer) {
    if (currentStep === 1 || currentStep === 2) {
      console.log("Timer present, disabling button"); // Debugging statement
      setIsDisabled(true); // Set button to be disabled (grey) when timer is present
    } else {
      console.log("No timer or not in step 1 or 2, enabling button"); // Debugging statement
      setIsDisabled(false); // Otherwise, keep button active (orange)
    }
  } else {
    console.log("No timer, enabling button"); // Debugging statement
    setIsDisabled(false); // No timer, so keep button active (orange)
  }
}, [currentStep, timer]);



  const spanStyle = {
   fontSize: 'clamp(12px, 2vw, 17px)',
    color: '#FFFFFF',
    justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  
  
  };

const steps = [
  { id: 1, label: "General Aptitude Test", icon: aptitudeIcon},
  { id: 2, label: "Technical Test", icon: technicalIcon },
  { id: 3, label: "Verification Done", icon: verificationIcon },
];

 

  const stepContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", 
    width: "100%", 
    // border:"2px solid red",
    marginTop: "10px",
    
  };

  const stepStyle = (stepId) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    color: stepId <= currentStep ? "green" : "#ccc",
    fontWeight: stepId <= currentStep ? "bold" : "normal",
    textAlign: "center",
  });

  const circleStyle = (stepId) => ({
    width: "30px", 
    height: "30px",
    borderRadius: "50%",
    backgroundColor: stepId <= currentStep ? "green" : "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    position: "relative", 
    zIndex: 2, 
    
  });

  const svgStyle1 = {
    width: "20px",
    marginRight: "-2px",
  };


  const [screenSize, setScreenSize] = useState(window.innerWidth);

  const lineStyle = (stepId) => ({
    height: "3px",
    width: getWidthStyle(),
    backgroundColor: stepId < currentStep ? "green" : "#ccc",
    margin: "0 -5px", // Overlap the line with the circle
    position: "relative", // Ensure the line is positioned
    zIndex: 1, // Lower z-index to be behind the circle
  });

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // const isMobile = screenWidth < 555;
  const isBelow767px = screenWidth < 767;

  const [isImageVisible, setIsImageVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsImageVisible(window.innerWidth >= 500);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const styles = {
    cardContainer: {
      backgroundColor: '#FFF9ED', // Light cream background
      padding: '25px',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: isMobile ? 'column-reverse' : 'row', // Stack image on top of text on mobile
      justifyContent: 'space-between', // Center items horizontally
      alignItems: 'center',
      width: '100%', // 80% of the parent container width
      
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)', // Light shadow for depth
      marginLeft: isBelow767px ? '6px' : '0', // Add margin-left below 767px
      marginBottom:'10px'    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMobile ? 'center' : 'flex-start', // Center items horizontally on mobile
      textAlign: isMobile ? 'center' : 'left', // Center text alignment on mobile
    },
    message: {
      color: '#F67505', // Orange color
      fontSize: '16px',
      marginBottom: '10px',
      marginTop: '-2px',
      fontWeight:'600',
      fontfamily: 'Plus Jakarta Sans',
      fontstyle:'normal'
    },
    nameContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start', // Center items horizontally on mobile
      marginTop: isMobile ? '5px' : '0', // Add margin-top on mobile if needed
    },
    name: {
      fontSize: 'clamp(17.2px, 4vw, 24px)',
      fontWeight: 'bold',
      color: '#333',
      marginRight: '8px',
      marginLeft: '5px', // Adjust space between the last letter and the SVG
      verticalAlign: 'middle', // Ensures the icon aligns vertically
      },
      lastLetterWrapper: {
        display: 'inline-flex', // Keeps the SVG and last letter together
        alignItems: 'center',   // Vertically aligns the last letter and the icon
      },
    icon: {
      color: '#F46F16', // Orange color for the checkmark icon
      fontSize: '24px',
    },
    image: {
      width: '71px',
      height: 'auto',
      objectFit: 'contain',
      marginTop: '10px',
      display: isImageVisible ? 'block' : 'none', // Conditionally hide image
    },
   
  };

  const handleTakeTest = (testName) => {

    navigate('/applicant-take-test', { state: { testName } });
  };

  const handleRetakeTest = () => {

  }
  return (
       (
          <div className="border-style">

      <div className="blur-border-style"></div>
    <div className="dashboard__content">
      <div className="row mr-0 ml-0">
        <div className="col-lg-12 col-md-12" style={{paddingRight :"0px"}}>
          <section className="">
            <div className="themes-container">
              <div className="row ">
                <div className="col-lg-12 col-md-12 " >
                  <div className="title-dashboard" style={{backgroundColor:''}}>
                    <div
  className="title-dash flex2"
  style={{
    font: '20px / 28px "Plus Jakarta Sans", sans-serif',
    fontWeight: 700
  }}
>
  Skill Validation
</div>

                    {/* <h3 style={{ marginTop: '50px', marginBottom: '10px' }}></h3> */}
  <div style={{ marginTop: "10px", width: "100%" }}>
  
  {/* 👇 CONDITION: if both tests passed, show ONLY congratulations card */}
  {verificationLoading ? (
  <CongratulationsLoader />
) :passedBothTests ? (
    <div
      style={{
        backgroundColor: "#FFF9ED",
        padding: "25px",
        borderRadius: "12px",
        textAlign: "center",
        marginTop: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        width: "100%",
      }}
    >
      <img
        src={verificationIcon}
        alt="Verified"
        style={{ width: "100px",height:"auto", marginBottom: "15px" }}
      />

      <h2
  style={{
    color: "#F46F16",
    fontWeight: "700",
    marginBottom: "5px",
    fontSize: "clamp(18px, 5vw, 32px)", // ⭐ RESPONSIVE FONT SIZE
    lineHeight: "1.2"
  }}
>
   Congratulations!
</h2>

      <p style={{ color: "#333", fontSize: "18px", margin: 0 }}>
        You have successfully passed the Aptitude and Technical tests. Your profile is now verified.
      </p>
    </div>
  ) : (
    <>
      {/* 👇 SHOW STEPPER ONLY WHEN NOT PASSED */}
      {!hideSteps && (
        <div
          style={{
            width: "100%",
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow:" 0px 0px 20px #F7AA4B80"
            // marginLeft: "-20px",
            
          }}
        >
          <div className='scrollercontainer' style={{ overflowX: "auto" ,}}>
          {/* -------- PROGRESS STEPPER -------- */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              position: "relative",
              padding: "0 5vw",
              minWidth:"600px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "900px",
                position: "relative",
                alignItems: "center",
              }}
            >
              {/* LEFT SOLID LINE */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "5%",
                  width: "calc((100% - 10%) / 2)",
                  height: "3px",
                  backgroundColor:
                    currentStep >= 2 ? "#E66A0E" : "#e0e0e0",
                  zIndex: 1,
                  transition: "0.3s ease",
                }}
              />

              {/* RIGHT DASHED LINE */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "5%",
                  width: "calc((100% - 10%) / 2)",
                  height: "0px",
                  borderTop:
                    currentStep === 3
                      ? "3px solid #E66A0E"
                      : "3px dashed #bdbdbd",
                  zIndex: 1,
                  transition: "0.3s ease",
                }}
              />

              {/* CIRCLES */}
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                const activeColor = "#E66A0E";
                const inactiveColor = "#bdbdbd";

                return (
                  <div
                    key={step.id}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor:
                        step.id <= currentStep ? activeColor : "#fff",
                      border: `3px solid ${
                        step.id <= currentStep ? activeColor : inactiveColor
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "16px",
                      color:
                        step.id <= currentStep ? "#fff" : inactiveColor,
                      zIndex: 3,
                    }}
                  >
                    {/* FLAG ICON FOR LAST STEP */}
                    {isLast ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill={
                          step.id <= currentStep ? "#fff" : "#bdbdbd"
                        }
                        style={{
                          display: "block",
                        }}
                      >
                        <path
                          d="M5 2.5V17.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M5 3L14 3.5L11.5 7L14 10.5L5 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : step.id < currentStep ? (
                      "✓"
                    ) : (
                      step.id
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* -------- STEP CARDS -------- */}
        <div
  style={{
    display: "flex",
    justifyContent: isLargeScreen ? "space-between" : "space-between", // ⭐ CHANGED FOR LARGE SCREEN
    alignItems: "flex-start",
    width: "100%",
    marginTop: "10px",
    // overflowX: "auto",
    whiteSpace: "nowrap",
    paddingBottom: "10px",
    gap: "25px",

    ...(isLargeScreen && {
      maxWidth: "1030px",     // ⭐ LIMIT WIDTH ONLY ON LARGE SCREEN
      marginLeft: "auto",
      marginRight: "auto",
    }),
  }}
>
            {steps.map((step) => (
              <div
                key={step.id}
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "clamp(180px, 22vw, 260px)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "85%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "clamp(150px, 22vw, 200px)",
                    padding: "20px 0 0 0",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #eaeaea",
                  }}
                >
                  <img
                    src={step.icon}
                    alt={step.label}
                    style={{
                      width: step.id === 3 ? "32%" : "40%",
                      objectFit: "contain",
                    }}
                  />

                  <div style={{ width: "100%", marginTop: "auto" }}>
                    {step.id !== 3 ? (
                      currentStep > step.id ? (
                        <div
                          style={{
                            width: "100%",
                            background:
                              "linear-gradient(90deg, #FCAA45 0%, #E66A0E 100%)",
                            borderBottomLeftRadius: "11px",
                            borderBottomRightRadius: "11px",
                            padding: "18px 0",
                            textAlign: "center",
                            height: "50px",
                            marginTop: "auto",
                            color: "#fff",
                            fontWeight: "600",
                            fontSize: "16px",
                            cursor: "not-allowed",
                          }}
                        >
                          Score:{" "}
                          {step.id === 1
                            ? `${aptitudeScore.toFixed(0)}%`
                            : `${technicalScore.toFixed(0)}%`}
                        </div>
                      ) : (
                      <div
  onClick={
    (isDisabled && currentStep === step.id) || currentStep > step.id || step.id > currentStep     
      ? null
      : () => handleTakeTest(step.label)
  }
  style={{
    width: "100%",
    backgroundColor:
      isDisabled && currentStep === step.id
        ? "#e0e0e0"
        : currentStep === step.id
        ? "#121212"
        : "#e0e0e0",
    borderBottomLeftRadius: "11px",
    borderBottomRightRadius: "11px",
    padding: "0px 0",
    textAlign: "center",
    height: "auto",       // ⭐ important: allow button to grow
    cursor:
      (isDisabled && currentStep === step.id) ||
      currentStep > step.id ||
      step.id > currentStep   // ⛔ Cursor not allowed for Coming Soon
        ? "not-allowed"
        : "pointer",
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  }}
>
<p
  style={{
    color:
      currentStep === step.id && !isDisabled
        ? "#fff" // Start test → white
        : "#64666C",

    padding:
      isDisabled && currentStep === step.id
        ? "0px"       // ⭐ Retake test after → NO padding
        : "12px",     // ⭐ Others → normal padding

    margin: 0,
    fontSize: "16px",
    fontWeight: "400",
  }}
>
  {isDisabled && currentStep === step.id
    ? "Retake test after"
    : currentStep === step.id
    ? "Start test"
    : "Coming soon"}
</p>



  {/* ⭐ TIMER MOVED INSIDE BUTTON (LIKE IMAGE 1) */}
  {step.id !== 3 &&
    isDisabled &&
    currentStep === step.id &&
    timer && (
      <div
        style={{
          // marginTop: "6px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontWeight: "600",
            color: "#F3780D",
            fontSize: "17px",
          }}
        >
          {timer.days > 0 && `${timer.days}d `}
          {timer.hours > 0 && `${timer.hours}h `}
          {timer.minutes > 0 && `${timer.minutes}m `}
          {timer.seconds > 0 &&
            timer.hours === 0 &&
            timer.days === 0 &&
            `${timer.seconds}sec`}
        </div>
      </div>
    )}
</div>

                      )
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          backgroundColor:
                            currentStep >= 3 ? "#28A745" : "#e0e0e0",
                          borderBottomLeftRadius: "11px",
                          borderBottomRightRadius: "11px",
                          padding: "18px 0",
                          textAlign: "center",
                          height: "50px",
                          marginTop: "auto",
                          cursor:
                            currentStep >= 3
                              ? "pointer"
                              : "not-allowed",
                        }}
                      >
                        <p
                          style={{
                            color: "#64666C",
                            margin: 0,
                            fontSize: "16px",
                            fontWeight: "400",
                          }}
                        >
                          {currentStep >= 3
                            ? "Qualified"
                            : "Locked"}
                        </p>
                        
                      </div>
                    )}
                    
                  </div>
                </div>

                {/* TIMER */}

                {/* TITLE */}
                <p
                  style={{
                    fontSize: "17px",
                    lineHeight: "1.4",
                    marginTop: "10px",
                    fontWeight: "600",
                    textAlign: "center",
                    color: "#121212",
                  }}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </>
  )}
</div>

                     {/* */}


                  </div> 
                </div>
              </div> 
            </div>
          </section>
        </div>
        {/*out side of stepper*/}

      </div>
      <div className="row mr-0 ml-10" style={{width:"100%"}}>
  <h3 className='skillBadgeHeading'>Skills Badges</h3>
  
  <div className="col-lg-10 col-md-12" style={{backgroundColor:'#ffffff', boxShadow:"0px 0px 20px #F7AA4B80",borderRadius:'12px',margin:'0 10px',padding:'20px',width:'98%'}}>
<div className="skill-badge-container">

  {loading ? (
    Array.from({ length: 14 }).map((_, i) => (
      <SkillBadgeSkeleton key={`skeleton-${i}`} />
    ))
  ) : (
    <>
      {/* ⭐ 1. SORTED UNATTEMPTED SKILLS (skillsRequired) */}
      {[...skillBadges.skillsRequired]
        .sort((a, b) => a.skillName.localeCompare(b.skillName))
        .map(skill => (
          <div className="skill-badge-card" key={`req-${skill.id}`}>
            <SkillBadgeCard
              skillName={skill.skillName}
              status={skill.status}
              testFailedAt={skill.testTaken}
            />
          </div>
        ))
      }

      {/* ⭐ 2. ATTEMPTED SKILLS (NO SORTING) */}
      {skillBadges.applicantSkillBadges.map(badge => (
        <div className="skill-badge-card" key={`app-${badge.id}`}>
          <SkillBadgeCard
            skillName={badge.skillBadge.name}
            status={badge.status}
            testFailedAt={badge.testTaken}
          />
        </div>
      ))}
    </>
  )}

</div>
  </div>
</div>   
</div> 
    </div>)
  );
};

export default VerifiedBadges;
