import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import Snackbar from '../common/Snackbar';
import { Typeahead } from 'react-bootstrap-typeahead';
 
const ProfessionalDetailsPopup = ({ applicantDetails }) => {
  
  const [qualification, setQualification] = useState('');
  
  const [formValues, setFormValues] = useState({
    qualification: applicantDetails&&applicantDetails.qualification|| '',
     specialization: applicantDetails&&applicantDetails.specialization || '',
    experience: applicantDetails&&applicantDetails.experience || '',
    preferredJobLocations: applicantDetails&&applicantDetails.preferredJobLocations || [],
    skillsRequired : [
      ...(applicantDetails.skillsRequired || []),
      ...(applicantDetails.applicant.applicantSkillBadges || [])
        .filter(badge => badge.flag === 'added') // Filter out badges with flag 'removed'
        .map(badge => ({
          skillName: badge.skillBadge.name,
          experience: 0 // Assuming applicantSkillBadges doesn't have experience data
        }))
    ],
    
   
  });
  const [errors, setErrors] = useState({});
  const [snackbars, setSnackbars] = useState([]);
  const user1 = useUserContext();
  const user = user1.user;
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isSkillsMenuOpen, setIsSkillsMenuOpen] = useState(false);
  const [isExperienceMenuOpen, setIsExperienceMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //media query for the dropdown
  const dropdownStyle = {
    width: '100%',
    maxHeight:
      screenWidth <= 480
        ? '100px'
        : screenWidth <= 768
          ? '140px'
          : screenWidth <= 1024
            ? '150px'
            : screenWidth <= 1440
              ? '180px'
              : '200px',
    overflowY: 'auto',
    margin: 0,
    padding: 0,
    listStyle: 'none',
    border: '1px solid #ccc',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1000,
  };

  const menuItemStyle = {
    padding:
      screenWidth <= 480
        ? '0px 5px'
        : screenWidth <= 768
          ? '0.5px 5px'
          : screenWidth <= 1024
            ? '1px 7px'
            : screenWidth <= 1440
              ? '1px 9px'
              : '2px 5px',
    fontSize:
      screenWidth <= 480
        ? '14px'
        : screenWidth <= 768
          ? '13px'
          : screenWidth <= 1024
            ? '14px'
            : screenWidth <= 1440
              ? '15px'
              : '16px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  
  };

  const noMatchesStyle = {
    padding:
      screenWidth <= 480
        ? '4px 6px'
        : screenWidth <= 768
          ? '0.5px 5px'
          : screenWidth <= 1024
            ? '2px 3px'
            : screenWidth <= 1440
              ? '6px 10px'
              : 'px 5px',
    fontSize:
      screenWidth <= 480
        ? '12px'
        : screenWidth <= 768
          ? '13px'
          : screenWidth <= 1024
            ? '14px'
            : screenWidth <= 1440
              ? '15px'
              : '16px',
    color: '#e9ecef',
    textAlign: 'center',
  };

  useEffect(() => {
    if (applicantDetails) {
      setFormValues({
        qualification: applicantDetails.qualification || '',
        specialization: applicantDetails.specialization || '',
         experience: applicantDetails.experience?.toString() || '',
 
        preferredJobLocations: applicantDetails.preferredJobLocations || [],
        skillsRequired : [
          ...(applicantDetails.skillsRequired || []),
          ...(applicantDetails.applicant.applicantSkillBadges || [])
            .filter(badge => badge.flag === 'added') // Filter out badges with flag 'removed'
            .map(badge => ({
              skillName: badge.skillBadge.name,
              experience: 0 // Assuming applicantSkillBadges doesn't have experience data
            }))
        ],
      });
    }
  }, [applicantDetails]);

  const handleQualificationChange = (selected) => {
    const qualification = selected.length > 0 ? selected[0] : '';
    setFormValues({ ...formValues, qualification, specialization: '' });
    setErrors({ ...errors, qualification: validateInput('qualification', qualification) });
  };

  const handleSpecializationChange = (selected) => {
    const specialization = selected.length > 0 ? selected[0] : '';
    setFormValues({ ...formValues, specialization });
    setErrors({ ...errors, specialization: validateInput('specialization', specialization) });
  };
  const validateInput = (name, value) => {
    let error = '';
    if (!value || (Array.isArray(value) && value.length === 0)) {
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim();
      error = `${formattedName} is required.`;
    }
    return error;
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };
 
  const handleInputChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: validateInput(name, value) });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const error = validateInput(key, formValues[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
 
    if (Object.keys(newErrors).length === 0) {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.put(
        `${apiUrl}/applicantprofile/${user.id}/professional-details`,
          formValues,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
 
        if (response.status === 200) {
        
         addSnackbar({ message: 'Professional details updated successfully', type: 'success' });
          window.location.reload(); 
        } else {
          console.error('An error occurred:', response.status, response.statusText);
        
          addSnackbar({ message: 'Failed to update professional details.', type: 'error' });
        }
      } catch (error) {
        console.error('An error occurred:', error);
       
        addSnackbar({ message: 'Failed to update professional details due to an error.', type: 'error' });
      }
    }
  };
  const yearsOptions = Array.from({ length: 16 }, (_, i) => ({ label: `${i}` }));
  const qualificationsOptions = ['B.Tech', 'MCA', 'Degree', 'Intermediate', 'Diploma'];
  const skillsOptions = ['Java', 'C', 'C++', 'C Sharp', 'Python', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 'JSP', 'Servlets', 'Spring', 'Spring Boot', 'Hibernate', '.Net', 'Django', 'Flask', 'SQL', 'MySQL', 'SQL-Server', 'Mongo DB', 'Selenium', 'Regression Testing', 'Manual Testing'];
  const cities = ['Chennai', 'Thiruvananthapuram', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Kochi', 'Madurai', 'Mysore', 'Thanjavur', 'Pondicherry', 'Vijayawada', 'Pune', 'Gurgaon'];
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
                 'Radiology and Imaging Technology'],     };
  console.log('Qualification Options:', qualificationsOptions);
  console.log('Qualification Selected:', qualification);
 
  return (
    <div className="basic-details-edit-popup">
      <div className="popup-heading">Professional Details</div>
      <div className="input-container-basicdetails">
        <div className="input-wrapper1">
          <Typeahead
            id="qualification"
            options={qualificationsOptions}
            placeholder="*Qualification"
            onChange={handleQualificationChange}
            selected={formValues.qualification ? [formValues.qualification] : []}
            className="custom-typeahead"
            inputProps={{ readOnly: true,
               style: { backgroundColor: '#F5F5F5' },
            }}  
        onInputChange={() => {}}        
        filterBy={() => true}  
          />
          {errors.qualification && <div className="error-message">{errors.qualification}</div>}
        </div>
 
        <div className="input-wrapper1">
          <Typeahead
            id="specialization"
            options={specializationsByQualification[formValues.qualification] || []}
            placeholder="*Specialization"
            onChange={handleSpecializationChange}
            selected={formValues.specialization ? [formValues.specialization] : []}
            className="custom-typeahead"
            inputProps={{ readOnly: true,
               style: { backgroundColor: '#F5F5F5' },
             }}  
        onInputChange={() => {}}        
        filterBy={() => true}  
          />
          {errors.specialization && <div className="error-message">{errors.specialization}</div>}
        </div>
 
        <div className="input-wrapper1">
          <Typeahead
            id="skillsRequired"
            multiple
            options={skillsOptions.map((skill) => ({ label: skill, value: skill }))}
            placeholder="*Skills Required"
            open={isSkillsMenuOpen}
            onFocus={() => setIsSkillsMenuOpen(true)}
            onBlur={() => setTimeout(() => setIsSkillsMenuOpen(false), 150)}
            onInputChange={() => setIsSkillsMenuOpen(true)}
            inputProps={{
               style: { backgroundColor: '#F5F5F5' },
              onClick: () => setIsSkillsMenuOpen(true), // Ensures dropdown opens again when clicked
            }}
            onChange={(selected) => {
              const wasItemRemoved = selected.length < formValues.skillsRequired.length;
 
              handleInputChange(
                'skillsRequired',
                selected.map((option) => ({
                  id: option.valueOf,
                  skillName: option.label,
                  experience: 0,
                }))
              );
 
              if (wasItemRemoved && selected.length === 0) {
                setTimeout(() => setIsSkillsMenuOpen(true), 160); // Reopen if all removed
              } else {
                setIsSkillsMenuOpen(false); // Close after selection
              }
            }}
            selected={formValues.skillsRequired.map((skill) => ({
              label: skill.skillName,
              value: skill.skillName,
            }))}
            className="custom-typeahead2"
            labelKey="label"
            renderMenu={(results, menuProps) => (
              <ul {...menuProps} style={dropdownStyle}>
                {results.length === 0 ? (
                  <li style={noMatchesStyle}>No matches found</li>
                ) : (
                  results.map((option, index) => (
                    <li
                      key={index}
                      style={menuItemStyle}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur before change
                        const updated = [
                          ...formValues.skillsRequired,
                          {
                            id: option.valueOf,
                            skillName: option.label,
                            experience: 0,
                          },
                        ];
                        handleInputChange('skillsRequired', updated);
                        setIsSkillsMenuOpen(false); // Close after selection
                      }}
                    >
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            )}
             />
          {errors.skillsRequired && <div className="error-message">{errors.skillsRequired}</div>}
        </div>
 
        <div className="input-wrapper1">
  <Typeahead
    id="experience"
    options={yearsOptions}
    placeholder="*Experience in Years"
    open={isExperienceMenuOpen}
            onFocus={() => setIsExperienceMenuOpen(true)}
            onBlur={() => setTimeout(() => setIsExperienceMenuOpen(false), 150)}
            onInputChange={() => setIsExperienceMenuOpen(true)}
            onChange={(selected) => {
              const experienceValue = selected.length > 0 ? selected[0].label : '';
              handleInputChange('experience', experienceValue);
              setIsExperienceMenuOpen(false);
            }}
            selected={
              formValues.experience
                ? yearsOptions.filter(
                  (option) => option.label === formValues.experience
                )
                : []
            }
            className="custom-typeahead"
            labelKey="label"
            single
            inputProps={{
              readOnly: true,
               style: { backgroundColor: '#F5F5F5' },
              onClick: () => setIsExperienceMenuOpen(true), // ✅ Reopen dropdown on input click
            }}
            filterBy={() => true}
            renderMenu={(results, menuProps) => (
              <ul {...menuProps} style={dropdownStyle}>
                {results.length === 0 ? (
                  <li style={noMatchesStyle}>No matches found</li>
                ) : (
                  results.map((option, index) => (
                    <li
                      key={index}
                      style={{
                        ...menuItemStyle,
                        fontWeight:
                          option.label === formValues.experience ? 'bold' : 'normal',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleInputChange('experience', option.label);
                        setIsExperienceMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            )}
  />
  {errors.experience && <div className="error-message">{errors.experience}</div>}
</div>
<div className="input-wrapper1">
  <Typeahead
    id="preferredJobLocations"
    multiple
    options={cities.map((city) => ({ label: city, value: city }))}
    placeholder="*Preferred Job Locations"
    onChange={(selected) => {
              const uniqueCities = Array.from(new Set(selected.map(option => option.value)));
              handleInputChange('preferredJobLocations', uniqueCities);
              setTimeout(() => setIsLocationMenuOpen(true), 160);
            }}
            selected={formValues.preferredJobLocations.map(city => ({ label: city, value: city }))}
            className="custom-typeahead2"
            labelKey="label"
            inputProps={{}}
            filterBy={(option) =>
              !formValues.preferredJobLocations.includes(option.value)
            }
            open={isLocationMenuOpen}
            onInputChange={() => setIsLocationMenuOpen(true)}
            onFocus={() => setIsLocationMenuOpen(true)}
            onBlur={() => setTimeout(() => setIsLocationMenuOpen(false), 150)}
            renderMenu={(results, menuProps) => (
              <ul {...menuProps} style={dropdownStyle}>
                {results.length === 0 ? (
                  <li style={noMatchesStyle}>No matches found</li>
                ) : (
                  results.map((option, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        const updated = [...formValues.preferredJobLocations, option.value];
                        handleInputChange('preferredJobLocations', updated);
                        setIsLocationMenuOpen(true);
                      }}
                      style={menuItemStyle}
                    >
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            )}
   
  />
  {errors.preferredJobLocations && (
    <div className="error-message">{errors.preferredJobLocations}</div>
  )}
</div>

      </div>
 
      <div className="savebut">
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-3"
          style={{
            backgroundColor: '#F97316',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '5px',
            textTransform: 'capitalize',
            height: '48px',
          }}
        >
          Save changes
        </button>
      </div>
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
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
 
export default ProfessionalDetailsPopup;