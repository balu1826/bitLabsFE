import React, { useState,useEffect } from "react";
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import clearJWTToken from '../common/clearJWTToken';
import { Link, useLocation } from 'react-router-dom';
import $ from 'jquery';
import logos from '../../images/profileIcon.png';
import ModalLogout from '../common/ModalLogout';


function RecruiterNavBar({imageSrc,setImageSrc}) {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1302);
  const { user } = useUserContext();
  const [alertCount, setAlertCount] = useState(0);
  const location = useLocation();
  const [isSubAccountVisible, setIsSubAccountVisible] = useState(false);
  const [hamburgerClass, setHamburgerClass] = useState('fa fa-bars');
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSubAccount = () => {
    setIsSubAccountVisible(!isSubAccountVisible);
  };

 
  const handleOutsideClick = (event) => {
    const accountElement = document.querySelector(".account"); 
  
    if (accountElement && !accountElement.contains(event.target)) {
      
      setIsSubAccountVisible(false);
    }
  };


document.addEventListener("click", handleOutsideClick);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1302);
    };
     window.addEventListener('resize', handleResize);
    $("#left-menu-btn").on("click", function(e) {
      e.preventDefault();
      if ($("body").hasClass("sidebar-enable") == true) {
        $("body").removeClass("sidebar-enable");
        $.cookie("isButtonActive", "0");
      } else {
        $("body").addClass("sidebar-enable");
        $.cookie("isButtonActive", "1");
      }
      1400 <= $(window).width()
        ? $("body").toggleClass("show-job")
        : $("body").removeClass("show-job");
      var width = $(window).width();
      if (width < 1400) {
        $.cookie('isButtonActive', null);
      }
    });
    if ($.cookie("isButtonActive") == 1) {
      $("body").addClass("sidebar-enable show-job");
    }

    // Define an async function to fetch the logo
    const savedImage = localStorage.getItem(`companyLogo_${user.id}`);
    if (savedImage) {
      setImageSrc(savedImage);
    }else{
    fetch(`${apiUrl}/recruiters/companylogo/download/${user.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        setImageSrc(imageUrl);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          // Save the base64 encoded image in localStorage
          localStorage.setItem(`companyLogo_${user.id}`, base64data);
          // setImageSrc(base64data); // Optionally, set the image src directly after fetching
        };
        reader.readAsDataURL(blob);

      })
      .catch(error => {
        console.error('Error fetching image URL:', error);
        setImageSrc(null);
      });
    }
      return () => {
        window.removeEventListener('resize', handleResize);
      };
  }, [user.id]);

  const handleLogout =  () => {
    console.log('Logout button clicked');
    try {
       
       localStorage.removeItem('jwtToken');
       localStorage.removeItem('user');
       localStorage.removeItem('userType');
      window.location.href = "https://www.bitlabs.in/jobs";
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
 const handleToggleMenu = () => {
  console.log("function called..")
  setIsOpen(!isOpen);
};
useEffect(() => {
  fetchAlertCount(); 
}, []);

const fetchAlertCount = async () => {
  try {
    const response = await axios.get(`${apiUrl}/recuriters/appledjobs/${user.id}/unread-alert-count`);
    setAlertCount(response.data);
    
  } catch (error) {
    console.error('Error fetching alert count:', error);
  }
};
useEffect(() => {
  const fetchAlertCount = async () => {
    try {
      const response = await axios.get(`${apiUrl}/recuriters/appledjobs/${user.id}/unread-alert-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      setAlertCount(response.data);
    } catch (error) {
      console.error('Error fetching alert count:', error);
    }
  };
  fetchAlertCount();
}, [user.id]);

const handleBellClick = () => {
 
  setAlertCount(0);
};
const linkStyle = {
  backgroundColor: isHovered ? '#ea670c' : '#F97316',
  paddingRight: '0px',
  display: 'inline-block',
  borderRadius: '10px',
  textAlign: 'center',
  marginTop: '20px',
  width: '230px',
  transition: 'background-color 0.3s ease', 
};

const textStyle = {
  color: 'white',
  fontFamily: 'Plus Jakarta Sans',
  fontSize: '18px',
  fontWeight: '500',
  lineHeight: '25px',
  textAlign: 'center',
};

const iconStyle = {
  marginLeft: '10px',
  color: 'white',
  fontWeight: '50',
  fontSize: '15px',
};

const handleMenuItemClick = () => {
  if (window.innerWidth <= 1024) {
    setIsOpen(!isOpen);
  }
};

