import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import './RecruiterCreateFeedbackForm.css';

const RecruiterCreateFeedbackForm = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const recruiterId = user.id;

  const [formData, setFormData] = useState({
    mentorName: '',
    collegeName: '',
    formName: '',
    description: '',
    isActive: true,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'RADIO',
    isRequired: true,
    options: ['']
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionTypes = [
    { value: 'RADIO', label: 'Radio Buttons', description: 'Single choice from multiple options' },
    { value: 'CHECKBOX', label: 'Checkboxes', description: 'Multiple selections from options' },
    { value: 'REVIEW', label: 'Review', description: 'Review and rating input' },
    { value: 'NUMBER', label: 'Number', description: 'Numeric input' },
    { value: 'TEXTAREA', label: 'Text Area', description: 'Long text answer' },
    { value: 'EMAIL', label: 'Email', description: 'Email address input' },
    { value: 'TEXT', label: 'Text Input', description: 'Short text answer' },
    { value: 'PHONE', label: 'Phone', description: 'Phone number input' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.mentorName.trim()) {
      newErrors.mentorName = 'Mentor name is required';
    }
    
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required';
    }
    
    if (!formData.formName.trim()) {
      newErrors.formName = 'Form name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 10) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert('Please enter question text');
      return;
    }

    // Validate based on question type
    if (currentQuestion.questionType === 'RADIO' || currentQuestion.questionType === 'CHECKBOX' || currentQuestion.questionType === 'REVIEW') {
      const validOptions = currentQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        alert(`${currentQuestion.questionType} questions must have at least 2 options`);
        return;
      }
    }

    const questionToAdd = {
      ...currentQuestion,
      questionNo: formData.questions.length + 1,
      options: (currentQuestion.questionType === 'RADIO' || currentQuestion.questionType === 'CHECKBOX' || currentQuestion.questionType === 'REVIEW') 
        ? currentQuestion.options.filter(opt => opt.trim()).length > 0 
          ? currentQuestion.options.filter(opt => opt.trim())
          : null
        : null
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, questionToAdd]
    }));

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      questionType: 'RADIO',
      isRequired: true,
      options: ['']
    });
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      
      // Ensure questions array is properly formatted
      const formattedFormData = {
        ...formData,
        questions: formData.questions.map(q => ({
          ...q,
          options: q.options || null
        }))
      };
      
      console.log('Submitting form data:', JSON.stringify(formattedFormData, null, 2));
      
      const response = await axios.post(
        `${apiUrl}/api/feedback-forms/recruiter/${recruiterId}/createFeedbackForm`,
        formattedFormData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Form created successfully:', response.data);
      navigate('/recruiter-feedback-forms');
    } catch (error) {
      console.error('Error creating feedback form:', error);
      alert('Failed to create feedback form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const QuestionPreview = ({ question, index }) => {
    const renderQuestionPreview = () => {
      switch (question.questionType) {
        case 'RADIO':
          return (
            <div className="question-options">
              {question.options?.map((option, i) => (
                <div key={i} className="option-preview">
                  <span className="radio-dot"></span>
                  {option}
                </div>
              ))}
            </div>
          );

        case 'CHECKBOX':
          return (
            <div className="question-options">
              {question.options?.map((option, i) => (
                <div key={i} className="option-preview">
                  <span className="checkbox-square"></span>
                  {option}
                </div>
              ))}
            </div>
          );

        case 'REVIEW':
          return (
            <div className="question-options">
              {question.options?.map((option, i) => (
                <div key={i} className="option-preview">
                  <span className="review-star">★</span>
                  {option}
                </div>
              ))}
            </div>
          );

        case 'TEXT':
          return (
            <div className="text-input-preview">
              <input type="text" placeholder="Enter text" disabled />
            </div>
          );

        case 'NUMBER':
          return (
            <div className="number-input-preview">
              <input type="number" placeholder="Enter number" disabled />
            </div>
          );

        case 'EMAIL':
          return (
            <div className="email-input-preview">
              <input type="email" placeholder="Enter email" disabled />
            </div>
          );

        case 'PHONE':
          return (
            <div className="phone-input-preview">
              <input type="tel" placeholder="Enter phone number" disabled />
            </div>
          );

        case 'TEXTAREA':
          return (
            <div className="textarea-preview">
              <textarea placeholder="Enter your answer" disabled></textarea>
            </div>
          );

        default:
          return <div className="unknown-type">Unknown question type</div>;
      }
    };

    return (
      <div className="question-preview">
        <div className="question-header">
          <span className="question-number">Q{index + 1}</span>
          <span className="question-type">{question.questionType}</span>
          <span className="question-required">{question.isRequired ? 'Required' : 'Optional'}</span>
          <button 
            type="button" 
            className="remove-question-btn"
            onClick={() => removeQuestion(index)}
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
        <div className="question-text">{question.questionText}</div>
        {renderQuestionPreview()}
      </div>
    );
  };

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        <div className="row mr-0 ml-10 extraSpace" style={{ marginLeft: "1%" }}>
          <div className="main-header-row">
            <h1 className="main-heading">Create Feedback Form</h1>
            <button 
              className="recruiter-create-feedback-form"
              onClick={() => navigate('/recruiter-feedback-forms')}
            >
              <i className="fa fa-arrow-left"></i>
              Back to Forms
            </button>
          </div>
        </div>

        <div className="recruiter-create-feedback-form create-form-container">
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
                    className={errors.mentorName ? 'error' : ''}
                    placeholder="Enter mentor name"
                  />
                  {errors.mentorName && <span className="error-message">{errors.mentorName}</span>}
                </div>

                <div className="form-group">
                  <label>College Name *</label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    className={errors.collegeName ? 'error' : ''}
                    placeholder="Enter college name"
                  />
                  {errors.collegeName && <span className="error-message">{errors.collegeName}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Form Name *</label>
                  <input
                    type="text"
                    name="formName"
                    value={formData.formName}
                    onChange={handleInputChange}
                    className={errors.formName ? 'error' : ''}
                    placeholder="Enter form name"
                  />
                  {errors.formName && <span className="error-message">{errors.formName}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={errors.description ? 'error' : ''}
                    placeholder="Describe the purpose of this feedback form"
                    rows="3"
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
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

            {/* Question Builder */}
            <div className="form-section">
              <h3>Add Questions</h3>
              
              <div className="question-builder">
                <div className="question-form">
                  <div className="form-group full-width">
                    <label>Question Text</label>
                    <input
                      type="text"
                      value={currentQuestion.questionText}
                      onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Question Type</label>
                      <select
                        value={currentQuestion.questionType}
                        onChange={(e) => handleQuestionChange('questionType', e.target.value)}
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <small className="question-type-description">
                        {questionTypes.find(t => t.value === currentQuestion.questionType)?.description}
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={currentQuestion.isRequired}
                          onChange={(e) => handleQuestionChange('isRequired', e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Required
                      </label>
                    </div>
                  </div>

                  {(currentQuestion.questionType === 'RADIO' || currentQuestion.questionType === 'CHECKBOX' || currentQuestion.questionType === 'REVIEW') && (
                    <div className="options-builder">
                      <label>Options</label>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="option-input">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          {currentQuestion.options.length > 2 && (
                            <button
                              type="button"
                              className="recruiter-create-feedback-form remove-option-btn"
                              onClick={() => removeOption(index)}
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          )}
                        </div>
                      ))}
                      {currentQuestion.options.length < 10 && (
                        <button
                          type="button"
                          className="recruiter-create-feedback-form add-option-btn"
                          onClick={addOption}
                        >
                          <i className="fa fa-plus"></i>
                          Add Option
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="recruiter-create-feedback-form add-question-btn"
                    onClick={addQuestion}
                  >
                    <i className="fa fa-plus"></i>
                    Add Question
                  </button>
                </div>
              </div>
            </div>

            {/* Questions Preview */}
            {formData.questions.length > 0 && (
              <div className="form-section">
                <h3>Questions Preview ({formData.questions.length})</h3>
                <div className="questions-preview">
                  {formData.questions.map((question, index) => (
                    <QuestionPreview key={index} question={question} index={index} />
                  ))}
                </div>
              </div>
            )}

            {errors.questions && (
              <div className="error-message global-error">{errors.questions}</div>
            )}

            <div className="recruiter-create-feedback-form form-actions">
              <button
                type="button"
                className="recruiter-create-feedback-form cancel-btn"
                onClick={() => navigate('/recruiter-feedback-forms')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="recruiter-create-feedback-form submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecruiterCreateFeedbackForm;
