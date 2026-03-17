import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import BackButton from '../common/BackButton';
import { apiUrl } from '../../services/ApplicantAPIService';

import SemiCircleProgressBar from "react-progressbar-semicircle";
import Python from '../../images/Python.svg';
import Mysql from '../../images/Mysql.svg';
import HTMLCSS from '../../images/Html&Css.svg';
import Java from '../../images/Java.svg';
import JavaScript from '../../images/JavaScript.svg';
import ReactImg from '../../images/React.svg';
import SpringBoot from '../../images/SpringBoot.svg';
import alertcircle from '../../images/alert-circle 3.svg';
import externallink2 from '../../images/external-link2.svg';

import ScreeningQuestionsModal from './ScreeningQuestionsModal';

import Modal from './AppliedjobsModal';
import './AppliedjobsModal.css';
import './ScreeningQuestionsModal.css';

const ApplicantViewJob = ({ selectedJobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const { user } = useUserContext();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '', link: '', linkText: '' });
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const jobId = new URLSearchParams(location.search).get('jobId') || selectedJobId;
  const [isScreeningModalOpen, setScreeningModalOpen] = useState(false);
  const [screeningQuestions, setScreeningQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState(false);

  const courseImageMap = {
    'HTML&CSS': HTMLCSS,
  'JAVA': Java,
  'PYTHON': Python,
  'MYSQL': Mysql,
  'JAVASCRIPT': JavaScript,
  'REACT': ReactImg,
  'SPRING BOOT': SpringBoot,
  };
  

  const courseUrlMap = {
    "HTML&CSS": "https://upskill.bitlabs.in/course/view.php?id=9",
    "JAVA": "https://upskill.bitlabs.in/course/view.php?id=22",
    "PYTHON": "https://upskill.bitlabs.in/course/view.php?id=7",
    "MYSQL": "https://upskill.bitlabs.in/course/view.php?id=8",
    "JAVASCRIPT": "https://upskill.bitlabs.in/course/view.php?id=47",
    "REACT": "https://upskill.bitlabs.in/course/view.php?id=21",
    "SPRING BOOT":"https://upskill.bitlabs.in/course/view.php?id=23"
  };

  const [skillBadges, setSkillBadges] = useState([]);
  const [applicantSkillBadges, setApplicantSkillBadges] = useState([]);
 
  const fetchSkillBadges = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/skill-badges/${user.id}/skill-badges`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );
      const { skillsRequired, applicantSkillBadges } = response.data;
      setSkillBadges(skillsRequired || []);
      setApplicantSkillBadges(applicantSkillBadges || []);
    } catch (error) {
      console.error('Error fetching skill badges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSkillBadges();
  }, []); // Runs once on component mount
  
  useEffect(() => {
    console.log('Applicant Badges Updated:', applicantSkillBadges);
  }, [applicantSkillBadges]); // Logs when `applicantSkillBadges` changes

  // Function to check if the skill is passed
  const isSkillPassed = (skillName) => {
    console.log('Checking skill:', skillName);
    console.log('Applicant Badges:', applicantSkillBadges);

    return applicantSkillBadges.some(
      (badge) => badge.skillBadge.name === skillName && badge.status === 'PASSED'
    );
  };

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/viewjob/applicant/viewjob/${jobId}/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );
      const { body } = response.data;
      setLoading(false);
      if (body) {
        setJobDetails(body);
        const appliedStatus = localStorage.getItem(`appliedStatus-${jobId}`);
        if (appliedStatus) {
          setApplied(appliedStatus === 'true');
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  //  const handleApplyNow = async () => {
  //   if (jobDetails.screeningQuestions && jobDetails.screeningQuestions.length > 0) {
  //     setScreeningQuestions(jobDetails.screeningQuestions);
  //     setScreeningModalOpen(true);
  //   } else {
  //     await applyJob();
  //   }
  // };

  const handleApplyNow = async () => {
    if (jobDetails.jobURL.includes('https://www.bitlabs.in/jobs')) {
      // Internal job: Check if there are screening questions
      if (jobDetails.screeningQuestions && jobDetails.screeningQuestions.length > 0) {
        // Handle screening questions
        setScreeningQuestions(jobDetails.screeningQuestions);
        setScreeningModalOpen(true); // Open modal for screening questions
      } else {
        // Apply directly to internal job if no screening questions
        await handleInternalJobApply(); // Apply for internal job without screening questions
      }
    } else {
      // External job: No screening questions, just track the visit and apply
      await handleExternalJobVisit(); // For external jobs, handle visit and open URL
    }
  };
  

  const handleInternalJobApply = async () => {
    try {
      const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profileid`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
      });
      const profileId = profileIdResponse.data;

      if (profileId === 0) {
        navigate('/applicant-basic-details-form');
        return;
      }

      const response = await axios.post(
        `${apiUrl}/applyjob/applicants/applyjob/${user.id}/${jobId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
      );
      const { applied } = response.data;

      localStorage.setItem(`appliedStatus-${selectedJobId}`, 'true');
      setApplied(applied);
      fetchJobDetails();
      setModalOpen(true);
    } catch (error) {
      console.error('Error applying for the job:', error);
      setSnackbar({
        open: true,
        message: 'Job has already been applied by the applicant.',
        link: '/applicant-applied-jobs',
        linkText: 'View Applied Jobs',
        type: 'error',
      });
    }
  };

  const handleExternalJobVisit = async () => {
    if (!visited) {
      try {
        await axios.post(`${apiUrl}/jobVisit/applicant/track-visit`, { jobId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` },
        });
        setVisited(true);
        const response = await axios.post(
          `${apiUrl}/applyjob/applicants/applyjob/${user.id}/${jobId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` } }
        );
        const { applied } = response.data;
  
        localStorage.setItem(`appliedStatus-${selectedJobId}`, 'true');
        setApplied(applied);
        fetchJobDetails();
        // Add logic to move job to Applied Jobs section if necessary
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    }
    window.open(jobDetails.jobURL, '_blank');
  };

  const handleApply = () => {
    if (jobDetails.jobURL.includes('https://www.bitlabs.in/jobs')) {
      handleInternalJobApply();
    } else {
      handleExternalJobVisit();
    }
  };

  const applyJob = async () => {
    try {
      const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profileid`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      const profileId = profileIdResponse.data;

      if (profileId === 0) {
        navigate('/applicant-basic-details-form');
        return;
      } else {
        setApplied(true);
        const response = await axios.post(
          `${apiUrl}/applyjob/applicants/applyjob/${user.id}/${jobId}`,
          { answers },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          }
        );
        const { applied } = response.data;
        localStorage.setItem(`appliedStatus-${selectedJobId}`, 'true');
        setApplied(applied);
        fetchJobDetails();
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error applying for the job:', error);
      setSnackbar({ open: true, message: 'Job has already been applied by the applicant.', link: '/applicant-applied-jobs', linkText: 'View Applied Jobs', type: 'error' });
    }
  };

  const handleScreeningSubmit = async (answers) => {
    setAnswers(answers);
    await applyJob();
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees * 1).toFixed(2); 
  };

  const handleCloseSnackbar = (index) => {
    setSnackbar({ open: false, message: '', type: '', link: '', linkText: '' });
  };


  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      {loading ? null : (
        <div className="dashboard__content">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="title-dashboard">
                    <div className="title-dash flex2"><BackButton />Full Job Details</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="flat-dashboard-setting flat-dashboard-setting2">
            <div className="themes-container">
              <div className="content-tab">
                <div className="inner">
                  <article className="job-article">
                    
                    {jobDetails && (
                      <div className="top-content">
                        <div className="features-job style-2 stc-apply bg-white">
                          <div className="job-archive-header">
                            <div className="inner-box">
                              <div className="box-content">
                                <h4>
                                  <a href="#">{jobDetails.companyname}</a>
                                </h4>
                                <h3>
                                  <a href="#">{jobDetails.jobTitle}</a>
                                </h3>
                                <ul>
                                  <li>
                                    <span className="icon-map-pin"></span>
                                    &nbsp;{jobDetails.location}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="job-archive-footer">
                            <div className="job-footer-left">
                              <ul className="job-tag">
                                <li>
                                  <a href="javascript:void(0);">{jobDetails.employeeType}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">{jobDetails.remote ? 'Remote' : 'Office-based'}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">
                                    Exp &nbsp;{jobDetails.minimumExperience} - {jobDetails.maximumExperience} years
                                  </a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">
                                    &#x20B9; {convertToLakhs(jobDetails.minSalary)} - &#x20B9; {convertToLakhs(jobDetails.maxSalary)} LPA
                                  </a>
                                </li>
                              </ul>
                              <div className="star">
                                {Array.from({ length: jobDetails.starRating }).map((_, index) => (
                                  <span key={index} className="icon-star-full"></span>
                                ))}
                              </div>
                            </div>
                            <div className="job-footer-right">
                              <div className="price">
                                <span>
                                  <span style={{ fontSize: '12px' }}>Posted on {formatDate(jobDetails.creationDate)}</span>
                                </span>
                              </div>
                              <div className="button-readmore">
                              <div style={{ display: 'flex', alignItems: 'center' }}>
        {jobDetails.jobURL.includes('https://www.bitlabs.in/jobs') ? (
          // Internal job: Show Apply button
          <button
            className={`btn-apply ${applied ? 'applied' : ''}`}
            onClick={handleApplyNow}
            disabled={jobDetails.jobStatus === 'Already Applied'}
            style={{
              backgroundColor: applied ? '#FEF1E8' : '#F97316',
              cursor: 'pointer',
              height: '40px',
              color: '#F97316',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              opacity: '80%',
              borderColor: '#F97316',
            }}
          >
            <span className="icon-send"></span>&nbsp;
            {jobDetails.jobStatus === 'Already Applied' ? 'Applied' : 'Apply Now'}
          </button>
        ) : (
          // External job: Show Apply and Visited buttons separately
          <div>
  <button
    className="btn-apply"
    onClick={handleExternalJobVisit}
    // disabled={jobDetails.jobStatus === 'Already Applied'}
    style={{
      backgroundColor: applied ? '#08921E' : '#F97316',
      cursor: 'pointer',
      height: '40px',
      color: '#FFFFFF',
      borderRadius: '8px',
      opacity: '80%',
    }}
  >
    <span
      className={jobDetails.jobStatus === 'Already Applied' ? 'fa fa-check' : 'fa fa-external-link'}
      style={{ fontSize: '14px' }}
    ></span>
    &nbsp;&nbsp;
    {jobDetails.jobStatus === 'Already Applied' ? 'Visited' : 'Apply'}
  </button>
</div>

        )}
      </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    
                    
                    {jobDetails && (
  <div className="features-job style-2 stc-apply bg-white grid-container">
    <div className="grid-item item1">
      <h5 className='match-probability'>Skill Match Probability</h5>
      <p>The more the Probability, more are the chances to get hired.</p>
    </div>
    <div className="grid-item item2">
      <div className="right-aligned-content">
        <div className="progress-bar-container">
          <SemiCircleProgressBar 
            percentage={jobDetails.matchPercentage} 
            showPercentValue={false}  
            stroke="#F46F16" 
            background="#FFDBBB" 
          />
          <div className="progress-bar-value">{jobDetails.matchPercentage} %</div>
        </div>
        <div className="match">
          <h5 className="centered-text" style={{color:'#000000',fontWeight: 'bolder',fontSize: '20px'}}>{jobDetails.matchStatus}</h5>
        </div>
      </div>
    </div>
    <div className="grid-item item3">
    <div className="job-archive-footer">
  <div className="job-footer-left1">
    <ul className="job-tag" 
    style={{ 
        listStyleType: 'none', 
        padding: 0, 
        margin: 0, 
        display: 'flex', /* Flexbox layout */
        flexWrap: 'wrap', /* Allow items to wrap to the next line */
        gap: '6px' /* Adjust the gap between items */
      }}
      >
{jobDetails?.matchedSkills?.map((skill) => (
  <li key={skill.skillName} style={{ marginBottom: '8px' }}>
    <a
      href="javascript:void(0);" // Avoid using `#`
      onClick={(e) => e.preventDefault()} // Prevent default link behavior
      style={{
        backgroundColor: '#498C07', // Green background color
        color: '#FFFFFF', // White text color
        padding: '10px 12px', // Padding around the text
        borderRadius: '50px', // Rounded corners
        textDecoration: 'none', // Remove underline
        height: '36px',
        display: 'inline-flex', // Use inline-flex for better alignment
        alignItems: 'center', // Vertically center items
        transition: 'background-color 0.3s', // Smooth transition for hover effect
      }}
    >
      {/* Conditionally render the tick mark if the skill is passed */}
      {isSkillPassed(skill.skillName) && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 13 13"
          fill="none"
          style={{ marginRight: '8px', verticalAlign: 'middle' }} // Adjust spacing and alignment
        >
          <path
            d="M12.3726 5.23415L11.5331 4.28366C11.3532 4.10544 11.2333 3.749 11.2333 3.51138V2.56088C11.2333 1.90742 10.6937 1.43217 10.0941 1.43217H9.07477C8.83493 1.43217 8.47517 1.31336 8.29529 1.13514L7.33593 0.30346C6.91621 -0.0529761 6.25665 -0.0529761 5.83693 0.30346L4.93753 1.13514C4.75765 1.31336 4.39789 1.43217 4.15805 1.43217H3.13873C2.47917 1.43217 1.99949 1.96683 1.99949 2.56088V3.57079C1.99949 3.80841 1.87957 4.16485 1.69969 4.34306L0.92021 5.29356C0.560451 5.7094 0.560451 6.36287 0.92021 6.77871L1.69969 7.7292C1.87957 7.90742 1.99949 8.26386 1.99949 8.50148V9.51138C1.99949 10.1648 2.53913 10.6401 3.13873 10.6401H4.15805C4.39789 10.6401 4.75765 10.7589 4.93753 10.9371L5.89689 11.7688C6.31661 12.1252 6.97617 12.1252 7.39589 11.7688L8.35525 10.9371C8.53512 10.7589 8.89489 10.6401 9.13473 10.6401H10.154C10.8136 10.6401 11.2933 10.1054 11.2933 9.51138V8.50148C11.2933 8.26386 11.4132 7.90742 11.5931 7.7292L12.4325 6.77871C12.7323 6.36287 12.7323 5.64999 12.3726 5.23415ZM9.13473 4.87772L6.25665 7.7292C6.19669 7.78861 6.07677 7.84801 5.95685 7.84801C5.83693 7.84801 5.71701 7.78861 5.65705 7.7292L4.21801 6.30346C4.03813 6.12524 4.03813 5.82821 4.21801 5.64999C4.39789 5.47178 4.69769 5.47178 4.87757 5.64999L6.01681 6.77871L8.47517 4.22425C8.65505 4.04603 8.95485 4.04603 9.13473 4.22425C9.3146 4.40247 9.3146 4.6995 9.13473 4.87772Z"
            fill="white"
          />
        </svg>
      )}
      {skill.skillName}
    </a>
  </li>
))}
      {jobDetails.skillsRequired.map((skill, index) => (
        <li key={index} style={{ marginBottom: '2px' }}> {/* Adjust the margin as needed */}
          <a 
            href="javascript:void(0);" 
            style={{
              backgroundColor: '#BF230E', /* Red background color */
              color: 'white', /* White text color */
              padding: '6px 12px', /* Padding around the text */
              borderRadius: '50px', /* Rounded corners */
              textDecoration: 'none', /* Remove underline */
              display: 'flex', /* Align image and text in a row */
              alignItems: 'center', /* Vertically center the image and text */
              transition: 'background-color 0.3s', /* Smooth transition for hover effect */
              marginBottom: '2px' /* Equal margin at the bottom */
            }}
          >
            <img 
              src={alertcircle} 
              className="course-image1" 
              alt="Alert" 
              style={{
                width: '24px', /* Increase the width of the image */
                height: '24px', /* Increase the height of the image */
                marginRight: '8px' /* Space between the image and text */
              }}
            />
            {capitalizeFirstLetter(skill.skillName)}
          </a>
        </li>
      ))}
    </ul>
  </div>
