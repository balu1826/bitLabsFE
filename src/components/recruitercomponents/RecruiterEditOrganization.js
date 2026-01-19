import React, { useState, useEffect,useRef } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import Snackbar from '../common/Snackbar';
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is installed and set up
import RecruiterNavBar from '../../components/recruitercomponents/RecruiterNavBar';

function RecruiterEditOrganization({setImgSrc}) {
  const userContext = useUserContext();
  const user = userContext.user;
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    companyName: '',
    website: '',
    phoneNumber: '',
    email: '',
    headOffice: '',
    aboutCompany: '',
    socialProfiles: {
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    },
    logo: null,
  });
  const [logo, setLogo] = useState(null);
  const [isLogoUploaded, setIsLogoUploaded] = useState(false); 
  const [headOffice, setHeadOffice] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState(''); 
  const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [aboutCompany, setAboutCompany] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [token, setToken] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  //const fileInputRef = useRef(null);
  const [isProfileSubmitted, setIsProfileSubmitted] = useState(
    localStorage.getItem('isProfileSubmitted') === 'true'
  );
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [formErrors, setFormErrors] = useState({
    companyName: '',
    website: '',
    phoneNumber: '',
    email: '',
    headOffice: '',
    aboutCompany: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  });
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle ={
    backgroundColor: isHovered ? '#ea670c' : '#F97316',
    color: 'white',
    padding: '7px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '0px',
    marginTop: '0px',
    transition: 'background-color 0.3s ease',
  };

  // Fetch JWT Token on Mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  useEffect(() =>{
    fetchCompanyProfile();
  },[]);

  

  // Fetch Company Profile and Logo when token or user.id changes
  useEffect(() => {
    if (token && user.id) {
      fetchCompanyProfile();
      fetchCompanyLogo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user.id]);

  // Fetch Company Profile
  const fetchCompanyProfile = async () => {
    const token=localStorage.getItem('jwtToken');
    try {
      const response = await axios.get(
        `${apiUrl}/companyprofile/recruiter/getCompanyProfile/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      const { socialProfiles } = data;

      setProfile({

        companyName: data.companyName || '',
        website: data.website || '',
        phoneNumber: data.phoneNumber || '',
        email: data.email || '',
        headOffice: data.headOffice || '',
        aboutCompany: data.aboutCompany || '',
        socialProfiles: {
            twitter: socialProfiles[0],
            instagram: socialProfiles[1],
            youtube: socialProfiles[2],
            linkedin: socialProfiles[3],
        },
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
      setSnackbar({ open: true, message: 'Failed to fetch company profile.', type: 'error' });
    }
  };


  // Fetch Company Logo
  const fetchCompanyLogo = async () => {

    // Define an async function to fetch the logo
    const savedImage = localStorage.getItem(`companyLogo_${user.id}`);
    if (savedImage) {
      setImageSrc(savedImage);
    }else{
    try {
      const response = await fetch(`${apiUrl}/recruiters/companylogo/download/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageSrc(imageUrl);
    } catch (error) {
      console.error('Error fetching image URL:', error);
      setImageSrc(''); // Optionally set to a default image
    }
  }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { id, value, files } = e.target;

    switch (id) {
      case 'companyName':
        setProfile({ ...profile, companyName: value });
        break;
      case 'phoneNumber':
        setProfile({ ...profile, phoneNumber: value });
        break;
      case 'email':
        setProfile({ ...profile, email: value });
        break;
      case 'website':
        const websiteRegex = /\.(com|in|org)$/;
        const isValidWebsite = websiteRegex.test(value);
  
        setProfile({ ...profile, website: value });
  
        if (!isValidWebsite) {
          setFormErrors({ ...formErrors, website: 'Website should end with .com, .in, or .org' });
        } else {
          setFormErrors({ ...formErrors, website: '' });
        }
        break;
      case 'headOffice':
        setProfile({ ...profile, headOffice: value });
        break;
      case 'aboutCompany':
        setProfile({ ...profile, aboutCompany: value });
        break;
        case 'logo':
          if (files.length > 0) {
            setLogo(files[0]); // Set the logo file
            setIsLogoUploaded(true); // Set to true when logo is uploaded
          }
          break;
      // Handle other input fields
      default:
        break;
      }
    if (['twitter', 'instagram', 'youtube', 'linkedin'].includes(id)) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        socialProfiles: {
          ...prevProfile.socialProfiles,
          [id]: value,
        },
      }));
    } else {
      setProfile((prevProfile) => ({
        ...prevProfile,
        [id]: value,
      }));
    }

    // Clear corresponding error
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [id]: '',
    }));
  };

  // Validate Form
  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!profile.companyName?.trim()) {
      errors.companyName = 'Company name is required';
      isValid = false;
    } else if (profile.companyName?.trim().length < 3) {
      errors.companyName = 'Company name must be at least 3 characters';
      isValid = false;
    }

    if (!profile.website?.trim()) {
      errors.website = 'Website is required';
      isValid = false;
    } else {
      const websiteRegex = /\.(com|in|org)$/;
      if (!websiteRegex.test(profile.website.trim())) {
        errors.website = 'Website should end with .com, .in, or .org';
        isValid = false;
      }
    }

    if (profile.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      errors.email = 'Invalid email address';
      isValid = false;
    }

    if (profile.phoneNumber?.trim() && !/^[6-9]\d{9}$/.test(profile.phoneNumber.trim())) {
      errors.phoneNumber = 'Invalid phone number';
      isValid = false;
    }


    if (!profile.aboutCompany.trim()) {
      errors.aboutCompany = 'About company is required';
      isValid = false;
    } else if (profile.aboutCompany.length < 50) {
      errors.aboutCompany = 'About company must be at least 50 characters long';
      isValid = false;
    } else if (profile.aboutCompany.length > 500) {
      errors.aboutCompany = 'About company cannot exceed 500 characters';
      isValid = false;
    }
    
