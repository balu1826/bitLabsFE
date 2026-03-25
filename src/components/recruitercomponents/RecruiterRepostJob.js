import React, { useState, useEffect } from 'react';
import { useUserContext } from '../common/UserProvider';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
import { apiUrl } from '../../services/ApplicantAPIService';
import BackButton from '../common/BackButton';
import Snackbar from '../common/Snackbar';
import 'react-quill/dist/quill.snow.css'; 
import ReactQuill from 'react-quill';

const RecruiterRepostJob = ({selectedJobId}) => {
 
    const navigate=useNavigate();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
    const [skillsRequired, setSkillsRequired] = useState([
      { skillName: "", minimumExperience: "" },
    ]);
   
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
        });
       
   
        useEffect(() => {
            setSkillsRequired(jobData.skillsRequired);
          }, [jobData.skillsRequired]);
 
          useEffect(() => {
            console.log("Data fetching started...");
            
            const fetchJobData = async () => {
              const jwtToken = localStorage.getItem('jwtToken');
              if (jwtToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
                console.log("JWT Token set in headers:", jwtToken);
              }
              
              try {
                console.log(`Fetching job data for job ID: ${selectedJobId}, user ID: ${user.id}`);
                
                const response = await axios.get(`${apiUrl}/job/${selectedJobId}/${user.id}`);
                const jobDataFromApi = response.data;
          
                console.log("API Response Data:", jobDataFromApi);
                
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
                  skillsRequired: jobDataFromApi.skillsRequired.map((skill) => ({
                    skillName: skill.skillName,
                    minimumExperience: skill.minimumExperience,
                  })),
                  jobHighlights: jobDataFromApi.jobHighlights,
                  description: jobDataFromApi.description,
                });
          
                console.log("Job data set to state:", {
                  jobTitle: jobDataFromApi.jobTitle,
                  minimumExperience: jobDataFromApi.minimumExperience,
                  maximumExperience: jobDataFromApi.maximumExperience,
                });
          
                setLoading(false);
                console.log("Data fetching completed successfully.");
              } catch (error) {
                console.error("Error fetching job data:", error);
                setLoading(false);
              }
            };
          
            fetchJobData();
          }, [selectedJobId, user.id]);

     
   
      const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("in handleSubmit");
     
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
         
          const response = await axios
            .post(`${apiUrl}/job/recruiters/saveJob/${user.id}`,
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
          
            setSnackbar({ open: true, message: 'Job reposted successfully', type: 'success' });
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
 
  const minExperience = String(skill.minimumExperience);
 
if (!minExperience.trim()) {
  skillErrors.minimumExperience = 'Experience is required.';
  isValid = false;
} else if (typeof minExperience !== 'string' || isNaN(parseInt(minExperience, 10))) {
  skillErrors.minimumExperience = 'Experience should be a valid number.';
  isValid = false;
} else {
  skillErrors.minimumExperience = '';
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
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      skillsRequired: '',
    }));
  };
 
 
  const handleExperienceChange = (e, index, field) => {
    const updatedSkillsRequired = [...skillsRequired];
    updatedSkillsRequired[index][field] = e.target.value;
    setSkillsRequired(updatedSkillsRequired);
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
      setJobData({ ...jobData, description: value });
  
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
             
                <div className="title-dash flex2"> <BackButton />Repost Job</div>
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
        <ReactQuill
          value={jobData.description}
          onChange={handleQuillChange}
          placeholder="Job Description at least 15 characters"
          required
        />
        {formErrors.description && (
          <div className="error-message">{formErrors.description}</div>
        )}
      </div>
    </div>
                <div className="row">
                    <div className="col-lg-6 col-md-6">
                    <div id="item_category" className="dropdown titles-dropdown info-wd">
                     <label className="title-user fw-7">Minimum Experience<span className="color-red">*</span></label>
                      <input  type="number"
                              placeholder="Min"
                              className="input-form"
                              value={jobData.minimumExperience}
          onChange={(e) => setJobData({ ...jobData, minimumExperience: e.target.value })}
                              required
                      />
                      {formErrors.minimumExperience && (
                      <div className="error-message">{formErrors.minimumExperience}</div>
                    )}
                    </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                    <div id="item_1" className="dropdown titles-dropdown info-wd">
                      <label className="title-user fw-7">Maximum Experience<span className="color-red">*</span></label>
                      <input type="number"
                             placeholder="Max"
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
                      <label className="title-user fw-7">Minimum Salary<span className="color-red">*</span></label>
                      <input type="text"
                             placeholder="Min"
                             className="input-form"
                             value={jobData.minSalary}
        onChange={(e) => setJobData({ ...jobData, minSalary: e.target.value })}
                             required
                     />
                     {formErrors.minSalary && (
                      <div className="error-message">{formErrors.minSalary}</div>
                    )}
                    </div>
                    </div>
                    <div className="col-lg-6 col-md-12">
                    <div id="item_2" className="dropdown titles-dropdown info-wd">
                      <label className="title-user fw-7">Maximum Salary<span className="color-red">*</span></label>
                      <input
                                 type="text"
                                 placeholder="Max"
                                 className="input-form"
                                 value={jobData.maxSalary}
                                 onChange={(e) => setJobData({ ...jobData, maxSalary: e.target.value })}
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
                    <label className="title-user fw-7">Job Highlights</label>
                       <textarea
                        className="input-form"
                        placeholder="Job key points"
                        value={jobData.jobHighlights}
        onChange={(e) => setJobData({ ...jobData, jobHighlights: e.target.value })}
                        
                      />
                      {formErrors.jobHighlights && (
                      <div className="error-message">{formErrors.jobHighlights}</div>
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
          {skillsRequired.map((skill, index) => (
            <div key={index} className="experience-table">
              <div>
                <input
                  type="text"
                  placeholder="Skill"
                  className="input-form"
                  value={skill.skillName}
                  onChange={(e) => handleSkillChange(e, index, 'skillName')}
                />
                {formErrors.skillsRequired && formErrors.skillsRequired[index] && formErrors.skillsRequired[index].skillName && (
                  <div className="error-message">{formErrors.skillsRequired[index].skillName}</div>
                )}
              </div><br />
              <div>
                <input
                  type="text"
                  placeholder="Experience"
                  className="input-form"
                  value={skill.minimumExperience}
                  onChange={(e) => handleExperienceChange(e, index, 'minimumExperience')}
                />
                {formErrors.skillsRequired && formErrors.skillsRequired[index] && formErrors.skillsRequired[index].minimumExperience && (
                  <div className="error-message">{formErrors.skillsRequired[index].minimumExperience}</div>
                )}
              </div>
              {index === skillsRequired.length - 1 && (
                <button type="button" onClick={addExperience} style={{ 'color': '#FFFFFF', 'backgroundColor': '#1967d2' }}>
                  +
                </button>
              )} &nbsp;
              {index === skillsRequired.length - 1 && (
                <button type="button" onClick={removeExperience} style={{ 'color': '#FFFFFF', 'backgroundColor': '#FF0000' }}>
                  -
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
                  </div>
                <div className="form-infor flex flat-form">
                  <div className="info-box info-wd">
                 </div>
                </div>
                <div className="form-group">
                    <button type="submit"  className='button-status'>Repost Job</button>
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
 
export default RecruiterRepostJob;
