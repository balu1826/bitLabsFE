import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import './MentorRating.css';

const MentorRating = () => {
    const { user } = useUserContext();
    const [mentorsData, setMentorsData] = useState({}); // Raw object { mentorName: [colleges] }
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedColleges, setSelectedColleges] = useState({}); // { mentorName: selectedCollege }
    const [selectedCategories, setSelectedCategories] = useState({}); // { mentorName: selectedCategory }

    const [selectedMentorForModal, setSelectedMentorForModal] = useState(null); // { name, college, category }
    const [ratings, setRatings] = useState({ overall: null, college: null, category: null });
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetchMentorsAction = async () => {
            try {
                setLoading(true);
                const jwtToken = localStorage.getItem('jwtToken');
                const response = await axios.get(
                    `${apiUrl}/api/feedbackforms/getAllMentorNamesAndCollegeNames`,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                );

                setMentorsData(response.data || {});

                // Initialize selected colleges and categories
                const initialSelectedColleges = {};
                const initialSelectedCategories = {};
                Object.keys(response.data || {}).forEach(name => {
                    initialSelectedColleges[name] = "All";
                    initialSelectedCategories[name] = "false"; // Default to false
                });
                setSelectedColleges(initialSelectedColleges);
                setSelectedCategories(initialSelectedCategories);

            } catch (err) {
                console.error('Error fetching mentors:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchMentorsAction();
        }
    }, [user?.id]);

    const handleCollegeChange = (mentorName, collegeName) => {
        setSelectedColleges(prev => ({
            ...prev,
            [mentorName]: collegeName
        }));
    };

    const handleCategoryChange = (mentorName, category) => {
        setSelectedCategories(prev => ({
            ...prev,
            [mentorName]: category
        }));
    };

    const fetchRating = async (mentorName) => {
        const college = selectedColleges[mentorName];
        const category = selectedCategories[mentorName];
        if (!college) return;

        setSelectedMentorForModal({ name: mentorName, college, category });
        setModalLoading(true);
        setRatings({ overall: null, college: null, category: null });

        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const headers = { Authorization: `Bearer ${jwtToken}` };

            // Encode parameters to handle spaces and special characters
            const encodedName = encodeURIComponent(mentorName);
            const encodedCollege = college ? encodeURIComponent(college) : "";

            let overallRating = 0;
            let collegeRating = 0;
            let categoryRating = 0;

            // Fetch Overall Rating
            try {
                const overallRes = await axios.get(
                    `${apiUrl}/api/feedbackform/mentor/${encodedName}/calculateRatingOfMentor`,
                    { headers }
                );
                // Handle both number and object responses
                overallRating = typeof overallRes.data === 'object' ? (overallRes.data.rating || 0) : overallRes.data;
            } catch (err) {
                console.error('Error fetching overall rating:', err);
            }

            // Fetch Particular College Rating
            if (college !== "All") {
                try {
                    const collegeRes = await axios.get(
                        `${apiUrl}/api/feedbackform/mentor/${encodedName}/calculateRatingOfMentor?collegeName=${encodedCollege}`,
                        { headers }
                    );
                    collegeRating = typeof collegeRes.data === 'object' ? (collegeRes.data.rating || 0) : collegeRes.data;
                } catch (err) {
                    console.error('Error fetching college rating:', err);
                }
            } else {
                collegeRating = overallRating;
            }

            // Fetch Category Rating (Always if selected)
            if (category) {
                try {
                    // If college is "All", we omit collegeName to get ratings across all colleges
                    const categoryUrl = college === "All"
                        ? `${apiUrl}/api/feedbackform/mentor/${encodedName}/calculateRatingOfMentor?category=${category}`
                        : `${apiUrl}/api/feedbackform/mentor/${encodedName}/calculateRatingOfMentor?collegeName=${encodedCollege}&category=${category}`;

                    const categoryRes = await axios.get(categoryUrl, { headers });
                    categoryRating = categoryRes.data;
                } catch (err) {
                    console.error('Error fetching category rating:', err);
                }
            }

            setRatings({
                overall: overallRating,
                college: collegeRating,
                category: categoryRating
            });

        } catch (err) {
            console.error('Unexpected error in fetchRating:', err);
        } finally {
            setModalLoading(false);
        }
    };

    const mentorNames = Object.keys(mentorsData).filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        return (
            <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa ${i < fullStars ? 'fa-star' : 'fa-star-o'}`}></i>
                ))}
            </div>
        );
    };

    return (
        <div className="border-style">
            <div className="blur-border-style"></div>
            <div className="dashboard__content">
                <div className="mentor-rating-container">
                    <div className="mentor-rating-header">
                        <div className="main-header-row" style={{ marginTop: 0 }}>
                            <h2 className="main-heading">Mentor Ratings</h2>
                            <div className="hackathon-search-box">
                                <i className="fa fa-search search-icon1"></i>
                                <input
                                    type="text"
                                    placeholder="Search mentors..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="hackathon-search-input"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <p>Loading mentors...</p>
                        </div>
                    ) : mentorNames.length === 0 ? (
                        <div className="no-mentors">
                            <p>No mentors found.</p>
                        </div>
                    ) : (
                        <div className="mentors-grid">
                            {mentorNames.map((name) => (
                                <div className="mentor-card" key={name}>
                                    <div className="mentor-info">
                                        <h3>{name}</h3>
                                        <div className="college-select-wrapper">
                                            <label className="mentor-card-label">Colleges</label>
                                            <select
                                                value={selectedColleges[name] || "All"}
                                                onChange={(e) => handleCollegeChange(name, e.target.value)}
                                                className="mentor-college-dropdown"
                                            >
                                                <option value="All">All Colleges</option>
                                                {(mentorsData[name] || []).map((college, idx) => (
                                                    <option key={idx} value={college}>{college}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="category-select-wrapper" style={{ marginTop: '12px' }}>
                                            <label className="mentor-card-label">Category</label>
                                            <select
                                                value={selectedCategories[name] || "false"}
                                                onChange={(e) => handleCategoryChange(name, e.target.value)}
                                                className="mentor-college-dropdown"
                                            >
                                                <option value="true">true</option>
                                                <option value="false">false</option>
                                            </select>
                                        </div>
                                    </div>
                                    {selectedColleges[name] && (
                                        <div className="selected-college-display">
                                            Selected: <strong>{selectedColleges[name]}</strong>
                                        </div>
                                    )}
                                    <button
                                        className={`view-rating-btn ${!selectedColleges[name] ? 'disabled' : ''}`}
                                        onClick={() => fetchRating(name)}
                                        disabled={!selectedColleges[name]}
                                    >
                                        View Ratings
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedMentorForModal && (
                        <div className="rating-modal-overlay">
                            <div className="rating-modal">
                                <button className="close-modal" onClick={() => setSelectedMentorForModal(null)}>&times;</button>
                                <div className="modal-header">
                                    <h3>{selectedMentorForModal.name}</h3>
                                    <p>{selectedMentorForModal.college === "All" ? "Overall Performance" : selectedMentorForModal.college}</p>
                                </div>

                                {modalLoading ? (
                                    <p style={{ textAlign: 'center' }}>Calculating ratings...</p>
                                ) : (
                                    <div className="rating-section">
                                        <div className="rating-item">
                                            <span className="rating-label">Overall Rating</span>
                                            <div className="rating-value">{ratings.overall || '0.0'}</div>
                                            {renderStars(ratings.overall)}
                                        </div>
                                        {selectedMentorForModal.college !== "All" && (
                                            <div className="rating-item college">
                                                <span className="rating-label">Rating for {selectedMentorForModal.college}</span>
                                                <div className="rating-value">{ratings.college || '0.0'}</div>
                                                {renderStars(ratings.college)}
                                            </div>
                                        )}
                                        {selectedMentorForModal.category && typeof ratings.category === 'object' && ratings.category !== null && Object.keys(ratings.category).length > 0 && (
                                            <div className="rating-item detailed-ratings" style={{ background: '#f0fdf4', textAlign: 'left' }}>
                                                <span className="rating-label" style={{ textAlign: 'center', marginBottom: '15px', fontSize: '16px', fontWeight: '700' }}>
                                                    Category Ratings
                                                </span>
                                                <div className="category-metrics-list">
                                                    {Object.entries(ratings.category).map(([key, value]) => (
                                                        <div key={key} className="metric-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #dcfce7' }}>
                                                            <span className="metric-name" style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>
                                                                {key.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className="metric-value" style={{ fontWeight: '700', color: '#166534' }}>{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorRating;
