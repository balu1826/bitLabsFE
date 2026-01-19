import React from 'react'
import RecruiterLogin from '../../components/recruitercomponents/RecruiterLogin';
function RecruiterLoginPage({onLogin}) {
  return (
    <div>
     {/* <Nav /> */}
    <RecruiterLogin handleLogin={onLogin}/>
    {/* <Footer /> */}
    </div>
  )
}
export default RecruiterLoginPage;