import React from "react";
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useUserContext } from '../common/UserProvider';
import StreakExamModal from "./StreakExamModal";
import { apiUrl } from '../../services/ApplicantAPIService';
import { useNavigate } from "react-router-dom";
import Nagulmeera from '../../images/dashboard/mobilebanners/mentor1.png';
import Karunakar from '../../images/dashboard/mobilebanners/karun.png';
import suhel from '../../images/dashboard/mobilebanners/suhel.png';
import SmartPhone from "../../images/dashboard/mobilebanners/smartphone.png"
import appStoreIcon from "../../images/dashboard/mobilebanners/appstoreicon.png";
import playStore from "../../images/dashboard/mobilebanners/playstore.png";
import botImage from '../../images/dashboard/mobilebanners/Bot.png';
import characterImg from '../../images/dashboard/mobilebanners/Group.png';
import './ApplicantDashboard.css';
import flameImg from '../../images/dashboard/flame.png';
import GuidedTour from "./GuidedTour";


const safeGet = (key) => {
  if (!key) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn("localStorage get failed", e);
    return null;
  }
};

const safeSet = (key, value) => {
  if (!key) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage set failed", e);
  }
};

const ApplicantDashboard = () => {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  // const [contRecJobs, setCountRecJobs] = useState(0);
  // const [contAppliedJob, setAppliedJobs] = useState(0);
  // const [contSavedJobs, setSavedJobs] = useState(0);
  const navigate = useNavigate();
  const userId = user.id
  const [hiredCount, setHiredCount] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [mentorConnectData, setMentorConnectData] = useState();
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(null);
    const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakDetails, setStreakDetails] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [imageSrc, setImageSrc] = useState('../images/user/avatar/image-01.jpg');
  const [techBuzzVideos, setTechBuzzVideos] = useState([]);
  const [techBuzzLoading, setTechBuzzLoading] = useState(true);
  const [mentorLoading, setMentorLoading] = useState(true);
    const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [badgeLoading, setBadgeLoading] = useState(true);
  const [sessionSkipped, setSessionSkipped] = useState(() => {
    return sessionStorage.getItem("streak_skipped_today") === "true";
  });

  const maxVideos = window.innerWidth > 1700 ? 6 : 4;
  const [showTour, setShowTour] = useState(false);
      const [showSnackBar, setShowSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [preRestorationStreak, setPreRestorationStreak] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const [wasRestoreAvailable, setWasRestoreAvailable] = useState(false);
  // Shows a restore-first prompt before the test popup appears
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  // Attempted dates from getAttemptedDates API – Set of "YYYY-MM-DD" strings
  const [attemptedDates, setAttemptedDates] = useState(new Set());

  const didInitRef = useRef(false);
  const [dashboardScore, setDashboardScore] = useState(0);
  const [cappedScore, setCappedScore] = useState(0);
  const [userLevel, setUserLevel] = useState("");
  const [bronzeScore, setBronzeScore] = useState(200);
  const [silverScore, setSilverScore] = useState(300);
  const [goldScore, setGoldScore] = useState(500);

  const bronzeWidth = (bronzeScore / goldScore) * 100;
  const silverWidth = ((silverScore - bronzeScore) / goldScore) * 100;
  const goldWidth = ((goldScore - silverScore) / goldScore) * 100;

  const DEFAULT_CARD = {
    applicantId: null,
    name: "",
    mobileNumber: "",
    email: "",
  };
  const [card, setCard] = useState(DEFAULT_CARD);
  const CARD_API = `${apiUrl}/applicant-card`;

  const badgeLevels = [
    { name: "bronze", score: bronzeScore },
    { name: "silver", score: silverScore },
    { name: "gold", score: goldScore },
  ];

  const earnedBadges = badgeLevels.filter(level => cappedScore >= level.score);
  const nextBadge = badgeLevels.find(level => cappedScore < level.score);

  let progressPercentage = 100;

  if (nextBadge) {
    progressPercentage =
      ((cappedScore) / (nextBadge.score)) * 100;
    progressPercentage = Math.min(Math.max(progressPercentage, 0), 100);
  }


  // Build unique key for this user's tour flag
  const TOUR_KEY = user?.id ? `tour_seen_${user.id}` : null;

  const applicantId = user.id;
  const SCORE_API = `${apiUrl}/applicant-scores/applicant`;
const allLoadingDone =
  !loading &&
  !blogsLoading &&
  !techBuzzLoading &&
  !badgeLoading &&
  !portfolioLoading &&
  !streakLoading &&
  !mentorLoading;
  
  const fetchCard = async () => {
    try {
      if (!applicantId) return;
                  if (!streakDetails) {
        setStreakLoading(true);
      }


      const jwtToken = localStorage.getItem("jwtToken");

      const { data } = await axios.get(`${CARD_API}/${applicantId}/getApplciantCard`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      // Map only fields you want into your CARD object
      const mappedCard = {
        applicantId: data.applicantId ?? null,
        name: data.name ?? "",
        mobileNumber: data.mobileNumber ?? "",
        email: data.email ?? "",
      };

      setCard(mappedCard);

    } catch (err) {
      console.error("Card API failed:", err.response || err);
      setCard(DEFAULT_CARD); // fallback
    }
  };

  useEffect(() => {
    fetchCard();
  }, [applicantId]);
  const fetchStreakDetails = async (showLoading = true) => {
    try {
      if (showLoading) setStreakLoading(true);
      const jwtToken = localStorage.getItem('jwtToken');
      if (!user?.id) return;
      const response = await axios.get(`${apiUrl}/streak/${user.id}/getStreakDetails`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      const data = response.data;
      setStreakDetails(data);

      const { currentStreak, restoreAvailable, previousStreak } = data;

      // Capture the restore flag BEFORE it can be wiped by a subsequent test submission
      if (restoreAvailable) {
        setWasRestoreAvailable(true);
      }

      // ✅ Robust Persistence Logic
      const savedBackup = localStorage.getItem(`streak_backup_${user.id}`);
      const backupVal = savedBackup ? parseInt(savedBackup, 10) : 0;

      if (restoreAvailable) {
        // Source of truth from server if available, otherwise fallback to local storage
        const effectivePrev = previousStreak || backupVal;
        if (effectivePrev > 0) {
          setPreRestorationStreak(effectivePrev);
          localStorage.setItem(`streak_backup_${user.id}`, effectivePrev.toString());
        }
      } else if (currentStreak > 1) {
        // Only backup high streaks. Protects backup from being overwritten by 1 after test submission.
        localStorage.setItem(`streak_backup_${user.id}`, currentStreak.toString());
      } else if (currentStreak <= 1 && backupVal > 0) {
        // If server says no restore but we have a backup and current is low, 
        // we keep the preRestorationStreak in state to handle the "Restore After Submission" window.
        setPreRestorationStreak(backupVal);
      }

      // ✅ Show popup only if not attempted today and not skipped in this session
      if (!data?.attemptedToday && !sessionSkipped) {
        setTimeout(() => {
          if (restoreAvailable) {
            // Show restore-first prompt instead of jumping straight to test
            setShowRestorePrompt(true);
          } else {
            setShowStreakModal(true);
          }
        }, 500);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setStreakDetails({ currentStreak: 0, longestStreak: 0, attemptedToday: false });
        setTimeout(() => setShowStreakModal(true), 500);
      } else {
        console.error("Failed to fetch streak details:", err);
      }
    } finally {
      if (showLoading) setStreakLoading(false);
    }
  };

  useEffect(() => {
    fetchStreakDetails();
  }, [user?.id]);


   useEffect(() => {
    setSessionSkipped(false);
  }, [user?.id]);

  // Fetch attempted dates from new API
  useEffect(() => {
    const fetchAttemptedDates = async () => {
      if (!user?.id) return;
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/streak/${user.id}/getAttemptedDates`,
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );
        if (Array.isArray(response.data)) {
          const dateSet = new Set(
            response.data.map(([year, month, day]) => {
              const m = String(month).padStart(2, '0');
              const d = String(day).padStart(2, '0');
              return `${year}-${m}-${d}`;
            })
          );
          setAttemptedDates(dateSet);
        }
      } catch (err) {
        // 404 = user hasn't started yet – empty calendar, not an error
        if (err?.response?.status !== 404) {
          console.error('Failed to fetch attempted dates:', err);
        }
      }
    };
    fetchAttemptedDates();
  }, [user?.id]);

  const handleRestoreStreak = async () => {
    if (isRestoring || !user?.id) return;
    try {
      setIsRestoring(true);
      const jwtToken = localStorage.getItem('jwtToken');

      // 1. Perform restore
      try {
        await axios.put(`${apiUrl}/streak/${user.id}/restore`, {}, {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
      } catch (putErr) {
        if (putErr.response?.status !== 409) throw putErr;
      }

      // 2. Fetch updated details
      let data;
      try {
        const response = await axios.get(`${apiUrl}/streak/${user.id}/getStreakDetails`, {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        data = response.data;
      } catch (getErr) {
        data = { ...streakDetails, restoreAvailable: false };
      }

      // 3. Robust sync: Ensure count reflects today (1) + preRestorationStreak
      const finalStreak = (data.currentStreak > 1) ? data.currentStreak : (1 + preRestorationStreak);
      data = {
        ...data,
        currentStreak: finalStreak,
        restoreAvailable: false
        // Removed override that sets attemptedToday to true
      };

      setStreakDetails(data);
      setPreRestorationStreak(0);
      localStorage.removeItem(`streak_backup_${user.id}`);

      // Re-fetch attempted dates so the weekly row refreshes
      try {
        const datesRes = await axios.get(
          `${apiUrl}/streak/${user.id}/getAttemptedDates`,
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );
        if (Array.isArray(datesRes.data)) {
          setAttemptedDates(new Set(
            datesRes.data.map(([y, m, d]) =>
              `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            )
          ));
        }
      } catch (_) { /* ignore */ }

      // 4. Feedback
      setSnackBarMessage("Streak restored successfully!");
      setShowSnackBar(true);
      setTimeout(() => setShowSnackBar(false), 4000);
      setShowStreakModal(true); // Chained setShowStreakModal(true)

    } catch (err) {
      console.error("Failed to restore streak:", err);
      if (preRestorationStreak > 0) {
        const fallbackData = {
          ...streakDetails,
          currentStreak: 1 + preRestorationStreak,
          restoreAvailable: false
        };
        setStreakDetails(fallbackData);
        setPreRestorationStreak(0);
        localStorage.removeItem(`streak_backup_${user.id}`);
        setSnackBarMessage("Streak restored successfully!");
      } else {
        setSnackBarMessage("Failed to restore streak. Please try again.");
      }
      setShowSnackBar(true);
      setTimeout(() => setShowSnackBar(false), 4000);
    } finally {
      setIsRestoring(false);
    }
  };



  useEffect(() => {
    if (didInitRef.current) return;
    if (!user?.id) return;

    didInitRef.current = true;
    if (window.innerWidth <= 720) return;

    const checkTourStatus = async () => {
      try {
        const jwt = localStorage.getItem("jwtToken");
        const localSeen = safeGet(TOUR_KEY);
        if (localSeen === "true") {
          console.debug("[TOUR] Already seen locally.");
          return;
        }
        const res = await axios.get(`${apiUrl}/applicant/${user.id}/tour-seen`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        const seen = res?.data?.seen === true;
        console.debug("[TOUR] Server response:", seen);

        if (!seen) {
          setTimeout(() => setShowTour(true), 400);
        } else {
          safeSet(TOUR_KEY, "true");
        }
      } catch (error) {
        console.warn("[TOUR] Failed to fetch server flag:", error);
        const localSeen = safeGet(TOUR_KEY);
        if (localSeen !== "true") {
          setTimeout(() => setShowTour(true), 400);
        }
      }
    };

    checkTourStatus();
  }, [user?.id, TOUR_KEY]);

  useEffect(() => {
    const idToUse = applicantId ?? profileData?.applicant?.id;
    if (idToUse) fetchDashboardScore(idToUse);
  }, [applicantId, profileData?.applicant?.id]);

  const fetchDashboardScore = async (id) => {
    if (!id) return setDashboardScore(0);
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      const { data: scoreRes } = await axios.get(
        `${SCORE_API}/${id}/getApplicantScoreDetails`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      console.debug("Dashboard raw score response:", scoreRes);

      let parsedScore = 0;
      let level = "";

      if (scoreRes && typeof scoreRes === "object") {
        parsedScore = scoreRes.total_score ?? scoreRes.totalScore ?? scoreRes.score ?? 0;
        level = scoreRes.level ?? "";

        // Update badge thresholds if available
        if (Array.isArray(scoreRes.badgeScores)) {
          scoreRes.badgeScores.forEach(bs => {
            const points = bs.points ?? 0;
            switch (bs.badge?.toUpperCase()) {
              case 'BRONZE': setBronzeScore(points); break;
              case 'SILVER': setSilverScore(points); break;
              case 'GOLD': setGoldScore(points); break;
              default: break;
            }
          });
        }
      }

      setDashboardScore(parsedScore);
      setUserLevel(level);
      // Use the latest goldScore from the loop result or the current state
      const currentGold = scoreRes.badgeScores?.find(b => b.badge?.toUpperCase() === 'GOLD')?.points || goldScore;
      setCappedScore(Math.min(parsedScore, currentGold));
    } catch (err) {
      console.warn("Failed to fetch dashboard score:", err?.response || err);
      setDashboardScore(0);
    }
    finally {
  setBadgeLoading(false);
}
  };


  const handleTourClose = async () => {
    if (!user?.id || !TOUR_KEY) {
      setShowTour(false);
      return;
    }

    try {
      const jwt = localStorage.getItem("jwtToken");

      await axios.post(`${apiUrl}/applicant/${user.id}/tour-seen`, null, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      safeSet(TOUR_KEY, "true");

      console.debug("[TOUR] Tour marked as seen.");
    } catch (error) {
      console.warn("[TOUR] Failed to mark tour as seen on server:", error);
      safeSet(TOUR_KEY, "true");
    }

    setShowTour(false);
  };

  useEffect(() => {
    fetch(`${apiUrl}/applicant-image/getphoto/${user.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })

      .then(response => response.blob())
      .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
      })
      .catch(() => {
        setImageSrc('../images/user/avatar/image-01.jpg');
      });
  }, [user.id]);

  useEffect(() => {
    const fetchHiredCount = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/api/hiredCount/1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Hired Count Response:', response.data);

        setHiredCount(response.data);
        console.log("hired count", hiredCount)
      } catch (error) {
        console.error('Error fetching hired count:', error);
      }
    };

    fetchHiredCount();
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `;
    document.head.appendChild(style);
  }, []);


  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const profileIdResponse = await axios.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const profileId = profileIdResponse.data;


        if (profileIdResponse.status === 200 && profileId === 0) {
           navigate('/applicant-basic-details-form/1');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile ID:', error);
          setLoading(false);

      }
    };

    checkUserProfile();
  }, [userId, navigate]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setProfileData(response.data);
        const newData = {
          identifier: response.data.applicant.email,
          password: response.data.applicant.password,
          localResume: response.data.applicant.localResume,
          firstName: response.data.basicDetails != null && response.data.basicDetails.firstName != null ? response.data.basicDetails.firstName : "",
          lastName: response.data.basicDetails != null && response.data.basicDetails.lastName != null ? response.data.basicDetails.lastName : ""
        };

        localStorage.setItem('userData', JSON.stringify(newData));
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
      finally {
      setPortfolioLoading(false);
    }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(`${apiUrl}/applicant1/tests/${user.id}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const response1 = await axios.get(`${apiUrl}/api/mentor-connect/getAllMeetings`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          }
        });
        setMentorConnectData(response1.data)

      } catch (error) {
        console.error('Error fetching test data:', error);
      }
      finally {
        setMentorLoading(false);
      }
    };

    fetchTestData();
  }, [user.id]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        const jwt = localStorage.getItem('jwtToken');
        const { data } = await axios.get(`${apiUrl}/blogs/active?size=3`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setBlogs(data);
      } catch (err) {
        console.error(err);
        setBlogsError('Unable to load blogs');
      } finally {
        setBlogsLoading(false);
      }
    };
    fetchBlogs();
  }, []);
  useEffect(() => {
    const fetchTechBuzz = async () => {
      try {
        setTechBuzzLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');
        const res = await axios.get(`${apiUrl}/videos/recommended/${user.id}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        console.log(maxVideos)
        const videos = (res.data || []).slice(0, maxVideos).map(v => ({
          videoId: v.videoId,
          title: v.title,
          s3url: v.s3url,
          thumbnail_url: v.thumbnail_url,
        }));


        setTechBuzzVideos(videos);
      } catch (err) {
        console.error("Failed to load Tech Buzz videos", err);
      } finally {
        setTechBuzzLoading(false);
      }
    };


    fetchTechBuzz();
  }, [user.id]);


  const handleRedirectTechBuzz = () => {
    navigate("/applicant-verified-videos");
  };
  const handleRedirectTechVibes = () => {
    navigate("/applicant-blog-list");
  };

  const handleRedirectMentor = () => {
    navigate("/applicant-mentorconnect");
  };

  const handleRedirectResume = () => {
    navigate("/applicant-view-profile");
  };

  const handleRedirectHackathon = () => {
    navigate("/applicant-hackathon");
  };

  const handleRedirect3 = () => {
    navigate("/applicant-interview-prep");
  };

  const tourSteps = [
    {
      id: "dashboard",
      selector: "#tour-dashboard",
      placement: "bottom",
      text: "📊 Dashboard — See a quick overview of your profile, including your skills, profile completion, and progress. Get a snapshot of your learning and activities."
    },
    {
      id: "asknewton",
      selector: "#tour-ask-newton",
      placement: "top",
      text: "🎯 Ask Newton — Your AI-powered learning companion. Ask anything — get help with skills, subjects, practicals, exams, projects, and more. Learn, practice, and solve problems effectively."
    },
    {
      id: "arena",
      selector: "#tour-innovation-arena",
      placement: "left",
      text: "💻 Innovation Arena — Participate in hackathons, coding challenges, and innovation contests. Showcase your problem-solving skills."
    },
    {
      id: "mentor",
      selector: "#tour-mentor-sphere",
      placement: "right",
      text: "👨‍🏫 Mentor Sphere — Connect with experienced mentors in your field. Get guidance, career advice, and personalized support."
    },
    {
      id: "portfolio",
      selector: "#tour-portfolio",
      placement: "right",
      text: "👤 Build Portfolio — Create and manage your professional portfolio. Showcase your skills, experience, and achievements to recruiters."
    },
    {
      id: "techbuzz",
      selector: "#tour-techbuzz",
      placement: "top",
      text: "🎥 Tech Buzz Shorts — Watch verified short video content showcasing technical skills, projects, and industry trends to stay updated."
    },
    {
      id: "techvibes",
      selector: "#tour-techvibes",
      placement: "left",
      text: "📝 Tech Vibes — Stay updated with the latest technology news and trends. Receive notifications to keep your knowledge current and relevant."
    },
    // {
    //   id: "skills",
    //   selector: "#tour-skill-validation",
    //   placement: "right",
    //   text: "✅ Skill Validation — Take skill assessment tests and earn verified badges to validate your technical skills for employers."
    // }, 
  ];



  return (
    <div className="border-style">

      <div className="blur-border-style"></div>
      {loading ? null : (
        <div className="dashboard__content">
          <div className="row mr-0 ml-10" style={{ marginTop: '-85px' }}>
            <div className="col-lg-12 col-md-12">
              <div className="page-title-dashboard">
                <div className="title-dashboard dashboard-top-container">
                  {!allLoadingDone ?(<div className="display-flex robo-container">
  <div className="card robo-card">
    <div className="container">

      <div className="robo-img">
        <div className="robo-skeleton-img"></div>
      </div>

      <div className="robo-card-text">
        <div className="robo-skeleton-text"></div>
        <div className="robo-skeleton-text short"></div>

        <div className="robo-skeleton-btn"></div>
      </div>

    </div>
  </div>
</div>) : (
                  <div className="display-flex robo-container" >
                    <div className="card robo-card">
                      <div className="container">

                        <div className="robo-img ">
                          <span>
                            <a onClick={handleRedirect3}>
                              <img
                                src={botImage}
                                alt="Bot icon"
                                width="150px"
                                height="250px"
                              />
                            </a>
                          </span>
                        </div>

                        <div className="robo-card-text">
                          <p className="robo-card-para">
                            Any topic. Anytime - <span onClick={handleRedirect3} style={{ fontSize: "24px", fontWeight: "1200", color: "#7E3601", cursor: "pointer" }} id="tour-ask-newton">Ask Newton!</span>
                          </p>

                          <button
                            onClick={handleRedirect3}
                          >
                            Get started
                          </button>

                        </div>

                      </div>
                    </div>
                  </div>
)}
                  <div className="badge-progress-wrapper">
                    {!allLoadingDone ? (

  <div className="adb-badge-skeleton-container">

    <div className="adb-badge-skeleton-title-row">
      <div className="adb-badge-skeleton-heading adb-badge-skeleton-heading-lg"></div>
      <div className="adb-badge-skeleton-heading adb-badge-skeleton-heading-sm"></div>
    </div>

   

    <div className="adb-badge-skeleton-indicator"></div>

  </div>

) : (
   <>
                    <div className="progress-text">
                      <p>Badge achievement level </p>
                      {Math.round((cappedScore / goldScore) * 100)}%
                    </div>
                    <div style={{ position: "relative" }}>
                      <div className="badge-bar">

                        <div className="segment bronze" style={{ width: `${bronzeWidth}%` }}>
                          <span>Bronze</span>
                        </div>

                        <div className="segment silver" style={{ width: `${silverWidth}%` }}>
                          <span>Silver</span>
                        </div>

                        <div className="segment gold" style={{ width: `${goldWidth}%` }}>
                          <span>Gold</span>
                        </div>

                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, (cappedScore / goldScore) * 100)}%`,
                          }}
                        ></div>
                      </div>

                      <div
                        className="bubble-indicator"
                        style={{
                          left: `${(cappedScore / goldScore) * 100}%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        {cappedScore} / {nextBadge ? nextBadge.score : goldScore}
                      </div>
                    </div>
                    {!nextBadge && (
                      <p className="congrats-text"> Congrats Buddy! You unlocked all badges!</p>
                    )}
                    </>
)}
                  </div>

                </div>
              </div>
            </div>
            <div className="col-lg-12 col-md-12">
              <div className="row dash-count profile-cards">
                <div className="profile-card-row1">
                  {/* Arena Online */}
                  {!allLoadingDone ? (<div className="arena arena-skeleton">

  <div className="arena-topSection">
    <div className="arena-skeleton-title"></div>

    <div className="arena-skeleton-text"></div>
    <div className="arena-skeleton-text short"></div>

    <div className="arena-skeleton-btn"></div>
  </div>

  <div className="arena-image">
    <div className="arena-skeleton-img"></div>
  </div>

</div>):(
                  <div className="arena">
                    <div className="arena-topSection">
                      <h4 id="tour-innovation-arena">
                        Compete. Learn. Win.
                      </h4>
                      <p>Take part in Arena’s hackathons to test your coding skills and gain hands-on experience solving real problems.</p>
                      <button onClick={handleRedirectHackathon}>
                        Enter arena!
                      </button>
                    </div>

                    <div className="arena-image">
                      <img
                        src={characterImg}
                        alt="Character Illustration"
                      />
                    </div>

                  </div>)}

                  {/* MentorSphere */}
                  <div className="mentor-sphere">
                    {!allLoadingDone ? (
  <div className="mentor-skeleton-header">

    <div className="mentor-skeleton-top">
      <div className="skeleton-title"></div>
      <div className="skeleton-viewmore"></div>
    </div>

    <div className="mentor-skeleton-tabs">
      <div className="skeleton-tab"></div>
      <div className="skeleton-tab"></div>
      <div className="skeleton-tab"></div>
    </div>

  </div>
) : (<>
                    <div className="mentor-topSection">
                      <h4 id="tour-mentor-sphere">
                        Mentor sphere
                      </h4>
                      <span
                        onClick={handleRedirectMentor}
                      >
                        View more
                      </span>
                    </div>

                    <div className="mentor-heading">
                      <h4 >Guiding star</h4>
                      <h4 >Realm of insight</h4>
                      <h4 >Insight hour</h4>
                    </div>
</>)}
  {!allLoadingDone  ? (
                      <div className="mentor-skeleton-list">
                        {[...Array(4)].map((_, idx) => (
                          <div key={idx} className="mentor-skeleton-item">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-text short"></div>
                            <div className="skeleton-text long"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mentor-card-content">
                        {mentorConnectData?.items
                          ?.filter((item) => {
                            if (item.status !== "Upcoming") return false;

                            const now = new Date();

                            const sessionDate = new Date(
                              item.date[0],
                              item.date[1] - 1,
                              item.date[2],
                              item.startTime[0],
                              item.startTime[1]
                            );

                            const endTime = new Date(sessionDate.getTime() + (item.durationMinutes || 0) * 60000);

                            return endTime > now;
                          })
                          ?.sort((a, b) => {
                            const dateA = new Date(a.date[0], a.date[1] - 1, a.date[2], a.startTime[0], a.startTime[1]);
                            const dateB = new Date(b.date[0], b.date[1] - 1, b.date[2], b.startTime[0], b.startTime[1]);
                            return dateA - dateB;
                          })
                          ?.slice(0, 4)
                          ?.map((item, idx) => {
                            const dateObj = new Date(item.date[0], item.date[1] - 1, item.date[2]);
                            const formattedDate = dateObj.toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            });
                            const hours = item.startTime[0];
                            const minutes = item.startTime[1].toString().padStart(2, "0");
                            const period = hours >= 12 ? "pm" : "am";
                            const formattedTime = `${(hours % 12) || 12}:${minutes}${period}`;
                            const defaultImages = [Nagulmeera, Karunakar, Karunakar, suhel];
                            const defaultImg = defaultImages[idx % defaultImages.length];

                            return (
                              <div className="hover-scale" onClick={handleRedirectMentor}
                                key={item.meetingId}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  cursor: "pointer",
                                  padding: "14px 0",
                                  borderBottom: idx !== 3 ? "1px solid #f0f0f0" : "none",
                                }}
                              >
                                <div className="mentor-img-text" style={{ flex: 1, display: "flex", alignItems: "center" }}>
                                  <img
                                    src={defaultImg}
                                    alt={item.mentorName}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "50%",
                                      marginRight: "12px",
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      color: "#1A1A1A",
                                    }}
                                  >
                                    {item.mentorName}
                                  </span>
                                </div>

                                <span
                                  style={{
                                    fontSize: "12px",
                                    flex: 1,
                                    textAlign: "center",
                                    color: "#444",
                                  }}
                                >
                                  {item.title}
                                </span>

                                <span
                                  style={{
                                    fontSize: "12px",
                                    flex: 1,
                                    textAlign: "right",
                                    color: "#444",
                                  }}
                                >
                                  {formattedDate}, {formattedTime}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                                      {/* Right Column Wrapper for Streak and Portfolio */}
                  <div className="portfolio-group-col">

                    {/* Recent Streaks */}
                    {!allLoadingDone ? (
                      <div className="adb-streak-skeleton-card"></div>
                    ) : (
                      <div className="recent-streaks-card">
                        <div className="streak-left-section">
                          <span className="streak-label">Streak:</span>
                          <div className="streak-text-container">
                            <span className="streak-number">{streakDetails?.currentStreak || 0}</span>
                          </div>
                                                    <img src={flameImg} alt="Flame" className="streak-flame-img" />
                        </div>
                        <div className="streak-right-section">
                          <div className="streak-days-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Recent Streaks</span>
                            <span onClick={() => navigate('/applicant-my-streaks')} style={{ cursor: 'pointer', fontSize: '13px', color: '#FFFFFF', fontWeight: 'bold' }}>
                              Explore &gt;
                            </span>
                          </div>
                          <div className="streak-days-row">
                            {(() => {
                              // ── Build last-7-days window: day[0] = 6 days ago, day[6] = today ──
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const todayDow = today.getDay(); // 0=Sun … 6=Sat
                              const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                              // Helper: date → "YYYY-MM-DD"
                              const toKey = (d) => {
                                const y = d.getFullYear();
                                const m = String(d.getMonth() + 1).padStart(2, '0');
                                const dy = String(d.getDate()).padStart(2, '0');
                                return `${y}-${m}-${dy}`;
                              };

                              const todayKey = toKey(today);
                              const yestDate = new Date(today); yestDate.setDate(today.getDate() - 1);
                              const yestKey = toKey(yestDate);

                              // ── Restore: trust ONLY the server flag from getStreakDetails ──
                              const currentStreak = streakDetails?.currentStreak || 0;
                              const isRestorable = streakDetails?.restoreAvailable ||
                                (currentStreak === 1 && preRestorationStreak > 0);

                              // ── Friday rule: if today IS Friday and Friday was attempted,
                              //    Mon-Thu of THIS week are "not-applicable" (grey, no mark) ──
                              const isFriday = todayDow === 5;
                              const fridayAttempted = attemptedDates.has(todayKey) && isFriday;

                              // Days that are "not-applicable" when Friday is done
                              const naKeys = new Set();
                              if (fridayAttempted) {
                                // Mon(1)–Thu(4) of the current week
                                for (let dow = 1; dow <= 4; dow++) {
                                  const d = new Date(today);
                                  d.setDate(today.getDate() - (todayDow - dow));
                                  naKeys.add(toKey(d));
                                }
                              }

                              // ── Build the 7 day objects ──
                              return Array.from({ length: 7 }, (_, i) => {
                                const offset = i - 6; // -6 … 0
                                const cellDate = new Date(today);
                                cellDate.setDate(today.getDate() + offset);
                                const cellKey = toKey(cellDate);
                                const cellDow = cellDate.getDay();
                                const isToday = offset === 0;

                                let status;

                                if (isToday) {
                                  status = attemptedDates.has(cellKey) ? 'taken' : 'upcoming';
                             
                                } else {
                                 status = attemptedDates.has(cellKey) ? 'taken' : 'missed';
                                }

                                if (isRestorable && cellKey === yestKey) {
                                  status = 'restore-icon'; // static icon, no blink
                                }

                                return (
                                  <div key={cellKey} className={`streak-day-block ${status}`}>
                                    <div
                                      className={`streak-status-icon ${status === 'restore-icon' && isRestoring ? 'restoring' : ''}`}
                                      onClick={status === 'restore-icon' ? handleRestoreStreak : undefined}
                                      title={status === 'restore-icon' ? 'Click to Restore Streak' : ''}
                                      style={{ position: 'relative', cursor: status === 'restore-icon' ? 'pointer' : 'default' }}
                                    >
                                      {status === 'taken' && <span className="tick-circle">✓</span>}
                                      {status === 'missed' && <span className="cross-circle">!</span>}
                                      {status === 'upcoming' && <span className="pending-circle"></span>}
                                      {status === 'not-applicable' && <span className="pending-circle" style={{ opacity: 0.3 }}></span>}
                                      {status === 'restore-icon' && (
                                        <span className="restore-circle" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          {isRestoring ? <div className="restore-spinner-small"></div> : '↺'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="streak-day-name">{DAY_NAMES[cellDow]}</div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                          <div className="longest-streak-bar">
                            <span className="longest-streak-text">Longest Day Streak</span>
                            <span className="longest-streak-num">{(streakDetails?.longestStreak || 0).toString().padStart(2, '0')}</span>
                          </div>
                          {!streakDetails?.attemptedToday && sessionSkipped && (
                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                              <span
                                onClick={() => setShowStreakModal(true)}
                                style={{
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  color: '#FFFFFF',
                                  fontWeight: 'bold',
                                  textDecoration: 'underline'
                                }}
                              >
                                Take Daily Test
                              </span>
                            </div>
                          )}
                        </div>
                      </div>)}
                    {showSnackBar && (
                      <div className="streak-snackbar">
                        <div className="snackbar-icon">✓</div>

                        <span className="snackbar-text">
                          {snackBarMessage}
                        </span>

                        <button
                          className="snackbar-close"
                          onClick={() => setShowSnackBar(false)}
                        >
                          ✕
                        </button>
                      </div>
                    )}

                  {/*  My Portfolio */}
                   {!allLoadingDone ? (
 <div className="portfolio">

    {/* Header */}
    <div className="portfolio-heading">
      <div className="adb-portfolio-skeleton-heading adb-portfolio-skeleton-heading-lg"></div>
      <div className="adb-portfolio-skeleton-heading adb-portfolio-skeleton-heading-sm"></div>
    </div>

    {/* Profile + Score */}
    <div className="profile-side-section adb-portfolio-skeleton-profile">

      <div className="adb-portfolio-skeleton-avatar"></div>

      <div className="portfolio-score-details">
        <div className="adb-portfolio-skeleton-text adb-portfolio-skeleton-text-short"></div>
        <div className="adb-portfolio-skeleton-score"></div>
      </div>

    </div>

    {/* Name */}
    <div className="adb-portfolio-skeleton-text adb-portfolio-skeleton-name"></div>

    {/* Skills */}
    <div className="skills-container adb-portfolio-skeleton-skills">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="adb-portfolio-skeleton-pill"></div>
      ))}
    </div>

  </div>
) : (
                  <div className="portfolio">
                    <div className="portfolio-heading">
                      <h4 style={{ margin: 0, fontWeight: "700", color: "#1A1A1A" }} id="tour-portfolio">
                        My portfolio
                      </h4>
                      <span
                        onClick={handleRedirectResume}
                      >
                        Explore
                      </span>
                    </div>
                    <div className="profile-side-section">
                      <div>
                        <img src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} style={{
                          borderRadius: "85%",
                          width: "65px",
                          height: "65px",
                          border: "2px solid #EA7B20"
                        }} />
                        <span className="badges">
                          {earnedBadges.map(badge => (
                            <img
                              key={badge.name}
                              src={`./images/dashboard/badge-${badge.name}.png`}
                              width="15"
                              height="23"
                            />
                          ))}
                        </span>
                      </div>
                      <div className="profile-extra-details">
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="#EA7B20" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2
           19.86 19.86 0 0 1-8.63-3.07
           19.5 19.5 0 0 1-6-6
           19.86 19.86 0 0 1-3.07-8.63
           A2 2 0 0 1 4.11 2h3
           a2 2 0 0 1 2 1.72c.12 1.06.37 2.09.74 3.06
           a2 2 0 0 1-.45 2.11L8.09 10.91
           a16 16 0 0 0 6 6l1.98-1.98
           a2 2 0 0 1 2.11-.45c.97.37 2 .62 3.06.74
           A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <p>{card?.mobileNumber}</p>
                        </span>
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="#EA7B20" stroke="white" stroke-linecap="round"
                            stroke-linejoin="round">
                            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
                            <polyline points="22 6 12 13 2 6"></polyline>
                          </svg>
                          <p>{profileData?.applicant?.email}</p>
                        </span>
                      </div>
                      <div className="portfolio-score-details">
                        <h3>score</h3>
                        <p>{dashboardScore ?? 0}</p>
                      </div>

                    </div>
                    <h3 style={{ color: 'black', fontWeight: 'bold', margin: 0 }}>
                      {card?.name}
                    </h3>
                    <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {(() => {
                        const addedBadges =
                          profileData?.applicant?.applicantSkillBadges
                            ?.filter(badge => badge.flag === 'added')
                            .map(badge => ({
                              id: badge.id,
                              name: badge.skillBadge.name,
                              status: badge.status,
                              flag: badge.flag,
                            })) || [];

                        const requiredSkills =
                          profileData?.skillsRequired?.map(skillReq => ({
                            id: skillReq.id,
                            name: skillReq.skillName,
                            status: 'REQUIRED',
                            flag: 'required',
                          })) || [];

                        const allSkills = [...addedBadges, ...requiredSkills];

                        allSkills.sort((a, b) => {
                          const lenDiff = a.name.length - b.name.length;
                          if (lenDiff !== 0) return lenDiff;
                          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
                        });

                        return allSkills.map(skill => (
                          <React.Fragment key={skill.id}>
                            <span>
                              <a>
                                <ul
                                  className="skill-but"
                                  style={{
                                    color: 'black',
                                    backgroundColor: skill.flag === 'removed' ? '#D9534F' : '#E8E8E8',
                                    display: 'inline-flex',
                                    marginRight: '2px',
                                  }}
                                >
                                  <li style={{ display: 'flex', alignItems: 'center' }}>{skill.name}</li>
                                </ul>
                              </a>
                            </span>
                          </React.Fragment>
                        ));
                      })()}
                    </div>

                  </div>)}
                  </div>
                </div>
                <div className="profile-card-row2">
                  {/* Download our App */}
                  {!allLoadingDone ? (<div className="app-card app-card-skeleton">

  <div className="app-sub-card">

    <div className="app-skeleton-text"></div>
    <div className="app-skeleton-text short"></div>

    <div className="app-skeleton-store-row">
      <div className="app-skeleton-store"></div>
      <div className="app-skeleton-store"></div>
    </div>

  </div>

  <div className="app-img">
    <div className="app-skeleton-img"></div>
  </div>

</div>):(
                  <div className="app-card">
                    <div className="app-sub-card">
                      <p className="app-card-text">
                        Why open laptop when bitLabs can be right in your pocket.
                      </p>

                      <p className="app-card-download-text">
                        Download the app now!
                      </p>

                      <div
                        className="app-store-icons"
                      >
                        <a
                          href="https://apps.apple.com/in/app/bitlabs/id6742783587"
                          target="_blank"
                          rel="noopener noreferrer"
                        > <img
                            src={appStoreIcon}
                            alt="App Store"
                          /></a>


                        <a
                          href="https://play.google.com/store/apps/details?id=com.bigtimes&utm_source=dashbd-ps-button&utm_medium=bj-dab-ps-app&utm_campaign=bj-ps-int-prof-dboard"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={playStore}
                            alt="Google Play"
                          />
                        </a>
                      </div>
                    </div>


                    {/* ✅ Mobile Image Below */}
                    <div className="app-img">
                      <img
                        src={SmartPhone}
                        alt="App Preview"
                      />
                    </div>

                  </div>)}

                  {/* Tech buzz shots */}
                  <div className="Tech-buzz">
                    <div className="tech-buzz-header">
                      <h3 id="tour-techbuzz">Tech buzz shorts</h3>
                      <button style={{ textTransform: "none" }} onClick={handleRedirectTechBuzz}>View more</button>
                    </div>
                    <div className="tech-buzz-images">
                      {!allLoadingDone  ? (
                        [...Array(maxVideos)].map((_, i) => (
                          <div key={i} className="skeleton-thumb"></div>
                        ))
                      ) : techBuzzVideos.length > 0 ? (
                        techBuzzVideos.map((video) => (
                          <div className="video-thumb-container hover-scale" onClick={() => navigate(`/applicant-verified-videos?video=${video.videoId}`)}>
                            <img
                              key={video.videoId}
                              src={video.thumbnail_url || "https://via.placeholder.com/120x80?text=No+Img"}
                              alt={video.title}

                              onError={(e) => (e.target.src = "https://via.placeholder.com/120x80?text=No+Img")}
                              style={{ cursor: "pointer" }}
                            />
                            <div className="video-overlay">
                              <div className="play-icon">▶</div>
                              <div className="video-title">{video.title}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        [...Array(maxVideos)].map((_, i) => (
                          <img
                            key={i}
                            src="https://via.placeholder.com/120x80?text=No+Video"
                            alt="No video"
                            style={{ opacity: 0.5 }}
                          />
                        ))
                      )}
                    </div>
                  </div>



                  {/* Tech Vibes */}
                  <div className="tech-vibes">
                    <div className="tech-vibes-header">
                      <h3 id="tour-techvibes">Tech vibes</h3>
                      <button className="explore-btn" onClick={handleRedirectTechVibes}>
                        Explore
                      </button>
                    </div>


                    <div className="tech-vibes-list">
                      {!allLoadingDone ? (

                        [...Array(3)].map((_, i) => (
                          <div key={i} className="tech-vibes-item">
                            <div className="skeleton-img"></div>
                            <div className="vibe-content">
                              <div className="skeleton-title"></div>
                              <div className="skeleton-date"></div>
                            </div>
                          </div>
                        ))
                      ) : blogsError ? (
                        <p className="error-msg">{blogsError}</p>
                      ) : blogs.length === 0 ? (
                        <p className="no-blogs">No blogs available</p>
                      ) : (
                        blogs.map((blog) => {
                          const formatCreatedAt = (arr) => {
                            if (!arr || !Array.isArray(arr) || arr.length < 3) return 'N/A';
                            const [year, month, day] = arr;
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('en-GB');
                          };
                          const handleBlogClick = () => {
                            navigate(`/applicant-blog-list?blog=${blog.id}`);
                          };


                          return (
                            <div
                              key={blog.id}
                              className="tech-vibes-item hover-scale"
                              onClick={handleBlogClick}
                              style={{ cursor: 'pointer', padding: '3px 0 0 5px' }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleBlogClick();
                                }
                              }}
                            >
                              <img
                                src={blog.imageUrl || 'https://via.placeholder.com/82x60?text=No+Img'}
                                alt={blog.title}
                                className="blog-thumbnail"
                                onError={(e) => (e.target.src = 'https://via.placeholder.com/82x60?text=No+Img')}
                              />


                              {/* Title + createdAt */}
                              <div className="vibe-content">
                                <h4 className="news-title">
                                  {blog.title && blog.title.length > 18
                                    ? `${blog.title.substring(0, 18)}…`
                                    : blog.title || 'Untitled'}
                                </h4>
                                <p className="news-date">{formatCreatedAt(blog.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )
      }
      {showTour && (
        <GuidedTour
          userId={user.id}
          open={showTour}
          onClose={handleTourClose}
          steps={tourSteps}
        />
      )}
                  {/* Restore-first prompt: shown when restoreAvailable=true before test modal */}
      {showRestorePrompt && (
        <div className="streak-modal-overlay">
          <div className="streak-modal-content" style={{ maxWidth: '400px' }}>
            <div className="streak-modal-header">
              <div className="streak-header-titles">
                <h2>Restore Your Streak</h2>
              </div>
            </div>
            <div className="streak-question-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>↺</div>
              <p style={{ fontSize: '15px', color: '#444', marginBottom: '8px' }}>
                You have a streak to restore from yesterday!
              </p>
              <p style={{ fontSize: '13px', color: '#888' }}>
                Restore now to keep your streak, or take today's test first.
              </p>
            </div>
            <div className="streak-modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button
                className="streak-nav-btn"
                onClick={() => {
                  setShowRestorePrompt(false);
                  setShowStreakModal(true); // proceed to test
                }}
              >
                Take Test First
              </button>
              <button
                className="streak-submit-btn"
                disabled={isRestoring}
                onClick={async () => {
                  await handleRestoreStreak();
                  setShowRestorePrompt(false);
                  setShowStreakModal(true); // Open test popup immediately after restore
                }}
              >
                {isRestoring ? 'Restoring...' : 'Restore Streak'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showStreakModal && (
        <StreakExamModal
          userId={user.id}
          onClose={() => {
            const currentDay = new Date().toISOString().split('T')[0];
            safeSet(`streak_modal_shown_${currentDay}_${user.id}`, "true");
            // Set session skipped flag
            sessionStorage.setItem("streak_skipped_today", "true");
            setSessionSkipped(true);
            setShowStreakModal(false);
          }}
          onExamCompleted={async () => {
            const idToUse = applicantId ?? profileData?.applicant?.id;
            if (idToUse) fetchDashboardScore(idToUse); // Refresh score
            fetchStreakDetails(false); // Refresh streak silently
            // Re-fetch attempted dates so today's cell turns green immediately
            try {
              const jwtToken = localStorage.getItem('jwtToken');
              const res = await axios.get(
                `${apiUrl}/streak/${user.id}/getAttemptedDates`,
                { headers: { Authorization: `Bearer ${jwtToken}` } }
              );
              if (Array.isArray(res.data)) {
                setAttemptedDates(new Set(
                  res.data.map(([y, m, d]) =>
                    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                  )
                ));
              }
            } catch (_) { /* 404 = first attempt, ignore */ }
            // Clear session skipped
            sessionStorage.setItem("streak_skipped_today", "false");
            setSessionSkipped(false);
          }}
        />
      )}


    </div>
  );
};

export default ApplicantDashboard;