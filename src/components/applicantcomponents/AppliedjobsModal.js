import React, { useEffect, useState } from 'react';
import ModalWrapper from './ModalWrapper';
import ResumeBuilder from './ResumeBuilder';
import appleStore from '../../images/dashboard/mobilebanners/applestore.png';
import playStore from '../../images/dashboard/mobilebanners/playStoreicon.png';
 
const Modal = ({ onClose }) => {
  const [userData, setUserData] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 755);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
 
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
 
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 755);
    };
 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  return (
    <div className="modal-overlay">
      <div className="modal-text">
        <div className="button-container" style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              position: 'absolute',
              top: '-1px',
              right: '0px',
              background: 'transparent',
              padding: '10px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
              <path d="M15.5 5L5.5 15" stroke="#6C6C6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 5L15.5 15" stroke="#6C6C6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
 
        <div className="modal-body">
          <div className="icon-check">
            <svg width="60" height="60" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0)">
                <path
                  d="M31.3713 61.123C48.216 61.123 61.8713 47.4677 61.8713 30.623C61.8713 13.7784 48.216 0.123047 31.3713 0.123047C14.5267 0.123047 0.871338 13.7784 0.871338 30.623C0.871338 47.4677 14.5267 61.123 31.3713 61.123Z"
                  fill="#32BA7C"
                />
                <path
                  d="M23.5779 44.3812L39.2608 60.0642C52.2498 56.6005 61.8713 44.7661 61.8713 30.6226C61.8713 30.3339 61.8713 30.0453 61.8713 29.7566L49.5558 18.4033L23.5779 44.3812Z"
                  fill="#0AA06E"
                />
                <g>
                  <path
                    d="M32.141 37.4546C33.488 38.8016 33.488 41.1108 32.141 42.4578L29.3508 45.248C28.0038 46.595 25.6947 46.595 24.3477 45.248L12.1284 32.9325C10.7814 31.5855 10.7814 29.2764 12.1284 27.9294L14.9186 25.1392C16.2656 23.7922 18.5748 23.7922 19.9218 25.1392L32.141 37.4546Z"
                    fill="white"
                  />
                  <path
                    d="M42.8208 16.1909C44.1678 14.8439 46.4769 14.8439 47.8239 16.1909L50.6141 18.9811C51.9611 20.3281 51.9611 22.6373 50.6141 23.9843L29.4469 45.0553C28.0999 46.4023 25.7908 46.4023 24.4438 45.0553L21.6536 42.265C20.3066 40.918 20.3066 38.6089 21.6536 37.2619L42.8208 16.1909Z"
                    fill="white"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="61" height="61" fill="white" transform="translate(0.871338 0.123047)" />
                </clipPath>
              </defs>
            </svg>
          </div>
 
          <h3 style={{ fontSize: '20px', textAlign: 'center', marginBottom: '35px' }}>Job Applied Successfully</h3>
          <div
              className={isMobileView ? 'bg-light p-3 rounded w-100' : ''}
              style={
                isMobileView
                  ? {}
                  : {
                      backgroundColor: '#F9F9F9',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'left',
                      fontFamily: 'Plus Jakarta Sans',
                      display: 'flex',
                      width: 'auto',
                    }
              }
            >
              <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>
                Why open laptop when jobs can be right in your pocket.
                <br />
                <span style={{ fontSize: '15px', color: '#FF8C00', fontWeight: '500' }}>
                  Download the app now!
                </span>
              </p>
 
              <div className="d-flex justify-content-center gap-3 align-items-center mt-2">
                <div className="d-flex flex-column align-items-center">
                  <img
                    src={appleStore}
                    alt="Apple Store"
                    style={{ height: '30px', width: '30px', objectFit: 'contain' }}
                  />
                  <p style={{ fontSize: '11px', marginTop: '4px', color: '#000' }}>Apple Store</p>
                </div>
 
                <div className="d-flex flex-column align-items-center">
                  <a
                            href="https://play.google.com/store/apps/details?id=com.bigtimes&utm_source=jobcard-ps-button&utm_medium=bj-apply-now-ps-app&utm_campaign=bj-ps-int-apply-now"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={playStore}
                              alt="Google Play"
                              style={{ height: '36px', width: 'auto', maxWidth: '100%' }}
                            />
                          </a>
                  <p style={{ fontSize: '11px', marginTop: '4px', color: '#000' }}>Play Store</p>
                </div>
              </div>
            </div>
   
 
          {/* Optional: ModalWrapper with ResumeBuilder (if needed) */}
          {isModalOpen && (
            <ModalWrapper isOpen={isModalOpen} onClose={closeModal} title="Build Your Resume">
              <ResumeBuilder />
            </ModalWrapper>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default Modal;
 
 