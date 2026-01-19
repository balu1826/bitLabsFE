import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./hackathonDetails.css";
import { useUserContext } from "../common/UserProvider";
import { apiUrl } from "../../services/ApplicantAPIService";

const HackathonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();
    const userId = user.id;
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registration, setRegistration] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        projectTitle: "",
        projectSummary: "",
        technologiesUsed: "",
        githubLink: "",
        demoLink: "",
    });
    
    const [techInput, setTechInput] = useState("");
    const [showTechSuggestions, setShowTechSuggestions] = useState(false);
    const [filteredTechs, setFilteredTechs] = useState([]);
    
    const skillsOptions = [
        'Java', 'C', 'C++', 'C Sharp', 'Python', 'HTML', 'CSS', 
        'JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 
        'JSP', 'Servlets', 'Spring', 'Spring Boot', 'Hibernate', 
        '.Net', 'Django', 'Flask', 'SQL', 'MySQL', 'SQL-Server', 
        'Mongo DB', 'Selenium', 'Regression Testing', 'Manual Testing'
    ];
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);


    useEffect(() => {
        const fetchHackathon = async () => {
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const response = await axios.get(
                    `${apiUrl}/api/hackathons/getHackathonDetails/${id}/${userId}`,
                    { headers: { Authorization: `Bearer ${jwtToken}` } }
                );
                setHackathon(response.data);
            } catch (error) {
                console.error("Error fetching hackathon details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHackathon();
    }, [id, userId]);

    const fetchRegistration = async () => {
        try {
            const jwtToken = localStorage.getItem("jwtToken");
            const res = await axios.get(
                `${apiUrl}/hackathons/${id}/getRegistrationStatus/${userId}`,
                { headers: { Authorization: `Bearer ${jwtToken}` } }
            );
            setRegistration(res.data);
        } catch (error) {
            console.error("Error while getting registration:", error);
            setRegistration(null);
        }
    };

    useEffect(() => {
        fetchRegistration();
    }, [id, userId]);

    const handleRegisterClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmRegister = async () => {
        setShowConfirmation(false);
        try {
            const jwtToken = localStorage.getItem("jwtToken");
            await axios.post(
                `${apiUrl}/hackathons/${id}/registerForHackathon/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${jwtToken}` } }
            );
            setShowThankYou(true);
            await fetchRegistration();
        } catch (err) {
            console.error(err);
        }
    };

    const closeThankYouModal = () => {
        setShowThankYou(false);
    };

    const handleSubmitClick = () => {
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    const handleTechInput = (e) => {
        const value = e.target.value;
        setTechInput(value);
        
        if (value.trim() === '') {
            setFilteredTechs([]);
            setShowTechSuggestions(false);
            return;
        }
        
        const filtered = skillsOptions.filter(tech => 
            tech.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredTechs(filtered);
        setShowTechSuggestions(true);
    };
    
    const selectTech = (tech) => {
        const currentTechs = formData.technologiesUsed 
            ? formData.technologiesUsed.split(',').map(t => t.trim()).filter(t => t)
            : [];
            
        if (!currentTechs.includes(tech)) {
            const newTechs = [...currentTechs, tech];
            setFormData(prev => ({
                ...prev,
                technologiesUsed: newTechs.join(', ')
            }));
            
            const techInput = document.querySelector('input[name="techInput"]');
            if (techInput) {
                techInput.setCustomValidity('');
                techInput.reportValidity();
            }
        }
        
        setTechInput('');
        setShowTechSuggestions(false);
    };
    
    const removeTech = (techToRemove) => {
        const currentTechs = formData.technologiesUsed 
            ? formData.technologiesUsed.split(',').map(t => t.trim()).filter(t => t)
            : [];
            
        const newTechs = currentTechs.filter(tech => tech !== techToRemove);
        setFormData(prev => ({
            ...prev,
            technologiesUsed: newTechs.join(', ')
        }));
    };

    const validateGitHubUrl = (url) => {
        const githubRepoRegex = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/(tree|blob)\/[A-Za-z0-9_.\-_/]+)?\/?$/i;
        return githubRepoRegex.test(url);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!registration) return;

        const techInput = e.target.querySelector('input[name="techInput"]');
        const githubInput = e.target.querySelector('input[name="githubLink"]');
        
        if (techInput) techInput.setCustomValidity('');
        if (githubInput) githubInput.setCustomValidity('');
        
        const hasTechnologies = formData.technologiesUsed && formData.technologiesUsed.trim() !== '';
        
        const isGitHubValid = formData.githubLink && validateGitHubUrl(formData.githubLink);
        
        if (!e.target.checkValidity()) {
            return;
        }
        
        if (!isGitHubValid) {
            if (githubInput) {
                githubInput.setCustomValidity('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)');
                githubInput.reportValidity();
            }
            return;
        }

         if (!hasTechnologies) {
            if (techInput) {
                techInput.setCustomValidity('Please select at least one technology');
                techInput.reportValidity();
            }
            return;
        }

        const payload = {
            registrationId: registration.id,
            userId: userId,
            ...formData,
        };

        try {
            setSubmitting(true);
            const jwtToken = localStorage.getItem("jwtToken");
            await axios.post(`${apiUrl}/api/hackathons/${id}/submit`, payload, {
                headers: { Authorization: `Bearer ${jwtToken}` },
            });
            setRegistration({ ...registration, submitStatus: true });
            setShowForm(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!hackathon) return <div>No hackathon found.</div>;

    const renderActionButton = () => {
        const status = hackathon.status.toUpperCase();

        if (!registration) {
            if (status === "UPCOMING" || status === "ACTIVE") {
                return (
                    <button className="hackathon-action-button" onClick={handleRegisterClick}>
                        Register now
                    </button>
                );
            }

            if (status === "COMPLETED") {
                return (
                    <button className="hackathon-action-button" disabled>
                        Not registered
                    </button>
                );
            }
        }


        if (status === "COMPLETED") {
            return <button className="hackathon-action-button" disabled>Completed</button>;
        }

        if (status === "UPCOMING" && registration.registaratinStatus) {
            return <button className="hackathon-action-button" disabled>Already registered</button>;
        }

        if (status === "ACTIVE") {
            if (!registration.submitStatus) {
                return (
                    <button className="hackathon-action-button" onClick={handleSubmitClick}>
                        Submit your work
                    </button>
                );
            } else {
                return <button className="hackathon-action-button" disabled>Response submitted</button>;
            }
        }

        return null;
    };

    function toDateObject(value) {
        if (!value) return null;

        if (Array.isArray(value)) {
            const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, nano = 0] = value;
            return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
        }

        return new Date(value);
    }

    function formatToDateString(value) {
        const date = toDateObject(value);
        return date && !isNaN(date.getTime()) ? date.toDateString() : "Invalid date";
    }



    return (
     <div className="border-style">

        <div className="blur-border-style"></div>
    <div className="dashboard__content">
        <div className="row mr-0 ml-10 extraSpace">
            <div className="hackathon-page-wrapper">

                <div
                    className="hackathon-details-wrapper"
                    style={{ flex: showForm ? 2 : 1, transition: "flex 0.3s" }}
                >
                    <div className="hackathon-top-section">
                        <h1 className="hackathon-title">{hackathon.title}</h1>
                    </div>

                    <div className="breadcrumb-navigation">
                        <span className="breadcrumb-link" onClick={() => navigate('/applicanthome')}>Dashboard</span>
                        <span className="breadcrumb-separator"> / </span>
                        <span className="breadcrumb-link" onClick={() => navigate('/applicant-hackathon')}>Innovation arena</span>
                    </div>

                    <div className="hackathon-body">
                        <div className="hackathon-left-column">
                            <div className="hackathon-banner-wrapper">
                                <img
                                    src={hackathon.bannerUrl}
                                    alt={hackathon.title}
                                    className="hackathon-banner"
                                    onError={(e) => (e.target.src = "https://via.placeholder.com/900x300?text=No+Image")}
                                />
                            </div>
                            <div className="hackathon-combine-info-box">
                                <section className="hackathon-info-box">
                                    <h3 className="info-box-title">Basic details</h3>
                                    <div className="info-item">
                                        <h4>Organized by</h4>
                                        <p>{hackathon.company}</p>
                                    </div>
                                    <div className="info-item">
                                        <h4>Start date</h4>
                                        <p>{formatToDateString(hackathon.startAt)}</p>
                                    </div>
                                    <div className="info-item">
                                        <h4>End date</h4>
                                        <p>{formatToDateString(hackathon.endAt)}</p>
                                    </div>
                                </section>
                                <section className="hackathon-info-box">
                                    <section className="eligibility-section">
                                        <h3>Eligibility criteria</h3>
                                        <div className="hackathon-tag-list">
                                            {hackathon.eligibility.split(",").map((item, index) => (
                                                <span key={index} className="hackathon-tag">{item.trim()}</span>
                                            ))}
                                        </div>
                                    </section>
                                    <hr></hr>
                                    <section className="tech-stack-section">
                                        <h3>Suggested tech stack</h3>
                                        <div className="hackathon-tag-list">
                                            {hackathon.allowedTechnologies.split(",").map((tech, index) => (
                                                <span key={index} className="hackathon-tech-tag">{tech.trim()}</span>
                                            ))}
                                        </div>
                                    </section></section></div>
                        </div>

                        <div className="hackathon-right-column card">
                            <section>
                                <h3>Description</h3>
                                <p>{hackathon.description}</p>
                            </section>

                            {hackathon.instructions && hackathon.instructions.trim() !== "" && (
                                <section>
                                    <h3>Instructions</h3>
                                    <ul>
                                        {hackathon.instructions.split("\n").map((line, index) => (
                                            <li key={index}>{line.replace(/^\d+\.\s*/, "")}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            <div className="action-buttons-row">
                                {renderActionButton()}
                            </div>
                        </div>
                    </div>
                </div>

                {showForm && !registration.submitStatus && (
                    <div className="modal-overlay-new">
                        <div className="modal-content-new">
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={() => setShowForm(false)}
                            >
                                <p>&times;</p>
                            </button>
                            <h3>Project submit form</h3>
                            <form onSubmit={handleFormSubmit}>
                                <div className="form-content">
                                    <div className="form-group">
                                        <label className="required">Project title</label>
                                        <input
                                            type="text"
                                            name="projectTitle"
                                            value={formData.projectTitle}
                                            onChange={handleFormChange}
                                            required
                                            minLength={5}
                                            maxLength={100}
                                            placeholder={hackathon?.title ? `${hackathon.title}` : "Enter a project title"}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="required">GitHub link</label>
                                        <input
                                            type="url"
                                            name="githubLink"
                                            value={formData.githubLink}
                                            onChange={(e) => {
                                                handleFormChange(e);
                                                if (e.target.validity.customError) {
                                                    e.target.setCustomValidity('');
                                                }
                                            }}
                                            required
                                            placeholder="https://github.com/username/repository"
                                            pattern="https?://(www\.)?github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(/tree/[A-Za-z0-9_.\-_/]+)?/?"
                                            title="Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Project demo URL (Optional)</label>
                                        <input
                                            type="url"
                                            name="demoLink"
                                            value={formData.demoLink}
                                            onChange={handleFormChange}
                                            placeholder="Enter a valid demo URL (optional)"
                                            pattern="https?://.+"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="required">Technologies used</label>
                                        <div className="tech-input-container" style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                name="techInput"
                                                value={techInput}
                                                onChange={handleTechInput}
                                                onFocus={() => techInput && setShowTechSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowTechSuggestions(false), 200)}
                                                placeholder="Type and select technologies"
                                                className="form-control"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    background:"#f6f6f6",
                                                }} 
                                            />
                                            {showTechSuggestions && filteredTechs.length > 0 && (
                                                <div className="tech-suggestions" style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    zIndex: 10,
                                                    maxHeight: '200px',
                                                    overflowY: 'auto'
                                                }}>
                                                    {filteredTechs.map((tech, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => selectTech(tech)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #eee',
                                                                fontSize: '14px',
                                                                backgroundColor: formData.technologiesUsed.includes(tech) ? '#f0f0f0' : 'white',
                                                                ':hover': {
                                                                    backgroundColor: '#f5f5f5'
                                                                }
                                                            }}
                                                        >
                                                            {tech}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="selected-techs" style={{ 
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '5px',
                                                marginTop: '8px'
                                            }}>
                                                {formData.technologiesUsed && formData.technologiesUsed.split(',').map((tech, index) => {
                                                    const techName = tech.trim();
                                                    if (!techName) return null;
                                                    return (
                                                        <div key={index} style={{
                                                            backgroundColor: '#FFE9D8',
                                                            color:" #E87114",
                                                            padding: '4px 8px',
                                                            borderRadius: '17px',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            {techName}
                                                            <span 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeTech(techName);
                                                                }}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px',
                                                                    color: '#1A1A17'
                                                                }}
                                                            >
                                                                ×
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="required">Project summary</label>
                                        <textarea
                                            name="projectSummary"
                                            value={formData.projectSummary}
                                            onChange={handleFormChange}
                                            required
                                            minLength={20}
                                            maxLength={1000}
                                            placeholder="Briefly explain your project"
                                        />
                                    </div>
                                </div>
                                
                                <div className="newCard-footer">
                                    <button
                                        className="hackathon-action-button"
                                        type="submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Submitting..." : "Submit"}
                                    </button>
                                     <button
                                        type="button"
                                        className="hackathon-close-btn"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showConfirmation && (
                    <div className="modal-overlay-new">
                        <div className="modal-content-new">
                            <button className="modal-close-button" onClick={() => setShowConfirmation(false)}>
                                <p>&times;</p>
                            </button>
                            <h3>Registration confirmation</h3>
                            <p>Would you like to continue with existing registration?</p>
                            <div className="modal-buttons">
                                <button className="modal-button confirm" onClick={handleConfirmRegister}>
                                    Register now
                                </button>
                                <button className="modal-button cancel" onClick={() => setShowConfirmation(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showThankYou && (
                    <div className="modal-overlay-new">
                        <div className="modal-content-new">
                            <button className="modal-close-button" onClick={closeThankYouModal}>
                                &times;
                            </button>
                            <svg xmlns="http://www.w3.org/2000/svg" width="78.96" height="75.182" viewBox="0 0 78.96 75.182">
                                <g id="clapping_4441527" transform="translate(0 -12.248)">
                                    <g id="Group_215" data-name="Group 215" transform="translate(10.256 15.512)">
                                        <path id="Path_392" data-name="Path 392" d="M134.429,37.216c-.814-.229-1.634-.442-2.444-.632a3.635,3.635,0,0,0-4.377,4.323l2.722,2.754a3.635,3.635,0,0,0-4.454,3.771c.621,1.389,3.427,2.73,6.816,4.4a3.635,3.635,0,0,0-4.8,3.316c.881,3.194,6.42,2.271,16.813,9.537,6.953,4.861,30.118-1.2,30.118-1.2a11.943,11.943,0,0,0,1.653-8.572l-.265-2.035a14.959,14.959,0,0,1,1.429-8.57l2.716-5.484c1.468-2.965-.221-4.349-.221-4.349-2.926-1.449-6.856,2.577-9.315,7.543-1.487,3-3.457,8.216-3.457,8.216s-5.316-5.968-10.533-9.255a66.64,66.64,0,0,0-17.939-7.472,3.634,3.634,0,0,0-4.458,3.707Z" transform="translate(-116.713 -33.412)" fill="#ebae9d" />
                                        <path id="Path_393" data-name="Path 393" d="M139.874,84.763a48.109,48.109,0,0,1,16.595,7.109,1.157,1.157,0,0,0,1.324-1.9c-5.182-3.619-11.353-6.155-19.359-7.679-.427-.081-.857-.175-1.281-.288A3.634,3.634,0,0,0,139.874,84.763Z" transform="translate(-126.257 -74.514)" fill="#e09380" />
                                        <path id="Path_394" data-name="Path 394" d="M148.376,135.6a1.157,1.157,0,0,0-.2-1.623c-4.989-3.881-11.087-6.623-19.022-8.479a11.91,11.91,0,0,1-3.235-1.173,3.635,3.635,0,0,0,2.8,3.306,46.7,46.7,0,0,1,18.038,8.172A1.156,1.156,0,0,0,148.376,135.6Z" transform="translate(-116.754 -110.301)" fill="#e09380" />
                                        <path id="Path_395" data-name="Path 395" d="M191.2,40.313s.431,1.123-.7,3.412l-3.179,6.42a14.96,14.96,0,0,0-1.429,8.57l.265,2.035a11.943,11.943,0,0,1-1.653,8.572l-4.962-3.582a14.959,14.959,0,0,1-5.05-7.07l-.678-2.009c-.929-2.75-2.487-4.154-4.473-3.483l-.876.294a7.708,7.708,0,0,0-.7-.7c-4.989-3.881-11.087-6.623-19.022-8.479a15.748,15.748,0,0,1-3.239-1.237,3.635,3.635,0,0,0,2.8,3.37,46.861,46.861,0,0,1,17.876,8.048c-1.323.883-1.9,2.336-.816,5.555,1.072,3.176,2.554,7.61,2.554,7.61s-3.75,1.816-11.545,1.981a52.521,52.521,0,0,0-14.307-7.146,11.916,11.916,0,0,1-3.1-1.485,3.635,3.635,0,0,0,2.461,3.565,46.7,46.7,0,0,1,17.149,9.9c.458.435,23.692,6.408,23.692,6.408l4.944-7.813a13.879,13.879,0,0,0,2.035-9.214l-.7-5.413a14.96,14.96,0,0,1,1.429-8.57l1.937-3.912C193.187,43.338,193.077,41.243,191.2,40.313Z" transform="translate(-127.781 -39.249)" fill="#e09380" />
                                        <path id="Path_396" data-name="Path 396" d="M134.555,151.972l-8.267-4.159s-2.318-10.1-7.1-16.975l-4.326-3.33a14.959,14.959,0,0,1-5.05-7.07l-1.4-4.136c-.929-2.75-2.487-4.154-4.473-3.483-3.093,1.044-3.026,6.67-1.253,11.921,1.072,3.176,4.455,7.163,4.455,7.163s-4.112,1.995-12.684,1.995A46.7,46.7,0,0,1,75.2,129.271a3.634,3.634,0,0,0-5.113,2.76,7.96,7.96,0,0,0,2.074,3.842,3.636,3.636,0,0,0-5.062,2.49s.4,2.629,3.872,3.843a3.631,3.631,0,0,0-2.1,2.567s.206,2.8,5.385,5.48a3.62,3.62,0,0,0-.662,1.424s8.413,9.661,28.045,9.661a143.691,143.691,0,0,0,14.862-.948l18.053,7.72Z" transform="translate(-67.009 -100.433)" fill="#ffcdbe" />
                                        <g id="Group_214" data-name="Group 214" transform="translate(0 30.405)">
                                            <path id="Path_397" data-name="Path 397" d="M151.418,372.93a106.032,106.032,0,0,1-14.625.888c-7.89,0-21.954-3.277-27.32-7.379a3.633,3.633,0,0,1-.725-.74,3.634,3.634,0,0,0,1.342,3.67c5.366,4.1,18.814,7.533,26.7,7.533a106.032,106.032,0,0,0,14.625-.888l18.29,9.2v-3.084Z" transform="translate(-102.162 -344.86)" fill="#ebae9d" />
                                            <path id="Path_398" data-name="Path 398" d="M88.675,288.232a1.157,1.157,0,0,0-.982-1.308,68.47,68.47,0,0,1-18.58-5.695,7.988,7.988,0,0,1-2.517-1.863,3.635,3.635,0,0,0,2.023,4.112,68.415,68.415,0,0,0,18.747,5.735,1.157,1.157,0,0,0,1.308-.982Z" transform="translate(-66.505 -271.841)" fill="#ebae9d" />
                                            <path id="Path_399" data-name="Path 399" d="M88.333,242.15c6.75,3.108,14.883,5.118,18.747,5.118a1.157,1.157,0,1,0,0-2.313c-3.828,0-12-2.011-18.747-5.118a5.846,5.846,0,0,1-2.074-1.529A3.635,3.635,0,0,0,88.333,242.15Z" transform="translate(-83.178 -237.115)" fill="#ebae9d" />
                                            <path id="Path_400" data-name="Path 400" d="M99.334,328.945a79.721,79.721,0,0,1-19.3-6.577,5.741,5.741,0,0,1-1.893-1.44,3.635,3.635,0,0,0,2.033,4.065,83.949,83.949,0,0,0,18.747,6.228,1.157,1.157,0,1,0,.412-2.276Z" transform="translate(-76.279 -306.993)" fill="#ebae9d" />
                                            <path id="Path_401" data-name="Path 401" d="M404.824,230.571a41.862,41.862,0,0,1,2.478,7.545l2.085,9.272a1.157,1.157,0,0,0,1.8.687l.741-.529-2.029-9.021A13.88,13.88,0,0,0,404.824,230.571Z" transform="translate(-352.649 -230.571)" fill="#ebae9d" />
                                        </g>
                                    </g>
                                    <g id="Group_216" data-name="Group 216" transform="translate(0 12.248)">
                                        <path id="Path_402" data-name="Path 402" d="M77.8,87.43a1.15,1.15,0,0,1-.519-.124L59.317,78.268c-.772.106-2.711.348-5.58.548a1.157,1.157,0,1,1-.161-2.308c3.6-.251,5.739-.576,5.76-.58a1.155,1.155,0,0,1,.7.11l18.29,9.2a1.157,1.157,0,0,1-.521,2.19ZM44.887,79.116a60.047,60.047,0,0,1-14.6-2.269c-5.624-1.536-10.171-3.49-12.8-5.5a4.823,4.823,0,0,1-1.608-5.4q-1.112-.477-2.2-.98a4.8,4.8,0,0,1-2.348-6.355q.057-.123.12-.242a4.791,4.791,0,0,1,.79-8.611q.171-.063.344-.113-.075-.164-.138-.335a4.791,4.791,0,0,1,6.5-6.012A53.734,53.734,0,0,0,26.3,46.071a1.157,1.157,0,1,1-.649,2.22,56.047,56.047,0,0,1-7.681-2.89,2.477,2.477,0,1,0-2.072,4.5c5.236,2.41,13.708,5.012,18.263,5.012a1.157,1.157,0,0,1,0,2.313c-3.875,0-12.128-1.954-19.231-5.224h0a2.477,2.477,0,0,0-2.071,4.5,66.982,66.982,0,0,0,18.427,5.641,1.157,1.157,0,0,1-.327,2.29,68.052,68.052,0,0,1-17.41-5.088,2.481,2.481,0,0,0,1.092,3.52,82.993,82.993,0,0,0,18.47,6.14,1.157,1.157,0,0,1-.412,2.276,79.583,79.583,0,0,1-14.678-4.445,2.494,2.494,0,0,0,.871,2.669c4.322,3.3,16.884,7.3,26,7.3,1.292,0,2.6-.019,3.875-.058a1.157,1.157,0,1,1,.069,2.312c-1.3.039-2.63.058-3.945.058ZM77.8,68.208a1.152,1.152,0,0,1-.519-.124l-8.267-4.159a1.157,1.157,0,0,1-.609-.779l-2.029-9.021a12.748,12.748,0,0,0-4.653-7.291L57.4,43.5a16.064,16.064,0,0,1-5.44-7.616l-1.4-4.136a5.486,5.486,0,0,0-1.472-2.5,1.474,1.474,0,0,0-1.535-.262c-2.042.69-2.274,5.282-.527,10.455.99,2.932,4.209,6.747,4.242,6.785a1.157,1.157,0,0,1-.377,1.789c-.178.086-4.452,2.11-13.188,2.11a40.1,40.1,0,0,1-7.146-.675,1.157,1.157,0,0,1,.414-2.276,39.71,39.71,0,0,0,4.493.563A50.579,50.579,0,0,0,23.52,41.908a4.789,4.789,0,0,1-1.768-8,4.789,4.789,0,0,1-.917-8.86q-.107-.146-.2-.3a4.791,4.791,0,0,1,5.161-7.192c.394.092.794.19,1.2.294a4.791,4.791,0,0,1,5.7-3.37A67.636,67.636,0,0,1,50.985,22.1a56.239,56.239,0,0,1,9.5,8.1c.711-1.8,1.862-4.632,2.833-6.592a1.157,1.157,0,0,1,2.073,1.026C63.95,27.55,62,32.693,61.983,32.744a1.157,1.157,0,0,1-1.945.361c-.052-.058-5.272-5.887-10.286-9.046a65.931,65.931,0,0,0-17.586-7.324,2.477,2.477,0,1,0-1.128,4.824,50.991,50.991,0,0,1,14.7,5.8,3.962,3.962,0,0,1,1.078-.558,3.762,3.762,0,0,1,3.731.656,7.586,7.586,0,0,1,2.208,3.553l1.4,4.136a13.758,13.758,0,0,0,4.659,6.523L63.136,45a15.064,15.064,0,0,1,4.424,5.494l1.14-1.8a12.749,12.749,0,0,0,1.865-8.446l-.7-5.413A16.063,16.063,0,0,1,71.4,25.6l1.937-3.912a5.484,5.484,0,0,0,.724-2.806,1.475,1.475,0,0,0-.9-1.27c-1.558-.772-3.8,1.135-5.386,3.176a1.157,1.157,0,0,1-1.828-1.417c2.817-3.634,5.821-5.031,8.241-3.832,2.4,1.189,2.859,3.872,1.223,7.176l-1.937,3.912a13.759,13.759,0,0,0-1.318,7.907l.7,5.413a15.067,15.067,0,0,1-2.2,9.982L68.55,53.257q.045.18.086.361L70.544,62.1l7.778,3.913a1.157,1.157,0,0,1-.521,2.19ZM25.066,34.9a2.477,2.477,0,0,0-.8,4.823,50.707,50.707,0,0,1,15.171,8.073,36.146,36.146,0,0,0,9.056-1.334,25.064,25.064,0,0,1-3.656-6.268A21.487,21.487,0,0,1,43.581,32.2a8.492,8.492,0,0,1,.708-3.014,48.884,48.884,0,0,0-13.777-5.378,4.8,4.8,0,0,1-3.578-3.583c-.564-.151-1.123-.291-1.668-.418a2.477,2.477,0,1,0-1.128,4.825A49.656,49.656,0,0,1,41.13,31.922a1.157,1.157,0,0,1-1.325,1.9,47.334,47.334,0,0,0-16.2-6.931h0a2.477,2.477,0,0,0-1.127,4.825A53.5,53.5,0,0,1,39,38.674a1.157,1.157,0,0,1-1.3,1.916,45.577,45.577,0,0,0-12.013-5.613,2.458,2.458,0,0,0-.628-.082ZM8.62,40.789H1.157a1.157,1.157,0,0,1,0-2.313H8.62a1.157,1.157,0,0,1,0,2.313Zm2.491-11.218a1.152,1.152,0,0,1-.442-.088L3.774,26.627a1.157,1.157,0,1,1,.885-2.137l6.895,2.856a1.157,1.157,0,0,1-.443,2.226Zm6.069-9.733a1.153,1.153,0,0,1-.818-.339l-5.277-5.277a1.157,1.157,0,1,1,1.636-1.636L18,17.864a1.156,1.156,0,0,1-.818,1.974Z" transform="translate(0 -12.248)" />
                                    </g>
                                </g>
                            </svg>
                            <h3>Thanks for registration</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    </div>
    );
};

export default HackathonDetails;
