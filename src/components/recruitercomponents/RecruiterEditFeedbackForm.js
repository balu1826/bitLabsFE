import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import Snackbar from '../common/Snackbar';
import './RecruiterEditFeedbackForm.css';

function RecruiterEditFeedbackForm() {
  const { id: formId } = useParams();
  const navigate = useNavigate();
  const user1 = useUserContext();
  const user = user1.user;

  const [formData, setFormData] = useState({
    mentorName: '',
    collegeName: '',
    formName: '',
    description: '',
    isActive: true,
    questions: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  const questionTypes = [
    { value: 'RADIO', label: 'Radio Button', description: 'Single choice from multiple options' },
    { value: 'CHECKBOX', label: 'Checkbox', description: 'Multiple choice selection' },
    { value: 'REVIEW', label: 'Review Rating', description: 'Star rating (1-5 stars)' },
    { value: 'NUMBER', label: 'Number', description: 'Numeric input field' },
    { value: 'TEXTAREA', label: 'Text Area', description: 'Multi-line text input' },
    { value: 'EMAIL', label: 'Email', description: 'Email address input' },
    { value: 'TEXT', label: 'Text', description: 'Single-line text input' },
    { value: 'PHONE', label: 'Phone', description: 'Phone number input' }
  ];

  useEffect(() => {
    console.log('=== RecruiterEditFeedbackForm Mounted ===');
    console.log('formId from useParams:', formId);
    console.log('user from context:', user);
    console.log('user.id:', user?.id);
    console.log('API URL would be:', `${apiUrl}/api/feedback-forms/recruiter/${user?.id}/getFeedBackFormById/${formId}`);
    
    if (formId && user?.id) {
      console.log('Conditions met - calling fetchFormDetails');
      fetchFormDetails();
    } else {
      console.log('Conditions NOT met - formId:', formId, 'user.id:', user?.id);
    }
  }, [formId, user?.id]);

  const fetchFormDetails = async () => {
    console.log('fetchFormDetails called - formId:', formId, 'user.id:', user?.id);
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      console.log('Making API call to:', `${apiUrl}/api/feedback-forms/recruiter/${user.id}/getFeedBackFormById/${formId}`);
      
      const response = await axios.get(
        `${apiUrl}/api/feedback-forms/recruiter/${user.id}/getFeedBackFormById/${formId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        }
      );

      console.log('API response:', response.data);
      const form = response.data;
      // Parse questions if they come as string
      let parsedQuestions = form.questions;
      if (typeof form.questions === 'string') {
        try {
          parsedQuestions = JSON.parse(form.questions);
        } catch (parseError) {
          console.error('Error parsing questions:', parseError);
          parsedQuestions = [];
        }
      }
      
      setFormData({
        mentorName: form.mentorName || '',
        collegeName: form.collegeName || '',
        formName: form.formName || '',
        description: form.description || '',
        isActive: form.isActive !== undefined ? form.isActive : true,
        questions: parsedQuestions || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching form details:', error);
      setError('Failed to load form details. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => {
        if (index === questionIndex) {
          const updatedQuestion = { ...q, [field]: value };
          
          // Add options for option-based question types (only when changing questionType)
          if (field === 'questionType') {
            if ((value === 'RADIO' || value === 'CHECKBOX') && !updatedQuestion.options) {
              updatedQuestion.options = ['Option 1', 'Option 2'];
            } else if ((value !== 'RADIO' && value !== 'CHECKBOX') && updatedQuestion.options) {
              updatedQuestion.options = null;
            }
          }
          
          return updatedQuestion;
        }
        return q;
      })
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, qIndex) => {
        if (qIndex === questionIndex && q.options) {
          return {
            ...q,
            options: q.options.map((opt, oIndex) => 
              oIndex === optionIndex ? value : opt
            )
          };
        }
        return q;
      })
    }));
  };

  const addOption = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => {
        if (index === questionIndex) {
          return {
            ...q,
            options: [...(q.options || []), '']
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => {
        if (index === questionIndex && q.options) {
          return {
            ...q,
            options: q.options.filter((_, i) => i !== optionIndex)
          };
        }
        return q;
      })
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      questionNo: formData.questions.length + 1,
      questionText: '',
      questionType: 'TEXT',
      isRequired: false,
      options: null
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mentorName.trim() || !formData.collegeName.trim() || !formData.formName.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      
      const formattedFormData = {
        ...formData,
        questions: formData.questions.map(q => ({
          ...q,
          options: q.options || null
        }))
      };
      
      const response = await axios.put(
        `${apiUrl}/api/feedback-forms/recruiter/${user.id}/updateFeedbackForm/${formId}`,
        formattedFormData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSnackbar({ open: true, message: 'Form updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/recruiter-feedback-forms');
      }, 2000);
    } catch (error) {
      console.error('Error updating feedback form:', error);
      setError('Failed to update form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNew = async () => {

    setIsSubmitting(true);
    
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      
      const formattedFormData = {
        mentorName: formData.mentorName,
        collegeName: formData.collegeName,
        formName: `${formData.formName}`,
        description: formData.description,
        isActive: false,
        questions: formData.questions.map(q => ({
          ...q,
          options: q.options || null
        }))
      };

      const response = await axios.post(
        `${apiUrl}/api/feedback-forms/recruiter/${user.id}/createFeedbackForm`,
        formattedFormData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Show success message
      setSnackbar({ open: true, message: `Form "${formattedFormData.formName}" created successfully`, type: 'success' });
      
      // Navigate back to forms list
      setTimeout(() => {
        navigate('/recruiter-feedback-forms');
      }, 1000);
      
    } catch (error) {
      console.error('Error creating new form:', error);
      
      // Show error message
      setSnackbar({ open: true, message: 'Failed to create new form. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteForm = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      await axios.delete(
        `${apiUrl}/api/feedback-forms/recruiter/${user.id}/deleteFeedbackForm/${formId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        }
      );

      // Show success message
      setSnackbar({ open: true, message: `Form "${formData.formName}" deleted successfully`, type: 'success' });

      // Navigate back to forms list
      setTimeout(() => {
        navigate('/recruiter-feedback-forms');
      }, 1000);
    } catch (error) {
      console.error('Error deleting form:', error);
      
      // Show error message
      setSnackbar({ open: true, message: 'Failed to delete form. Please try again.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="border-style">
        <div className="blur-border-style"></div>
        <div className="dashboard__content">
          <div className="row mr-0 ml-10 extraSpace" style={{ marginLeft: "1%" }}>
            <div className="main-header-row">
              <h1 className="main-heading">Loading Form...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        <div className="row mr-0 ml-10 extraSpace" style={{ marginLeft: "1%" }}>
          <div className="main-header-row">
            <h1 className="main-heading">Edit Feedback Form</h1>
            <button 
              className="recruiter-create-feedback-form"
              onClick={() => navigate('/recruiter-static-feedback')}
            >
              <i className="fa fa-arrow-left"></i>
              Back to Forms
            </button>
          </div>
        </div>

        <div className="recruiter-create-feedback-form create-form-container">
          {error && (
            <div className="global-error">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="create-form">
            {/* Form Basic Information */}
            <div className="form-section">
              <h3>Form Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mentor Name *</label>
                  <input
                    type="text"
                    name="mentorName"
                    value={formData.mentorName}
                    onChange={handleInputChange}
                    placeholder="Enter mentor name"
                  />
                </div>

                <div className="form-group">
                  <label>College Name *</label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    placeholder="Enter college name"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Form Name *</label>
                  <input
                    type="text"
                    name="formName"
                    value={formData.formName}
                    onChange={handleInputChange}
                    placeholder="Enter form name"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe purpose of this feedback form"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Active Form
                  </label>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="form-section">
              <h3>Questions ({formData.questions.length})</h3>
              
              <div className="questions-preview">
                {formData.questions.map((question, index) => (
                  <div className="question-preview" key={index}>
                    <div className="question-header">
                      <span className="question-number">Q{question.questionNo || index + 1}</span>
                      <select
                        value={question.questionType}
                        onChange={(e) => handleQuestionChange(index, 'questionType', e.target.value)}
                        className="question-type-select"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        className="recruiter-create-feedback-form remove-question-btn"
                        onClick={() => removeQuestion(index)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                    
                    <div className="question-text">
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="question-required-section">
                      <label className="required-checkbox">
                        <input
                          type="checkbox"
                          checked={question.isRequired || false}
                          onChange={(e) => handleQuestionChange(index, 'isRequired', e.target.checked)}
                        />
                        Required
                      </label>
                    </div>

                    {/* Options for option-based questions */}
                    {question.options && (
                      <div className="options-builder">
                        <label>Options</label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="option-input">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            {question.options.length > 1 && (
                              <button
                                type="button"
                                className="recruiter-create-feedback-form remove-option-btn"
                                onClick={() => removeOption(index, optionIndex)}
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="recruiter-create-feedback-form add-option-btn"
                          onClick={() => addOption(index)}
                        >
                          <i className="fa fa-plus"></i>
                          Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="recruiter-create-feedback-form add-question-btn"
                onClick={addQuestion}
              >
                <i className="fa fa-plus"></i>
                Add Question
              </button>
            </div>

            <div className="recruiter-create-feedback-form form-actions">
              <button
                type="button"
                className="recruiter-create-feedback-form"
                onClick={handleCreateNew}
              >
                <i className="fa fa-copy"></i>
                Create as New Form
              </button>
              <button
                type="button"
                className="recruiter-create-feedback-form delete-btn"
                onClick={handleDeleteForm}
                disabled={isSubmitting}
              >
                <i className="fa fa-trash"></i>
                Delete Form
              </button>
              <button
                type="submit"
                className="recruiter-create-feedback-form submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Form'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
        />
      )}
    </div>
  );
}

export default RecruiterEditFeedbackForm;
