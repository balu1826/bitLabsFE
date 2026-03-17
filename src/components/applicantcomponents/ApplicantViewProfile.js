import { useUserContext } from "../common/UserProvider";
import ApplicantHeaderComponent from "./ApplicantHeaderComponent";
import ResumeSummaryCard from "./ResumeSummaryCard"; // ← add this
import PersonalDetailsCard from "./PersonalDetailsCard";
import EducationDetailsCard from "./EducationDetailsCard";
import ProjectDetailsCard from "./ProjectDetailsCard";
import KeySkillsCard from "./KeySkillsCard";
import SkillBadgesGrid from './SkillBadgesGrid';
import "./modalpopup.css";
import "./Portfolio.css";
import ApplicantAtsResume from "./ApplicantAtsResume/ApplicantAtsResume"; 
import { useResume } from "./ResumeContext";
import {useState, useEffect } from "react";

const ApplicantViewProfile = () => {
  const { user } = useUserContext();
  const applicantId = user?.id;
  const { resumeState, setProfileData } = useResume();
  const profileData = resumeState.profileData;
 const [loadedSections, setLoadedSections] = useState({
  header: false,
  summary: false,
  personal: false,
   education: false,
   projects: false,
   skills: false
   //SkillBadgesGrid: false
});
const markLoaded = (section) => {
  setLoadedSections((prev) => ({
    ...prev,
    [section]: true
  }));
};
const allLoaded = Object.values(loadedSections).every(Boolean);
console.log("Loaded sections:", loadedSections);

  useEffect(() => {
  console.log("Context profileData updated:", resumeState.profileData);
    console.log("Context profileData updated:", resumeState.jobDescription);
 
}, [resumeState]);

  return (
    <div className="border-style">

      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        {/* Title */}
        <div className="row mr-0 ml-10 extraSpace">
          <div className="col-lg-12 col-md-12">
            <section className="page-title-dashboard">
              <div className="themes-container">
                <div className="row">
                  <div className="col-lg-12 col-md-12">
                    <div className="title-dashboard" style={{ margin: "0 0 -15px -40px" }}>
                      <div className="title-dash flex2 common_style">My portfolio</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        {applicantId ? (
          <>
              <ApplicantHeaderComponent applicantId={applicantId}
              setProfileData={setProfileData} 
              onLoaded={() => markLoaded("header")}
  showContent={allLoaded}/>
              <ResumeSummaryCard applicantId={applicantId} 
              onLoaded={() => markLoaded("summary")}
  showContent={allLoaded}
              onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  resumeSummary: data,
                }))
              }/>
              <PersonalDetailsCard applicantId={applicantId} 
              onLoaded={() => markLoaded("personal")}
  showContent={allLoaded}
              onChange={
                (data) =>
                  setProfileData((prev) => ({
                    ...prev,
                    personalDetails: data,
                  }))
              }/>
              <EducationDetailsCard applicantId={applicantId} 
              onLoaded={() => markLoaded("education")}
  showContent={allLoaded}
              onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  educationDetails: data,
                }))
              }/>
              <ProjectDetailsCard applicantId={applicantId} 
              onLoaded={() => markLoaded("projects")}
  showContent={allLoaded}
               onChange={(data) =>
                setProfileData((prev) => ({
                  ...prev,
                  projectDetails: data,
                }))
              }/>
              <KeySkillsCard applicantId={applicantId} 
              onLoaded={() => markLoaded("skills")}
  showContent={allLoaded}
               onChange={
                (data) =>
                  setProfileData((prev) => ({
                    ...prev,
                    keySkills: data,
                  }))
              }/>

              <ApplicantAtsResume applicantId={applicantId}
              onLoaded={() => markLoaded("applicantAtsResume")}
  showContent={allLoaded}   />
              {/* ===================== Skill Badges (NEW CARD) ===================== */}
              <div className="card-base soft-shadow">
                <div className="card-title-row">
                  <h3 className="card-title common_style">Passed skill badges</h3>
                </div>
                <SkillBadgesGrid
                 onLoaded={() => markLoaded("skillBadges")}
  showContent={allLoaded} />
              </div>
              {/* =================== /Skill Badges (NEW CARD) =================== */}
          </>
        ) : (
          <div>Unable to identify applicant.</div>
        )}

      </div>
    </div>

  );
};

export default ApplicantViewProfile;
