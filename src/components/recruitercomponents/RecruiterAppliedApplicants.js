import React, { useState, useEffect, useRef } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import BackButton from '../common/BackButton';
import Snackbar from '../common/Snackbar';
$.DataTable = require('datatables.net')
 
function RecruiterAppliedApplicants({selectedJobId}) {
  const [applicants, setApplicants] = useState([]);
  const { user } = useUserContext();
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState('All');
  const isMounted = useRef(true);
  const [search, setSearch] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const tableref=useRef(null);
  const filterRef = useRef([]);
  const [urlParams, setUrlParams] = useState('');
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [mobileNumber, setMobileNumber] = useState(null);
  const [jobTitle, setJobTitle] = useState(null);
  const [applicantStatus, setApplicantStatus] = useState(null);
  const [skillName, setSkillName] = useState(null);
  const [minimumExperience, setMinimumExperience] = useState(0);
  const [location, setLocation] = useState(null);
  const [minimumQualification, setMinimumQualification] = useState(null);
  const [count, setCount] = useState(0);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });

  const handleCheckboxChange2 = (applyjobid) => {
   // const index = selectedApplicants.indexOf(applyjobid);
      console.log(applyjobid);
   
      setSelectedApplicants([...selectedApplicants, applyjobid]);
    
  };
  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      const allIds = applicants.map(application => application.applyjobid);
      setSelectedApplicants(allIds);
    } else {
      setSelectedApplicants([]);
    }
  };
  
 
  const [filterOptions, setFilterOptions] = useState({
    nameFilter: false,
    emailFilter: false,
    mobileFilter: false,
    jobFilter: false,
    statusFilter: false,
    skillFilter: false,
    experienceFilter: false,
    locationFilter: false,
    minimumQualification: false
    

  });
 
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    setFilterOptions(prevState => ({
      ...prevState,
      [id]: checked ? 'is' : null
    }));
  };
  const resetFilter = () => {
 
  window.location.reload();
};
  const applyFilter = () => {
   
    let url = `${apiUrl}/applyjob/recruiter/${user.id}/appliedapplicants1?name=${name}&email=${email}&mobileNumber=${mobileNumber}&jobTitle=${jobTitle}&applicantStatus=${applicantStatus}&skillName=${skillName}&minimumExperience=${minimumExperience}&location=${location}&minimumQualification=${minimumQualification}`;
   
   
const body = {
  "name": filterOptions.nameFilter === "contains" ? "contains" : filterOptions.nameFilter === "is" ? "is" : null,
  "email": filterOptions.emailFilter === "contains" ? "contains" : filterOptions.emailFilter === "is" ? "is" : null,
  "mobilenumber": filterOptions.mobileFilter === "contains" ? "contains" : filterOptions.mobileFilter === "is" ? "is" : null,
  "jobTitle": filterOptions.jobFilter === "contains" ? "contains" : filterOptions.jobFilter === "is" ? "is" : null,
  "applicantStatus": filterOptions.statusFilter === "contains" ? "contains" : filterOptions.statusFilter === "is" ? "is" : null,
  "skillName": filterOptions.skillFilter === "contains" ? "contains" : filterOptions.skillFilter === "is" ? "is" : null,
  "minimumExperience": filterOptions.experienceFilter === "greaterThan" ? "greaterThan":filterOptions.experienceFilter === "lessThan" ? "lessThan" : filterOptions.experienceFilter === "is" ? "is" : null,
  "location": filterOptions.locationFilter === "contains" ? "contains" : filterOptions.locationFilter === "is" ? "is" : null,
  "minimumQualification": filterOptions.minimumQualification === "contains" ? "contains" : filterOptions.minimumQualification === "is" ? "is" : null
};
    console.log(filterOptions);
   
    const token = localStorage.getItem('jwtToken');
    console.log(token);
 
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
 
  
   fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
})
.then(response => response.json())
.then(data => {
   
   
    console.log('testing ',count);
    const $table = window.$(tableref.current);
    $table.DataTable().clear().destroy();
 
  
    $table.DataTable({
        responsive: true,
        data: data,
        columns: [
          {
            data: null,
            render: function(data, type, row) {
              return '<input type="radio" value="' + row.applyjobid + '" ' +
                (selectedApplicant && selectedApplicant.applyjobid === row.applyjobid ? 'checked' : '') +
                ' onChange="handleRadioChange(' + JSON.stringify(row) + ')" name="applicantRadio"/>';
            }
          },
          { 
            data: 'name',
            render: function(data, type, row) {
              return '<a href="/viewapplicant/' + row.id + '" style="color: #0583D2; text-decoration: none;">' + data + '</a>';
            }
          },
          { 
            data: 'email',
            render: function(data, type, row) {
              return '<a href="/viewapplicant/' + row.id + '" style="color: #0583D2; text-decoration: none;">' + data + '</a>';
            }
          },
          { 
            data: 'mobilenumber',
            render: function(data, type, row) {
              return '<a href="/viewapplicant/' + row.id + '" style="color: #0583D2; text-decoration: none;">' + data + '</a>';
            }
          },
            { data: 'jobTitle' },
            { data: 'applicantStatus' },
            { data: 'experience' },
           
            { data: 'minimumQualification' },
           
            {
              data: null,
              render: function(data, type, row) {
                return '<a href="/view-resume/' + row.id + '" style="color: blue;">View Resume</a>';
              }
            }
        ]
    });
    count=setCount(data.length);
 
})
.catch(error => {
   
    console.error('Error fetching or processing data:', error);
});
};
 
