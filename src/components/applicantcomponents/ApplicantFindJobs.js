import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from  'axios';
import { apiUrl } from "../../services/ApplicantAPIService";
import { useUserContext } from "../common/UserProvider";
import Spinner from "../common/Spinner";
import Snackbar from "../common/Snackbar";
import "./ApplicantFindJobs.css";
 
function ApplicantFindJobs({ setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileid1, setProfileId] = useState(null);
  const [page, setPage] = useState(0); // Start at page 0
  const [size] = useState(16); // Number of jobs per request
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobCount, setTotalJobCount] = useState(0);
  const [snackbars, setSnackbars] = useState([]);// added snackbar
const navigate = useNavigate();
const location = useLocation();
const { user } = useUserContext();
const userId = user.id;
const jwtToken = user.data.jwt;

// added snack bar for pagination 
const addSnackbar = (snackbar) => {
  setSnackbars((prevSnackbars) => [...prevSnackbars, snackbar]);
};

// Fetch jobs only when profile ID is available
const fetchJobs = async (pageNum = 0, profileId = profileid1) => {
  if (!profileId) return; // Avoid fetching if profileId is not available

  setLoading(true);
  try {
    const url =
      profileId === 0
        ? `${apiUrl}/job/promote/${userId}/yes`
        : `${apiUrl}/recommendedjob/findrecommendedjob/${userId}?page=${pageNum}&size=${size}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const newJobs = response.data;
    
    setHasMore(newJobs.length === size); // If less than `size`, no more pages

    // Clear the jobs when navigating to a new page (reset for page 0)
    if (pageNum === 0) {
      setJobs(newJobs); // Set only the jobs of the current page
    } else {
      setJobs(newJobs); // Reset jobs when switching pages
    }

    setPage(pageNum); // Update the current page
  } catch (error) {
    console.error("Error fetching jobs:", error);
  } finally {
    setLoading(false);
  }
};


// Fetch profile ID only if it's not already set
const fetchProfileId = async () => {
  if (profileid1) return; // Prevent re-fetching if profileId is already set

  try {
    const profileRes = await axios.get(`${apiUrl}/applicantprofile/${userId}/profileid`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    setProfileId(profileRes.data); // Set profile ID
    fetchJobCount(); // Fetch the total job count after setting profile ID
    fetchJobs(0, profileRes.data); // Fetch the first page of jobs
  } catch (error) {
    console.error("Error fetching profile ID:", error);
  }
};

// Fetch total job count
const fetchJobCount = async () => {
  try {
    const response = await axios.get(`${apiUrl}/recommendedjob/countRecommendedJobsForApplicant/${userId}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    const count = response.data;
    setTotalJobCount(count);
    setTotalPages(Math.ceil(count / size)); // Calculate total pages
  } catch (error) {
    console.error("Error fetching job count:", error);
  }
};

// Fetch profile ID and jobs when JWT token or profile ID changes
useEffect(() => {
  if (jwtToken) {
    localStorage.setItem("jwtToken", jwtToken);
    fetchProfileId();
  }
}, [jwtToken]); // Only run when jwtToken changes

// Handle page change
const handlePreviousPage = () => {
  if (page > 0) fetchJobs(page - 1, profileid1);
};

const handleNextPage = () => {
  if (page < totalPages) fetchJobs(page + 1, profileid1);
};

