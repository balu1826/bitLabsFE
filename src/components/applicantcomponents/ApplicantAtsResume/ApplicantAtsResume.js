import Overlay from "./Overlay";
//  import { useState } from 'react';
import React, { useState } from "react";
import JobDescriptionModal from "./JobDescriptionModel";
import { useResume } from "../ResumeContext";
import { useNavigate } from "react-router-dom";
import ApplicantViewProfile from "../ApplicantViewProfile";

const ApplicantAtsResume = ({ applicantId, onLoaded, showContent}) => {
  const [showJD, setShowJD] = useState(false);
  const [continueButton, setContinueButton] = useState(false);
  // const { updateResumeState } = useResume();
  const navigate = useNavigate();
  const { resumeState, updateResumeState } = useResume();

  const shimmerAnimation = `
    @keyframes shimmer {
      0% { transform: translateX(-150%) skewX(-25deg); }
      100% { transform: translateX(150%) skewX(-25deg); }
    }
  `;

  // Main background container to frame the action
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    margin: "20px 0",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #f0f0f0", // Subtle border like your other cards
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  };

  const buttonStyle = {
    position: "relative",

    overflow: "hidden",
    background: "transparent linear-gradient(286deg, #FBBB5C 0%, #E66A0E 100%) 0% 0% no-repeat padding-box",
    color: "#FFFFFF",
    padding: "16px 40px",
    borderRadius: "50px", // Full pill shape for a modern look
    border: "none",
    fontWeight: "500",
    fontSize: "14px",
    letterSpacing: "0.5px",
    textTransform: "none",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontFamily: "inherit",
  };
if (!showContent) {
  return (
    <div style={containerStyle}>
      <div
        className="skeleton"
        style={{
          width: "320px",
          height: "16px",
          marginBottom: "24px",
          borderRadius: "6px"
        }}
      />

      <div
        className="skeleton"
        style={{
          width: "220px",
          height: "48px",
          borderRadius: "30px"
        }}
      />
    </div>
  );
}
  return (
    <div style={containerStyle}>
      <style>{shimmerAnimation}</style>

      {/* Optional Tagline to fill space */}
      <p style={{ color: "#717171", marginBottom: "24px", fontSize: "14px" }}>
        Ready to apply? Let's build your ATS-Optimized resume.
      </p>

      <button
        style={buttonStyle}
        onMouseEnter={(e) => {
          // e.currentTarget.style.transform = 'translateY(-3px)';
          // e.currentTarget.style.boxShadow = '0 12px 30px rgba(249, 115, 22, 0.45)';
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow =
            "0 12px 30px rgba(249, 115, 22, 0.45)";
          e.currentTarget.style.background = "#FFFFFF";
          e.currentTarget.style.color = "#E66A0E";
          e.currentTarget.style.border = "2px solid #E66A0E";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 10px 25px rgba(249, 115, 22, 0.3)";
          e.currentTarget.style.background =
            "transparent linear-gradient(286deg, #FBBB5C 0%, #E66A0E 100%) 0% 0% no-repeat padding-box";
          e.currentTarget.style.color = "#FFFFFF";
          e.currentTarget.style.border = "none";
        }}
        onClick={() => setShowJD(true)}
      >
        {/* Shimmer Effect Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
            animation: "shimmer 3s infinite",
          }}
        />

        <span style={{ position: "relative", zIndex: 1 }}>
       Generate ATS Resume
        </span>
      </button>

      {showJD && (
        <Overlay onClose={() => setShowJD(false)}>
          <JobDescriptionModal
            onClose={() => setShowJD(false)}
            onFinish={(jobText) => {
              // 1. Store the JD (will be "" if they skip)
              updateResumeState("jobDescription", jobText);

              console.log("Stored Job Description:", jobText);
              console.log("Resume State:", resumeState);

              // 2. Close the modal
              setShowJD(false);

              // 3. Navigate to the Templates page
              navigate("/resume-templates");
            }}
          />
        </Overlay>
      )}
    </div>
  );
};

export default ApplicantAtsResume;