const savedImage = localStorage.getItem(`companyLogo_${user.id}`);
    if (savedImage) {
      setImageSrc(savedImage);
    }

  return (
<div>
  <div className="menu-mobile-popup">
    <div className="modal-menu__backdrop" />
    <div className="widget-filter">
      <div className="mobile-header">
      <div id="logo" className="logo">
                    <a href="/recruiterhome">
                      <img
                        className="site-logo"
                       
                        src={logos}
                        alt="Image"
                      />
                    </a>
                  </div>
      
        <a className="title-button-group">
          <i className="icon-close" />
        </a>
      </div>
      <div className="header-customize-item button">
        <a href="/recruiter-postjob">Post Job</a>
      </div>
    </div>
  </div>
  <header id="header" className="header header-default ">
    <div className="tf-container ct2">
      <div className="row">
        <div className="col-md-12">
          <div className="sticky-area-wrap">
            <div className="header-ct-left">
            {window.innerWidth < 1400 && (
              
              <span
  id="hamburger"
  className={hamburgerClass}
  onClick={handleToggleMenu}
  style={{ marginRight: '10px' }} // Adjust the value as needed
></span>
            )}
                  <div id="logo" className="logo">
                    <a href="/recruiterhome">
                      <img
                        className="site-logo"
                       
                        src={logos}
                        alt="Image"
                      />
                    </a>
                  </div>
            </div>
            <div className="header-ct-center"></div>
            <div className="header-ct-right">
          <Link to="/job-applicant-alerts"  className={location.pathname === "/job-applicant-alerts" ? "tf-effect active" : ""} onClick={fetchAlertCount}>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
          <span className={"icon-bell1 dash-icon1" + (alertCount > 0 ? " dash-titles" : "")} style={window.innerWidth > 1300 ? { marginRight: '20px' } : {}}
 onClick={handleBellClick}>
  {alertCount > 0 ? (
    <sup
      style={{
        background: 'red',
        borderRadius: '50%',
        padding: '2px 5px',
        color: 'white',
        fontSize: '10px',
        textAlign: 'center',
        lineHeight: '1',
        marginLeft: '-10px',
      }}
    >
      {alertCount}
    </sup>
  ) : null}
</span>
  </div>
       
      </Link>
      
              <div className="header-customize-item account" onClick={toggleSubAccount}>
                {/* <img width="40px" height="40px" borderRadius="50px" src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile" onError={() => setImageSrc('../images/user/avatar/image-01.jpg')} /> */}
             <img width="40px" height="40px" borderRadius="50px" src={imageSrc || '../images/user/avatar/image-01.jpg'} alt="Profile"  />

                <div className="name">
                  
                </div>
                <div className={`sub-account ${isSubAccountVisible ? 'show' : ''}`}>
                <h4>Welcome {user.username}</h4>
                  <div className="sub-account-item">
                    <a href="/recruiter-change-password">
                      <span className="icon-change-passwords" /> Change
                      Password
                    </a>
                  </div>
                  <div className="sub-account-item">
  <a
    onClick={() => {
      setShowModal(true);
    }}
  >
    <span className="icon-log-out" /> Log Out
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
  <ModalLogout
                                       isOpen={showModal}
                                       onClose={() => setShowModal(false)}
                                       onConfirm={handleLogout}
                                    />
  {(
  <div className={`left-menu ${isOpen ? 'open' : ''}`}>
      <div id="sidebar-menu">
        <ul className="downmenu list-unstyled" id="side-menu">
          <li>
            <Link to="/recruiterhome" className={location.pathname === "/recruiterhome" ? "tf-effect active" : ""} onClick={handleMenuItemClick}>
              <span className="icon-dashboard dash-icon"></span>
              <span className="dash-titles">Dashboard</span>
            </Link>
          </li>
         
          <li>
            <Link to="/recruiter-jobopenings" className={location.pathname === "/recruiter-jobopenings" ? "tf-effect active" : ""} onClick={handleMenuItemClick}>
              <span className="icon-submit dash-icon"></span>

              <span className="dash-titles">Posted Jobs</span>

            </Link>
          </li>
          <li>
            <Link to="/recruiter-allapplicants" className={location.pathname === "/recruiter-allapplicants" ? "tf-effect active" : ""} onClick={handleMenuItemClick}>
              <span className="icon-applicant dash-icon"></span>
              <span className="dash-titles">Applicants</span>
            </Link>
          </li>
      
          <li>
            <Link to="/recruiter-view-organization" className={location.pathname === "/recruiter-view-organization" ? "tf-effect active" : ""} onClick={handleMenuItemClick}>
              <span className="icon-mypackage dash-icon"></span>
              <span className="dash-titles">My Organization</span>
            </Link>
          </li>
          <li>
            <li>
            <Link to="/recruiter-hackathons" className={location.pathname === "/recruiter-hackathons" ? "tf-effect active" : ""} onClick={handleMenuItemClick}>
              <span className="icon-submit dash-icon"></span>
              <span className="dash-titles">Hackathons</span>
            </Link>
          </li>
          <Link
      to="/recruiter-postjob"
      className={location.pathname === "/recruiter-postjob" ? "tf-effect active" : ""}
      style={linkStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleMenuItemClick}
    >
      <span className=""></span>
      <span style={textStyle}>
        Post <span style={{ textTransform: 'lowercase' }}>a</span> Job
      </span>
      <span style={iconStyle}>➔</span>
    </Link>

          </li>
        </ul>
      </div>
    </div>
  )}
</div>
  )
}
export default RecruiterNavBar;
