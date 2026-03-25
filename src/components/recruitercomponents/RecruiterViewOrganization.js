import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import './css/RecruiterViewOrganization.css'; // Assuming this file contains the CSS above

const RecruiterViewOrganization = () => {
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [formLoaded, setFormLoaded] = useState(false);
  const [organizationDetails, setOrganizationDetails] = useState(null);
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [token, setToken] = useState('');
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Check if recruiter is new or returning
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
  
        const response = await axios.get(`${apiUrl}/companyprofile/companyprofile/approval-status/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setApprovalStatus(response.data);
        setFormLoaded(true);
      } catch (error) {
        console.error('Approval Status Error:', error);
      }
    };
  
    if (!formLoaded) {
      fetchApprovalStatus();
    }
  }, [user.id, formLoaded]);
  

  // Redirect if profile is not approved
  useEffect(() => {
    if (approvalStatus && approvalStatus !== 'approved') {
      // alert("Sorry, you can't post the job until your profile is verified");
      navigate('/recruiter-my-organization');
    }
  }, [approvalStatus, navigate]);

  // Fetch Organization details if approved
  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
  
        const response = await axios.get(`${apiUrl}/companyprofile/recruiter/getCompanyProfile/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setOrganizationDetails(response.data);
      } catch (error) {
        console.error('Organization Details Error:', error);
      }
    };
  
    if (approvalStatus === 'approved') {
      fetchOrganizationDetails();
    }
  }, [approvalStatus, user.id]);
  

  useEffect(() => {
    // Define an async function to fetch the logo
    const savedImage = localStorage.getItem(`companyLogo_${user.id}`);
    if (savedImage) {
      setImageSrc(savedImage);
    }
  //   else{
  //   const fetchLogo = async () => {
  //     try {
  //       const token = localStorage.getItem('jwtToken');
        
  //       // Ensure token exists
  //       if (token) {
  //         const response = await fetch(`${apiUrl}/recruiters/companylogo/download/${user.id}`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         });
  
  //         // Check if the response is ok
  //         if (!response.ok) {
  //           throw new Error('Failed to fetch the logo');
  //         }
  
  //         const blob = await response.blob();
  //         const imageUrl = URL.createObjectURL(blob);
  //         setImageSrc(imageUrl);  // Update state with the image URL
  //       } else {
  //         // Handle the case where the token is missing
  //         console.error('No JWT token found');
  //         setImageSrc(null); // Set default or null image if no token is found
  //       }
  //     } catch (error) {
  //       console.error('Error fetching image URL:', error);
  //       setImageSrc(null); // Set default or null image on error
  //     }
  //   };
  //   // Always call the fetch function inside the useEffect
  //   fetchLogo();
  // }
  
    
  
  }, [user.id]); // No condition outside the hook; always executed


  // Preview Page with organization details
  if (organizationDetails) {
    const {
      companyName,
      website,
      headOffice,
      aboutCompany,
      socialProfiles: [youtube, twitter, instagram, linkedin ] = {},
    } = organizationDetails;
    localStorage.removeItem('tableFilterData');
    localStorage.removeItem('tableSelectedColumns');
    localStorage.removeItem('tableSelectedCheckBoxes');
    localStorage.removeItem('initialData');
    return (
        <div className="dashboard__content">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="title-dashboard">
                    <div className="title-dash flex2">My Organization</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
      
          <section className="flat-dashboard-post flat-dashboard-setting">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="profile-setting bg-white">
                    <div className="author-profile">
                      <div className="author-details">
                        <div className="img-box relative">
                          <img
                            width="70px"
                            height="70px"
                            src={imageSrc || '../images/user/avatar/profile-pic.png'}
                            alt="Profile"
                            onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
                            style={{ borderRadius: '100%', width: '70px', height: '70px',marginTop: '-12px',marginLeft:'15px'}}
                          />
                        </div>
                        <div className="author-info" style={{marginLeft:'10px'}}>
                          <h2>
                          <span style={{color:'var(--Gray-700, #495057)',fontFamily: "Plus Jakarta Sans",
fontSize: '24px',fontStyle: 'normal',fontWeight: 'bold'}}> {companyName}</span>
                          </h2>
                          {website && (
                            <a href={website.startsWith('http') ? website : `https://${website}`}  target="_blank">
                              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
<g clip-path="url(#clip0_3416_5222)">
<path d="M8.15641 14.6676C11.8383 14.6676 14.8231 11.6828 14.8231 8.0009C14.8231 4.319 11.8383 1.33423 8.15641 1.33423C4.47451 1.33423 1.48975 4.319 1.48975 8.0009C1.48975 11.6828 4.47451 14.6676 8.15641 14.6676Z" stroke="#495057" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.48975 8.00098H14.8231" stroke="#495057" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.15641 1.33423C9.82393 3.1598 10.7716 5.52892 10.8231 8.0009C10.7716 10.4729 9.82393 12.842 8.15641 14.6676C6.48889 12.842 5.54124 10.4729 5.48975 8.0009C5.54124 5.52892 6.48889 3.1598 8.15641 1.33423Z" stroke="#495057" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_3416_5222">
<rect width="16" height="16" fill="white" transform="translate(0.15625 0.000976562)"/>
</clipPath>
</defs>
</svg>&nbsp;&nbsp;<span style={{color:'var(--Gray-700, #495057)',fontFamily: "Plus Jakarta Sans",
fontSize: '16px',fontStyle: 'normal',fontWeight: '400',marginTop:'-5px'}}> {website}</span>
                            </a>
                          )}
                          {headOffice && (
                            <p>
                              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <g clip-path="url(#clip0_3416_5226)">
    <path d="M14.1563 6.83447C14.1563 11.5011 8.15625 15.5011 8.15625 15.5011C8.15625 15.5011 2.15625 11.5011 2.15625 6.83447C2.15625 5.24317 2.78839 3.71705 3.91361 2.59183C5.03883 1.46661 6.56495 0.834473 8.15625 0.834473C9.74755 0.834473 11.2737 1.46661 12.3989 2.59183C13.5241 3.71705 14.1563 5.24317 14.1563 6.83447Z" stroke="#495057" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8.15625 8.83447C9.26082 8.83447 10.1562 7.93904 10.1562 6.83447C10.1562 5.7299 9.26082 4.83447 8.15625 4.83447C7.05168 4.83447 6.15625 5.7299 6.15625 6.83447C6.15625 7.93904 7.05168 8.83447 8.15625 8.83447Z" stroke="#495057" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_3416_5226">
      <rect width="16" height="16" fill="white" transform="translate(0.15625 0.167725)"/>
    </clipPath>
  </defs>
</svg>&nbsp;&nbsp;<div style={{color:'var(--Gray-700, #495057)',fontFamily: "Plus Jakarta Sans",
fontSize: '16px',fontStyle: 'normal',fontWeight: '400',}}> {headOffice}</div>
                            </p>
                          )}
                        </div>
                      </div>
                      <Link to="/recruiter-edit-organization" className="edit-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M13.167 1.49993C13.3859 1.28106 13.6457 1.10744 13.9317 0.988988C14.2176 0.870536 14.5241 0.80957 14.8337 0.80957C15.1432 0.80957 15.4497 0.870536 15.7357 0.988988C16.0216 1.10744 16.2815 1.28106 16.5003 1.49993C16.7192 1.7188 16.8928 1.97863 17.0113 2.2646C17.1297 2.55057 17.1907 2.85706 17.1907 3.16659C17.1907 3.47612 17.1297 3.78262 17.0113 4.06859C16.8928 4.35455 16.7192 4.61439 16.5003 4.83326L5.25033 16.0833L0.666992 17.3333L1.91699 12.7499L13.167 1.49993Z" stroke="#495057" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                      </Link>

                    </div>
                    <h3>About</h3>
                    <div>
                    {aboutCompany && <p  sty={{width:"100px"}}>
                    <div style={{width:'700px',color:'var(--Gray-700, #495057)',fontFamily: "Plus Jakarta Sans",
fontSize: '16px',fontStyle: 'normal',fontWeight: '400'}}>
                        {aboutCompany}
                    </div>
                        </p>}
                    </div>
                  <br></br>
                  <div class="wd-social d-flex aln-center">
          <ul class="list-social d-flex aln-center">
          {youtube && (
            <li>
              <a href={youtube.startsWith('http') ? youtube : `https://${youtube}`}  target="_blank"><i class="icon-youtube"></i></a>
            </li>
            )}
            {twitter && (
            <li>
              <a href={twitter.startsWith('http') ? twitter : `https://${twitter}`}  target="_blank"><i class="icon-twitter"></i></a>
            </li>
            )}
            {instagram && (
            <li>
              <a href={instagram.startsWith('http') ? instagram : `https://${instagram}`} target="_blank"><i class="icon-instagram1"></i></a>
            </li>
            )}
            {linkedin && (
            <li>
              <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank"><i class="icon-linkedin2"></i></a>
            </li>
            )}
          </ul>
        </div>

                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      );
      
  }

  return null;
};

export default RecruiterViewOrganization;
