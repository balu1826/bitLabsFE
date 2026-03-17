import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StreakExamModal.css';
import { apiUrl } from '../../services/ApplicantAPIService';

const StreakExamModal = ({ userId, onClose, onExamCompleted }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Formatted current date logic for header
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' | ' + today.toLocaleDateString('en-GB', { weekday: 'short' });

  useEffect(() => {
    fetchTodaysQuestions();
  }, [userId]);

  const fetchTodaysQuestions = async () => {
    try {
      setLoading(true);
      const jwtToken = localStorage.getItem('jwtToken');
      // Step 2 & 4 handling based on the prompt. If user hasn't attempted, get today's.
      // But we probably just call todaysQuestions always for the content.
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      console.log(`Fetching questions for date: ${dateString}...`);
      const response = await axios.get(`${apiUrl}/streak/questions/${dateString}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      console.log("Questions response:", response.data);
      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
      } else {
        console.log("No questions or empty.");
        setError("No questions available for today.");
      }
    } catch (err) {
      console.error("Failed to fetch streak questions", err);
      // Fallback fallback questions if there's a network issue just to test UI locally
      setError("Unable to load today's streak exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionKey) => {
    if (isSubmitted) return; // Prevent changing answer after submit
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionKey
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');

      // Hit completion endpoint using {applicantId}/complete
      await axios.post(`${apiUrl}/streak/${userId}/complete`, selectedAnswers, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      setIsSubmitted(true);
      if (onExamCompleted) {
        onExamCompleted();
      }

    } catch (err) {
      console.error("Failed to submit streak exam", err);
      // If the backend says 409 Conflict, it means they already saved the streak today. 
      // Treat this as a successful "already completed" scenario so they can finish the modal
      if (err.response && err.response.status === 409) {
        setIsSubmitted(true);
        if (onExamCompleted) {
          onExamCompleted();
        }
      } else {
        // Let the user know if the API call failed for another reason
        alert(err.response?.data?.message || "Failed to submit exam results. Please check the connection.");
      }
    }
  };

  const handleCloseClick = () => {
    if (isSubmitted) {
      onClose();
    } else {
      setShowWarning(true);
    }
  };

  const handleConfirmClose = () => {
    setShowWarning(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowWarning(false);
  };

  if (loading) {
    return (
      <div className="streak-modal-overlay">
        <div className="streak-modal-content loading-state">
          <div className="spinner"></div>
          <p>Loading today's streak...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    console.log("Returning error state. error:", error, "questions.length:", questions.length);
    return (
      <div className="streak-modal-overlay">
        <div className="streak-modal-content">
          <div className="streak-modal-header">
            <div className="streak-header-titles">
              <h2>Today streak exam</h2>
            </div>
            <button className="streak-close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="streak-question-body" style={{ textAlign: "center", padding: "40px 0" }}>
            <p>{error || "No questions found for today."}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="streak-modal-overlay">
      <div className="streak-modal-content">
        {/* Warning Popup */}
        {showWarning && (
          <div className="streak-warning-overlay">
            <div className="streak-warning-modal">
              <button className="streak-close-btn" onClick={handleCancelClose}>&times;</button>
              <div className="warning-icon-wrapper">
                <div className="warning-siren-icon">&#128680;</div>
              </div>
              <h2 className="warning-title">Warning!</h2>
              <p className="warning-text">You are about to close the exam.<br />Unsaved progress will be lost. Do you wish to continue?</p>
              <button className="warning-sure-btn" onClick={handleConfirmClose}>I'm Sure</button>
            </div>
          </div>
        )}

        {/* Main Modal Header */}
        <div className="streak-modal-header">
          <div className="streak-header-titles">
            <h2>Today streak exam</h2>
            <span className="streak-date">{formattedDate}</span>
          </div>

          <button className="streak-close-btn" onClick={handleCloseClick}>&times;</button>
        </div>

        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="streak-progress-section">
            <div className="streak-progress-bars">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`progress-segment ${index <= currentQuestionIndex ? 'active' : ''}`}
                ></div>
              ))}
            </div>
            <div className="streak-question-count">
              Question {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
        )}

        {/* Question Body */}
        <div className={`streak-question-body ${isSubmitted ? 'submitted-questions-list' : ''}`}>
          {isSubmitted ? (
            questions.map((q, qIndex) => (
              <div key={qIndex} className="submitted-question-block">
                <h3 className="streak-question-text">
                  {qIndex + 1}. {q.question}
                </h3>
                <div className="streak-options-container">
                  {q.options && Object.entries(q.options).map(([key, value]) => {
                    const isSelected = selectedAnswers[qIndex] === key;
                    let optionClass = "streak-option";

                    if (isSelected) optionClass += " selected";
                    if (key === q.correctAnswer) {
                      optionClass += " correct";
                    } else if (isSelected && key !== q.correctAnswer) {
                      optionClass += " incorrect";
                    }

                    return (
                      <label key={key} className={optionClass}>
                        <input
                          type="radio"
                          disabled
                          checked={isSelected || key === q.correctAnswer}
                          readOnly
                        />
                        <span className="option-text">{value}</span>
                      </label>
                    );
                  })}
                </div>
                {q.description && (
                  <div className="streak-description-box">
                    <strong>Explanation:</strong> {q.description}
                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              <h3 className="streak-question-text">{currentQuestion.question}</h3>

              <div className="streak-options-container">
                {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === key;
                  let optionClass = "streak-option";

                  if (isSelected) optionClass += " selected";

                  return (
                    <label key={key} className={optionClass}>
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={key}
                        checked={isSelected}
                        onChange={() => handleOptionSelect(key)}
                        disabled={isSubmitted}
                      />
                      <span className="option-text">{value}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="streak-modal-footer">
          <div className="footer-left-buttons">
            {!isSubmitted && (
              <>
                <button
                  className="streak-nav-btn"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                >
                  Prev
                </button>
                <button
                  className="streak-nav-btn"
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                </button>
              </>
            )}
          </div>
          <div className="footer-right-buttons">
            {!isSubmitted ? (
              currentQuestionIndex === questions.length - 1 && (
                <button
                  className="streak-submit-btn"
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                >
                  Submit
                </button>
              )
            ) : (
              <button
                className="streak-submit-btn"
                onClick={() => {
                  if (onExamCompleted) {
                    onExamCompleted();
                  }
                  onClose();
                }}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakExamModal;
