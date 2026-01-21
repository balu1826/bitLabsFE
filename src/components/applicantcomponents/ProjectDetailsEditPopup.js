// src/components/applicant/ProjectDetailsEditPopup.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "./ProjectEditModal.css"; // make sure path is correct
import { useRefresh } from "../common/RefreshContext";

// Use your API base
import { apiUrl } from "../../services/ApplicantAPIService";
const PROJ_API = `${apiUrl}/applicant-projects`;

const validateTextWithTrailingSpace = (value, fieldName, minLength, maxLength) => {
  const trimmed = String(value).trim();
  const hasMultipleTrailingSpaces = /\s{2,}$/.test(value);

  if (!trimmed) return `${fieldName} is required`;
  if (trimmed.length < minLength) return `${fieldName} must be at least ${minLength} characters`;
  if (trimmed.length > maxLength) return `${fieldName} must not exceed ${maxLength} characters`;
  if (hasMultipleTrailingSpaces) return `${fieldName} can only have one space at the end`;
  return "";
};

const validators = {
  projectTitle: (v) => validateTextWithTrailingSpace(v, "Project title", 3, 500),
  specialization: (v) => validateTextWithTrailingSpace(v, "Specialization", 2, 500),
  technologiesUsed: (v) => {
    if (!v || String(v).trim().length === 0) return "Technologies used is required";
    const hasMultipleTrailingSpaces = /\s{2,}$/.test(v);
    if (hasMultipleTrailingSpaces) return "Technologies used can only have one space at the end";
    return "";
  },
  teamSize: (v) => {
    if (v === "" || v === null || v === undefined) return "Team size is required";
    const num = Number(v);
    if (isNaN(num)) return "Team size must be a number";
    if (num < 1) return "Team size must be at least 1";
    if (num > 20) return "Team size cannot exceed 20";
    return "";
  },
  roleInProject: (v) => validateTextWithTrailingSpace(v, "Role in project", 3, 500),
  roleDescription: (v) => validateTextWithTrailingSpace(v, "Role description", 10, 5000),
  projectDescription: (v) => validateTextWithTrailingSpace(v, "Project description", 10, 5000),
};

/* Small presentational helpers */
const Field = ({ label, requiredMark, hint, children }) => (
  <div className="pe-field">
    <div className="pe-field-label">
      <div className="pe-field-title">{label}</div>
      {requiredMark && <div style={{ color: "#F97316", marginLeft: 6 }}>*</div>}
    </div>
    {children}
    {hint && <div className="pe-hint">{hint}</div>}
  </div>
);

const Error = ({ msg }) => (msg ? <div className="pe-error">{msg}</div> : null);

