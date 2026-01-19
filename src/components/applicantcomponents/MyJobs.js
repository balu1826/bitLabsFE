import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import Spinner from "../common/Spinner";
import Snackbar from "../common/Snackbar";
import "./ApplicantFindJobs.css";

/** ---------- Small reusable Pagination ---------- */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const makeWindow = () => {
    const visible = [];
    for (let i = 0; i < totalPages; i++) visible.push(i + 1);
    const windowed = visible
      .filter((p) => p <= 2 || p > totalPages - 2 || (p >= page && p <= page + 3))
      .reduce((acc, p, i, arr) => {
        if (i > 0 && p !== arr[i - 1] + 1) acc.push("…");
        acc.push(p);
        return acc;
      }, []);
    return windowed;
  };

  return (
    <div className="pagination" style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, gap: 10 }}>
      <button
        onClick={() => onChange(page - 1)}
        className="arrow-button"
        disabled={page === 1}
        style={page === 1 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
      >
        &lsaquo;
      </button>

      {makeWindow().map((p, idx) =>
        p === "…" ? (
          <span key={`e-${idx}`} style={{ padding: "0 5px" }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={page === p ? "active" : ""}
            style={{ marginBottom: 5 }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        className="arrow-button"
        disabled={page === totalPages}
        style={page === totalPages ? { opacity: 0.5, cursor: "not-allowed" } : {}}
      >
        &rsaquo;
      </button>
    </div>
  );
}

function JobCard({ job, tab, onSave, onView, onCheckStatus, onRemove }) {
 // drop-in replacement inside JobCard
const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", {
    year: "numeric",        // <-- fixed
    month: "long",
    day: "numeric",
  });
};

  const convertToLakhs = (x) => (x * 1).toFixed(2);
  const formatLac = (n) => {
  const v = Number(n);
  if (!isFinite(v)) return "—";
  return v % 1 === 0 ? v.toFixed(0) : v.toFixed(2);
};

  const company =
    job.companyname || job?.jobRecruiter?.companyname || job?.company || "—";

  return (
    <div className="job-card" key={job.id}>
      {/* ======= Brand banner ======= */}
      <div className="job-card__brand">
        <span className="job-card__brand-text">{company}</span>
      </div>

      {/* ======= Meta row ======= */}
      <div className="job-card__meta">
        <div className="job-card__loc">
          <span className="icon-map-pin"></span>
          <span>&nbsp;{job.location}</span>
        </div>
        <div className="job-card__posted">Posted on {formatDate(job.creationDate)}</div>
      </div>

      {/* ======= Job title & salary ======= */}
      <h3 className="job-card__title">{job.jobTitle}</h3>
      <div className="job-card__salary">
        ₹ {formatLac(job.minSalary)} Lac – {formatLac(job.maxSalary)} Lac
      </div>

      {/* ======= Chips ======= */}
      <div className="job-card__chips">
        <span className="chip">{job.employeeType}</span>
        <span className="chip">{job.remote ? "Remote" : "Office-based"}</span>
        <span className="chip">
          Exp {job.minimumExperience}–{job.maximumExperience} Years
        </span>
      </div>

      {/* ======= Footer buttons ======= */}
      <div className="job-card__footer">
        {tab === "recommended" && (
          <>
            <button className="btn btn--outline" onClick={() => onSave(job.id)}>
              Save Job
            </button>
            <button className="btn btn--primary" onClick={() => onView(job.id)}>
              View Job
            </button>
          </>
        )}

        {tab === "applied" && (
          <button className="btn btn--primary btn--full" onClick={() => onCheckStatus(job.id, job.applyJobId)}>
            Check Status
          </button>
        )}

        {tab === "saved" && (
          <>
            <button className="btn btn--outline" onClick={() => onRemove(job.id)}>
              Remove
            </button>
            <button className="btn btn--primary" onClick={() => onView(job.id)}>
              View Job
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** ---------- Generic list section for each tab ---------- */
function JobListSection({ tab, userId, jwt, setSelectedJobId, addSnackbar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);       // 1-based for UI
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const countUrl = useMemo(() => {
    switch (tab) {
      case "recommended": return `${apiUrl}/recommendedjob/countRecommendedJobsForApplicant/${userId}`;
      case "applied":     return `${apiUrl}/applyjob/countAppliedJobs/${userId}`;
      case "saved":       return `${apiUrl}/savedjob/countSavedJobs/${userId}`;
      default: return "";
    }
  }, [tab, userId]);

  const listUrl = useMemo(() => {
    const base = tab === "recommended"
      ? `${apiUrl}/recommendedjob/findrecommendedjob/${userId}`
      : tab === "applied"
      ? `${apiUrl}/applyjob/getAppliedJobs/${userId}`
      : `${apiUrl}/savedjob/getSavedJobs/${userId}`;
    return `${base}?page=${page - 1}&size=${size}`; // backend 0-indexed
  }, [tab, userId, page, size]);

  const headers = useMemo(() => ({ Authorization: `Bearer ${jwt}` }), [jwt]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // count
      const c = await axios.get(countUrl, { headers });
      const total = Number(c.data || 0);
      const tp = Math.max(1, Math.ceil(total / size));
      setTotalPages(tp);
      // clamp page if needed
      if (page > tp) setPage(tp);

      // list
      const res = await axios.get(listUrl, { headers });
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Error loading jobs", e);
    } finally {
      setLoading(false);
    }
  }, [countUrl, listUrl, headers, page, size]);

  // reload whenever tab or page changes
  useEffect(() => { load(); }, [load]);

  // Reset page when switching tabs
  useEffect(() => { setPage(1); }, [tab]);

  // Actions
  const handleView = (jobId) => {
    setSelectedJobId(jobId);
    navigate(`/applicant-view-job?jobId=${jobId}`, { state: { from: location.pathname } });
  };

  const handleSave = async (jobId) => {
    try {
      await axios.post(`${apiUrl}/savedjob/applicants/savejob/${userId}/${jobId}`, null, { headers });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      addSnackbar({
        message: "Job saved successfully.",
        link: "/applicant-saved-jobs",
        linkText: "View Saved Jobs",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      addSnackbar({ message: "Error saving job. Please try again later.", type: "error" });
    }
  };

  const handleRemove = async (jobId) => {
    try {
      await axios.delete(`${apiUrl}/savedjob/applicants/deletejob/${userId}/${jobId}`, { headers });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      addSnackbar({ message: "Job removed successfully.", type: "success" });
    } catch (e) {
      console.error(e);
      addSnackbar({ message: "Error removing job. Please try again later.", type: "error" });
    }
  };

  const handleCheckStatus = (jobId, applyJobId) => {
    setSelectedJobId(applyJobId);
    navigate(`/applicant-interview-status?jobId=${jobId}&applyJobId=${applyJobId}`);
  };

  return (
    <>
      {loading ? <Spinner /> : (
        <div className="group-col-2">
          {jobs.length === 0 ? (
            <div style={{ marginLeft: 30 }}>
              {tab === "recommended" ? "No jobs available" :
               tab === "applied"     ? "No applied jobs available" :
                                        "No saved jobs available"}
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                tab={tab}
                onSave={handleSave}
                onView={handleView}
                onCheckStatus={handleCheckStatus}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => p >= 1 && p <= totalPages && setPage(p)}
      />
    </>
  );
}

/** ---------- Main page ---------- */
export default function MyJobs({ setSelectedJobId }) {
  const { user } = useUserContext();
  const userId = user.id;
  const jwt = user.data.jwt;

  const [tab, setTab] = useState("recommended"); // "recommended" | "applied" | "saved"
  const [snackbars, setSnackbars] = useState([]);

  // counters
  const [counts, setCounts] = useState({ recommended: 0, applied: 0, saved: 0 });

  const headers = useMemo(() => ({ Authorization: `Bearer ${jwt}` }), [jwt]);

  const addSnackbar = (snackbar) => setSnackbars((s) => [...s, snackbar]);
  const closeSnackbar = (idx) => setSnackbars((s) => s.filter((_, i) => i !== idx));

  useEffect(() => {
    // load all three counters in parallel
    const loadCounts = async () => {
      try {
        const [r, a, s] = await Promise.all([
          axios.get(`${apiUrl}/recommendedjob/countRecommendedJobsForApplicant/${userId}`, { headers }),
          axios.get(`${apiUrl}/applyjob/countAppliedJobs/${userId}`, { headers }),
          axios.get(`${apiUrl}/savedjob/countSavedJobs/${userId}`, { headers }),
        ]);
        setCounts({
          recommended: Number(r.data || 0),
          applied: Number(a.data || 0),
          saved: Number(s.data || 0),
        });
      } catch (e) {
        console.error("Error loading counts", e);
      }
    };
    loadCounts();
  }, [userId, headers]);

  return (
    <div className="dashboard__content">
      <div className="row mr-0 ml-10">
        {/* Header */}
        <div className="col-lg-12 col-md-12">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="title-dashboard">
                <div className="title-dash flex2">My Jobs</div>
              </div>
            </div>
          </section>
        </div>

       {/* Stat cards */}
<div className="stats-card">
  <button className={`card-stat ${tab === "recommended" ? "active" : ""}`} onClick={() => setTab("recommended")}>
    <span className="stat-icon">💼</span>
    <div><div className="label">Recommended Jobs</div><div className="value">{counts.recommended}</div></div>
  </button>
  <button className={`card-stat ${tab === "applied" ? "active" : ""}`} onClick={() => setTab("applied")}>
    <span className="stat-icon">🌱</span>
    <div><div className="label">Applied Jobs</div><div className="value">{String(counts.applied).padStart(2,"0")}</div></div>
  </button>
  <button className={`card-stat ${tab === "saved" ? "active" : ""}`} onClick={() => setTab("saved")}>
    <span className="stat-icon">🏅</span>
    <div><div className="label">Saved Jobs</div><div className="value">{String(counts.saved).padStart(2,"0")}</div></div>
  </button>
</div>


        {/* Tab header */}
        <div className="col-lg-12 col-md-12">
          <section className="flat-dashboard-setting flat-dashboard-setting2">
            <div className="themes-container">
              <div className="content-tab">
                <div className="inner">
                  {/* Section body */}
                  <JobListSection
                    key={tab}             // ensures internal state resets when switching tabs
                    tab={tab}
                    userId={userId}
                    jwt={jwt}
                    setSelectedJobId={setSelectedJobId}
                    addSnackbar={addSnackbar}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* snackbars */}
      {snackbars.map((sn, i) => (
        <Snackbar
          key={i}
          index={i}
          message={sn.message}
          type={sn.type}
          onClose={() => closeSnackbar(i)}
          link={sn.link}
          linkText={sn.linkText}
        />
      ))}
    </div>
  );
}
