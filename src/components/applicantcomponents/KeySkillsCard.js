// src/components/applicant/KeySkillsCard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import KeySkillsEditPopup from "./KeySkillsEditPopup";
import { apiUrl } from "../../services/ApplicantAPIService";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useResume } from "./ResumeContext";

const SKILLS_API = (id) => `${apiUrl}/applicantprofile/${id}/skills`;

const KeySkillsCard = ({ applicantId, onLoaded, showContent }) => {
  const { setProfileData } = useResume();
  const [skills, setSkills] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchSkills = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const { data } = await axios.get(SKILLS_API(applicantId), {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setSkills(Array.isArray(data) ? data : []);
    } catch (e) {
      // keep empty; show friendly help text on UI
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSkills = async () => {
    if (!applicantId) return;

    try {
      await fetchSkills();
    } catch (err) {
      console.warn("Skills API error:", err);
    }

    console.log("SKILLS LOADED");
    onLoaded?.();
  };

  loadSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId]);
  
  useEffect(() => {
    if (skills.length > 0) {
      setProfileData(prev => ({
        ...prev,
        keySkills: skills // This adds the data to the global state
      }));
    }
  }, [skills]);

  return (
    <div className="card-base soft-shadow card-skills common_style" style={{ overflow: "hidden" }}>
      <div className="card-title-row">
        <h3 className="card-title">Key skills <span className="req">*</span></h3>
        <button
          type="button"
          className="portfolio-edit-btn"
          onClick={() => setOpen(true)}>
          Edit <FontAwesomeIcon icon={faPen} style={{ marginRight: "6px" }} />
        </button>
      </div>
      <p className="card-subtitle" style={{ marginBottom: 12 }}>
        Add skills that best define your expertise (e.g., Java, React, SQL). Minimum 1.
      </p>
{!showContent ? (
  <div className="skills-pad">
    <div className="skills-list">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width: 100,
            height: 32,
            borderRadius: 20,
            marginRight: 10,
            marginBottom: 10
          }}
        />
      ))}
    </div>
  </div>
)  : skills.length ? (
 
        <div className="skills-pad">
          <div className="skills-list">
            {skills.map((s) => (
              <div key={s} className="skill-chip">
                {s}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="skills-pad">
          <div style={{ color: "#777" }}>
            No skills added yet. Click <b>Edit</b> to add your first skill.
          </div>
        </div>
      )}

      <KeySkillsEditPopup
        applicantId={applicantId}
        isOpen={open}
        onClose={() => setOpen(false)}
        onSaved={fetchSkills}
        initialSkills={skills}
        className="modal-content2 keyskills"
      />
    </div>
  );
};

export default KeySkillsCard;
