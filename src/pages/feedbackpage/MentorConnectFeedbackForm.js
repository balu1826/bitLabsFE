// src/components/feedback/MentorConnectFeedbackForm.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import "./MentorConnectFeedbackForm.css";

const MentorConnectFeedbackForm = () => {
  const { formId } = useParams();

  const [form, setForm] = useState(null);         // { id, fields: [...] }
  const [answers, setAnswers] = useState({});     // { [label]: value }
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  // Load form safely (default fields to [])
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/mentorfeedback/form/${formId}`);
        if (!mounted) return;
        const data = res?.data || {};
        const fields = Array.isArray(data.fields) ? data.fields : [];
        setForm({ id: data.id, fields });
      } catch (e) {
        console.error("Error loading form:", e);
        setLoadErr("Unable to load the form.");
      }
    })();
    return () => { mounted = false; };
  }, [formId]);

  const handleChange = (label, value) => {
    setAnswers((prev) => ({ ...prev, [label]: value }));
  };

  // Accept JSON array options OR comma-separated
  const parseOptions = (options) => {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return String(options)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  // Client-side required validation
  const missingRequired = useMemo(() => {
    if (!form?.fields?.length) return false;
    for (const f of form.fields) {
      if (!f.required) continue;
      const v = answers[f.label];
      if (f.fieldType === "rating") {
        if (!v || Number(v) < 1) return true;
      } else if (f.fieldType === "checkbox") {
        if (v !== true) return true;
      } else {
        if (v === undefined || v === null || String(v).trim().length === 0) return true;
      }
    }
    return false;
  }, [answers, form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (missingRequired) {
      alert("Please fill all required questions.");
      return;
    }
    try {
      setSubmitting(true);

      // Backend accepts empty meta; we always send strings
      const payload = {

        answers,
      };

      await axios.post(`${apiUrl}/mentorfeedback/form/${formId}/submit`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        "Error submitting feedback";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadErr) return <p className="loading-text">{loadErr}</p>;
  if (!form) return <p className="loading-text">Loading form...</p>;
  if (submitted) {
    return (
      <div className="thanks-wrap">
        <div className="thank-you">
          <div>Thank you for your feedback!</div>
          <p>Your response has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <h2 className="feedback-title">Mentor Feedback Form</h2>

      <form onSubmit={handleSubmit} className="feedback-form">
        {form.fields.length === 0 && (
          <div className="empty-state">This form has no questions.</div>
        )}

        {form.fields.map((f, i) => (
          <div key={`${f.label}-${i}`} className="form-field">
            <label>
              {f.label} {f.required && <span className="required">*</span>}
            </label>

            {f.fieldType === "text" && (
              <input
                type="text"
                onChange={(e) => handleChange(f.label, e.target.value)}
              />
            )}

            {f.fieldType === "textarea" && (
              <textarea
                rows="4"
                onChange={(e) => handleChange(f.label, e.target.value)}
              />
            )}

            {f.fieldType === "number" && (
              <input
                type="number"
                onChange={(e) => handleChange(f.label, e.target.value)}
              />
            )}

            {f.fieldType === "dropdown" && (
              <select onChange={(e) => handleChange(f.label, e.target.value)} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                {parseOptions(f.options).map((opt, idx) => (
                  <option key={`${f.label}-opt-${idx}`} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {f.fieldType === "rating" && (
              <div className="rating">
                {[1, 2, 3, 4, 5].map((r) => (
                  <span
                    key={r}
                    className={Number(answers[f.label]) >= r ? "star filled" : "star"}
                    onClick={() => handleChange(f.label, r)}
                    role="button"
                    aria-label={`${r} star`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            {f.fieldType === "checkbox" && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  onChange={(e) => handleChange(f.label, e.target.checked)}
                />
                <span>Check</span>
              </label>
            )}
          </div>
        ))}

        <button type="submit" disabled={submitting || form.fields.length === 0 || missingRequired}>
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default MentorConnectFeedbackForm;
