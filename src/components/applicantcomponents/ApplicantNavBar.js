import { Link, useLocation, useNavigate } from "react-router-dom";
import $ from "jquery";
import "jquery.cookie";
import "metismenu";
import { useState, useEffect, useReducer } from "react";
import { useUserContext } from "../common/UserProvider";
import { apiUrl } from "../../services/ApplicantAPIService";
import ModalLogout from "../common/ModalLogout";
import axios from "axios";
import logos from "../../images/profileIcon.png";
import NotificationToggleWeb from "../../notifications/NotificationToggleWeb";
import shape8 from "../../images/dashboard/side-nav-icons/power.svg";
import shape7 from "../../images/dashboard/side-nav-icons/techVibes.svg";
import shape6 from "../../images/dashboard/side-nav-icons/innovationArena.svg";
import shape5 from "../../images/dashboard/side-nav-icons/techBuzzShorts.svg";
import shape3 from "../../images/dashboard/side-nav-icons/skillValidation.svg";
import shape4 from "../../images/dashboard/side-nav-icons/mentorSphere.svg";
import shape from "../../images/dashboard/side-nav-icons/dashboard.svg";
import shape2 from "../../images/dashboard/side-nav-icons/buildportfolio.svg";
import botImage from "../../images/dashboard/mobilebanners/Bot.png";
import botImage1 from "../../images/dashboard/mobilebanners/Bot1.png";
import "./ApplicantNavBar.css";
import notificationIcon from "../../images/notificationIcon.svg";

