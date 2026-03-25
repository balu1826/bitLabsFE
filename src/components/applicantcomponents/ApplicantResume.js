import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import MyResumeComponent from './MyResumeComponent';
import EditAndDownloadComponent from './EditAndDownloadComponent';

const ApplicantResume = () => {
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const user = useUserContext().user;
 
  useEffect(() => {
    fetchApplicantDetails();
  }, []);
 
  const fetchApplicantDetails = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await fetch(`${apiUrl}/applicant/getApplicantById/${user.id}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setShowBanner(data.localResume);
        fetchResumeContent();
      } else {
        console.error('Error fetching applicant details:', response);
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    }
  };
 
  const fetchResumeContent = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await fetch(`${apiUrl}/applicant-pdf/getresume/${user.id}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setLoading(false);
      } else {
        console.error('Error fetching resume content:', response);
      }
    } catch (error) {
      console.error('Error fetching resume content:', error);
    }
  };
 
  return (
     <div className="border-style">

        <div className="blur-border-style"></div>
    <div className="dashboard__content">
    <section className="page-title-dashboard">
      <div className="themes-container">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="title-dashboard">
              <div className="title-dash">My Resume</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div className="col-lg-12 col-md-12">
              <section className="flat-dashboard-setting flat-dashboard-setting2">
                <div className="themes-container">
                  <div className="content-tab">
                    <div className="inner">
                      <div className="group-col-2"></div>
      {showBanner ? (
        <MyResumeComponent pdfUrl={pdfUrl} loading={loading} />
      ) : (
        <EditAndDownloadComponent pdfUrl={pdfUrl} loading={loading} />
      )}
    </div>
    </div>
    </div>
    </section>
    </div>
    </div>
    </div>
  );
};
 
export default ApplicantResume;