</div>

</div>

  </div>
)}

                   
                  
                    {jobDetails && (
                      <div className="features-job style-2 stc-apply bg-white">
                        <div className="inner-content">
                          <h5>Full Job Description</h5>
                          <div className="description-preview" dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
                        </div>
                      </div>
                    )}
                    
                    {jobDetails && jobDetails.sugesstedCourses.length > 0 && (
                        <div className="features-job style-2 stc-apply bg-white">
                          <div className="inner-content">
                            <h5 className='match-probability'>Suggested Courses</h5>
                            <ul className="job-tag course-list">
                              {jobDetails.sugesstedCourses.map((course, index) => (
                                <li key={index} className="course-box" >
                                  <a
                                    href={courseUrlMap[course] || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="course-link"
                                  >
                                    <div className="course-content">
                                      <img src={courseImageMap[course]} alt={course} className="course-image" />
                                      <img src={externallink2} className="external-link-image" />
                                    </div>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {isModalOpen && <Modal onClose={handleCloseModal} />}
       <ScreeningQuestionsModal
        isOpen={isScreeningModalOpen}
        questions={screeningQuestions}
        onClose={() => setScreeningModalOpen(false)}
        onSubmit={handleScreeningSubmit}
        apiUrl={apiUrl}
        user={user}
        jobId={jobId}
      />
    </div>
  );
};

export default ApplicantViewJob;
