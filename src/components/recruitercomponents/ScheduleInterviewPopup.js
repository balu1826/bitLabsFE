import React, { useState } from "react";
import axios from "axios";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { Modal, Form } from "react-bootstrap";
 
 
const ScheduleInterviewPopup = ({ show, handleClose, handleAddTeamMember, applyjobid }) => {
  const [validationError, setValidationError] = useState({
    interviewTitle: '',
    interviewPerson: '',
    typeOfInterview: '',
    round: '',
    timeAndDate: '',
    modeOfInterview: '',
    location: '',
    interviewLink: '',
  });
 
 
  const [touchedFields, setTouchedFields] = useState({
    interviewTitle: false,
    interviewPerson: false,
    typeOfInterview: false,
    round: false,
    timeAndDate: false,
    modeOfInterview: false,
    location: false,
    interviewLink: false,
  });
 
 
  const user1 = useUserContext();
  const user = user1.user;
 
 
  const [interviewData, setInterviewData] = useState({
    interviewTitle: '',
    interviewPerson: '',
    typeOfInterview: '',
    round: '',
    timeAndDate: '',
    modeOfInterview: '',
    location: '',
    interviewLink: '',
  });
 
 
  const resetForm = () => {
    setValidationError({
      interviewTitle: '',
      interviewPerson: '',
      typeOfInterview: '',
      round: '',
      timeAndDate: '',
      modeOfInterview: '',
      location: '',
      interviewLink: '',
    });
 
 
    setTouchedFields({
      interviewTitle: false,
      interviewPerson: false,
      typeOfInterview: false,
      round: false,
      timeAndDate: false,
      modeOfInterview: false,
      location: false,
      interviewLink: false,
    });
 
 
    setInterviewData({
      interviewTitle: '',
      interviewPerson: '',
      typeOfInterview: '',
      round: '',
      timeAndDate: '',
      modeOfInterview: '',
      location: '',
      interviewLink: '',
    });
   
    handleClose();
  };
 
 
  const handleFormChange = (e) => {
    const { name, value } = e.target;
 
 
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [name]: true,
    }));
 
 
    switch (name) {
      case 'interviewTitle':
        const isValidTitle = /^[a-zA-Z\s]*$/.test(value);
        setValidationError((prevErrors) => ({
          ...prevErrors,
          interviewTitle: isValidTitle ? '' : 'Interview title should have only alphabetical characters.',
          ...(value.trim() ? {} : { interviewTitle: 'Field cannot be empty.' }),
        }));
        break;
 
 
      case 'interviewPerson':
        const isValidPerson = /^[a-zA-Z\s]*$/.test(value);
        setValidationError((prevErrors) => ({
          ...prevErrors,
          interviewPerson: isValidPerson ? '' : 'The name should have only alphabetical characters.',
          ...(value.trim() ? {} : { interviewPerson: 'Field cannot be empty.' }),
        }));
        break;
 
 
      case 'timeAndDate':
        const currentDate = new Date();
        const selectedDate = new Date(value);
 
 
        if (touchedFields[name] && !value.trim()) {
          setValidationError((prevErrors) => ({
            ...prevErrors,
            timeAndDate: 'Please select a date and time for the interview.',
          }));
        } else if (selectedDate <= currentDate) {
          setValidationError((prevErrors) => ({
            ...prevErrors,
            timeAndDate: 'Please select future date and time.',
          }));
        } else {
          setValidationError((prevErrors) => ({
            ...prevErrors,
            timeAndDate: '',
          }));
        }
        break;
 
 
      case 'interviewLink':
        const isValidURL = /^(ftp|http|https):\/\/[^ "]+$/.test(value);
        setValidationError((prevErrors) => ({
          ...prevErrors,
          interviewLink: isValidURL ? '' : 'Please enter a valid interview link.',
          ...(value.trim() ? {} : { interviewTitle: 'Field cannot be empty.' }),
        }));
        break;
 
 
      case 'location':
        if (touchedFields[name] && !value.trim()) {
          setValidationError((prevErrors) => ({
            ...prevErrors,
            location: 'Field cannot be empty.',
          }));
        } else {
          const containsOnlyAlphabet = /^[a-zA-Z\s]*$/.test(value);
          setValidationError((prevErrors) => ({
            ...prevErrors,
            location: containsOnlyAlphabet ? '' : 'Location should have only alphabetical characters.',
          }));
        }
        break;
 
       
      case 'modeOfInterview':
        setValidationError((prevErrors) => ({
          ...prevErrors,
          modeOfInterview: value.trim() ? '' : 'Please select a mode of interview.',
         
        }));
        break;
     
      default:
        setValidationError((prevErrors) => ({
          ...prevErrors,
          [name]: value.trim() ? '' : 'This field cannot be empty.',
        }));
        break;
    }
 
 
    setInterviewData({
      ...interviewData,
      [name]: value,
    });
  };
 
 
  const handleFormSubmit = (e) => {
    e.preventDefault();
 
 
    const updatedValidationErrors = {};
    for (const name in interviewData) {
      const value = interviewData[name];
      switch (name) {
        case 'interviewTitle':
          const isValidTitle = /^[a-zA-Z\s]*$/.test(value);
          updatedValidationErrors[name] = isValidTitle ? '' : 'Interview title should have only alphabetical characters.';
          if (!value.trim()) {
            updatedValidationErrors[name] = 'Field cannot be empty.';
          }
          break;
 
 
        case 'interviewPerson':
          const isValidPerson = /^[a-zA-Z\s]*$/.test(value);
          updatedValidationErrors[name] = isValidPerson ? '' : 'The name should have only alphabetical characters.';
          if (!value.trim()) {
            updatedValidationErrors[name] = 'Field cannot be empty.';
          }
          break;
 
 
        case 'timeAndDate':
          const currentDate = new Date();
          const selectedDate = new Date(value);
 
 
          if (!value.trim()) {
          
            updatedValidationErrors[name] = 'Field cannot be empty.';
          } else if (selectedDate <= currentDate) {
          
            updatedValidationErrors[name] = 'Please select a future date and time.';
          } else {
            updatedValidationErrors[name] = '';
          }
          break;
 
 
        case 'interviewLink':
          const isValidURL = /^(ftp|http|https):\/\/[^ "]+$/.test(value);
          updatedValidationErrors[name] = isValidURL ? '' : 'Please enter a valid interview link.';
          if (!value.trim()) {
            updatedValidationErrors[name] = 'Field cannot be empty.';
          }
          break;
 
 
        case 'typeOfInterview':
          if (!value.trim()) {
            updatedValidationErrors[name] = 'Field cannot be empty.';
          } else {
            const containsOnlyAlphabet = /^[a-zA-Z\s]*$/.test(value);
            updatedValidationErrors[name] = containsOnlyAlphabet ? '' : 'Type of Interview should have only alphabetical characters.';
          }
          break;
 
 
        case 'modeOfInterview':
          
          updatedValidationErrors[name] = value.trim() ? '' : 'Field cannot be empty.';
          break;
 
 
        case 'location':
          if (!value.trim()) {
            updatedValidationErrors[name] = 'Field cannot be empty.';
          } else {
            const containsOnlyAlphabet = /^[a-zA-Z\s]*$/.test(value);
            updatedValidationErrors[name] = containsOnlyAlphabet ? '' : 'Location should have only alphabetical characters.';
          }
          break;
 
 
 
 
        default:
          updatedValidationErrors[name] = value.trim() ? '' : 'This field cannot be empty.';
          break;
      }
    }
 
 
    setValidationError(updatedValidationErrors);
 
 
    const hasEmptyFields = Object.values(updatedValidationErrors).some((error) => error);
 
 
    if (hasEmptyFields) {
      console.log('Form submission aborted due to validation errors.');
      setTouchedFields((prevTouchedFields) => ({
        ...prevTouchedFields,
            }));
          return;
    }
 
 
    const jwtToken = localStorage.getItem('jwtToken');
    const headers = {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    };
 
 
    axios
      .post(`${apiUrl}/applyjob/scheduleInterview/${applyjobid}`, interviewData, { headers })
      .then((response) => {
        console.log('API Response:', response.data);
        window.alert('Interview schedule has been done');
        handleClose();
      })
      .catch((error) => {
        console.error('API Error:', error);
      });
  };
 
 
  const handleCloseModal = () => {
    resetForm();
    handleClose();
  };
 
 
  return (
<div>
<Modal show={show} onHide={handleCloseModal} centered backdrop="static">

<Modal.Header closeButton>
<Modal.Title style={{ color: 'blue' }}>Schedule Interview</Modal.Title>
</Modal.Header>
<Modal.Body>
<Form onSubmit={handleFormSubmit}> 
  <div className="row">
    <div className="col-lg-12">
    <div>
    <label>Interview Title<span style={{ color: 'red' }}>*</span></label>
    <input
      type="text"
      name="interviewTitle"
      value={interviewData.interviewTitle}
      onChange={handleFormChange}
      placeholder="Enter interview title"
      className="custom-input"
    />
    {validationError.interviewTitle && (
      <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
        {validationError.interviewTitle}
      </div>
    )}
  </div>
    </div>
    <div className="col-lg-6">
    <div>
        <label>Interview Person<span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          name="interviewPerson"
          value={interviewData.interviewPerson}
          onChange={handleFormChange}
          placeholder="Enter interview person"
          className="custom-input"
        />
        {validationError.interviewPerson && (
          <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
            {validationError.interviewPerson}
          </div>
        )}
      </div>
    </div>
    <div className="col-lg-6">
    <div>
        <label>Type of Interview<span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          name="typeOfInterview"
          value={interviewData.typeOfInterview}
          onChange={handleFormChange}
          placeholder="Enter type of interview"
          className="custom-input"
        />
        {validationError.typeOfInterview && (
          <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
            {validationError.typeOfInterview}
          </div>
        )}
      </div>
    </div>
    <div className="col-lg-6">
    <div>
        <label>Round</label>
        <select
          name="round"
          value={interviewData.round}
          onChange={handleFormChange}
          className="custom-input"
        >
          <option value="">Select Round</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>
    </div>
    <div className="col-lg-6">
    <div>
        <label>Time and Date<span style={{ color: 'red' }}>*</span></label>
        <input
          type="datetime-local"
          name="timeAndDate"
          value={interviewData.timeAndDate}
          onChange={handleFormChange}
          className="custom-input"
        />
        {validationError.timeAndDate && (
          <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
            {validationError.timeAndDate}
          </div>
        )}
      </div>
    </div>
    <div className="col-lg-6">
    <div>
        <label>Mode of Interview<span style={{ color: 'red' }}>*</span></label>
        <select
          name="modeOfInterview"
          value={interviewData.modeOfInterview}
          onChange={handleFormChange}
          className="custom-input"
        >
          <option value="">Select</option>
          <option value="Online">Online</option>
          <option value="Face-to-Face">Face-to-Face</option>
        </select>
        {validationError.modeOfInterview && (
          <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
            {validationError.modeOfInterview}
          </div>
        )}
      </div>
    </div>
    <div className="col-lg-6">
    <div>
        <label>Location<span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          name="location"
          value={interviewData.location}
          onChange={handleFormChange}
          placeholder="Enter interview location"
          className="custom-input"
        />
        {validationError.location && (
          <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
            {validationError.location}
          </div>
        )}
      </div>
    </div>
    <div className="col-lg-12">
    <div>
      <label>Interview Link<span style={{ color: 'red' }}>*</span></label>
      <input
        type="text"
        name="interviewLink"
        value={interviewData.interviewLink}
        onChange={handleFormChange}
        placeholder="Enter interview link"
        className={`custom-input ${validationError.interviewLink && touchedFields.interviewLink ? 'error' : ''}`}
      />
      {validationError.interviewLink && (
        <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>
          {validationError.interviewLink}
        </div>
      )}
      </div>
    </div>
  </div>
 
 
<div className="modal-footer">
<button type="submit" style={{ color: 'white', backgroundColor: 'blue' }}>Schedule</button>
 
 
              <button type="button" onClick={handleCloseModal}>
                Close
</button>

</div>
</Form>
</Modal.Body>
</Modal>
</div>
  );
 
 
};
 
 
export default ScheduleInterviewPopup;