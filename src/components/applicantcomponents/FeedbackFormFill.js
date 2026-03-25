import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate, useParams } from 'react-router-dom';
import Snackbar from '../common/Snackbar';
import BackButton from '../common/BackButton';
import './FeedbackFormFill.css';

const FeedbackFormFill = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { formId } = useParams();
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formDetails, setFormDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const applicantId = user?.id;

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');

        const response = await axios.get(
          `${apiUrl}/api/feedbackforms/getfeedbackFormById/${formId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        setFormDetails(response.data);
        setError(null);

        const initialFormData = {};
        if (response.data.questions) {
          const questions = response.data.questions;
          questions.forEach(question => {
            if (question.questionType === 'CHECKBOX') {
              initialFormData[question.questionKey] = [];
            } else if (question.questionType === 'TEXTAREA' || question.questionType === 'TEXT' || question.questionType === 'EMAIL' || question.questionType === 'PHONE') {
              initialFormData[question.questionKey] = '';
            } else if (question.questionType === 'NUMBER') {
              initialFormData[question.questionKey] = '';
            } else {
              // RADIO, REVIEW, RATING - start with empty for RATING to show bubble at start
              initialFormData[question.questionKey] = question.questionType === 'RATING' ? '' : '';
            }
          });
        }
        setFormData(initialFormData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load feedback form. Please try again later.');
        setLoading(false);
      }
    };

    if (formId && applicantId) {
      fetchFormDetails();
    } else {
      setError('Form ID or user information missing.');
      setLoading(false);
    }
  }, [formId, applicantId]);

  const handleInputChange = (questionKey, value, questionType, isChecked = null) => {
    setFormData(prev => {
      const updated = { ...prev };

      if (questionType === 'CHECKBOX') {
        // Handle checkbox array values
        const currentValues = prev[questionKey] || [];
        if (isChecked) {
          updated[questionKey] = [...currentValues, value];
        } else {
          updated[questionKey] = currentValues.filter(item => item !== value);
        }
      } else if (questionType === 'NUMBER') {
        // Handle number type
        updated[questionKey] = value === '' ? '' : Number(value);
      } else {
        // Handle all other types (TEXT, EMAIL, PHONE, TEXTAREA, RADIO, REVIEW)
        updated[questionKey] = value;
      }

      return updated;
    });

    // Clear error for the field being updated
    if (fieldErrors[questionKey]) {
      setFieldErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[questionKey];
        return newErrors;
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/applicanthome');
  };

  const validateForm = () => {
    const errors = {};

    if (formDetails && formDetails.questions) {
      const questions = formDetails.questions;
      questions.forEach(question => {
        const value = formData[question.questionKey];

        if (question.questionType === 'TEXTAREA' && value && value.trim().length < 10) {
          errors[question.questionKey] = 'Response must be at least 10 characters';
        }

        if (question.isRequired) {
          if (question.questionType === 'CHECKBOX') {
            // Check if at least one checkbox is selected
            if (!Array.isArray(value) || value.length === 0) {
              errors[question.questionKey] = `Please select at least one option`;
            }
          } else if (question.questionType === 'RADIO' || question.questionType === 'REVIEW' || question.questionType === 'RATING') {
            // Check if a radio, review, or rating option is selected
            if (!value || value === '') {
              errors[question.questionKey] = `Please select an option`;
            }
          } else if (!value || (typeof value === 'string' && value.trim() === '')) {
            // Check for TEXT, EMAIL, PHONE, TEXTAREA, NUMBER
            errors[question.questionKey] = `This field is required`;
          }
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      setSubmitting(false);
      setSnackbar({ open: true, message: 'Please fill all required fields', type: 'error' });
      return;
    }

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const answers = Object.keys(formData).map((questionKey, index) => ({
        answer: formData[questionKey],
        questionKey: questionKey,
        questionNumber: index + 1
      }));

      await axios.post(
        `${apiUrl}/api/feedbackform/${formId}/saveApplicantResponse/${applicantId}`,
        answers,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setShowSuccessPopup(true);

    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message || 'Failed to submit feedback form. Please try again.';

      if (errorMessage.includes('Feedback already submitted for this form by the applicant')) {
        errorMessage = 'You have already submitted feedback for this form.';
      }

      setSnackbar({ open: true, message: errorMessage, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (questionData) => {
    const { questionKey, question, questionType, options, displayType, isRequired } = questionData;
    const value = formData[questionKey] || '';

    switch (questionType) {
      case 'RATING':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <div className={`feedback-rating-group feedback-rating-${displayType?.toLowerCase()}`}>
              {displayType === 'STARS' && (
                <div className="feedback-stars-container">
                  {options.map((option, index) => {
                    const starLabels = {
                      1: 'Poor',
                      2: 'Fair',
                      3: 'Good',
                      4: 'Very Good',
                      5: 'Excellent'
                    };
                    return (
                      <label key={index} className="feedback-star-option">
                        <input
                          type="radio"
                          name={`question-${questionKey}`}
                          value={option}
                          checked={value === option.toString()}
                          onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
                        />
                        <span className="feedback-star">
                          {parseInt(option) <= parseInt(value) ? '★' : '☆'}
                        </span>
                        <span className="feedback-star-label">{starLabels[option]}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {displayType === 'SCALE' && (
                <div className="feedback-scale-container">
                  <div className="feedback-scale-line">
                    <div
                      className="feedback-scale-fill"
                      style={{
                        width: value ? `${((parseInt(value) - 1) / (options.length - 1)) * 100}%` : '0%'
                      }}
                    ></div>
                    <div
                      className="feedback-scale-bubble"
                      style={{
                        left: value ? `${((parseInt(value) - 1) / (options.length - 1)) * 100}%` : '0%'
                      }}
                    ></div>
                    <input
                      type="range"
                      min={options[0]}
                      max={options[options.length - 1]}
                      step="0.1"
                      value={value || options[0]}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        const percentage = (newValue - options[0]) / (options[options.length - 1] - options[0]);
                        const optionIndex = Math.round(percentage * (options.length - 1));
                        const snapValue = options[optionIndex];
                        handleInputChange(questionKey, snapValue.toString(), questionType);
                      }}
                      className="feedback-scale-slider"
                    />
                    <div className="feedback-scale-options">
                      {options.map((option, index) => {
                        return (
                          <span
                            key={index}
                            className={`feedback-scale-option-label ${parseInt(value) === parseInt(option) ? 'active' : ''}`}
                            style={{
                              left: `${(index / (options.length - 1)) * 100}%`
                            }}
                          >
                            {option}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {displayType === 'EMOJIS' && (
                <div className="feedback-emojis-container">
                  {options.map((option, index) => {
                    const emojiMap = {
                      1: '😞',
                      2: '😕',
                      3: '😐',
                      4: '😊',
                      5: '😃'
                    };
                    const emojiLabels = {
                      1: 'Poor',
                      2: 'Fair',
                      3: 'Good',
                      4: 'Very Good',
                      5: 'Excellent'
                    };
                    const isSelected = parseInt(value) === parseInt(option);
                    return (
                      <label key={index} className="feedback-emoji-option">
                        <input
                          type="radio"
                          name={`question-${questionKey}`}
                          value={option}
                          checked={isSelected}
                          onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
                        />
                        <span className={`feedback-emoji ${isSelected ? 'active' : ''}`}>
                          {emojiMap[option]}
                        </span>
                        <span className="feedback-emoji-label">{emojiLabels[option]}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'RADIO':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <div className="feedback-radio-group">
              {options.map((option, index) => (
                <label key={index} className="feedback-radio-option">
                  <input
                    type="radio"
                    name={`question-${questionKey}`}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
                  />
                  <span className="feedback-radio-text">{option}</span>
                </label>
              ))}
            </div>
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'CHECKBOX':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <div className="feedback-checkbox-group">
              {options.map((option, index) => (
                <label key={index} className="feedback-checkbox-option">
                  <input
                    type="checkbox"
                    name={`question-${questionKey}-${index}`}
                    value={option}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => handleInputChange(questionKey, option, questionType, e.target.checked)}
                  />
                  <span className="feedback-checkbox-text">{option}</span>
                </label>
              ))}
            </div>
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'REVIEW':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <div className="feedback-review-group">
              {options.map((option, index) => (
                <label key={index} className="feedback-review-option">
                  <input
                    type="radio"
                    name={`question-${questionKey}`}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
                  />
                  <span className="feedback-review-star">
                    {parseInt(option) <= parseInt(value) ? '★' : '☆'}
                  </span>
                  <span className="feedback-review-label">{option}</span>
                </label>
              ))}
            </div>
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'NUMBER':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
              className="feedback-number-input"
              min="1"
              placeholder="Enter a number..."
            />
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'TEXTAREA':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
              className="feedback-textarea"
              rows={4}
              placeholder="Enter your response here..."
            />
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'EMAIL':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="email"
              value={value}
              onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
              className="feedback-email-input"
              placeholder="Enter your email address..."
            />
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
              className="feedback-text-input"
              placeholder="Enter your response..."
            />
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      case 'PHONE':
        return (
          <div key={questionKey} className="feedback-question">
            <label className="feedback-question-label">
              {question} {isRequired && <span className="feedback-required">*</span>}
            </label>
            <input
              type="tel"
              value={value}
              onChange={(e) => handleInputChange(questionKey, e.target.value, questionType)}
              className="feedback-phone-input"
              placeholder="Enter your phone number..."
              pattern="[0-9]{10}"
            />
            {fieldErrors[questionKey] && (
              <span className="feedback-error-message">{fieldErrors[questionKey]}</span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        <div className="row mr-0 ml-10 extraSpace" style={{ marginLeft: "1%" }}>
          <div className="main-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BackButton />
              <h1 className="main-heading">Fill Feedback Form</h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="feedback-form-wrapper">
            {/* Skeleton Card 1 - Form Details */}
            <div className="newCard skeleton-card">
              <div className="card-header">
                <div className="skeleton skeleton-title"></div>
                <div className="card-details">
                  <div className="skeleton skeleton-meta-item"></div>
                  <div className="skeleton skeleton-meta-item"></div>
                </div>
                <div className="skeleton skeleton-description"></div>
              </div>
            </div>

            {/* Skeleton Card 2 - Multiple Input Fields */}
            <div className="newCard skeleton-card">
              <div className="card-body">
                {/* Row 1 - Two fields */}
                <div className="skeleton-row">
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                </div>

                {/* Row 2 - Two fields */}
                <div className="skeleton-row">
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                  <div className="skeleton-col">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-input-field"></div>
                  </div>
                </div>

                {/* Row 3 - Radio Group */}
                <div className="skeleton-row">
                  <div className="skeleton-col-full">
                    <div className="skeleton skeleton-label"></div>
                    <div className="radio-group">
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                    </div>
                  </div>
                </div>

                {/* Row 4 - Textarea */}
                <div className="skeleton-row">
                  <div className="skeleton-col-full">
                    <div className="skeleton skeleton-label"></div>
                    <div className="skeleton skeleton-textarea"></div>
                  </div>
                </div>

                {/* Row 5 - Radio Group */}
                <div className="skeleton-row">
                  <div className="skeleton-col-full">
                    <div className="skeleton skeleton-label"></div>
                    <div className="radio-group">
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                      <div className="skeleton skeleton-radio-option"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="feedback-error-state">
            <p>{error}</p>
            <button className="feedback-retry-btn" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : formDetails ? (
          <div className="feedback-form-wrapper">
            <div className="feedback-form-header">
              <h2 className="feedback-form-title">{formDetails.formName}</h2>
              <div className="feedback-form-meta">
                <span className="feedback-meta-item"><span style={{ color: "black" }}>Mentor:</span> {formDetails.mentorName}</span>
                <span className="feedback-meta-item"><span style={{ color: "black" }}>College:</span> {formDetails.collegeName}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
              {formDetails.questions.map((question) => renderQuestion(question))}
              <div className="feedback-submit-section">
                <button
                  type="submit"
                  className="feedback-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="feedback-error-state">
            <p>No form data available.</p>
          </div>
        )}
      </div>

      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
        />
      )}

      {showSuccessPopup && (
        <div className="feedback-success-popup-overlay">
          <div className="feedback-success-popup">
            <div className="feedback-success-icon">✓</div>
            <h3 className="feedback-success-title">Feedback Submitted Successfully!</h3>
            <p className="feedback-success-message">Thank you for your valuable feedback. Your response has been recorded.</p>
            <button
              className="feedback-success-btn"
              onClick={handleSuccessPopupClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackFormFill;
