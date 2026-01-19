import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";

// Fallback images
import DummyMentor from "../../images/mentor-dummy.png";
import DummyBanner from "../../images/bannercard_mentor1.jpg";
import noSearchResults from "../../images/empty-state-images/no-search-results.png";
import noMentorConnects from "../../images/empty-state-images/noMentorConnects.png";

const ApplicantMentorConnect = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const user = useUserContext()?.user;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem("jwtToken");
        const headers = jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {};
        const resp = await axios.get(
          `${apiUrl}/api/mentor-connect/getAllMeetings`,
          {
            headers,
            signal: controller.signal,
          }
        );

        // Accept either array or paged envelope { items: [...] }
        if (!mounted) return;
        const payload = resp.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
        setMeetings(list);
        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("MentorConnect fetch error:", err);
          setError("Failed to fetch sessions. Please try again.");
          setMeetings([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      controller.abort();
      mounted = false;
    };
  }, []);

  // ---------- helpers ----------
  // Accept LocalDate as [yyyy,mm,dd] or "yyyy-mm-dd"
  // Accept LocalTime as [hh,mm,ss?] or "hh:mm[:ss]"
  const buildStartDate = (dateVal, timeVal) => {
    try {
      let y,
        m,
        d,
        hh = 0,
        mm = 0,
        ss = 0;

      if (Array.isArray(dateVal)) {
        [y, m, d] = dateVal;
      } else if (typeof dateVal === "string") {
        const dt = new Date(dateVal);
        if (!isNaN(dt.getTime())) {
          y = dt.getFullYear();
          m = dt.getMonth() + 1;
          d = dt.getDate();
        } else {
          const parts = dateVal.split("-").map((x) => parseInt(x, 10));
          [y, m, d] = parts;
        }
      }

      if (Array.isArray(timeVal)) {
        hh = timeVal[0] ?? 0;
        mm = timeVal[1] ?? 0;
        ss = timeVal[2] ?? 0;
      } else if (typeof timeVal === "string") {
        const parts = timeVal.split(":").map((x) => parseInt(x, 10));
        hh = parts[0] ?? 0;
        mm = parts[1] ?? 0;
        ss = parts[2] ?? 0;
      }

      if (y == null || m == null || d == null) return null;

      // Build in *local* time to avoid UTC shifts
      const dt = new Date();
      dt.setFullYear(y);
      dt.setMonth((m ?? 1) - 1);
      dt.setDate(d);
      dt.setHours(hh, mm, ss, 0);
      return isNaN(dt.getTime()) ? null : dt;
    } catch {
      return null;
    }
  };

  const formatDuration = (mins) => {
    const n = Number(mins);
    if (!Number.isFinite(n)) return "";
    if (n < 60) return `${n} mins`;
    const h = Math.floor(n / 60);
    const r = n % 60;
    return r ? `${h} hr ${r} mins` : `${h} hr${h > 1 ? "s" : ""}`;
  };

  // replace existing computeStatus with this version
  const computeStatus = (m) => {
    // Always compute using local time to avoid server TZ drift
    const start = buildStartDate(m.date, m.startTime);
    if (!start) return "Expired";

    const mins = Number(m.durationMinutes ?? m.duration ?? 60) || 60;
    const end = new Date(start.getTime() + mins * 60000);

    const now = new Date();

    // treat exact start time as Active (>= start && < end)
    if (now >= start && now < end) return "Active";
    if (now < start) return "Upcoming";
    return "Expired";
  };

  // Google Calendar: use local time (no Z) to avoid timezone mismatch
  const toGoogleLocal = (d) => {
    const p = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(
      d.getHours()
    )}${p(d.getMinutes())}${p(d.getSeconds())}`;
  };

  const buildGoogleCalendarUrl = (m) => {
    const title = m.title ?? "Mentor Session";
    const details = [
      m.description || "",
      m.meetLink ? `Join: ${m.meetLink}` : "",
      "MentorSphere — bitLabs Jobs",
    ]
      .filter(Boolean)
      .join("\n\n");

    const start = buildStartDate(m.date, m.startTime);
    if (!start) {
      return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
        title
      )}&details=${encodeURIComponent(details)}`;
    }
    const mins = Number(m.durationMinutes ?? m.duration ?? 60) || 60;
    const end = new Date(start.getTime() + mins * 60000);
    const dates = `${toGoogleLocal(start)}/${toGoogleLocal(end)}`;

    return (
      "https://www.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(m.meetLink ?? "")}` +
      `&dates=${encodeURIComponent(dates)}`
    );
  };

  const copyLink = async (link) => {
    if (!link) return alert("No link available.");
    try {
      await navigator.clipboard.writeText(link);
      alert("Meet link copied!");
    } catch {
      alert("Unable to copy. Please copy manually.");
    }
  };

  // ---------- search + hide Expired ----------
  const normalized = (s) => (s || "").toString().toLowerCase().trim();
  const filteredMeetings = useMemo(() => {
    const q = normalized(query);

    const base = meetings.filter((m) => computeStatus(m) !== "Expired"); // hide expired

    if (!q) return base;

    return base.filter((m) => {
      const hay = [
        m.title,
        m.description,
        m.mentorName,
        m.technology,
        m.mentorRole,
      ]
        .map(normalized)
        .join(" ");
      return hay.includes(q);
    });
  }, [meetings, query]);

  // ---------- styles ----------
  const styles = {
    grid: `
      .mentor-grid { display:flex; flex-wrap:wrap; gap:18px; }
      .mentor-card { flex:1 1 calc(33.333% - 18px); max-width:calc(33.333% - 18px); }
      @media (max-width: 992px) { .mentor-card { flex:1 1 calc(50% - 18px); max-width:calc(50% - 18px); } }
      @media (max-width: 640px) { .mentor-card { flex:1 1 100%; max-width:100%; } }
      .page-title-wrap { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .search-input { width:280px; max-width:40vw; border:1px solid #E5E7EB; border-radius:10px; padding:10px 12px; font-size:14px; }
      @media (max-width:640px){ .search-input{ width:100%; max-width:none; } .page-title-wrap{ flex-direction:column; align-items:stretch; } }
       @media (min-width: 900px) and (min-height: 1200px){ .noMentorimg{ width:550px;  }   .noMentormsg {
    font-size: 26px!important;    }
    /* Default */
.noSearchimg {
  width: 400px;
  max-width: 90%;
  height: auto;
}

.noSearchText {
  font-size: 17px;
}

/* iPad Pro 12.9" — 1024 x 1366 */
@media (width: 1024px) and (height: 1366px) {
  .noSearchResults {
    width: 520px;
  }

  .noSearchText {
    font-size: 24px;
  }
}

/* Large tablets — 912 x 1368 */
@media (width: 912px) and (height: 1368px) {
  .noSearchResults {
    width: 500px;
  }

  .noSearchText {
    font-size: 22px;
  }
}
} `,
  };

  const Card = ({ m }) => {
    const status = computeStatus(m);
    const banner = m.bannerImageUrl || DummyBanner;
    const avatar = m.mentorProfileUrl || DummyMentor;
    const duration = formatDuration(m.durationMinutes ?? m.duration ?? 60);
    const gcalUrl = buildGoogleCalendarUrl(m);

    // Enable rules
    const startEnabled = status === "Active";
    const addCalEnabled = status === "Upcoming";

    const statusColor =
      status === "Active"
        ? "#22c55e"
        : status === "Upcoming"
          ? "#F59E0B"
          : "#9CA3AF";

    // Date-time label under Duration
    const dtLabel = (() => {
      const dt = buildStartDate(m.date, m.startTime);
      return dt
        ? dt.toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: true,
        })
        : "Date not available";
    })();

    return (
      <div
        className="mentor-card"
        style={{
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #EEF2F7",
          boxShadow: "0 12px 24px rgba(17,24,39,0.06)",
          padding: 12, // card padding
        }}
      >
        {/* Banner */}
        <div
          style={{
            width: "100%",
            height: 160,
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <img
            src={banner}
            alt={m.title || "Mentor session"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DummyBanner;
            }}
          />
        </div>

        {/* Body */}
        <div
          style={{
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* Header row: Status (left) — Copy link (right) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                background: status === "Active" ? statusColor : "transparent", // green for Active, transparent for Upcoming
                color: status === "Active" ? "#fff" : "#F97316", // orange text for Upcoming
                border: status === "Upcoming" ? "2px solid #F97316" : "none", // orange border for Upcoming
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 3,
                boxShadow:
                  status === "Active" ? "0 6px 12px rgba(0,0,0,0.12)" : "none",
                display: "inline-block",
                textTransform: "capitalize",
              }}
            >
              {status}
            </span>

            <button
              onClick={() => copyLink(m.meetLink)}
              style={{
                background: "transparent",
                color: "#EF8C2F",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
                textTransform: "none",
              }}
            >
              Copy link
            </button>
          </div>

          {/* Title/desc/duration */}
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>
            {m.title}
          </div>
          {m.description ? (
            <div style={{ fontSize: 14, color: "#475569" }}>
              {m.description}
            </div>
          ) : null}
          <div style={{ fontSize: 12, color: "#ef6c00", fontWeight: 700 }}>
            Duration: {duration}
          </div>
          <div style={{ fontSize: 13, color: "#000", fontWeight: 600 }}>
            Date:{dtLabel}
          </div>

          {/* Mentor row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={avatar}
              alt={m.mentorName || "Mentor"}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #FFE0C2",
                background: "#fff",
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DummyMentor;
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.1,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                {m.mentorName || "Mentor"}
              </span>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>
                {m.mentorRole || "Career coach"}
              </span>
            </div>
          </div>

          {/* CTA row */}
          <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
            {/* Start now — keep color; just block click & change cursor when not enabled */}
            <button
              onClick={() => {
                if (!startEnabled || !m.meetLink) return;
                window.open(m.meetLink, "_blank", "noopener,noreferrer");
              }}
              aria-disabled={!startEnabled || !m.meetLink}
              style={{
                flex: 1,
                background: "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)",
                color: "#fff",
                border: 0,
                padding: "12px 16px",
                borderRadius: 5,
                fontWeight: 800,
                fontSize: 14,
                cursor: startEnabled && m.meetLink ? "pointer" : "not-allowed",
                boxShadow: "0 8px 18px rgba(249,115,22,0.25)",
                textTransform: "none",
              }}
            >
              Start now
            </button>

            {/* Add Calendar — keep colors, block click when not enabled */}
            <button
              onClick={() => {
                if (!addCalEnabled) return; // block click when not upcoming
                window.open(gcalUrl, "_blank", "noopener,noreferrer");
              }}
              aria-disabled={!addCalEnabled}
              style={{
                /* keep the same colors */
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#fff",
                color: "#F97316",
                border: "1px solid #F97316",
                borderRadius: 5,
                padding: "12px 16px",
                fontWeight: 800,
                fontSize: 14,
                cursor: addCalEnabled ? "pointer" : "not-allowed",
                textTransform: "none",
              }}
            >
              Add calendar
            </button>
          </div>
        </div>
      </div>
    );
  };
  const MentorSkeleton = ({ count = 6 }) => {
    return (
      <div className="mentor-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="mentor-card"
            style={{
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #EEF2F7",
              boxShadow: "0 12px 24px rgba(17,24,39,0.06)",
              padding: 12, // ✅ same as real card
              pointerEvents: "none",
              opacity: 0.95,
            }}
          >
            {/* ✅ Banner — EXACT HEIGHT */}
            <div
              style={{
                width: "100%",
                height: 160, // ✅ same as real
                borderRadius: 5,
                overflow: "hidden",
                background: "#e5e7eb",
              }}
            />

            {/* ✅ Body — EXACT SPACING */}
            <div
              style={{
                padding: 14, // ✅ same as real
                display: "flex",
                flexDirection: "column",
                gap: 8, // ✅ same as real
              }}
            >
              <div
                style={{
                  width: "70%",
                  height: 20,
                  background: "#e5e7eb",
                  borderRadius: 6,
                }}
              />
              <div
                style={{
                  width: "90%",
                  height: 14,
                  background: "#e5e7eb",
                  borderRadius: 6,
                }}
              />
              <div
                style={{
                  width: "50%",
                  height: 13,
                  background: "#e5e7eb",
                  borderRadius: 6,
                }}
              />
              <div
                style={{
                  width: "60%",
                  height: 13,
                  background: "#e5e7eb",
                  borderRadius: 6,
                }}
              />

              {/* ✅ Mentor Row — EXACT SIZE */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                  }}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 14,
                      background: "#e5e7eb",
                      borderRadius: 6,
                    }}
                  />
                  <div
                    style={{
                      width: 90,
                      height: 12,
                      background: "#e5e7eb",
                      borderRadius: 6,
                    }}
                  />
                </div>
              </div>

              {/* ✅ CTA Buttons — EXACT HEIGHT */}
              <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    height: 42,
                    background: "#e5e7eb",
                    borderRadius: 5,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    height: 42,
                    background: "#e5e7eb",
                    borderRadius: 5,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div
        className="dashboard__content"
        style={{ paddingTop: 4, paddingBottom: 8 }}
      >
        <style>{styles.grid}</style>

        <div className="row" style={{ marginTop: "-100px" }}>
          <div className="col-lg-12 col-md-12">
            <div className="main-header-row">
              <h1 className="main-heading">Mentor sphere</h1>

              <div className="hackathon-search-box">
                <i className="fa fa-search search-icon1"></i>
                <input
                  type="text"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="hackathon-search-input"
                />
                {query && (
                  <i
                    className="fa fa-times clear-icon"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setQuery("")}
                  ></i>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-12 col-md-12">
          <section className="flat-dashboard-setting2">
            <div className="themes-container">
              <div className="content-tab">
                <div className="inner">
                  {loading ? (
                    <MentorSkeleton count={6} />
                  ) : !query && meetings.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "60vh",
                        gap: "10px",
                      }}
                    >
                      <img
                        className="noMentorimg"
                        src={noMentorConnects}
                        alt="No Mentor Connects"
                      />
                      <p
                        className="noMentormsg"
                        style={{
                          color: "#6b7280",
                          textAlign: "center",
                          fontSize: "18px",
                          fontStyle: "sans-serif",
                          fontWeight: "500",
                        }}
                      >
                        No Mentor connects available at this time
                      </p>
                    </div>
                  ) : query && filteredMeetings.length === 0 ? (
                    <div
                      style={{
                        height: "60vh",
                        textAlign: "center",
                        color: "#6b7280",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        className="noSearchimg"
                        src={noSearchResults}
                        alt="No Search Results"
                        style={{ width: "400px" }}
                      />
                      <p
                        className="noSearchText"
                        style={{
                          color: "#6b7280",
                          textAlign: "center",
                          fontSize: "18px",
                          fontWeight: "500",
                        }}
                      >
                        {" "}
                        No mentor connects match your search.
                      </p>
                    </div>
                  ) : (
                    <div className="mentor-grid">
                      {filteredMeetings
                        .slice()
                        .sort((a, b) => {
                          // Order: Active (1) → Upcoming (2)
                          const order = { Active: 1, Upcoming: 2, Expired: 3 };
                          const sa = computeStatus(a);
                          const sb = computeStatus(b);
                          const diff = (order[sa] || 99) - (order[sb] || 99);
                          if (diff !== 0) return diff;

                          // within same status, earlier start first
                          const ta =
                            buildStartDate(a.date, a.startTime)?.getTime() ??
                            Number.MAX_SAFE_INTEGER;
                          const tb =
                            buildStartDate(b.date, b.startTime)?.getTime() ??
                            Number.MAX_SAFE_INTEGER;
                          return ta - tb;
                        })
                        .map((m) => (
                          <Card
                            key={m.meetingId ?? m.meeting_id ?? m.id}
                            m={m}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApplicantMentorConnect;