// Define a URL validation regex
const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // Protocol (optional)
    '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})' + // Domain name
    '(\\/[-a-zA-Z\\d%_.~+]*)*' + // Path (optional)
    '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Query string (optional)
    '(\\#[-a-zA-Z\\d_]*)?$', // Fragment identifier (optional)
    'i' // Case-insensitive
  );
  
  // Validate social profiles as URLs
  Object.entries(profile.socialProfiles).forEach(([key, value]) => {
    if (value?.trim() && !urlPattern.test(value?.trim())) {
      errors[key] = `Invalid ${key.charAt(0).toUpperCase() + key.slice(1)} URL`;
      isValid = false;
    }
  });
  

    setFormErrors(errors);
    return isValid;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const requestData = {
        companyName: profile.companyName,
        website: profile.website,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        headOffice: profile.headOffice,
        aboutCompany: profile.aboutCompany,
        socialProfiles: [
          profile.socialProfiles.twitter,
          profile.socialProfiles.instagram,
          profile.socialProfiles.youtube,
          profile.socialProfiles.linkedin,
        ],
      };
  
      try {
        await axios.put(
          `${apiUrl}/companyprofile/companyprofile/update-companyprofile/${user.id}`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error updating profile:', error);
        setSnackbar({ open: true, message: 'Error updating profile', type: 'error' });
        return;
      }
      try {
        const handleFileSelect = (e) => {
          const file = e.target.files[0];
          // uploadPhoto(file);
          setPhotoFile(file);
        };
        if (photoFile) {
          const formData = new FormData();
          formData.append('logoFile', photoFile);
  
          await axios.post(
            `${apiUrl}/recruiters/companylogo/upload/${user.id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
           // Display the image temporarily in the UI
    const imageUrl = URL.createObjectURL(photoFile);
    setImageSrc(imageUrl);

    // Convert image to base64 for storage in localStorage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      
      localStorage.setItem(`companyLogo_${user.id}`, base64data);
    };
    reader.readAsDataURL(photoFile);
    
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        setSnackbar({ open: true, message: 'Error uploading photo.', type: 'error' });
        return;
      }
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        type: 'success',
      });
      setIsProfileSubmitted(true);
      localStorage.setItem('isProfileSubmitted', 'true');

      setTimeout(() => {
        navigate('/recruiter-view-organization');
      }, 2000); // 2-second delay
  
    } catch (error) {
      console.error('error:', error);
      setSnackbar({ open: true, message:'error for updating company profile details', type: 'error' });
    }
  };
  
  

 
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
  
    if (file) {
      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setFormErrors({ logo: "Please upload a valid image file (JPEG, PNG, GIF)." });
        return;
      }
  
      // Check file size (limit to 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setFormErrors({ logo: "File size should not exceed 2MB." });
        return;
      }
  
      // Set the selected file to state
      setPhotoFile(file); // Save the file to state
      setImageSrc(URL.createObjectURL(file)); // Optional: Display a preview
      setFormErrors({ logo: '' }); // Clear previous errors
  
      // // Call uploadPhoto with the selected file
      // await uploadPhoto(file); // Trigger the upload process
    } else {
      // Only set error if no logo is uploaded
      if (!isLogoUploaded) {
        setFormErrors({ logo: "Please upload a company logo." });
      }
    }
  };
  const handleFileSelect1 = (event) => {
    const file = event.target.files[0];
    if (file) {
        const validTypes = ['image/jpeg', 'image/png'];
        const maxSize = 1* 1024 * 1024; 

        if (!validTypes.includes(file.type)) {
            setSelectedFileName("");
            setErrorMessage("Please upload a JPG or PNG file");
            return;
        }

        if (file.size > maxSize) {
            setSelectedFileName("");
            setErrorMessage("Please upload your file, which is less than 1MB");
            return;
        }
        setSelectedFileName(file.name);
        setErrorMessage("");
        setPhotoFile(file);
    }
};

  const triggerFileInput = () => {
    document.getElementById('tf-upload-img').click();
  };
 
  // Upload Photo
  // const uploadPhoto = async () => {
  //   if (!photoFile) {
  //     setSnackbar({ open: true, message: 'Please select a file to upload.', type: 'error' });
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append('logoFile', photoFile);

  //     const response = await axios.post(
  //       `${apiUrl}/recruiters/companylogo/upload/${user.id}`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     const imageUrl = URL.createObjectURL(photoFile);
  //     setImgSrc(imageUrl)
  //     setSnackbar({ open: true, message: 'Photo uploaded successfully.', type: 'success' });
  //     fetchCompanyLogo(); // Refresh the logo
  //   } catch (error) {
  //     console.error('Error uploading photo:', error);
  //     setSnackbar({ open: true, message: 'Error uploading photo.', type: 'error' });
  //   }
  // };

  // // Handle Snackbar Close
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
                  <RecruiterNavBar imageSrc={imageSrc} setImageSrc={setImageSrc} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flat-dashboard-post flat-dashboard-setting">
          <form name="f1" onSubmit={handleSubmit}>
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="profile-setting bg-white">
                    <div className="author-profile flex2 border-bt">
                      <div className="wrap-img flex2">
                        <div className="img-box relative">
                          <img
                            width="100px"
                            height="100px"
                            src={imageSrc || '../images/user/avatar/profile-pic.png'}
                            alt="Profile"
                            onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
                            style={{
                              borderRadius: '100%',
                              position: 'relative',
                              width: '100px',
                              height: '100px',
                            }}
                          />
                        </div>
                        <div className="upload-photo">
      <h5 className="fw-6">Upload Company Logo:</h5>
      <h6>JPG or PNG</h6>
     
      {/* Hidden File Input */}
      <input
        id="tf-upload-img"
        type="file"
        name="logoFile"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileSelect1}
        style={{ display: 'none' }}
      />
     
      {/* Custom Input Box Display */}
      {/* <div
        onClick={triggerFileInput}
        style={{
          border: '1px solid #ccc',
          padding: '8px',
          cursor: 'pointer',
          color:  'black',
          textAlign:'center',
        }}
      >
        {selectedFileName || 'Select File'}
      </div> */}
         {selectedFileName && (
        <div style={{ marginBottom: '0px', color: 'black',  whiteSpace:'nowrap'}}>
          {selectedFileName}
        </div>
      )}
    
 
      {/* Upload Button */}
      <button
        type="button"
        onClick={triggerFileInput} // Click to trigger file input
        className="btn-3"
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Select File
      </button>
      {errorMessage && (
    <div style={{ color: 'red', marginTop: '10px' , whiteSpace:'nowrap',}}>
      {errorMessage}
    </div>
  )}
      </div>
      <div>
 
  </div>
    </div>
{/*     
                      </div>
                      {/* You can add more elements here if needed */}

                    </div> 
                    <div className="form-infor-profile">
                      <h3 className="title-info">Information</h3>
                      <div className="row">
                        {/* Company Full Name */}
                        <div className="col-lg-6 col-md-6" style={{height:formErrors.phoneNumber?"132px":""}}>
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">
                              Company Full Name<span className="color-red">*</span>
                            </label>
                            <input
                              type="text"
                              id="companyName"
                              className="input-form"
                              placeholder="ABC Company Pvt. Ltd"
                              value={profile.companyName}
                              onChange={handleInputChange}
                              
                            />
                            {formErrors.companyName && (
                              <div className="error-message">{formErrors.companyName}</div>
                            )}
                          </div>
                        </div>

                        {/* Alternate Phone Number */}
                        <div className="col-lg-6 col-md-6" style={{height:formErrors.companyName?"132px":""}}>
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">Alternate Phone Number</label>
                            <input
                              type="text"
                              id="phoneNumber"
                              className="input-form"
                              placeholder="Alternate Phone Number"
                              value={profile.phoneNumber}
                              onChange={handleInputChange}
                            />
                            {formErrors.phoneNumber && (
                              <div className="error-message">{formErrors.phoneNumber}</div>
                            )}
                          </div>
                        </div>

                        {/* Alternate Email */}
                        <div className="col-lg-6 col-md-6" style={{height:formErrors.website?"132px":""}}>
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">Alternate Email</label>
                            <input
                              type="email"
                              id="email"
                              className="input-form"
                              placeholder="support@abc.com"
                              value={profile.email}
                              onChange={handleInputChange}
                            />
                            {formErrors.email && (
                              <div className="error-message">{formErrors.email}</div>
                            )}
                          </div>
                        </div>

                        {/* Website */}
                        <div className="col-lg-6 col-md-6" style={{height:formErrors.email?"132px":""}}>
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">
                              Website<span className="color-red">*</span>
                            </label>
                            <input
                              type="text"
                              id="website"
                              className="input-form"
                              placeholder="www.abc.com"
                              value={profile.website}
                              onChange={handleInputChange}
                              
                            />
                            {formErrors.website && (
                              <div className="error-message">{formErrors.website}</div>
                            )}
                          </div>
                        </div>

                        {/* Head Office Address */}
                        <div className="col-lg-6 col-md-6">
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">Head Office Address</label>
                            <input
                              type="text"
                              id="headOffice"
                              className="input-form"
                              placeholder="Head Office Address"
                              value={profile.headOffice}
                              onChange={handleInputChange}
                           
                            />
                            {formErrors.headOffice && (
                              <div className="error-message">{formErrors.headOffice}</div>
                            )}
                          </div>
                        </div>

                        {/* About Company */}
                        <div className="col-lg-12 col-md-12">
                          <div className="about-company">
                            <h3>About</h3>
                            <br />
                            <div className="row">
                              <div className="col-md-12">
                                <label
                                  style={{ color: '#64666C' }}
                                  className="title-user fw-7"
                                >
                                  About Company<span className="color-red">*</span>
                                </label>
                                <textarea
                                  rows="4"
                                  id="aboutCompany"
                                  className="textarea"
                                  value={profile.aboutCompany}
                                  onChange={handleInputChange}
                                  
                                  style={{
                                    borderRadius: '8px',
                                    border: '1px solid #E5E5E5',
                                    background: '#F5F5F5',
                                    width: '100%',
                                    padding: '10px',
                                  }}
                                />
                                {formErrors.aboutCompany && (
                                  <div className="error-message">
                                    {formErrors.aboutCompany}
                                  </div>
                                )}
                              </div>
                            </div>
                            <br />
                          </div>
                        </div>

                        {/* Social Network */}
                        <div className="col-lg-12 col-md-12">
                          <div className="social-wrap">
                            <h3>Social Network</h3>
                            <div className="form-box info-wd wg-box">
                              {/* YouTube */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="icon-youtube" />
                                  <input
                                    type="text"
                                    id="youtube"
                                    className="input-form2"
                                    placeholder="YouTube"
                                    value={profile.socialProfiles.youtube}
                                    onChange={handleInputChange}
                                  />
                                  {formErrors.youtube && (
                                    <div className="error-message">{formErrors.youtube}</div>
                                  )}
                                </fieldset>
                              </div>

                              {/* Twitter */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="icon-twitter" />
                                  <input
                                    type="text"
                                    id="twitter"
                                    className="input-form2"
                                    placeholder="Twitter"
                                    value={profile.socialProfiles.twitter}
                                    onChange={handleInputChange}
                                  />
                                  {formErrors.twitter && (
                                    <div className="error-message">{formErrors.twitter}</div>
                                  )}
                                </fieldset>
                              </div>

                              {/* Instagram */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="icon-instagram1" />
                                  <input
                                    type="text"
                                    id="instagram"
                                    className="input-form2"
                                    placeholder="Instagram"
                                    value={profile.socialProfiles.instagram}
                                    onChange={handleInputChange}
                                  />
                                  {formErrors.instagram && (
                                    <div className="error-message">{formErrors.instagram}</div>
                                  )}
                                </fieldset>
                              </div>

                              {/* LinkedIn */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="fa-brands fa-linkedin" />
                                  <input
                                    type="text"
                                    id="linkedin"
                                    className="input-form2"
                                    placeholder="LinkedIn"
                                    value={profile.socialProfiles.linkedin}
                                    onChange={handleInputChange}
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

                    {/* Save Profile Button */}
                    <div className="col-lg-12 col-md-12">
                      <div className="save-profile" align="right">
                        <button type="submit" className="save-button-status">
                          Save Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                </div>
              </form>
            
          </section>
        </div>

        {/* Snackbar for Notifications */}
        {snackbar.open && (
          <Snackbar
            message={snackbar.message}
            type={snackbar.type}
            onClose={handleCloseSnackbar}
          />
        )}
      </div>
    
  );
}

export default RecruiterEditOrganization;
