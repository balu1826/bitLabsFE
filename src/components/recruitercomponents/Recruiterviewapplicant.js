import React, { useState, useEffect,useRef, useCallback } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useParams } from 'react-router-dom';
import BackButton from '../common/BackButton';
import Mail from '../../images/icons/mail1.png';
import Phone from '../../images/icons/phone1.png';
import Resume from '../../images/icons/resume.png';
import mortarboard1 from '../../images/icons/mortarboard1.png';
import verified123 from '../../images/verified123.svg';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Snackbar from '../common/Snackbar';
import SemiCircleProgressBar from "react-progressbar-semicircle";
import html2canvas from "html2canvas";
import { PDFDocument } from 'pdf-lib';
import pdfLogo from '../../images/user/avatar/PdfLogo.png'

 
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};
 
 
const Recruiterviewapplicant = () => {
  const [profileData, setProfileData] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const { user } = useUserContext();
  const { id } = useParams();
  const [resumeFileName, setResumeFileName] = useState('');
  const [jobs, setJobs] = useState([]);
  const [screeningQuestions, setScreeningQuestions] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState('All');
  const [showTooltip, setShowTooltip] = useState(false);
  const isMounted = useRef(true);
  const tableref=useRef(null);
  const filterRef = useRef([]);
  const pageRef = useRef();
  const [applicants, setApplicants] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [matchScore, setMatchScore] = useState(0);
const [applicants1, setApplicants1] = useState({
  matchedSkills: [],
  missingSkills: [],
  additionalSkills: [],
  VerifiedSkills: [],
  aptitudeScore: 0,
  technicalScore: 0,
});

const [paddingRight, setPaddingRight] = useState(window.innerWidth > 1440 ? '330px' : '0px');

useEffect(() => {
  const handleResize = () => {
    setPaddingRight(window.innerWidth > 1440 ? '380px' : '0px');
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const styles = {
    container: {
      display: 'flex',
      gap: '20px',
      padding: '0px 0px 25px 0px',
      borderRadius: '8px',
    },
    matchScoreContainer: {
      flex: 1,
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    sectionHeader: {
      marginBottom: '20px',
      textAlign: 'left',
      color: '#F97316',
      fontFamily: "Plus Jakarta Sans",
      fontSize: '20px',
     fontStyle: 'normal',
     fontWeight: '700',
     lineHeight: '28px', 
     textTransform: 'capitalize'
    },
    scoreCircle: {
      borderRadius: '50%',
      border: '8px solid #ffa726',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    scorePercentage: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ff6b00',
    },
    scoreLabel: {
      color: '#FF6A00',
      fontSize: '31.69px',
      fontStyle: 'normal',
       fontWeight: 'bold',
      lineHeight: '31.69px', /* 100% */
      textTransform: 'capitalize',
      marginTop:'-30px',
    },
    matchText:
    {
      color: '#000',
      fontFamily: "Plus Jakarta Sans",
      fontSize: '27px',
      fontStyle: 'normal',
      fontWeight: '600',
      lineHeight: '36.211px', /* 134.116% */
      textTransform: 'capitalize',
      marginTop: '10px',
    },
    scoreDetails: {
      marginTop: '20px',
    },
    scoreItem: {
      marginBottom: '10px',
      fontSize: '16px',
      color: '#333',
      borderRadius: '16px',
      border: '1px solid #D1D1D1',
      height: '59px',
      fontWeight: 'bold',
      display: 'flex',           
      alignItems: 'center',        
      justifyContent: 'center',    
      textAlign: 'center',         
    },
    percent: {
      color: '#000',
      fontSize: '24px',
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: '28px',
      textTransform: 'capitalize',
      marginTop: '0',             
    },
    
    skillAnalysisContainer: {
      flex: 2,
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    skillHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      color: '#ff6b00',
    },
    skillCategory: {
      marginBottom: '20px',
    },
    skillList: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      color: '#000',
      fontFamily: "Plus Jakarta Sans",
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '500',
      lineHeight: '26px', 
    },
    skillBadge: {
      borderRadius: '15px',
      fontSize: '14px',
      color: '#333',
      display: 'inline-flex',
      padding: 'var(--space-x-space-x-1, 4px) 10px',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      border: '1px solid var(--Gray-400, #CED4DA)',
      marginTop:'5px'
    },
    gaugeWrapper:
    {
      borderRadius: '16px',
      border: '1px solid #D1D1D1',
      padding: '20px',
      
    },
   
  };
 
  const query = useQuery();
  const jobid = query.get('jobid');
  const  applicantId= query.get('appid');
  const  applyid= query.get('applyid');
  const isPreScreened = query.get('preScreened') === 'true';



  const fetchResume = async () => {
    try {
      console.log('Making resume API call...');
      const token = localStorage.getItem('jwtToken');
      const resumeResponse = await axios.get(`${apiUrl}/applicant/getResumeId/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token
        },
      });
      console.log('Resume API call response:', resumeResponse);
 
      if (resumeResponse.data) {
        const firstName = profileData?.basicDetails?.firstName || '';
        const lastName = profileData?.basicDetails?.lastName || '';
        const fileName = `${firstName}_${lastName}.pdf`;
        setResumeFileName(fileName);
      } else {
        console.error('No resume fileName found:', resumeResponse.data);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };
 
    fetchResume();
 
 
  const fetchActiveJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`${apiUrl}/job/${jobid}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include JWT token
        },
      });
      const job = response.data;
 
      if (job && job.screeningQuestions) {
        setScreeningQuestions(job.screeningQuestions);
      } else {
        setScreeningQuestions([]);
      }
 
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job:', error);
      setLoading(false);
    }
  };
 
  useEffect(() => {
    if (jobid) {
      fetchActiveJob();
    }
  }, [jobid]);
 
  useEffect(() => {
    let isMounted = true;
 
    const fetchResume = async () => {
      try {
        console.log('Making resume API call...');
        const token = localStorage.getItem('jwtToken');

        const resumeResponse = await axios.get(`${apiUrl}/applicant/getResumeId/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
          },
        });
        console.log('Resume API call response:', resumeResponse);
 
        if (resumeResponse.data) {
          const firstName = profileData?.basicDetails?.firstName || '';
          const lastName = profileData?.basicDetails?.lastName || '';
          const fileName = `${firstName}_${lastName}.pdf`;
          setResumeFileName(fileName);
        } else {
          console.error('No resume fileName found:', resumeResponse.data);
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };
 
      fetchResume();
   
 
    return () => {
      isMounted = false;
    };
  }, [id, profileData]);
 
 
  const handleResumeClick1 = async () => {
    try {
      const response = await axios.get(`${apiUrl}/resume/pdf/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };
 
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };
 
  const checkAndShowAlert = (message) => {
    const alertShownBefore = localStorage.getItem('alertShown');
 
    if (!alertShownBefore && !loading) {
      const userResponse = window.confirm(message);
      if (userResponse) {
        localStorage.setItem('alertShown', 'true');
        setAlertShown(true);
      }
    }
  };
 
  useEffect(() => {
    let count = 0;
    let profileResponse = null;
    let isMounted = true;
 
    const token = localStorage.getItem('jwtToken');
    const fetchData = async () => {
      try {
        profileResponse = await axios.get(`${apiUrl}/applicantprofile/${id}/profile-view1`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT token
          },
        });
        // Sort skills once when setting the state
        const sortedSkills = profileResponse.data.skillsRequired.sort((a, b) => a.skillName.localeCompare(b.skillName));
        setProfileData({ ...profileResponse.data, skillsRequired: sortedSkills });
        count = 1;
 
        const imageResponse = await axios.get(`${apiUrl}/applicant-image/getphoto1/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
          responseType: 'arraybuffer', // Set responseType to arraybuffer
        });
        
        const base64Image = btoa(
          new Uint8Array(imageResponse.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        setImageSrc(`data:${imageResponse.headers['content-type']};base64,${base64Image}`);
 
        setLoading(false);
 
      } catch (error) {
        setLoading(false);
        if (count === 0 && isMounted) {
          window.alert('Profile not found. Please fill in your profile');
        }
      }
    };
 
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user, id]);

  const fetchApplicantDetails = async () => {
    try {
      const response = await axios.get(`${apiUrl}/applicantprofile/getalldetails/${id}/${jobid}`);
      const data = response.data;
  
      if (data) {

        const { matchPercentage, matchedSkills, skillsRequired, additionalSkills ,applicantSkillBadges,aptitudeScore, technicalScore } = data;
        const Key = `applicantData_${id}_${jobid}`
        localStorage.setItem(Key, JSON.stringify(data));
        // Update the state with dynamic values
        setMatchScore(matchPercentage || 0);
        setApplicants1((prev) => ({
          ...prev,
          matchedSkills: matchedSkills || [],
          missingSkills: skillsRequired || [],
          additionalSkills: additionalSkills || [],
          VerifiedSkills: applicantSkillBadges || [],
          aptitudeScore,
          technicalScore,
        }));
      } else {
        console.warn('No applicant details found.');
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    }
  };
  
  useEffect(() => {
    if (id && jobid) {
      const Key = `applicantData_${id}_${jobid}`;
      const applicantdata = localStorage.getItem(Key);
      
        if (applicantdata) {
        const storeddetails = JSON.parse(applicantdata);
        setMatchScore(storeddetails.matchPercentage || 0);
        setApplicants1((prev) => ({
          ...prev,
          matchedSkills: storeddetails.matchedSkills || [],
          missingSkills: storeddetails.skillsRequired || [],
          additionalSkills: storeddetails.additionalSkills || [],
          VerifiedSkills: storeddetails.applicantSkillBadges || [],
          aptitudeScore: storeddetails.aptitudeScore,
          technicalScore: storeddetails.technicalScore,
        }));
       
      } else {
        fetchApplicantDetails();
        
      }
    }
  }, [id, jobid]);

  const handleSelectChange1 = async (e) => {
    const newStatus = e.target.value;
    try {
      const applyJobId = applyid; 
      if (!applyJobId) {
        return;
      }
      const token = localStorage.getItem('jwtToken');
      const response = await axios.put(
        `${apiUrl}/applyjob/recruiters/applicant/${id}/applyjob-update-status/${applyJobId}/${newStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      const message1 = `Status changed to ${newStatus}`;
      setSnackbar({ open: true, message: message1, type: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update status', type: 'error' });
    }
  };
  
  
  const handleDownloadPDF = async () => {
    const resumeUrl = `${apiUrl}/resume/pdf/${id}`;
    const element = pageRef.current;
   
    const wrapper = document.createElement('div');
    wrapper.style.width = '1024px';
    wrapper.style.position = 'absolute'; // Ensure it doesn't affect layout
    wrapper.style.left = '-9999px'; // Place it off-screen
    wrapper.style.backgroundColor = '#fff';
    wrapper.style.margin = '0';  // Remove any margin
    wrapper.style.padding = '0'; // Remove any padding
    wrapper.style.top = '60px';  // Move the entire layout 50px from the top
   
    // Clone the original element
    const clonedElement = element.cloneNode(true);
    clonedElement.style.margin = '0';  // Ensure no margin on the cloned element
    clonedElement.style.padding = '0'; // Ensure no padding on the cloned element
   
    // Adjust font size for headers (example)
    const headElements = clonedElement.querySelectorAll('h4');
    headElements.forEach(head => {
      head.style.fontSize = '14px'; // Adjust the font size for headers
    });
   
    // Create the containerDiv with the logo and text
    const containerDiv = document.createElement('div');
    containerDiv.style.position = 'absolute'; // Absolute positioning within clonedElement
    containerDiv.style.top = '10px'; // Align to the top
    containerDiv.style.right = '0'; // Align to the right
    containerDiv.style.padding = '10px';
    containerDiv.style.width = '200px';  // Fixed width of 200px
    containerDiv.style.display = 'flex';
    containerDiv.style.flexDirection = 'column';
    containerDiv.style.alignItems = 'center';
   
    const textElement = document.createElement('p');
    textElement.innerText = 'Report generated by:';
    textElement.style.margin = '0';
    textElement.style.fontSize = '16px';
    textElement.style.color = 'gray';
   
    const imageLogo = new Image();
    imageLogo.src = pdfLogo;  // Ensure pdfLogo is defined
    imageLogo.style.width = '150px';
    imageLogo.style.height = '50px';
    imageLogo.style.marginTop = '5px';
   
    containerDiv.appendChild(textElement);
    containerDiv.appendChild(imageLogo);
   
    const borderElements = clonedElement.querySelectorAll('.PdfBorder');
    borderElements.forEach((el, index) => {
      el.style.border = '2px solid lightgray'; 
      el.style.paddingBottom = '50px';
      if (index === 1 || index === 2) { 
        el.style.boxShadow = 'none'; 
        
      }
    });
   
    const firstElement = clonedElement.firstChild;  
    if (firstElement) {
      firstElement.appendChild(containerDiv);  
    }
   
    wrapper.appendChild(clonedElement);
    document.body.appendChild(wrapper); 
   
    const canvas = await html2canvas(wrapper, {
      scale: 1, 
      useCORS: true,
      backgroundColor: '#fff', 
      x: 0, 
      y: 0  
    });
   
    document.body.removeChild(wrapper);
   
    const imgData = canvas.toDataURL("image/png");
   
    const resumeResponse = await fetch(resumeUrl);
    const resumeBlob = await resumeResponse.blob();
    const resumePdfBytes = await resumeBlob.arrayBuffer();
   
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
   
    const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
    const img = await pdfDoc.embedPng(imgBytes);
   
    const a4Width = 595.28;
    const a4Height = 841.89;
   
    let imgWidth = a4Width - 40;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
   
    if (imgHeight > a4Height - 40) {
      imgHeight = a4Height - 40;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
   
    const page = pdfDoc.addPage([a4Width, a4Height]);
   
    const yOffset = 50;
    page.drawImage(img, {
      x: (a4Width - imgWidth) / 2, 
      y: a4Height - imgHeight - yOffset, 
      width: imgWidth,
      height: imgHeight,
    });
   
    const resumePdf = await PDFDocument.load(await resumeBlob.arrayBuffer());
    const resumePage = await pdfDoc.copyPages(resumePdf, resumePdf.getPageIndices());
   
    resumePage.forEach((page) => {
      pdfDoc.addPage(page);
    });
   
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
   
    const link = document.createElement('a');
    link.href = url;
    const resume = resumeFileName.slice(0, -4);
    link.download = `${resume}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (loading) {
    return <div>Loading...</div>;
  }
 
  if (!profileData || alertShown) {
    return (
      <div>
        {!profileData && <p>Please fill in your bio data and upload a profile pic.</p>}
        {alertShown && <p>Alert already shown.</p>}
      </div>
    );
  }

 
  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
            <div className="title-dashboard">
            <div className="title-dash flex2" style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BackButton  id={id} jobid={jobid}/> Applicants
              </div>
              <span style={{paddingRight}}>
                <button className="export-buttonn" onClick={handleDownloadPDF}>
                  Download Profile
                </button>
                <select className="status-select" value={selectedStatus || ''} onChange={handleSelectChange1}>
                  <option value="" disabled hidden>
                    Change Status
                  </option>
                  <option value="Screening">Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </span>
            </div>
          </div>

            </div>
          </div>
        </div>
      </section>
 
     <div>
      <section className="candidates-section">
        <div className="tf-container">
          <div className="row">
            <div className="col-lg-9">
              <div ref={pageRef}>
            <section
      style={{
        marginBottom: '30px',
        borderRadius: '10px',
        padding: '30px',
        color: '#262626',
        backgroundColor: '#ffffff',
      }} className='PdfBorder'>
        <div className="tf-container">
          <div className="wd-author-page-title">
            <div className="author-archive-header">
            <div className='imgOne'
  style={{
    width: '80px',            
    height: '80px',            
    borderRadius: '50%',      
    overflow: 'hidden',        
    display: 'flex',          
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <img
    src={imageSrc || '../images/user/avatar/profile-pic.png'}
    alt="Profile"
    onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
    style={{
      width: '100%',          
      height: '100%',          
      objectFit: 'cover'        
    }}
  />
</div>
 
              <div className="content" style={{marginLeft:'20px'}}>
               
              <h3 style={{ color: '#262626' }} >
  <span className='textFont'>{profileData.basicDetails.firstName} {profileData.basicDetails.lastName}</span>
  {isPreScreened && (
        <div style={{ display: 'inline-block', position: 'relative' }}>
        <img 
          src={verified123} 
          className="external-link-image" 
          style={{
            marginLeft: '1px', 
            width: '20px', 
            height: '20.187px', 
            flexShrink: 0 
          }} 
          onMouseEnter={() => setShowTooltip(true)} 
          onMouseLeave={() => setShowTooltip(false)}
        />
        
        {/* Tooltip */}
        {showTooltip && (
          <div style={{
            position: 'absolute', 
            top: '25px', 
            left: '0', 
            width: '600px', // Set width
            height: '62.226px', // Set height
            borderRadius: '8px', // Rounded corners
            background: '#FFF', // Background color
            boxShadow: '0px 4px 15px 0px rgba(0, 0, 0, 0.15)', // Box shadow
            zIndex: 1,
            display: 'flex', // Use flexbox
            alignItems: 'center', // Center align items vertically
            padding: '10px', // Add padding for spacing
            boxSizing: 'border-box' // Include padding and border in the element's total width and height
          }}>
            <img 
              src={verified123} 
              alt="Pre-screened badge" 
              style={{
                width: '20px', 
                height: '20.187px', 
                marginRight: '20px',
                marginLeft: '5px'
              }}
            />
            <span style={{ whiteSpace: 'normal', color:'black',fontSize:'14px',fontWeight:'normal' }}>
              Pre-screened badges are issued to candidates who scored more than 70% in <br /> both Aptitude and Technical tests
            </span>
          </div>
        )}
      </div>
      )}
</h3>
               
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img src={Mail} alt="Email" className="icon1" style={{ marginRight: '10px' }} />
                  <span className='textFont'>{profileData.basicDetails.email}</span>
                </div>
 
                <div style={{ color: '#262626', display: 'flex', alignItems: 'center' }}>
                  <img src={Phone} alt="Phone" className="icon1" style={{ marginRight: '10px' }} />
                  <span className='textFont'>{profileData.basicDetails.alternatePhoneNumber}</span>
                </div>
                  
              </div>
              
            </div>
            
          </div>
          
        </div>
      </section>
      <div style={styles.container} >
      {/* Match Score Section */}
      <div className='PdfBorder' style={styles.matchScoreContainer}>
        <h3 style={styles.sectionHeader}>
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
  <g clip-path="url(#clip0_3422_4787)">
    <path d="M4.146 8.14671L8.14546 12.1462C9.05329 11.4199 10.1559 10.948 11.3703 10.8113V5.15088C8.60465 5.31293 6.09356 6.41421 4.146 8.14671Z" fill="#F97316"/>
    <path d="M3.15157 9.14111C1.27249 11.2534 0.0732422 14.0256 0.0732422 17.0685C0.0732422 17.4572 0.387727 17.7716 0.776367 17.7716H5.04199C5.43063 17.7716 5.74512 17.4572 5.74512 17.0685C5.74512 15.5773 6.28498 14.2233 7.15104 13.1406L3.15157 9.14111Z" fill="#F97316"/>
    <path d="M17.506 11.5706C17.2691 11.3639 16.9257 11.3371 16.6641 11.5067L10.5619 15.3993C9.74688 15.9197 9.26074 16.8062 9.26074 17.7716C9.26074 19.3228 10.5221 20.5841 12.0732 20.5841C13.1636 20.5841 14.1648 19.9455 14.6234 18.9575L17.6797 12.3959C17.8115 12.113 17.7408 11.7765 17.506 11.5706Z" fill="#F97316"/>
    <path d="M20.9951 9.14111L18.9285 11.2077C19.1888 11.7633 19.223 12.4136 18.9543 12.9898L18.0298 14.9748C18.2678 15.6286 18.4016 16.3314 18.4016 17.0685C18.4016 17.4572 18.7161 17.7716 19.1047 17.7716H23.3703C23.759 17.7716 24.0735 17.4572 24.0735 17.0685C24.0735 14.0256 22.8742 11.2534 20.9951 9.14111Z" fill="#F97316"/>
    <path d="M12.7764 5.15088V10.8113C13.3684 10.8779 13.9324 11.0269 14.4617 11.2435L15.9082 10.3207C16.4877 9.94511 17.1959 9.86454 17.9334 10.2139L20.0006 8.14671C18.0531 6.41421 15.542 5.31293 12.7764 5.15088Z" fill="#F97316"/>
  </g>
  <defs>
    <clipPath id="clip0_3422_4787">
      <rect width="24" height="24" fill="white" transform="translate(0.0732422 0.867676)"/>
    </clipPath>
  </defs>
</svg> &nbsp;
 Match Score</h3>
        <div style={styles.gaugeWrapper}>
       
        <SemiCircleProgressBar 
            percentage={matchScore} 
            showPercentValue={false}  
            stroke="#F46F16" 
            background="#FFDBBB" 
            diameter={170}
            style={styles.scoreCircle}
          />
        
          {/* <SemiCircleGauge percentage={matchScore} /> */}
          <div style={styles.scoreLabel}>{matchScore}<span fontSize='21px'>%</span></div>
          <div style={styles.matchText}>Fair Match</div>
        </div>
        <div style={styles.scoreDetails}>
          <div style={styles.scoreItem}>
            <span  style={styles.percent}>{applicants1.aptitudeScore}%</span>&nbsp;&nbsp;&nbsp; Aptitude Score
          </div>
          <div style={styles.scoreItem}>
            <span style={styles.percent}>{applicants1.technicalScore}%</span>&nbsp;&nbsp;&nbsp; Technical Score
          </div>
        </div>
        </div>

      {/* Skill Analysis Section */}
      <div style={styles.skillAnalysisContainer} className='PdfBorder'>
        <h3 style={styles.skillHeader}>
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
  <g clip-path="url(#clip0_3422_4804)">
    <path d="M15.5 20.3677H9.5C9.08548 20.3677 8.75 20.7032 8.75 21.1177V22.6177C8.75 23.8584 9.75927 24.8677 11 24.8677H14C15.2407 24.8677 16.25 23.8584 16.25 22.6177V21.1177C16.25 20.7032 15.9145 20.3677 15.5 20.3677Z" fill="#F97316"/>
    <path d="M12.5 12.4312C13.9158 12.4312 15.0635 11.2835 15.0635 9.8677C15.0635 8.45192 13.9158 7.3042 12.5 7.3042C11.0842 7.3042 9.93652 8.45192 9.93652 9.8677C9.93652 11.2835 11.0842 12.4312 12.5 12.4312Z" fill="#F97316"/>
    <path d="M21.4175 8.62268C20.885 4.62518 17.5775 1.39268 13.565 0.927676C10.9925 0.627676 8.42 1.44518 6.5075 3.14768C4.595 4.85768 3.5 7.30268 3.5 9.86768C3.5 13.2427 5.36 16.3027 8.3525 17.8552C8.5925 17.9827 8.75 18.2377 8.75 18.5152V19.0027C8.9825 18.9127 9.2375 18.8677 9.5 18.8677H15.5C15.7625 18.8677 16.0175 18.9127 16.25 19.0027V18.5152C16.25 18.2377 16.4 17.9827 16.6475 17.8552C20.06 16.0852 21.9275 12.4627 21.4175 8.62268ZM17 10.6177H16.4911C16.3855 11.1809 16.165 11.7036 15.8524 12.1595L16.2119 12.5191C16.5048 12.812 16.5048 13.2866 16.2119 13.5797C16.0654 13.7261 15.8735 13.7994 15.6817 13.7994C15.4898 13.7994 15.2979 13.7261 15.1514 13.5797L14.7918 13.2201C14.3359 13.5328 13.8132 13.7532 13.25 13.8589V14.3678C13.25 14.7823 12.9145 15.1178 12.5 15.1178C12.0855 15.1178 11.75 14.7823 11.75 14.3678V13.8589C11.1868 13.7532 10.6641 13.5328 10.2081 13.2201L9.8486 13.5797C9.70213 13.7261 9.5102 13.7994 9.31835 13.7994C9.1265 13.7994 8.93458 13.7261 8.7881 13.5797C8.49515 13.2867 8.49515 12.8121 8.7881 12.5191L9.14765 12.1595C8.83497 11.7036 8.61455 11.1809 8.50887 10.6177H8C7.58547 10.6177 7.25 10.2822 7.25 9.86768C7.25 9.45315 7.58547 9.11768 8 9.11768H8.50887C8.61455 8.5545 8.83497 8.03175 9.14765 7.57583L8.7881 7.21628C8.49515 6.92333 8.49515 6.44873 8.7881 6.1557C9.08105 5.86268 9.55565 5.86275 9.84867 6.1557L10.2082 6.51525C10.6641 6.20258 11.1869 5.98215 11.7501 5.87648V5.3676C11.7501 4.95308 12.0855 4.6176 12.5001 4.6176C12.9146 4.6176 13.2501 4.95308 13.2501 5.3676V5.87648C13.8132 5.98215 14.336 6.20258 14.7919 6.51525L15.1515 6.1557C15.4444 5.86275 15.919 5.86275 16.212 6.1557C16.5051 6.44865 16.505 6.92325 16.212 7.21628L15.8525 7.57583C16.1652 8.03175 16.3856 8.5545 16.4913 9.11768H17.0002C17.4147 9.11768 17.7502 9.45315 17.7502 9.86768C17.7502 10.2822 17.4145 10.6177 17 10.6177Z" fill="#F97316"/>
    <path d="M2 10.6177H1.25C0.835475 10.6177 0.5 10.2822 0.5 9.86768C0.5 9.45315 0.835475 9.11768 1.25 9.11768H2C2.41453 9.11768 2.75 9.45315 2.75 9.86768C2.75 10.2822 2.41453 10.6177 2 10.6177Z" fill="#F97316"/>
    <path d="M5.07562 3.19291C4.8837 3.19291 4.69185 3.11964 4.54537 2.97316L4.01512 2.44291C3.72217 2.14996 3.72217 1.67536 4.01512 1.38234C4.30807 1.08931 4.78267 1.08939 5.0757 1.38234L5.60595 1.91259C5.8989 2.20554 5.8989 2.68014 5.60595 2.97316C5.45947 3.11964 5.26747 3.19291 5.07562 3.19291Z" fill="#F97316"/>
    <path d="M4.54537 18.5723C4.35345 18.5723 4.1616 18.499 4.01512 18.3525C3.72217 18.0596 3.72217 17.585 4.01512 17.292L4.54537 16.7617C4.83832 16.4688 5.31292 16.4688 5.60595 16.7617C5.89897 17.0547 5.8989 17.5293 5.60595 17.8223L5.0757 18.3525C4.92922 18.499 4.73722 18.5723 4.54537 18.5723Z" fill="#F97316"/>
    <path d="M23.75 10.6177H23C22.5855 10.6177 22.25 10.2822 22.25 9.86768C22.25 9.45315 22.5855 9.11768 23 9.11768H23.75C24.1645 9.11768 24.5 9.45315 24.5 9.86768C24.5 10.2822 24.1645 10.6177 23.75 10.6177Z" fill="#F97316"/>
    <path d="M19.9248 3.19289C19.7328 3.19289 19.541 3.11961 19.3945 2.97314C19.1016 2.68019 19.1016 2.20559 19.3945 1.91256L19.9248 1.38231C20.2177 1.08936 20.6923 1.08936 20.9853 1.38231C21.2784 1.67526 21.2783 2.14986 20.9853 2.44289L20.4551 2.97314C20.3086 3.11961 20.1166 3.19289 19.9248 3.19289Z" fill="#F97316"/>
    <path d="M20.455 18.5723C20.2631 18.5723 20.0712 18.499 19.9248 18.3526L19.3945 17.8223C19.1016 17.5294 19.1016 17.0548 19.3945 16.7617C19.6875 16.4687 20.1621 16.4688 20.4551 16.7617L20.9853 17.292C21.2783 17.5849 21.2783 18.0595 20.9853 18.3526C20.8389 18.499 20.6469 18.5723 20.455 18.5723Z" fill="#F97316"/>
  </g>
  <defs>
    <clipPath id="clip0_3422_4804">
      <rect width="24" height="24" fill="white" transform="translate(0.5 0.867676)"/>
    </clipPath>
  </defs>
</svg> &nbsp;&nbsp;
          Skill Analysis
        </h3>
        <div style={styles.skillCategory}>
  <h4>Matching Skills</h4>
  <div style={styles.skillList}>
    {applicants1.matchedSkills.length > 0 ? (
      applicants1.matchedSkills.map((skill) => (
        <span key={skill.id} style={styles.skillBadge}>{skill.skillName}</span>
      ))
    ) : (
      <span style={styles.skillBadge}>--NA--</span>
    )}
  </div>
</div>

<div style={styles.skillCategory}>
  <h4>Missing Skills</h4>
  <div style={styles.skillList}>
    {applicants1.missingSkills.length > 0 ? (
      applicants1.missingSkills.map((skill) => (
        <span key={skill.id} style={styles.skillBadge}>{skill.skillName}</span>
      ))
    ) : (
      <span style={styles.skillBadge}>--NA--</span>
    )}
  </div>
</div>

<div style={styles.skillCategory}>
  <h4>Additional Skills</h4>
  <div style={styles.skillList}>
    {applicants1.additionalSkills.length > 0 ? (
      applicants1.additionalSkills.map((skill) => (
        <span key={skill.id} style={styles.skillBadge}>{skill.skillName}</span>
      ))
    ) : (
      <span style={styles.skillBadge}>--NA--</span>
    )}
  </div>
</div>

<div style={styles.skillCategory}>
  <h4>Tested Skills</h4>
  <div style={styles.skillList}>
    {applicants1.VerifiedSkills.length > 0 ? (
      applicants1.VerifiedSkills.map((skill) => (
        <span key={skill.id} style={styles.skillBadge}>{skill.skillBadge.name}</span>
      ))
    ) : (
      <span style={styles.skillBadge}>--NA--</span>
    )}
  </div>
</div>

      </div>
    </div>
 
              <article className="job-article tf-tab single-job stc2">
                <div className="content-tab">
                  <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '30px', marginBottom: '30px' }} className='PdfBorder'>
                    <div className="inner-content">
                      <div style={{ display: 'flex', alignItems: 'center',marginBottom:'10px' }}>
                        <span style={{marginLeft:'-10px',marginTop:'1px',width:'24px'}}>
                          <img src={mortarboard1} alt="mortarboard1" className="icon-prof" />
                        </span>
                        <span style={{
                          color: '#F97316',
                          marginLeft: '-1px',
                          fontSize: '16px',
                          fontWeight: '700',
                          lineHeight: '28px',
                          fontStyle: 'normal',
                          fontFamily: 'Plus Jakarta Sans'
                        }}>
                          Professional Details
                        </span>
                      </div>
 
                      <div className="group-infor">
                        <div className="inner">
                          <div className="row">
                            <div className="col">
                              <div className="subtitle-1 fw-7">
                                <span style={{marginLeft: '-40px',marginTop:'10px',color:'#A1A1A1',fontSize:'16px',fontWeight:'500',fontFamily:'Plus Jakarta Sans',fontStyle:'normal'}}>Qualification<br /></span>
                                <span style={{ fontWeight: 'bold', color: 'black', marginLeft: '-40px' }}>
                                  {profileData.qualification}
                                </span>
                              </div>
                            </div>
                            <div style={{marginTop:'20px'}}>
                              <div className="subtitle-2 fw-7">
                                <span style={{marginLeft: '-40px',marginTop:'20px',color:'#A1A1A1',fontSize:'16px',fontWeight:'500',fontFamily:'Plus Jakarta Sans',fontStyle:'normal'}}>Specialization<br /></span>
                                <span style={{ fontWeight: 'bold', color: 'black', marginLeft: '-40px'}}>
                                  {profileData.specialization}
                                </span>
                              </div>
                            </div>
                            <div style={{marginTop:'20px'}}>
                            <span style={{marginLeft: '-40px',marginTop:'10px',color:'#A1A1A1',fontSize:'16px',fontWeight:'500',fontFamily:'Plus Jakarta Sans',fontStyle:'normal',marginTop:'10px' }}>Experience(in Years)</span>
                            <div className="detail" style={{fontSize:'16px', marginLeft: '-40px', fontWeight: 'bold', color: 'black' }}>
                              {profileData.experience}
                            </div>
                            </div>
                           
                            <div style={{marginTop:'20px'}}>
                            <span style={{marginLeft: '-40px',marginTop:'10px',color:'#A1A1A1',fontSize:'16px',fontWeight:'500',fontFamily:'Plus Jakarta Sans',fontStyle:'normal',marginTop:'10px' }}>Preferred Location</span>
                            <div className="detail" style={{ fontSize:'16px',marginLeft: '-40px', fontWeight: 'bold', color: 'black' }}>
                              {profileData.preferredJobLocations && profileData.preferredJobLocations.map((location, index) => (
                                <span key={index}>
                                  {location}
                                  {index !== profileData.preferredJobLocations.length - 1 && ', '}
                                </span>
                              ))}
                              {(profileData.basicDetails && profileData.basicDetails.city) || ''}
                            </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
 
                <div>
                <div>
 
                <div className="author-archive-footer PdfBorder" style={{
                  backgroundColor: 'white',
                  marginTop: '10px',
                  borderRadius: '10px',
                  padding: '20px'
                }} >
                  <div style={{ display: 'flex', alignItems: 'center'}}>
                    <span style={{marginTop:'-35px' }}>
                      <img src={Resume} alt="Resume" className="icon-prof" style={{ marginRight: '10px' }} />
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                      <h5 style={{ color: '#F97316', fontSize: '16px', padding: '5px', fontWeight: 'bold',marginLeft:'-10px',marginBottom:'10px'}}>
                        Resume
                      </h5>
                      <div > <span 
      style={{ cursor: 'pointer' }}  
      className="file-name-input-resume1" 
      onClick={handleResumeClick1} // Open resume in a new tab
    >
      {/* <Link  
        to={`${apiUrl}/resume/pdf/${id}`} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: '#0000EE' }}
      > */}
        {resumeFileName}
      {/* </Link> */}
    </span></div>
                    </div>
                  </div>
                </div>
               
  {/* Check if there are screening questions */}
  {screeningQuestions && screeningQuestions.length > 0 && (
    <div
      className="author-archive-footer"
      style={{
        backgroundColor: 'white',
        marginTop: '30px',
        borderRadius: '10px',
        padding: '15px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <span style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="31"
            height="31"
            viewBox="0 0 21 21"
            fill="none"
            className="icon-prof"
            style={{ marginRight: '10px' }}
          >
            <g clipPath="url(#clip0_2074_2568)">
              <path
                d="M10.0731 18.9733C14.6755 18.9733 18.4064 15.2423 18.4064 10.64C18.4064 6.0376 14.6755 2.30664 10.0731 2.30664C5.47071 2.30664 1.73975 6.0376 1.73975 10.64C1.73975 15.2423 5.47071 18.9733 10.0731 18.9733Z"
                stroke="#F97316"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.64844 8.1411C7.84436 7.58416 8.23106 7.11452 8.74007 6.81538C9.24907 6.51623 9.84752 6.40688 10.4294 6.50669C11.0113 6.6065 11.5391 6.90904 11.9193 7.36071C12.2996 7.81238 12.5077 8.38403 12.5068 8.97443C12.5068 10.6411 10.0068 11.4744 10.0068 11.4744"
                stroke="#F97316"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.0732 14.8066H10.0816"
                stroke="#F97316"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_2074_2568">
                <rect
                  width="30"
                  height="30"
                  fill="white"
                  transform="translate(0.0732422 0.640625)"
                />
              </clipPath>
            </defs>
          </svg>
        </span>
        <div
          style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}
        >
          <h5
            style={{
              color: '#F97316',
              fontSize: '16px',
              padding: '5px',
              fontWeight: 'bold',
              marginLeft: '-10px',
              marginBottom: '10px'
            }}
          >
            Screening Questions
          </h5>
          {screeningQuestions.map(question => (
            <div key={question.id} className="subtitle-2 fw-7"
            style={{ marginBottom: '20px' }}>
              <span
                style={{
                  marginLeft: '0px',
                  marginTop: '20px',
                  color: 'black',
                  fontSize: '16px',
                  fontWeight: '800',
                  fontFamily: 'Plus Jakarta Sans',
                  fontStyle: 'normal'
                }}
              >
                {question.questionText}
                <br />
              </span>
              {question.answers.map((answer, index) => (
  answer.applicant.id == applicantId? (
    <span
      key={index}
      style={{
        fontWeight: 'bold',
        color: '#686666',
        fontSize: '15px',
        fontWeight: '400',
        
      }}
    >
      {answer.answerText}
      <br />
    </span>
  ) : null
))}
 
            </div>
          ))}
        </div>
      </div>
    </div>
  )}
</div>
    </div>             
              </article>
            </div>
            </div>
          </div>
        </div>
      </section>
      </div>
      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      )}
    </div>
  );
};
 
export default Recruiterviewapplicant;