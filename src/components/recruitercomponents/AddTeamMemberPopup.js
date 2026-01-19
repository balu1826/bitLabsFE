import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { FiEye, FiEyeOff } from 'react-icons/fi'; 


const AddTeamMemberPopup = ({ show, handleClose, handleAddTeamMember, userId }) => {
  const user = useUserContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const initialFormData = {
    name: '',
    email: '',
    password: '',
    role: '',
  };

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

   
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    switch (true) {
      case !formData.name.trim():
        errors.name = "Name cannot be empty.";
        break;
      case !/^[A-Za-z]+$/.test(formData.name.trim()):
        errors.name = "Please enter only letters in the Name field.";
        break;
    }
    switch (true) {
      case !formData.email.trim():
        errors.email = "Email cannot be empty.";
        break;
      case !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()):
        errors.email = "Please enter a valid email address.";
        break;
    }
    switch (true) {
      case formData.password.trim().length < 6:
        errors.password = "Password must be at least 6 characters long.";
        break;
    }
    switch (true) {
      case !formData.role.trim():
        errors.role = "Role cannot be empty.";
        break;
      case !/^[A-Za-z]+$/.test(formData.role.trim()):
        errors.role = "Please Select your Role.";
        break;
    }
    setValidationErrors(errors);
    return errors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }
    const jwtToken = localStorage.getItem('jwtToken');
    const headers = {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    };

    axios
      .post(`${apiUrl}/team/add/${userId}/team-members`, formData, { headers })
      .then((response) => {
        console.log('API Response:', response.data);
        window.alert('Team member added successfully');
        window.location.reload();
        resetForm();
        setTimeout(() => {
          handleClose();
        }, 1000);
      })
      .catch((error) => {
        console.error('API Error:', error);
      });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setValidationErrors({
      name: '',
      email: '',
      password: '',
      role: '',
    });
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: 'blue' }}>Add Team Member</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: '5px' }}>
            <label htmlFor="name" style={{ marginRight: '30px' }}>Name<span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Name"
              style={{ width: '385px' }}
            />
          </div>
          {validationErrors.name && (
            <div style={{ color: "red", fontSize: "0.8rem", marginTop: "-7px", marginBottom: "15px" }}>
              {validationErrors.name}
            </div>
          )}
          <div style={{ marginBottom: '5px' }}>
            <label htmlFor="email" style={{ marginRight: '33px' }}>Email<span style={{ color: 'red' }}>*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter Email"
              style={{ width: '385px' }}
            />
          </div>
          {validationErrors.email && (
            <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '-7px', marginBottom: "15px" }}>
              {validationErrors.email}
            </div>
          )}
          <div style={{ marginBottom: '5px' }}>
            <label htmlFor="password" style={{ marginRight: '9px' }}>Password<span style={{ color: 'red' }}>*</span></label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              style={{ width: '385px' }}
            />
            <span className="password-toggle-icon1" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEye /> : < FiEyeOff />}
            </span>
          </div>
          {validationErrors.password && (
            <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '-7px', marginBottom: '15px' }}>
              {validationErrors.password}
            </div>
          )}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="role" style={{ marginRight: '40px' }}>Role<span style={{ color: 'red' }}>*</span></label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={{ width: '385px' }}
            >
              <option value="">Select Role</option>
              <option value="HR">HR</option>
              <option value="Recruiter">Recruiter</option>
            </select>
          </div>
          {validationErrors.role && (
            <div style={{ color: "red", fontSize: "0.8rem", marginTop: "-7px", marginBottom: "15px" }}>
              {validationErrors.role}
            </div>
          )}
          <br />
          <div style={{ marginTop: '10px' }}>
            <Button variant="primary" type="submit" style={{ marginRight: '20px' }}>
              Add Team Member
            </Button>
            <Button variant="primary" type="button" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTeamMemberPopup;