import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import feedbackFormEmptyImage from '../../images/empty-state-images/feedback-form-empty-state-image.png';
import searchEmptyStateImage from '../../images/empty-state-images/no-search-results.png';
import './FeedbackFormsList.css';

const FeedbackFormsList = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const applicantId = user.id;

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/api/feedbackforms/getallfeedbackforms`,
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

    if (applicantId) {
      fetchForms();
    }
  }, [applicantId]);

  const filteredForms = forms.filter(form => {
    const nameMatch = form.formName?.toLowerCase().includes(searchQuery.toLowerCase());
    const mentorMatch = form.mentorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const collegeMatch = form.collegeName?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || mentorMatch || collegeMatch;
  });

  const formatCreatedDate = (createdAtArray) => {
    if (!createdAtArray || !Array.isArray(createdAtArray) || createdAtArray.length < 6) {
      return 'Unknown';
    }

    const [year, month, day, hour, minute, second] = createdAtArray;
    const date = new Date(year, month - 1, day, hour, minute, second); // month - 1 because JS months are 0-indexed

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const FeedbackFormSkeleton = ({ count = 8 }) => {
    return (
      <div className="feedback-forms-skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div className="feedback-forms-skeleton-card" key={i}>
            <div className="feedback-forms-skeleton-body">
              {/* Header skeleton */}
              <div className="feedback-forms-skeleton-header">
                <div className="feedback-forms-skeleton-element feedback-forms-skeleton-title"></div>
              </div>

              {/* Details skeleton */}
              <div className="feedback-forms-skeleton-details">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="feedback-forms-skeleton-row">
                    <div className="feedback-forms-skeleton-element feedback-forms-skeleton-label"></div>
                    <div className="feedback-forms-skeleton-element feedback-forms-skeleton-value"></div>
                  </div>
                ))}
              </div>

              {/* Actions skeleton */}
              <div className="feedback-forms-skeleton-actions">
                <div className="feedback-forms-skeleton-element feedback-forms-skeleton-button"></div>
              </div>
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

          {loading ? (
            <FeedbackFormSkeleton count={8} />
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
            <div className="newCards-grid">
              {filteredForms.map((form) => (
                <div className="newCard" key={form.formId}>

                  <div className="newCard-body">
                    <div className="card-header" style={{ justifyContent: "space-between", width: "100%" }}>
                      <div className="mentor-text">
                        <h3 className="mentor-name">{form.mentorName}</h3>
                        <p className="mentor-role">Technical Mentor</p>
                      </div>
                      <i className="fa fa-file-text-o" style={{ fontSize: "20px", color: "#F97316" }}></i>
                    </div>
                    <div className='form-title-and-college'>
                      <h3 id="form-title">{form.formName}</h3>

                      <p className="college-name"><span style={{ color: "black" }}>College:</span> {form.collegeName}</p>
                    </div>
                    <div className="feedback-form-actions">
                      <button
                        className="view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/feedback-form-fill/${form.formId}`);
                        }}
                      >
                        <i className="fa fa-pencil-square-o" style={{ marginRight: "8px" }}></i>
                        Fill Form
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackFormsList;