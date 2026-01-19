import React, { useState, useEffect } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';

function ResumeBuilder() {
  const [loginUrl, setLoginUrl] = useState('');
  const [requestData, setRequestData] = useState(null);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/applicant/getApplicantById/${user.id}`);
        const newData = {
          identifier: response.data.email,
          password: response.data.password,
        };
        setRequestData(newData);
      } catch (error) {
        console.error('Error updating profile status:', error);
      }
    };
    fetchData();
  }, [user.id]);

  useEffect(() => {
    const apiUrl1 = 'https://resume.bitlabs.in:5173/api/auth/login';
   
    if (requestData) {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      };

      fetch(apiUrl1, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(() => {
          const loginUrl = `https://resume.bitlabs.in:5173/auth/login?identifier=${encodeURIComponent(
            requestData.identifier
          )}&password=${encodeURIComponent(requestData.password)}`;
          setLoginUrl(loginUrl);
        })
        .catch((error) => {
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  }, [requestData]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <iframe
        id="resume-iframe"
        src={loginUrl}
        frameBorder="0"
        style={{ flex: 1 }}
        width="100%"
        height="100%"
      ></iframe>
    </div>
  );
}

export default ResumeBuilder;

