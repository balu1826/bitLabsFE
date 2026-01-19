import React from 'react';
import './css/TestExitPopup.css'; // Import CSS for styling

const TestExitPopup = ({ onConfirm, onCancel,exitMessage }) => {
  return (
    <div className="exit-popup">
      <div className="exit-popup-content">
        <div className="exit-popup-header">
          <span className="exit-popup-close" onClick={onCancel}>&times;</span>
        </div>
        <div className="exit-popup-body">
          <div className="exit-popup-warning-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="43" viewBox="0 0 86 73" fill="none">
  <g clip-path="url(#clip0_2640_1062)">
    <path d="M80.591 73H4.50269C1.0547 73 -1.08279 69.2499 0.675994 66.2861L38.7202 2.17819C40.4436 -0.726062 44.6502 -0.726062 46.3736 2.17819L84.4178 66.2862C86.1766 69.2499 84.0391 73.0001 80.5911 73.0001L80.591 73Z" fill="#EDBA29"/>
    <path d="M39.8752 51.2138L38.0143 23.5766C37.8459 21.0747 39.7389 18.9102 42.2423 18.7419C44.7459 18.5735 46.9119 20.4652 47.0803 22.967C47.0936 23.1639 47.0919 23.3846 47.0803 23.5766L45.2194 51.2138C44.8984 54.5269 40.1917 54.5188 39.8752 51.2138Z" fill="black"/>
    <path d="M42.5473 64.9656C44.5949 64.9656 46.2548 63.3068 46.2548 61.2606C46.2548 59.2144 44.5949 57.5557 42.5473 57.5557C40.4997 57.5557 38.8398 59.2144 38.8398 61.2606C38.8398 63.3068 40.4997 64.9656 42.5473 64.9656Z" fill="black"/>
  </g>
  <defs>
    <clipPath id="clip0_2640_1062">
      <rect width="85" height="73" fill="white" transform="translate(0.046875)"/>
    </clipPath>
  </defs>
</svg>
          </div>
          <p className="exit-popup-title">Do you really want to exit?</p>
          <p className="exit-popup-message">
          {/* Exiting will erase your progress and prevent retaking the test for 7 days. Proceed? */}
           {exitMessage}
          </p>
        </div>
        <div className="exit-popup-footer">
          <button className="exit-popup-btn exit-popup-cancel-btn" onClick={onCancel}>No</button>
          <button className="exit-popup-btn exit-popup-confirm-btn" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
};

export default TestExitPopup;
