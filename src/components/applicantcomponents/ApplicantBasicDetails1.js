import React, { useState,useEffect } from 'react';
import axios from 'axios';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { ClipLoader } from 'react-spinners';
import './ApplicantBasicDetails.css';
import BackButton from '../common/BackButton';
 
 
const ApplicantBasicDetails1 = () => {
 
 
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [loginUrl, setLoginUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setLoading(false);
  }, []);

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
            `${apiUrl}/resume/upload/${user.id}
            
            `,
            formData,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
          console.log(response.data);
          window.alert(response.data);
          window.location.reload();
        } catch (error) {
          console.error('Error uploading resume:', error);
          window.alert('Error uploading resume. Please try again.');
        }
      };
      const handleResumeBuilder = async () => {
        const apiUrl1 = 'https://rb.chalowithcharan.com:5173/api/auth/login';
 
    
    if (requestData) {
     
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
         
        },
        body: JSON.stringify(requestData)
      };
 
      
      fetch(apiUrl1, requestOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const loginUrl = `https://rb.chalowithcharan.com:5173/auth/login?identifier=${encodeURIComponent(requestData.identifier)}&password=${encodeURIComponent(requestData.password)}`;
          setLoginUrl(loginUrl);
          window.open(loginUrl, '_blank');
        })
        .catch(error => {
          
          console.error('There was a problem with the fetch operation:', error);
        });
    }
      };

 useEffect(() => {
        const fetchData = async () => {
          try {
            
            const response = await axios.get(`${apiUrl}/applicant/getApplicantById/${user.id}`);
   
          
            const newData = {
              identifier: response.data.email,
              password: response.data.password
            };
   
            setRequestData(newData);
          } catch (error) {
            console.error('Error updating profile status:', error);
          }
        };
        fetchData();
      }, []); 
     
     
 
  return (
   
    <div>
      {loading && (
      <div className="loading-spinner">
        <ClipLoader color="#1967d2" size={50} />
      </div>
    )}
       <div className="dashboard__content">
  <section className="page-title-dashboard">
    <div className="themes-container">
      <div className="row">
        <div className="col-lg-12 col-md-12 ">
          <div className="title-dashboard">
          <BackButton />
            <div className="title-dash flex2">Resume Section</div>
          </div>
        </div>
      </div>
     
    </div>
   
  </section>
  <form >
  <section className="flat-dashboard-post flat-dashboard-setting">
 
    <div className="themes-container">
      <div className="row">
 
        <div className="col-lg-12 col-md-12 ">
          <div className="post-new profile-setting bg-white">
 
          <div class="wrap-img flex2" style={{ position: 'relative' }}>
 
          <div id="upload-profile" style={{ display: 'flex', alignItems: 'center' }}>
      <input
        className="up-file"
        id="tf-upload-img"
        type="file"
        name="profile"
        required
        onChange={handleResumeSelect}
        style={{ marginRight: '5px' }}
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
          marginLeft: '5px',
          marginTop: '5px',
        }}
      >
        Upload Resume
      </button>
      {selectedFile && (
        <p>Selected file: {selectedFile.name}</p>
      )}
    </div>
</div>
<br/>
<p style={{ marginRight: '5px' }}>Or</p>
<br/>
<div id="item_2" className="col-lg-6 col-md-12" style={{ display: 'flex', alignItems: 'center' }}>

 <button
   type="button"
   onClick={handleResumeBuilder}
   className="btn-3"
   style={{
     backgroundColor: '#F97316',
     color: 'white',
     padding: '10px 15px',
     border: 'none',
     borderRadius: '8px',
     cursor: 'pointer',
     marginTop: '5px' 
   }}
 >
   Build Your Resume
 </button>
</div>

          </div>
        </div>
      </div>
    </div>
  </section>
  </form>
</div>
</div>
  )
};
export default ApplicantBasicDetails1;