import React from 'react';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useState, useEffect, useRef } from "react";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { useNavigate,useLocation } from 'react-router-dom';

import axios from 'axios';
import Snackbar from '../common/Snackbar';

function RecruiterPostJob() {
  
  const [jobURL, setjobURL] = useState(""); // Define the jobURL state
  const [jobTitle, setJobTitle] = useState("");
  const [formLoaded, setFormLoaded] = useState(false);
  const [minimumExperience, setMinimumExperience] = useState("");
  const [maximumExperience, setMaximumExperience] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [location, setLocation] = useState("");
  const [employeeType, setEmployeeType] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [minimumQualification, setMinimumQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const navigate = useNavigate();
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [description, setDescription] = useState("");
  const [uploadDocument, setUploadDocument] = useState(null);
  const [image, setImage] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [fileName, setFileName] = useState("No selected file")
  const location1 = useLocation();
  const [isActive, setIsActive] = useState(false);
  const fileInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const user1 = useUserContext();
  const user = user1.user;
  const locationState = useLocation().state;

  const handlePostJob = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const errors = {};
    let isValid = true;
  
    // Validation logic
    if (selectedOption === "externalWebsite") {
      if (!jobURL.trim()) {
        isValid = false;
        errors.url = "Please provide URL";
      } else {
        // Updated regex to allow special characters
        const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9 &\-]+(\.[a-zA-Z0-9 &\-]+)*)(\/[\w\-./?%&=+#]*)?$/i;
        if (!urlRegex.test(jobURL)) {
          isValid = false;
          errors.url = "Please enter a valid URL";
        }
      }
    }
     
  
    if (!minSalary.trim()) {
      errors.minSalary = 'Minimum salary is required.';
      isValid = false;
    }
  
    if (!maxSalary.trim()) {
      errors.maxSalary = 'Maximum salary is required.';
      isValid = false;
    } else if (parseInt(minSalary) > parseInt(maxSalary)) {
      errors.maxSalary = 'Maximum salary should be greater than or equal to minimum salary.';
      isValid = false;
    }
  
    if (!jobTitle.trim()) {
      isValid = false;
      errors.jobTitle = 'Job title is required.';
    }
  
    if (!description.trim() || description.trim().length < 15) {
      errors.description = 'Description is required and must be at least 15 characters long.';
      isValid = false;
    }
  
    if (!minimumExperience.trim()) {
      isValid = false;
      errors.minimumExperience = 'Minimum experience is required.';
    }
  
    if (!maximumExperience.trim()) {
      errors.maximumExperience = 'Maximum experience is required.';
      isValid = false;
    } else if (parseInt(minimumExperience) > parseInt(maximumExperience)) {
      errors.maximumExperience = 'Maximum experience should be greater than or equal to minimum experience.';
      isValid = false;
    }
  
    if (!minimumQualification.trim()) {
      errors.minimumQualification = 'Minimum qualification is required.';
      isValid = false;
    }
  
    if (skillsRequired.length === 0) {
      errors.skills = 'Skills are required.';
      isValid = false;
    }
  
    if (!location.trim()) {
      errors.location = 'Location is required.';
      isValid = false;
    } else if (!/^[a-zA-Z]+$/.test(location.trim())) {
      errors.location = 'Location should contain only alphabets.';
      isValid = false;
    }
  
    if (!employeeType.trim()) {
      errors.employeeType = 'Job type is required.';
      isValid = false;
    }
  
    // Update the form errors state
    setFormErrors(errors);
  
    // Stop execution if validation fails
    if (!isValid) {
      console.log("Form validation failed. API call will not be made.");
      return;
    }
  
    // Proceed with API call if the form is valid
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      if (!jwtToken) {
        setSnackbar({ open: true, message: 'Authentication token missing', type: 'error' });
        return;
      }
  
      const headers = {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      };
  
      const formData = {
        jobTitle,
        description,
        minSalary,
        maxSalary,
        location,
        employeeType,
        industryType,
        specialization,
        skillsRequired,
        minimumExperience,
        maximumExperience,
        minimumQualification,
        ...(jobURL && jobURL.trim() !== "" && { jobURL: jobURL.trim() }),
      };
  
      console.log('Payload being sent to API:', formData);
  
      // Call the Save Job API
      const jobResponse = await axios.post(
        `${apiUrl}/job/recruiters/saveJob/${user.id}`,
        formData,
        { headers }
      );
  
      console.log('Job posted successfully:', jobResponse.data);
      // Simulating a success flow
  setSnackbar({ open: true, message: 'Job posted successfully', type: 'success' });
        // Call clearForm immediately after setting the Snackbar
clearForm();


    } catch (error) {
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
        setSnackbar({
          open: true,
          message: 'No response from server. Please try again later.',
          type: 'error',
        });
      } else {
        console.error('Unexpected error:', error.message);
        setSnackbar({
          open: true,
          message: `Unexpected error: ${error.message}`,
          type: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar1 = () => {
    setSnackbar({ open: false, message: '', type: '' });
    setTimeout(() => {
      navigate('/recruiter-postjob');
    }, 2000);
  };

  const [selectedOption, setSelectedOption] = useState("bitlabsJobs");
  
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

 // URL validation regex
//const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*\/?$/;
const urlRegex = /^(https?:\/\/|www\.)[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;

const handleJobTitleChange1 = (event) => {
  const value = event.target.value;
  setjobURL(value);

  // Enhanced regex for URL validation
  //const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?(\?[\w\-=&%]*)?(#[\w\-]*)?$/i;
  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9 &\-]+(\.[a-zA-Z0-9 &\-]+)*)(\/[\w\-./?%&=+#]*)?$/i;

  // Dynamically validate the URL and set errors
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    url: value.trim() === "" || urlRegex.test(value)
      ? ""
      : "Please enter a valid URL...",
  }));
};



  useEffect(() => {
    // Load data from local storage or passed state
    const formData = locationState || JSON.parse(localStorage.getItem('jobDetails'));
    if (formData) {
      setJobTitle(formData.jobTitle);
      setMinimumExperience(formData.minimumExperience);
      setMaximumExperience(formData.maximumExperience);
      setMinSalary(formData.minSalary);
      setMaxSalary(formData.maxSalary);
      setLocation(formData.location);
      setEmployeeType(formData.employeeType);
      setIndustryType(formData.industryType);
      setMinimumQualification(formData.minimumQualification);
      setSpecialization(formData.specialization);
      setSkillsRequired(formData.skillsRequired);
      setDescription(formData.description);
      setUploadDocument(formData.uploadDocument);
      setFileName(formData.uploadDocument ? formData.uploadDocument.name : "No selected file");
    }
  }, [locationState]);

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const formData = {
      jobTitle,
      minimumExperience,
      maximumExperience,
      minSalary,
      maxSalary,
      location,
      employeeType,
      industryType,
      minimumQualification,
      specialization,
      skillsRequired: formattedSkillsRequired,
      description,
      uploadDocument,
      sourceType: selectedOption, // Include the selected option in the form data
      jobURL: selectedOption === "externalWebsite" ? jobURL : "https://www.bitlabs.in/jobs", // Default URL for non-externalWebsite
    };

    localStorage.setItem('jobDetails', JSON.stringify(formData));
    navigate('/recruiter-postjob2');
  };
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      try {
        const token = localStorage.getItem('jwtToken'); // Get the token from storage or wherever it's stored
        const response = await axios.get(
          `${apiUrl}/companyprofile/companyprofile/approval-status/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}` // Add the token to the headers
            }
          }
        );
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


  // useEffect(() => {
  //   if (approvalStatus && approvalStatus !== 'approved') {
  //     alert("Sorry, you can't post the job until your profile is verified");     
  //     window.location.href = '/recruiter-my-organization';
  //   }
  // }, [approvalStatus]);
  const [formErrors, setFormErrors] = useState({
    jobTitle: '',
    minSalary: '',
    maxSalary: '',
    minimumExperience: '',
    maximumExperience: '',
    location: '',
    minimumQualification: '',
    description: '',
    skills: '',
    skillsRequired: [],
    
    description: '',
    uploadDocument: '',
    specialization: '',
  });
  const clearForm = () => {
    setJobTitle('');
    setMinimumExperience('');
    setMaximumExperience('');
    setMinSalary('');
    setMaxSalary('');
    setLocation('');
    setEmployeeType('');
    setIndustryType('');
    setMinimumQualification('');
    setSpecialization('');
    setSkillsRequired([]);
    setDescription('');
    setUploadDocument(null);
    setFileName('No selected file');
    setImage(null);
    setjobURL('');

  };
  const validateForm = () => {
    let isValid = true;
    const errors = {};
    

    if (selectedOption === "externalWebsite") {
      if (!jobURL.trim()) {
        isValid = false;
        errors.url = "URL is required..";
      } else if (!urlRegex.test(jobURL)) {
        isValid = false;
        errors.url = "Please enter a valid URL";
      }
    }

    if (!jobTitle.trim()) {
      isValid = false;
      errors.jobTitle = 'Job title is required.';
    } else {
      errors.jobTitle = '';
    }
    if (!minimumExperience.trim()) {
      setMinimumExperience('');
      isValid = false;
      errors.minimumExperience = 'Minimum experience is required.';
    } else {
      errors.minimumExperience = '';
    }
    if (!maximumExperience.trim()) {
      errors.maximumExperience = 'Maximum experience is required.';
      isValid = false;
    } else if (parseInt(minimumExperience) > parseInt(maximumExperience)) {
      errors.maximumExperience = 'Maximum experience should be greater than or equal to minimum experience.';
      isValid = false;
    } else {
      errors.maximumExperience = '';
    }
    if (!minSalary.trim()) {
      errors.minSalary = 'Minimum salary is required.';
      isValid = false;
    }
    else {
      errors.minSalary = '';
    }
    if (!maxSalary.trim()) {
      errors.maxSalary = 'Maximum salary is required.';
      isValid = false;
    } else if (parseInt(minSalary) > parseInt(maxSalary)) {
      errors.maxSalary = 'Maximum salary should be greater than or equal to minimum salary.';
      isValid = false;
    } else {
      errors.maxSalary = '';
    }
    if (!location.trim()) {
      errors.location = 'Location is required.';
      isValid = false;
    } else if (!/^[a-zA-Z]+$/.test(location.trim())) {
      errors.location = 'Location should contain only alphabets.';
      isValid = false;
    } else {
      errors.location = '';
    }
    if (!employeeType.trim()) {
      errors.employeeType = 'Job type is required.';
      isValid = false;
    } else {
      errors.employeeType = '';
    }
    if (!minimumQualification.trim()) {
      errors.minimumQualification = 'Minimum qualification is required.';
      isValid = false;
    } else {
      errors.minimumQualification = '';
    }

    if (skillsRequired.length === 0) {
      errors.skills = 'Skills are required';
      isValid = false;
    } else {
      errors.skills = ""; 
    }


    if (industryType && industryType.trim().length < 2) {
      isValid = false;
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        industryType: 'Industry type must be at least 2 characters long.',
      }));
      return isValid;
    }
    if (specialization && specialization.trim().length < 3) {
      isValid = false;
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        specialization: 'Specialization must be at least 3 characters long.',
      }));
      return isValid;
    }
  
      if (!description.trim() || description.trim().length < 15) {
        errors.description = 'Description is required and must be at least 15 characters long.';
        isValid = false;
      } else {
        errors.description = '';
      }
      setFormErrors(errors);
      return isValid;
    };

  const handleJobTitleChange = (e) => {
    setJobTitle(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      jobTitle: '',
    }));
  };
  const handleMinimumExperienceChange = (e) => {
    const value = e.target.value;  
    
    if (/^\d*$/.test(value)) {
      setMinimumExperience(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minimumExperience: '',
      }));
    } else {
      setMinimumExperience('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minimumExperience: 'Minimum experience must be a valid number.',
      }));
    }
  };
  const handleMaximumExperienceChange = (e) => {
    const value = e.target.value;  
  
    if (/^\d*$/.test(value)) {
      setMaximumExperience(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maximumExperience: '',
      }));
    } else {
      setMaximumExperience('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maximumExperience: 'Maximum experience must be a valid number.',
      }));
    }
  };
  const handleMaxSalaryChange = (e) => {
    const value = e.target.value;
    
    if (/^\d*\.?\d*$/.test(value)) {
      setMaxSalary(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maxSalary: '',
      }));
    } else {
      setMaxSalary('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        maxSalary: 'Max salary must be a valid number.',
      }));
    }
  };
  
  const handleMinSalaryChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setMinSalary(value);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minSalary: '',
      }));
    } else {
      setMinSalary('');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minSalary: 'Min salary must be a valid number.',
      }));
    }
  };
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      location: '',
    }));
  };
  const handleEmployeeTypeChange = (e) => {
    setEmployeeType(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      employeeType: '',
    }));
  };
  const handleIndustryTypeChange = (e) => {
    setIndustryType(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      industryType: '',
    }));
  };
  const handleMinimumQualificationChange = (e) => {
    setMinimumQualification(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      minimumQualification: '',
    }));
  };
  const handleSpecializationChange = (e) => {
    setSpecialization(e.target.value);
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      specialization: '',
    }));
  };

  
  const handleDescriptionChange = (content) => {
    setDescription(content);
    setFormErrors((prevErrors) => ({
         ...prevErrors,
          description: '',
         }));
  };
  const getSpecializationOptions = (qualification) => {
    switch (qualification) {
      case 'B.Tech':
        return [
          'Computer Science and Engineering (CSE)',
          'Electronics and Communication Engineering (ECE)',
          'Electrical and Electronics Engineering (EEE)',
          'Mechanical Engineering (ME)',
          'Civil Engineering (CE)',
          'Aerospace Engineering',
          'Information Technology(IT)',
          'Chemical Engineering',
          'Biotechnology Engineering',
          
        ];
      case 'MCA':
        return [
          'Software Engineering',
          'Data Science',
          'Artificial Intelligence',
          'Machine Learning',
          'Information Security',
          'Cloud Computing',
          'Mobile Application Development',
          'Web Development',
          'Database Management',
          'Network Administration',
          'Cyber Security',
          'IT Project Management',
         
        ];
      case 'Degree':
        return [
          'Bachelor of Science (B.Sc) Physics',
          'Bachelor of Science (B.Sc) Mathematics',
          'Bachelor of Science (B.Sc) Statistics',
          'Bachelor of Science (B.Sc) Computer Science',
          'Bachelor of Science (B.Sc) Electronics',
          'Bachelor of Science (B.Sc) Chemistry',
          'Bachelor of Commerce (B.Com)',
          
        ];
      case 'Intermediate':
        return ['MPC', 'BiPC', 'CEC', 'HEC'];
      case 'Diploma':
        return [
          'Mechanical Engineering',
          'Civil Engineering',
          'Electrical Engineering',
          'Electronics and Communication Engineering',
          'Computer Engineering',
          'Automobile Engineering',
          'Chemical Engineering',
          'Information Technology',
          'Instrumentation Engineering',
          'Mining Engineering',
          'Metallurgical Engineering',
          'Agricultural Engineering',
          'Textile Technology',
          'Architecture',
          'Interior Designing',
          'Fashion Designing',
          'Hotel Management and Catering Technology',
          'Pharmacy',
          'Medical Laboratory Technology',
          'Radiology and Imaging Technology',
          
        ];
      
      default:
        return [];
    }
  };
  const skillsOptions = [
    'Java',
    'C',
    'C+',
    'C Sharp',
    'Python',
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'Angular',
    'React',
    'Vue',
    'JSP',
    'Servlets',
    'Spring',
    'Spring Boot',
    'Hibernate',
    '.Net',
    'Django',
    'Flask',
    'SQL',
    'MySQL',
    'SQL-Server',
    'Mongo DB',
    'Selenium',
    'Regression Testing',
    'Manual Testing'
  ];

  const skillsOptionsWithStructure = skillsOptions.map(skill => ({ skillName: skill }));



  const handleSkillsChange = (selected) => {
    const skillsWithNames = selected.map((skill) => ({ skillName: skill.skillName }));
    setSkillsRequired(skillsWithNames);

    if (skillsWithNames.length > 0) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        skills: '', 
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        skills: 'Please select at least one skill.',
      }));
    }
  };
  const formattedSkillsRequired = skillsRequired.map((skill) => ({
    skillName: skill.skillName.toLowerCase(),
  }));

  const filterOutSelectedSkills = (options, selectedSkills) => {
    const selectedSkillNames = selectedSkills.map((skill) => skill.skillName.toLowerCase());
    return options.filter((option) => !selectedSkillNames.includes(option.skillName.toLowerCase()));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFileName(file.name);
        setImage(URL.createObjectURL(file));
      } else {
        
        setSnackbar({ open: true, message: 'Please select a valid PDF or DOC file.', type: 'error' });
        e.target.value = null;
      }
    }
  };
  const handleBrowseClick = () => {
    if (fileInputRef.current) {

      fileInputRef.current.click();

    }

  };

   const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
    // Navigate after 2 seconds
  setTimeout(() => {
    console.log("Navigating to recruiter-postjob");
    navigate('/recruiter-postjob');
  }, 2000);
  };
  
  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);

  };
  localStorage.removeItem('tableFilterData');
  localStorage.removeItem('tableSelectedColumns');
  localStorage.removeItem('tableSelectedCheckBoxes');
  localStorage.removeItem('initialData');
  return (
    <div>
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12 ">
                <div className="title-dashboard">
                {/* <BackButton /> */}
                  <div className="title-dash flex2">Post a Job</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flat-dashboard-post flat-dashboard-setting">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="themes-container">
              <div className="row">
              <div className="col-lg-12 col-md-12 input-height">
                  <div className="post-new profile-setting bg-white">
                    <div className="wrap-titles">
                      <label className="title-user fw-7">Job Title<span className="color-red">*</span></label>
                      <fieldset className="info-wd">
                        <input
                          type="text"
                          placeholder="Job Role | Job Designation"
                          className="input-form"
                          value={jobTitle}
                          onChange={handleJobTitleChange}
                          required />
                        {formErrors.jobTitle && (
                          <div className="error-message">{formErrors.jobTitle}</div>
                        )}
                      </fieldset>
                    </div>
                   <div className="text-editor-wrap">
                          <label className="title-user fw-7">Job Description<span className="color-red">*</span></label>
                         <div className="text-editor-main">
                         <div className={`editor-wrapper ${isActive ? 'active' : ''}`}>
                         <>
  <style>
    {`
      .ql-editor h2 {
        font-weight: normal !important;
      }

      .ql-editor h3 {
        font-weight: normal !important;
      }
    `}
  </style>
  <ReactQuill 
    theme="snow" 
    value={description} 
    onChange={handleDescriptionChange}
    onFocus={handleFocus}
    onBlur={handleBlur}
    required
  />
</>
                       </div>
                   {formErrors.description && (
                  <   div className="error-message">{formErrors.description}</div>
                    )}
                  </div>
                 </div>
                    <div className="row">
                    <div className={`col-lg-6 col-md-6 input-height ${formErrors.maximumExperience&& "conditional-height"}`} style={{height:formErrors.maximumExperience?"132px":""}}>
                        <div id="item_category" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Minimum Experience (in Years)<span className="color-red">*</span></label>
                          <input type="text"
                            placeholder="4"
                            className="input-form"
                            value={minimumExperience}
                            onChange={handleMinimumExperienceChange}
                            required
                          />
                          {formErrors.minimumExperience && (
                            <div className="error-message">{formErrors.minimumExperience}</div>
                          )}
                        </div>
                      </div>
                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.minimumExperience && "conditional-height"}`} style={{height:formErrors.minimumExperience?"132px":""}} >
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Maximum Experience (in Years)<span className="color-red">*</span></label>
                          <input type="text"
                            placeholder="6"
                            className="input-form"
                            value={maximumExperience}
                            onChange={handleMaximumExperienceChange}

                            required
                          />
                          {formErrors.maximumExperience && (
                            <div className="error-message">{formErrors.maximumExperience}</div>
                          )}
                        </div>
                      </div>

                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.minSalary && "conditional-height"}`} style={{height:formErrors.minSalary?"132px":""}}>
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Minimum Salary (in LPA)<span className="color-red">*</span></label>
                          <input type="text"
                            placeholder="2.4"
                            className="input-form"
                            value={minSalary}
                            onChange={handleMinSalaryChange}
                            required
                          />
                          {formErrors.minSalary && (
                            <div className="error-message">{formErrors.minSalary}</div>
                          )}
                        </div>
                      </div>
                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.minSalary && "conditional-height"}`} style={{height:formErrors.minSalary?"132px":""}}>
                        <div id="item_2" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Maximum Salary (in LPA)<span className="color-red">*</span></label>
                          <input
                            type="text"
                            placeholder="6.5"
                            className="input-form"
                            value={maxSalary}
                            onChange={handleMaxSalaryChange}
                            required
                          />
                          {formErrors.maxSalary && (
                            <div className="error-message">{formErrors.maxSalary}</div>
                          )}
                        </div>
                      </div>
                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.specialization && "conditional-height"}`} style={{height:formErrors.specialization?"132px":""}}>
                        <div id="item_3" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Minimum Qualification<span className="color-red">*</span></label>
                          <select
                            value={minimumQualification}
                            placeholder='Select Qualification'
                            className="input-form"
                            style={{ color: minimumQualification ? 'black' : 'lightgrey' }}
                            onChange={handleMinimumQualificationChange}
                            required
                          >
                            <option value="" >Select Qualification</option>
                            <option value="B.Tech">B.Tech</option>
                            <option value="MCA">MCA</option>
                            <option value="Degree">Degree</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Diploma">Diploma</option>
                          
                          </select>
                          {formErrors.minimumQualification && (
                            <div className="error-message">{formErrors.minimumQualification}</div>
                          )}
                        </div>
                      </div>
                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.minimumQualification && "conditional-height"}`} style={{height:formErrors.minimumQualification?"132px":""}}>
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Specialization</label>
                          <select
                            value={specialization}
                            className="input-form"
                            style={{ color: specialization ? 'black' : 'lightgrey' }}
                            onChange={handleSpecializationChange}
                          >
                            <option value="">Select Specialization</option>
                            {getSpecializationOptions(minimumQualification).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {formErrors.specialization && (
                            <div className="error-message">{formErrors.specialization}</div>
                          )}
                        </div>
                      </div>
                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.industryType && "conditional-height"}`} style={{height:formErrors.industryType?"132px":""}}>
                        <div id="item_apply" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Location<span className="color-red">*</span></label>
                          <select
                            value={location}
                            className="input-form"
                            onChange={handleLocationChange}
                            style={{ color: location ? 'black' : 'lightgrey' }}
                            required
                          >
                            <option value="">Select Location</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Coimbatore">Coimbatore</option>
                            <option value="Kochi">Kochi</option>
                            <option value="Madurai">Madurai</option>
                            <option value="Mysore">Mysore</option>
                            <option value="Thanjavur">Thanjavur</option>
                            <option value="Pondicherry">Pondicherry</option>
                            <option value="Vijayawada">Vijayawada</option>
                            <option value="Pune">Pune</option>
                            <option value="Gurgaon">Gurgaon</option>
                          
                          </select>
                          {formErrors.location && (
                            <div className="error-message">{formErrors.location}</div>
                          )}
                        </div>
                      </div>
                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.location && "conditional-height"}`} style={{height:formErrors.location?"132px":""}}>
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">Industry Type</label>
                          <input
                            type="text"
                            value={industryType}
                            className="input-form"
                            placeholder="Sector"
                            onChange={handleIndustryTypeChange}
                          />
                          {formErrors.industryType && (
                            <div className="error-message">{formErrors.industryType}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.skills && "conditional-height"}`} style={{height:formErrors.skills?"132px":""}}>
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">
                            Job Type<span className="color-red">*</span>
                          </label>
                          <select value={employeeType}
                            className="input-form"
                            onChange={handleEmployeeTypeChange}
                            style={{ color: employeeType ? 'black' : 'lightgrey' }}
                            required>
                            <option value="">Select</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                          </select>
                          {formErrors.employeeType && (
                            <div className="error-message">{formErrors.employeeType}</div>
                          )}
                        </div>
                      </div>

                      <div className={`col-lg-6 col-md-6 input-height ${formErrors.employeeType && "conditional-height"}`} style={{height:formErrors.employeeType?"132px":""}}>
                        <div id="item_1" className="dropdown titles-dropdown info-wd">
                          <label className="title-user fw-7">
                            Skills<span className="color-red">*</span>
                          </label>
                          <Typeahead
                            id="skillsTypeahead"
                            labelKey={(option) => option.skillName}
                            multiple
                            placeholder="Skills*"
                            options={filterOutSelectedSkills(skillsOptionsWithStructure, skillsRequired)}
                            onChange={(selectedSkills) => handleSkillsChange(selectedSkills)}
                            selected={skillsRequired}
                            inputProps={{
                              className: 'input-form placeholder-light-grey',
                            }}
                            allowNew={false} 
                            filterBy={(option, props) =>
                              option.skillName.toLowerCase().startsWith(props.text.toLowerCase())
                            }
                          />
                          {formErrors.skills && (
                            <div className="error-message">{formErrors.skills}</div>
                          )}
                        </div>
                          
                      </div>
                      <div 
  className="form-infor flex flat-form" 
  style={{ 
    borderTop: "2px solid #E8E8E8", 
    width: "97%", // Adjust the width dynamically
    marginLeft: "auto", 
    marginRight: "auto", // Centers the line
    marginBottom: "16px", // Adds space below the line
    marginTop:"15px"
  }}
