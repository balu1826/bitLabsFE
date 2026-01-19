import React from 'react';
import axios from 'axios';
import { useUserContext } from '../../components/common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import ApplicantNavBar from '../../components/applicantcomponents/ApplicantNavBar';
import ApplicantDashboard from '../../components/applicantcomponents/ApplicantDashboard';
import ApplicantUpdateProfile from '../../components/applicantcomponents/ApplicantUpdateProfile';
import ApplicantViewProfile from '../../components/applicantcomponents/ApplicantViewProfile';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState,useEffect } from 'react';
import ApplicantFindJobs from '../../components/applicantcomponents/ApplicantFindJobs';
import ApplicantViewJob from '../../components/applicantcomponents/ApplicantViewJob';
import ApplicantAppliedJobs from '../../components/applicantcomponents/ApplicantAppliedJobs';
import ApplicantSavedJobs from '../../components/applicantcomponents/ApplicantSavedJobs';
import ApplicantInterviewStatus from '../../components/applicantcomponents/ApplicantInterviewStatus';
import ApplicantChangePassword from '../../components/applicantcomponents/ApplicantChangePassword';
import ApplicantDeleteProfile from '../../components/applicantcomponents/ApplicantDeleteProfile';
import ApplicantJobAlerts from '../../components/applicantcomponents/ApplicantJobAlerts';
import ApplicantResume from '../../components/applicantcomponents/ApplicantResume';
import ApplicantEditProfile from '../../components/applicantcomponents/ApplicantEditProfile';
import ApplicantBasicDetails from '../../components/applicantcomponents/ApplicantBasicDetails';
import ResumeBuilder from '../../components/applicantcomponents/ResumeBuilder';
import ApplicantTakeTest from '../../components/applicantcomponents/ApplicantTakeTest';
import VerifiedBadges from '../../components/applicantcomponents/VerifiedBadges';
import VerifiedVideos from '../../components/applicantcomponents/VerifiedVideos';
import Hackathon from '../../components/applicantcomponents/hackathon';
import HackathonDetails from '../../components/applicantcomponents/HackathonDetails';
import ApplicantBlogsList from '../../components/applicantcomponents/ApplicantBlogs';
import BlogSingle from '../../components/applicantcomponents/BlogSingle';
import ApplicantMentorConnect from '../../components/applicantcomponents/ApplicantMentorConnect';
import MyJobs from '../../components/applicantcomponents/MyJobs';
import InterviewPrepPage from './InterviewPrepPage';

