import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import feedbackFormEmptyImage from '../../images/empty-state-images/feedback-form-empty-state-image.png';
import searchEmptyStateImage from '../../images/empty-state-images/no-search-results.png';
import './RecruiterFeedbackForms.css';

const RecruiterFeedbackForms = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const recruiterId = user.id;

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/api/feedback-forms/recruiter/${recruiterId}/getAllFeedbackForms`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        setForms(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedback forms:', err);
        setError('Failed to load feedback forms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (recruiterId) {
      fetchForms();
    }
  }, [recruiterId]);

  const filteredForms = forms.filter(form => {
    const nameMatch = form.formName?.toLowerCase().includes(searchQuery.toLowerCase());
    const mentorMatch = form.mentorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const collegeMatch = form.collegeName?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || mentorMatch || collegeMatch;
  });

  const formatDate = (createdAt) => {
    if (!createdAt || !Array.isArray(createdAt) || createdAt.length < 7) {
      return 'Unknown date';
    }

    const [year, month, day, hour, minute, second, nanosecond] = createdAt;
    const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewResponses = (formId) => {
    navigate(`/recruiter-edit-feedback-form/${formId}`);
  };

  const RecruiterFeedbackFormSkeleton = ({ count = 8 }) => {
    return (
      <div className="recruiter-feedback-forms-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="recruiter-feedback-form-card skeleton-card" key={i}>
            <div className="recruiter-form-header">
              <div className="skeleton-element skeleton-header"></div>
            </div>

            <div className="recruiter-form-details">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="detail-row">
                  <div className="skeleton-element skeleton-label"></div>
                  <div className="skeleton-element skeleton-value"></div>
                </div>
              ))}
            </div>

            <div className="recruiter-form-actions">
              <div className="skeleton-element skeleton-action"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        <div className="row mr-0 ml-10 extraSpace" style={{ marginLeft: "1%" }}>
          <div className="main-header-row">
            <h1 className="main-heading">Feedback Forms</h1>
            <div className="hackathon-search-box">
              <i className="fa fa-search search-icon1"></i>
              <input
                type="text"
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hackathon-search-input"
              />
              {searchQuery && (
                <i
                  className="fa fa-times clear-icon"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSearchQuery("")}
                ></i>
              )}
            </div>
          </div>
        </div>

        {/* Create New Feedback Form Card */}
        <div className="create-feedback-form-card">
          <div className="create-form-content">
            <div className="create-form-info">
              <h3>Create New Feedback Form</h3>
              <p>Design custom feedback forms</p>
            </div>
            <button
              className="recruiter-feedback-forms create-form-btn"
              onClick={() => navigate('/recruiter-create-feedback-form')}
            >
              <i className="fa fa-plus"></i>
              Create Form
            </button>
          </div>
        </div>

        {loading ? (
          <RecruiterFeedbackFormSkeleton count={8} />
        ) : error ? (
          <div className="no-results-message">
            <p>{error}</p>
            <button
              className="cta-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredForms.length === 0 && searchQuery ? (
          <div className="no-results-message">
            <img src={searchEmptyStateImage} alt="No search results" className="empty-state-image" />
            <p>No feedback forms match your search</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="no-results-message">
            <img src={feedbackFormEmptyImage} alt="No feedback forms" className="empty-state-image" />
            <div>No feedback forms available</div>
          </div>
        ) : (
          <div className="recruiter-feedback-forms-grid">
            {filteredForms.map((form) => (
              <div className="recruiter-feedback-form-card" key={form.formId}>
                <div className="recruiter-form-header">
                  <h3 className="recruiter-form-name">{form.formName}</h3>
                  <div className={`recruiter-form-status ${form.isActive ? 'active' : 'inactive'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="recruiter-form-details">
                  <div className="detail-row">
                    <span className="label">Mentor:</span>
                    <span className="value">{form.mentorName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">College:</span>
                    <span className="value">{form.collegeName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Submissions:</span>
                    <span className="value">{form.submissionCount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(form.createdAt)}</span>
                  </div>
                </div>

                <div className="recruiter-form-actions">
                  <button
                    className="recruiter-view-responses-btn"
                    onClick={() => handleViewResponses(form.formId)}
                  >
                    Update Form
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterFeedbackForms;
