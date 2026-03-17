import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../../../stylesheets/dashboard.css";
import template1 from "./template1.png";
import "./ResumeTemplates.css";
import ProcessingLoader from "../ProcessingLoader";
import { useUserContext } from "../../common/UserProvider";
import { useResume } from "../ResumeContext";
import Overlay from "./Overlay";
import JobDescriptionModal from "./JobDescriptionModel";
import resumeBackButton from "./resume-back-button.png";
import { useEffect } from "react";
import { apiUrl } from "../../../services/ApplicantAPIService";

const ResumeTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { resumeState, updateResumeState } = useResume();
 const { user } = useUserContext();
 const[showJD, setShowJD] = useState(false);
const applicantId = user?.id;
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.stopPropagation();

    if (!selectedTemplate) {
      alert("Please select a template");
      return;
    }

    try {
      // open loader
      setIsOpen(true);

      const jwt = localStorage.getItem("jwtToken");

      // actual API call
      const response = await axios.post(
        `${apiUrl}/api/resume/download/resume`,
        // "http://localhost:8081/api/resume/download/resume",
        {
          applicantId: applicantId,
          resumeVersion: selectedTemplate,
          jd: resumeState.jobDescription || "",
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          responseType: "blob", 
        }
      );

      
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = window.URL.createObjectURL(file);
      updateResumeState("pdfUrl", fileURL);
updateResumeState("templateId", selectedTemplate);



      
      setIsOpen(false);

     
      navigate("/resume-preview", {
        state: { pdfUrl: fileURL },
       
      });

    } catch (error) {
      console.error("Generate resume failed:", error);

      setIsOpen(false);

      alert("Failed to generate resume. Please try again.");
    }
  };

  useEffect(() => {
    console.log("Resume state in templates:", resumeState);
  }, []);

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>

      <div className="dashboard__content resume-template">
        <div className="resume-template-header">
        <img src={resumeBackButton} alt="Back" onClick={() => setShowJD(true)} />
        <h2 className="title">Select ATS Resume Template</h2>
        </div>

        <div className="resume-wrapper">
          
          <div className="template-container">
            {[1, 2, 3, 4].map((id) => (
              <div
                key={id}
                className={`template-card ${
                  selectedTemplate === id ? "active" : ""
                }`}
                onClick={() => setSelectedTemplate(id)}
              >
                <img src={template1} alt={`template${id}`} />
                <p><b>
                  {id === 1 && "Professional Classic"}
                  {id === 2 && "Modern Executive"}
                  {id === 3 && "Creative Designer"}
                  {id === 4 && "Technical Developer"}
                </b></p>

                {selectedTemplate === id && (
                  <button onClick={handleGenerate}>
                    Generate Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* loader */}
      {isOpen && <ProcessingLoader isOpen={isOpen} />}
       {showJD && (
  <Overlay onClose={() => setShowJD(false)}>
    <JobDescriptionModal 
       onClose={() => setShowJD(false)}
       onFinish={(jobText) => {
          // 1. Store the JD (will be "" if they skip)
          updateResumeState('jobDescription', jobText);
          
          
          // 2. Close the modal
          setShowJD(false);
          
          // 3. Navigate to the Templates page     
          navigate('/resume-templates');
       }}
    />
  </Overlay>
)}
    </div>
  );
 
};

export default ResumeTemplates;
