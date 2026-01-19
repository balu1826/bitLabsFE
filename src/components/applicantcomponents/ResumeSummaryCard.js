import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Snackbar from "../common/Snackbar";
import ResumeSummaryEditPopup from "./ResumeSummaryEditPopup";
import { apiUrl } from "../../services/ApplicantAPIService";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const SUMMARY_API = `${apiUrl}/applicant-summary`;

// Help text (shown only if summary is NULL or empty)
const HELP_TEXT =
  "Try adding a resume summary — it helps employers quickly understand your strengths, tech stack, and professional goals.";

const ResumeSummaryCard = ({ applicantId }) => {
  const [summary, setSummary] = useState("");
  const [open, setOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);

  const addSnackbar = (snackbar) => setSnackbars((prev) => [...prev, snackbar]);
  const handleCloseSnackbar = (index) =>
    setSnackbars((prev) => prev.filter((_, i) => i !== index));

  const fetchSummary = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const { data } = await axios.get(`${SUMMARY_API}/${applicantId}/getApplicantSummary`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setSummary((data).trim());
    } catch (e) {
      console.error("Failed to load summary:", e?.response || e);
      setSummary(""); // fallback to help text
    }
  };

  useEffect(() => {
    if (applicantId) fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId]);

  const displayText =
    summary && summary.length > 0 ? summary : HELP_TEXT;

  return (
    <>
      <div className="col-lg-12 col-md-12 common_style">
        <div className="card-base soft-shadow">
          <div className="card-title-row">
            <h4 className="card-title">
              Resume summary <span className="req">*</span>
            </h4>
            <button
              type="button"
              className="portfolio-edit-btn"
              onClick={() => setOpen(true)}>
              Edit <FontAwesomeIcon icon={faPen} style={{ marginRight: "6px" }} />
            </button>
          </div>

          <p
            className="summary-text">
            {displayText}
          </p>
        </div>
      </div>

      <Modal
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        contentLabel="Edit Resume Summary"
        className="modal-content2"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <FontAwesomeIcon
            icon={faTimes}
            onClick={() => setOpen(false)}
            style={{ cursor: "pointer", color: "#333" }}
          />
        </div>

        <ResumeSummaryEditPopup
          initialSummary={summary}
          applicantId={applicantId}
          onSuccess={async () => {
            await fetchSummary();
            setOpen(false);
            addSnackbar({
              message: "Summary updated successfully!",
              type: "success",
            });
          }}
          onError={(msg) =>
            addSnackbar({
              message: msg || "Failed to update summary",
              type: "error",
            })
          }
        />
      </Modal>

      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      ))}
    </>
  );
};

export default ResumeSummaryCard;
