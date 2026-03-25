import React, { useState, useEffect } from 'react';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { apiUrl } from '../../services/ApplicantAPIService';
import Snackbar from '../common/Snackbar';
import { Typeahead } from 'react-bootstrap-typeahead';
import BackButton from '../common/BackButton';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const RecruiterEditJob = ({selectedJobId}) => {
  const [skillsRequired, setSkillsRequired] = useState([
    { skillName: "", minimumExperience: "" },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
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
  const handleSkillsChange = (selected) => {
    const skillsWithNames = selected.map((skill) => ({
      skillName: skill.skillName || skill, 
      minimumExperience: '', 
    }));
    setSkillsRequired(skillsWithNames);
    setJobData((prevJobData) => ({
      ...prevJobData,
      skillsRequired: skillsWithNames,
    }));
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

  const skillsOptionsWithStructure = skillsOptions.map(skill => ({ skillName: skill }));
    const navigate=useNavigate();

    const filteredSkillsOptions = skillsOptionsWithStructure.filter(
      skill => !skillsRequired.some(
        selectedSkill => selectedSkill.skillName.toLowerCase() === skill.skillName.toLowerCase()
      )
    );
    
  

    
    const user1 = useUserContext();
    const user = user1.user;
    const [loading, setLoading] = useState(true);
    const [formErrors, setFormErrors] = useState({
        jobTitle: '',
        minSalary: '',
        maxSalary: '',
        minimumExperience: '',
        maximumExperience: '',
        location: '',
        minimumQualification: '',
        description: '',
        skillsRequired: [{ skillName: '', minimumExperience: '' }],
        jobHighlights: '',
        description: '',
        uploadDocument: '',
        specialization: '',
      });
      const [jobData, setJobData] = useState({
          jobTitle: "",
          minimumExperience: "",
          maximumExperience: "",
          minSalary: "",
          maxSalary: "",
          location: "",
          employeeType: "",
          industryType: "",
          minimumQualification: "",
          specialization: "",
          skillsRequired: [{ skillName: '', minimumExperience: '' }],
          jobHighlights: "",
          description: "",
          screeningQuestions: [{ id: '', questionText: '', answers: [] }], // Add this field
          jobURL: null, // Include jobURL in the initial state
        });

       
   
        useEffect(() => {
            setSkillsRequired(jobData.skillsRequired);
          }, [jobData.skillsRequired]);
 
    useEffect(() => {
        console.log("data fetching..");
        const fetchJobData = async () => {
          const jwtToken = localStorage.getItem('jwtToken');
          if (jwtToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
          }
     
          try {
            const response = await axios.get(`${apiUrl}/job/${selectedJobId}/${user.id}`);
            const jobDataFromApi = response.data;
     
            setJobData({
              jobTitle: jobDataFromApi.jobTitle,
              minimumExperience: jobDataFromApi.minimumExperience,
              maximumExperience: jobDataFromApi.maximumExperience,
              minSalary: jobDataFromApi.minSalary,
              maxSalary: jobDataFromApi.maxSalary,
              location: jobDataFromApi.location,
              employeeType: jobDataFromApi.employeeType,
              industryType: jobDataFromApi.industryType,
              minimumQualification: jobDataFromApi.minimumQualification,
              specialization: jobDataFromApi.specialization,
              skillsRequired: jobDataFromApi.skillsRequired.map(skill => ({
                skillName: skill.skillName,
                minimumExperience: skill.minimumExperience,
              })),
              jobHighlights: jobDataFromApi.jobHighlights,
              description: jobDataFromApi.description,
              screeningQuestions: jobDataFromApi.screeningQuestions.map(question => ({
                id: question.id,
                questionText: question.questionText,
                answers: question.answers,
              })), // Map the screening questions
              jobURL: jobDataFromApi.jobURL, // Include jobURL
            });
     
            setLoading(false);
          } catch (error) {
            console.error('Error fetching job data:', error);
            setLoading(false);
          }
        };
     
        fetchJobData();
      }, [selectedJobId, user.id]);

     
   
      const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("in handleSubmit");

          // Check if skills are empty
  if (skillsRequired.length === 0 || skillsRequired.some(skill => !skill.skillName.trim())) {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      skillsRequired: [{ skillName: 'Please select at least one skill.', minimumExperience: '' }],
    }));
    return;
  }
     
        const isFormValid = validateForm("");
        if (!isFormValid) {
          return;
        }

      
        const formData = {
            jobTitle: jobData.jobTitle,
            minimumExperience: jobData.minimumExperience,
            maximumExperience: jobData.maximumExperience,
            minSalary: jobData.minSalary,
            maxSalary: jobData.maxSalary,
            location: jobData.location,
            employeeType: jobData.employeeType,
            industryType: jobData.industryType,
            minimumQualification: jobData.minimumQualification,
            specialization: jobData.specialization,
            skillsRequired: jobData.skillsRequired.map(skill => ({
              skillName: skill.skillName,
              minimumExperience: skill.minimumExperience,
            })),
            jobHighlights: jobData.jobHighlights,
            description: jobData.description,
            uploadDocument: jobData.uploadDocument,
          };
        try {
          const jwtToken = localStorage.getItem('jwtToken');
          console.log('jwt token new', jwtToken);
         
          const response = await axios.put(
            `${apiUrl}/job/editJob/${selectedJobId}/${user.id}`,
            formData,  
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
     
          if (response.status === 200) {
            console.log(response.body);
           
            setSnackbar({ open: true, message: 'Job updated successfully', type: 'success' });
            localStorage.setItem('jobs', JSON.stringify(''));
            
          } else {
            console.error('An error occurred:', response.status, response.body);
          }
        } catch (error) {
          console.error('Error updating job:', error);
        }
      };
   
    const validateForm = (fielname) => {
      let isValid = true;
      const errors = {};
     
      if (!jobData.jobTitle.trim()) {
        isValid = false;
        errors.jobTitle = 'Job title is required.';
      } else {
        errors.jobTitle = '';
      }
   
   
      if (!String(jobData.minimumExperience).trim()) {
        isValid = false;
        errors.minimumExperience = 'Minimum experience is required.';
      } else {
        errors.minimumExperience = '';
      }
     
      if (!String(jobData.maximumExperience).trim()) {
        errors.maximumExperience = 'Maximum experience is required.';
        isValid = false;
      } else if (parseInt(jobData.minimumExperience) > parseInt(jobData.maximumExperience)) {
        errors.maximumExperience = 'Maximum experience should be greater than or equal to minimum experience.';
        isValid = false;
      } else {
        errors.maximumExperience = '';
      }
      if (!String(jobData.minSalary).trim()) {
        errors.minSalary = 'Minimum salary is required.';
        isValid = false;
      }
      else {
        errors.minSalary = '';
      }
   
 
      if (!String(jobData.maxSalary).trim()) {
        errors.maxSalary = 'Maximum salary is required.';
        isValid = false;
      } else if (parseInt(jobData.maxSalary) > parseInt(jobData.maxSalary)) {
        errors.maxSalary = 'Maximum salary should be greater than or equal to minimum salary.';
        isValid = false;
      } else {
        errors.maxSalary = '';
      }
   
 
      if (!jobData.location.trim()) {
        errors.location = 'Location is required.';
        isValid = false;
      } else if (!/^[a-zA-Z]+$/.test(jobData.location.trim())) {
        errors.location = 'Location should contain only alphabets.';
        isValid = false;
      } else {
        errors.location = '';
      }
   
   
      if (!jobData.employeeType.trim()) {
        errors.employeeType = 'Job type is required.';
        isValid = false;
      } else {
        errors.employeeType = '';
      }
   
 
      if (!jobData.minimumQualification.trim()) {
        errors.minimumQualification = 'Minimum qualification is required.';
        isValid = false;
      } else {
        errors.minimumQualification = '';
      }
   
      const skillsErrors = [];
 
skillsRequired.forEach((skill, index) => {
  const skillErrors = {};
 
  if (!skill.skillName || !skill.skillName.trim()) {
    skillErrors.skillName = 'Skill name is required.';
    isValid = false;
  } else {
    skillErrors.skillName = '';
  }

 
  skillsErrors[index] = skillErrors;
});
 
errors.skillsRequired = skillsErrors;
   
      if (jobData.industryType && jobData.industryType.trim().length < 2) {
        isValid = false;
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          industryType: 'Industry type must be at least 2 characters long.',
        }));
        return isValid;
      }
      if (jobData.specialization && jobData.specialization.trim().length < 3) {
        isValid = false;
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          specialization: 'Specialization must be at least 3 characters long.',
        }));
        return isValid;
      }
      if (jobData.jobHighlights && jobData.jobHighlights.trim().length < 3) {
        isValid = false;
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          jobHighlights: 'Job highlights must be at least 3 characters long.',
        }));
        return isValid;
      }
      if (!jobData.description.trim() || jobData.description.trim().length < 15) {
        errors.description = 'Description is required and must be at least 15 characters long.';
        isValid = false;
      } else {
        errors.description = '';
      }

      if (skillsRequired.length === 0 || skillsRequired.some(skill => !skill.skillName.trim())) {
        isValid = false;
        errors.skillsRequired = [{ skillName: 'Please select at least one skill.', minimumExperience: '' }];
      } else {
        errors.skillsRequired = '';
      }
     
      setFormErrors(errors);
      return isValid;
    };
 
    const handleMinimumQualificationChange = (e) => {
      setJobData((prevJobData) => ({
        ...prevJobData,
        minimumQualification: e.target.value,
      }));
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        minimumQualification: '',
      }));
    };
   
    const handleSpecializationChange = (e) => {
      setJobData((prevJobData) => ({
        ...prevJobData,
        specialization: e.target.value,
      }));
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        specialization: '',
      }));
    };
    const handleSkillChange = (e, index, field) => {
      const updatedSkillsRequired = [...skillsRequired];
      updatedSkillsRequired[index][field] = e.target.value;
    
      setSkillsRequired(updatedSkillsRequired);
      setJobData((prevJobData) => ({
        ...prevJobData,
        skillsRequired: updatedSkillsRequired,
      }));
    
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        skillsRequired: '',
      }));
    };
 
 
    const handleExperienceChange = (e, index, field) => {
      const updatedSkillsRequired = [...skillsRequired];
      updatedSkillsRequired[index][field] = e.target.value;
    
      setSkillsRequired(updatedSkillsRequired);
      setJobData((prevJobData) => ({
        ...prevJobData,
        skillsRequired: updatedSkillsRequired,
      }));
    
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        skillsRequired: '',
      }));
    };
   
 
    const addExperience = () => {
      setSkillsRequired([...skillsRequired, { skillName: "", minimumExperience: "" }]);
   
    };
    const removeExperience = () => {
      if (skillsRequired.length > 1) {
        const updatedSkills = [...skillsRequired.slice(0, -1)];
        setSkillsRequired(updatedSkills);
      }
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
    const handleCloseSnackbar = () => {
      setSnackbar({ open: false, message: '', type: '' });
      navigate('/recruiter-jobopenings');
    };


    const handleQuillChange = (value) => {
      setJobData((prevJobData) => ({
        ...prevJobData,
        description: value,
      }));
     
      if (value.trim().length >= 15) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          description: '',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          description: 'Job Description must be at least 15 characters.',
        }));
      }
    };
    


    return (
        <div>
           <div className="dashboard__content">
      <section className="page-title-dashboard">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12 ">
              <div className="title-dashboard">
              
                <div className="title-dash flex2"><BackButton />Edit Job</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flat-dashboard-post flat-dashboard-setting">
      <form onSubmit={handleSubmit}>
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12 ">
              <div className="post-new profile-setting bg-white">
                <div className="wrap-titles">
                <label className="title-user fw-7">Job Title<span className="color-red">*</span></label>
                  <fieldset className="info-wd">
                  <input
                        type="text"
                        placeholder="Job Role | Job Designation"
                        className="input-form"
                        value={jobData.jobTitle}
                        onChange={(e) => setJobData({ ...jobData, jobTitle: e.target.value })}
                       
                      />
                      {formErrors.jobTitle && (
                        <div className="error-message">{formErrors.jobTitle}</div>
                      )}
                  </fieldset>
                </div>
                <div className="text-editor-wrap">
      <label className="title-user fw-7">
        Job Description<span className="color-red">*</span>
      </label>
      <div className="text-editor-main">
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
        value={jobData.description}
        onChange={handleQuillChange}
        required
      />
    </>

        {formErrors.description && (
          <div className="error-message">{formErrors.description}</div>
        )}
      </div>
    </div>
                <div className="row">
                    <div className="col-lg-6 col-md-6">
                    <div id="item_category" className="dropdown titles-dropdown info-wd">
  <label className="title-user fw-7">Minimum Experience (in Years)<span className="color-red">*</span></label>
  <input  
    type="number"
    placeholder="2"
    className="input-form"
    value={jobData.minimumExperience}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        setJobData({ ...jobData, minimumExperience: value });
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          minimumExperience: '',
        }));
      } else {
        setJobData({ ...jobData, minimumExperience: '' }); 
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          minimumExperience: 'Minimum experience must be a valid number.',
        }));
      }
    }}
    required
  />
  {formErrors.minimumExperience && (
    <div className="error-message">{formErrors.minimumExperience}</div>
  )}
