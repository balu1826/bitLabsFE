import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import BackButton from "../common/BackButton";
import "./RecruiterHackathonViewRegistrations.css";

const RecruiterHackathonViewRegistrations = ({ hackathonId }) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [hackathon, setHackathon] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [declaringWinner, setDeclaringWinner] = useState(null);
  const [error, setError] = useState(null);

  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "";
    const [year, month = 1, day = 1] = dateArray;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "N/A";
    const [
      year,
      month = 1,
      day = 1,
      hour = 0,
      minute = 0,
      second = 0,
      millisecond = 0,
    ] = dateArray;

    const date = new Date(year, month - 1, day, hour, minute, second, millisecond);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!hackathonId) return;
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;

    const fetchData = async () => {
      try {
        setLoading(true);
        const candidateOrRecruiterId = user?.id || 0;
        const detailsResp = await axios.get(
          `${apiUrl}/api/hackathons/getHackathonDetails/${hackathonId}/${candidateOrRecruiterId}`
        );
        setHackathon(detailsResp.data || null);
        try {
          const regsResp = await axios.get(
            `${apiUrl}/hackathons/${hackathonId}/getAllHackathonRegistrations`
          );
          setRegistrations(regsResp.data || []);
        } catch (regErr) {
          console.warn("No registrations found or failed to fetch registrations", regErr);
          setRegistrations([]);
        }
        try {
          const subResp = await axios.get(
            `${apiUrl}/api/hackathons/${hackathonId}/getAllSubmissionsByHackathonId`
          );
          setSubmissions(subResp.data || []);
        } catch (subErr) {
          console.warn("No submissions found or failed to fetch submissions", subErr);
          setSubmissions([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load hackathon data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hackathonId, user?.id]);

  const handleViewSubmission = (submission) => {
    if (submission?.githubLink) {
      window.open(submission.githubLink, "_blank", "noopener,noreferrer");
    } else if (submission?.demoLink) {
      window.open(submission.demoLink, "_blank", "noopener,noreferrer");
    } else {
      alert("No GitHub or demo link available for this submission.");
    }
  };

  const handleDeclareWinner = async (registration) => {

    try {
      setDeclaringWinner(registration.id);
      const jwtToken = localStorage.getItem("jwtToken");

      await axios.post(
        `${apiUrl}/recruiter/hackathons/${hackathonId}/declare-winner/${registration.userId}`,
        {},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      const detailsResp = await axios.get(
        `${apiUrl}/api/hackathons/getHackathonDetails/${hackathonId}/${user?.id || 0}`
      );
      setHackathon(detailsResp.data || null);

      alert(`${registration.name} declared as the winner!`);
    } catch (err) {
      console.error("Error declaring winner:", err);
      alert("Failed to declare winner. Please try again.");
    } finally {
      setDeclaringWinner(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!hackathonId || !hackathon)
    return (
      <div className="dashboard__content">
        <p>No hackathon selected.</p>
        <BackButton onClick={() => navigate("/recruiter-hackathons")} />
      </div>
    );

  const registrationCount = hackathon.registrationCount ?? registrations.length;
  const submissionCount = hackathon.submissionCount ?? submissions.length;

  return (
    <div className="dashboard__content">
      <div className="row mr-0 ml-10">
        <div className="hackathon-page-wrapper" style={{ display: "flex", width: "100%", margin: "4% auto 0 auto" }}>
          <div className="hackathon-details-wrapper">
            <div className="hackathon-top-section">
              <BackButton className="hackathon-back-button" />
              <h1 className="hackathon-title">{hackathon?.title}</h1>
            </div>

            <div className="hackathon-body">
              <div className="hackathon-left-column">
                <section>
                  <h3>Description</h3>
                  <p>{hackathon?.description}</p>
                </section>

                {hackathon?.instructions && hackathon.instructions.trim() !== "" && (
                  <section>
                    <h3>Instructions</h3>
                    <ul>
                      {hackathon.instructions.split("\n").map((line, index) => (
                        <li key={index}>{line.replace(/^\d+\.\s*/, "")}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <div className="row side-by-side-section">
                  <div className="col-md-6">
                    <section>
                      <h3>Eligibility Criteria</h3>
                      <div className="hackathon-tag-list">
                        {hackathon.eligibility?.split(",").map((item, index) => (
                          <span key={index} className="hackathon-tag">{item.trim()}</span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="col-md-6">
                    <section>
                      <h3>Suggested Tech Stack</h3>
                      <div className="hackathon-tag-list">
                        {hackathon.allowedTechnologies?.split(",").map((tech, index) => (
                          <span key={index} className="hackathon-tech-tag">{tech.trim()}</span>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              <div className="hackathon-right-column">
                <div className="hackathon-banner-wrapper">
                  <img
                    src={hackathon?.bannerUrl}
                    alt={hackathon?.title}
                    className="hackathon-banner"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/900x300?text=No+Image")}
                  />
                  <span className={`hackathon-status-badge ${hackathon?.status?.toLowerCase()}`}>
                    {hackathon?.status}
                  </span>
                </div>

                <div className="hackathon-stats-wrapper">
                  <section className="hackathon-info-box">
                    <div>
                      <h3>Organized By</h3>
                      <p>{hackathon?.company}</p>
                    </div>
                    <div>
                      <h3>Start Date</h3>
                      <p>{formatDate(hackathon?.startAt)}</p>
                    </div>
                    <div>
                      <h3>End Date</h3>
                      <p>{formatDate(hackathon?.endAt)}</p>
                    </div>
                    {hackathon?.winner && (
                      <div>
                        <h3>Winner</h3>
                        <p>
                           {registrations.find(reg => reg.userId === hackathon.winner)?.name 
        ?? `User ${hackathon.winner}`}
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="hackathon-count">
                    <div className="hackathon-stat-card">
                      <h3>Registrations</h3>
                      <p>{registrationCount}</p>
                    </div>
                    <div className="hackathon-stat-card">
                      <h3>Submissions</h3>
                      <p>{submissionCount}</p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div
          className="hackathon-registrations-container"
          style={{
            flex: 1.5,
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            background: "#fff",
            margin: "-3% 15px 4% 15px",
            maxHeight: "fit-content",
          }}
        >
          <h3 className="hackathon-registrations-title">Registrations</h3>

          {registrations.length === 0 ? (
            <p className="hackathon-registrations-empty">No registrations yet.</p>
          ) : (
            <div className="hackathon-registrations-table-wrapper">
              <table className="hackathon-registrations-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Registered At</th>
                    <th>Technologies Used</th>
                    <th>Submission Status</th>
                    <th>Action</th>
                    <th>Declare Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => {
                    const submission = submissions.find(
                      (sub) => sub.userId === registration.userId
                    );
                    return (
                      <tr key={registration.id}>
                        <td>{registration.name || `User ${registration.userId}`}</td>
                        <td>{registration.registeredAt ? formatDateTime(registration.registeredAt) : "N/A"}</td>
                        <td>{submission ? submission.technologiesUsed : "—"}</td>
                        <td>
                          <span
                            className={
                              submission
                                ? "hackathon-status-submitted"
                                : "hackathon-status-not-submitted"
                            }
                          >
                            {submission ? "Submitted" : "Not Submitted"}
                          </span>
                        </td>
                        <td>
                          {submission ? (
                            <button
                              className="hackathon-btn-view-submission"
                              onClick={() => handleViewSubmission(submission)}
                            >
                              View Submission
                            </button>
                          ) : (
                            <span className="hackathon-no-submission">—</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={`hackathon-btn-declare-winner ${declaringWinner === registration.id ? "loading" : ""
                              }`}
                            onClick={() => handleDeclareWinner(registration)}
                            disabled={declaringWinner === registration.id || !!hackathon.winner} // disable if winner exists
                          >
                            {hackathon.winner === registration.name
                              ? "Winner"
                              : declaringWinner === registration.id
                                ? "Declaring..."
                                : "Declare Winner"}
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RecruiterHackathonViewRegistrations;
