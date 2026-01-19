import React from 'react'
import { useState, useEffect } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import Snackbar from '../common/Snackbar';
import $ from 'jquery';
 
function RecruiterMyOrganization() {
   
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(false);
    const [photoFile,setPhotoFile]=useState(null);
    const [isProfileSubmitted, setIsProfileSubmitted] = useState(localStorage.getItem('isProfileSubmitted') === 'true');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
    const [socialProfiles, setSocialProfiles] = useState({
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    });
    const [imageSrc, setImageSrc] = useState('');
    const [token, setToken] = useState('');
    const [headOffice, setHeadOffice] = useState('');
    const [twitter, setTwitter] = useState('');
    const [instagram, setInstagram] = useState('');
    const [youtube, setYoutube] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [formErrors, setFormErrors] = useState({
      companyName: '',
      website: '',
      phoneNumber: '',
      email: '',
      headOffice: '',
      instagram: '',
      aboutCompany:'',
    });
    
    const [isOpen, setIsOpen] = useState(window.innerWidth >= 1302);
    const [aboutCompany, setAboutCompany] = useState('');
    const user1 = useUserContext();
    const user = user1.user;
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
      backgroundColor: isHovered ? '#ea670c' : '#F97316',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginLeft: '5px',
      marginTop: '5px',
      transition: 'background-color 0.3s ease', // Smooth transition for hover effect
    };

    useEffect(() => {
      const storedToken = localStorage.getItem('jwtToken');
      if (storedToken) {
        setToken(storedToken);
      }
    }, []);
 
 
    const handleCompanyNameChange = (e) => {
      setCompanyName(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        companyName: '', 
      }));
    };
    const handleWebsiteChange = (e) => {
      setWebsite(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        website: '', 
      }));
    };
    const handlePhoneNumberChange = (e) => {
      setPhoneNumber(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: '',
      }));
    };
    const handleHeadOfficeChange = (e) => {
      setHeadOffice(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        headOffice: '', 
      }));
    };
    const handleAboutCompanyChange = (e) => {
      setAboutCompany(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        headOffice: '', 
      }));
    };
    const handleTwitterChange = (e) => {
      setTwitter(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        twitter: '', 
      }));
    };
    const handleInstagramChange = (e) => {
      setInstagram(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        instagram: '', 
      }));
    };
    const handleYoutubeChange = (e) => {
      setYoutube(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        youtube: '', 
      }));
    };
    const handleLinkedinChange = (e) => {
      setLinkedin(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        linkedin: '', 
      }));
    };
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        email: '', 
      }));
    };
    const validateForm = () => {
      let isValid = true;
      const errors = {};
      if (!companyName?.trim()) {
        errors.companyName = 'Company name is required';
        isValid = false;
      } else if (companyName?.trim().length < 3) {
        errors.companyName = 'Company name must be at least 3 characters';
        isValid = false;
      }
      if (!website?.trim()) {
        errors.website = 'Website is required';
        isValid = false;
      } else {
        const websiteRegex = /\.(com|in|org)$/;
        if (!websiteRegex.test(website.trim())) {
          errors.website = 'Website should end with .com, .in, or .org';
          isValid = false;
        }
      }
      if (email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'Invalid email address';
        isValid = false;
      }
      if (phoneNumber?.trim() && !/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
        errors.phoneNumber = 'Invalid phone number';
        isValid = false;
      }
    //   if (!headOffice.trim()) {
    //     errors.headOffice = 'Head office address is required';
    //     isValid = false;
    //   }
    //   else if (headOffice.trim().length < 3) {
    //     errors.headOffice = 'Head office address must be at least 3 characters';
    //     isValid = false;
    // }
    if (!aboutCompany?.trim()) {
      errors.aboutCompany = 'About company is required';
      isValid = false;
    }


      if (instagram?.trim() && !/^[a-zA-Z0-9_]+$/.test(instagram.trim())) {
        errors.instagram = 'Invalid Instagram handle';
        isValid = false;
      }
      if (twitter?.trim() && !/^[a-zA-Z0-9_]+$/.test(twitter?.trim())) {
        errors.twitter = 'Invalid twitter handle';
        isValid = false;
      }
      if (youtube?.trim() && !/^[a-zA-Z0-9_]+$/.test(youtube?.trim())) {
        errors.youtube = 'Invalid youtube handle';
        isValid = false;
      }
      if (linkedin?.trim() && !/^[a-zA-Z0-9_]+$/.test(linkedin?.trim())) {
        errors.youtube = 'Invalid linkedin handle';
        isValid = false;
      }
      setFormErrors(errors);
      return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
         if (!validateForm()) {
          return;
        }
        try {
          const requestData = {
            companyName,
            website,
            phoneNumber,
            email,
            socialProfiles: [
                twitter,
                instagram,
                youtube,
                linkedin,
            ],
            headOffice,
            aboutCompany,
          };
          const response = await fetch(`${apiUrl}/companyprofile/recruiters/company-profiles/${user.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });
          if (response.status === 200) {
            const responseData = await response.text();
            console.log('Success:', responseData);
            if (responseData === 'CompanyProfile was already updated.') {
             
             setSnackbar({ open: true, message: 'Company profile was already updated.', type: 'error' });
              setCompanyName('');
              setWebsite('');
              setPhoneNumber('');
              setEmail('');
              setHeadOffice('');
              setTwitter('');
              setInstagram('');
              setYoutube('');
              setAboutCompany('');
              setLinkedin('');
              setFormErrors({
                companyName: '',
                website: '',
                phoneNumber: '',
                email: '',
                headOffice: '',
                instagram: '',
                aboutCompany:'',
              });
            } else {
              
              setSnackbar({ open: true, message: 'Profile saved successfully', type: 'success' });
              setIsProfileSubmitted(true);
              setVerificationStatus(false);
              localStorage.setItem('isProfileSubmitted', 'true'); 
              setCompanyName('');
        setWebsite('');
        setPhoneNumber('');
        setEmail('');
        setHeadOffice('');
        setTwitter('');
        setInstagram('');
        setYoutube('');
        setAboutCompany('');
        setLinkedin('');
        setFormErrors({
          companyName: '',
          website: '',
          phoneNumber: '',
          email: '',
          headOffice: '',
          instagram: '',
          linkedin:'',
          aboutCompany:'',
        });
            }
          } else {
            console.error('API request failed');
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      };
      const handleFileSelect = (e) => {
        const file = e.target.files[0];
       
        // Check if file type is JPG or PNG
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
          setPhotoFile(file); // If valid, update the state
        } else {
          alert('Please select a JPG or PNG file.');
          e.target.value = null; // Clear the input if file type is invalid
        }
      };
    const uploadPhoto = async () => {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const formData = new FormData();
        formData.append('logoFile', photoFile);
   
        const response = await axios.post(
          `${apiUrl}/recruiters/companylogo/upload/${user.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        console.log(response.data);
        
        setSnackbar({ open: true, message: response.data, type: 'success' });
        window.location.reload();
      } catch (error) {
        console.error('Error uploading photo:', error);
        
        setSnackbar({ open: true, message: 'Error in uploading profile.', type: 'error' });
      }
    };

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
      fetch(`${apiUrl}/recruiters/companylogo/download/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      })
        .then(response => response.blob())
        .then(blob => {
          const imageUrl = URL.createObjectURL(blob);
          setImageSrc(imageUrl);
        })
        .catch(error => {
          console.error('Error fetching image URL:', error);
          setImageSrc(null);
        });
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    }, [user.id]);

    const handleCloseSnackbar = () => {
      setSnackbar({ open: false, message: '', type: '' });
    };

  return (
    <div>
<div className="dashboard__content">
  <section className="page-title-dashboard">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="title-dashboard">
          {/* <BackButton /> */}
            <div className="title-dash flex2">My Organization</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="flat-dashboard-post flat-dashboard-setting">
    <form name="f1">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="profile-setting bg-white">
            <div className="author-profile flex2 border-bt">
              <div className="wrap-img flex2">
           <div class="img-box relative">
             <img
                width="100px"
                height="100px"
                src={imageSrc || '../images/user/avatar/profile-pic.png'}
                alt="Profile"
                onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
                style={{ borderRadius: '100%', position: 'relative',width:'100px',height:'100px' }}
              />
              </div>
  <div className="upload-profile">
            <div className="upload-section">
              <div className="upload-photo">
<h5 class="fw-6">Upload Company Logo: </h5>
    <h6>JPG or PNG</h6>
    <input
    
      id="tf-upload-img"
      type="file"
      name="logoFile"
      required=""
      onChange={handleFileSelect}
    />
    <br></br>
    <button
      type="button"
      onClick={uploadPhoto}
      className="btn-3"
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Upload Photo
    </button>
              </div>
            </div>
          </div>
              </div>
              <div className="wrap-img flex2">
              </div>
              {/* <div className="tt-button button-style">
                  <button type="submit" onClick={handleSubmit} className="button-status">Save Profile</button>
              </div> */}
            </div>
            <div className="form-infor-profile">
              <h3 className="title-info">Information</h3>
              <div className="row">
              <div className="col-lg-6 col-md-6" style={{height:formErrors.phoneNumber?"132px":""}}>
              <div className="dropdown titles-dropdown info-wd">
                    <label className="title-user fw-7">Company Full Name<span className="color-red">*</span></label>
                    <input
                  type="text"
                  id="companyName"
                  className="input-form"
                  placeholder="ABC Company Pvt. Ltd"
                  value={companyName}
                 onChange={handleCompanyNameChange}
                  required
                />
                {formErrors.companyName && (
                      <div className="error-message">{formErrors.companyName}</div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-md-6" style={{height:formErrors.companyName?"132px":""}}>
                <div className="dropdown titles-dropdown info-wd">
                    <label className="title-user fw-7">Alternate Phone Number</label>
                    <input
                             type="text"
                            id="phoneNumber"
                            className="input-form"
                           placeholder="Alternate Phone Number"
                          value={phoneNumber}
                      onChange={handlePhoneNumberChange}  
                />
                {formErrors.phoneNumber && (
                      <div className="error-message">{formErrors.phoneNumber}</div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-md-6" style={{height:formErrors.website?"132px":""}}>
                <div className="dropdown titles-dropdown info-wd">
                  <fieldset>
                    <label className="title-user fw-7">Alternate Email</label>
                    <input
                  type="text"
                  id="email"
                  className="input-form"
                  placeholder="support@abc.com"
                  value={email}
                  onChange={ handleEmailChange}
                />
                {formErrors.email && (
                      <div className="error-message">{formErrors.email}</div>
                    )}
                  </fieldset>
                  </div>
                  </div>
                  <div className="col-lg-6 col-md-6" style={{height:formErrors.email?"132px":""}}>
                  <div className="dropdown titles-dropdown info-wd">
                    <label className="title-user fw-7">Website<span className="color-red">*</span></label>
                    <input
                  type="text"
                  id="website"
                  className="input-form"
                  placeholder="www.abc.com"
                  value={website}
                  onChange={handleWebsiteChange}
                  required
                />
                 {formErrors.website && (
                      <div className="error-message">{formErrors.website}</div>
                    )}
                  </div>
                </div>               
            <div className="col-lg-6 col-md-6">
              <div className="text-editor-wrap border-bt">
                <label className="title-user fw-7">Head Office Address</label>
                <fieldset className="info-wd">
                <input
                  type="text"
                  id="address"
                  className="input-form"
                  placeholder="Head Office Address"
                  value={headOffice}
                  onChange={handleHeadOfficeChange}
                  required
                />
                 {formErrors.headOffice && (
                      <div className="error-message">{formErrors.headOffice}</div>
                    )}
                    </fieldset>
              </div>
             </div>
             <div className="about-company">
            <h3>About</h3>
            <br></br>
            <div className="row">
              <div className="col-md-12">
                <label style={{color: '#64666C'}} className="title-user fw-7">About Company<span className="color-red">*</span></label>
                <textarea
                  rows="4"
                  className='textarea'
                  value={aboutCompany}
                  onChange={handleAboutCompanyChange}
                  required
                  style={{borderRadius:'8px',border:'1px solid #E5E5E5',background:'#F5F5F5'}}
                />
                 {formErrors.aboutCompany && (
                      <div className="error-message">{formErrors.aboutCompany}</div>
                    )}
              </div>
            </div>
            <br></br>
          </div>
         
             <div className="row">
              <div className="social-wrap">
                <h3>Social Network</h3>
                <div className="form-box info-wd wg-box">
                  <div className="col-lg-6 col-md-6">
                    <fieldset className="flex2">
                    <span className="icon-youtube" />
                    <input
                    type="text"
                    id="youtube"
                    className="input-form2"
                    placeholder="YouTube"
                    value={youtube}
                    onChange={handleYoutubeChange}
                  />
                    </fieldset>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <fieldset className="flex2">
                      <span className="icon-twitter" />
                      <input
                    type="text"
                    id="twitter"
                    className="input-form2"
                    placeholder="Twitter"
                    value={twitter}
                    onChange={handleTwitterChange }
                  />
                  {formErrors.twitter && (
                      <div className="error-message">{formErrors.twitter}</div>
                    )}
                    </fieldset>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <fieldset className="flex2">
                      <span className="icon-instagram1" />
                      <input
                    type="text"
                    id="instagram"
                    className="input-form2"
                    placeholder="Instagram"
                    value={instagram}
                    onChange={handleInstagramChange}
                    required
                  />
                  {formErrors.instagram && (
                      <div className="error-message">{formErrors.instagram}</div>
                    )}
                    </fieldset>
                  </div>
                  <div className="col-lg-6 col-md-6">
                    <fieldset className="flex2">
                      <span className="fa-brands fa-linkedin" />
                      <input
                    type="text"
                    id="instagram"
                    className="input-form2"
                    placeholder="Linkedin"
                    value={linkedin}
                    onChange={handleLinkedinChange}
                    required
                  />
                  {formErrors.linkedin && (
                      <div className="error-message">{formErrors.linkedin}</div>
                    )}
                    </fieldset>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="save-profile" align="right">
            <button type="button" className="button-status" onClick={handleSubmit}>Save Profile</button>
    </div>
      </div>

    </div>
 
    </div>
   
    </div>
   
    </form>
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
  )
}
export default RecruiterMyOrganization;