</div>


                    </div>
                    <div className="col-lg-6 col-md-6">
                    <div id="item_1" className="dropdown titles-dropdown info-wd">
                      <label className="title-user fw-7">Maximum Experience (in Years)<span className="color-red">*</span></label>
                      <input type="number"
                             placeholder="4"
                             className="input-form"
                             value={jobData.maximumExperience}
          onChange={(e) => setJobData({ ...jobData, maximumExperience: e.target.value })}
                         
                             required
                      />
                       {formErrors.maximumExperience&& (
                      <div className="error-message">{formErrors.maximumExperience}</div>
                    )}
                    </div>
                    </div>
   
                    <div className="col-lg-6 col-md-12">
                    <div id="item_1" className="dropdown titles-dropdown info-wd">
  <label className="title-user fw-7">Minimum Salary (in LPA)<span className="color-red">*</span></label>
  <input
    type="text"
    placeholder="2.4"
    className="input-form"
    value={jobData.minSalary}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d*\.?\d*$/.test(value)) {
        setJobData({ ...jobData, minSalary: value });
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          minSalary: '',
        }));
      } else {
        setJobData({ ...jobData, minSalary: '' });
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          minSalary: 'Min salary must be a valid number.',
        }));
      }
    }}
    required
  />
  {formErrors.minSalary && (
    <div className="error-message">{formErrors.minSalary}</div>
  )}
