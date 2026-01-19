import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../services/ApplicantAPIService';
import { useUserContext } from '../common/UserProvider';
import { useNavigate, useLocation } from "react-router-dom";
import Snackbar from '../common/Snackbar';
import './ApplicantFindJobs.css';
 
function ApplicantSavedJobs({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserContext();
  const applicantId = user.id;
  const navigate = useNavigate();
  const [snackbars, setSnackbars] = useState([]);
  const location = useLocation();
    const [size, setSize] = useState(10) // Set the size of jobs per request
    const [savedJobs, setSavedJobs] = useState([]);
    const [savedJobsPage, setSavedJobsPage] = useState(1);
    const [totalSavedJobs, setTotalSavedJobs] = useState(0);
    const [totalSavedPages, setTotalSavedPages] = useState(0);
    const [savedHasMore, setSavedHasMore] = useState(true);
   
    const jwtToken = user.data.jwt;
 
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, []);
  const fetchSavedJobCount = async () => {
    try {
      const response = await axios.get(`${apiUrl}/savedjob/countSavedJobs/${applicantId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const count = response.data;
      setTotalSavedJobs(count);
      setTotalSavedPages(Math.ceil(count / size));
    } catch (error) {
      console.error("Error fetching saved job count:", error);
    }
  };
  const fetchSavedJobs = async (pageNum = 0) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/savedjob/getSavedJobs/${applicantId}?page=${pageNum}&size=${size}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
 
      const newJobs = Array.isArray(response.data) ? response.data : [];
setJobs(newJobs);
 
 
      setSavedJobs(newJobs);
      setSavedJobsPage(pageNum);
      setSavedHasMore(newJobs.length === size);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };
 
  // Pagination Handlers
  const handlePreviousSavedPage = () => {
    if (savedJobsPage > 0) fetchSavedJobs(savedJobsPage - 1);
  };
 
  const handleNextSavedPage = () => {
    if (savedJobsPage < totalSavedPages) fetchSavedJobs(savedJobsPage + 1);
  };
 
  const handleSavedPageClick = (pageNum) => {
    fetchSavedJobs(pageNum);
  };
 
  // Fetch Saved Jobs on Component Mount
  useEffect(() => {
    fetchSavedJobCount();
    fetchSavedJobs();
  }, [applicantId]);
 
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
  }
 
  const convertToLakhs = (amountInRupees) => {
    return (amountInRupees *1).toFixed(2); // Assuming salary is in rupees
  };
 
  const handleApplyNowClick = (jobId, e) => {
    if (e) e.stopPropagation();
    setSelectedJobId(jobId);

    // Update jobs and savedJobs state immediately after applying
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    setSavedJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));

    navigate(`/applicant-view-job?jobId=${jobId}`, { state: { from: location.pathname } });
};

const handleRemoveJob = async (jobId, e) => {
    e.stopPropagation();
    try {
        const authToken = localStorage.getItem('jwtToken');
        const response = await axios.delete(
            `${apiUrl}/savedjob/applicants/deletejob/${applicantId}/${jobId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        if (response.status === 200) {
            // Remove the job from both lists immediately after it has been successfully removed
            setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
            setSavedJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));

            addSnackbar({ message: 'Job removed Successfully', type: 'success' });
        }
    } catch (error) {
        addSnackbar({ message: 'Error removing job. Please try again later.', type: 'error' });
        console.error('Error removing job:', error);
    }
};

 
  const addSnackbar = (snackbar) => {
    setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
  };
 
  const handleCloseSnackbar = (index) => {
    setSnackbars((prevSnackbars) => prevSnackbars.filter((_, i) => i !== index));
  };
 
  return (
    <div>
      {loading ? null : (
        <div className="dashboard__content">
          <div className="row mr-0 ml-10">
            <div className="col-lg-12 col-md-12">
              <section className="page-title-dashboard">
                <div className="themes-container">
                  <div className="row">
                    <div className="col-lg-12 col-md-12 ">
                      <div className="title-dashboard">
 
                        <div className="title-dash flex2">My Saved Jobs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className=" col-lg-12 col-md-12">
              <section className="flat-dashboard-setting flat-dashboard-setting2">
                <div className="themes-container">
                  <div className="content-tab">
                    <div className="inner">
                      <div className="group-col-2">
                        {jobs.length === 0 ? (
                          <div style={{ marginLeft: 30 }}>No Saved jobs available</div>
                        ) : (
                          jobs.map((job) => (
                            <div className="features-job cl2 bg-white" key={job.id} onClick={(e) => handleApplyNowClick(job.id, e)}>
                              <div className="job-archive-header">
                                <div className="inner-box">
                                  <div className="box-content">
                                    <h4>
                                      <a href="javascript:void(0);">{job.companyname}</a>
                                    </h4>
                                    <h3>
                                      <a href="javascript:void(0);#">
                                        {job.jobTitle}
                                      </a>
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
                                      <a href="javascript:void(0);">{job.employeeType}</a>
                                    </li>
                                    <li>
                                      <a href="javascript:void(0);">{job.remote ? 'Remote' : 'Office-based'}</a>
                                    </li>
                                    <li>
                                      <a href="javascript:void(0);">Exp &nbsp;{job.minimumExperience} - {job.maximumExperience} years</a>
                                    </li>
                                    <li>
                                      <a href="javascript:void(0);">&#x20B9; {convertToLakhs(job.minSalary)} - &#x20B9; {convertToLakhs(job.maxSalary)} LPA</a>
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
                                    <li>
                                      <button
                                        className="button-status2"
                                        onClick={(e) => handleRemoveJob(job.id, e)}
                                      >
                                        Remove
                                      </button>
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
              </section>
            </div>
          </div>
        </div>
      )}
      {/* pagination */}
      <div className="pagination" style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "10px" }}>
  <button
    onClick={handlePreviousSavedPage}
    className="arrow-button"
    disabled={savedJobsPage === 0} // Disable when on the first page (0-based index)
    style={savedJobsPage === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
  >
    &lsaquo;
  </button>

  {/* Page Numbers */}
  {Array.from({ length: totalSavedPages }, (_, i) => i) // Start from 0 internally
    .map((pageNumber) => pageNumber + 1) // Adjust for UI display
    .filter((pageNumber) => {
      return (
        pageNumber <= 2 || // First two pages
        pageNumber >= totalSavedPages - 1 || // Last two pages
        (pageNumber >= savedJobsPage + 1 && pageNumber <= savedJobsPage + 3) // Adjust for the range
      );
    })
    .reduce((acc, pageNumber, index, array) => {
      if (index > 0 && pageNumber !== array[index - 1] + 1) {
        acc.push("...");
      }
      acc.push(pageNumber);
      return acc;
    }, [])
    .map((pageNumber, index) =>
      pageNumber === "..." ? (
        <span key={index} style={{ padding: "0 5px" }}>...</span>
      ) : (
        <button
          key={pageNumber}
          onClick={() => handleSavedPageClick(pageNumber - 1)} // Convert to 0-based index for backend
          className={savedJobsPage + 1 === pageNumber ? "active" : ""} // UI shows 1-based index
          style={{ marginBottom: "5px" }}
        >
          {pageNumber}
        </button>
      )
    )}

  <button
    onClick={handleNextSavedPage}
    className="arrow-button"
    disabled={savedJobsPage === totalSavedPages - 1} // Disable when on the last page (0-based index)
    style={savedJobsPage === totalSavedPages - 1 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
  >
    &rsaquo;
  </button>
</div>

 
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => handleCloseSnackbar(index)}
        />
      ))}
    </div>
  );
}
 
export default ApplicantSavedJobs;
