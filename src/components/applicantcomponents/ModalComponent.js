import React from 'react';
import Modal from 'react-modal';
import {useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const ModalComponent = ({ isOpen, onRequestClose, loginUrl }) => {
  const navigate=useNavigate();
  const handleClose = () => {
    onRequestClose();
    navigate('/applicant-find-jobs');
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Login Modal"
      style={{
        overlay: {
          zIndex: 1000, 
        },
        content: {
          width: '1366px', 
          height: '900px', 
          maxWidth: '100%', 
          maxHeight: '100%', 
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
        },
      }}
      >
      <div>
        <iframe src={loginUrl} width="100%" height="500px" title="Login"></iframe>
        <button onClick={handleClose}>Close</button>
      </div>
    </Modal>
  );
};

export default ModalComponent;