</div>

                    </div>
                    <div className="col-lg-6 col-md-12">
                    <div id="item_2" className="dropdown titles-dropdown info-wd">
  <label className="title-user fw-7">Maximum Salary (in LPA)<span className="color-red">*</span></label>
  <input
    type="text"
    placeholder="6.5"
    className="input-form"
    value={jobData.maxSalary}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d*\.?\d*$/.test(value)) {
        setJobData({ ...jobData, maxSalary: value });
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          maxSalary: '',
        }));
      } else {
        setJobData({ ...jobData, maxSalary: '' });
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          maxSalary: 'Max salary must be a valid number.',
        }));
      }
    }}
    required
  />
  {formErrors.maxSalary && (
    <div className="error-message">{formErrors.maxSalary}</div>
  )}
</div>

                    </div>
                    <div className="col-lg-6 col-md-12">
                    <div id="item_3" className="dropdown titles-dropdown info-wd">
                      <label className="title-user fw-7">Minimum Qualification<span className="color-red">*</span></label>
                       <select
                         value={jobData.minimumQualification}
                         className="input-form"
                         onChange={handleMinimumQualificationChange}
                         required
                      >
                    <option value="">Select Qualification</option>
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
 
                  <div className="col-lg-6 col-md-12">
      <div id="item_1" className="dropdown titles-dropdown info-wd">
        <label className="title-user fw-7">Specialization</label>
        <select
  value={jobData.specialization}
  className="input-form"
  style={{ color: jobData.specialization ? 'black' : 'lightgrey' }}
  onChange={handleSpecializationChange}
