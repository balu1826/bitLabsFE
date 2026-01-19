import React, { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import { useLocation } from "react-router-dom";
import "./VerifiedVideos.css";
import nosearchresults from "../../images/empty-state-images/no-search-results.png";
import novideosfound from "../../images/empty-state-images/no-video-found.png";

const preloadAll = true;

const VerifiedVideos = () => {
  const { user } = useUserContext();
  const userId = user.id;
  const inputRef = useRef(null);
  const playerRef = useRef(null);

  const [videoList, setVideoList] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [tags, setTags] = useState(["All"]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isWide, setIsWide] = useState(window.innerWidth >= 1300);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerBuffering, setPlayerBuffering] = useState(false);
  const [durations, setDurations] = useState({});
  const [showReplay, setShowReplay] = useState(false);
  const [watchedDuringSession, setWatchedDuringSession] = useState(new Set()); // 🆕 all watched this session
  const [hasFetched, setHasFetched] = useState(false);

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const startVideoId = urlParams.get("video");
  const [autoPlayVideoId, setAutoPlayVideoId] = useState(
    startVideoId ? parseInt(startVideoId, 10) : null
  );

  // 🧭 Handle responsive layout
  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 1300);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 📦 Fetch videos
  useEffect(() => {
    let mounted = true;
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem("jwtToken");
        const res = await axios.get(`${apiUrl}/videos/recommended/${userId}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (!mounted) return;
        const data = res.data || [];

        const normalized = data.map((v, idx) => ({
          videoId: v.videoId ?? idx,
          title: v.title ?? `Video ${idx + 1}`,
          s3url: v.s3url,
          thumbnail_url: v.thumbnail_url,
          tags: v.tags ?? "",
        }));

        setVideoList(normalized);
        setFilteredVideos(normalized);

        const uniqueTags = [
          "All",
          ...new Set(
            normalized.map((v) => v.tags?.trim().toLowerCase()).filter(Boolean)
          ),
        ];
        const formattedTags = uniqueTags.map((t) =>
          t === "All" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)
        );
        setTags(formattedTags);

        if (preloadAll) {
          normalized.forEach((v) => {
            if (v.s3url) {
              const hv = document.createElement("video");
              hv.src = v.s3url;
              hv.preload = "auto";
              hv.muted = true;
              hv.style.display = "none";
              document.body.appendChild(hv);
            }
          });
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          setHasFetched(true);
        }
      }
    };

    fetchVideos();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // 🔎 Apply search + filter
  useEffect(() => {
    let filtered = [...videoList];
    if (search.trim()) {
      filtered = filtered.filter((video) =>
        video.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter !== "All") {
      filtered = filtered.filter(
        (video) =>
          (video.tags ?? "").trim().toLowerCase() === filter.toLowerCase()
      );
    }
    setFilteredVideos(filtered);
  }, [search, filter, videoList]);

  // ▶️ Auto-play param
  useEffect(() => {
    if (autoPlayVideoId && filteredVideos.length > 0 && !modalOpen) {
      const index = filteredVideos.findIndex(
        (v) => v.videoId === autoPlayVideoId
      );
      if (index !== -1) {
        handleOpenPlayer(index);
        setAutoPlayVideoId(null);
        window.history.replaceState({}, "", "/applicant-verified-videos");
      }
    }
  }, [filteredVideos, autoPlayVideoId, modalOpen]);

  // 🕒 Track video watch progress — triggers API once at 70%
  const handleProgress = async (progress, videoId) => {
    if (progress.played >= 0.7 && !watchedVideos[videoId]) {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        await axios.post(
          `${apiUrl}/api/video-watch/track`,
          { applicantId: userId, videoId },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setWatchedVideos((prev) => ({ ...prev, [videoId]: true }));
        setWatchedDuringSession((prev) => new Set(prev.add(videoId)));
      } catch (err) {
        console.error("Failed to log watch:", err);
      }
    }
  };

  // 🧩 Modal controls
  const handleOpenPlayer = (index) => {
    setPlayingIndex(index);
    setPlayerReady(false);
    setPlayerBuffering(true);
    setModalOpen(true);
    setShowReplay(false);
    document.body.style.overflow = "hidden";
  };

  // 🧹 Close modal — reorder *all watched videos* this session
  const closeModal = () => {
    setModalOpen(false);
    setPlayingIndex(null);
    setPlayerReady(false);
    setPlayerBuffering(false);
    setShowReplay(false);

    if (watchedDuringSession.size > 0) {
      setFilteredVideos((prev) => {
        const newlyWatchedIds = Array.from(watchedDuringSession);
        const newlyWatched = prev.filter(v =>
          newlyWatchedIds.includes(v.videoId)
        );
        const remaining = prev.filter(
          v => !newlyWatchedIds.includes(v.videoId)
        );
        return [...remaining, ...newlyWatched];
      });

      // Clear the session tracker
      setWatchedDuringSession(new Set());
    }

    document.body.style.overflow = "";
  };

  // ⏭ Player navigation
  const handleNext = () => {
    if (playingIndex < filteredVideos.length - 1) {
      handleOpenPlayer(playingIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (playingIndex > 0) {
      handleOpenPlayer(playingIndex - 1);
    }
  };

  const handleReplay = () => {
    setShowReplay(false);
    playerRef.current.seekTo(0);
  };

  const onPlayerReady = () => {
    setPlayerReady(true);
    setPlayerBuffering(false);
  };
  const onBuffer = () => setPlayerBuffering(true);
  const onBufferEnd = () => setPlayerBuffering(false);
  const VideoSkeleton = ({ count = 15 }) => {
    return (
      <div className="oneminute-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="oneminute-card skeleton-card">
            {/* ✅ Uses REAL thumbnail container */}
            <div className="oneminute-player-wrapper">
              <div className="thumb-button skeleton-thumb-btn">
                <div className="oneminute-thumb skeleton-fill"></div>
              </div>
            </div>

            {/* ✅ Uses REAL meta row */}
            <div className="oneminute-video-meta">
              <div className="oneminute-avatar skeleton-fill"></div>
              <p className="oneminute-title skeleton-text">&nbsp;</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        <div className="oneminute-header">
          <h2 className="oneminute-heading">Tech buzz shorts</h2>

          <div className="hackathon-search-box">
            <i className="fa fa-search search-icon1"></i>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hackathon-search-input"
            />
            {search && (
              <i
                className="fa fa-times clear-icon"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearch("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
              />
            )}
          </div>
        </div>

        {loading ? (
          <VideoSkeleton count={15} />
        ) : !hasFetched ? null : videoList.length === 0 ? ( // 🛡 SAFETY: prevents flicker before API resolves
          // 📭 DB EMPTY (no videos at all)
          <div
            className="no-videos-empty"
            style={{
              height: "70%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={novideosfound}
              alt="No Videos"
              width="400px"
              maxWidth="500px"
            />
            <p
              style={{fontWeight: "500",fontStyle: "sans-serif",fontSize: "17px"}}
            >
              No videos available yet.
            </p>
          </div>
        ) : search && filteredVideos.length === 0 ? (
          // 🔍 SEARCH RESULT EMPTY (DB has videos, search returned none)
          <div
            className="no-videos-empty"
            style={{
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={nosearchresults} alt="No Videos" width="400px" />
            <p
              style={{
                fontWeight: "500",
                fontStyle: "sans-serif",
                fontSize: "17px",
              }}
            >
              No video matches for your search
            </p>
          </div>
        ) : (
          // 🎬 VIDEOS GRID
          <div className="oneminute-grid">
            {filteredVideos.map((video, index) => {
              const isPlayingCard = playingIndex === index && modalOpen;
              const isWatched = watchedVideos[video.videoId];

              return (
                <div
                  key={video.videoId || index}
                  className={`oneminute-card ${
                    isPlayingCard ? "playing-card" : ""
                  } ${isWatched ? "watched-card" : ""}`}
                >
                  <div className="oneminute-player-wrapper">
                    <button
                      type="button"
                      className="thumb-button"
                      onClick={() => handleOpenPlayer(index)}
                      aria-label={`Play ${video.title || `Video ${index + 1}`}`}
                    >
                      <img
                        src={video.thumbnail_url || "/images/default-thumb.png"}
                        alt={video.title}
                        className="oneminute-thumb"
                        draggable={false}
                      />
                    </button>
                  </div>

                  <div className="oneminute-video-meta">
                    <svg
                      width="36.155"
                      height="31.211"
                      viewBox="0 0 36.155 31.211"
                      className="oneminute-avatar"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id="linear-gradient"
                          y1="0.093"
                          x2="1"
                          y2="1"
                          gradientUnits="objectBoundingBox"
                        >
                          <stop offset="0" stopColor="#f8af50" />
                          <stop offset="1" stopColor="#e76d10" />
                        </linearGradient>
                      </defs>
                      <g transform="translate(0 -35)">
                        <g transform="translate(0 35)">
                          <g transform="translate(0 0)">
                            <path
                              d="M30.031,35H6.131A6.134,6.134,0,0,0,0,41.131V60.08a6.13,6.13,0,0,0,6.131,6.131H30.024a6.13,6.13,0,0,0,6.131-6.131V41.131A6.124,6.124,0,0,0,30.031,35ZM16.3,37.86a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953v1.66a.954.954,0,0,1-.953.953h-1.66a.954.954,0,0,1-.953-.953Zm-6.583,0a.957.957,0,0,1,.946-.953h1.66a.953.953,0,0,1,.953.946V39.52a.954.954,0,0,1-.953.953h-1.66a.948.948,0,0,1-.946-.953ZM6.7,63.358a.954.954,0,0,1-.953.953H4.082a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953h1.66A.954.954,0,0,1,6.7,61.7Zm0-23.837a.948.948,0,0,1-.953.946H4.082a.953.953,0,0,1-.953-.946V37.86a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Zm6.583,23.837a.953.953,0,0,1-.946.953H10.665a.954.954,0,0,1-.953-.953V61.7a.948.948,0,0,1,.953-.946h1.66a.953.953,0,0,1,.953.946ZM11.654,54.91v-8.6a3.059,3.059,0,0,1,4.584-2.649l7.451,4.3a3.056,3.056,0,0,1,0,5.29l-7.451,4.3a3.053,3.053,0,0,1-4.584-2.642Zm8.207,8.447a.954.954,0,0,1-.953.953h-1.66a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Zm6.583,0a.957.957,0,0,1-.946.953h-1.66a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953H25.5a.948.948,0,0,1,.946.953Zm0-23.837a.957.957,0,0,1-.946.953h-1.66a.957.957,0,0,1-.953-.946V37.86a.954.954,0,0,1,.953-.953H25.5a.954.954,0,0,1,.953.953Zm6.583,23.837a.954.954,0,0,1-.953.953h-1.66a.954.954,0,0,1-.953-.953V61.7a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Zm0-23.837a.954.954,0,0,1-.953.953h-1.66a.953.953,0,0,1-.953-.946V37.86a.954.954,0,0,1,.953-.953h1.66a.954.954,0,0,1,.953.953Z"
                              transform="translate(0 -35)"
                              fill="url(#linear-gradient)"
                            />
                          </g>
                        </g>
                      </g>
                    </svg>

                    <p className="oneminute-title">{video.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalOpen && playingIndex !== null && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div
              className="oneminute-modal-content"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {playerBuffering && (
                <div className="modal-spinner">
                  <div className="spinner"></div>
                  <div className="buffer-text">Buffering...</div>
                </div>
              )}

              <div className="video-container">
                <ReactPlayer
                  ref={playerRef}
                  url={filteredVideos[playingIndex].s3url}
                  playing={true}
                  controls={true}
                  width="100%"
                  height="100%"
                  onReady={onPlayerReady}
                  onBuffer={onBuffer}
                  onBufferEnd={onBufferEnd}
                  onProgress={(progress) =>
                    handleProgress(
                      progress,
                      filteredVideos[playingIndex].videoId
                    )
                  }
                  onEnded={() => setShowReplay(true)}
                  onSeek={() => setShowReplay(false)}
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload",
                        disablePictureInPicture: true,
                        preload: "auto",
                        playsInline: true,
                      },
                    },
                  }}
                />

                {/* Replay Button Centered */}
                {showReplay && (
                  <button className="video-replay-btn" onClick={handleReplay}>
                    ⟳ Replay
                  </button>
                )}

                {/* Navigation Buttons */}
                <button
                  className="video-prev-btn"
                  onClick={handlePrevious}
                  disabled={playingIndex === 0}
                >
                  ⟨
                </button>

                <button
                  className="video-next-btn"
                  onClick={handleNext}
                  disabled={playingIndex === filteredVideos.length - 1}
                >
                  ⟩
                </button>
              </div>

              <button
                className="oneminute-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="800px"
                  height="800px"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="#2A4157"
                    fill-opacity="0.24"
                  />
                  <path
                    d="M16 8L8 16"
                    stroke="#222222"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 8L16 16"
                    stroke="#222222"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifiedVideos;