function ApplicantHomePage() {
  const [activeRoute, setActiveRoute] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { id } = useParams();
  const userId = user.id;
  useEffect(() => {
    
    if (location.pathname === '/applicant-find-jobs' || location.pathname === '/applicanthome') {
      return; 
    }
    const checkUserProfile = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const profileId = profileIdResponse.data;
        
        if (profileId === 0) {
          navigate('/applicant-basic-details-form');
        } else {
          
        }
      } catch (error) {
        console.error('Error fetching profile ID:', error);
      }
    };
  
    checkUserProfile();
  }, [userId, navigate, location.pathname]);


  const updateActiveRoute = () => {
    const pathname = location.pathname;
    switch (pathname) {
      case '/applicant-find-jobs':
        setActiveRoute('findjobs');
        break;
      case '/applicanthome':
        setActiveRoute('dashboard');
        break;
      case '/applicant-update-profile':
        setActiveRoute('profile');
        break;
        case '/applicant-view-profile':
          setActiveRoute('viewprofile');
          break;
          case '/applicant-edit-profile':
            setActiveRoute('editprofile');
            break;
        case '/applicant-view-job':
          setActiveRoute('viewjob');
        break;
        case '/applicant-applied-jobs':
          setActiveRoute('appliedjobs');
        break;
        case '/applicant-saved-jobs':
          setActiveRoute('savedjobs');
        break;
        case '/applicant-interview-status':
          setActiveRoute('interviewstatus');
        break;
        case '/applicant-change-password':
          setActiveRoute('changepassword');
        break;
        case '/applicant-delete-profile':
          setActiveRoute('deleteprofile');
        break;
        case '/applicant-job-alerts':
          setActiveRoute('jobalerts');
        break;
        case '/applicant-resume':
          setActiveRoute('resume');
        break;
        case '/applicant-resume-builder':
          setActiveRoute('resumebuilder');
        break;
        case '/applicant-basic-details-form':
          setActiveRoute('abdf');
        break;
        case '/applicant-take-test':
          setActiveRoute('taketest');
        break;
        case '/applicant-verified-badges':
          setActiveRoute('badges');
        break;
         case '/applicant-hackathon':
        setActiveRoute('hackathon')
        break;
      case `/applicant-hackathon-details/${id}`:
        setActiveRoute('hackDetails');
        break;
        case '/applicant-blog-list':
          setActiveRoute('blogs');
        break;
        case '/applicant-verified-videos':
          setActiveRoute('videos');
        break;
        case '/applicant-mentorconnect':
          setActiveRoute('mentor');
        break;
        case '/applicant-my-jobs':
        setActiveRoute('myjobs');
        break;
        case '/applicant-interview-prep':
        setActiveRoute('ai-prep');
        break;
         default:
      // 👇 check if route starts with /blogs/ (for blog single page)
      if (pathname.startsWith('/blogs/')) {
        setActiveRoute('blogsingle');
      } else {
        setActiveRoute('');
      }
      break;
  
  
    }
  };
  React.useEffect(() => {
    updateActiveRoute();
  }, [location.pathname]);
  
  return (
    <div  class="dashboard show"> 
     <ApplicantNavBar />
     {activeRoute === 'findjobs' && (<ApplicantFindJobs setSelectedJobId={setSelectedJobId} /> )}
     {activeRoute === 'myjobs' && (<MyJobs setSelectedJobId={setSelectedJobId} /> )}
     {activeRoute === 'dashboard' && <ApplicantDashboard />}
     {activeRoute === 'profile' && <ApplicantUpdateProfile />}
     {activeRoute === 'viewprofile' && <ApplicantViewProfile />}
     {activeRoute === 'editprofile' && <ApplicantEditProfile />}
     {activeRoute === 'viewjob' && (<ApplicantViewJob selectedJobId={selectedJobId} /> )}
     {activeRoute === 'appliedjobs' && <ApplicantAppliedJobs setSelectedJobId={setSelectedJobId}/>}
     {activeRoute === 'savedjobs' && <ApplicantSavedJobs setSelectedJobId={setSelectedJobId} />}
     {activeRoute === 'interviewstatus' && (<ApplicantInterviewStatus selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId} /> )}
     {activeRoute === 'changepassword' && <ApplicantChangePassword />}
     {activeRoute === 'deleteprofile' && <ApplicantDeleteProfile />}
     {activeRoute === 'jobalerts' && <ApplicantJobAlerts />}
     {activeRoute === 'resume' && <ApplicantResume />}
     {activeRoute === 'resumebuilder' && <ResumeBuilder />}
     {activeRoute === 'abdf' && <ApplicantBasicDetails />}
     {activeRoute === 'taketest' && <ApplicantTakeTest />}
     {activeRoute === 'badges' && <VerifiedBadges />}
      {activeRoute === 'videos' && <VerifiedVideos />}

      {activeRoute === 'hackathon' && <Hackathon />}
      {activeRoute === 'hackDetails' && <HackathonDetails />}
      {activeRoute === 'blogs' && <ApplicantBlogsList />}
      {activeRoute === 'blogsingle' && <BlogSingle />}
      {activeRoute === 'ai-prep' && <InterviewPrepPage />}
       {activeRoute === 'mentor' && <ApplicantMentorConnect />}
      </div> 
  )
}
export default ApplicantHomePage;