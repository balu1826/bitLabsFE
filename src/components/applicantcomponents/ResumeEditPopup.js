import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useUserContext } from '../common/UserProvider';
import ModalWrapper from './ModalWrapper';
import ResumeBuilder from './ResumeBuilder';
import { apiUrl } from '../../services/ApplicantAPIService';
import Snackbar from '../common/Snackbar';

Modal.setAppElement('#root'); 

const ResumeEditPopup = ({ id, resumeFileName }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState(resumeFileName || ''); 
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbars, setSnackbars] = useState([]);
  const { user } = useUserContext();

  const openModal = () => setIsModalOpen(true);
 const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload(); 
  };

  const handleInputChange = (event) => {
    setFileName(event.target.value);
  };

  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed.');
        setResumeFile(null);
        setFileName(''); 
      } else if (file.size > 5*1024*1024) { 
        setError('File size should be less than 5MB.');
        setResumeFile(null);
        setFileName(''); 
      } else {
        setResumeFile(file);
        setFileName(file.name); 
        setError('');
      }
    } else {
      setError('Please select a file.');
      setResumeFile(null);
      setFileName(''); 
    }
  };
  const triggerFileInputClick = () => {
    document.getElementById('tf-upload-resume').click();
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
     
      addSnackbar({ message: response.data, type: 'success' });
      window.location.reload();
    } catch (error) {
      console.error('Error uploading resume:', error);
     
      addSnackbar({ message: 'Error uploading resume. Please try again.', type: 'error' });
    }
  };

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };
 
 
  return (
    <div id="upload-resume-editprofile"
    style={{marginBottom: "20px"}}>
      <div className="popup-heading-editprofile1">Resume</div>
      <div className="file-upload">
        <input
          className="up-file"
          id="tf-upload-resume"
          type="file"
          name="resume"
          accept="application/pdf"
          required=""
          onChange={handleResumeSelect}
        />
               
      </div>
      <div className="row row-editprofile">
 
  <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
  <i
      style={{
        position: 'absolute',
        left: '30px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
<path d="M13.75 2H6.75C6.21957 2 5.71086 2.21071 5.33579 2.58579C4.96071 2.96086 4.75 3.46957 4.75 4V20C4.75 20.5304 4.96071 21.0391 5.33579 21.4142C5.71086 21.7893 6.21957 22 6.75 22H18.75C19.2804 22 19.7891 21.7893 20.1642 21.4142C20.5393 21.0391 20.75 20.5304 20.75 20V9L13.75 2Z" stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.75 2V9H20.75" stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    </i>
 
 
    <input
      type="text"
      value={fileName}
      readOnly
 
      onChange={handleInputChange}
      style={{
        paddingRight: '80px', // Adjust based on the button width
        width: '100%',
        padding: '10px',
        paddingLeft: '50px', // Adjust based on the icon width
        borderRadius: '4px',
        border: '1px solid #ccc',
        color: "#0E8CFF", // assuming var(--link, #0E8CFF)
        boxSizing: "border-box",
        borderRadius: "8px",
        border: "1px solid #E5E5E5",
        background: "#F5F5F5",
        textAlign: "left",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: "15px",
        fontStyle: "normal",
        fontWeight: 500,
        lineHeight: "15px",
      }}
      placeholder="No file selected"
    />
    <button
      type="button"
      onClick={triggerFileInputClick}
      className="browse-btn-resume  "
 
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '5px 10px',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '4px'
      }}
    >
      Browse
    </button>
  </div>

      </div>
      <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
      {error && <div className="error-message">{error}</div>}
      <div className="save-resume">
        <button
          type="button"
          onClick={handleResumeUpload}
          className="save-btn-resume"
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

export default ResumeEditPopup;
