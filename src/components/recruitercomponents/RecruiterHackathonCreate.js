import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import './RecruiterHackathonCreate.css';
import '../applicantcomponents/hackathonDetails.css';

function RecruiterCreateHackathon() {
    const navigate = useNavigate();
    const { user } = useUserContext();

    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const toUTCDate = (s) => {
        if (!s) return null;
        const [y, m, d] = s.split('-').map(Number);
        return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
    };
    const addDays = (s, days) => {
        const d = toUTCDate(s);
        if (!d) return '';
        d.setUTCDate(d.getUTCDate() + days);
        return d.toISOString().slice(0, 10);
    };

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const defaultInstructions = `This is a solo participation hackathon; team involvement is not allowed.
Submit only one project per participant.
Focus on providing the best possible approach for the given use case.
Ensure your work is original and not copied from public sources.
Upload your source code to GitHub and provide the repository link while submitting.
Include a README file in your repository explaining setup and usage.
Generate and submit a demo link if required.
Complete and submit your project before the deadline; late submissions will not be accepted.
Clearly mention the technology stack used in your project.
Your submission will be judged on innovation, functionality, code quality, scalability, and presentation.`;
    const [showInstr, setShowInstr] = useState(false);
    const appendPreset = () => setForm((f) => ({ ...f, instructions: (f.instructions ? f.instructions + '\n\n' : '') + defaultInstructions }));
    const clearInstr = () => setForm((f) => ({ ...f, instructions: '' }));

    const [form, setForm] = useState({
        recruiterId: user?.id || '',
        title: '',
        description: '',
        company: '',
        bannerUrl: '',
        startAt: '',
        endAt: '',
        instructions: defaultInstructions,
        eligibility: 'All are eligible',
        allowedTechnologies: ''
    });

    const onChange = (e) => {
      const { name, value } = e.target;
      setForm((f) => ({ ...f, [name]: value }));
    };

    const nextStep = () => {
        setError('');
        setStep((s) => Math.min(s + 1, 3));
    };
    const prevStep = () => {
        setError('');
        setStep((s) => Math.max(s - 1, 1));
    };

    const validateStep1 = () => {
        if (!form.title || form.title.length < 5) return 'Title must be at least 5 characters';
        if (!form.startAt || !form.endAt) return 'Start and End dates are required';
        const minEnd = addDays(form.startAt, 1);
        if (form.endAt < minEnd) return 'End date must be at least 1 day after Start date';
        if (!form.company || form.company.length < 2) return 'Company must be at least 2 characters';
        if (!form.description || form.description.length < 20) return 'Description must be at least 20 characters';
        return '';
    };

    const validateStep2 = () => {
        if (!form.bannerUrl) return 'Banner URL is required';
        if (!form.instructions || form.instructions.trim().length === 0) return 'Instructions are required';
        if (!form.allowedTechnologies || form.allowedTechnologies.length < 1) return 'Provide at least one technology';
        return '';
    };

    const handleNext = () => {
        const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : '';
        setError(err);
        if (!err) nextStep();
    };

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            if (jwtToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
            }
            const payload = {
                ...form,
                recruiterId: user?.id,
                eligibility: (form.eligibility && form.eligibility.trim().length > 0) ? form.eligibility : 'All',
            };
            await axios.post(`${apiUrl}/recruiter/hackathons/createHackathon`, payload);
            navigate('/recruiter-hackathons');
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to create hackathon');
        } finally {
            setSubmitting(false);
        }
    };

    const Stepper = () => {
        const steps = [
            {
                key: 1, label: 'Details', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5V4.5C4 4.10218 4.15804 3.72064 4.43934 3.43934C4.72064 3.15804 5.10218 3 5.5 3H14.5L20 8.5V19.5C20 19.8978 19.842 20.2794 19.5607 20.5607C19.2794 20.842 18.8978 21 18.5 21H5.5C5.10218 21 4.72064 20.842 4.43934 20.5607C4.15804 20.2794 4 19.8978 4 19.5Z" stroke="currentColor" strokeWidth="1.8" /><path d="M14 3V8H20" stroke="currentColor" strokeWidth="1.8" /></svg>
                )
            },
            {
                key: 2, label: 'Guidelines', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="currentColor" strokeWidth="1.8" /><path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                )
            },
            {
                key: 3, label: 'Review', icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )
            }
        ];
        return (
            <div className={`rh-stepper step-${step}`}>
                <div className="rh-progress"><div className="rh-progress-fill" /></div>
                {steps.map((s, idx) => (
                    <div key={s.key} className={`rh-step ${step >= s.key ? 'active' : ''}`}>
                        <span className="rh-step-index">
                            <span className="rh-step-icon">{s.icon}</span>
                        </span>
                        {idx < steps.length - 1 && <span className="rh-step-line" />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard__content rh-create-root">
            <section className="rh-header">
                <div className="rh-container">
                    <div className="rh-row">
                        <div className="rh-col">
                            <div className="rh-page-title">Create New Hackathon</div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="rh-stepper-wrap">
                <div className="rh-container">
                    <Stepper />
                </div>
            </div>

            <section className="rh-section">
                <div className="rh-container">
                    <div className="rh-create-card">
                        <div className="rh-step-title">
                            {step === 1 && 'Step 1: Hackathon Details'}
                            {step === 2 && 'Step 2: Guidelines & Eligibility'}
                            {step === 3 && 'Step 3: Review & Publish'}
                        </div>

                        {error && <div className="rh-alert rh-alert-danger">{error}</div>}

                        {step === 1 && (
                            <div className="rh-form-grid">
                                <div className="rh-form-group">
                                    <label>Hackathon Name<span className="req">*</span></label>
                                    <input className="rh-input" name="title" value={form.title} onChange={onChange} placeholder="e.g., Innovate for Good" />
                                </div>
                                <div className="rh-form-row">
                                    <div className="rh-form-group">
                                        <label>Start Date<span className="req">*</span></label>
                                        <input className="rh-input" type="date" min={today} name="startAt" value={form.startAt} onChange={onChange} />
                                    </div>
                                    <div className="rh-form-group">
                                        <label>End Date<span className="req">*</span></label>
                                        <input className="rh-input" type="date" min={form.startAt ? addDays(form.startAt, 1) : today} name="endAt" value={form.endAt} onChange={onChange} />
                                    </div>
                                </div>
                                <div className="rh-form-group">
                                    <label>Company<span className="req">*</span></label>
                                    <input className="rh-input" name="company" value={form.company} onChange={onChange} placeholder="Your company name" />
                                </div>
                                <div className="rh-form-group">
                                    <label>Description<span className="req">*</span></label>
                                    <textarea className="rh-textarea" name="description" value={form.description} onChange={onChange} rows={5} placeholder="Describe goals, themes, and what makes it unique." />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="rh-form-grid">
                                <div className="rh-form-group">
                                    <label>Banner URL<span className="req">*</span></label>
                                    <input className="rh-input" name="bannerUrl" value={form.bannerUrl} onChange={onChange} placeholder="https://..." />
                                </div>
                                <div className="rh-form-group">
                                    <label>Instructions<span className="req">*</span></label>
                                    <div className="rh-instr-actions">
                                        <button type="button" className="rh-instr-expand" onClick={() => setShowInstr(true)}>Edit full instructions</button>
                                    </div>
                                </div>
                                <div className="rh-form-group">
                                    <label>Eligibility</label>
                                    <textarea className="rh-textarea" name="eligibility" value={form.eligibility} onChange={onChange} rows={3} placeholder="Eg :- students, experienced" />
                                </div>
                                <div className="rh-form-group">
                                    <label>Allowed Technologies<span className="req">*</span></label>
                                    <input className="rh-input" name="allowedTechnologies" value={form.allowedTechnologies} onChange={onChange} placeholder="Comma separated e.g., React, Node, Python" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="hackathon-body rh-review">
                                <div className="hackathon-left-column">
                                    <h3 className="hackathon-title">{form.title || 'Untitled Hackathon'}</h3>
                                    <section>
                                        <h3>Overview</h3>
                                        <p className="rh-review-desc">{form.description || 'No description provided.'}</p>
                                    </section>
                                    <section>
                                        <h3>Instructions</h3>
                                        {form.instructions ? (
                                            <ul>
                                                {form.instructions
                                                    .split(/\r?\n/)
                                                    .map((line) => line.trim())
                                                    .filter((line) => line.length > 0)
                                                    .map((line, idx) => (
                                                        <li key={idx}>{line.replace(/^[-•]\s*/, '')}</li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <div className="rh-review-value">-</div>
                                        )}
                                    </section>
                                </div>
                                <div className="hackathon-right-column hackathon-right-column--review">
                                    {form.bannerUrl ? (
                                        <div className="hackathon-banner-wrapper" style={{height:'210px'}}>
                                            <img className="hackathon-banner" alt="banner" src={form.bannerUrl} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    ) : (
                                        <div className="rh-review-banner ph" />
                                    )}
                                    <div className="hackathon-info-box">
                                        <div>
                                            <h3>Start Date</h3>
                                            <p>{form.startAt || '-'}</p>
                                        </div>
                                        <div>
                                            <h3>End Date</h3>
                                            <p>{form.endAt || '-'}</p>
                                        </div>
                                        <div>
                                            <h3>Eligibility</h3>
                                            <p>{form.eligibility || 'All are eligible'}</p>
                                        </div>
                                        <div>
                                            <h3>Technologies</h3>
                                            <p>{form.allowedTechnologies || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rh-actions rh-justify-end">
                            {step > 1 && (
                                <button className="rh-back-btn" onClick={prevStep} disabled={submitting}>Back</button>
                            )}
                            {step < 3 && (
                                <button className="rh-next-btn" onClick={handleNext} disabled={submitting}>Next</button>
                            )}
                            {step === 3 && (
                                <button className="rh-next-btn" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? 'Publishing...' : 'Publish Hackathon'}
                                </button>
                            )}
                            <button className="rh-cancel-btn" onClick={() => navigate('/recruiter-hackathons')} disabled={submitting}>Cancel</button>
                        </div>
                    </div>
                </div>
            </section>
            {showInstr && (
                <div className="rh-fullscreen-overlay" role="dialog" aria-modal="true">
                    <div className="rh-fs-panel">
                        <div className="rh-fs-header">
                            <div className="rh-fs-title">Full Instructions</div>
                            <button className="rh-fs-close" onClick={() => setShowInstr(false)} aria-label="Close">✕</button>
                        </div>
                        <div className="rh-fs-body">
                            <textarea
                                className="rh-fs-textarea"
                                name="instructions"
                                value={form.instructions}
                                onChange={onChange}
                                placeholder="Rules, format, deliverables, etc."
                            />
                        </div>
                        <div className="rh-fs-actions">
                            <button className="rh-back-btn" onClick={appendPreset} type="button">Use Preset</button>
                            <button className="rh-cancel-btn" onClick={clearInstr} type="button">Clear</button>
                            <button className="rh-back-btn" onClick={() => setShowInstr(false)} type="button">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecruiterCreateHackathon;
