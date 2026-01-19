import React from 'react'



export default function Banner() {
  return (
    <div>

<section className="tf-slider sl7 over-flow-hidden">
  <div className="tf-container">
    <div className="row">
      <div className="col-lg-7 col-md-12">
        <div className="content wow fadeInUp">
          <div className="heading">
            <h2 style={{ fontFamily: 'inherit' }}>Find the job that fits your life</h2>
            <p style={{ fontFamily: 'inherit' }}>
  Resume-Library is a true performance-based job board. Enjoy custom hiring
  products and access to up to 10,000 new resume registrations daily, with no
  subscriptions or user licenses.
</p>

          </div>
          {/* Added buttons */}
          <div>
            <a
              href="/candidate"
              style={{
                color: '#FFFFFF',
                backgroundColor: '#f97316',
                
                padding: '10px 10px 10px 30px',
                borderRadius: '8px',
                display: 'inline-flex',
                width: '130px',
                textAlign: window.innerWidth >= 320 && window.innerWidth <= 462 ? 'center' : '',
                marginRight: '10px', 
                marginBottom: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#EA670C';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#f97316';
              }}
              onClick={() => {
                localStorage.clear();
              }}
              
  >
    Find Jobs
  
            
              
            </a>
            <a
              href="/recruiter"
              style={{
                color: '#f97316',
                backgroundColor: 'none',
                border: '1px solid #f97316',
                padding: '10px 10px 10px 30px',
                borderRadius: '8px',
                display: 'inline-flex',
                textAlign: 'center',
                width: '170px',
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#C2570C';
                e.target.style.backgroundColor = 'none';
                e.target.style.border= '1px solid #C2570C';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#f97316';
                e.target.style.backgroundColor = 'none';
                e.target.style.border= '1px solid #f97316';
              }}
              onClick={() => {
                localStorage.clear();
              }}
            >
              Find Candidates
            </a>
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="wd-review-job widget-counter sl7">
        <div className="thumb3">
            <div className="trader-box sl7">
              <div className="content">
                <h3 className="number wrap-counter">
                 
                  <span>25M+</span>
                </h3>
                <div className="des" >Jobs Available</div>
              </div>
              <div className="shape ani7">
                <img src="images/review/shape6.png" alt="images" />
              </div>
            </div>
            <div className="group-user">
              <div className="user-box">
                <img src="images/review/bran4.jpg" alt="images" />
                <img src="images/review/bran1.jpg" alt="images" />
                <img src="images/review/bran2.jpg" alt="images" />
                <img src="images/review/bran3.jpg" alt="images" />
              </div>
              <div className="content">
                <h6 className="wrap-counter text-pri">
                  <span>+</span>
                  <span
                    className="counter-number"
                    data-speed={2000}
                    data-to={4800}
                  >
                    4800
                  </span>
                </h6>
                <p >Employers get benefits</p>
              </div>
            </div>
            <div className="group-thumb">
              <img src="images/review/thumb7.png" alt="images" />
              <div className="shape-thumb ani8">
                <img src="images/review/shape5.png" alt="images" />
              </div>
            </div>
            <div className="icon1 ani7">
              <img src="images/review/icon11.png" alt="images" />
            </div>
            <div className="icon2 ani4">
              <img src="images/review/icon22.png" alt="images" />
            </div>
            <div className="icon3 ani5">
              <img src="images/review/icon3.png" alt="images" />
            </div>
            <div className="icon4 ani6">
              <img src="images/review/icon2.png" alt="images" />
            </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</section>

    <section>
      <div className="bg-pri1 wrap-count">
        <div className="tf-container">
          <div className="row align-item-center">
            <div className="col-lg-3 col-md-6 col-lg-3 col-md-6">
              <div className="wd-counter style-light widget-counter">
                <div className="inner wrap-counter">
                  <h2>
                    <span></span><span>50+</span>
                  </h2>
                </div>
                <p className="description">Live Jobs</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-lg-3 col-md-6" data-wow-delay="0.3s">
              <div className="wd-counter style-light widget-counter">
                <div className="inner wrap-counter">
                  <h2>
                    <span></span><span>10+</span>
                  </h2>
                </div>
                <p className="description">Hiring Companies</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-lg-3 col-md-6" data-wow-delay="0.4s">
              <div className="wd-counter style-light widget-counter">
                <div className="inner wrap-counter">
                  <h2>
                    <span></span><span>7 Days</span>
                  </h2>
                </div>
                <p className="description">Hiring Process</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-lg-3 col-md-6" data-wow-delay="0.5s">
              <div className="wd-counter style-light widget-counter">
                <div className="inner wrap-counter">
                  <h2>
                    <span></span><span>20k+</span>
                  </h2>
                </div>
                <p className="description">Candidates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}
