import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-calendar-timeline/lib/Timeline.css';
import BackButton from '../common/BackButton';
import PropTypes from 'prop-types';

const ApplicantInterviewStatus = ({ setSelectedJobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [jobStatus, setJobStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();
  const applicantId = user.id;
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = new URLSearchParams(location.search).get('jobId');
  const [applyJobId, setApplyJobId] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const authToken = localStorage.getItem('jwtToken');
        const response = await axios.get(
          `${apiUrl}/viewjob/applicant/viewjob/${jobId}/${applicantId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const { body } = response.data;
        setLoading(false);
        if (body) {
  setJobDetails(body);
  setApplyJobId(body.applyJobId); 
  localStorage.setItem(`jobDetails_${jobId}`, JSON.stringify(body));
  localStorage.setItem(`applyJobId_${jobId}`, JSON.stringify(body.applyJobId));
}
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const fetchJobStatus = async () => {
    try {
      const authToken = localStorage.getItem('jwtToken');
      const response = await axios.get(
        `${apiUrl}/applyjob/recruiters/applyjob-status-history/${applyJobId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const body = response.data;
      setLoading(false);
      if (Array.isArray(body) && body.length > 0) {
        setJobStatus(body);
        localStorage.setItem(`jobStatus_${jobId}`, JSON.stringify(body));
      }
    } catch (error) {
      console.error('Error fetching job status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId && applyJobId) {
      fetchJobStatus();
    }
  }, [applyJobId,jobId]);


  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }

  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees * 1).toFixed(2);
  };

  const handleViewJobDetails = () => {
    setSelectedJobId(jobId);
    navigate(`/applicant-view-job`, { state: { from: location.pathname } });
  };

  return (
    <div>
      {loading ? null : (
        <div className="dashboard__content">
          <section className="page-title-dashboard">
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="title-dashboard">
                    <div className="title-dash flex2">
                      <BackButton />
                      Job Status
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="flat-dashboard-setting flat-dashboard-setting2">
            <div className="themes-container">
              <div className="content-tab">
                <div className="inner">
                  <article className="job-article">
                    {jobDetails && (
                      <div className="top-content">
                        <div className="features-job style-2 stc-apply bg-white">
                          <div className="job-archive-header">
                            <div className="inner-box">
                              <div className="box-content">
                                <h4>
                                  <a href="javascript:void(0);">{jobDetails.companyname}</a>
                                </h4>
                                <h3>
                                  <a href="javascript:void(0);">{jobDetails.jobTitle}</a>
                                </h3>
                                <ul>
                                  <li>
                                    <span className="icon-map-pin"></span>
                                    {jobDetails.location}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="job-archive-footer">
                            <div className="job-footer-left">
                              <ul className="job-tag">
                                <li>
                                  <a href="javascript:void(0);">{jobDetails.employeeType}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">{jobDetails.remote ? 'Remote' : 'Office-based'}</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);"> Exp {jobDetails.minimumExperience} - {jobDetails.maximumExperience} years</a>
                                </li>
                                <li>
                                  <a href="javascript:void(0);">&#x20B9; {convertToLakhs(jobDetails.minSalary)} - &#x20B9; {convertToLakhs(jobDetails.maxSalary)} LPA</a>
                                </li>
                              </ul>
                            </div>
                            <div className="job-footer-right">
                              <div className="price">
                                <span>
                                  <span style={{ fontSize: '12px' }}>Posted on {formatDate(jobDetails.creationDate)}</span>
                                </span>
                              </div>
                              <ul className="job-tag">
                                <li>
                                  {jobDetails && (
                                   <button className="button-status" onClick={handleViewJobDetails}>
                                      View Job Details
                                    </button>
                                  )}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                   {jobStatus && jobStatus.length > 0 && (() => {
  // Step 1: Sort by date descending (latest first)
  const sortedStatuses = jobStatus
    .slice()
    .sort((a, b) => b.id - a.id); 
  // Step 2: Separate final decision from others
  const normalStatuses = [];
  let finalDecision = null;
 
  for (const status of sortedStatuses) {
    if (!finalDecision && (status.status === 'Selected' || status.status === 'Rejected')) {
      finalDecision = status;
    } else if (status.status !== 'Selected' && status.status !== 'Rejected') {
      normalStatuses.push(status);
    }
  }
 
  // Step 3: Combine in correct display order (oldest first)
  const displayStatuses = normalStatuses.toReversed();
  if (finalDecision) displayStatuses.push(finalDecision);
 
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        width: '100%',
        maxWidth: '730px',
        boxShadow: '0 0 10px rgba(0,0,0,0.05)',
      }}
    >
      <h3 className="mb-4">Status History</h3>
 
      <ul className="list-unstyled m-0 position-relative">
        {/* Vertical connector line */}
       <div
  style={{
    position: 'absolute',
    left: '141px',
    top: '0px',
    height: `${(displayStatuses.length - 1) * 50 }px`, // subtract half dot height
    width: '2px',
    backgroundColor: '#f57c00',
    zIndex: 0,
  }}
></div>
 
 
        {displayStatuses.map((status) => {
          const isSelected = status.status === 'Selected';
          const isRejected = status.status === 'Rejected';
 
          // Dot styling based on status
          const getDotStyle = () => {
            if (isSelected) {
              return {
                backgroundColor: 'green',
                color: 'white',
              };
            } else if (isRejected) {
              return {
                backgroundColor: 'red',
                color: 'white',
              };
            } else {
              return {
                backgroundColor: '#f57c00',
                color: 'transparent',
              };
            }
          };
 
          return (
             <li key={status.id} className="d-flex align-items-start mb-4 position-relative">
              {/* Date (no time) */}
              <div style={{ width: '120px', fontWeight: '500', fontSize: '13px' }}>
  {new Date(status.changeDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}
</div>
 
 
              {/* Dot with icon */}
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  margin: '0 13px',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  ...getDotStyle(),
                }}
              >
                {isSelected && '✔'}
                {isRejected && '✖'}
              </div>
 
              {/* Status info */}
              <div style={{ flex: 1, fontSize: '14px' }}>
                <strong>{status.status === 'New' ? 'Applied Job' : status.status}</strong>
 
                {(isSelected || isRejected) && status.applyJob?.reason && (
                  <p className="text-muted mb-0 mt-1" style={{ fontSize: '13px' }}>
                    Reason: {status.applyJob.reason}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
})()}
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
ApplicantInterviewStatus.propTypes = {
  setSelectedJobId: PropTypes.func.isRequired,
};
export default ApplicantInterviewStatus;
