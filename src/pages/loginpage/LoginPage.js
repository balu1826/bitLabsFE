import React from 'react'
import LoginBody from '../../components/logincomponents/LoginBody';


function LoginPage({onLogin}) {
  const intendedUrl = localStorage.getItem("intendedUrl");
  localStorage.clear();
  
  if (intendedUrl) {
    localStorage.setItem("intendedUrl", intendedUrl);
  }
  
  return (
    <div>
     {/* <Nav /> */}
    <LoginBody handleLogin={onLogin}/>
    {/* <Footer /> */}
    </div>
  )
}
export default LoginPage;