import React from 'react';
import './Snackbar.css';
import { Link } from 'react-router-dom';

const ModalLogout = ({ isOpen, onClose, onConfirm }) => {
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`modal1 ${isOpen ? 'show' : ''}`}
      style={{ display: isOpen ? 'flex' : 'none' }}
      tabIndex="-1"
      role="dialog"
      onClick={handleOverlayClick}
    >
      <div className="modal1-dialog" role="document">
        <div className="modal1-content">
          <div className="modal1-header">
            <h5 className="modal1-title">Logout?</h5>
            <Link type="button" className="close" aria-label="Close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </Link>
          </div>
          <div className="modal1-body">
            <p>Are you sure you want to logout?</p>
          </div>
          <div className="modal1-footer">
            <button type="button" className="btn1 btn-secondary1" onClick={onClose}>cancel</button>
            <button type="button" className="btn1 btn-primary1" onClick={onConfirm}>logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalLogout;
