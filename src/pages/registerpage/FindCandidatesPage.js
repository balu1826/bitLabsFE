import React from 'react'
import RegisterBody from '../../components/registercomponents/RegisterBody'


export default function FindCandidatesPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     {/* <FindCandidates /> */}
     <RegisterBody handleLogin={onLogin}/>
     {/* <Footer /> */}
    </div>
  )
}
