import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import ApplicantAPIService,{ apiUrl } from '../../services/ApplicantAPIService';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useUserContext } from '../common/UserProvider';
import { Link } from 'react-router-dom';
import BackButton from '../common/BackButton';
import Snackbar from '../common/Snackbar';

function ApplicantEditProfile() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user1 = useUserContext();
  const user=user1.user;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });

  let error = "";
  const [userData, setUserData] = useState({
    basicDetails: {},
    xClassDetails: {},
    intermediateDetails: {},
    graduationDetails: {},
    skillsRequired: [],
    experienceDetails: [],   
    applicant:{},
  });
  const [errors, setErrors] = useState({
    applicant: {},
    basicDetails: {},
    xClassDetails: {},
    intermediateDetails: {},
    graduationDetails: {},
    skillsRequired: [],
    experienceDetails: [],  
    applicant:{}, 
  });
  const validateForm = (fielname) => {
    const newErrors = {
      applicant: {},
      basicDetails: {},
      xClassDetails: {},
      intermediateDetails: {},
      graduationDetails: {},
      skillsRequired: [],
      experienceDetails: [],
    };
const currentDate = new Date();
const maxAllowedAge = 18;
if(fielname === "" || fielname === 'email'){
  if (!applicant.email) {
    newErrors.applicant.email='Email is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  newErrors.applicant.email=emailRegex.test(applicant.email) ? '' : 'Please enter a valid email address.';

}
if(fielname === "" || fielname === 'name'){
  if (!applicant.name) {
    newErrors.applicant.name= 'Full name is required.';
  }
  if (!/^[a-zA-Z\s]+$/.test(applicant.name)) {
    newErrors.applicant.name='Please enter a valid full name and should not have any numbers and special char.';
  }
  if (applicant.name.length < 3) {
    newErrors.applicant.name= 'Full name should be at least three characters long.';
  }
}
if(fielname === "" || fielname === 'mobilenumber'){
  if (!applicant.mobilenumber.trim()) {
    newErrors.applicant.mobilenumber= 'Mobile number is required.';
  }
  if (!/^\d+$/.test(applicant.mobilenumber)) {
    newErrors.applicant.mobilenumber= 'Mobile number must contain only numeric digits.';
  }
  if (applicant.mobilenumber.length !== 10) {
    newErrors.applicant.mobilenumber='Mobile number must have a specific length (e.g., 10 digits).';
  }
  if (/\s/.test(applicant.mobilenumber)) {
    newErrors.applicant.mobilenumber= 'Mobile number cannot contain spaces.';
  }
  const firstDigit = applicant.mobilenumber.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    newErrors.applicant.mobilenumber= 'Mobile number should begin with 6, 7, 8, or 9.';
  }
}

if(fielname === "" || fielname === "dateOfBirth")
{
 
  if (basicDetails && (fielname === "" || fielname === "dateOfBirth")) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(basicDetails.dateOfBirth)){
    
    } else {
      const selectedDate = new Date(basicDetails.dateOfBirth);
      const currentDate = new Date();
      const maxAllowedAge = 18;
   
      if (selectedDate > new Date(currentDate.getFullYear() - maxAllowedAge, currentDate.getMonth(), currentDate.getDate())) {
        newErrors.basicDetails.dateOfBirth = 'The Date of Birth should be at least 18 years ago.';
      }
    }
  }
}


if(fielname === "" || fielname === "experience")
{
    if (!experience) {
      newErrors.basicDetails.city = 'Experience is required';
    } else {
      if (/\D/.test(experience)) {
        newErrors.basicDetails.city = 'Experience should not be number';
      }
    }
  }
  
