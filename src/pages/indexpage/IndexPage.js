import React from 'react';
import {useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '../../components/common/Nav';
import Banner from '../../components/indexpagecomponents/Banner';
import Body from '../../components/indexpagecomponents/Body';
import Footer from '../../components/common/Footer';
import FindJobs from '../../components/common/FindJobs'; 
import FindCandidates from '../../components/common/FindCandidates';

export default function IndexPage() {
  const location = useLocation();
  const isFindJobsPage = location.pathname === '/find-jobs';
  const isFindCandidatesPage = location.pathname === '/find-candidates';

  useEffect(() => {
    window.location.href = 'https://www.bitlabs.in/jobs';
  }, []);

  return null;

  return (
    <div>
      {/* {isFindJobsPage && <FindJobs />}
      {isFindCandidatesPage && <FindCandidates />}
      {!isFindJobsPage && !isFindCandidatesPage && (
        <>
          <Nav />
        </>
      )}
       <Banner />
          <Body />
          <Footer /> */}
          
    </div>
  );
}