/* ChipEditor: simple, returns comma-separated string to match your API shape */
const ChipEditor = ({ value = "", onChange, placeholder, inputName, ariaLabel }) => {
  const [draft, setDraft] = useState("");
  const items = useMemo(
    () =>
      (value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [value]
  );

  useEffect(() => {
    // trim leading spaces if parent updates value
    if (!draft) return;
    setDraft((d) => d.trimStart());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (items.includes(t)) {
      setDraft("");
      return;
    }
    const next = [...items, t];
    onChange(next.join(", "));
    setDraft("");
  };

  const remove = (i) => {
    const next = items.filter((_, idx) => idx !== i);
    onChange(next.join(", "));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && items.length) {
      e.preventDefault();
      remove(items.length - 1);
    }
  };

  return (
    <div>
      <div className="pe-chip-row">
        <input
          name={inputName}
          className="pe-chip-input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel || placeholder}
        />
        <button
          type="button"
          className="pe-chip-add"
          onClick={add}
          aria-label="Add"
          title="Add"
        >
          +
        </button>
      </div>

      <div className={`pe-chips`}>
        {items.map((t, i) => (
          <div className="pe-chip" key={`${t}-${i}`}>
            <span>{t}</span>
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => remove(i)}
              title={`Remove ${t}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Main component */
const ProjectDetailsEditPopup = ({ applicantId, initial = {}, onClose, onSuccess, onError }) => {
  const [form, setForm] = useState({
    id: initial?.id || null,
    projectTitle: initial?.projectTitle || "",
    specialization: initial?.specialization || "",
    technologiesUsed: initial?.technologiesUsed || "",
    teamSize: initial?.teamSize ?? "",
    roleInProject: initial?.roleInProject || "",
    skillsUsed: initial?.skillsUsed || "",
    roleDescription: initial?.roleDescription || "",
    projectDescription: initial?.projectDescription || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { triggerRefresh } = useRefresh();

  useEffect(() => {
    // Keep form synced if `initial` changes while open
    setForm({
      id: initial?.id || null,
      projectTitle: initial?.projectTitle || "",
      specialization: initial?.specialization || "",
      technologiesUsed: initial?.technologiesUsed || "",
      teamSize: initial?.teamSize ?? "",
      roleInProject: initial?.roleInProject || "",
      skillsUsed: initial?.skillsUsed || "",
      roleDescription: initial?.roleDescription || "",
      projectDescription: initial?.projectDescription || "",
    });
    setErrors({});
  }, [initial]);

  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") {
        (onClose || (() => { }))();
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const setField = (name, value) => {
    if (typeof value === 'string' && name !== 'technologiesUsed') {
      value = value.replace(/\s+/g, ' ');
      if (value.startsWith(' ')) {
        value = value.trimStart();
      }
    }

    setForm((f) => ({ ...f, [name]: value }));
    if (validators[name]) {
      setErrors((e) => ({ ...e, [name]: validators[name](value) }));
    }
  };

  const validateAll = () => {
    const next = {};
    Object.keys(validators).forEach((k) => {
      const msg = validators[k](form[k]);
      if (msg) next[k] = msg;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const canSave = useMemo(() => {
    const noErrors = Object.values(errors).every((m) => !m);
    const requiredPresent = ["projectTitle", "specialization", "technologiesUsed", "teamSize", "roleInProject", "roleDescription", "projectDescription"].every(
      (k) => {
        const v = form[k];
        return validators[k] ? !validators[k](v) : true;
      }
    );
    return noErrors && requiredPresent && !saving;
  }, [errors, saving, form]);

  /* Only called from form submit (Save button) */
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateAll()) return;
    const payload = { ...form, teamSize: Number(form.teamSize) };
    try {
      setSaving(true);
      const jwt = localStorage.getItem("jwtToken");
       // 🚀 Check if existing or new based on initial.projectTitle
    if (form.id) {
      console.log("form id" ,form.id)
      // === EXISTING PROJECT → PUT ===
      await axios.put(
        `${PROJ_API}/${applicantId}/updateApplicantProject/${form.id}`, // your existing update endpoint
        payload,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // === NEW PROJECT → POST ===
      await axios.post(
        `${PROJ_API}/${applicantId}/saveApplicantProject`, // your new create endpoint
        payload,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
    }
      triggerRefresh();
      onSuccess?.(); // let parent know save succeeded
    } catch (err) {
      console.error("Project PUT failed:", err?.response || err);
      const msg = err?.response?.data?.message || err?.message || "Failed to save project details";
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  /* Close / Cancel handlers — DO NOT call save */
  const handleClose = () => {
    onClose?.();
  };

  return (
    <div role="dialog" aria-modal="true" onClick={handleClose}>
      <div role="document" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pe-header">
          <div className="pe-header-left">
            <h3 className="pe-title">Edit project</h3>
          </div>
        </div>

        {/* Body & Form */}
        <div>
          {/* use a native <form> so Enter triggers Save, and Save button is type="submit" */}
          <form className="pe-grid" style={{ marginTop: "10px" }} onSubmit={handleSave} noValidate>
            {/* Left column */}
            <div className="pe-col">
              <Field label="Project title" requiredMark hint="">
                <input
                  name="projectTitle"
                  className={`pe-input ${errors.projectTitle ? "pe-input-error" : ""}`}
                  placeholder="e.g., Online Job Portal"
                  value={form.projectTitle}
                  onChange={(e) => setField("projectTitle", e.target.value)}
                />
              </Field>
              <Error msg={errors.projectTitle} />

              <Field label="Technologies used for project" requiredMark hint="Press Enter to add">
                <ChipEditor
                  value={form.technologiesUsed}
                  onChange={(v) => setField("technologiesUsed", v)}
                  placeholder="Type a technology (React, Spring Boot, MySQL...)"
                  inputName="technologiesUsed"
                />
              </Field>
              <Error msg={errors.technologiesUsed} />

              <Field label="Your role in the project" requiredMark>
                <input
                  name="roleInProject"
                  className={`pe-input ${errors.roleInProject ? "pe-input-error" : ""}`}
                  placeholder="e.g., Backend Developer"
                  value={form.roleInProject}
                  onChange={(e) => setField("roleInProject", e.target.value)}
                />
              </Field>
              <Error msg={errors.roleInProject} />
            </div>

            {/* Right column */}
            <div className="pe-col">
              <Field label="Specialisation on the project" requiredMark>
                <input
                  name="specialization"
                  className={`pe-input ${errors.specialization ? "pe-input-error" : ""}`}
                  placeholder="e.g., Full Stack Web Development"
                  value={form.specialization}
                  onChange={(e) => setField("specialization", e.target.value)}
                />
              </Field>
              <Error msg={errors.specialization} />

              <Field label="Project team size" requiredMark>
                <input
                  name="teamSize"
                  className={`pe-input ${errors.teamSize ? "pe-input-error" : ""}`}
                  placeholder="e.g., 4"
                  value={form.teamSize}
                  inputMode="numeric"
                  onChange={(e) => setField("teamSize", e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              <Error msg={errors.teamSize} />
            </div>

            {/* Full width textareas */}
            <div className="pe-col pe-col-full">
              <Field label="Role description" requiredMark>
                <textarea
                  name="roleDescription"
                  className={`pe-input pe-textarea ${errors.roleDescription ? "pe-input-error" : ""}`}
                  placeholder="What did you specifically contribute? (e.g., designed and implemented REST APIs...)"
                  value={form.roleDescription}
                  onChange={(e) => setField("roleDescription", e.target.value)}
                />
              </Field>
              <Error msg={errors.roleDescription} />
            </div>

            <div className="pe-col pe-col-full">
              <Field label="Project description" requiredMark>
                <textarea
                  name="projectDescription"
                  className={`pe-input pe-textarea ${errors.projectDescription ? "pe-input-error" : ""}`}
                  placeholder="What is this project about? Who uses it? Impact, tech, results..."
                  value={form.projectDescription}
                  onChange={(e) => setField("projectDescription", e.target.value)}
                />
              </Field>
              <Error msg={errors.projectDescription} />

              {/* Actions row sits inside grid full-width to keep layout consistent */}
              <div style={{ marginTop: 8 }} />
            </div>

            {/* Form actions (grid full-width) */}
            <div className="pe-col pe-col-full" style={{ padding: 0 }}>
              <div className="pe-actions" role="group" aria-label="Form actions">
                <button
                  type="submit" /* submit triggers handleSave */
                  className="pe-btn-primary"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ProjectDetailsEditPopup.propTypes = {
  applicantId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  initial: PropTypes.object,
  onClose: PropTypes.func, // called when user cancels/closes (NOT saved)
  onSuccess: PropTypes.func, // called after successful save
  onError: PropTypes.func, // called on save error
};

ProjectDetailsEditPopup.defaultProps = {
  initial: {},
  onClose: null,
  onSuccess: null,
  onError: null,
};

export default ProjectDetailsEditPopup;
