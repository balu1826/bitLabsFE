import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import IndexPage from './pages/indexpage/IndexPage';
import AboutPage from './pages/aboutpage/AboutPage';
import ContactPage from './pages/contactpage/ContactPage';
import LoginPage from './pages/loginpage/LoginPage';
import FindJobPage from './pages/loginpage/FindJobPage';
import FindCandidatesPage from './pages/registerpage/FindCandidatesPage';
import RegisterPage from './pages/registerpage/RegisterPage';
import ApplicantHomePage from './pages/applicantpages/ApplicantHomePage';
import UserProvider from './components/common/UserProvider';
import Logout from './components/common/Logout';
import RecruiterLoginPage from './pages/recruiterpages/RecruiterLoginPage';
import RecruiterHomePage from './pages/recruiterpages/RecruiterHomePage';
import ApplicantForgotPasswordPage from './pages/loginpage/ApplicantForgotPasswordPage';
import RecruiterForgotPasswordPage from './pages/recruiterpages/RecruiterForgotPasswordPage';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import CookiePolicy from './components/common/CookiePolicy';
import TermsOfServices from './components/common/TermsOfServices';
import ApplicantBasicDetails from './components/applicantcomponents/ApplicantBasicDetails';
import JobWidget from './components/jobWidget';
// import ChatBotWidget from './ChatBotWidget';
import FinalizeBlog from "./components/applicantcomponents/FinalizeBlog";
import InterviewPrepPage from './pages/applicantpages/InterviewPrepPage';
import MentorConnectFeedbackForm from './pages/feedbackpage/MentorConnectFeedbackForm';

import {messaging } from './notifications/firebase';
import { onMessage } from 'firebase/messaging';
import FeedbackFormBuilder from "./pages/feedbackpage/FeedbackFormBuilder";
import FeedbackDashboard from "./pages/feedbackpage/FeedbackDashboard";
import FeedbackResponses from "./pages/feedbackpage/FeedbackResponses";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

   useEffect(() => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // ...
    });
  }, []);
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    window.location.href = '/';
  };
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(true);
    }
    setCheckingAuth(false);
  }, []);


  return (
    <div>
      <UserProvider>
        {checkingAuth ? (
          <p>Loading...</p>
        ) : (
          <Router>
            
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/find-jobs" element={<IndexPage />} />
              <Route path="/find-jobs-login" element={<FindJobPage onLogin={handleLogin} />} />
              <Route path="/find-candidates-login" element={<FindCandidatesPage onLogin={handleLogin} />} />
              <Route path="/find-candidates" element={<IndexPage />} />
              <Route path="/aboutus" element={<AboutPage />} />
              <Route path="/contactus" element={<ContactPage />} />
              <Route path="/candidate" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/applicant-forgot-password" element={<ApplicantForgotPasswordPage />} />
              <Route path="/recruiter-forgot-password" element={<RecruiterForgotPasswordPage />} />
              <Route path="/recruiterlogin" element={<RecruiterLoginPage onLogin={handleLogin} />} />
              <Route path="/recruiter" element={<RegisterPage onLogin={handleLogin} />}  />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/cookiepolicy" element={<CookiePolicy />} />
              <Route path="/termsofservices" element={<TermsOfServices />} />
  <Route path="/widget" element={<JobWidget />} />
<Route path="/feedback-dashboard" element={<FeedbackDashboard />} />
<Route path="/feedback-builder/new" element={<FeedbackFormBuilder />} />
<Route path="/feedback-builder/edit/:formId" element={<FeedbackFormBuilder />} />
<Route path="/feedback/:formId" element={<MentorConnectFeedbackForm />} />
<Route path="/feedback-responses/:formId" element={<FeedbackResponses />} />

              {isLoggedIn ? (
                <>
                <Route path="/applicanthome" element={<ApplicantHomePage />} />
                <Route path="/applicant-update-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-view-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-find-jobs" element={<ApplicantHomePage />} />
                <Route path="/applicant-my-jobs" element={<ApplicantHomePage />} />
                <Route path="/applicant-overview" element={<ApplicantHomePage />} />
                <Route path="/applicant-view-job" element={<ApplicantHomePage />} />
                <Route path="/applicant-edit-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-applied-jobs" element={<ApplicantHomePage />} />
                <Route path="/applicant-saved-jobs" element={<ApplicantHomePage />} />
                <Route path="/applicant-interview-status" element={<ApplicantHomePage />} />
                <Route path="/applicant-change-password" element={<ApplicantHomePage />} />
                <Route path="/applicant-delete-profile" element={<ApplicantHomePage />} />
                <Route path="/applicant-job-alerts" element={<ApplicantHomePage />} />
                <Route path="/applicant-take-test" element={<ApplicantHomePage />} />
                <Route path="/applicant-resume" element={<ApplicantHomePage />} />
                <Route path="/applicant-hackathon" element={<ApplicantHomePage />} />
                <Route path="/applicant-hackathon-details/:id" element={<ApplicantHomePage/>}/>
                <Route path="/applicant-blog-list" element={<ApplicantHomePage />} />
                <Route path="/applicant-mentorconnect" element={<ApplicantHomePage />} />
                <Route path="/applicant-interview-prep" element={<ApplicantHomePage />} />
                {/* <Route path="/verified-badges" component={VerifiedBadges} /> */}
                <Route path="/applicant-verified-badges" element={<ApplicantHomePage />} />
                <Route path="/applicant-resume-builder" element={<ApplicantHomePage />} />
                <Route path="/applicant-basic-details-form/:number" element={<ApplicantBasicDetails />} />
                <Route path="/recruiterhome" element={<RecruiterHomePage />} />
                <Route path="/recruiter-my-organization" element={<RecruiterHomePage />} />
                <Route path="/recruiter-postjob" element={<RecruiterHomePage />} />
                <Route path="/recruiter-postjob2" element={<RecruiterHomePage />} />
                <Route path="/recruiter-jobopenings" element={<RecruiterHomePage />} />
                <Route path="/recruiter-allapplicants" element={<RecruiterHomePage />} />
                <Route path="/recruiter-appliedapplicants" element={<RecruiterHomePage />} />
                <Route path="/recruiter-applicantinterviews" element={<RecruiterHomePage />} />
                <Route path="/recruiter-change-password" element={<RecruiterHomePage />} />
                <Route path="/recruiter-team-member" element={<RecruiterHomePage />} />
                <Route path= "/recruiter-edit-job/:id" element={<RecruiterHomePage />} />
                <Route path="/job-applicant-alerts" element={<RecruiterHomePage />} />
                <Route path="/viewapplicant/:id" element={<RecruiterHomePage />} />
                <Route path="/appliedapplicantsbasedonjob/:id" element={<RecruiterHomePage />} />
                <Route path="/view-resume/:id" element={<RecruiterHomePage />} />
                <Route path="/recruiter-view-job" element={<RecruiterHomePage />} />
                <Route path="/recruiter-repost-job/:id" element={<RecruiterHomePage />} />
                <Route path="/recruiter-view-organization" element={<RecruiterHomePage />} />
                <Route path="/recruiter-edit-organization" element={<RecruiterHomePage />} />
                <Route path="/admin-confirm-blog" element={<FinalizeBlog />} />
                <Route path="/blogs/:id" element={<ApplicantHomePage />} />
                <Route path="/applicant-verified-videos" element={<ApplicantHomePage />} />
                <Route path="/applicant-interview-prep" element={<InterviewPrepPage />} />
                <Route path="/recruiter-hackathons" element={<RecruiterHomePage />} />
                <Route path="/recruiter-hackathons-create" element={<RecruiterHomePage />} />
                <Route path="/hackathon-view-details/:id" element={<RecruiterHomePage />} />

              
                </>
              ) : (
                <Route path="/login" element={<Navigate to="/login" />} />
              )}
              <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
            </Routes>
          </Router>
        )}
      </UserProvider>
      {/* <ChatBotWidget /> */}
    </div>
  );
}
export default App;
