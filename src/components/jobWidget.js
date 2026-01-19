import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../services/ApplicantAPIService';
import { Link } from 'react-router-dom'; // Import Link component

const JobWidget = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const profileid1 = 0; // Define profileid1 or replace with actual value

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // API call without JWT token
        const recommendedJobsResponse = await axios.get(`${apiUrl}/getAllJobs`);
        // Update job data state
        setJobs(recommendedJobsResponse.data);
      } catch (error) {
        console.error('Error fetching job data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Define convertToLakhs function
  const convertToLakhs = (amount) => {
    return (amount / 100000).toFixed(2);
  };

  // Define formatDate function
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Handle click event for "Apply Now"
  const handleApplyNowClick = (jobId) => {
    console.log(`Apply now clicked for job ID: ${jobId}`);
    // Add logic to handle the click event here
  };

  // Handle click event for "Save Job"
  const handleSaveJob = (jobId) => {
    console.log(`Save job clicked for job ID: ${jobId}`);
    // Add logic to handle the click event here
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="col-lg-12 col-md-12">
      <section className="flat-dashboard-setting flat-dashboard-setting2">
        <div className="themes-container">
          <div className="content-tab">
            <div className="inner">
              <div className="group-col-2">
                {jobs.length === 0 ? (
                  <div style={{ marginLeft: 30 }}>No jobs available</div>
                ) : (
                  jobs
                    .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))
                    .map((job) => (
                      <div className="features-job cl2 bg-white" key={job.id} onClick={() => handleApplyNowClick(job.id)}>
                        <div className="job-archive-header">
                          <div className="inner-box">
                            <div className="box-content">
                              <h4>
                                {job.companyname || (job.jobRecruiter && job.jobRecruiter.companyname) ? (
                                  <a href="#">{job.companyname || job.jobRecruiter.companyname}</a>
                                ) : null}
                              </h4>
                              <h3>
                                <a href="#">{job.jobTitle}</a>
                              </h3>
                              <ul>
                                <li>
                                  <span className="icon-map-pin"></span>
                                  &nbsp;{job.location}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="job-archive-footer">
                          <div className="job-footer-left">
                            <ul className="job-tag">
                              <li>
                                <a href="#">{job.employeeType}</a>
                              </li>
                              <li>
                                <a href="#">{job.remote ? 'Remote' : 'Office-based'}</a>
                              </li>
                              <li>
                                <a href="#">Exp&nbsp; {job.minimumExperience} - {job.maximumExperience} years</a>
                              </li>
                              <li>
                                <a href="#">₹ {convertToLakhs(job.minSalary)} - ₹ {convertToLakhs(job.maxSalary)} LPA</a>
                              </li>
                            </ul>
                            <div className="star">
                              {Array.from({ length: job.starRating }).map((_, index) => (
                                <span key={index} className="icon-star-full"></span>
                              ))}
                            </div>
                          </div>
                          <div className="job-footer-right">
                            <div className="price">
                              <span>
                                <span style={{ fontSize: '12px' }}>Posted on {formatDate(job.creationDate)}</span>
                              </span>
                            </div>
                            <ul className="job-tag">
                              <li onClick={(e) => e.stopPropagation()}>
                                {job.isSaved === 'saved' ? (
                                  <button
                                    disabled
                                    className="button-status2"
                                    style={{ backgroundColor: '#FFFFFF', color: '#F97316', borderColor: '#F97316', opacity: '30%' }}
                                  >
                                    Saved
                                  </button>
                                ) : (
                                  <button onClick={() => handleSaveJob(job.id)} className="button-status2">
                                    Save Job
                                  </button>
                                )}
                              </li>
                              <li>
                                {job && (
                                  <button
                                    // onClick={() => handleApplyNowClick(job.id)}
                                    className="button-status1"
                                  >
                                    View Job
                                  </button>
                                )}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {profileid1 === 0 && (
            <Link to="/applicant-basic-details-form" className="button-status1">
              More Jobs
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default JobWidget;
