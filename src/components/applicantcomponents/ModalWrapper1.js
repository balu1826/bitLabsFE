import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box } from '@mui/material';
import ResumeBuilder from './ResumeBuilder'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import './ModalWrap.css';
import ModalClose from '../common/ModalClose';
import Logo from '../../images/artboard.svg';

const ModalWrapper1 = ({ isOpen, onClose }) => {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      if (event.data === 'close-modal' || event.data === 'close-modal-saveexit') {
        try {
          await axios.get(`${apiUrl}/resume/pdf/${user.id}`);
          navigate('/applicanthome');
        } catch (error) {
          if (error.response && error.response.status === 404) {
            navigate('/applicant-basic-details-form/3');
          } else {
            console.error('An unexpected error occurred:', error);
          }
        } finally {
          onClose(); 
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onClose, user.id, apiUrl, navigate]);

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
            paddingTop: '30px',
           //marginTop:'150px',
            zIndex: 1000
          },
        }}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the backdrop color if needed
           // zIndex:'999'
          },
        }}
      >
        <img className="top-left-svg" src={Logo} alt="Logo" /><br></br>
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

export default ModalWrapper1;

