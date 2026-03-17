import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
const backgroundImage = '/images/backgrounds/New-bg.jpg';


// // Function to load the Tidio script
// function loadTidioScript() {
//   const script = document.createElement('script');
//   script.src = "//code.tidio.co/wpu5hre78erukppaxms2pcge39ckekpy.js";
//   script.async = true;
//   document.body.appendChild(script);
// }

// Load the Tidio script when the DOM is fully loaded
// document.addEventListener('DOMContentLoaded', loadTidioScript);
 
// Apply background to the root element
document.body.style.backgroundImage = `url(${backgroundImage})`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundPosition = 'center';
document.body.style.backgroundAttachment = 'fixed';
document.body.style.backgroundRepeat = 'no-repeat';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="33884279909-pupqt6eev817ebnudqfgar1ei8bqtbck.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
 
reportWebVitals();

