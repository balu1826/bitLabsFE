import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../../services/ApplicantAPIService';
import { useUserContext } from '../../common/UserProvider';
import { useNavigate } from 'react-router-dom';
import './StaticFeedbackDashboard.css';

const StaticFeedbackDashboard = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const recruiterId = user?.id;
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");

    useEffect(() => {
        const fetchForms = async () => {
            try {
                setLoading(true);
                const jwtToken = localStorage.getItem('jwtToken');
                let apiEndpoint = `${apiUrl}/api/feedbackforms/recruiter/getallfeedbackforms`;

                if (filterType === "Created by me" && recruiterId) {
                    apiEndpoint += `?recruiterId=${recruiterId}`;
                }

                const response = await axios.get(
                    apiEndpoint,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                );
                // We might want to filter only static forms here if there's a flag, 
                // but for now we'll show all as requested "like this" listing.
                setForms(response.data);
            } catch (err) {
                console.error('Error fetching feedback forms:', err);
            } finally {
                setLoading(false);
            }
        };

        if (recruiterId) {
            fetchForms();
        }
    }, [recruiterId, filterType]);

    const formatDate = (createdAt) => {
        if (!createdAt || !Array.isArray(createdAt) || createdAt.length < 3) {
            return 'Unknown date';
        }
        const [year, month, day] = createdAt;
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredForms = forms.filter(form =>
        form.formName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.mentorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="border-style">
            <div className="blur-border-style"></div>
            <div className="dashboard__content">
                <div className="row mr-0 ml-10 extraSpace" style={{ marginLeft: "1%" }}>
                    <div className="main-header-row">
                        <h1 className="main-heading">Static Feedback Forms</h1>
                        <div className="header-actions">
                            <div className="filter-container">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="feedback-filter-dropdown"
                                >
                                    <option value="All">All</option>
                                    <option value="Created by me">Created by me</option>
                                </select>
                            </div>
                            <div className="hackathon-search-box">
                                <i className="fa fa-search search-icon1"></i>
                                <input
                                    type="text"
                                    placeholder="Search forms..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="hackathon-search-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="static-feedback-dashboard">
                    <div className="static-create-banner">
                        <div className="static-create-info">
                            <h3>Create New Static Feedback Form</h3>
                            <p>Design custom feedback forms</p>
                        </div>
                        <button
                            className="static-create-btn"
                            onClick={() => navigate('/recruiter-static-feedback-form')}
                        >
                            <i className="fa fa-plus"></i>
                            Create Form
                        </button>
                    </div>

                    <div className="static-feedback-grid">
                        {(filteredForms.length === 0 && !loading) && (
                            <div className="no-feedback-message">
                                <p>No feedback available</p>
                            </div>
                        )}

                        {filteredForms.map((form) => (
                            <div className="static-form-card" key={form.formId}>
                                <div className="static-card-header">
                                    <h3>{form.formName}</h3>
                                    <span className={`static-status-badge ${form.isActive ? 'active' : 'inactive'}`}>
                                        {form.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                <div className="static-card-details">
                                    <div className="static-detail-row">
                                        <span className="static-label">Mentor:</span>
                                        <span className="static-value">{form.mentorName}</span>
                                    </div>
                                    <div className="static-detail-row">
                                        <span className="static-label">College:</span>
                                        <span className="static-value">{form.collegeName}</span>
                                    </div>
                                    <div className="static-detail-row">
                                        <span className="static-label">Submissions:</span>
                                        <span className="static-value">{form.submissionCount || 0}</span>
                                    </div>
                                    <div className="static-detail-row">
                                        <span className="static-label">Created:</span>
                                        <span className="static-value">{formatDate(form.createdAt)}</span>
                                    </div>
                                </div>
                                <button
                                    className="static-update-btn"
                                    onClick={() => navigate(`/recruiter-edit-feedback-form/${form.formId}`)}
                                >
                                    Update Form
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaticFeedbackDashboard;
