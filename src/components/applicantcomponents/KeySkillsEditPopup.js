// src/components/applicant/KeySkillsEditPopup.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useRefresh } from "../common/RefreshContext";

const SKILLS_API = (id) => `${apiUrl}/applicantprofile/${id}/skills`;

const normalize = (s = "") => s.trim().replace(/\s+/g, " ");

// Predefined skills list (source of truth)
const SUGGESTED_SKILLS = [
  "Java",
  "C",
  "C++",
  "C Sharp",
  "Python",
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "Angular",
  "React",
  "Vue",
  "JSP",
  "Servlets",
  "Spring",
  "Spring Boot",
  "Hibernate",
  ".Net",
  "Django",
  "Flask",
  "SQL",
  "MySQL",
  "SQL-Server",
  "Mongo DB",
  "Selenium",
  "Regression Testing",
  "Manual Testing",
];

const KeySkillsEditPopup = ({
  applicantId,
  isOpen,
  onClose,
  onSaved,
  initialSkills = [],
}) => {
  const [skills, setSkills] = useState([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  // position for fixed dropdown (left, top, width)
  const [suggestionPos, setSuggestionPos] = useState(null);
  const { triggerRefresh } = useRefresh();

  // compute and store input coordinates (viewport-based)
  const updateSuggestionPos = () => {
    const el = inputRef.current;
    if (!el) return setSuggestionPos(null);
    const rect = el.getBoundingClientRect();
    setSuggestionPos({
      left: Math.max(8, rect.left), // small padding from viewport edge
      top: rect.bottom + 8,         // 8px gap below input
      width: rect.width,
    });
  };


  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setSkills([...new Set((initialSkills || []).map(normalize))]);
      setDraft("");
      setError("");
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  }, [isOpen, initialSkills]);

  // Helpers
  const normalizeLower = (s) => normalize(s).toLowerCase();

  const isValidSuggestion = (value) => {
    if (!value) return false;
    const v = normalizeLower(value);
    return SUGGESTED_SKILLS.some((s) => s.toLowerCase() === v);
  };

  useEffect(() => {
    if (!showSuggestions) return;

    // compute initially
    updateSuggestionPos();

    // reposition on scroll and resize
    const onScroll = () => updateSuggestionPos();
    const onResize = () => updateSuggestionPos();

    // attach on capture so it fires earlier (helps inside modal scrolling)
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [showSuggestions]);


  // Add skill only if it's a valid suggestion and not duplicate
  const addSkillFromValue = (value) => {
    const vNorm = normalize(value);
    if (!vNorm) return setError("Please choose a skill from the list.");
    if (!isValidSuggestion(vNorm)) return setError("Please select a skill from suggestions.");
    if (skills.some((s) => s.toLowerCase() === vNorm.toLowerCase()))
      return setError("Skill already added.");
    setSkills((prev) => [...prev, vNorm]);
    setDraft("");
    setError("");
    setShowSuggestions(false);
    setHighlightIndex(-1);
    // focus back to input
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Remove a skill
  const removeSkill = (name) => {
    setSkills((prev) => prev.filter((s) => s.toLowerCase() !== name.toLowerCase()));
  };

  const canSave = useMemo(() => skills.length > 0, [skills]);

  const save = async () => {
    if (!canSave) {
      setError("Add at least one skill.");
      return;
    }
    setSaving(true);
    try {
      const jwt = localStorage.getItem("jwtToken");
      await axios.put(
        SKILLS_API(applicantId),
        { skills },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        }
      );
      triggerRefresh();
      onSaved?.();
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to save skills.";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleFocus = () => {
    const availableSkills = SUGGESTED_SKILLS.filter(
      s => !skills.some(sk => sk.toLowerCase() === s.toLowerCase())
    );
    setFilteredSuggestions(availableSkills);
    setShowSuggestions(true);
    updateSuggestionPos();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setDraft(value);

    const availableSkills = SUGGESTED_SKILLS.filter(
      s => !skills.some(sk => sk.toLowerCase() === s.toLowerCase())
    );

    if (value.trim().length > 0) {
      const filtered = availableSkills.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setHighlightIndex(filtered.length ? 0 : -1);

      if (value.trim() && !availableSkills.some(s =>
        s.toLowerCase() === value.toLowerCase().trim()
      )) {
        setError("Please select a skill from the suggestion list.");
      } else {
        setError("");
      }
    } else {
      setFilteredSuggestions(availableSkills);
      setHighlightIndex(-1);
      setError("");
    }
    updateSuggestionPos();
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === "Enter") {
        // only allow Enter to add when it is an exact suggestion
        e.preventDefault();
        if (isValidSuggestion(draft)) addSkillFromValue(draft);
        else setError("Please select a skill from suggestions before adding.");
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(filteredSuggestions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = filteredSuggestions[highlightIndex];
      if (picked) addSkillFromValue(picked);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  // Click suggestion
  const handleSuggestionClick = (s) => {
    addSkillFromValue(s);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Key Skills"
      className="modal-content2 keyskills"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >

      <div style={{ position: "absolute", top: 10, right: 20 }}>
        <FontAwesomeIcon
          icon={faTimes}
          onClick={onClose}
          style={{ cursor: "pointer", color: "#333" }}
        />
      </div>

      <div className="modal-body" style={{ paddingTop: 8 }}>
        <h3 style={{ marginBottom: 12, fontWeight: 800 }}>Edit key skills</h3>
        <p className="card-subtitle" style={{ marginBottom: 12 }}>
          Choose skills from the list. (Minimum 1)
        </p>

        {/* Typeahead container */}
        <div
          className="typeahead-wrapper"
          style={{ marginBottom: 10, position: "relative" }}
        >
          <div className="typeahead-row" style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              className="pd-input"
              type="text"
              placeholder="Type to search and select a skill"
              value={draft}
              onChange={handleChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-activedescendant={
                showSuggestions && highlightIndex >= 0
                  ? `skill-suggestion-${highlightIndex}`
                  : undefined
              }
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                // clicking Add must only accept exact suggested skills
                if (isValidSuggestion(draft)) addSkillFromValue(draft);
                else setError("Please choose a skill from the suggestion list.");
              }}
              style={{ whiteSpace: "nowrap" }}
            >
              Add
            </button>
          </div>

          {/* Suggestions dropdown (positioned inside modal but overlay z-index keeps it above) */}
          {showSuggestions && filteredSuggestions.length > 0 && suggestionPos && (
            <ul
              className="typeahead-suggestions"
              role="listbox"
              ref={suggestionsRef}
              style={{
                position: "fixed",
                left: suggestionPos.left,
                top: suggestionPos.top,
                width: suggestionPos.width,
                marginTop: 0,           // portal controls spacing
                zIndex: 30000,
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {filteredSuggestions.map((s, idx) => (
                <li
                  id={`skill-suggestion-${idx}`}
                  key={s}
                  role="option"
                  aria-selected={idx === highlightIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    padding: "10px 12px",
                    background: idx === highlightIndex ? "#fff7ed" : undefined,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error ? <div className="error-message" style={{ marginBottom: 8 }}>{error}</div> : null}

        {/* Skill chips */}
        <div className="skills-pad" style={{ marginBottom: 12 }}>
          <div className="skills-list">
            {skills.map((s) => (
              <div key={s} className="skill-chip">
                {s}
                <span className="chip-x" onClick={() => removeSkill(s)} title="Remove">
                  ×
                </span>
              </div>
            ))}

            {!skills.length && <div style={{ color: "#777" }}>No skills yet — add from the list above.</div>}
          </div>
        </div>

        <div style={{ marginTop: 8, textAlign: "right" }}>
          <button
            className="btn-primary"
            disabled={!canSave || saving}
            onClick={() => {
              if (!isValidSuggestion(draft)) {
                setError("Please select a skill from the suggestion list.");
                return;
              }
              addSkillFromValue(draft);
            }}
            aria-busy={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KeySkillsEditPopup;
