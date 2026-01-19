import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';
import ResumeBuilder from './ResumeBuilder'; // Ensure the path is correct
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../common/UserProvider';
import './ModalWrap.css';
import ApplicantAPIService, { apiUrl } from '../../services/ApplicantAPIService';
import axios from "axios";

const ModalWrapper = ({ isOpen, onClose }) => {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data === 'close-modal') {
        onClose();
      }
      if (event.data === 'close-modal-saveexit') {
        try {
          const response = await axios.put(`${apiUrl}/applicantprofile/updateResumeSource/${user.id}`);
          // Handle the response if needed
          console.log('API call successful:', response.data);
        } catch (error) {
          // Handle the error if needed
          console.error('API call failed:', error);
        }
        onClose();
      }
      if (event.data === 'close-modal-save') {
        try {
          const response = await axios.put(`${apiUrl}/applicantprofile/updateResumeSource/${user.id}`);
          // Handle the response if needed
          console.log('API call successful:', response.data);
        } catch (error) {
          // Handle the error if needed
          console.error('API call failed:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onClose]);

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleCloseClick}
        fullScreen={true}
        aria-labelledby="responsive-dialog-title"
        maxWidth="xl"
        PaperProps={{
          style: {
            width: '100%',
            height: '100%',
            margin: 0,
            maxWidth: 'none',
            maxHeight: 'none',
            position: 'relative',
            paddingTop: '90px',
            zIndex: 1000, // Ensure this is lower than the z-index of ModalClose
          },
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the backdrop color if needed
          },
        }}
      >
        <DialogContent sx={{ padding: 0, position: 'relative' }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <ResumeBuilder />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModalWrapper;
