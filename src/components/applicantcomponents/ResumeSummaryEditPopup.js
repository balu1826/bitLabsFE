import React, { useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";

const SUMMARY_API = `${apiUrl}/applicant-summary`;
const MIN_LEN = 30;
const MAX_LEN = 2000;

const ResumeSummaryEditPopup = ({ initialSummary = "", applicantId, onSuccess, onError }) => {
  const [value, setValue] = useState(initialSummary || "");
  const [saving, setSaving] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const trimmed = useMemo(() => (value || "").trim(), [value]);
  const length = trimmed.length;

  const error = !length
    ? ""
    : length < MIN_LEN
      ? `Summary must be at least ${MIN_LEN} characters.`
      : length > MAX_LEN
        ? `Summary must be no more than ${MAX_LEN} characters.`
        : "";

  const canSave = !error && !saving && length > 0;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      await axios.put(
        `${SUMMARY_API}/${applicantId}/updateApplicantSummary`,
        { summary: trimmed },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      onSuccess?.();
    } catch (e) {
      console.error("Summary update failed:", e?.response || e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Failed to update summary";
      onError?.(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Edit resume summary</h3>

      <textarea
        rows={10}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setIsTouched(true)}
        placeholder="Write a concise professional summary (30–2000 chars)…"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          lineHeight: 1.5,
          resize: "vertical",
        }}
      />

      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: error ? "#b91c1c" : "#6b7280",
          fontSize: 13,
        }}
      >
        {length > 0 && (
          <>
            <span>{error || "Looks good."}</span>
            <span>{length}/{MAX_LEN}</span>
          </>
        )}
      </div>

      <div style={{ marginTop: 12, textAlign: "right" }}>
        <button
          className="btn-primary"
          onClick={save}
          disabled={!canSave}
          aria-busy={saving}
          style={{ opacity: canSave ? 1 : 0.6 }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ResumeSummaryEditPopup;
