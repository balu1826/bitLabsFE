import React from "react";
import { useUserContext } from "../common/UserProvider";
import ApplicantHeaderComponent from "./ApplicantHeaderComponent";
import ResumeSummaryCard from "./ResumeSummaryCard";
import PersonalDetailsCard from "./PersonalDetailsCard";
import EducationDetailsCard from "./EducationDetailsCard";
import ProjectDetailsCard from "./ProjectDetailsCard";
import KeySkillsCard from "./KeySkillsCard";
import SkillBadgesGrid from "./SkillBadgesGrid";
import "./ATSUpdateComponent.css";
import {useState} from "react";

const ATSUpdateComponent = () => { 
    const { user } = useUserContext();
    const applicantId = user?.id;
const [loadedSections, setLoadedSections] = useState({
      
      summary: false,
      personal: false,
       education: false,
       projects: false,
       skills: false
      
    });
    const markLoaded = (section) => {
      setLoadedSections((prev) => ({
        ...prev,
        [section]: true
      }));
    };
    const allLoaded = Object.values(loadedSections).every(Boolean);
  return (
        <div className="ats-update-container">
            <div className="ats-update-header">
                <h2 className="ats-update-title">Update your resume</h2>
            </div>
            <div className="ats-update-content">
                  <ResumeSummaryCard applicantId={applicantId}  
                onLoaded={() => markLoaded("summary")}
  showContent={allLoaded}/>
                <PersonalDetailsCard applicantId={applicantId} 
                  onLoaded={() => markLoaded("personal")}
  showContent={allLoaded}/>
                <EducationDetailsCard applicantId={applicantId} 
                  onLoaded={() => markLoaded("education")}
  showContent={allLoaded}/>
                <ProjectDetailsCard applicantId={applicantId} 
                  onLoaded={() => markLoaded("projects")}
  showContent={allLoaded}/>
                <KeySkillsCard applicantId={applicantId} 
                  onLoaded={() => markLoaded("skills")}
  showContent={allLoaded}       />
                <SkillBadgesGrid applicantId={applicantId} />
            </div>
        </div>
    );
};

export default ATSUpdateComponent;