if(fielname === "" || fielname === "city")
{
    if (!basicDetails.city) {
      newErrors.basicDetails.city = 'City is required';
    } else {
      if (/\d/.test(basicDetails.city)) {
        newErrors.basicDetails.city = 'City should not be number';
      }
    }
  }
  if(fielname==="" || fielname === "address")
  {
    if (!basicDetails.address) {
      newErrors.basicDetails.address = 'Address is required';
    }
  }
  
    if(fielname === "" || fielname === "pincode")
{
    if (!basicDetails.pincode) {
      newErrors.basicDetails.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(basicDetails.pincode)) {
      newErrors.basicDetails.pincode = 'Pincode should be 6 digits and contain only numbers';
    }
  }
   
    if(fielname === "" || fielname === "state")
{
    if (!basicDetails.state) {
      newErrors.basicDetails.state = 'state is required';
    } else {
      if (/\d/.test(basicDetails.state)) {
        newErrors.basicDetails.state = 'State should contain charectes only';
      }
    }
  }
 
    if(fielname === "" || fielname === "xschoolName")
    {
    if (!xClassDetails.xschoolName) {
      newErrors.xClassDetails.xschoolName = 'School name is required';
    } else {
      if (!/^[a-zA-Z\s]+$/.test(xClassDetails.xschoolName)) {
        newErrors.xClassDetails.xschoolName = 'School name should not be number';
      }
    }}
   
    if(fielname === "" || fielname === "xboard")
    {
    if (!xClassDetails.xboard) {
      newErrors.xClassDetails.xboard = 'Board is required';
    } else {
      if (!/^[a-zA-Z\s]+$/.test(xClassDetails.xboard)) {
        newErrors.xClassDetails.xboard = 'Board should not be number';
      }
    }
  }
   
    if(fielname === "" || fielname === "xpercentage")
{
    if (!xClassDetails.xpercentage) {
      newErrors.xClassDetails.xpercentage = 'Percentage is required';
    } else {
      const percentageValue = xClassDetails.xpercentage;
      const validPercentageRegex = /^\d+(\.\d+)?$/;
      if (!validPercentageRegex.test(percentageValue) || parseFloat(percentageValue) < 0 || parseFloat(percentageValue) > 100) {
        newErrors.xClassDetails.xpercentage = 'Enter a valid percentage between 0 and 100 (only digits and period(.) are allowed)';
      }
    }
  }
   
    if(fielname === "" || fielname === "xPincode")
    {
    if (!xClassDetails.xPincode) {
      newErrors.xClassDetails.xPincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(xClassDetails.xPincode)) {
      newErrors.xClassDetails.xPincode = 'Pincode should be 6 digits and contain only numbers';
    }
  }
   if(fielname === "" || fielname === "xyearOfPassing")
{
if (!xClassDetails.xyearOfPassing) {
  newErrors.xClassDetails.xyearOfPassing = 'Year of passing is required';
} else {
  if (!/^\d{4}$/.test(xClassDetails.xyearOfPassing)) {
    newErrors.xClassDetails.xyearOfPassing = 'Year of passing should be a 4-digit number';
  } else {
    if (!/^\d+$/.test(xClassDetails.xyearOfPassing)) {
      newErrors.xClassDetails.xyearOfPassing = 'Year of passing should contain only digits';
    }
  }
}
}
    if(fielname === "" || fielname === "xCity")
{
if (!xClassDetails.xCity) {
  newErrors.xClassDetails.xCity = 'City is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(xClassDetails.xCity)) {
    newErrors.xClassDetails.xCity = 'City should not be number';
  }
}
}
if(fielname === "" || fielname === "xState")
{
if (!xClassDetails.xState) {
  newErrors.xClassDetails.xState = 'State is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(xClassDetails.xState)) {
    newErrors.xClassDetails.xState = 'State should not be number';
  }
}
}
   if(fielname === "" || fielname === "icollegeName")
{
if (!intermediateDetails.icollegeName) {
  newErrors.intermediateDetails.icollegeName = 'College name is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(intermediateDetails.icollegeName)) {
    newErrors.intermediateDetails.icollegeName = 'College name should not be number';
  }
}
}
if(fielname === "" || fielname === "iboard")
{
if (!intermediateDetails.iboard) {
  newErrors.intermediateDetails.iboard = 'Board name is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(intermediateDetails.iboard)) {
    newErrors.intermediateDetails.iboard = 'Board name should not be number only';
  }
}
}
if(fielname === "" || fielname === "iprogram")
{
if (!intermediateDetails.iprogram) {
  newErrors.intermediateDetails.iprogram = 'Program is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(intermediateDetails.iprogram)) {
    newErrors.intermediateDetails.iprogram = 'Program should contain text only';
  }
}
}  
    if(fielname === "" || fielname === "ipercentage")
{
    if (!intermediateDetails.ipercentage) {
      newErrors.intermediateDetails.ipercentage = 'Percentage is required';
    } else {
      const percentageValue = intermediateDetails.ipercentage;
      const validPercentageRegex = /^\d+(\.\d+)?$/;
      if (!validPercentageRegex.test(percentageValue) || parseFloat(percentageValue) < 0 || parseFloat(percentageValue) > 100) {
        newErrors.intermediateDetails.ipercentage = 'Enter a valid percentage between 0 (only digits and period(.) are allowed)';
      }
    }
  }

    if(fielname === "" || fielname === "iyearOdPassing")
{
    if (!intermediateDetails.iyearOfPassing) {
      newErrors.intermediateDetails.iyearOfPassing = 'Year of passing is required';
    } else {
      if (!/^\d{4}$/.test(intermediateDetails.iyearOfPassing)) {
        newErrors.intermediateDetails.iyearOfPassing = 'Year of passing should be a 4-digit number';
      } else {
        if (!/^\d+$/.test(intermediateDetails.iyearOfPassing)) {
          newErrors.intermediateDetails.iyearOfPassing = 'Year of passing should contain only digits';
        }
      }
    }
  }
