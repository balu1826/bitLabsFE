// src/components/applicant/ApplicantHeaderComponent.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import BasicDetailsEditPopup from "./BasicDetailsEditPopup";
import Snackbar from "../common/Snackbar";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from '../common/UserProvider';
import { useRefresh } from "../common/RefreshContext";

Modal.setAppElement("#root");

const PHOTO_GET_API = `${apiUrl}/applicant-image/getphoto`;
// new: score API base
const SCORE_API = `${apiUrl}/applicant-scores/applicant`;

// NOTE: Upload endpoint used by uploader component: `${apiUrl}/applicant-image/${id}/upload`

const DEFAULT_CARD = {
  name: "",
  role: "—",
  mobileNumber: "",
  email: "",
  passOutyear: "",
  address: "",
  lastUpdated: null
};

/**
 * UploadImageComponent
 * - Integrated uploader UI (adapted from the code you provided)
 * - Accepts `id` (applicant id) and `onSuccess` callback which will be called after successful upload
 */
const UploadImageComponent = ({ id, onSuccess, onClose }) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [snackbars, setSnackbars] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (["jpeg", "jpg", "png"].includes(fileExtension)) {
      if (file.size < 5 * 1024 * 1024) {
        setPhotoFile(file);
        setFileName(file.name);
        setError("");
      } else {
        setError("File size must be less than 5 MB.");
        setPhotoFile(null);
        setFileName("");
      }
    } else {
      setError("Only JPEG and PNG files are allowed.");
      setPhotoFile(null);
      setFileName("");
    }
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prev) => [...prev, snackbar]);
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const formData = new FormData();
      // backend expects field name 'photo' in this uploader implementation
      formData.append("photo", photoFile);

      const response = await axios.post(`${apiUrl}/applicant-image/${id}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      console.log("Photo uploaded successfully:", response.data);
      addSnackbar({ message: "Photo uploaded successfully", type: "success" });

      // call parent success handler (so it can re-fetch photo) and close modal
      if (typeof onSuccess === "function") {
        try {
          await onSuccess();
        } catch (e) {
          // ignore parent errors but log
          console.warn("onSuccess handler failed", e);
        }
      }

      // small delay to let user see snackbar if desired, then close uploader
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("Error uploading photo:", err?.response || err);
      setError("Failed to upload photo. Please try again.");
      addSnackbar({ message: "Failed to upload photo", type: "error" });
    }
  };

  return (
    <div id="upload-profile" style={{ padding: "20px", maxWidth: "560px", margin: "0 auto" }}>
      <div style={{ marginBottom: "10px", fontSize: "16px", fontWeight: 600 }}>
        Upload your profile picture: <span style={{ fontWeight: 400 }}>JPG or PNG (≤ 5 MB)</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#F3F4F6",
          borderRadius: "8px",
          padding: "2px 12px",
          marginBottom: "18px",
          border: "1px solid #D1D5DB",
          position: "relative",
        }}
      >
        <input
          type="file"
          id={`profile-upload-${id}`}
          accept="image/jpeg, image/png"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>

        <input
          type="text"
          value={fileName}
          readOnly
          placeholder="No file chosen"
          style={{
            flex: 1,
            padding: "1px 1px 1px 36px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: fileName ? "#3B82F6" : "#9CA3AF",
            fontSize: "13px",
            fontWeight: 500,
            outline: "none",
            minWidth: "280px",
          }}
        />

        <label
          htmlFor={`profile-upload-${id}`}
          style={{
            backgroundColor: "#6B7280",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Choose File
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#6B7280", fontSize: "13px" }}>{error || "\u00A0"}</div>
        <div>
          <button
            type="button"
            onClick={uploadPhoto}
            disabled={!photoFile}
            style={{
              backgroundColor: photoFile ? "#FB923C" : "#E5E7EB",
              color: photoFile ? "#fff" : "#9CA3AF",
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: photoFile ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            Upload Photo
          </button>
        </div>
      </div>

      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => {
            const newList = [...snackbars];
            newList.splice(index, 1);
            setSnackbars(newList);
          }}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      ))}
    </div>
  );
};

const ApplicantHeaderComponent = ({ applicantId }) => {
  const [card, setCard] = useState(DEFAULT_CARD);
  const [editOpen, setEditOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("../images/user/avatar/profile-pic.png");
  const [uploading, setUploading] = useState(false);
  const [dashboardScore, setDashboardScore] = useState(0);
  const [cappedScore, setCappedScore] = useState(0);
  const { user } = useUserContext();
  const CARD_API = `${apiUrl}/applicant-card/${user?.id}/getApplciantCard`;
  const { refreshKey } = useRefresh();

  const bronzeScore = 150;
  const silverScore = 300;
  const goldScore = 500;

  const bronzeWidth = (bronzeScore / goldScore) * 100;
  const silverWidth = ((silverScore - bronzeScore) / goldScore) * 100;
  const goldWidth = ((goldScore - silverScore) / goldScore) * 100;

  const badgeLevels = [
    { name: "bronze", score: bronzeScore },
    { name: "silver", score: silverScore },
    { name: "gold", score: goldScore },
  ];

  const earnedBadges = badgeLevels.filter(level => cappedScore >= level.score);
  const nextBadge = badgeLevels.find(level => cappedScore < level.score);

  let progressPercentage = 100;

  if (nextBadge) {
    progressPercentage =
      ((cappedScore) / (nextBadge.score)) * 100;
    progressPercentage = Math.min(Math.max(progressPercentage, 0), 100);
  }


  const fetchCard = async () => {
    try {
      if (!applicantId) return;
      const jwtToken = localStorage.getItem("jwtToken");

      // 1) Fetch applicant card
      const { data: cardData } = await axios.get(`${CARD_API}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      // 2) Fetch SCORE
      let scoreFromScoresApi = 0;

      try {
        const { data: scoreRes } = await axios.get(
          `${SCORE_API}/${applicantId}/getTotalScore`,
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );

        console.debug("RAW SCORE RESPONSE:", scoreRes);

        // ---------------------------
        // CASE A: JSON OBJECT
        // ---------------------------
        if (scoreRes && typeof scoreRes === "object") {
          scoreFromScoresApi =
            scoreRes.totalScore ??
            scoreRes.score ??
            0;
        }

        // ---------------------------
        // CASE B: NUMBER
        // ---------------------------
        else if (typeof scoreRes === "number") {
          scoreFromScoresApi = scoreRes;
        }

        // ---------------------------
        // CASE C: STRING (YOUR CASE)
        // Example: "Total score for applicant ID 16553 is 4"
        // ---------------------------
        else if (typeof scoreRes === "string") {
          let parsed = 0;

          // Priority patterns → catch the real score
          const patterns = [
            /is\s+(-?\d+)\b/i,
            /score\s*[:\-]\s*(-?\d+)\b/i,
            /total\s+score\s+is\s+(-?\d+)\b/i,
            /total\s+score\s*[:\-]\s*(-?\d+)\b/i
          ];

          for (const regex of patterns) {
            const match = scoreRes.match(regex);
            if (match) {
              parsed = parseInt(match[1], 10);
              break;
            }
          }

          // Fallback → last number in the string (prevents picking ID)
          if (!parsed) {
            const allNumbers = scoreRes.match(/-?\d+/g);
            if (allNumbers?.length) {
              parsed = parseInt(allNumbers[allNumbers.length - 1], 10);
            }
          }

          scoreFromScoresApi = Number.isFinite(parsed) ? parsed : 0;
          setDashboardScore(scoreFromScoresApi);
          setCappedScore(Math.min(scoreFromScoresApi, goldScore));
        }
      } catch (e) {
        console.warn("Scores API failed; falling back to profile-view", e?.response || e);

        // FALLBACK SCORE
        try {
          const { data: pv } = await axios.get(
            `${apiUrl}/applicantprofile/${applicantId}/profile-view`,
            { headers: { Authorization: `Bearer ${jwtToken}` } }
          );

          scoreFromScoresApi =
            pv?.applicant?.overallScore ??
            pv?.score ??
            scoreFromScoresApi ??
            0;

        } catch (innerErr) {
          console.warn("Profile-view failed; using 0", innerErr?.response || innerErr);
        }
      }

      // FINAL SET
      setCard({
        ...DEFAULT_CARD,
        ...(cardData || {}),
        score: scoreFromScoresApi
      });
    } catch (e) {
      console.error("Failed to load applicant card:", e?.response || e);
      setCard({ ...DEFAULT_CARD });
    }
  };



  const fetchPhoto = async () => {
    try {
      if (!applicantId) return;
      const jwtToken = localStorage.getItem("jwtToken");
      // appended timestamp to bust caches
      const res = await axios.get(`${apiUrl}/applicant-image/getphoto/${applicantId}?t=${Date.now()}`, {
        responseType: "arraybuffer",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const base64 = btoa(
        new Uint8Array(res.data).reduce((s, b) => s + String.fromCharCode(b), "")
      );
      const mime = res.headers["content-type"] || "image/jpeg";
      setImageSrc(`data:${mime};base64,${base64}`);
    } catch (err) {
      // fallback to default avatar
      setImageSrc("../images/user/avatar/profile-pic.png");
    }
  };

  useEffect(() => {
    fetchCard();
    fetchPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId, refreshKey]);

  const fullName = useMemo(() => (card?.name?.trim() ? card.name : "—"), [card]);
  const roleTitle = useMemo(() => (card?.role?.trim() ? card.role : DEFAULT_CARD.role), [card]);
  const phoneText = useMemo(() => (card?.mobileNumber?.trim() ? card.mobileNumber : "—"), [card]);
  const emailText = useMemo(() => (card?.email?.trim() ? card.email : "—"), [card]);
  const passOutText = useMemo(() => (card?.passOutyear ? `Pass-out: ${card.passOutyear}` : "—"), [card]);
  const locationText = useMemo(() => (card?.address || ""), [card]);

  // Format and show "last updated"
  const updatedOnText = useMemo(() => {
    const arr = card?.lastUpdated;
    if (!arr || !Array.isArray(arr)) return "Not updated yet";
    const [year, month, day, hour, minute, second] = arr;
    const millisecond = Math.floor(arr[6] / 1_000_000);
    const date = new Date(year, month - 1, day, hour, minute, second, millisecond);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [card?.lastUpdated]);

  return (
    <>
      <div className="portfolio-card">
        {/* left cluster */}
        <div className="portfolio-left">
          <div className="portfolio-avatar-wrap">
            <img
              className="portfolio-avatar"
              src={imageSrc}
              alt={`${fullName} profile`}
              onError={(e) => (e.currentTarget.src = "../images/user/avatar/profile-pic.png")}
            />

            {/* Pen / edit button overlay (opens image modal) */}
            <button
              type="button"
              className="portfolio-camera-btn"
              onClick={() => setImageModalOpen(true)}
              title={uploading ? "Uploading..." : "Edit photo"}
              disabled={uploading}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          </div>

          <div className="portfolio-meta">
            <div className="portfolio-name-row">
              <span className="badges">
                {earnedBadges.map(badge => (
                  <img
                    key={badge.name}
                    src={`./images/dashboard/badge-${badge.name}.png`}
                    width="15"
                    height="23"
                  />
                ))}
              </span>
              <button
                type="button"
                className="portfolio-edit-btn"
                onClick={() => setEditOpen(true)}
              >
                Edit <FontAwesomeIcon icon={faPen} style={{ marginLeft: 6 }} />
              </button>
            </div>
            <h3 className="portfolio-name">{fullName}</h3>
            <p className="portfolio-role">{roleTitle}</p>
            <p className="portfolio-updated">Portfolio last updated – {updatedOnText}</p>
          </div>
        </div>

        {/* divider */}
        <div className="portfolio-divider" aria-hidden="true" />

        {/* middle */}
        <div className="portfolio-middle common_style">
          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 5a2 2 0 012-2h2l2 5-2 1a13 13 0 006 6l1-2 5 2v2a2 2 0 01-2 2h-1C9.716 19 5 14.284 5 8V7a2 2 0 012-2H7"
                stroke="#9E9E9E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{phoneText}</span>
          </div>

          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#9E9E9E" strokeWidth="1.5" />
              <path d="M22 8l-10 6L2 8" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{emailText}</span>
          </div>

          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{passOutText}</span>
          </div>

          <div className="portfolio-row">
            <svg className="portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 22s7-5.686 7-12a7 7 0 0 0-14 0c0 6.314 7 12 7 12Z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" stroke="#9E9E9E" strokeWidth="1.5" />
            </svg>
            <span>{locationText}</span>
          </div>
        </div>

        {/* right score */}
        <div className="portfolio-right common_style">
          <p className="portfolio-score-label">Score</p>
          <div className="portfolio-score">{card?.score ?? 0}</div>
        </div>      </div>
      <div className="badge-progress-wrapper common_style" style={{ width: "100%", height: "130px", padding: "5px 15px", margin: "0" }}>
        <div className="progress-text">
          <p>Badge achievement level</p>
          {Math.round((cappedScore / goldScore) * 100)}%
        </div>
        <div style={{ position: "relative" }}>
          <div className="badge-bar">

            <div className="segment bronze" style={{ width: `${bronzeWidth}%` }}>
              <span>Bronze</span>
            </div>

            <div className="segment silver" style={{ width: `${silverWidth}%` }}>
              <span>Silver</span>
            </div>

            <div className="segment gold" style={{ width: `${goldWidth}%` }}>
              <span>Gold</span>
            </div>

            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (cappedScore / goldScore) * 100)}%`,
              }}
            ></div>
          </div>

          <div
            className="bubble-indicator"
            style={{
              left: `${(cappedScore / goldScore) * 100}%`,
              transform: "translateX(-50%)",
              bottom: "4px",
              zIndex: "1",
              minWidth: "60px"
            }}
          >
            {cappedScore} / {nextBadge ? nextBadge.score : goldScore}
          </div>

          {!nextBadge && (
            <p className="congrats-text"> Congrats Buddy! You unlocked all badges!</p>
          )}
        </div>
      </div>

      {/* Edit modal (basic details) */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Details"
        className="modal-content2"
        overlayClassName="modal-overlay"
      >
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <FontAwesomeIcon
            icon={faTimes}
            onClick={() => setEditOpen(false)}
            style={{ cursor: "pointer", color: "#333" }}
          />
        </div>

        <BasicDetailsEditPopup
          initial={{
            name: card?.name || "",
            role: card?.role || "",
            mobileNumber: card?.mobileNumber || "",
            passOutyear: card?.passOutyear || "",
            address: card?.address || "",
            email: card?.email || "",
          }}
          applicantId={applicantId}
          onSuccess={async () => {
            await fetchCard();
            setEditOpen(false);
          }}
        />
      </Modal>

      {/* Image upload modal */}
      <Modal
        isOpen={imageModalOpen}
        onRequestClose={() => setImageModalOpen(false)}
        contentLabel="Upload Photo"
        className="modal-content2"
        overlayClassName="modal-overlay"
      >
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <FontAwesomeIcon
            icon={faTimes}
            onClick={() => setImageModalOpen(false)}
            style={{ cursor: "pointer", color: "#333" }}
          />
        </div>

        <UploadImageComponent
          id={applicantId}
          onSuccess={async () => {
            // re-fetch photo and card to reflect new image (and any server-side changes)
            await fetchPhoto();
            await fetchCard();
          }}
          onClose={() => setImageModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default ApplicantHeaderComponent;
