import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate,useParams } from 'react-router-dom';
import 'react-international-phone/style.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './ApplicantBasicDetails.css';
import './ApplicantBasicDetails1.css';
import Logo from '../../images/ZumZum.png';
import 'react-bootstrap-typeahead/css/Typeahead.css'; 
import ModalComponent from './ModalComponent';
import ModalWrapper1 from './ModalWrapper1';
import ResumeBuilder from './ResumeBuilder';
import Snackbar from '../common/Snackbar';
import PropTypes from 'prop-types';

const Stepper = ({ currentStage, steps }) => {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div key={step} className="step-item">
          {index !== 0 && (
            <div
              className={`step-line ${currentStage > index ? 'completed' : ''
                }`}
            ></div>
          )}
          <div
            className={`step-circle ${currentStage === index + 1 ? 'active' : ''
              } ${currentStage > index + 1 ? 'completed' : ''}`}
          >
            {currentStage > index + 1 ? '✔' : index + 1}
          </div>
          <p className="step-label">{step}</p>
        </div>
      ))}
    </div>
  );
};

Stepper.propTypes = {
  currentStage: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const ApplicantBasicDetails = () => {
  const { user } = useUserContext();
  let { number } = useParams();
  number = parseInt(number, 10);
  const [isExperienceMenuOpen, setIsExperienceMenuOpen] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(number);
  const [snackbars, setSnackbars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [applicant, setApplicant] = useState({
    firstName: '',
    lastName: '',
    email: user.email || '',
    mobilenumber: user.mobilenumber || '',
    address: '',
  });
  const [remainingChars, setRemainingChars] = useState({
    firstName: { current: 0, min: 3 },
    lastName: { current: 0, min: 3 },
    address: { current: 0, min: 10 }
  });
  const closeModal = () => setIsModalOpen(false);
  const basicDetails = {
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    alternatePhoneNumber: applicant.mobilenumber,
    email: applicant.email,
    address: applicant.address
    };
  const [errors, setErrors] = useState({});
  const handleQualificationChange = (selected) => {
    setQualification(selected[0] || null);
    setSpecialization(null);
    if (errors.qualification) {
      setErrors((prevErrors) => ({ ...prevErrors, qualification: '' }));
    }
  };

  const handleSpecializationChange = (selected) => {
    setSpecialization(selected[0] || null);
    if (errors.specialization) {
      setErrors((prevErrors) => ({ ...prevErrors, specialization: '' }));
    }
  };

  const validateInput = (name, value) => {
    let error = '';
    const fieldMinLengths = {
      firstName: 3,
      lastName: 3,
      address: 10
    };
    
    const minLength = fieldMinLengths[name] || 0;
    const remaining = Math.max(0, minLength - value.length);
    
    if (fieldMinLengths.hasOwnProperty(name)) {
      setRemainingChars(prev => ({
        ...prev,
        [name]: { ...prev[name], current: value.length }
      }));
    }

    if (name === 'firstName' || name === 'lastName') {
      if (value.length < minLength) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name requires ${remaining} more ${remaining === 1 ? 'character' : 'characters'}.`;
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name should contain only letters and spaces.`;
      }
    } else if (name === 'mobilenumber') {
      if (!value) {
        error = 'Mobile number is required';
      } else if (!/^[6789]\d{9}$/.test(value)) {
        error = 'Should be 10 digits and start with 6, 7, 8, or 9.';
      }
    } else if (name === 'address') {
      if (value.length < minLength) {
        error = `Address requires ${remaining} more ${remaining === 1 ? 'character' : 'characters'} (minimum ${minLength}).`;
      } else if (/\s{2,}/.test(value)) {
        error = 'Multiple spaces are not allowed.';
      }
    }

    setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
    }));

    return !error; 
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'mobilenumber') {
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setApplicant(prev => ({
      ...prev,
      [name]: numericValue
    }));
    validateInput('mobilenumber', numericValue);
    return;
  }
  
  if ((name === 'firstName' || name === 'lastName') && /\d/.test(value)) {
    return; 
  }
  
  let newValue = value.replace(/\s{2,}/g, ' ');
  
  setApplicant(prev => ({
    ...prev,
    [name]: newValue
  }));
  
  const minLengthFields = ['firstName', 'lastName', 'address'];
  if (minLengthFields.includes(name)) {
    validateInput(name, newValue);
  }
};

const handleBlur = (e) => {
  const { name, value } = e.target;
  validateInput(name, value);
  
 
  
};

const handleSkillsChange = (selected) => {
  const selectedSkills = selected.map(skillName => ({ skillName }));
  setSkillsRequired(selectedSkills);
  if (errors.skillsRequired) {
    setErrors((prevErrors) => ({ ...prevErrors, skillsRequired: '' }));
  }
};

const handlePreferredJobLocationsChange = (selected) => {
  setPreferredJobLocations(selected);
  if (errors.preferredJobLocations) {
    setErrors((prevErrors) => ({ ...prevErrors, preferredJobLocations: '' }));
  }
};


  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [preferredJobLocations, setPreferredJobLocations] = useState([]);
  const [skillsRequired, setSkillsRequired] = useState([]);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [loginUrl, setLoginUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const steps = [
    'Basic Details',
    'Professional Details'
    // 'Resume Upload', // Commented out as per requirement
  ];
  const yearsOptions = Array.from({ length: 16 }, (_, i) => ({ label: `${i}` }));

  const qualificationsOptions = ['B.Tech', 'MCA', 'Degree', 'Intermediate', 'Diploma'];
  const skillsOptions = ['Java', 'C', 'C++', 'C Sharp', 'Python', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 'JSP', 'Servlets', 'Spring', 'Spring Boot', 'Hibernate', '.Net', 'Django', 'Flask', 'SQL', 'MySQL', 'SQL-Server', 'Mongo DB', 'Selenium', 'Regression Testing', 'Manual Testing'];
  const cities = ['Chennai', 'Thiruvananthapuram', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Kochi', 'Madurai', 'Mysore', 'Thanjavur', 'Pondicherry', 'Vijayawada', 'Pune', 'Gurgaon'];  
  
  useEffect(() => {
    const setFavicon = (url) => {
      let link = document.querySelector("link[rel*='icon']");
      link.type = 'image/png';
      link.href = url;
    };
    console.log("image inserted ")
    setFavicon('/images/favicon.png'); // Path to your favicon
  }, []);

const validateForm1 = () => {
  const newErrors = {};
  const validFirstName = validateInput('firstName', applicant.firstName);
  const validLastName = validateInput('lastName', applicant.lastName);
  const validMobileNumber = validateInput('mobilenumber', applicant.mobilenumber);
  const validAddress = validateInput('address', applicant.address);

  if (!applicant.firstName) {
    newErrors.firstName = "First name is required";
  } else if (!validFirstName) {
    newErrors.firstName = errors.firstName;
  }

  if (!applicant.lastName) {
    newErrors.lastName = "Last name is required";
  } else if (!validLastName) {
    newErrors.lastName = errors.lastName;
  }

  if (!applicant.mobilenumber) {
    newErrors.mobilenumber = "Mobile number is required";
} else if (!validateInput('mobilenumber', applicant.mobilenumber)) {
    newErrors.mobilenumber = errors.mobilenumber;
  }

  if (!applicant.address) {
    newErrors.address = "Address is required";
  } else if (!validAddress) {
    newErrors.address = errors.address;
  }

  setErrors(newErrors);
  return validFirstName && validLastName && validMobileNumber && validAddress &&
         applicant.firstName && applicant.lastName && applicant.mobilenumber && applicant.address;
}; 
  
  const makeApiCall2 = async () => {
   
 
    const applicantProfileDTO={
      basicDetails: basicDetails,
      skillsRequired: skillsRequired,
      experience,
      qualification,
      specialization,
      preferredJobLocations,
    }
 
    if (!validateForm1()) {
      console.log(" returned in validation");
      return false;
    }
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      console.log(" returned during api call"); 
      await axios.post(
      `${apiUrl}/applicantprofile/createprofile/${user.id}`,
      applicantProfileDTO,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
 
    console.log("Profile successfully created in the system.");
 
 
  const MAX_RETRIES = 50; // Maximum retry attempts
let retryCount = 0;
 
async function updateZohoCRM() {
  const zohoUpdateData = {
    data: [
      {
        Owner: { id: "4569859000019865042" },
        Last_Name: basicDetails.lastName,
        First_Name: basicDetails.firstName,
        Email: basicDetails.email,
        Phone: basicDetails.alternatePhoneNumber,
        Status_TS: "Completed Profile",
        Industry: "Software",
        Technical_Skills: applicantProfileDTO.skillsRequired
        .map(skill => skill.skillName.toLowerCase()),
        Specialization: applicantProfileDTO.specialization,
        Education_Qualifications: applicantProfileDTO.qualification,
        Degree_level: applicantProfileDTO.qualification,
        Total_work_experience_in_years: applicantProfileDTO.experience,
        Preferred_Job_Locations: applicantProfileDTO.preferredJobLocations.join(", "),
      },
    ],
  };
  const zohoUserId = sessionStorage.getItem('zohoUserId');
 
  while (retryCount < MAX_RETRIES) {
    try {
      const response = await axios.put(
        `${apiUrl}/zoho/update/${zohoUserId}`,
        zohoUpdateData
      );
 
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Lead successfully updated in Zoho CRM.");
        return response; // Exit function on success
      }
 
    } catch (error) {
      const status = error.response?.status;
 
      if (status === 401) {
        console.error("🔴 Unauthorized (401). Stopping retries.");
        break; // Stop retrying on 401
      }
 
      if (status === 403 || status === 500) {
        console.warn(`⚠️ Error ${status}. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait before retrying
      } else {
        console.error(`🚨 Unexpected Error: ${status}`, error);
        break; // Stop retrying on any other error
      }
    }
  }
 
  console.error("❌ Max retries reached. Could not update Zoho CRM.");
}
 
// Call the function
await updateZohoCRM();
 
 
     const transformedApplicantProfileDTO = {
  ...applicantProfileDTO,
  locations: applicantProfileDTO.preferredJobLocations.join(','),
  skills: applicantProfileDTO.skillsRequired.map(skill => skill.skillName).join(','),
};
 
delete transformedApplicantProfileDTO.preferredJobLocations;
delete transformedApplicantProfileDTO.skillsRequired   
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  };


  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileSizeLimit = 5 * 1024 * 1024; 
      const allowedTypes = ['application/pdf'];
  
      if (file.size > fileSizeLimit) {
        
        addSnackbar({ message: 'File size should be less than 5MB and Only PDF allowed.', type: 'error' });
        setErrorMessage('File size should be less than 5MB and Only PDF allowed.');
        setSelectedFile(null);
        setResumeUploaded(false);
        return;
      }
  
      if (!allowedTypes.includes(file.type)) {
        
        addSnackbar({ message: 'Only PDF file types are allowed.', type: 'error' });
        setErrorMessage('Only PDF file types are allowed.');
        setSelectedFile(null);
        setResumeUploaded(false);
        return;
      }
  
      setErrorMessage('');
      setResumeFile(file);
      setSelectedFile(file);
      setResumeUploaded(true);
    }
  };
  
  
  
  const triggerFileInputClick = () => {
    document.getElementById('tf-upload-img').click();
  };
  
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  
    const file = event.dataTransfer.files[0];
    if (file) {
      const fileSizeLimit = 1 * 1024 * 1024; 
      const allowedTypes = ['application/pdf'];
  
      if (file.size > fileSizeLimit) {
        addSnackbar({ message: 'File size should be less than 1MB and Only PDF allowed.', type: 'error' });
        setErrorMessage('File size should be less than 1MB and Only PDF allowed.');
        setSelectedFile(null);
        return;
      }
  
      if (!allowedTypes.includes(file.type)) {
        addSnackbar({ message: 'Only PDF file types are allowed.', type: 'error' });
        setErrorMessage('Only PDF file types are allowed.');
        setSelectedFile(null);
        return;
      }
  
      setErrorMessage('');
      setSelectedFile(file);
      setResumeFile(file);
      document.getElementById('tf-upload-img').files = event.dataTransfer.files;
    }
  };

  const validateFields = () => {
    const newErrors = {};
    
    if (!qualification) newErrors.qualification = 'Qualification is required';
    if (!specialization) newErrors.specialization = 'Specialization is required';
    if (skillsRequired.length === 0) newErrors.skillsRequired = 'Skills are required';
    if (!experience) newErrors.experience = 'Experience is required';
    if (preferredJobLocations.length === 0) newErrors.preferredJobLocations = 'Preferred Job Locations are required';
    
     if (isSubmitted) {
    setErrors(newErrors);
  }
  

    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = async () => {
  
    try {
     
      switch (currentStage) {
        case 1:
          if (!validateForm1()) {
            console.log(" returned in validation");
            return false;
          }
          
          console.log('API call 1 response:');
          break;
        default:
          console.warn('Unexpected stage:');
          
          break;
      }
  
      
      setCurrentStage((prev) => Math.min(prev + 1, 2)); // Changed from 3 to 2 since we only have 2 steps now
    } catch (error) {
      console.error('Error during API call:', error);
     
    }
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
     
  };

  const handleBack = () => {
    setCurrentStage((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    setIsSubmitted(true);  
    e.preventDefault();
    
    // Trim text fields before validation
    const trimmedApplicant = {
      ...applicant,
      firstName: applicant.firstName.trim(),
      lastName: applicant.lastName.trim(),
      address: applicant.address.trim()
    };
    
    // Update state with trimmed values
    setApplicant(trimmedApplicant);
    
    // Validate with trimmed values
    if (currentStage === 1 && !validateForm1()) {
      console.log("Validation failed for basic details");
      return;
    } else if (currentStage === 2 && !validateFields()) {
      console.log("Validation failed for professional details");
      return;
    }

    try {
      if (currentStage === 1) {
        setCurrentStage(2);
      } else if (currentStage === 2) {
        // Final submission
        addSnackbar({ message: 'Profile saved successfully!', type: 'success' });
        await makeApiCall2(); 
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/applicanthome');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      addSnackbar({ 
        message: error.response?.data?.message || 'Error saving profile. Please try again.', 
        type: 'error' 
      });
    }
  };

 const resetForm = () => {
    setApplicant({ name: '', email: '', mobilenumber: '' });
    setExperience('');
    setQualification('');
    setSpecialization('');
    setPreferredJobLocations([]);
    setSkillsRequired([]);
    setResumeFile(null);
    setLoginUrl('');
    setSelectedFile(null);
  };

  const specializationsByQualification = {
  'B.Tech': ['Computer Science and Engineering (CSE)',
                'Electronics and Communication Engineering (ECE)',
                'Electrical and Electronics Engineering (EEE)',
                'Mechanical Engineering (ME)',
                'Civil Engineering (CE)',
                'Aerospace Engineering',
                'Information Technology(IT)',
                 'Chemical Engineering',
                 'Biotechnology Engineering'],
    'MCA': ['Software Engineering', 'Data Science','Artificial Intelligence','Machine Learning','Information Security',
             'Cloud Computing','Mobile Application Development','Web Development','Database Management','Network Administration',
            'Cyber Security','IT Project Management'],
    'Degree': ['Bachelor of Science (B.Sc) Physics','Bachelor of Science (B.Sc) Mathematics','Bachelor of Science (B.Sc) Statistics',
               'Bachelor of Science (B.Sc) Computer Science','Bachelor of Science (B.Sc) Electronics','Bachelor of Science (B.Sc) Chemistry',
               'Bachelor of Commerce (B.Com)'],
    'Intermediate': ['MPC','BiPC','CEC','HEC'],
    'Diploma': ['Mechanical Engineering','Civil Engineering','Electrical Engineering','Electronics and Communication Engineering',
                'Computer Engineering','Automobile Engineering','Chemical Engineering','Information Technology','Instrumentation Engineering',
                 'Mining Engineering','Metallurgical Engineering','Agricultural Engineering','Textile Technology','Architecture',
                  'Interior Designing','Fashion Designing','Hotel Management and Catering Technology','Pharmacy','Medical Laboratory Technology',
                 'Radiology and Imaging Technology'],  
  };

   const handleLocationSelect = (option) => {
    const updated = [...preferredJobLocations, option];
    handlePreferredJobLocationsChange(updated);
    setIsLocationMenuOpen(false);
  };

  const handleExperienceSelect = (option) => {
    setExperience(option.label);
    setIsExperienceMenuOpen(false);
    setTimeout(() => {
      const inputEl = document.querySelector('#experience input');
      if (inputEl) inputEl.blur();
    }, 0);
  };


  const renderStageFields = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="input-container">
      <div className="input-wrapper">
        <input
          type="text"
          name="firstName"
          placeholder="*First Name"
          value={applicant.firstName}
          className="input-form"
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="text"
          name="lastName"
          placeholder="*Last Name"
          value={applicant.lastName}
          className="input-form"
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="email"
          placeholder="*Email"
          value={applicant.email}
          className="input-form"
          readOnly
          style={{ color: '#ccc' }} 
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="input-wrapper">
        <input
          type="tel"
          name="mobilenumber"
          placeholder="*WhatsApp Number"
          value={applicant.mobilenumber}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-form"
          required
        />
        {errors.mobilenumber && <div className="error-message">{errors.mobilenumber}</div>}
      </div>
      <div className="input-wrapper">
        <input
          type="tel"
          name="address"
          placeholder="*Address"
          value={applicant.address}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-form"
          required
        />
        {errors.address && <div className="error-message">{errors.address}</div>}
      </div>
    </div>
        );
      case 2:
        return (
          <div className="input-container">
           <div className="input-wrapper">
        <Typeahead
          id="qualification"
          options={qualificationsOptions}
          placeholder="*Qualification"
          onChange={handleQualificationChange}
          selected={qualification ? [qualification] : []}
          className="input-form typeahead"
          inputProps={{ readOnly: true }}  
        onInputChange={() => {}}        
        filterBy={() => true}  
        />
        {errors.qualification && <div className="error-message">{errors.qualification}</div>}
      </div>

      <div className="input-wrapper">
        <Typeahead
          id="specialization"
          options={qualification ? specializationsByQualification[qualification] : []}
          placeholder="*Specialization"
          onChange={handleSpecializationChange}
          selected={specialization ? [specialization] : []}
          className="input-form typeahead"
          inputProps={{ readOnly: true }}  
        onInputChange={() => {}}        
        filterBy={() => true}  
        />
        {errors.specialization && <div className="error-message">{errors.specialization}</div>}
      </div>
  
      <div className="input-wrapper">
        <Typeahead
          id="skillsRequired"
          multiple
          options={skillsOptions}
          placeholder="*Skills Required"
          onChange={handleSkillsChange}
          selected={skillsRequired.map(skill => skill.skillName)}
          className="input-form typeahead"
        />
        {errors.skillsRequired && <div className="error-message">{errors.skillsRequired}</div>}
      </div>


            <div className="input-wrapper">
      <Typeahead
        id="experience"
        options={yearsOptions}
        placeholder="*Experience in Years"
         open={isExperienceMenuOpen}
                onFocus={() => {
                  setIsExperienceMenuOpen(true);
                  setIsLocationMenuOpen?.(false);
                }}
                onBlur={() => {
                  setTimeout(() => setIsExperienceMenuOpen(false), 150); // allow selection to register
                }}
                onInputChange={() => { }}
                inputProps={{ readOnly: true, style: { cursor: 'pointer' } }}
                filterBy={() => true}
                highlightOnlyResult={false}
                renderMenuItemChildren={(option) => (
                  <div
                    style={{
                      padding: '8px 12px',
                      fontWeight: option.label === experience ? 'bold' : 'normal',
                      cursor: 'pointer',
                    }}
                  >
                    {option.label}
                  </div>
                )}
                renderMenu={(results, menuProps) => (
                  <ul
                    {...menuProps}
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      border: '1px solid #ccc',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      backgroundColor: 'white',
                      position: 'absolute',
                      zIndex: 1000,
                      width: '100%',
                    }}
                  >
                    {results.map((option, index) => (
                      <li
                        key={option.label}
                        onPointerDown={handleExperienceSelect.bind(null, option)}
                        style={{
                          padding: '3px 7px',
                          fontSize: '16px',
                          fontWeight: option.label === experience ? 'bold' : 'normal',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                )}
        className="input-form typeahead"
        single  
             
        selected={experience ? [experience] : []}
 
      />
      {!experience && errors.experience && (
        <div className="error-message">{errors.experience}</div>
      )}
    </div>
 
    <div className="input-wrapper">
        <Typeahead
          id="preferredJobLocations"
          multiple
          options={cities.filter(city => !preferredJobLocations.includes(city))}
          placeholder="*Preferred Job Locations"
           onChange={(selected) => {
                  handlePreferredJobLocationsChange(selected);
                  if (selected.length < preferredJobLocations.length) {
                    setTimeout(() => setIsLocationMenuOpen(true), 160); // Delay to override blur
                  } else {
                    setIsLocationMenuOpen(false);
                  }
                }}
                selected={preferredJobLocations}
                className="input-form typeahead"
                inputProps={{}}
                onInputChange={() => {
                  setIsLocationMenuOpen(true); // Keep dropdown open on typing
                }}
                filterBy={(option) => !preferredJobLocations.includes(option)}
                labelKey={(option) => option}
                open={isLocationMenuOpen}
                onFocus={() => {
                  setIsLocationMenuOpen(true);
                  setIsExperienceMenuOpen && setIsExperienceMenuOpen(false);
                }}
                onBlur={() => {
                  setTimeout(() => setIsLocationMenuOpen(false), 150); // Allow time for item click
                }}
                renderMenu={(results, menuProps) => (
                  <ul
                    {...menuProps}
                    style={{
                      maxHeight: '190px',
                      overflowY: 'auto',
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      border: '1px solid #ccc',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      backgroundColor: 'white',
                      position: 'absolute',
                      zIndex: 1000,
                      width: '100%',
                    }}
                  >
                    {results.length === 0 ? (
                      <li
                        style={{
                          padding: '6px 10px',
                          fontSize: '16px',
                          color: '#999',
                          textAlign: 'center',
                        }}
                      >
                        No matches found
                      </li>
                    ) : (
                      results.map((option, index) => (
                        <li
                          key={option}
                          onPointerDown={handleLocationSelect.bind(null, option)}
                          style={{
                            padding: '1px 10px',
                            fontSize: '16px',
                            fontWeight: preferredJobLocations.includes(option) ? 'bold' : 'normal',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {option}
                        </li>
                      ))
                    )}
                  </ul>
                )}
        />
        {errors.preferredJobLocations && <div className="error-message">{errors.preferredJobLocations}</div>}
      </div>
  
            <div className="input-wrapper" ></div>
          </div>
        );
      case 3:
        return (
          <div className="col-lg-12 col-md-12">
            <div className="post-new profile-setting bg-white" >
              <div className="wrap-img flex2" >
                <p><strong>Resume</strong></p>
                <div id="upload-profile" style={{ display: 'flex', alignItems: 'center' }}>
      <input
        className="up-file"
        id="tf-upload-img"
        type="file"
        name="profile"
        required
        onChange={handleResumeSelect}
        style={{ display: 'none' }}
      />
      <div
        id="resume-text-input-container"
        onClick={triggerFileInputClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '47px',
          borderRadius: '8px',
          border: dragActive ? '2px dashed #000' : '1px solid #E5E5E5',
          backgroundSize: '16px 16px',
          paddingLeft: '40px',
          padding: '10px',
          marginRight: '20px',
          boxSizing: 'border-box',
          cursor: 'pointer',
          position: 'relative',
          width: '60%',
          color: '#333',
          background: 'transparent',
          backgroundColor: '#F5F5F5',
        }}
      > 
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
      <path d="M13.75 2H6.75C6.21957 2 5.71086 2.21071 5.33579 2.58579C4.96071 2.96086 4.75 3.46957 4.75 4V20C4.75 20.5304 4.96071 21.0391 5.33579 21.4142C5.71086 21.7893 6.21957 22 6.75 22H18.75C19.2804 22 19.7891 21.7893 20.1642 21.4142C20.5393 21.0391 20.75 20.5304 20.75 20V9L13.75 2Z" stroke="#9E9E9E"  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.75 2V9H20.75" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
        <input
          id="resume-text-input"
          type="text"
          
          placeholder="Upload your resume"
          value={selectedFile ? selectedFile.name : ''}
          readOnly
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
 
      paddingLeft: '20px',
      paddingRight: '100px', // make room for button
      boxSizing: 'border-box',
      cursor: 'pointer',
      backgroundColor: '#F5F5F5',
      color: '#333',
      fontSize: '15px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
      <button
        type="button"

        onClick={(e) => {

          e.stopPropagation();
        
          triggerFileInputClick();
        
        }}
        
        style={{
        
          position: 'absolute',     
          top: '50%',   
          right: '10px',
          transform: 'translateY(-50%)',
          backgroundColor: '#7E7E7E',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          textTransform: 'none',
        }}
      >
        Browse
      </button>
      </div>

    </div>
 {errorMessage && (
    <div style={{ color: 'red', marginTop: '10px' }}>
      {errorMessage}
    </div>
  )}
              </div>
              <br></br>
              <br></br>
              <ModalWrapper1 isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper1>
              <ModalComponent
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          loginUrl={loginUrl}
        />
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <img className="top-left-svg" src={Logo} alt="Company Logo" />
    <div className="card-container ">
    <div className="card1">
      <div className="header">
        <p className="form-title">Complete Your Profile</p>
        <p>Fill the form fields to go to the next step</p>
      </div>
      <div className="stepper-container">
        <Stepper currentStage={currentStage} steps={steps} />
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmit} className="applicant-details-form">
          <div className="row">
            {renderStageFields()}
          </div>
          <div className="button-container">
            {(currentStage > 1 && currentStage < 3) && (
              <button type="button" onClick={handleBack} className="form-button1">Back</button>
            )}
            {currentStage < 2 ? (
              <button type="button" onClick={handleNext} className="form-button">Next</button>
            ) : (
              <button 
                type="submit" 
                className="form-button"
                onClick={(e) => handleSubmit(e)}
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
    </div>
    {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          index={snackbar.id}
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      ))}
    </div>
  );
};

export default ApplicantBasicDetails;
