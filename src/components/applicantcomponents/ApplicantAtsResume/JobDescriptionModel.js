import './JobDescriptionModel.css';
import { useState } from 'react';
import { useResume } from '../ResumeContext';

const JobDescriptionModal = ({ onClose, onFinish }) => {

  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const { updateResumeState } = useResume();

  const validateText = (inputText) => {
    if (!inputText.trim()) {
      return "Job description cannot be empty if you want to continue";
    }
    if (inputText.trim().length < 10) {
      return "Job description must be at least 10 characters long";
    }
    if (inputText.trim().length > 5000) {
      return "Job description must be less than 5000 characters";
    }
    return "";
  };

  const handleContinue = () => {
    const validationError = validateText(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    updateResumeState('jobDescription', text);
    onFinish(text); 
  };

  const handleSkip = () => {
    setError("");
    onFinish(""); 
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    // Clear error when user starts typing
    if (error && newText.trim()) {
      setError("");
    }
  };
  return (

    <>
     <div className="jd-modal">
      <button className="jd-close" onClick={onClose}>✕</button>

      <h3 className="jd-title">Job Description</h3>
      <p className="jd-subtitle">
        Would you like to check the job description here?
      </p>

      <textarea
        className={`jd-textarea ${error ? 'error' : ''}`}
        placeholder="Paste your job description here..."
        value={text}
        onChange={handleTextChange}
        maxLength={5000}
      />
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="character-count">
        {text.length}/5000 characters
      </div>

<div className="modal-buttons">
        <button onClick={handleSkip} className="skip-btn">
          Skip & Continue
        </button>
        
        <button 
          onClick={handleContinue} 
          className="continue-btn"
          disabled={!text.trim()}
        >
          Continue
        </button>
      </div>
      
    </div>
    
    </>
   
  );
};

export default JobDescriptionModal;
