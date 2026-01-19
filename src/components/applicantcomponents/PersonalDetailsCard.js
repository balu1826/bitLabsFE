// src/components/applicant/PersonalDetailsCard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Snackbar from "../common/Snackbar";
import PersonalDetailsEditPopup from "./PersonalDetailsEditPopup";
import { apiUrl } from "../../services/ApplicantAPIService";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { useRefresh } from "../common/RefreshContext";

const PERSONAL_API = `${apiUrl}/applicant-personal`;
const RESUME_API = `${apiUrl}/applicant-pdf`;

const PersonalDetailsCard = ({ applicantId }) => {
  const [bd, setBd] = useState(null);
  const [open, setOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const fileInputRef = useRef(null);
  const { refreshKey } = useRefresh();

  const addSnackbar = (snackbar) => setSnackbars((p) => [...p, snackbar]);
  const handleCloseSnackbar = (index) =>
    setSnackbars((p) => p.filter((_, i) => i !== index));

  const fetchBD = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const { data } = await axios.get(`${PERSONAL_API}/${applicantId}/getApplicantPersonalDetails`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setBd(data || {});
    } catch (e) {
      console.error("Failed to load personal details:", e?.response || e);
      setBd({});
    }
  };

  const probeResume = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const res = await axios.get(`${RESUME_API}/getresume/${applicantId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        responseType: "blob",
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      });
      setResumeAvailable(res.status !== 404 && res.data?.size > 0);
    } catch {
      setResumeAvailable(false);
    }
  };

  useEffect(() => {
    if (!applicantId) return;
    fetchBD();
    probeResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId, refreshKey]);

  const fullName = useMemo(() => (bd?.name || "").trim(), [bd]);
  const phone = bd?.phone || "";
  const email = bd?.email || "";
  const dob = bd?.dateOfBirth || "";
  const pincode = bd?.pincode || "";
  const address = bd?.address || "";
  const gender = bd?.gender || "";
  const languages = Array.isArray(bd?.knownLanguages) ? bd.knownLanguages.join(", ") : "";

  // resume upload handlers
  const onResumeClick = () => fileInputRef.current?.click();

  const onFilePicked = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const jwt = localStorage.getItem("jwtToken");
  const form = new FormData();
  // add both keys to cover either backend signature
  form.append("resume", file);
  form.append("file", file);

  // Try likely endpoint shapes
  const candidates = [
    `${RESUME_API}/${applicantId}/upload`, 
  ];

  let success = false, lastErr;

  for (const url of candidates) {
    try {
      await axios.post(url, form, { headers: { Authorization: `Bearer ${jwt}` } });
      success = true;
      addSnackbar({ message: "Resume uploaded successfully!", type: "success" });
      await probeResume?.(); // if you have this in your file
      break;
    } catch (err) {
      lastErr = err;
      // continue to try next candidate
    }
  }

  if (!success) {
    const status = lastErr?.response?.status;
    const url = lastErr?.config?.url;
    const serverText = typeof lastErr?.response?.data === "string" ? lastErr.response.data : "";
    addSnackbar({
      message: `Upload failed (${status || "network error"}) at ${url}. ${serverText ? serverText.slice(0,120) : ""}`,
      type: "error",
    });
  }

  e.target.value = "";
};

  const onViewResume = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const response = await axios.get(`${RESUME_API}/getresume/${applicantId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error fetching resume:", error);
      addSnackbar({ message: "Unable to open resume.", type: "error" });
    }
  };


  return (
    <>
      <div className="col-lg-12 col-md-12 common_style">
        <div className="card-base soft-shadow">
          <div className="card-title-row">
            <h4 className="card-title">
              Personal details <span className="req">*</span>
            </h4>
             <button
                                type="button"
                                className="portfolio-edit-btn"
                                onClick={() => setOpen(true)}>
                                Edit <FontAwesomeIcon icon={faPen} style={{ marginRight: "6px" }} />
                              </button>
          </div>

          <p className="card-subtitle">This information is important for employers to know you better</p>

          <div className="pd-grid">
            <input
              className={`pd-input common_style ${!fullName ? 'placeholder' : ''}`}
              readOnly
              placeholder="Enter full name"
              value={fullName || ""}
            />
             <div className="pd-select-wrap">
              <div className={`profile-dropdown common_style ${!gender ? 'placeholder' : ''}`}>
                <div className="pd-selected">
                  {gender || "choose gender"}
                </div>
                <span className="pd-caret">▾</span>
              </div>
            </div>
            <input
              className={`pd-input common_style ${!email ? 'placeholder' : ''}`}
              readOnly
              placeholder="Enter email"
              value={email || ""}
            />

            <input
              className={`pd-input common_style ${!phone ? 'placeholder' : ''}`}
              readOnly
              placeholder="Enter phone number"
              value={phone || ""}
            />
            <div className="pd-input with-icon">
              <input
                className={`pd-input raw common_style ${!dob ? 'placeholder' : ''}`}
                readOnly
                placeholder="Date of birth"
                value={dob || ""}
              />
              <span className="pd-icon common_style" aria-hidden>
                📅
              </span>
            </div>
            <input
              className={`pd-input common_style ${!pincode ? 'placeholder' : ''}`}
              readOnly
              placeholder="PIN code"
              value={pincode || ""}
            />

            <input
              className={`pd-input span-2 common_style ${!address ? 'placeholder' : ''}`}
              readOnly
              placeholder="Permanent address"
              value={address || ""}
            />
            <div className="pd-input with-add">
              <input
                className={`pd-input raw common_style ${!languages ? 'placeholder' : ''}`}
                readOnly
                placeholder="Known language(s)"
                value={languages || ""}
              />
            </div>
          </div>

          {/* Resume upload / view */}
          <div className="resume-drop common_style" tabIndex={0}>
            <div className="resume-drop-inner">
              <span className="resume-pill"  onClick={onResumeClick}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 16V8M8 12h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Resume upload
              </span>
              <div className="resume-note">Supported formats: pdf</div>
              {resumeAvailable && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ background: "#475569" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewResume();
                    }}
                  >
                    View current resume
                  </button>
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.rtf"
            style={{ display: "none" }}
            onChange={onFilePicked}
          />
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={open}
        onRequestClose={() => setOpen(false)}
        contentLabel="Edit Personal Details"
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

        <PersonalDetailsEditPopup
          applicantId={applicantId}
          initial={{
            fullName: fullName || "",
            gender: gender || "",
            email: email || "",
            phone: phone || "",
            dateOfBirth: dob || "",
            pincode: pincode || "",
            address: address || "",
            knownLanguages: Array.isArray(bd?.knownLanguages) ? bd.knownLanguages : [],
          }}
          onSuccess={async () => {
            await fetchBD();
            setOpen(false);
            addSnackbar({ message: "Personal details updated successfully!", type: "success" });
          }}
          onError={(msg) =>
            addSnackbar({ message: msg || "Failed to update personal details", type: "error" })
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
        />
      ))}
    </>
  );
};

export default PersonalDetailsCard;
