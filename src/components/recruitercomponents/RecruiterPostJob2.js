import React, { useState, useEffect } from 'react';
import './RecruiterPostJob2.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Snackbar from '../common/Snackbar';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';

const RecruiterPostJob2 = () => {
  const [questions, setQuestions] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]); // State for validation messages
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const user1 = useUserContext();
  const user = user1.user;

  useEffect(() => {
    const savedJobDetails = localStorage.getItem('jobDetails');
    if (savedJobDetails) {
      setJobDetails(JSON.parse(savedJobDetails));
    }
  }, []);

  const handleQuestionChange = (index, event) => {
    const newQuestions = [...questions];
    newQuestions[index] = event.target.value;
    setQuestions(newQuestions);

    // Clear validation error if question is not empty
    if (event.target.value.trim() !== '') {
      const newValidationErrors = [...validationErrors];
      newValidationErrors[index] = '';
      setValidationErrors(newValidationErrors);
    }
  };

  const handleAddQuestion = () => {
    if (questions.length < 10) {
      setQuestions([...questions, '']);
      setValidationErrors([...validationErrors, '']); // Add a corresponding empty validation error
    }
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = questions.filter((_, qIndex) => qIndex !== index);
    const newValidationErrors = validationErrors.filter((_, qIndex) => qIndex !== index);
    setQuestions(newQuestions);
    setValidationErrors(newValidationErrors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check for empty questions
    const newValidationErrors = questions.map((question) =>
      question.trim() === '' ? 'Please type a question or delete it to continue' : ''
    );
    setValidationErrors(newValidationErrors);

    if (newValidationErrors.some((error) => error !== '')) {
      return; // Stop submission if there are validation errors
    }

    // Include screening questions in formData
    const formData = {
      ...jobDetails,
      screeningQuestions: questions.map((question) => ({
        questionText: question,
      })),
    };

    const jwtToken = localStorage.getItem('jwtToken');
    const headers = {
      Authorization: `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
    };

    try {
      // Save job details and questions
      const jobResponse = await axios.post(`${apiUrl}/job/recruiters/saveJob/${user.id}`, formData, { headers });
      console.log('Job saved successfully', jobResponse.data);

      setSnackbar({ open: true, message: 'Job saved successfully', type: 'success' });
      // Optionally, clear form or navigate to another page
      localStorage.removeItem('jobDetails');
    } catch (error) {
      console.error('API Error:', error);
      setSnackbar({ open: true, message: 'Error saving job or questions', type: 'error' });
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    const jobDetails = localStorage.getItem('jobDetails');
    if (jobDetails) {
      const formData = JSON.parse(jobDetails);
      navigate('/recruiter-postjob', { state: formData });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
    setTimeout(() => {
      navigate('/recruiter-postjob');
    }, 2000);
  };

  return (
    <div className="dashboard__content">
      <section className="page-title-dashboard">
        <div className="themes-container">
          <div className="row">
            <div className="col-lg-12 col-md-12 ">
              <div className="title-dashboard">
                <div className="title-dash flex2">Post a Job</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flat-dashboard-post flat-dashboard-setting">
        <form onSubmit={handleSubmit}>
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12 ">
                <div className="post-new profile-setting bg-white">
                  <h3>
                    Enter Screening Questions{' '}
                    <span style={{ color: '#7A7A7A' }}>(Optional)</span>
                  </h3>
                  <p style={{ fontSize: '12px' }}>
                    Answers will be limited to 50 characters only
                  </p>
                  <br />
                  {questions.length === 0 ? (
                    <>
                      <div style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Plus Jakarta Sans' }}>
                        <p style={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                          Screening questions would help in shortlisting Applicants easily
                        </p>
                      </div>
                    </>
                  ) : (
                    questions.map((question, index) => (
                      <div key={index}>
                        <div className="text-editor-wrap">
                          <label className="title-user fw-7">Question</label>
                          <div align="right" style={{ marginBottom: '10px' }}>
                          <Link onClick={() => handleDeleteQuestion(index)} className="delete-button">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="17"
                              height="17"
                              viewBox="0 0 17 20"
                              fill="none"
                            >
                              <path
                                d="M2.68359 4.5H4.01693H14.6836"
                                stroke="#FF7171"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M13.3504 4.49967V13.833C13.3504 14.1866 13.2099 14.5258 12.9599 14.7758C12.7099 15.0259 12.3707 15.1663 12.0171 15.1663H5.35042C4.9968 15.1663 4.65766 15.0259 4.40761 14.7758C4.15757 14.5258 4.01709 14.1866 4.01709 13.833V4.49967M6.01709 4.49967V3.16634C6.01709 2.81272 6.15757 2.47358 6.40761 2.22353C6.65766 1.97348 6.9968 1.83301 7.35042 1.83301H10.0171C10.3707 1.83301 10.7099 1.97348 10.9599 2.22353C11.2099 2.47358 11.3504 2.81272 11.3504 3.16634V4.49967"
                                stroke="#FF7171"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M7.3501 7.83301V11.833"
                                stroke="#FF7171"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M10.0171 7.83301V11.833"
                                stroke="#FF7171"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                            
                              Delete
                            </Link>
                          </div>
                          <fieldset className="info-wd">
                            <input
                              type="text"
                              value={question}
                              onChange={(event) => handleQuestionChange(index, event)}
                              placeholder="Write your question here"
                              className="input-form"
                            />
                          </fieldset>
                          {validationErrors[index] && (
                            <p style={{ color: 'red', fontSize: '12px' }}>{validationErrors[index]}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {questions.length < 10 && (
                    <div
                      className="text-editor-wrap"
                      style={{
                        border: '1px solid #747070', // Updated to solid border
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer', // Add cursor pointer for entire div
                      }}
                      align="center"
                      onClick={handleAddQuestion} // Make the entire div clickable
                    >
                      <Link className="add-button" style={{ pointerEvents: 'none' }}>
                        + Add question
                      </Link>
                    </div>
                  )}
                  <div className="form-group" align="right">
                    <button onClick={handleBack} className="button-back">
                      Back
                    </button>
                    &nbsp;
                    <button type="submit" className="button-status">
                      Post Job
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      )}
    </div>
  );
};

export default RecruiterPostJob2;