if(fielname === "" || fielname === "iCity")
{
if (!intermediateDetails.iCity) {
  newErrors.intermediateDetails.iCity = 'City is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(intermediateDetails.iCity)) {
    newErrors.intermediateDetails.iCity = 'City should contain text only';
  }
}
}
    if(fielname === "" || fielname === "iState")
{
if (!intermediateDetails.iState) {
  newErrors.intermediateDetails.iState = 'State is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(intermediateDetails.iState)) {
    newErrors.intermediateDetails.iState = 'State should contain text only';
  }
}
}
    if(fielname === "" || fielname === "gcollegeName")
{
if (!graduationDetails.gcollegeName) {
  newErrors.graduationDetails.gcollegeName = 'College name is required';
} else {
  if (!/^[^\d]+$/.test(graduationDetails.gcollegeName)) {
    newErrors.graduationDetails.gcollegeName = 'College name should contain text only';
  }
}
}
    if(fielname === "" || fielname === "gboard")
{
if (!graduationDetails.gboard) {
  newErrors.graduationDetails.gboard = 'Board name is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(graduationDetails.gboard)) {
    newErrors.graduationDetails.gboard = 'Board name should contain text only';
  }
}
}
    if(fielname === "" || fielname === "gprogram")
{
if (!graduationDetails.gprogram) {
  newErrors.graduationDetails.gprogram = 'Program is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(graduationDetails.gprogram)) {
    newErrors.graduationDetails.gprogram = 'Program should contain text only';
  }
}
}
      if(fielname === "" || fielname === "gpercentage")
{
    if (!graduationDetails.gpercentage) {
      newErrors.graduationDetails.gpercentage = 'Percentage is required';
    } else {
      const percentageValue = graduationDetails.gpercentage;
      const validPercentageRegex = /^\d+(\.\d+)?$/;
      if (!validPercentageRegex.test(percentageValue) || parseFloat(percentageValue) < 0 || parseFloat(percentageValue) > 100) {
        newErrors.graduationDetails.gpercentage = 'Enter a valid percentage between 0 and 100 (only digits and period(.) are allowed)';
      }
    }
  }
   
    if(fielname === "" || fielname === "gyearOfPassing")
{
    if (!graduationDetails.gyearOfPassing) {
      newErrors.graduationDetails.gyearOfPassing = 'Year of passing is required';
    } else {
      if (!/^\d{4}$/.test(graduationDetails.gyearOfPassing)) {
        newErrors.graduationDetails.gyearOfPassing = 'Year of passing should be a 4-digit number';
      } else {
        if (!/^\d+$/.test(graduationDetails.gyearOfPassing)) {
          newErrors.graduationDetails.gyearOfPassing = 'Year of passing should contain only digits';
        }
      }
    }
  }
    if(fielname === "" || fielname === "gCity")
{
if (!graduationDetails.gCity) {
  newErrors.graduationDetails.gCity = 'City is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(graduationDetails.gCity)) {
    newErrors.graduationDetails.gCity = 'City should contain text only';
  }
}
}
if(fielname === "" || fielname === "gState")
{
if (!graduationDetails.gState) {
  newErrors.graduationDetails.gState = 'State is required';
} else {
  if (!/^[a-zA-Z\s]+$/.test(graduationDetails.gState)) {
    newErrors.graduationDetails.gState = 'State should contain text only';
  }
}
}
    skillsRequired.forEach((skill, index) => {
      if(fielname === "" || fielname === "skillName")
{
      if (skill==undefined || !skill.skillName) {     
        if(newErrors.skillsRequired[index]===undefined)
        newErrors.skillsRequired[index] =  {skillName:'',experience:''};
        newErrors.skillsRequired[index].skillName='Skill name is required';
      } else if (/^\d+$/.test(skill.skillName)) {
        if(newErrors.skillsRequired[index]===undefined)
  newErrors.skillsRequired[index] =  {skillName:'',experience:''};
          newErrors.skillsRequired[index].skillName='Skill name should not be a numeric'; 
      }
    }
      if(fielname === "" || fielname === "experience")
{
      if (!skill.experience) {
        if(newErrors.skillsRequired[index]===undefined)
  newErrors.skillsRequired[index] =  {skillName:'',experience:''};
        newErrors.skillsRequired[index].experience='Experience is required';
      } 
      else if (!/^\d+$/.test(skill.experience)) {
        if(newErrors.skillsRequired[index]===undefined)
  newErrors.skillsRequired[index] =  {skillName:'',experience:''};
        newErrors.skillsRequired[index].experience='Experience should be numeric' ;
      }
    }
    });
    setErrors(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).every(key => Object.keys(newErrors[key]).length === 0);
  };
  useEffect(() => {    
    const fetchData = async () => {
        try {
          const jwtToken = localStorage.getItem('jwtToken');
      console.log('jwt token new', jwtToken);
      const response = await axios.get(`${apiUrl}/applicantprofile/${user.id}/profile-view`, {       
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
          setApplicant(response.data.applicant);
          setBasicDetails(response.data.basicDetails);
             setXClassDetails(response.data.xClassDetails);
            setIntermediateDetails(response.data.intermediateDetails);
    setGraduationDetails(response.data.graduationDetails);
    setSkillsRequired(response.data.skillsRequired);
    setExperienceDetails(response.data.experienceDetails);
    setExperience(response.data.experience);
    setQualification(response.data.qualification);
    setSpecialization(response.data.specialization);
    setpreferredJobLocations(response.data.preferredJobLocations);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user profile data:', error);
          setLoading(false);
        }
      };
      fetchData();     
    }, []);
   const[applicant,setApplicant]=useState();
   const[experience,setExperience]=useState();
   const[qualification,setQualification]=useState();
   const[specialization,setSpecialization]=useState();
   const[preferredJobLocations,setpreferredJobLocations]=useState([]);
   const qualificationsOptions = [
    'B.Tech',
    'MCA',
    'Degree',
    'Intermediate',
    'Diploma',
  ];
  const handleQualificationChange = (e) => {
    const selectedQualification = e.target.value;
    setQualification(selectedQualification);
    setSpecialization('');
   
   
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
   const cities = [
    'Chennai',
    'Thiruvananthapuram',
    'Bangalore',
    'Hyderabad',
    'Coimbatore',
    'Kochi',
    'Madurai',
    'Mysore',
    'Thanjavur',
    'Pondicherry',
    'Vijayawada',
  ];
      const [basicDetails, setBasicDetails] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        alternatePhoneNumber: "",
      });
     const [xClassDetails, setXClassDetails] = useState({
        xschoolName: "",
        xboard: "",
        xpercentage: "",
        xyearOfPassing: "",
        xCity: "",
        xState: "",
        xPincode: "",
      });   
       const [intermediateDetails, setIntermediateDetails] = useState({
        icollegeName: "",
        iboard: "",
        iprogram: "",
        ipercentage: "",
        iyearOfPassing: "",
        iCity: "",
        iState: "",   
     });
    const [graduationDetails, setGraduationDetails] = useState({
           gcollegeName: "",
           gboard: "",
           gprogram: "",
           gpercentage: "",    
       gyearOfPassing: "",    
       gCity: "",    
       gState: "",    
     });
     const [skillsRequired, setSkillsRequired] = useState([ 
       { skillName: "", experience: "" },
     ]);
     const [experienceDetails, setExperienceDetails] = useState([
       {
         company: "",
         position: "",
         startDate: "",
         endDate: "",
       },
     ]); 
  const [dragging, setDragging] = useState(false);
   const [selectedSkill, setSelectedSkill] = useState("");
   const handleSkillChange = (e, index, field) => {
    const updatedSkillsRequired = [...skillsRequired];
        updatedSkillsRequired[index][field] = e.target.value;
 console.log('After Update:', updatedSkillsRequired);
     setSkillsRequired(updatedSkillsRequired); 
  };
  const addSkills = () => {
     setSkillsRequired([...skillsRequired, { skillName: "", experience: "" }]);
  };
  const removeSkills = () => {
        if (skillsRequired.length > 1) {
           const updatedSkills = [...skillsRequired.slice(0, -1)];   
      setSkillsRequired(updatedSkills);
    }
  };
  const handleExperienceChange = (e, index, field) => {
    const newExperienceDetails = [...experienceDetails];
    newExperienceDetails[index][field] = e.target.value;
    setExperienceDetails(newExperienceDetails);
  };
  const addExperience = () => {
    setExperienceDetails([
      ...experienceDetails,
      { company: "", position: "", startDate: "", endDate: "" }
    ]);
  };
  const removeExperience = (index) => {
    if(experienceDetails.length>1){
      const updatedExperienceDetails = [...experienceDetails];
      updatedExperienceDetails.splice(index, 1);
      setExperienceDetails(updatedExperienceDetails);
    }
  };

  const [resumeFile, setResumeFile] = useState(null);
  const [photoFile,setPhotoFile]=useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
  console.log("in handleSubmit")

    const formData={
      applicant:applicant,
      basicDetails: basicDetails,
      xClassDetails:xClassDetails,
      intermediateDetails: intermediateDetails ,
      graduationDetails: graduationDetails,
      skillsRequired: skillsRequired,
      experienceDetails: experienceDetails,
      experience,
      qualification,
      specialization,
      preferredJobLocations,
    }
   try { 
    const jwtToken = localStorage.getItem('jwtToken');
     console.log('jwt token new',jwtToken);  
     console.log('formData',formData,"userData",userData);
    const response = await axios.put(`${apiUrl}/applicantprofile/updateprofile/${user.id}`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`, 
      },
    });
     if (response.status === 200) {
      if (response.data === 'profile saved sucessfully') {
        console.log(response.body);
       
       
 setSnackbar({ open: true, message: 'Profile saved successfully', type: 'success' });
        navigate('/applicanthome');
      }  else {
        console.error('An unexpected success response:', response.body);
      }  
    }
    else {     
      console.error('An error occurred:', response.status, response.body);
    }
  } catch (error) {      
      navigate('/applicanthome');
    console.error('An error occurred:', error);
  }
};


const handleFileSelect = (e) => {
  const file = e.target.files[0];
  setPhotoFile(file);
};
const uploadPhoto = async () => {
  try {
    const jwtToken = localStorage.getItem('jwtToken');
    const formData = new FormData();
    formData.append('photo', photoFile); 
    const response = await axios.post(
      `${apiUrl}/applicant-image/${user.id}/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    console.log(response.data);
   
    setSnackbar({ open: true, message: response.data , type: 'success' });
    window.location.reload();
  } catch (error) {
    console.error('Error uploading photo:', error);
   
    setSnackbar({ open: true, message: 'Error in uploading Profile ', type: 'error' });
  }
};
const handleResumeSelect = (e) => {
  const file = e.target.files[0];
  setResumeFile(file);
};
const handleResumeUpload = async () => {
  try {
    const jwtToken = localStorage.getItem('jwtToken');
    const formData = new FormData();
    formData.append('resume', resumeFile);
    const response = await axios.post(
      `${apiUrl}/applicant-pdf/${user.id}/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    console.log(response.data);
   
   setSnackbar({ open: true, message: response.data , type: 'success' });
 
  } catch (error) {
    console.error('Error uploading resume:', error);

    setSnackbar({ open: true, message: 'Error uploading resume. Please try again.', type: 'error' });
  }
};

const handleCloseSnackbar = () => {
  setSnackbar({ open: false, message: '', type: '' });
};


  return (
    <div>
       {loading ? null : (
      <form className="profile-form-container" onSubmit={handleSubmit}>
<div className="dashboard__content">
  <section className="page-title-dashboard">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="title-dashboard">
          {/* <BackButton /> */}
            <div className="title-dash flex2"><BackButton />Edit Your Profile</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="flat-dashboard-setting flat-dashboard-setting2">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="profile-setting bg-white">




          <div class="author-profile flex2 border-bt">
          <div class="wrap-img flex2">
  <div id="upload-profile">
    <h5 class="fw-6">Upload your profile picture: </h5>
    <h6>JPG or PNG</h6>
    <input
      class="up-file"
      id="tf-upload-img"
      type="file"
      name="profile"
      required=""
      onChange={handleFileSelect}
    />
    <button
      type="button"
      onClick={uploadPhoto}
      className="btn-3"
      style={{
        backgroundColor: '#F97316',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginLeft:'5px',
        marginTop:'5px'
      }}
    >
      Upload Photo
    </button>
  </div>
</div>&nbsp;&nbsp;&nbsp;
<div class="wrap-img flex2">
  <div id="upload-profile">
    <h5 class="fw-6">Upload your resume: </h5>
    <h6>PDF only</h6>
    <input
      class="up-file"
      id="tf-upload-img"
      type="file"
      name="profile"
      required=""
      onChange={handleResumeSelect}
    />  
    <button
  type="button"
  onClick={handleResumeUpload}
  className="btn-3"
  style={{
    backgroundColor: '#F97316',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginLeft:'5px',
    marginTop:'5px'
  }}
>
  Upload Resume
</button>
  </div>
</div>
<div>
  </div>
</div>



                     <div className="form-infor-profile">
              <h3 className="title-info">Information</h3>
              <div className="form-infor flex flat-form">

                         


                <div className="info-box info-wd">
                <fieldset>
                <label class="title-user fw-7">Full Name <span className="color-red">*</span></label>
                  <input  type="text"
                          placeholder="Name Given at Registration"
                          className="input-form"
                          value={applicant.name}
                          onChange={(e) =>
                           setApplicant({...applicant,name: e.target.value,})}
                           onBlur={() => validateForm("name")}
                  />
                  <div className="validation-errors">
            {errors.applicant.name && (
              <div className="error-message">{errors.applicant.name}</div>
            )}
          </div>
          </fieldset>
          
        

                  <fieldset>
                  <label class="title-user fw-7">WhatsApp<span className="color-red">*</span></label>
                    <input
                           type="text"
                           placeholder="WhatsAppNumber"
                           className="input-form"
                           value={applicant.mobilenumber}
                           onChange={(e) =>
                           setApplicant({ ...applicant, mobilenumber: e.target.value })}
                           onBlur={() => validateForm("mobilenumber")}
              />
              <div className="validation-errors">
            {errors.applicant.mobilenumber && (
              <div className="error-message">{errors.applicant.mobilenumber}</div>
            )}
          </div>
                  </fieldset>             

                  <fieldset>
                  <label class="title-user fw-7">Qualification <span className="color-red">*</span></label>
                  <select
    value={qualification}
    className="input-form"
    onChange={handleQualificationChange}
    onBlur={() => validateForm("qualification")}
    style={{ color: qualification ? 'black' : 'lightgrey' }}
  >
    <option value="" disabled>*Qualification</option>
    {qualificationsOptions.map((qual) => (
      <option key={qual} value={qual}>
        {qual}
      </option>
    ))}
  </select>
                   <div className="validation-errors">
            {errors.applicant.qualification && (
              <div className="error-message">{errors.applicant.qualification}</div>
            )}
          </div>
                   
                  </fieldset>

                 

                  <div className="col-lg-6 col-md-12">
      <div id="item_3" className="dropdown titles-dropdown info-wd">
      <label class="title-user fw-7">Preferred Location(s) <span className="color-red">*</span></label>
      <Typeahead
  id="cityTypeahead"
  labelKey="city"  
  multiple
  placeholder="*Preferred Job Location(s)"
  options={cities.map(city => ({ city }))}
  onChange={(selectedCities) => setpreferredJobLocations(selectedCities)}
  selected={preferredJobLocations}
  inputProps={{
    className: 'input-form',
  }}
/>
        {errors.city && (
          <div className="error-message">{errors.city}</div>
        )}
      </div>
    </div> 

                  
                </div>
                <div className="info-box info-wd">

                <fieldset>
                  <label class="title-user fw-7">Date of Birth </label>
                    
                            <input
                             type="date"
                             placeholder="Date of Birth"
                             id="dateOfBirth"
                             className="input-form"
                            
                             value={basicDetails?.dateOfBirth || ''}
                            
                             onChange={(e) =>{
                            console.log(e.target.value);
                             setBasicDetails({...basicDetails,dateOfBirth: e.target.value,})}}
                             onBlur={() => validateForm("dateOfBirth")}                             
                       /> 
                       {errors.basicDetails.dateOfBirth && (
        <div className="error-message">{errors.basicDetails.dateOfBirth}</div>
    )}
                  </fieldset>

                <fieldset>
            <label className="title-user fw-7">
                    Email<span className="color-red">*</span>
                  </label> 
                  <input
                    type="text"
                    placeholder="Email"
                    value={applicant.email}
                    className="input-form"
                    onChange={(e) =>
                      setApplicant({...applicant,email: e.target.value,})}
                      onBlur={() => validateForm("email")}
                   
                    
                  />
                   {errors.applicant.email && (
              <div className="error-message">{errors.applicant.email}</div>
            )}
          </fieldset>

          <fieldset>
                  <label class="title-user fw-7">Specialization <span className="color-red">*</span></label>
                  <select
    value={specialization}
    className="input-form"
    onChange={(e) =>
    setSpecialization(e.target.value)}
    style={{ color: specialization ? 'black' : 'lightgrey' }}
    disabled={!qualification} 
  >
    <option value="" disabled>*Specialization</option>
    {specializationsByQualification[qualification]?.map((spec) => (
      <option key={spec} value={spec}>
        {spec}
      </option>
    ))}
  </select>
                  </fieldset>

          <fieldset>
                  <label class="title-user fw-7">Total Experience <span className="color-red">*</span></label>
                    <input
                        type="text"
                        placeholder="Overall Experience"
                        className="input-form"
                        value={experience || ''}
                        onChange={(e) => setExperience(e.target.value)}
                       
                   />
                   
                  </fieldset>
                </div>
               
              </div>
             </div>
             <div className="form-infor-profile">
              <h3 className="title-info">Education- X Class 
              
              </h3>
              <div className="form-infor flex flat-form">
                <div className="info-box info-wd">
                  <fieldset>
                  <input
 
                         type="text"
                          placeholder="School Name"
                          className="input-form"
                          value={xClassDetails?.xschoolName || ''}
                          onChange={(e) =>
                           setXClassDetails({...xClassDetails,xschoolName: e.target.value,})}
                           onBlur={() => validateForm("xschoolName")}
                  />
                  <div className="validation-errors">
            {errors.xClassDetails.xschoolName && (
              <div className="error-message">{errors.xClassDetails.xschoolName}</div>
            )}
          </div>
                  </fieldset>
                  <fieldset>
                    <input
                           type="text"
                           placeholder="Board"
                           className="input-form"
                           value={xClassDetails?.xboard || ''}
                           onChange={(e) =>
                           setXClassDetails({ ...xClassDetails, xboard: e.target.value })}
                           onBlur={() => validateForm("xboard")}
              />
              <div className="validation-errors">
            {errors.xClassDetails.xboard && (
              <div className="error-message">{errors.xClassDetails.xboard}</div>
            )}
          </div>
                  </fieldset>
                  <div id="item_date" className="dropdown titles-dropdown">
                    <input type="text"
                          placeholder="Percentage"
                          className="input-form"
                          value={xClassDetails?.xpercentage || ''}
                          onChange={(e) =>setXClassDetails({...xClassDetails,xpercentage: e.target.value,})}
                          onBlur={() => validateForm("xpercentage")}
                   />
                   <div className="validation-errors">
            {errors.xClassDetails.xpercentage && (
              <div className="error-message">{errors.xClassDetails.xpercentage}</div>
            )}
          </div>
                  </div>
                  <div id="item_date" className="dropdown titles-dropdown">
                  <input
                         type="text"
                         placeholder="Pincode"
                         className="input-form"
                         maxLength={6}
                         value={xClassDetails?.xPincode || ''}
                         onChange={(e) =>setXClassDetails({...xClassDetails,xPincode: e.target.value,})}
                         onBlur={() => validateForm("xPincode")}
                  />
                   <div className="validation-errors">
            {errors.xClassDetails.xPincode && (
              <div className="error-message">{errors.xClassDetails.xPincode}</div>
            )}
            </div>
                  </div>
                </div>
                <div className="info-box info-wd">
                  <fieldset>
                    <input
                           type="text"
                           placeholder="Year of passing"
                           className="input-form"
                           maxLength={4}
                           value={xClassDetails?.xyearOfPassing || ''}
                           onChange={(e) =>
                           setXClassDetails({...xClassDetails,xyearOfPassing: e.target.value,})}
                           onBlur={() => validateForm("xyearOfPassing")}
                  />
                   <div className="validation-errors">
            {errors.xClassDetails.xyearOfPassing && (
              <div className="error-message">{errors.xClassDetails.xyearOfPassing}</div>
            )}
            </div>
                  </fieldset>
                  <fieldset>
                  <input  type="text"
                          placeholder="City"
                          className="input-form"
                          value={xClassDetails?.xCity || ''}
                          onChange={(e) =>
                          setXClassDetails({ ...xClassDetails, xCity: e.target.value })}
                          onBlur={() => validateForm("xCity")}
                  />
                  <div className="validation-errors">
            {errors.xClassDetails.xCity && (
              <div className="error-message">{errors.xClassDetails.xCity}</div>
            )}
            </div>
                  </fieldset>
                  <div id="item_size" className="dropdown titles-dropdown ">
                  <input  type="text"
                          placeholder="State"
                          className="input-form"
                          value={xClassDetails?.xState || ''}
                          onChange={(e) =>
                          setXClassDetails({ ...xClassDetails, xState: e.target.value })}
                          onBlur={() => validateForm("xState")}
                   />
                   <div className="validation-errors">
            {errors.xClassDetails.xState && (
              <div className="error-message">{errors.xClassDetails.xState}</div>
            )}
            </div>
                  </div>
                </div> 
              </div>
             </div>
             <div className="form-infor-profile">
              <h3 className="title-info">Education- Inter/Diploma Details 
              {/* <span className="color-red">*</span> */}
              </h3>
              <div className="form-infor flex flat-form">
                <div className="info-box info-wd">
                  <fieldset>
                  <input
                         type="text"
                          placeholder="Name of college"
                          className="input-form"
                          value={intermediateDetails?.icollegeName || ''}
                          onChange={(e) =>
                            setIntermediateDetails({
                              ...intermediateDetails,
                              icollegeName: e.target.value,})} 
                              onBlur={() => validateForm("icollegeName")}
                  /> 
                  <div className="validation-errors">
            {errors.intermediateDetails.icollegeName && (
              <div className="error-message">{errors.intermediateDetails.icollegeName}</div>
            )}
          </div>
                  </fieldset>
                  <fieldset>
                    <input
                           type="text"
                           placeholder="Board"
                           className="input-form"
                           value={intermediateDetails?.iboard || ''}
                           onChange={(e) =>
                             setIntermediateDetails({...intermediateDetails,iboard: e.target.value,})}
                             onBlur={() => validateForm("iboard")}
                    />
                    <div className="validation-errors">
            {errors.intermediateDetails.iboard && (
              <div className="error-message">{errors.intermediateDetails.iboard}</div>
            )}
          </div>
                  </fieldset>
                  <div id="item_date" className="dropdown titles-dropdown">
                    <input type="text"
                          placeholder="Program"
                          className="input-form"
                          value={intermediateDetails?.iprogram || ''}
                          onChange={(e) =>
                            setIntermediateDetails({...intermediateDetails,iprogram: e.target.value,})
                            
                          }   
                          onBlur={() => validateForm("iprogram")}
                   />
                   <div className="validation-errors">
            {errors.intermediateDetails.iprogram && (
              <div className="error-message">{errors.intermediateDetails.iprogram}</div>
            )}
          </div>
                  </div>
                  <div id="item_date" className="dropdown titles-dropdown">
                  <input
                          type="text"
                          placeholder="Percentage"
                          className="input-form"
                          value={intermediateDetails?.ipercentage || ''}
                          onChange={(e) =>
                          setIntermediateDetails({...intermediateDetails,ipercentage: e.target.value,})}
                          onBlur={() => validateForm("ipercentage")}
                   />
                   <div className="validation-errors">
            {errors.intermediateDetails.ipercentage && (
              <div className="error-message">{errors.intermediateDetails.ipercentage}</div>
            )}
          </div>
                  </div>
                </div>
                <div className="info-box info-wd">
                  <fieldset>
                    <input
                           type="text"
                           placeholder="Year of passing"
                           className="input-form"
                           maxLength={4}
                           value={intermediateDetails?.iyearOfPassing || ''}
                           onChange={(e) =>
                            setIntermediateDetails({...intermediateDetails,iyearOfPassing: e.target.value,})}
                            onBlur={() => validateForm("iyearOfPassing")}
                  />
                  <div className="validation-errors">
            {errors.intermediateDetails.iyearOfPassing && (
              <div className="error-message">{errors.intermediateDetails.iyearOfPassing}</div>
            )}
          </div>
                  </fieldset>
                  <fieldset>
                  <input  type="text"
                          placeholder="City"
                          className="input-form"
                          value={intermediateDetails?.iCity || ''}
                          onChange={(e) =>
                            setIntermediateDetails({ ...intermediateDetails, iCity: e.target.value })}
                            onBlur={() => validateForm("iCity")}
                         
                  />
                  <div className="validation-errors">
            {errors.intermediateDetails.iCity && (
              <div className="error-message">{errors.intermediateDetails.iCity}</div>
            )}
          </div>
                  </fieldset>
                  <div id="item_size" className="dropdown titles-dropdown ">
                  <input  type="text"
                          placeholder="State"
                          className="input-form"
                          value={intermediateDetails?.iState || ''}
                          onChange={(e) =>
                            setIntermediateDetails({ ...intermediateDetails, iState: e.target.value })}
                            onBlur={() => validateForm("iState")}
                   />
                   <div className="validation-errors">
            {errors.intermediateDetails.iState && (
              <div className="error-message">{errors.intermediateDetails.iState}</div>
            )}
          </div>
                  </div>
                </div>
              </div>
             </div>
             <div className="form-infor-profile">
              <h3 className="title-info">Education- Graduation Details 
              
              </h3>
              <div className="form-infor flex flat-form">
                <div className="info-box info-wd">
                  <fieldset>
                  <input
                           type="text"
                           placeholder="Name of college"
                           className="input-form"
                           value={graduationDetails?.gcollegeName || ''}
                           onChange={(e) =>setGraduationDetails({...graduationDetails,gcollegeName: e.target.value,})}
                           onBlur={() => validateForm("gcollegeName")}
                  />
                   <div className="validation-errors">
            {errors.graduationDetails.gcollegeName && (
              <div className="error-message">{errors.graduationDetails.gcollegeName}</div>
            )}
          </div>
                  </fieldset>
                  <fieldset>
                    <input
                           type="text"
                           placeholder="University"
                           className="input-form"
                           value={graduationDetails?.gboard || ''}
                           onChange={(e) =>setGraduationDetails({...graduationDetails,gboard: e.target.value,})}
                           onBlur={() => validateForm("gboard")}
                    />
                    <div className="validation-errors">
            {errors.graduationDetails.gboard && (
              <div className="error-message">{errors.graduationDetails.gboard}</div>
            )}
          </div>
                  </fieldset>
                  <div id="item_date" className="dropdown titles-dropdown">
                    <input type="text"
                          placeholder="Program"
                          className="input-form"
                          value={graduationDetails?.gprogram || ''}
                          onChange={(e) =>setGraduationDetails({
                              ...graduationDetails,
                              gprogram: e.target.value,
                            })
                          }
                          onBlur={() => validateForm("gprogram")}
                   />
                   <div className="validation-errors">
            {errors.graduationDetails.gprogram && (
              <div className="error-message">{errors.graduationDetails.gprogram}</div>
            )}
          </div>
                  </div>
                  <div id="item_date" className="dropdown titles-dropdown">
                  <input
                          type="text"
                          placeholder="Percentage"
                          className="input-form"
                          value={graduationDetails?.gpercentage || ''}
                onChange={(e) =>setGraduationDetails({
                    ...graduationDetails,gpercentage: e.target.value,})}
                    onBlur={() => validateForm("gpercentage")}
                   />
                   <div className="validation-errors">
            {errors.graduationDetails.gpercentage && (
              <div className="error-message">{errors.graduationDetails.gpercentage}</div>
            )}
          </div>
                  </div>
                </div>
                <div className="info-box info-wd">
                  <fieldset>
                    <input
                           type="text"
                           placeholder="Year of passing"
                           className="input-form"
                           value={graduationDetails?.gyearOfPassing || ''}
                           onChange={(e) =>setGraduationDetails({...graduationDetails,gyearOfPassing: e.target.value,})}
                           onBlur={() => validateForm("gyearOfPassing")}
                  />
                  <div className="validation-errors">
            {errors.graduationDetails.gyearOfPassing && (
              <div className="error-message">{errors.graduationDetails.gyearOfPassing}</div>
            )}
          </div>
                  </fieldset>
                  <fieldset>
                  <input  type="text"
                          placeholder="City"
                          className="input-form"
                          value={graduationDetails?.gCity || ''}
                          onChange={(e) =>
                            setGraduationDetails({...graduationDetails,gCity: e.target.value,})}
                            onBlur={() => validateForm("gCity")}
                  />
                  <div className="validation-errors">
            {errors.graduationDetails.gCity && (
              <div className="error-message">{errors.graduationDetails.gCity}</div>
            )}
          </div>
                  </fieldset>
                  <div id="item_size" className="dropdown titles-dropdown ">
                  <input  type="text"
                          placeholder="State"
                          className="input-form"
                          value={graduationDetails?.gState || ''}
                          onChange={(e) =>setGraduationDetails({...graduationDetails,gState: e.target.value,})}
                          onBlur={() => validateForm("gState")}
                   />
                   <div className="validation-errors">
            {errors.graduationDetails.gState && (
              <div className="error-message">{errors.graduationDetails.gState}</div>
            )}
          </div>
                  </div>
                </div>
               
              </div>
             </div>
 
    <div className="contact-wrap info-wd">
      <h3>Experience & Skills</h3>
      <div className="form-social form-wg flex flat-form">
        <div className="form-box  wg-box">
          <div id="item_category2" className="dropdown titles-dropdow">
            <label className="title-user color-1 fw-7">Experience</label>
            {experienceDetails && experienceDetails.map((experience, index) => (
              <div key={index}>
                <fieldset>
                  <label className="title-user color-1 fw-7">Company Name</label>
                  <input
                    type="text"
                    className="input-form"
                    placeholder="ABC Pvt Ltd"
                    value={experience?.company || ''}
                    onChange={(e) => handleExperienceChange(e, index, "company")}
                  />
                </fieldset>
                <fieldset>
                  <label className="title-user color-1 fw-7">Position</label>
                  <input
                    type="text"
                    className="input-form"
                    placeholder="Java Developer"
                    value={experience?.position || ''}
                    onChange={(e) => handleExperienceChange(e, index, "position")}
                  />
                </fieldset>
                <div id="item_date" className="dropdown titles-dropdown">
                  <label className="title-user color-1 fw-7" htmlFor={`startDate-${index}`}>Start Date</label>
                  <input
                    type="date"
                    className="input-form"
                    id={`startDate-${index}`}
                    value={experience?.startDate || ''}
                    onChange={(e) => handleExperienceChange(e, index, "startDate")}
                  />
                </div>
                <div id="item_date" className="dropdown titles-dropdown">
                  <label className="title-user color-1 fw-7" htmlFor={`endDate-${index}`}>End Date</label>
                  <input
                    type="date"
                    className="input-form"
                    id={`endDate-${index}`}
                    value={experience?.endDate || ''}
                    onChange={(e) => handleExperienceChange(e, index, "endDate")}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addExperience} style={{ color: '#FFFFFF', backgroundColor: '#1967d2' }}>
              +
            </button>
            {experienceDetails && experienceDetails.length > 0 && (
          <button type="button" onClick={() => removeExperience(experienceDetails.length - 1)} style={{ color: '#FFFFFF', backgroundColor: '#FF0000' }}>
            -
          </button>
        )}
          </div>
        </div>
        <div className="form-box  wg-box">
  <fieldset className="">
    <label className="title-user fw-7">Skills</label>
    {skillsRequired && skillsRequired.length > 0 ? ( 
      skillsRequired.map((skill, index) => (
        <div key={index} className="experience-table">
                <div>
                  <label className="title-user fw-7">Your Skill</label>
                  <input
                    type="text"
                    placeholder="Java"
                    className="input-form"
                    value={skill.skillName}
                    onChange={(e) => handleSkillChange(e, index, "skillName")}
                    onBlur={() => validateForm("skillName")}
                  />
                  {errors.skillsRequired[index]?.skillName && (
                    <div className="error-message">{errors.skillsRequired[index].skillName}</div>
                  )}
                </div>
                <div>
                  <label className="title-user fw-7">Your Experience</label>
                  <input
                    type="text"
                    placeholder="5"
                    className="input-form"
                    value={skill.experience}
                    onChange={(e) => handleSkillChange(e, index, "experience")}
                    onBlur={() => validateForm("experience")}
                  />
                  {errors.skillsRequired[index]?.experience && (
                    <div className="error-message">{errors.skillsRequired[index].experience}</div>
                  )}
                </div>
                {index === skillsRequired.length - 1 && (
                  <button type="button" onClick={addSkills} className="btn-3" style={{ color: '#FFFFFF', backgroundColor: '#1967d2' }}>
                    +
                  </button>
                )}
                {index === skillsRequired.length - 1 && (
                  <button type="button" onClick={removeSkills} style={{ color: '#FFFFFF', backgroundColor: '#FF0000' }}>
                    -
                  </button>
                )}
        </div>
      ))
    ) : (
      <div className="experience-table">
        <div>
          <label className="title-user fw-7">Your Skill</label>
          <input
            type="text"
            placeholder="Java"
            className="input-form"
            value=""
            onChange={(e) => handleSkillChange(e, 0, "skillName")}
            onBlur={() => validateForm("skillName")}
          />
          {errors.skillsRequired[0]?.skillName && (
            <div className="error-message">{errors.skillsRequired[0].skillName}</div>
          )}
        </div>
        <div>
          <label className="title-user fw-7">Your Experience</label>
          <input
            type="text"
            placeholder="5"
            className="input-form"
            value=""
            onChange={(e) => handleSkillChange(e, 0, "experience")}
            onBlur={() => validateForm("experience")}
          />
          {errors.skillsRequired[0]?.experience && (
            <div className="error-message">{errors.skillsRequired[0].experience}</div>
          )}
        </div>
      </div>
    )}
  </fieldset>
</div>
      </div>
    </div>
                <div className="tt-button button-style">
              </div>
                <div>
                  <button type="submit" className='button-status'>Update Profile</button>
</div>
    </div>
    </div>
    </div>
    </div>
    </section>
    </div>
    </form>
    )
  }
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

export default ApplicantEditProfile;