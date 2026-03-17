import React, { useState,useEffect } from 'react';
import './MyResume.css';
import ResumeBuilder from './ResumeBuilder';
import ModalWrapper from './ModalWrapper';
import { ClipLoader } from 'react-spinners';
const MyResumeComponent = ({ pdfUrl, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loginUrl, setLoginUrl] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    window.location.reload(); 
  };
  const handleCreateNowClick = () => {
    openModal();
   
    setLoginUrl(loginUrl);
    setIsModalOpen(true);
  };

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  useEffect(() => {
    // Load PDF.js script dynamically
    const script = document.createElement('script');
    script.src = 'https://mozilla.github.io/pdf.js/build/pdf.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script
      document.body.removeChild(script);
    };
  }, []);

  const styles = {
    commonContainer: {
      paddingLeft: '2rem',
      paddingRight: '2rem',
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: '1400px',
    },
    banner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.25rem',
      background: 'linear-gradient(0deg, #161734 0%, #161734 100%), linear-gradient(90deg, #F97316 -2.67%, #FDEC5A 99.69%)',
      padding: '1.25rem',
      borderRadius: '8px',
      color: '#FFF',
      width:'95%',
      marginLeft:'20px'
    },
    bannerContent: {
      flex: 3,
      color: '#D7D8E0',
      fontFamily: 'Plus Jakarta Sans',
      marginBottom: '1rem', 
    },
    bannerHeading: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: '28px',
      fontStyle: 'normal',
      fontWeight: '800',
      lineHeight: '25px',
      color: 'white',
      marginBottom: '1rem',  
    },
    bannerImage: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: '2rem',  
    },
    bannerImageImg: {
      maxWidth: '90%',
      height: 'auto',
      borderRadius: '8px',
    },
    createNewButton: {
      background: 'linear-gradient(90deg, #F97316 11.81%, #FAA729 100%)',
      color: '#FFF',
      border: 'none',
      width: '8rem',
      height: '3rem',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '1rem',  
    },
    changePassword: {
      padding: '1.875rem',
      backgroundColor: 'white',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '16px',
      marginBottom: '1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      paddingLeft: '2rem',
    },
    downloadIcon: {
      marginRight: '0.3125rem',
      color: '#787474',
      fontSize: '1.2rem',
      marginBottom: '0.625rem',
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '600',
    },
    myResumeText: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#F97316',
      textAlign: 'left',
      marginBottom: '0.625rem',
    },
    flatDashboardSetting: {
      padding: '1rem',
      borderRadius: '8px',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
    pdfContainer: {
      width: 'calc(100% - 1rem)',
      height: '600px',
     marginBottom: '1.25rem',
    },
    actionButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: '0.625rem',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: '1rem',
      fontWeight: '600',
    },
  };



  return (
    <div style={styles.commonContainer}>
      
      <section className="flat-dashboard-password" style={{borderRadius:'23px 23px 1px 2px', marginBottom: 0}}>
      <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="change-password bg-white" style={{borderRadius:'23px 23px 1px 2px', marginBottom: 0}}>
                    
                 
                  <div className="action-buttons" style={{ textAlign: 'right', paddingRight: '10px' }}>
                    
          <svg onClick={handleDownload} xmlns="http://www.w3.org/2000/svg" width="25" height="18" viewBox="0 0 24 25" fill="none">
            <path d="M21 15.25V19.25C21 19.7804 20.7893 20.2891 20.4142 20.6642C20.0391 21.0393 19.5304 21.25 19 21.25H5C4.46957 21.25 3.96086 21.0393 3.58579 20.6642C3.21071 20.2891 3 19.7804 3 19.25V15.25" stroke="#787474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 10.25L12 15.25L17 10.25" stroke="#787474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15.25V3.25" stroke="#787474" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span onClick={handleDownload} style={{ cursor: 'pointer',fontSize: '18px' }}>Download</span>
        </div>
        </div>
        </div>
        <div>
        {loading || isLoggingIn ? (
        <div className="spinner-container">
          <ClipLoader color="#F97316" loading={loading || isLoggingIn} size={30}/>
        </div>
      ) : (
            <div align='center'>
            <iframe
                id="pdfViewer"
                title="Resume"
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0view=fit`}
                
                height='600px' // default height
                style={{ border: 'none',width:'100%',textAlign:'center',marginTop: 0  }}
                allowfullscreen=""
                frameborder="0"
             />
           </div>
          )}
        </div>
        </div>
        </div>
      </section>

     

    
 <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
        <ResumeBuilder />
      </ModalWrapper>
    </div>
  );
};

export default MyResumeComponent;


