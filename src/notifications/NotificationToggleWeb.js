import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../services/ApplicantAPIService";
import { LiaBell, LiaBellSlash } from "react-icons/lia";

export default function NotificationToggleWeb() {
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem("notificationsMuted");
    return saved === "true";
  });

  const jwt = localStorage.getItem("jwtToken");

  useEffect(() => {
    const fcmToken = localStorage.getItem("fcmToken");
    if (!fcmToken) {
      console.warn("⚠️ No fcmToken found in localStorage; cannot fetch mute state");
      return;
    }

    const fetchFcmDetails = async () => {
      try {
        const endpoint = `${apiUrl}/notification/getFcmTokenDetails/${fcmToken}`;
        console.log("📡 Fetching FCM token details:", { endpoint, fcmToken });

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        const isTokenActive = response?.data?.isTokenActive;
        if (typeof isTokenActive === "boolean") {
          const newMuted = !isTokenActive; // active => unmuted, inactive => muted
          setMuted(newMuted);
          localStorage.setItem("notificationsMuted", newMuted ? "true" : "false");
        }
      } catch (err) {
        console.error("❌ Failed to fetch FCM token details:", err?.response?.data || err.message);
      }
    };

    fetchFcmDetails();
  }, [jwt]);

  const updateServerMute = async (isMuted) => {
    try {
      const fcmToken = localStorage.getItem("fcmToken");
      if (!fcmToken) {
        console.warn("⚠️ No fcmToken found in localStorage; cannot update mute state");
        return;
      }

      const endpoint = `${apiUrl}/notification/${isMuted ? "mute" : "unmute"}/${fcmToken}`;
      console.log("📡 Updating server mute state:", { isMuted, fcmToken, endpoint });

      await axios.put(endpoint, null, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("✅ Server mute state updated");
    } catch (err) {
      console.error("❌ Failed to update server mute state:", err?.response?.data || err.message);
    }
  };

  const handleToggle = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    localStorage.setItem("notificationsMuted", newMuted ? "true" : "false");

    await updateServerMute(newMuted);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: "pointer",
      }}
      onClick={handleToggle}
      onMouseEnter={(e) => {
        e.currentTarget.querySelector("span").style.color = "#f97316";
        e.currentTarget.querySelector("p").style.color = "#f97316";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.querySelector("span").style.color = muted ? "gray" : "black";
        e.currentTarget.querySelector("p").style.color = muted ? "gray" : "black";
      }}
    >
      <div aria-live="polite">
        {muted ? (
          <span style={{ color: "gray" }}>
            <LiaBellSlash />
          </span>
        ) : (
          <span style={{ color: "black" }}>
            <LiaBell />
          </span>
        )}
      </div>
      <p
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          color: muted ? "gray" : "black",
        }}
      >
        {muted ? "Unmute Notifications" : "Mute Notifications"}
      </p>
    </div>
  );
}
