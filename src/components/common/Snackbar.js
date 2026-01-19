import React, { useEffect } from 'react';
import './Snackbar.css';
import { Link } from 'react-router-dom';
import successIcon from '../../images/accept.png'; 
import errorIcon from '../../images/close.png';

const Snackbar = ({ message, link, linkText, type, onClose, index }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(index);
    }, 5000); 
  }, [onClose, index]);

  return (
    <div className={`snackbar ${type}`} style={{ bottom: `${20 + (index * 80)}px` }}>
      <div className="snackbar-content">
        <div className="icon-container">
          {type === 'success' ? (
            <div className="icon success-icon">
              <img src={successIcon} alt="Success" />
            </div>
          ) : (
            <div className="icon error-icon">
              <img src={errorIcon} alt="Error" />
            </div>
          )}
        </div>
        <div className="message-container">
          <span className="snackbar-message">{message}</span>
          {link && (
            <Link to={link} className="snackbar-link">
              {linkText}
            </Link>
          )}
        </div>
        <button className="close-button custom-close-button" onClick={() => onClose(index)}>
          &#x2716;
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
