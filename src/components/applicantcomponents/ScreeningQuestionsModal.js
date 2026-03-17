import React, { useState } from 'react';
import axios from 'axios';
import './ScreeningQuestionsModal.css';

const ScreeningQuestionsModal = ({ isOpen, questions, onClose, onSubmit, apiUrl, user, jobId }) => {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');

  const validateAnswer = (questionId, value) => {
    if (!value) {
      return 'Please provide your answer';
    }
    if (/^[^a-zA-Z0-9]+$/.test(value)) {
      return 'Please provide valid response';
    }
    if (value.length > 50) {
      return 'Maximum character limit has been exceeded';
    }
    return '';
  };

  const handleInputChange = (questionId, value) => {
    const errorMessage = validateAnswer(questionId, value);

    setErrors(prevErrors => ({
      ...prevErrors,
      [questionId]: errorMessage
    }));
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    let hasErrors = false;
    const newErrors = {};

    questions.forEach(question => {
      const errorMessage = validateAnswer(question.id, answers[question.id]);
      if (errorMessage) {
        hasErrors = true;
        newErrors[question.id] = errorMessage;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
     // setSubmissionError('Please fix the errors before submitting.');
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/job/applicants/${user.id}/saveAnswers/${jobId}`,
        { answers: Object.entries(answers).map(([questionId, answerText]) => ({ questionId: parseInt(questionId, 10), answerText })) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );
      console.log('Screening answers saved:', response.data);
      onSubmit(answers);  // Pass the answers back to the parent component
      onClose();  // Close the modal after successful submission
    } catch (error) {
      console.error('Error saving screening answers:', error);
      setSubmissionError('Error saving screening answers. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal10">
      <div className="modal-content10">
        <div className="modal-header10">
          <p className="modal-title10">Screening Questions</p>
          <p className="modal-subtitle10">(Maximum limit for each answer is 50 characters)</p>
          <span className="modal-close10" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body10">
          {questions.map((question, index) => (
            <div key={index} className="modal-question">
              <label>{question.questionText}</label>
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="font-input"
                placeholder='Write your answer here'
              />
              {errors[question.id] && (
                <p className="error-message10">{errors[question.id]}</p>
              )}
            </div>
          ))}
          {submissionError && <p className="error-message10">{submissionError}</p>}
        </div>
        <div className="modal-footer10">
          <button className="button-status" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningQuestionsModal;