>
  {/* <div className="info-box info-wd"></div> */}
</div>
<label 
  className="title-user fw-7" 
  style={{ 
    color: "#64666C", 
    fontFamily: "Plus Jakarta Sans", 
    fontSize: "18px", 
    fontStyle: "normal", 
    fontWeight: "700", 
    lineHeight: "26px"
  }}
>
  Get Applicants on
</label>

<div style={{ marginTop: "10px" }}>
<label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <input
          type="radio"
          name="applicantSource"
          value="bitlabsJobs"
          defaultChecked
          onChange={(e) => {
            handleOptionChange(e);
            setFormErrors({ url: "" }); // Clear URL error if switching to Bitlabs Jobs
          }}
          //onChange={handleOptionChange}
          style={{
            marginRight: "8px",
            appearance: "none",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid #64666C",
            position: "relative",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "4px",
            left: "4px",
            width: "12px",
            height: "12px",
            backgroundColor: "#F97316",
            borderRadius: "50%",
            display: "none",
          }}
        ></span>
        bitlabs Jobs
      </label>

      <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
        <input
          type="radio"
          name="applicantSource"
          value="externalWebsite"
          onChange={handleOptionChange}
          style={{
            marginRight: "8px",
            appearance: "none",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid #64666C",
            position: "relative",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "4px",
            left: "4px",
            width: "12px",
            height: "12px",
            backgroundColor: "#F97316",
            borderRadius: "50%",
            display: "none",
          }}
        ></span>
        External Website
      </label>

      {selectedOption === "externalWebsite" && (
  <>
    <fieldset className="info-wd" style={{ marginTop: "16px", marginBottom: "10px" }}>
      <input
        type="text"
        placeholder="Website URL"
        className="input-form"
        value={jobURL}
        onChange={handleJobTitleChange1}
        required
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "16px",
          border: formErrors.url ? "1px solid red" : "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      {formErrors.url && (
        <div
          className="error-message"
          style={{
            color: "red",
            fontSize: "12px",
            marginTop: "4px",
          }}
        >
          {formErrors.url}
        </div>
      )}
    </fieldset>

    {/* Show Back and Post Job buttons */}
    <div className="form-group" align="right" style={{marginTop:"20px"}}>
  <button
    type="button" // Use "button" to avoid default form submission
    onClick={handlePostJob } 
    className="button-status"
  >
    Post
  </button>
</div>
  </>
)}
</div>


                    </div>
                    {snackbar.open && (
  <div className={`snackbar snackbar-${snackbar.type}`}>
    {snackbar.message}
    <button onClick={handleCloseSnackbar1}>Close</button>
  </div>
)}
                    
                    {selectedOption !== "externalWebsite" && (
 
  <div className="form-group" align="right">
    <button onClick={handleNext} className="button-status">
      Next
    </button>
  </div>
)}
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
export default RecruiterPostJob;