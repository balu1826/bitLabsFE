import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../../services/ApplicantAPIService';
import { useUserContext } from '../../common/UserProvider';
import { useNavigate, useParams } from 'react-router-dom';
import Snackbar from '../../common/Snackbar';
import './StaticFeedbackCreate.css'; // Reusing create styles

const StaticFeedbackUpdate = () => {
    const { id: formId } = useParams();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const recruiterId = user?.id;

    const [formData, setFormData] = useState({
        mentorName: '',
        collegeName: '',
        formName: '',
        description: '',
        isActive: true
    });

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                setLoading(true);
                const jwtToken = localStorage.getItem('jwtToken');
                const response = await axios.get(
                    `${apiUrl}/api/feedbackforms/getfeedbackFormById/${formId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`
                        }
                    }
                );
                const data = response.data;
                setFormData({
                    mentorName: data.mentorName || '',
                    collegeName: data.collegeName || '',
                    formName: data.formName || '',
                    description: data.description || '',
                    isActive: data.isActive !== undefined ? data.isActive : true
                });
            } catch (error) {
                console.error('Error fetching form details:', error);
                setSnackbar({ open: true, message: 'Failed to load form details.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        if (formId) {
            fetchFormDetails();
        }
    }, [formId]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.mentorName?.trim() || formData.mentorName?.trim().length < 3)
            newErrors.mentorName = 'Mentor name must be at least 3 characters';
        if (!formData.collegeName?.trim() || formData.collegeName?.trim().length < 3)
            newErrors.collegeName = 'College name must be at least 3 characters';
        if (!formData.formName?.trim() || formData.formName?.trim().length < 3)
            newErrors.formName = 'Form name must be at least 3 characters';
        if (!formData.description?.trim() || formData.description?.trim().length < 3)
            newErrors.description = 'Description must be at least 3 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            await axios.put(
                `${apiUrl}/api/feedbackforms/recruiter/updateFeedBackFormById/${formId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSnackbar({ open: true, message: 'Feedback form updated successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/recruiter-static-feedback');
            }, 1500);
        } catch (error) {
            console.error('Error updating feedback form:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to update feedback form.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="border-style"><div className="dashboard__content"><p>Loading...</p></div></div>;
    }

    return (
        <div className="border-style">
            <div className="blur-border-style"></div>
            <div className="dashboard__content">
                <div className="static-header-wrapper">
                    <h3 className="static-main-heading">Update Feedback Form</h3>
                    <button
                        className="back-to-forms-btn"
                        onClick={() => navigate('/recruiter-static-feedback')}
                    >
                        <i className="fa fa-arrow-left"></i> Back To Forms
                    </button>
                </div>

                <div className="static-feedback-container">
                    <form onSubmit={handleSubmit} className="static-feedback-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Mentor Name *</label>
                                <input
                                    type="text"
                                    name="mentorName"
                                    value={formData.mentorName}
                                    onChange={handleInputChange}
                                    className={errors.mentorName ? 'error' : ''}
                                />
                                {errors.mentorName && <span className="error-message">{errors.mentorName}</span>}
                            </div>

                            <div className="form-group">
                                <label>College Name *</label>
                                <input
                                    type="text"
                                    name="collegeName"
                                    value={formData.collegeName}
                                    onChange={handleInputChange}
                                    className={errors.collegeName ? 'error' : ''}
                                />
                                {errors.collegeName && <span className="error-message">{errors.collegeName}</span>}
                            </div>

                            <div className="form-group full-width">
                                <label>Form Name *</label>
                                <input
                                    type="text"
                                    name="formName"
                                    value={formData.formName}
                                    onChange={handleInputChange}
                                    className={errors.formName ? 'error' : ''}
                                />
                                {errors.formName && <span className="error-message">{errors.formName}</span>}
                            </div>

                            <div className="form-group full-width">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={errors.description ? 'error' : ''}
                                    rows="4"
                                />
                                {errors.description && <span className="error-message">{errors.description}</span>}
                            </div>

                            <div className="form-group full-width">
                                <div className="status-radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="isActive"
                                            value="true"
                                            checked={formData.isActive === true}
                                            onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                                        />
                                        Active
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="isActive"
                                            value="false"
                                            checked={formData.isActive === false}
                                            onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                                        />
                                        InActive
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions-new">
                            <button
                                type="button"
                                className="cancel-link"
                                onClick={() => navigate('/recruiter-static-feedback')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-btn-new"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Form'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {snackbar.open && (
                <Snackbar
                    message={snackbar.message}
                    type={snackbar.type}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                />
            )}
        </div>
    );
};

export default StaticFeedbackUpdate;