>
  <option value="">Select Specialization</option>
  {getSpecializationOptions(jobData.minimumQualification).map((option) => (
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
    <div className="col-lg-6 col-md-12">
  <div id="item_apply" className="dropdown titles-dropdown info-wd">
    <label className="title-user fw-7">Location<span className="color-red">*</span></label>
    <select
      value={jobData.location}
      className="input-form"
      style={{ color: jobData.location ? 'black' : 'lightgrey' }}
      onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
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
                    <div className="col-lg-6 col-md-12">
                    <div id="item_1" className="dropdown titles-dropdown info-wd">
                      <label className="title-user fw-7">Industry Type</label>
                      <input
                            type="text"
                            value={jobData.industryType}
                            className="input-form"
                            placeholder="Sector"
                            onChange={(e) => setJobData({ ...jobData, industryType: e.target.value })}
                          />
                           {formErrors.industryType && (
                      <div className="error-message">{formErrors.industryType}</div>
                    )}
                    </div>
                    </div>
                    <div className="col-lg-6 col-md-12">
                    <div id="item_1" className="dropdown titles-dropdown info-wd">
                    <label className="title-user fw-7">
                        Job Type<span className="color-red">*</span>
                      </label>
                      <select    value={jobData.employeeType}
                              className="input-form"
                              onChange={(e) => setJobData({ ...jobData, employeeType: e.target.value })}
                             
                              >
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
                    <div className="col-lg-6 col-md-12">
                    <div id="item_1" className="dropdown titles-dropdown info-wd">
  <label className="title-user fw-7">Skills<span className="color-red">*</span></label>
  <Typeahead
  id="skills"
  multiple
  labelKey="skillName"
  onChange={handleSkillsChange}
  //options={skillsOptionsWithStructure}
  options={filteredSkillsOptions}
  selected={skillsRequired}
  placeholder="Select required skills"
/>
  {formErrors.skills && (
    <div className="error-message">{formErrors.skills}</div>
  )}
</div>
      </div>
      <>
      {jobData.jobURL === "https://www.bitlabs.in/jobs" || !jobData.jobURL ? (
        <div className="col-lg-12 col-md-12">
          <label className="title-user fw-7">Screening Questions</label>
          {jobData.screeningQuestions.map((question, index) => (
            <div key={question.id} className="question-block">
              <p
                style={{
                  color: '#000',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '15px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  marginBottom: '10px'
                }}
              >
                {index + 1}. {question.questionText}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-lg-12 col-md-12">
          <label className="title-user fw-7">URL</label>
          <p
          style={{
            borderRadius: '8px',
            border: '1px solid #E5E5E5',
            background: '#F5F5F5',
            padding: '8px',
            marginBottom: '15px',
            marginTop: '15px'
          }}
          >{jobData.jobURL}</p>
        </div>
      )}
    </>

                  </div>
                <div className="form-infor flex flat-form">
                  <div className="info-box info-wd">
                 </div>
                </div>
                <div className="form-group">
                    <button type="submit"  className='button-status'>Save Job</button>
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
 
export default RecruiterEditJob;
