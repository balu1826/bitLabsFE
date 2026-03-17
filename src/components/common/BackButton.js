import React, {useEffect} from 'react';
import { Link, useNavigate} from 'react-router-dom';

const BackButton = ({id,jobid}) => {
  const navigate = useNavigate();
  

  const handleClick = (e) => {
    e.preventDefault();
      
       if (id && jobid) {
         const storageKey = `applicantData_${id}_${jobid}`;
         localStorage.removeItem(storageKey); 
       }
  
    navigate(-1);
  
     console.log("all applicants");
   };
   
  return (
    <div className="back-to-previous pb-4">
      <Link to="#" className="back-link" onClick={handleClick} style={{ display: 'flex', alignItems: 'center' }}>
        <svg width="20" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="back 1">
            <g id="Group">
              <path id="Chevron_Right" d="M4.78645 10.7138L13.7804 19.7047C14.175 20.0983 14.8144 20.0983 15.21 19.7047C15.6047 19.311 15.6047 18.6716 15.21 18.278L6.92952 10.0005L15.209 1.72293C15.6037 1.32928 15.6037 0.689884 15.209 0.295238C14.8144 -0.0984125 14.174 -0.0984125 13.7794 0.295238L4.78545 9.28607C4.39687 9.67565 4.39687 10.3251 4.78645 10.7138Z" fill="black"/>
            </g>
          </g>
        </svg>
      </Link>
    </div>
  );
};

export default BackButton;
