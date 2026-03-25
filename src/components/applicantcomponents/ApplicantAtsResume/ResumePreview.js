import './ResumePreview.css';
import resumeBackButton from './resume-back-button.png';

import ATSUpdateComponent from '../ATSUpdateComponent';
import { useNavigate } from 'react-router-dom';
import pdfUrl from './template1.png';
import axios from "axios";
import { useResume } from '../ResumeContext';
import { useEffect, useCallback, useState } from "react";
import { useUserContext } from "../../common/UserProvider";
import { apiUrl } from "../../../services/ApplicantAPIService";

const ResumePreview = () => {
    const navigate = useNavigate();
    const { resumeState, updateResumeState } = useResume();
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const { user } = useUserContext();
const applicantId = user?.id;

const generatePdf = useCallback(async () => {
    try {
        if (!resumeState.templateId) return;

        const jwt = localStorage.getItem("jwtToken");

        const payload = {
   applicantId: applicantId,   // ✅ use context
    resumeVersion: resumeState.templateId,
    jd: resumeState.jobDescription,
            resumeSummary: resumeState.profileData.resumeSummary,
            personalDetails: resumeState.profileData.personalDetails,
            educationDetails: resumeState.profileData.educationDetails,
            projectDetails: resumeState.profileData.projectDetails,
            keySkills: resumeState.profileData.keySkills
        };

        const response = await axios.post(
            `${apiUrl}/api/resume/download/resume`,
            // "http://localhost:8081/api/resume/download/resume",
            payload,
            {
                headers: { Authorization: `Bearer ${jwt}` },
                responseType: "blob"
            }
            
        );

        const file = new Blob([response.data], { type: "application/pdf" });
        // const url = URL.createObjectURL(file);
        const url = URL.createObjectURL(file) ;

        updateResumeState("pdfUrl", url);

    } catch (error) {
        console.error("PDF generation failed:", error);
    }
}, [resumeState.templateId, resumeState.jobDescription]);

    useEffect(() => {
        if (resumeState.templateId && !resumeState.pdfUrl) {
            generatePdf();
        }
    }, [resumeState.templateId, resumeState.pdfUrl]); 
    
    useEffect(() => {
        const loadPdf = async () => {
             if (resumeState.templateId) {
                 await generatePdf();
             }
        };
        loadPdf();
    }, []); 

console.log("LocalStorage ApplicantId:", localStorage.getItem("applicantId"));


    const handleDownload = useCallback(() => {
        if (resumeState.pdfUrl) {
            const link = document.createElement('a');
            link.href = resumeState.pdfUrl;
            link.download = 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [resumeState.pdfUrl]);

    const handleFullscreenPreview = () => {
        setShowFullscreen(true);
    };

    const handlePreviewModal = () => {
        setShowPreviewModal(true);
    };

    const closeFullscreen = (e) => {
       
        if (e.target.classList.contains('fullscreen-overlay')) {
            setShowFullscreen(false);
        }
    };

    const closePreviewModal = (e) => {
       
        if (e.target.classList.contains('preview-modal-overlay')) {
            setShowPreviewModal(false);
        }
    };
    useEffect(() => {
        console.log("Resume state updated:", resumeState);
    }, []);

    return (

        <div className="border-style">
            <div className="blur-border-style"></div>
            <div className="dashboard__content">


                <div className='header-section'>
                    <button className='back-button-templates'
                        onClick={() => navigate('/resume-templates')}>
                        <span className='back-button-to-templates'>
                            <img src={resumeBackButton} alt="Back" />
                        </span>
                    </button>
                    <span style={{ fontWeight: 600, fontSize: '22px' }}>Your resume preview</span>
                </div>

                <div className="resume-preview-wrapper">
                    <div className='left-side'>
                        <div className="resume-pdf">

                            <iframe
                                src={`${resumeState.pdfUrl}#toolbar=0&view=FitH`}
                                title="Resume Preview"
                                style={{ 
                                        width: "100%", 
                                        height: "100%", 
                                        border: "none",
                                        display: "block",
                                        margin: "0",
                                        padding: "0",
                                        overflow: "hidden"
                                }}
                            />


                        </div>
                        <div className="preview-buttons">
                            <button className="preview-btn" onClick={handlePreviewModal}>Preview</button>
                            <button className="download-btn" onClick={handleDownload}>Download</button>
                        </div>
                    </div>


                    <div className='right-side'>

                        <div className="resume-portfolio">
                            <ATSUpdateComponent />
                           
                        </div>
                        <div className="update-btn">
                            <button className="update-resume-butn" onClick={generatePdf}>Update</button>
                        </div>
                      
                    </div>
                        


                </div>
              
                {showFullscreen && (
                    <div className="fullscreen-overlay" onClick={closeFullscreen}>
                        <div className="fullscreen-resume">
                            <iframe
                                src={`${resumeState.pdfUrl}#toolbar=0`}
                                title="Fullscreen Resume Preview"
                                style={{ width: "100%", height: "100%", border: "none" }}
                            />
                        </div>
                    </div>
                )}

                {showPreviewModal && (
                    <div className="preview-modal-overlay" onClick={closePreviewModal}>
                        <div className="preview-modal-content">
                            <div className="preview-modal-header">
                                <h3>Resume Preview</h3>
                                <button className="preview-modal-close" onClick={() => setShowPreviewModal(false)}>
                                    ×
                                </button>
                            </div>
                            <div className="preview-modal-body">
                                <iframe
                                    src={`${resumeState.pdfUrl}#toolbar=0&view=FitH`}
                                    title="Resume Preview Modal"
                                    style={{ 
                                        width: "100%", 
                                        height: "100%", 
                                        border: "none",
                                        display: "block",
                                        margin: "0",
                                        padding: "0",
                                        overflow: "hidden"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>


        </div>
    );
}
export default ResumePreview;