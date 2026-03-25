import React, { useEffect } from 'react';
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

const ModalWrapper2 = ({ isOpen, onClose }) => {
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

  const handleCloseClick = async () => {
    if (window.confirm("Please close this window only after saving your resume.")) {
      try {
        const logoutUrl = 'https://resume.bitlabs.in:5173/api/auth/logout?_=' + Date.now();
        const response = await fetch(logoutUrl, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'https://resume.bitlabs.in:5173/dashboard/resumes';
        document.body.appendChild(iframe);
        onClose();
      } catch (error) {
        console.error('There was a problem with the logout request:', error);
        alert('Failed to close. Please try again.');
      }
    }
  };

  return (
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
        },
      }}
      BackdropProps={{
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the backdrop color if needed
        },
      }}
    >
      <DialogContent sx={{ padding: 0, position: 'relative' }}>
        {isMobile ? (
          <Button
            sx={{
              position: 'absolute',
              textTransform: 'capitalize',
              right: 5,
              top: 16,
              border: '1px solid #F97316',
              borderRadius: '8px',
              color: '#F97316',
              '&:hover': {
                border: '1px solid #DA4D0B',
                color: '#DA4D0B'
              },
              zIndex: 1,
            }}
            onClick={handleCloseClick}
          >
            Close
          </Button>
        ) : (
          <Button
            onClick={handleCloseClick}
            sx={{
              position: 'absolute',
              textTransform: 'capitalize',
              right: 22,
              top: 9,
              border: '1px solid #F97316',
              borderRadius: '8px',
              color: '#F97316',
              '&:hover': {
                border: '1px solid #DA4D0B',
                color: '#DA4D0B'
              },
              zIndex: 1,
            }}
          >
            Close
          </Button>
        )}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <ResumeBuilder /> {/* Include ResumeBuilder component here */}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModalWrapper2;
