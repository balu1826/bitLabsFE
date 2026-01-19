import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { apiUrl } from '../../services/ApplicantAPIService';
import Snackbar from '../common/Snackbar';

Modal.setAppElement('#root'); 

const UploadImageComponent = ({ id}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [snackbars, setSnackbars] = useState([]);  
 const [fileName, setFileName] = useState('');
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension === 'jpeg' || fileExtension === 'jpg' || fileExtension === 'png') {
    if (file.size < 5 * 1024 * 1024) {
      setPhotoFile(file);
      setFileName(file.name); // <-- Add this
      setError('');
    } else {
      setError('File size must be less than 5 MB.');
      setPhotoFile(null);
      setFileName('');
    }
 } else {
    setError('Only JPEG and PNG files are allowed.');
    setPhotoFile(null);
    setFileName('');
  }
};

  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };

  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };

  const uploadPhoto = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.post(
        `${apiUrl}/applicant-image/${id}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      console.log('Photo uploaded successfully:', response.data);
      
      addSnackbar({ message: 'Photo uploaded successfully', type: 'success' });
      window.location.reload();
  

    } catch (error) {
      console.error('Error uploading photo:', error);
      
    }
  };

  return (
 <div id="upload-profile" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
  <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
    Upload your profile picture: <span style={{ fontWeight: '400' }}>JPG or PNG</span>
  </div>

  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    padding: '2px 12px',
    marginBottom: '18px',
    border: '1px solid #D1D5DB',
    position: 'relative'
  }}>
    <input
      type="file"
      id="profile-upload"
      accept="image/jpeg, image/png"
      onChange={handleFileSelect}
      style={{ display: 'none' }}
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>

    <input
      type="text"
      value={fileName}
      readOnly
      placeholder="No file chosen"
      style={{
        flex: 1,
        padding: '1px 1px 1px 36px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        color: fileName ? '#3B82F6' : '#9CA3AF',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '13px',
        fontWeight: 500,
        lineHeight: '10px',
        outline: 'none',
        minWidth: '280px'
      }}
    />
    <label
      htmlFor="profile-upload"
      style={{
        backgroundColor: '#6B7280', // Changed to gray
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        whiteSpace: 'nowrap'
      }}
    >
      Choose File
    </label>
  </div>
<button
  type="button"
  onClick={uploadPhoto}
  disabled={!photoFile}
  style={{
    backgroundColor: photoFile ? '#FB923C' : '#E5E7EB',
    color: photoFile ? '#fff' : '#9CA3AF',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: photoFile ? 'pointer' : 'not-allowed',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '8px',
    float: 'right',
    textTransform: 'none'  // Added to ensure normal casing
  }}
>
  Upload Photo
</button>


  {error && (
    <div style={{ marginTop: '8px', color: 'red', fontSize: '13px', fontWeight: '500' }}>
      {error}
    </div>
  )}

  {snackbars.map((snackbar, index) => (
    <Snackbar
      key={index}
      index={index}
      message={snackbar.message}
      type={snackbar.type}
      onClose={() => {
        const newList = [...snackbars];
        newList.splice(index, 1);
        setSnackbars(newList);
      }}
      link={snackbar.link}
      linkText={snackbar.linkText}
    />
  ))}
</div>

  );
};

export default UploadImageComponent;
