import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Snackbar from "../common/Snackbar";
import { apiUrl } from "../../services/ApplicantAPIService";
import EducationDetailsEditPopup from "./EducationDetailsEditPopup";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const EDU_API = `${apiUrl}/applicant-education`;


const Section = ({ title, children, open, onToggle }) => (
  <div className="card-base" style={{ margin: 0 }}>
    <div className="card-title-row" style={{ marginBottom: 12 }}>
      <h4 className="card-title" style={{ fontSize: 14 }}>
        {title} <span className="req">*</span>
      </h4>
      <button
        type="button"
        className="edit-chip"
        onClick={onToggle}
        aria-label={open ? "Collapse section" : "Expand section"}
      >
        {open ? "−" : "+"}
      </button>
    </div>
    {open && children}
  </div>
);

const EducationDetailsCard = ({ applicantId }) => {
  const [data, setData] = useState(null);
  const [openGrad, setOpenGrad] = useState(true);
  const [openXII, setOpenXII] = useState(true);
  const [openX, setOpenX] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);

  const addSnackbar = (snackbar) => setSnackbars((p) => [...p, snackbar]);
  const handleCloseSnackbar = (i) =>
    setSnackbars((p) => p.filter((_, idx) => idx !== i));

  const fetchEducation = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const { data } = await axios.get(`${EDU_API}/${applicantId}/getApplciantEducationDetails`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setData(data || {});
    } catch (e) {
      console.error("Education GET failed:", e?.response || e);
      setData({
        graduation: {},
        classXii: {},
        classX: {},
      });
    }
  };

  useEffect(() => {
    if (applicantId) fetchEducation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId]);

  const g = useMemo(() => data?.graduation || {}, [data]);
  const xii = useMemo(() => data?.classXii || {}, [data]);
  const x = useMemo(() => data?.classX || {}, [data]);

  return (
    <>
      <div className="col-lg-12 col-md-12 common_style">
        <div className="card-base soft-shadow">
          <div className="card-title-row">
            <div>
              <h3 className="card-title">Education details <span className="req">*</span></h3>
              <p className="card-subtitle">
                Details like course, university, and more, help recruiters identify your educational background
              </p>
            </div>
            <button
              type="button"
              className="portfolio-edit-btn"
              onClick={() => setEditOpen(true)}>
              Edit <FontAwesomeIcon icon={faPen} style={{ marginRight: "6px" }} />
            </button>
          </div>

          {/* Graduation */}
          <Section
            title="Graduation details"
            open={openGrad}
            onToggle={() => setOpenGrad((v) => !v)}
          >
            <div className="pd-grid">
              {/* row 1 */}
              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!g.degree ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                    {g.degree || "Graduation/Diploma"}
                  </div>
                  <span className="pd-caret">▾</span>
                </div>
              </div>
              <input
                className={`pd-input common_style ${!g.university ? 'placeholder' : ''}`}
                readOnly
                placeholder="University / Institute"
                value={g.university || ""}
              />

              {/* row 2 */}
              <input
                className={`pd-input common_style ${!g.specialization ? 'placeholder' : ''}`}
                readOnly
                placeholder="Specialization"
                value={g.specialization || ""}
              />
              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!g.courseType ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                    {g.courseType || "Course type"}
                  </div>
                  <span className="pd-caret">▾</span>
                </div>
              </div>

              {/* row 3 */}
              <div className="pd-with-icon">
                <input
                  className={`pd-input raw common_style ${!g.startYear ? 'placeholder' : ''}`}
                  readOnly
                  placeholder="Course start year"
                  value={g.startYear || ""}
                />
                <span className="pd-icon common_style" aria-hidden>📅</span>
              </div>

              <div className="pd-with-icon">
                <input
                  className={`pd-input raw common_style ${!g.endYear ? 'placeholder' : ''}`}
                  readOnly
                  placeholder="Course ending year"
                  value={g.endYear || ""}
                />
                <span className="pd-icon common_style" aria-hidden>📅</span>
              </div>

              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!g.marksPercent ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                       {g.marksPercent != null ? `${g.marksPercent}%` :"Marks in % (35-100)"}
                  </div>
                </div>
              </div>

            </div>
          </Section>

          {/* Class XII */}
          <Section
            title="Class XII details"
            open={openXII}
            onToggle={() => setOpenXII((v) => !v)}
          >
            <div className="pd-grid">
              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!xii.board ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                    {xii.board || "Board of education"}
                  </div>
                  <span className="pd-caret">▾</span>
                </div>
              </div>

              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!xii.passingYear ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                    {xii.passingYear || "Passing out year"}
                  </div>
                  <span className="pd-caret">▾</span>
                </div>
              </div>

              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!xii.marksPercent ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                         {xii.marksPercent != null ? `${xii.marksPercent}%` :"Marks in % (35-100)"}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Class X */}
          <Section
            title="Class X details"
            open={openX}
            onToggle={() => setOpenX((v) => !v)}
          >
            <div className="pd-grid">
              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!x.board ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                    {x.board || "Board of education"}
                  </div>
                  <span className="pd-caret">▾</span>
                </div>
              </div>

              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!x.passingYear ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                    {x.passingYear || "Passing out year"}
                  </div>
                  <span className="pd-caret">▾</span>
                </div>
              </div>

              <div className="pd-select-wrap">
                <div className={`profile-dropdown common_style ${!x.marksPercent ? 'placeholder' : ''}`}>
                  <div className="pd-selected">
                    {x.marksPercent != null ? `${x.marksPercent}%` :"Marks in % (35-100)"}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit education details"
        className="modal-content2"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <FontAwesomeIcon
            icon={faTimes}
            onClick={() => setEditOpen(false)}
            style={{ cursor: "pointer", color: "#333" }}
          />
        </div>

        <EducationDetailsEditPopup
          applicantId={applicantId}
          initial={data || { graduation: {}, classXii: {}, classX: {} }}
          onSuccess={async () => {
            await fetchEducation();
            setEditOpen(false);
            addSnackbar({ message: "Education details saved successfully!", type: "success" });
          }}
          onError={(msg) =>
            addSnackbar({ message: msg || "Failed to save education details", type: "error" })
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

export default EducationDetailsCard;