function ApplicantNavBar() {
  const location = useLocation();
  const hideSidebarRoutes = ["/applicant-dymmy"];
  const hiddenRoutes = ["/applicant-interview-prep", "/applicanthome"];
  const [isOpen, setIsOpen] = useState(
    window.innerWidth >= 1302 &&
      !hideSidebarRoutes.some((route) => location.pathname.startsWith(route))
  );
  const { user } = useUserContext();
  const [imageSrc, setImageSrc] = useState("");
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const [isSubAccountVisible, setIsSubAccountVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hamburgerClass, setHamburgerClass] = useState("fa fa-bars");
  const frompath = location.state?.from;
  const { pathname } = useLocation();

  const DEFAULT_CARD = {
    applicantId: null,
    name: "",
    mobileNumber: "",
    email: "",
  };
  const [card, setCard] = useState(DEFAULT_CARD);
  const CARD_API = `${apiUrl}/applicant-card`;
  const applicantId = user.id;

  const handleRedirect = () => {
    navigate("/applicant-interview-prep");
  };

  const shouldHide = hiddenRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const toggleSubAccount = () => {
    setIsSubAccountVisible(!isSubAccountVisible);
  };

  const fetchCard = async () => {
    try {
      if (!applicantId) return;

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

  useEffect(() => {
    const updateSidebarClasses = () => {
      const shouldHide = hideSidebarRoutes.some(
        (route) =>
          location.pathname === route ||
          location.pathname.startsWith(route + "/")
      );

      if (window.innerWidth >= 1301 && !shouldHide) {
        document.body.classList.add("grid-handler");
        document.body.classList.add("hide-hamburger");
      } else {
        document.body.classList.add("close-sidebar");
        document.body.classList.remove("hide-hamburger");
      }
    };

    window.addEventListener("resize", updateSidebarClasses);

    updateSidebarClasses();

    return () => window.removeEventListener("resize", updateSidebarClasses);
  }, [pathname]);

  const handleOutsideClick = (event) => {
    const accountElement = document.querySelector(".account");

    if (accountElement && !accountElement.contains(event.target)) {
      setIsSubAccountVisible(false);
    }
  };

  document.addEventListener("click", handleOutsideClick);

  const [requestData, setRequestData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/applicant/getApplicantById/${user.id}`
        );

        const newData = {
          identifier: response.data.email,
          password: response.data.password,
        };
        console.log(response.data);

        setRequestData(newData);
      } catch (error) {
        console.error("Error updating profile status:", error);
      }
    };
    fetchData();
  }, []);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (hamburgerClass === "fa fa-bars") {
      setHamburgerClass("fa fa-arrow-left");
      document.body.classList.remove("close-sidebar");
      document.body.classList.add("grid-handler");
    } else {
      setHamburgerClass("fa fa-bars");
      document.body.classList.add("close-sidebar");
      document.body.classList.remove("grid-handler");
    }
  };

  const hideMenu = (e) => {
    e.stopPropagation();
    setIsOpen(window.innerWidth >= 1302);
    setHamburgerClass("fa fa-bars");
  };

  useEffect(() => {
    const path = location.pathname;

    const isExcluded =
      path === "/applicant-hackathon" ||
      path.startsWith("/applicant-hackathon-details/");

    if (!isExcluded) {
      localStorage.setItem("applicantHackathonTab", "UPCOMING");
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const shouldHide = hideSidebarRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (shouldHide) {
        setIsOpen(false);
        document.body.classList.add("close-sidebar");
        document.body.classList.remove("grid-handler");
      } else {
        const open = window.innerWidth >= 1302;
        setIsOpen(open);

        if (open) {
          document.body.classList.remove("close-sidebar");
          document.body.classList.add("grid-handler");
        } else {
          document.body.classList.add("close-sidebar");
          document.body.classList.remove("grid-handler");
        }
      }

      setHamburgerClass("fa fa-bars");
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    $("#left-menu-btn").on("click", function (e) {
      e.preventDefault();
      if ($("body").hasClass("sidebar-enable")) {
        $("body").removeClass("sidebar-enable");
        $.cookie("isButtonActive", "0");
      } else {
        $("body").addClass("sidebar-enable");
        $.cookie("isButtonActive", "1");
      }
      if ($(window).width() >= 1400) {
        $("body").toggleClass("show-job");
      } else {
        $("body").removeClass("show-job");
        $.cookie("isButtonActive", null);
      }
    });

    if ($.cookie("isButtonActive") == 1) {
      $("body").addClass("sidebar-enable show-job");
    }

    fetch(`${apiUrl}/applicant-image/getphoto/${user.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
      })
      .catch(() => {
        setImageSrc("../images/user/avatar/image-01.jpg");
      });

    return () => {
      window.removeEventListener("resize", handleResize);
      $("#left-menu-btn").off("click");
    };
  }, [pathname, user.id]);

  const handleLogout = () => {
    console.log("Logout button clicked");
    try {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      window.location.href = "https://jobs.bitlabs.in/candidate";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    fetchAlertCount();
  }, [location.key]);

  const fetchAlertCount = async () => {
    try {
      const [jobAlertsResponse, notificationsResponse] = await Promise.all([
        axios.get(
          `${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        ),
        axios.get(`${apiUrl}/notifications/getNotifications/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }),
      ]);

      const notifications = Array.isArray(notificationsResponse.data)
        ? notificationsResponse.data
        : [];
      const unreadNotificationsCount = notifications.reduce(
        (count, notification) => {
          const isUnread = notification.applicantId?.includes(user.id);
          return isUnread ? count + 1 : count;
        },
        0
      );

      const jobAlertsCount = Number(jobAlertsResponse.data) || 0;
      const totalCount = jobAlertsCount + unreadNotificationsCount;

      setAlertCount(totalCount);
      console.log(totalCount);
    } catch (error) {
      console.error("Error fetching alert counts:", error);
      try {
        const response = await axios.get(
          `${apiUrl}/applyjob/applicants/${user.id}/unread-alert-count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        setAlertCount(Number(response.data) || 0);
      } catch (fallbackError) {
        console.error("Error fetching fallback alert count:", fallbackError);
        setAlertCount(0);
      }
    }
  };

  useEffect(() => {
    const checkUserData = setInterval(() => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        setUserData(JSON.parse(storedData));
        clearInterval(checkUserData);
      }
    }, 200);
    console.log(userData);
    return () => clearInterval(checkUserData);
  }, [user.id]);

  return (
    <div>
      <div className="menu-mobile-popup">
        <div className="modal-menu__backdrop" />
        <div className="widget-filter">
          <div className="mobile-header">
            <div id="logo" className="logo">
              <a href="/applicanthome">
                <img
                  src={imageSrc || "../images/user/avatar/image-01.jpg"}
                  alt="Profile"
                  onError={() =>
                    setImageSrc("../images/user/avatar/image-01.jpg")
                  }
                />
              </a>
            </div>
            <a className="title-button-group">
              <i className="icon-close" />
            </a>
          </div>
          <div className="header-customize-item button">
            <a href="/applicant-update-profile">Upload Resume</a>
          </div>
        </div>
      </div>
      <header id="header" className="header header-default ">
        <div className="tf-container ct2">
          <div className="row">
            <div className="col-md-12">
              <div className="sticky-area-wrap">
                <div className="header-ct-left">
                  {window.innerWidth < 2000 && (
                    <span
                      id="hamburger"
                      className={hamburgerClass}
                      onClick={handleToggleMenu}
                    ></span>
                  )}
                  <span style={{ width: "20px", height: "2px" }}></span>
                  <div id="logo" className="logo">
                    <a href="/applicanthome">
                      <img className="site-logo" src={logos} alt="Image" />
                    </a>
                  </div>
                </div>

                <div className="header-ct-right">
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      marginTop: "10px",
                      marginRight: "22px",
                    }}
                  >
                    <Link
                      to="/applicant-job-alerts"
                      className={
                        location.pathname === "/applicant-job-alerts"
                          ? "tf-effect active"
                          : ""
                      }
                    >
                      <span className="notify-bell">
                        <img src={notificationIcon} />
                        {alertCount > 0 && (
                          <span class="notify-count position-absolute top-0 start-100 translate-middle badge rounded-pill">
                            {alertCount}
                            <span class="visually-hidden">unread messages</span>
                          </span>
                        )}
                      </span>
                    </Link>
                  </div>

                  <div
                    id="specificDiv"
                    className="header-customize-item account"
                  >
                    
                    <div className="profile-icon">
                      <a href="/applicant-view-profile"> 
                      <img 
                        width="32px"
                        height="32px"
                        src={imageSrc || "../images/user/avatar/image-01.jpg"}
                        alt="Profile"
                        onClick={toggleSubAccount}
                        onError={() =>
                          setImageSrc("../images/user/avatar/image-01.jpg")
                        }
                      />
                      </a>
                    </div>
                    {userData && (
                      <div className="user-info">
                        <p>Hi,</p>
                        <h6 className="user-name">{card?.name}</h6>
                        <p className="user-email">{userData.identifier}</p>
                      </div>
                    )}
                    <div>
                    <div
                      className="toggle-subaccount-icon"
                      onClick={toggleSubAccount}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M11.9998 14.6038C11.8844 14.6038 11.7769 14.5833 11.6773 14.5423C11.5776 14.5013 11.4851 14.4365 11.3998 14.348L6.96602 9.91451C6.82769 9.77918 6.75894 9.61601 6.75977 9.42501C6.76077 9.23401 6.83211 9.07026 6.97377 8.93376C7.11544 8.79709 7.27894 8.72876 7.46427 8.72876C7.64944 8.72876 7.81027 8.79709 7.94677 8.93376L11.9998 12.9865L16.0528 8.93376C16.1828 8.80359 16.342 8.73693 16.5305 8.73376C16.719 8.73043 16.8841 8.79709 17.0258 8.93376C17.1674 9.07026 17.2404 9.23243 17.2445 9.42026C17.2487 9.60809 17.1799 9.77284 17.0383 9.91451L12.6045 14.348C12.516 14.4365 12.4219 14.5013 12.3223 14.5423C12.2226 14.5833 12.1151 14.6038 11.9998 14.6038Z"
                          fill="#5F6368"
                        />
                      </svg>
                    </div>
                    </div>

                    <div
                      className={`sub-account ${
                        isSubAccountVisible ? "show" : ""
                      }`}
                    >
                      <div className="sub-account-item">
                        <a href="/applicant-change-password">
                          <span className="icon-change-passwords" /> Change
                          Password
                        </a>
                      </div>
                      <div className="sub-account-item">
                        <NotificationToggleWeb className="icon-change-passwords" />
                      </div>
                      <div className="sub-account-item">
                        <a onClick={() => setShowModal(true)}>
                          <span className="icon-log-out" /> Log Out{" "}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {
        <div className={`left-menu ${isOpen ? "open" : ""}`}>
          <div id="sidebar-menu">
            <ul className="downmenu list-unstyled" id="side-menu">
              <li id="tour-dashboard">
                <Link
                  onClick={hideMenu}
                  to="/applicanthome"
                  className={
                    location.pathname === "/applicanthome"
                      ? "tf-effect active"
                      : ""
                  }
                >
                  <span
                    className="dash-icon"
                    style={{
                      marginRight: "15px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={shape}
                      alt="Dashboard Icon"
                      width="24"
                      height="24"
                    />
                  </span>
                  <span className="dash-titles">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  onClick={hideMenu}
                  to="/applicant-view-profile"
                  className={
                    location.pathname === "/applicant-view-profile"
                      ? "tf-effect active"
                      : ""
                  }
                >
                  <span className="dash-icon">
                    <img
                      src={shape2}
                      alt="Dashboard Icon"
                      width="22"
                      height="22"
                    />
                  </span>
                  <span
                    className="dash-titles"
                    style={{ textTransform: "none" }}
                  >
                    Build portfolio
                  </span>
                </Link>
              </li>
              <li>
                <div>
                  <Link
                    onClick={hideMenu}
                    to="/applicant-interview-prep"
                    className={
                      pathname === "/applicant-interview-prep"
                        ? "tf-effect active"
                        : ""
                    }
                  >
                    <span className="dash-icon">
                      <img
                        src={botImage1}
                        alt="Ask Newton"
                        width="24"
                        height="24"
                      />
                    </span>
                    <span
                      className="dash-titles"
                      style={{ textTransform: "none" }}
                    >
                      Ask newton
                    </span>
                  </Link>
                </div>
              </li>
              <li>
                <Link
                  id="tour-skill-validation"
                  onClick={hideMenu}
                  to="/applicant-verified-badges"
                  className={
                    location.pathname === "/applicant-verified-badges"
                      ? "tf-effect active"
                      : ""
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  <span
                    className="dash-icon"
                    style={{
                      display: "inline-block",
                      transition: "fill 0.3s ease",
                      marginRight: "12px",
                    }}
                  >
                    <img
                      src={shape3}
                      alt="Dashboard Icon"
                      width="24"
                      height="24"
                    />
                  </span>
                  <span
                    className="dash-titles"
                    style={{
                      color: "#333",
                      fontSize: "16px",
                      textTransform: "none",
                    }}
                  >
                    Skill validation
                  </span>
                </Link>
                <Link
                  onClick={hideMenu}
                  to="/applicant-mentorconnect"
                  className={
                    location.pathname === "/applicant-mentorconnect"
                      ? "tf-effect active"
                      : ""
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                    marginTop: "13px",
                  }}
                >
                  <span
                    className="dash-icon"
                    style={{
                      display: "inline-block",
                      transition: "fill 0.3s ease",
                      marginRight: "12px",
                    }}
                  >
                    <img
                      src={shape4}
                      alt="Dashboard Icon"
                      width="24"
                      height="24"
                    />
                  </span>
                  <span
                    className="dash-titles"
                    style={{
                      color: "#333",
                      fontSize: "16px",
                      textTransform: "none",
                    }}
                  >
                    Mentor sphere
                  </span>
                </Link>

                <Link
                  onClick={hideMenu}
                  to="/applicant-verified-videos"
                  className={
                    location.pathname === "/applicant-verified-videos"
                      ? "tf-effect active"
                      : ""
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                    marginTop: "13px",
                  }}
                >
                  <span
                    className="dash-icon"
                    style={{
                      display: "inline-block",
                      transition: "fill 0.3s ease",
                      marginRight: "12px",
                    }}
                  >
                    <img
                      src={shape5}
                      alt="Dashboard Icon"
                      width="24"
                      height="24"
                    />
                  </span>

                  <span
                    className="dash-titles"
                    style={{
                      color: "#333",
                      fontSize: "16px",
                      textTransform: "none",
                    }}
                  >
                    Tech buzz shorts
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  onClick={hideMenu}
                  to="/applicant-hackathon"
                  className={
                    location.pathname === "/applicant-hackathon" ||
                    frompath === "/applicant-hackathon" ||
                    location.pathname.includes("/applicant-hackathon")
                      ? "tf-effect active"
                      : ""
                  }
                >
                  <span className="dash-icon">
                    <img
                      src={shape6}
                      alt="Dashboard Icon"
                      width="24"
                      height="24"
                    />
                  </span>
                  <span
                    className="dash-titles"
                    style={{ textTransform: "none" }}
                  >
                    Innovation arena
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  onClick={hideMenu}
                  to="/applicant-blog-list"
                  className={
                    location.pathname === "/applicant-blog-list"
                      ? "tf-effect active"
                      : ""
                  }
                >
                  <span className="dash-icon blog-icon">
                    <img
                      src={shape7}
                      alt="Dashboard Icon"
                      width="24"
                      height="24"
                    />
                  </span>

                  <span
                    className="dash-titles"
                    style={{ textTransform: "none" }}
                  >
                    Tech vibes
                  </span>
                </Link>
              </li>
            </ul>

            {/* Logout Button */}
            <div style={{ marginTop: "auto" }}>
              <div
                onClick={() => setShowModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  margin: "0 10px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.querySelector("img").style.filter = "none";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.querySelector("img").style.filter = "none";
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={shape8}
                    alt="Dashboard Icon"
                    width="24"
                    height="24"
                  />
                </div>
                <span className="dash-titles" style={{ color: "#1A1A17" }}>
                  Logout
                </span>
              </div>
            </div>
          </div>
        </div>
      }
      <ModalLogout
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
export default ApplicantNavBar;