const handleTextFieldChange = (e) => {
  const { id, value } = e.target;
  switch (id) {
    case "name":
      setName(value);
      break;
    case "email":
      setEmail(value);
      break;
    case "mobileNumber":
      setMobileNumber(value);
      break;
    case "jobTitle":
      setJobTitle(value);
      break;
    case "applicantStatus":
      setApplicantStatus(value);
      break;
    case "skillName":
      setSkillName(value);
      break;
    case "minimumExperience":
      setMinimumExperience(value);
      break;
    case "location":
      setLocation(value);
      break;
    case "minimumQualification":
      setMinimumQualification(value);
      break;
    default:
      break;
  }
};

 
 
 
  const handleFilterChange = (event) => {
    const { name, checked, value } = event.target;
    const updatedFilters = [...selectedFilter]; 
 
    if (checked) {
      updatedFilters.push({ name, value });
    } else {
      const index = updatedFilters.findIndex((filter) => filter.name === name);
      if (index !== -1) {
        updatedFilters.splice(index, 1);
      }
    }
 
    setSelectedFilter(updatedFilters);
 
    
    const filteredApplicants = applicants.filter((applicant) => {
      return updatedFilters.every((filter) => {
       
      });
    });
 
    
    setApplicants(filteredApplicants);
  };
  useEffect(() => {
   
    filterRef.current.forEach((checkbox) => {
      checkbox.addEventListener('change', handleFilterChange);
    });
 
    return () => {
      
      filterRef.current.forEach((checkbox) => {
        checkbox.removeEventListener('change', handleFilterChange);
      });
    };
  }, [selectedFilter]);
  const fetchAllApplicants = async () => {
    try {
      const response = await axios.get(`${apiUrl}/applyjob/appliedapplicants/${selectedJobId}`);
    const applicantsArray = Object.values(response.data).flat();
    setCount(applicantsArray.length);
    setApplicants(applicantsArray);
        const $table= window.$(tableref.current);
          const timeoutId = setTimeout(() => {  
           $table.DataTable().destroy();
            $table.DataTable({responsive:true});
                  }, 500);
         return () => {
            isMounted.current = false;
         };
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };
 
  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    }
    fetchAllApplicants();
  }, [user.id]);
 
  const handleSelectChange1 = (e) => {
  const { id, value } = e.target;
  switch (id) {
    case "nameFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        nameFilter: value
      }));
      break;
    case "emailFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        emailFilter: value
      }));
      break;
    case "mobileFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        mobileFilter: value
      }));
      break;
    case "jobFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        jobFilter: value
      }));
      break;
    case "statusFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        statusFilter: value
      }));
      break;
    case "skillFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        skillFilter: value
      }));
      break;
    case "experienceFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        experienceFilter: value
      }));
      break;
    case "locationFilter":
      setFilterOptions(prevState => ({
        ...prevState,
        locationFilter: value
      }));
      break;
      case "minimumQualification":
        setFilterOptions(prevState => ({
          ...prevState,
          minimumQualification: value
        }));
        break;  
    default:
      break;
  }
};
const handleSelectChange = async (e) => {
  const newStatus = e.target.value;
 
  try {
    if (selectedApplicants.length > 0 && newStatus) {
      console.log("Selected Applicants:", selectedApplicants);
      const updatePromises = selectedApplicants.map(async (selectedApplicant) => {
        const applyJobId = selectedApplicant;
        console.log("Apply Job ID:", applyJobId);
        if (!applyJobId) {
          console.error("applyjobid is undefined or null for:", selectedApplicant);
          return null; 
        }

        const response = await axios.put(
          `${apiUrl}/applyjob/recruiters/applyjob-update-status/${applyJobId}/${newStatus}`
        );
        return { applyJobId, newStatus };
      });

      const updatedResults = await Promise.all(updatePromises);

     
      const filteredResults = updatedResults.filter(result => result !== null);
      
      if (isMounted.current) {
        const updatedApplicants = applicants.map((application) => {
          const updatedResult = filteredResults.find(result => result.applyJobId === application.applyjobid);
          if (updatedResult) {
            return { ...application, applicantStatus: updatedResult.newStatus };
          }
          return application;
        });
        setApplicants(updatedApplicants);
        setSelectedStatus(newStatus);
        setSelectedApplicants([]);
      }
      
     
     const message1 = `Status changed to ${newStatus} for ${selectedApplicants.length} applicants`;
     setSnackbar({ open: true, message: message1, type: 'success' });
     
    }
  } catch (error) {
    console.error('Error updating status:', error);
  }
};

 
    const exportCSV = () => {
      
      const headers = Array.from(tableref.current.querySelectorAll('thead th')).map(th => th.textContent);
      const capitalizedHeaders = headers.map(header => header.toUpperCase());
      const data = Array.from(tableref.current.querySelectorAll('tbody tr')).map(tr => {
        const rowData = Array.from(tr.children).map(td => td.textContent);
        
        return rowData;
      });
   
      data.unshift(capitalizedHeaders);
   
      
      const csvContent = data.map(row => row.join(',')).join('\n');
   
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'applicants.csv';
      link.click();
    };
   
    const handleCloseSnackbar = () => {
      setSnackbar({ open: false, message: '', type: '' });
      window.location.reload();
    };
   
 return (
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="title-dashboard">
                <BackButton />
                  <div className="title-dash flex2">All Applicants</div>
                </div>
              </div>
            </div>
          </div>
        </section>
 
       
        <div className="container">
  <h4 className="total-applicants">Total Applicants: {count}</h4>
  <div className="controls">
    
  <button className="export-buttonn" onClick={exportCSV}>
      ExportCSV
    </button>
    <select className="status-select" value={selectedStatus} onChange={handleSelectChange}>
    <option value="" disabled>
        Change Status
      </option>
      <option  value="Screening">Screening</option>
      <option  value="Shortlisted">Shortlisted</option>
      <option  value="Interviewing">Interviewing</option>
      <option  value="Selected">Selected</option>
      
    </select>
    
  </div>
</div>
       
 
        <section className="flat-dashboard-setting bg-white">
          <div className="themes-container">
            <div className="row">
            <div className="col-lg-2 col-md-2" style={{ borderRight: '1px solid black', paddingLeft: '1px', paddingRight: '0px' }}>
        {/* <!-- First Section --> */}
       
<div className="profile-setting" style={{width:'100%'}}>
  <div className="table-container-wrapper">
    <div className="table-container">
    <h3 className="filter"><strong>Filters </strong></h3>
 
      {/* Filter section */}
      <div className="filter-option">
  <input
    type="checkbox"
    id="nameFilter"
    checked={filterOptions.nameFilter}
    onChange={handleCheckboxChange}
    style={{ width: 'auto' }} 
  />
  <label className="label" htmlFor="nameFilter">&nbsp;Name</label>
  {filterOptions.nameFilter && (
    <>
    <div className="dropdown-container1">
    <select
                      id="nameFilter"
                      value={filterOptions.nameFilter || 'null'}
                     
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      </div>
      <input type="text" id="name" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
    </>
  )}
</div>
 
 
 
<div className="filter-option">
  <input
    type="checkbox"
    id="emailFilter"
    checked={filterOptions.emailFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="emailFilter">&nbsp;Email</label>
  {filterOptions.emailFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="emailFilter"
                      value={filterOptions.emailFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="email" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="mobileFilter"
    checked={filterOptions.mobileFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="mobileFilter">&nbsp;MobileNumber</label>
  {filterOptions.mobileFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="mobileFilter"
                      value={filterOptions.mobileFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="mobileNumber" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="jobFilter"
    checked={filterOptions.jobFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="jobFilter">&nbsp;Job Title</label>
  {filterOptions.jobFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="jobFilter"
                      value={filterOptions.jobFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="jobTitle" placeholder="Enter value" onChange={handleTextFieldChange}  style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="statusFilter"
    checked={filterOptions.statusFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="statusFilter">&nbsp;ApplicantStatus</label>
  {filterOptions.statusFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="statusFilter"
                      value={filterOptions.statusFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="applicantStatus" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="experienceFilter"
    checked={filterOptions.experienceFilter}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="experienceFilter">&nbsp;Experience</label>
  {filterOptions.experienceFilter && (
    <>
      <div className="dropdown-container1">
      <select
                      id="experienceFilter"
                      value={filterOptions.experienceFilter || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="greaterThan">greaterThan</option>
        <option value="lessThan">lessThan</option>
      </select>
      <input type="text" id="minimumExperience" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
</div>
 
<div className="filter-option">
  <input
    type="checkbox"
    id="minimumQualification"
    checked={filterOptions.minimumQualification}
    onChange={handleCheckboxChange}
  />
  <label className="label" htmlFor="minimumQualification">&nbsp;Qualification</label>
  {filterOptions.minimumQualification && (
    <>
      <div className="dropdown-container1">
      <select
                      className="checkbox"
                      id="minimumQualification"
                      value={filterOptions.minimumQualification || 'null'}
                      onChange={handleSelectChange1}
                    >
        <option value="is">is</option>
        <option value="contains">contains</option>
      </select>
      <input type="text" id="minimumQualification" placeholder="Enter value" onChange={handleTextFieldChange} style={{ width: '100px', height: '20px' }}/>
      </div>
    </>
  )}
 
</div>
<div>
  <button className="apply-button1" onClick={applyFilter}>Apply</button>
  <button className="reset-button1" onClick={resetFilter}>Reset</button>
  </div>
      {/* End of filter section */}
    </div>
  </div>
</div>
 
      </div>
     
              <div className="col-lg-10 col-md-10">
                <div className="profile-setting">
                <div className="table-container-wrapper">
                  <div className="table-container">
                  {Array.isArray(applicants) && applicants.length === 0 ? (
   
                          <p>No Applicants are available.</p>
                        ) : (
                    <table ref={tableref} className="responsive-table">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={selectedApplicants.length === applicants.length}
                            />
                          </th>
                 
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile Number</th>
                          <th>Job Title</th>
                          <th>Applicant Status</th>
                          <th>Experience</th>
                          <th>Qualification</th>
                          <th>Resume</th>
                        </tr>
                      </thead>
                      <tbody>
                      {Array.isArray(applicants) && applicants.map((application) => (
                          <tr key={application.applyjobid}>
                            <td>
                            <input
  type="checkbox"
  value={application.applyjobid}
  checked={selectedApplicants.includes(application.applyjobid)}
  onChange={() => handleCheckboxChange2(application.applyjobid)} 
  name={`applicantCheckbox-${application.applyjobid}`}
/>
                            </td>
                           
<td>
  <Link to={`/viewapplicant/${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
    {application.applicant.name}
  </Link>
</td>
 
                            <td>
                            <Link to={`/viewapplicant/${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
                            {application.applicant.email}
  </Link>
  </td>
                       
                           
                            <td>
                            <Link to={`/viewapplicant/${application.id}`} style={{ color: '#0583D2', textDecoration: 'none' }}>
                            {application.applicant.mobilenumber}
  </Link>
                              </td>
                            <td>{application.job.jobTitle}</td>
                            <td>{application.applicantStatus}</td>
                         
                            <td>{application.job.maximumExperience}</td>
                            
                            <td>{application.job.minimumQualification}</td>
                         
                            <td><Link to={`/view-resume/${application.applicant.id}`} style={{ color: 'blue' }}>View Resume</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                        )}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      )}
      </div>
    );
  }
  export default RecruiterAppliedApplicants;