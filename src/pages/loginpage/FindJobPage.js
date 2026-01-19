import React from 'react'
import LoginBody from '../../components/logincomponents/LoginBody';



function FindJobPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     {/* <FindJobs /> */}
    <LoginBody handleLogin={onLogin}/>
    {/* <Footer /> */}
    </div>
  )
}
export default FindJobPage;