const handlePageClick = (pageNum) => {
  fetchJobs(pageNum, profileid1);
};

  

  const handleSaveJob = async (jobId) => {
    try {
      await axios.post(`${apiUrl}/savedjob/applicants/savejob/${userId}/${jobId}`, null, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
  
      // Remove the job from the UI without reloading
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
  
      addSnackbar({ 
        message: "Job saved successfully.", 
        link: "/applicant-saved-jobs", 
        linkText: "View Saved Jobs", 
        type: "success",
      });
  
    } catch (error) {
      console.error("Error saving job:", error);
      addSnackbar({ message: "Error saving job. Please try again later.", type: "error" });
    }
  };

  const handleApplyNowClickView = (jobId) => {
    setSelectedJobId(jobId);
    navigate(`/applicant-view-job?jobId=${jobId}`, { state: { from: location.pathname } });
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
                  <div className="col-lg-12 col-md-12">
                    <div className="title-dashboard">
                      <div className="title-dash flex2">{profileid1 === 0 ? "no jobs" : "Recommended Jobs"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
 
          <div className="col-lg-12 col-md-12">
            <section className="flat-dashboard-setting flat-dashboard-setting2">
              <div className="themes-container">
                <div className="content-tab">
                  <div className="inner">
                    <div className="group-col-2">
                      {jobs.length === 0 ? (
                        <div style={{ marginLeft: 30 }}>No jobs available</div>
                      ) : (
                        jobs.map((job) => (
                          <div className="features-job cl2 bg-white" key={job.id} onClick={(e) => {
    
                            setSelectedJobId(job.id);
                        }}
                         >
                            <div className="job-archive-header">
                              <div className="inner-box">
                                <div className="box-content">
                                  <h4>
                                    <a href="javascript:void(0);">{job.companyname || job?.jobRecruiter?.companyname}</a>
                                  </h4>
                                  <h3>
                                    <a href="javascript:void(0);">{job.jobTitle}</a>
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
                                    <a href="javascript:void(0);">{job.remote ? "Remote" : "Office-based"}</a>
                                  </li>
                                  <li>
                                    <a href="javascript:void(0);">Exp {job.minimumExperience} - {job.maximumExperience} years</a>
                                  </li>
                                  <li>
                                    <a href="javascript:void(0);">₹ {job.minSalary} - ₹ {job.maxSalary} LPA</a>
                                  </li>
                                </ul>
                              </div>
                              <div className="job-footer-right">
                                <div className="price">
                                  <span>
                                    <span style={{ fontSize: "12px" }}>Posted on {new Date(job.creationDate).toLocaleDateString()}</span>
                                  </span>
                                </div>
                                <ul className="job-tag">
                                  <li>
                                    <button onClick={() => handleSaveJob(job.id)} className="button-status2">
                                      Save Job
                                    </button>
                                  </li>
                                  <li>
                                  {job && (
                                        <button
                                         onClick={() => handleApplyNowClickView(job.id)}
                                          className="button-status1"
                                        >
                                          View Job
                                        </button>
                                      )}                                  </li>
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
 
              {/* Pagination Section */}
              <div className="pagination" style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", gap: "10px" }}>
  <button
    onClick={handlePreviousPage}
    className="arrow-button"
    disabled={page === 0}
    style={page === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
  >
    <span aria-hidden="true">&lsaquo;</span> {/* Left Arrow */}
  </button>

  {/* Page Numbers */}
  {Array.from({ length: totalPages }, (_, i) => i) // Start from 0 internally
    .map((pageNumber) => pageNumber + 1) // Adjust for UI display
    .filter((pageNumber) => {
      return (
        pageNumber <= 2 || // First two pages
        pageNumber >= totalPages - 1 || // Last two pages
        (pageNumber >= page && pageNumber <= page + 2) // Two pages before and after current
      );
    })
    .reduce((acc, pageNumber, index, array) => {
      if (
        index > 0 &&
        pageNumber !== array[index - 1] + 1 && // Add ellipsis only if there is a gap between page numbers
        !(array[index - 1] === 1 && pageNumber === 2) // Prevent ellipsis before 1
      ) {
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
          onClick={() => handlePageClick(pageNumber - 1)} // Convert back to 0-based index for API call
          className={page === pageNumber - 1 ? "active" : ""}
          style={{ marginBottom: "5px" }}
        >
          {pageNumber}
        </button>
      )
    )}

  <button
    onClick={handleNextPage}
    className="arrow-button"
    disabled={page === totalPages-1}
    style={page === totalPages-1 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
  >
    <span aria-hidden="true">&rsaquo;</span> {/* Right Arrow */}
  </button>
</div>

 
            </section>
          </div>
        </div>
      </div>
    )
}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          index={index}
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      ))}
    </div>
  );
}
 
export default ApplicantFindJobs;