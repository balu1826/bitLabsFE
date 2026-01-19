import React from 'react'
import LoginBody from '../../components/logincomponents/LoginBody';


function LoginPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     {/* <Nav /> */}
    <LoginBody handleLogin={onLogin}/>
    {/* <Footer /> */}
    </div>
  )
}
export default LoginPage;