import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useNavigate } from 'react-router-dom';
import './RecruiterHackathonDashboard.css';

function RecruiterHackathonDashboard() {
    const { user } = useUserContext();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHackathons();
    }, [user.id]);

    const fetchHackathons = async () => {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            if (jwtToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
            }
            const response = await axios.get(`${apiUrl}/recruiter/hackathons/getAllCreadtedHackathons/${user.id}`);
            setHackathons(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching hackathons:', error);
            setLoading(false);
        }
    };

    const formatDate = (dateArray) => {
        if (!dateArray || dateArray.length < 3) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[dateArray[1] - 1]} ${dateArray[2]}, ${dateArray[0]}`;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'ACTIVE': { label: 'active', className: 'is-active' },
            'UPCOMING': { label: 'Upcoming', className: 'is-upcoming' },
            'COMPLETED': { label: 'Completed', className: 'is-completed' }
        };
        const config = statusMap[status] || statusMap['ACTIVE'];
        return (
            <span className={`rh-status-badge ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const calculateSubmissionPercentage = (hackathon) => {
        const subs = Number(hackathon.submissionCount) || 0;
        const regs = Number(hackathon.registrationCount) || 0;
        if (regs <= 0) return 0;
        return Math.floor((subs / regs) * 100);
    };

    if (loading) {
        return (
            <div className="dashboard__content rh-hackathon-dashboard">
                <div className="rh-loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard__content rh-hackathon-dashboard">
            <section className="rh-page-title-dashboard">
                <div className="rh-themes-container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12">
                            <div className="rh-title-dashboard">
                                <div className="rh-page-title">Hackathon Dashboard</div>
                                <button className="rh-new-hackathon-btn" onClick={() => navigate('/recruiter-hackathons-create')}>
                                    Create Hackathon
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rh-dashboard-section">
                <div className="rh-themes-container">
                    <div className="rh-hackathons-list">
                {hackathons.length === 0 ? (
                    <div className="rh-no-hackathons">
                        <p>No hackathons created yet. Create your first hackathon!</p>
                    </div>
                ) : (
                    hackathons.map((hackathon) => (
                        <div key={hackathon.id} className="rh-hackathon-card">
                            <div className="rh-card-header">
                                <div className="rh-header-left">
                                    <h2 className="rh-hackathon-title">{hackathon.title}</h2>
                                    <p className="rh-hackathon-dates">
                                        {formatDate(hackathon.startAt)} - {formatDate(hackathon.endAt)}
                                    </p>
                                </div>
                                <div className="rh-header-right">
                                    {getStatusBadge(hackathon.status)}
                                </div>
                            </div>

                            <div className="rh-card-content">
                                <div className="rh-stats-section">
                                    <div className="rh-stat-item rh-submissions">
                                        <div className="rh-stat-circle">
                                            <svg className="rh-progress-ring" width="80" height="80">
                                                <circle
                                                    className="rh-progress-ring-circle-bg"
                                                    stroke="#FEF3C7"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    r="32"
                                                    cx="40"
                                                    cy="40"
                                                />
                                                <circle
                                                    className="rh-progress-ring-circle"
                                                    stroke="#F59E0B"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    r="32"
                                                    cx="40"
                                                    cy="40"
                                                    strokeDasharray={`${calculateSubmissionPercentage(hackathon) * 2.01} 201`}
                                                    strokeDashoffset="0"
                                                />
                                                <text
                                                    x="50%"
                                                    y="50%"
                                                    textAnchor="middle"
                                                    dy=".3em"
                                                    className="rh-progress-text"
                                                    fill="#F59E0B"
                                                    transform="rotate(90 40 40)"
                                                >
                                                    {calculateSubmissionPercentage(hackathon)}%
                                                </text>
                                            </svg>
                                        </div>
                                        <div className="rh-stat-details">
                                            <h3 className="rh-stat-title">Submissions</h3>
                                            <p className="rh-stat-value">{Number(hackathon.submissionCount) || 0} Submissions</p>
                                        </div>
                                    </div>

                                    <div className="rh-stat-item rh-engagement">
                                        <div className="rh-engagement-icon">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <circle cx="9" cy="7" r="4" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="rh-stat-details">
                                            <h3 className="rh-stat-title">Registrations</h3>
                                            <p className="rh-stat-value rh-engagement-value">{(Number(hackathon.registrationCount) || 0).toLocaleString()}</p>
                                            <p className="rh-stat-subtitle">registered users</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rh-card-actions">
                                    <button
                                        className="rh-btn-view"
                                        onClick={() => navigate(`/hackathon-view-details/${hackathon.id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default RecruiterHackathonDashboard;
