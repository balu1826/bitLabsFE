import React from 'react';
import { BrowserRouter as Router, Route, Routes,Outlet } from 'react-router-dom';
import { Link, useLocation,useParams } from 'react-router-dom';
import RecruiterNavBar from '../../components/recruitercomponents/RecruiterNavBar';
import { useState } from 'react';
import RecruiterDashboard from '../../components/recruitercomponents/RecruiterDashboard';
import RecruiterMyOrganization from '../../components/recruitercomponents/RecruiterMyOrganization';
import RecruiterPostJob from '../../components/recruitercomponents/RecruiterPostJob';
import RecruiterJobOpenings from '../../components/recruitercomponents/RecruiterJobOpenings';
import RecruiterAllApplicants from '../../components/recruitercomponents/RecruiterAllApplicants';
import RecruiterAppliedApplicants from '../../components/recruitercomponents/RecruiterAppliedApplicants';
import RecruiterApplicantInterviews from '../../components/recruitercomponents/RecruiterApplicantInterviews';
import RecruiterChangePassword from '../../components/recruitercomponents/RecruiterChangePassword';
import TeamMember from '../../components/recruitercomponents/TeamMember';
import RecruiterEditJob from '../../components/recruitercomponents/RecruiterEditJob';
import JobApplicantAlerts from '../../components/recruitercomponents/JobApplicantAlerts';
import Recruiterviewapplicant from '../../components/recruitercomponents/Recruiterviewapplicant';
import AppliedApplicantsBasedOnJobs from '../../components/recruitercomponents/AppliedApplicantsBasedOnJobs';
import ViewApplicantResume from '../../components/recruitercomponents/ViewApplicantResume';
import RecruiterViewJob from '../../components/recruitercomponents/RecruiterViewJob';
import RecruiterRepostJob from '../../components/recruitercomponents/RecruiterRepostJob';
import RecruiterPostJob2 from '../../components/recruitercomponents/RecruiterPostJob2';
import RecruiterViewOrganization from '../../components/recruitercomponents/RecruiterViewOrganization';
import RecruiterEditOrganization from '../../components/recruitercomponents/RecruiterEditOrganization';
import RecruiterHackathonDashboard from '../../components/recruitercomponents/RecruiterHackathonDashboard';
import RecruiterCreateHackathon from '../../components/recruitercomponents/RecruiterHackathonCreate';
import RecruiterHackathonViewRegistrations from '../../components/recruitercomponents/RecruiterHackathonViewRegistrations';

function RecruiterHomePage() {
  const [activeRoute, setActiveRoute] = useState('');
  const location = useLocation();
  const [selectedJobId, setSelectedJobId] = useState('');
  const { id } = useParams();
  const [imageSrc, setImageSrc] = useState('');
  const updateActiveRoute = () => {
    const pathname = location.pathname;
    
    console.log(pathname);
    switch (pathname) {
      case '/recruiterhome':
        setActiveRoute('dashboard');
        break;
        case '/recruiter-my-organization':
          setActiveRoute('organization');
          break;
          case '/recruiter-postjob':
            setActiveRoute('postjob');
            break;
            case '/recruiter-postjob2':
              setActiveRoute('postjob2');
              break;
            case '/recruiter-jobopenings':
              setActiveRoute('jobopenings');
              break;
              case '/recruiter-appliedapplicants':
                setActiveRoute('appliedapplicants');
                break;
                case '/recruiter-allapplicants':
                setActiveRoute('allapplicants');
                break;
                case '/recruiter-applicantinterviews':
                  setActiveRoute('applicantinterviews');
                  break;
                  case '/recruiter-change-password':
                  setActiveRoute('changepassword');
                  break;
                  case '/recruiter-team-member':
                    setActiveRoute('teammember');
                    break;
                  case `/recruiter-edit-job/${id}`:
                    setActiveRoute(`RecruiterEditJob-${id}`);
                    break;
                    case '/job-applicant-alerts':
                      setActiveRoute('alerts');
                      break;
                      case `/viewapplicant/${id}`:
                       setActiveRoute(`viewapplicant-${id}`);
                     break;
                     case `/appliedapplicantsbasedonjob/${id}`:
                       setActiveRoute(`appliedapplicantsbasedonjob-${id}`);
                     break;
                     case `/view-resume/${id}`:
                       setActiveRoute(`view-resume-${id}`);
                     break;
                     case '/recruiter-view-job':
                    setActiveRoute('recviewjob');
                    break;
                    case `/recruiter-repost-job/${id}`:
                    setActiveRoute(`RecruiterRepostJob-${id}`);
                    break;
                    case '/recruiter-view-organization':
                      setActiveRoute('vieworganization');
                      break;
                      case '/recruiter-edit-organization':
                        setActiveRoute('editorganization');
                        break;
                     case '/recruiter-hackathons':
                        setActiveRoute('hackathons');
                        break;
                case `/hackathon-view-details/${id}`:
                  setActiveRoute('hackathon-view-details');
                  break;
                    case '/recruiter-hackathons-create':
                        setActiveRoute('create-hackathon');
                        break;

      default:
        setActiveRoute('');
        break;
    }
  };
  React.useEffect(() => {
    updateActiveRoute();
  }, [location.pathname]);
  return (
    <div  class="dashboard show ">
    <RecruiterNavBar imageSrc={imageSrc} setImageSrc={setImageSrc} />
    
     {activeRoute === 'dashboard' && <RecruiterDashboard />}
     {activeRoute === 'organization' && <RecruiterMyOrganization />}
     {activeRoute === 'vieworganization' && <RecruiterViewOrganization />}
     {activeRoute === 'editorganization' && <RecruiterEditOrganization setImgSrc={setImageSrc}/>}
     {activeRoute === 'postjob' && <RecruiterPostJob />}
     {activeRoute === 'postjob2' && <RecruiterPostJob2 />}
     {activeRoute === 'jobopenings' && <RecruiterJobOpenings setSelectedJobId={setSelectedJobId} />}
     {activeRoute === 'appliedapplicants' && <RecruiterAppliedApplicants selectedJobId={selectedJobId} />}
     {activeRoute === 'allapplicants' && <RecruiterAllApplicants />}
     {activeRoute === 'applicantinterviews' && <RecruiterApplicantInterviews />}
     {activeRoute === 'changepassword' && <RecruiterChangePassword />}
     {activeRoute === 'teammember' && <TeamMember />}
     {activeRoute === 'recviewjob' && <RecruiterViewJob selectedJobId={selectedJobId} />}
    {activeRoute.startsWith('RecruiterEditJob-') && id && <RecruiterEditJob selectedJobId={id}/>}
    {activeRoute.startsWith('RecruiterRepostJob-') && id && <RecruiterRepostJob selectedJobId={id}/>}
    {activeRoute === 'alerts' && <JobApplicantAlerts />}
    {activeRoute.startsWith('viewapplicant-')  && id && <Recruiterviewapplicant id={id} />}
    {activeRoute.startsWith('appliedapplicantsbasedonjob-')  && id && <AppliedApplicantsBasedOnJobs id={id} />}
    {activeRoute.startsWith('view-resume-')  && id && <ViewApplicantResume id={id} />}
    {activeRoute === 'hackathons' && <RecruiterHackathonDashboard />}
    {activeRoute === 'create-hackathon' && <RecruiterCreateHackathon />}
  {activeRoute === 'hackathon-view-details' && id && <RecruiterHackathonViewRegistrations hackathonId={id} />}
    </div>
  )
}

export default RecruiterHomePage;