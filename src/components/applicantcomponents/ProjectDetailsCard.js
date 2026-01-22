import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Snackbar from "../common/Snackbar";
import { apiUrl } from "../../services/ApplicantAPIService";
import ProjectDetailsEditPopup from "./ProjectDetailsEditPopup";
import { faPen } from "@fortawesome/free-solid-svg-icons";

const PROJ_API = `${apiUrl}/applicant-projects`;

const ReadonlyInput = ({ placeholder, value }) => (
  <input
    className="pd-input common_style"
    readOnly
    placeholder={placeholder}
    value={value || ""}
  />
);

const ReadonlyTextarea = ({ placeholder, value }) => (
  <textarea
    className="pd-input common_style"
    readOnly
    placeholder={placeholder}
    value={value || ""}
    style={{ height: 120, resize: "none" }}
  />
);

const Pills = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ color: "#9E9E9E" }}>
        Add items
      </div>
    );
  }
  return (
    <div className="pd-input raw" style={{ background: "transparent" }}>
      <div className="skills-list">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="skill-chip">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

const ProjectDetailsCard = ({ applicantId }) => {
  const [items, setItems] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);
  const [isNewProject, setIsNewProject] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const width = useWindowWidth();
  const isMobile = width <= 992;

  const addSnackbar = (snackbar) => setSnackbars((p) => [...p, snackbar]);
  const handleCloseSnackbar = (idx) =>
    setSnackbars((p) => p.filter((_, i) => i !== idx));

  const fetchProjects = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const { data } = await axios.get(`${PROJ_API}/${applicantId}/getApplicantProjects`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Projects GET failed:", e?.response || e);
      setItems([]);
    }
  };

  function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handler = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
    }, []);

    return width;
  }

  useEffect(() => {
    if (applicantId) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId]);

  // Show the latest project if many exist; else empty placeholders
  const proj = useMemo(() => items[0] || {}, [items]);

  // normalized lists for read-view chips
  const techList = useMemo(
    () =>
      (proj.technologiesUsed || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [proj.technologiesUsed]
  );
  const skillsList = useMemo(
    () =>
      (proj.skillsUsed || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [proj.skillsUsed]
  );
  const deleteProject = async (projectId) => {
    try {
      const jwt = localStorage.getItem("jwtToken");

      await axios.delete(
        `${PROJ_API}/${applicantId}/deleteApplicantProject/${projectId}`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      await fetchProjects(); // refresh list
      addSnackbar({ message: "Project deleted successfully", type: "success" });
    } catch (error) {
      console.error("Delete failed:", error);
      addSnackbar({ message: "Failed to delete project", type: "error" });
    }
  };


  return (
    <>
      <div className="col-lg-12 col-md-12 common_style">
        <div className="card-base soft-shadow">
        {(items.filter(p => p.id).length > 0 ? items.filter(p => p.id) : [{}]).map((proj, idx) => (
          <div className="card-base soft-shadow">
            <div className="card-title-row">
              <div>
                <h3 className="card-title">
                  Project {idx + 1} Details  <span className="req">*</span>
                </h3>
                <p className="card-subtitle">
                  Stand out for employers by adding details about projects you have done in college, internships, or at work
                </p>
              </div>
              <div className="project-action-buttons">

                <button
                  type="button"
                  className="portfolio-edit-btn"
                  onClick={() => {
                    setIsNewProject(false);
                    setEditIndex(idx);
                    setEditOpen(true);
                  }}>
                  Edit <FontAwesomeIcon icon={faPen} style={{ marginRight: "6px" }} />
                </button>
                {proj.id && (
                  <button
                    type="button"
                    className="portfolio-edit-btn"
                    style={{ marginLeft: "8px", backgroundColor: "#e74c3c" }}
                    onClick={() => deleteProject(proj.id)}
                  >
                    Delete
                  </button>
                )}

              </div>
            </div>

            <div
              className="pd-grid"
              style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
            >
              {/* row 1 */}
              <ReadonlyInput
                placeholder="Project title"
                value={proj.projectTitle}
              />
              <ReadonlyInput
                placeholder="Specialisation on the project"
                value={proj.specialization}
              />

              {/* row 2 */}
              <div className="pd-input with-add">
                <Pills items={(proj.technologiesUsed || "").split(",").map(s => s.trim()).filter(Boolean)} />
              </div>

              {!isMobile ? (
                <ReadonlyTextarea
                  placeholder="Project team size"
                  value={proj.teamSize ? String(proj.teamSize) : ""}
                />
              ) : (
                <ReadonlyInput
                  placeholder="Project team size"
                  value={proj.teamSize ? String(proj.teamSize) : ""}
                />
              )}


              {/* row 4 */}
              <ReadonlyTextarea
                placeholder="Role description"
                value={proj.roleDescription}
              />
              <ReadonlyTextarea
                placeholder="Project description"
                value={proj.projectDescription}
              />
            </div>
          </div>))}
        {items.filter(p => p.id).length > 0 && items.filter(p => p.id).length < 3 && (<div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
          <button
            type="button"
            className="portfolio-edit-btn"
            style={{ minWidth: "200px" }}
            onClick={() => {
              setIsNewProject(true); // creating new
              setEditOpen(true);
            }}

          >
            Add Another Project
          </button>
        </div>
        )}
        </div>
      </div>

      {/* Edit modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Project Details"
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

        <ProjectDetailsEditPopup
          applicantId={applicantId}
          initial={isNewProject ? {} : items[editIndex] || {}}
          onClose={() => {
            setIsNewProject(false);
            // only close the modal, do NOT call save or show snack here
            setEditOpen(true);
          }}
          onSuccess={async () => {
            // called only after Save completes successfully
            await fetchProjects();
            setEditOpen(false);
            addSnackbar({
              message: "Project details saved successfully!",
              type: "success",
            });
          }}
          onError={(msg) =>
            addSnackbar({
              message: msg || "Failed to save project details",
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
        />
      ))}
    </>
  );
};

export default ProjectDetailsCard;
