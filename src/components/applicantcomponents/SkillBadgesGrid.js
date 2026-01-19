import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { SkillBadgeCard } from './VerifiedBadges';
import emptySkillImg from '../../images/skillbadge-empty-state-img.png';
import { useNavigate } from "react-router-dom";
import "./Portfolio.css";

const SkillBadgesGrid = () => {
  const { user } = useUserContext();
  const [data, setData] = useState({ skillsRequired: [], applicantSkillBadges: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const jwt = localStorage.getItem('jwtToken');
        const res = await axios.get(`${apiUrl}/skill-badges/${user.id}/skill-badges`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setData(res.data || { skillsRequired: [], applicantSkillBadges: [] });
      } catch (e) {
        console.error('Failed to load skill badges', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  if (loading) return null;

  const filteredBadges = data.applicantSkillBadges.filter((b) => {
    const status = (b?.status || b?.flag || "").toLowerCase();
    return status === "passed" || status === "failed";
  });

  // 👉 EMPTY STATE
  if (filteredBadges.length === 0) {
    return (
      <div
        className="empty-skill-state"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: "10px",
          textAlign: "center"
        }}
      >
        <img
          src={emptySkillImg}
          alt="No Skill Badges"
          style={{
            width: "100px",
            maxWidth: "100%",
            marginBottom: "20px",
            opacity: 0.9
          }}
        />
        <div className="skill-badge-empty-para">
          <p style={{ fontSize: "18px", color: "#000", cursor: "default" }}>
            Attend the skill test to get new badges
          </p>

          <span
            className="skill-test-btn"
            style={{
              margin: "0 5px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: 600,
              borderBottom: "1px solid #FF7600",
              color: "#FF7600",
            }}
            onClick={() => navigate("/applicant-verified-badges")}
          >
            SKILL VALIDATION
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-badges-grid">
      {filteredBadges.map((b) => (
        <SkillBadgeCard
          key={`app-${b.id}`}
          skillName={b.skillBadge?.name}
          status={(b?.status || b?.flag || "").toLowerCase()}
          testFailedAt={b.test_taken}
        />
      ))}
    </div>
  );
};

export default SkillBadgesGrid;
