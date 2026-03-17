// src/components/feedback/FeedbackFormBuilder.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import "./FeedbackFormBuilder.css";

const FeedbackFormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  // Single source of truth for the builder
  const [form, setForm] = useState({
    // We intentionally do NOT show these as static inputs anymore.
    // Backend allows empty strings. Keep them here so edit > save doesn't break.
    collegeName: "",
    mentorName: "",
    sessionTitle: "",
    fields: [],
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!formId);

  // Load for edit
  useEffect(() => {
    let mounted = true;
    if (!formId) return;
    (async () => {
      try {
        const res = await axios.get(`${apiUrl}/mentorfeedback/forms/${formId}`);
        if (!mounted) return;

        const data = res.data || {};
        const fields = Array.isArray(data.fields) ? data.fields : [];

        setForm({
          collegeName: data.collegeName || "",
          mentorName: data.mentorName || "",
          sessionTitle: data.sessionTitle || "",
          fields: fields.map((f) => ({
            label: f.label || "",
            fieldType: f.fieldType || "text",
            options: typeof f.options === "string" ? f.options : (f.options ?? ""),
            required: !!f.required,
          })),
        });
      } catch (err) {
        console.error("Error loading form:", err);
        alert("Failed to load form.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [formId, apiUrl]);

  // Field CRUD
  const addField = () => {
    setForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { label: "", fieldType: "text", required: false, options: "" },
      ],
    }));
  };

  const updateField = (index, key, value) => {
    setForm((prev) => {
      const updated = [...prev.fields];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, fields: updated };
    });
  };

  const removeField = (index) => {
    setForm((prev) => {
      const updated = prev.fields.filter((_, i) => i !== index);
      return { ...prev, fields: updated };
    });
  };

  // Save create/update
  const handleSave = async () => {
    try {
      setSaving(true);

      // Only dynamic fields should drive the student form.
      // We keep meta as empty strings so backend DTO stays happy.
      const payload = {
        collegeName: "",   // intentionally empty
        mentorName: "",    // intentionally empty
        sessionTitle: "",  // intentionally empty
        fields: form.fields.map((f) => ({
          label: f.label,
          fieldType: f.fieldType,
          options: f.options,
          required: !!f.required,
        })),
      };

      const res = formId
        ? await axios.put(`${apiUrl}/mentorfeedback/forms/${formId}`, payload)
        : await axios.post(`${apiUrl}/mentorfeedback/forms`, payload);

      const saved = res.data;
      const message = `
✅ ${formId ? "Form updated successfully!" : "Form created successfully!"}
🆔 Form ID: ${saved.id}
🔗 Form URL: ${window.location.origin}/feedback/${saved.id}
      `;
      alert(message);

      navigate("/feedback-dashboard");
    } catch (error) {
      console.error("Error saving form:", error);
      alert("❌ Failed to save form. Please check the console.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="form-builder">
        <h1>Loading form...</h1>
      </div>
    );
  }

  return (
    <div className="form-builder">
      <h1>{formId ? "Edit Feedback Form" : "Create New Feedback Form"}</h1>

      {/* Fields Section (keeps your existing styles) */}
      <div className="fields-section">
        <h3>Form Fields</h3>

        {form.fields.map((field, index) => (
          <div className="field-item" key={index}>
            <input
              type="text"
              placeholder="Question Label"
              value={field.label}
              onChange={(e) => updateField(index, "label", e.target.value)}
            />

            <select
              value={field.fieldType}
              onChange={(e) => updateField(index, "fieldType", e.target.value)}
            >
              <option value="text">Short Answer</option>
              <option value="textarea">Paragraph</option>
              <option value="number">Number</option>
              <option value="dropdown">Dropdown</option>
              <option value="rating">Rating (1–5)</option>
              <option value="checkbox">Checkbox</option>
            </select>

            {field.fieldType === "dropdown" && (
              <input
                type="text"
                placeholder="Comma-separated options"
                value={field.options}
                onChange={(e) => updateField(index, "options", e.target.value)}
              />
            )}

            <label>
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => updateField(index, "required", e.target.checked)}
              />
              Required
            </label>

            <button className="remove-btn" onClick={() => removeField(index)}>
              ❌
            </button>
          </div>
        ))}

        <button className="add-field-btn" onClick={addField}>
          ➕ Add Question
        </button>
      </div>

      <div className="form-actions">
        <button onClick={handleSave} disabled={saving || form.fields.length === 0}>
          💾 {saving ? "Saving..." : "Save Form"}
        </button>
        <button onClick={() => navigate("/feedback-dashboard")}>⬅ Back</button>
      </div>
    </div>
  );
};

export default FeedbackFormBuilder;
