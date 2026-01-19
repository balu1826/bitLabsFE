// FULL UPDATED CODE WITH GRADUATION MARKS AS NUMBER FIELD

import React, { useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import CustomDropdown from "../common/CustomDropdown";
import { useRefresh } from "../common/RefreshContext";

const EDU_API = `${apiUrl}/applicant-education`;

const degreeOptions = [
  { value: "B.E / B.Tech", label: "B.E / B.Tech" },
  { value: "B.Sc", label: "B.Sc" },
  { value: "BCA", label: "BCA" },
  { value: "Diploma", label: "Diploma" },
  { value: "B.Com", label: "B.Com" },
  { value: "BBA", label: "BBA" },
  { value: "M.E / M.Tech", label: "M.E / M.Tech" },
  { value: "M.Sc", label: "M.Sc" },
  { value: "MCA", label: "MCA" },
  { value: "MBA", label: "MBA" },
  { value: "PhD", label: "PhD" }
];

const specializationOptions = {
  "B.E / B.Tech": [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Artificial Intelligence & Machine Learning",
    "Data Science",
    "Aerospace Engineering",
    "Biotechnology",
    "Chemical Engineering",
    "Other"
  ],
  "B.Sc": ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Electronics", "Statistics", "Other"],
  "BCA": ["Software Development", "Web Development", "Mobile App Development", "Database Management", "Cloud Computing", "Other"],
  "Diploma": ["Computer Engineering", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Electronics & Communication", "Other"],
  "B.Com": ["Accounting", "Finance", "Taxation", "Banking", "E-Commerce", "Other"],
  "BBA": ["Marketing", "Finance", "Human Resources", "International Business", "Entrepreneurship", "Other"],
  "M.E / M.Tech": ["Computer Science & Engineering", "Data Science", "Artificial Intelligence", "Machine Learning", "Cyber Security", "Other"],
  "M.Sc": ["Computer Science", "Mathematics", "Physics", "Chemistry", "Data Science", "Other"],
  "MCA": ["Software Engineering", "Cloud Computing", "Mobile Application Development", "Data Analytics", "Other"],
  "MBA": ["Finance", "Marketing", "Human Resources", "Operations", "International Business", "Other"],
  "PhD": ["Computer Science", "Engineering", "Sciences", "Management", "Other"]
};

const courseTypeOptions = ["Full time", "Part time", "Distance"];
const boardOptions = ["CBSE", "ICSE", "State Board", "Other"];

const yearRange = (from, to) => {
  const arr = [];
  for (let y = to; y >= from; y--) arr.push(y);
  return arr;
};
const YEARS = yearRange(1980, new Date().getFullYear() + 1);

const nonEmpty = (msg) => (v) => (String(v || "").trim() ? "" : msg);

const validateYear = (value, { startYear } = {}) => {
  if (!value) return "Year is required";
  if (isNaN(value)) return "Must be a valid year";
  if (value < 1900) return "Year must be after 1900";
  if (startYear !== undefined && value < startYear) return "Must be after start year";
  return "";
};

const handleDecimalInput = (value) => {
  if (value === "") return value;
  if (!/^\d{0,3}(\.\d{0,2})?$/.test(value)) return null;

  return value;
};


const validatePercentage = (value) => {
  if (value === "" || value === null) return "Marks % is required";
  const num = Number(value);
  if (isNaN(num)) return "Must be a valid number";
  if (num < 35 || num > 100) return "Must be between 35 and 100";
  return "";
};

const validateUniversity = (value) => {
  if (!value) return "University/Institute is required";

  const trimmed = value.trim();

  if (trimmed.length < 10)
    return "University name must be at least 10 characters long";

  if (/\s{2,}/.test(value))
    return "Only single spaces are allowed between words";

  return "";
};

const validators = {
  graduation: {
    degree: nonEmpty("Graduation/Diploma is required"),
    university: validateUniversity,
    specialization: nonEmpty("Specialization is required"),
    courseType: nonEmpty("Course type is required"),

    startYear: (value, form) => {
      if (!value) return "Start year is required";
      if (isNaN(value)) return "Must be a valid year";
      if (value < 1900) return "Year must be after 1900";

      if (form.graduation.endYear && Number(value) >= Number(form.graduation.endYear)) {
        return "Start year cannot be same or after end year";
      }
      return "";
    },

    endYear: (value, form) => {
      if (!value) return "End year is required";
      if (isNaN(value)) return "Must be a valid year";

      if (Number(value) <= Number(form.graduation.startYear)) {
        return "End year must be after start year";
      }

      if (value > new Date().getFullYear() + 5) return "Invalid future year";
      return "";
    },

    marksPercent: validatePercentage
  },

  classXii: {
    board: nonEmpty("Board of education is required"),
    passingYear: (value, form) => {
      if (!value) return "Passing year is required";
      if (isNaN(value)) return "Must be valid year";

      const gradStart = Number(form.graduation.startYear);
      if (gradStart && Number(value) > gradStart) {
        return "Class XII year must be before or equal to Graduation start year";
      }

      return "";
    },
    marksPercent: validatePercentage
  },

  classX: {
    board: nonEmpty("Board of education is required"),
    passingYear: (value, form) => {
      if (!value) return "Passing year is required";
      if (isNaN(value)) return "Must be valid year";

      const xii = Number(form.classXii.passingYear);
      if (xii && Number(value) > xii) {
        return "Class X year must be before or equal to Class XII year";
      }

      return "";
    },

    marksPercent: validatePercentage
  }
};

const EducationDetailsEditPopup = ({ applicantId, initial, onSuccess, onError }) => {
  const [form, setForm] = useState({
    graduation: {
      degree: initial?.graduation?.degree || "",
      university: initial?.graduation?.university || "",
      specialization: initial?.graduation?.specialization || "",
      courseType: initial?.graduation?.courseType || "",
      startYear: initial?.graduation?.startYear || "",
      endYear: initial?.graduation?.endYear || "",
      marksPercent: initial?.graduation?.marksPercent || ""
    },
    classXii: {
      board: initial?.classXii?.board || "",
      passingYear: initial?.classXii?.passingYear || "",
      marksPercent: initial?.classXii?.marksPercent || ""
    },
    classX: {
      board: initial?.classX?.board || "",
      passingYear: initial?.classX?.passingYear || "",
      marksPercent: initial?.classX?.marksPercent || ""
    }
  });
  const { triggerRefresh } = useRefresh();

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (path, value) => {
    setForm((f) => {
      const copy = JSON.parse(JSON.stringify(f));
      const [section, field] = path.split(".");

      if (section === 'graduation' && field === 'degree' && f.graduation.degree !== value) {
        copy[section].specialization = '';
        setErrors(e => {
          const newErrors = { ...e };
          delete newErrors['graduation.specialization'];
          return newErrors;
        });
      }

      copy[section][field] = value;

      const validator = validators[section]?.[field];
      if (validator) {
        const error = validator(value, copy);
        setErrors((e) => ({ ...e, [path]: error }));
      }

      return copy;
    });
  };

  const validateAll = () => {
    const newErrors = {};

    Object.entries(validators).forEach(([section, valObj]) => {
      Object.entries(valObj).forEach(([field, validator]) => {
        const value = form[section][field];
        const error = validator(value, form);
        if (error) newErrors[`${section}.${field}`] = error;
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    const gradFields = ["degree", "university", "specialization", "courseType", "startYear", "endYear", "marksPercent"];

    for (let f of gradFields) {
      if (!form.graduation[f]) return false;
    }

    const classXIIFields = ["board", "passingYear", "marksPercent"];
    for (let f of classXIIFields) {
      if (!form.classXii[f]) return false;
      if (!form.classX[f]) return false;
    }

    return Object.values(errors).every((e) => !e);
  }, [form, errors]);

  const canSave = isFormValid && !saving;

  const save = async () => {
    if (!validateAll()) return;

    const payload = {
      graduation: {
        degree: form.graduation.degree,
        university: form.graduation.university,
        specialization: form.graduation.specialization,
        courseType: form.graduation.courseType,
        startYear: Number(form.graduation.startYear),
        endYear: Number(form.graduation.endYear),
        marksPercent: Number(form.graduation.marksPercent) || 0
      },
      classXii: {
        board: form.classXii.board,
        passingYear: Number(form.classXii.passingYear) || 0,
        marksPercent: Number(form.classXii.marksPercent) || 0
      },
      classX: {
        board: form.classX.board,
        passingYear: Number(form.classX.passingYear) || 0,
        marksPercent: Number(form.classX.marksPercent) || 0
      }
    };

    try {
      setSaving(true);
      const jwt = localStorage.getItem("jwtToken");
      await axios.put(`${EDU_API}/${applicantId}/updateApplciantEducationDetails`, payload, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        }
      });
      triggerRefresh();
      onSuccess?.();
    } catch (err) {
      console.error("Education PUT failed:", err);
      onError?.(err?.response?.data?.message || "Failed to save education details");
    } finally {
      setSaving(false);
    }
  };

  const getSpecializations = () => specializationOptions[form.graduation.degree] || [];

  return (
    <div style={{ paddingTop: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Edit education details</h3>

      {/* Graduation */}
      <div className="card-base">
        <div className="card-title-row">
          <h4 className="card-title">Graduation details *</h4>
        </div>

        <div className="pd-grid">

          {/* Degree */}
          <CustomDropdown
            value={form.graduation.degree}
            options={degreeOptions}
            placeholder="Select Degree"
            onChange={(v) => setField("graduation.degree", v)}
            error={errors["graduation.degree"]}
          />

          {/* University */}
          <div className="field-align">
            <input
              className="pd-input"
              placeholder="University / Institute"
              value={form.graduation.university}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\s{2,}/g, " ");
                setField("graduation.university", cleaned);
              }}
            />
            {errors["graduation.university"] && <div className="error-message">{errors["graduation.university"]}</div>}
          </div>

          {/* Marks Percent (NUMBER INPUT) */}
          <div className="field-align">
            <input
              className="pd-input"
              type="text"
              placeholder="Marks in % (35–100)"
              value={form.graduation.marksPercent}
              onChange={(e) => {
                const v = handleDecimalInput(e.target.value);
                if (v !== null) setField("graduation.marksPercent", v);
              }}
              inputMode="decimal"
            />
            {errors["graduation.marksPercent"] && (
              <div className="error-message">{errors["graduation.marksPercent"]}</div>
            )}
          </div>

          {/* Specialization */}
          <CustomDropdown
            value={form.graduation.specialization}
            options={getSpecializations()}
            placeholder="Select Specialization"
            onChange={(v) => setField("graduation.specialization", v)}
            error={errors["graduation.specialization"]}
          />

          {/* Course Type */}
          <CustomDropdown
            value={form.graduation.courseType}
            options={courseTypeOptions}
            placeholder="Course Type"
            onChange={(v) => setField("graduation.courseType", v)}
            error={errors["graduation.courseType"]}
          />

          {/* Start Year */}
          <CustomDropdown
            value={form.graduation.startYear}
            options={YEARS}
            placeholder="Start Year"
            onChange={(v) => setField("graduation.startYear", v)}
            error={errors["graduation.startYear"]}
          />

          {/* End Year */}
          <CustomDropdown
            value={form.graduation.endYear}
            options={YEARS}
            placeholder="End Year"
            onChange={(v) => setField("graduation.endYear", v)}
            error={errors["graduation.endYear"]}
          />

        </div>
      </div>

      {/* CLASS XII */}
      <div className="card-base" style={{ marginTop: 14 }}>
        <div className="card-title-row">
          <h4 className="card-title">Class XII details *</h4>
        </div>

        <div className="pd-grid">
          <CustomDropdown
            value={form.classXii.board}
            onChange={(v) => setField("classXii.board", v)}
            options={boardOptions}
            placeholder="Board"
            error={errors["classXii.board"]}
          />

          <CustomDropdown
            value={form.classXii.passingYear}
            onChange={(v) => setField("classXii.passingYear", v)}
            options={YEARS}
            placeholder="Passing Year"
            error={errors["classXii.passingYear"]}
          />

          <div className="field-align">
            <input
              className="pd-input"
              type="text"
              placeholder="Marks in % (35–100)"
              value={form.classXii.marksPercent}
              onChange={(e) => {
                const v = handleDecimalInput(e.target.value);
                if (v !== null) setField("classXii.marksPercent", v);
              }}
              inputMode="decimal"
            />
            {errors["classXii.marksPercent"] && (
              <div className="error-message">{errors["classXii.marksPercent"]}</div>
            )}
          </div>
        </div>
      </div>

      {/* CLASS X */}
      <div className="card-base" style={{ marginTop: 14 }}>
        <div className="card-title-row">
          <h4 className="card-title">Class X details *</h4>
        </div>

        <div className="pd-grid">

          <CustomDropdown
            value={form.classX.board}
            onChange={(v) => setField("classX.board", v)}
            options={boardOptions}
            placeholder="Board"
            error={errors["classX.board"]}
          />

          <CustomDropdown
            value={form.classX.passingYear}
            onChange={(v) => setField("classX.passingYear", v)}
            options={YEARS}
            placeholder="Passing Year"
            error={errors["classX.passingYear"]}
          />

          <div className="field-align">
            <input
              className="pd-input"
              type="text"
              placeholder="Marks in % (35–100)"
              value={form.classX.marksPercent}
              onChange={(e) => {
                const v = handleDecimalInput(e.target.value);
                if (v !== null) setField("classX.marksPercent", v);
              }}
              inputMode="decimal"
            />
            {errors["classX.marksPercent"] && (
              <div className="error-message">{errors["classX.marksPercent"]}</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button className="btn-primary" onClick={save} disabled={!canSave}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default EducationDetailsEditPopup;
