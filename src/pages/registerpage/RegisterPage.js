import React from 'react'
import RegisterBody from '../../components/registercomponents/RegisterBody'

export default function RegisterPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     {/* <Nav /> */}
     <RegisterBody handleLogin={onLogin}/>
     {/* <Footer /> */}
    </div>
  )
}
