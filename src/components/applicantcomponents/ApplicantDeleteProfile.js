import React from 'react'
export default function ApplicantDeleteProfile() {
  return (
    
    <div>
<div class="dashboard__content">
    <section class="page-title-dashboard">
      <div class="themes-container">
        <div class="row">
          <div class="col-lg-12 col-md-12 ">
            <div class="title-dashboard">
              <div class="title-dash flex2">Delete Profile</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="flat-dashboard-detele flat-dashboard-password">
      <div class="themes-container">
        <div class="row">
          <div class="col-lg-12 col-md-12 ">
            <div class="change-password bg-white">
              <form action="https://themesflat.co/html/jobtex/dashboard/dashboard.html">
                <div class="form-password">
                  <h3>Are You Sure! You Want To Delete Your Profile.</h3>
                  <h4 class="color-4">This can’t be undone!</h4>
                  <div class="pass-box">
                    <div class="inner info-wd">
                      <label class="title-url fs-16">Please enter your login Password to confirm:</label>
                      <div class="inputs-group auth-pass-inputgroup relative flex2">
                        <input type="password" class="input-form password-input" value="123456789" required />
                      </div>
                    </div>
                    <div class="tt-button submit">
                      <a>Delete</a>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
    </div>
  )
}
