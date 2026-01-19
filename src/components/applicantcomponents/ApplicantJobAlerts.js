import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import "./ApplicantJobAlert.css"
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ApplicantJobAlerts() {
  const [jobAlerts, setJobAlerts] = useState([]);
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [readLoading, setReadLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const navigate = useNavigate();

  const fetchAlertsFromServer = async () => {
    if (!user || !user.id) {
      return [];
    }

    try {
      const authToken = localStorage.getItem("jwtToken");

      const url = `${apiUrl}/notifications/getNotifications/${user.id}`;
      const resp = await axios.get(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const alerts = Array.isArray(resp.data) ? resp.data : [];

      setJobAlerts(alerts);
      return alerts;
    } catch (err) {
      console.error("❌ ERROR:", err);
      setJobAlerts([]);
      return [];
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchAlertsFromServer().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => (mounted = false);
  }, [user?.id]);

  const handleDeleteAlert = async (id) => {
    try {
      // Add to deleting items and start animation
      setDeletingItems(prev => new Set(prev).add(id));

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      const authToken = localStorage.getItem("jwtToken");
      await axios.delete(
        `${apiUrl}/notifications/${id}/deleteNotification/${user.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Update UI after successful deletion
      setJobAlerts(prev => prev.filter(alert => alert.id !== id));
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      // Update notification count in header
      window.dispatchEvent(new CustomEvent("alerts-updated"));
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Remove from deleting items if there was an error
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleReadAll = async () => {
    if (!user?.id) return;

    setReadLoading(true);
    const authToken = localStorage.getItem("jwtToken");

    try {
      const url = `${apiUrl}/notifications/move-to-seen-everywhere/${user.id}`;

      await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setJobAlerts((prevAlerts) =>
        prevAlerts.map((alert) => ({
          ...alert,
          seenApplicantId: [...new Set([...(alert.seenApplicantId || []), user.id])],
          applicantId: (alert.applicantId || []).filter(id => id !== user.id)
        }))
      );

      window.dispatchEvent(
        new CustomEvent("alerts-updated", { detail: { unreadCount: 0 } })
      );
    } catch (err) {
      console.error("❌ ERROR MARKING ALL AS READ:", err);
    } finally {
      setReadLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!user?.id) return;

    try {
      setClearLoading(true);
      // Mark all items as deleting
      const itemIds = new Set(jobAlerts.map(alert => alert.id));
      setDeletingItems(itemIds);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      const authToken = localStorage.getItem("jwtToken");
      await axios.delete(
        `${apiUrl}/notifications/deleteAllNotifications/${user.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Clear all notifications
      setJobAlerts([]);
      setDeletingItems(new Set());

      // Update notification count in header
      window.dispatchEvent(new CustomEvent("alerts-updated", { detail: { unreadCount: 0 } }));
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      setDeletingItems(new Set());
    } finally {
      setClearLoading(false);
    }
  };

  function formatDate(dateArray) {
    if (!Array.isArray(dateArray)) return "";
    const [year, month, day] = dateArray;
    const date = new Date(year, month - 1, day);
    return date.toDateString();
  }

  const anyActionRunning = readLoading || clearLoading;

  return (
    <div className="border-style">
      <div className="blur-border-style" />
      <div className="dashboard__content notifications">
        <section className="page-title-dashboard extraSpace">
          <div className="themes-container notification-container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="title-dashboard">
                  <div className="title-dash flex2">
                    Notifications
                  </div>

                  <div className="notification-btn" style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleReadAll}
                      disabled={loading || jobAlerts.length === 0 || !jobAlerts.some(alert => !alert.seenApplicantId?.includes(user?.id))}
                      style={{
                        background: "#fd7e14",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontWeight: 600,
                        textTransform: "none",
                        width: "50%",
                        opacity: (loading || jobAlerts.length === 0 || !jobAlerts.some(alert => !alert.seenApplicantId?.includes(user?.id))) ? 0.6 : 1,
                        cursor: (loading || jobAlerts.length === 0 || !jobAlerts.some(alert => !alert.seenApplicantId?.includes(user?.id))) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Read all
                    </button>

                    <button
                      onClick={handleClearAll}
                      disabled={loading || jobAlerts.length === 0}
                      style={{
                        background: "#fff",
                        color: "#fd7e14",
                        border: "1px solid #fd7e14",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontWeight: 600,
                        textTransform: "none",
                        width: "50%",
                        opacity: (loading || jobAlerts.length === 0) ? 0.6 : 1,
                        cursor: (loading || jobAlerts.length === 0) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flat-dashboard-dyagram">
          <div className="col-lg-12 col-md-12">
            {loading ? (
              <div style={{ padding: 20 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      padding: "20px",
                      marginBottom: "12px",
                      borderRadius: "10px",
                      background: "#fff",
                      boxShadow: "0 0 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    <Skeleton height={20} width="60%" style={{ marginBottom: 10 }} />
                    <Skeleton height={15} width="40%" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="box-notifications">

                {jobAlerts.length > 0 ? (
                  <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                    {jobAlerts.map((alert) => {
                        let redirectRoute = "/";
                        let featureName = alert.feature;

                        if (alert.feature === "hackathon") {
                          redirectRoute = `/applicant-hackathon-details/${alert.featureId}`;
                          featureName = "Hackathon";
                        } else if (alert.feature === "Tech Vibes") {
                          redirectRoute = `/applicant-blog-list?blog=${alert.featureId}`;
                          featureName = "TechVibes";
                        } else if (alert.feature === "Tech buzz shorts") {
                          redirectRoute = `/applicant-verified-videos?video=${alert.featureId}`;
                          featureName = "Techbuzz";
                        }else if (alert.feature === "Mentor Connect") {
                          redirectRoute = `/applicant-mentorconnect`;
                          featureName = "Mentor Connect";
                        }

                        const isDeleting = deletingItems.has(alert.id);

                        return (
                          <li
                            key={alert.id}
                            className={`notification-item ${isDeleting ? 'deleting' : ''}`}
                            style={{
                              padding: "20px",
                              borderRadius: 10,
                              marginBottom: 12,
                              position: "relative",
                              boxShadow: "0 0 4px rgba(0,0,0,0.1)",
                              cursor: "pointer",
                              background: alert.seenApplicantId?.includes(user?.id) ? "#E8E8E8" : "#fff",
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {/* MESSAGE */}
                            <h3 className="notification-message"
                              style={{
                                marginBottom: 5,
                                color: alert.seenApplicantId?.includes(user?.id) ? "#666" : "#000",
                                fontWeight: alert.seenApplicantId?.includes(user?.id) ? "normal" : "bold",
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!user?.id) return;

                                try {
                                  const authToken = localStorage.getItem("jwtToken");
                                  const url = `${apiUrl}/notifications/${alert.id}/move-to-seen/${user.id}`;

                                  await axios.put(
                                    url,
                                    {},
                                    { headers: { Authorization: `Bearer ${authToken}` } }
                                  );

                                  setJobAlerts((prevAlerts) =>
                                    prevAlerts.map((a) =>
                                      a.id === alert.id
                                        ? {
                                          ...a,
                                          seenApplicantId: [...(a.seenApplicantId || []), user.id],
                                          applicantId: (a.applicantId || []).filter(id => id !== user.id)
                                        }
                                        : a
                                    )
                                  );

                                  navigate(redirectRoute);
                                } catch (err) {
                                  console.error("❌ ERROR MARKING NOTIFICATION AS READ:", err);
                                  navigate(redirectRoute);
                                }
                              }}
                            >
                              <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                border: '2px solid #fd7e14',
                                background: alert.seenApplicantId?.includes(user?.id) ? 'transparent' : '#fd7e14',
                                flexShrink: 0,
                                boxSizing: 'border-box'
                              }} />
                              {alert.message}
                            </h3>

                            <div className="notification-down-content" style={{ color: "#666" }}>
                              <span>Posted On: {formatDate(alert.createdTime)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAlert(alert.id);
                                }}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#fd7e14",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                                disabled={isDeleting}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <div className="notification-empty-state">
                    <img src="/images/notification-empty-state.png" width="400px" />
                    <h4>No new notifications at the moment.</h4>
                  </div>
                )}
              </div>
            )}
          </div>

        </section>
      </div>
    </div>
  );
}