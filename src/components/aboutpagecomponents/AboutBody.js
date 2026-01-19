import React from 'react'
import { useState} from 'react';
export default function AboutBody() {
  const [showAdditionalContent, setShowAdditionalContent] = useState(false);
  const toggleContent = () => {
    setShowAdditionalContent(!showAdditionalContent);
  };
  
  return (
    <div>
      <section className="inner-review-section">
        <div className="tf-container">
          <div className="row">
            <div className="col-lg-7 col-md-12">
              <div className="wd-review-job thumb2 widget-counter stc">
                <div className="thumb">
                  <img src="images/review/thumb2.png" alt="images" />
                </div>
                <div className="trader-box">
                  <div className="content">
                    <h3 className="number wrap-counter">
                      <span className="number counter-number" data-speed="1000" data-to="50"></span><span>+</span>
                    </h3>
                    <div className="des">Live Jobs</div>
                  </div>
                  <div className="shape ani7">
                    <img src="images/review/shape.png" alt="images" />
                  </div>
                </div>
                <div className="tes-box ani5">
                  <div className="client-box">
                    <div className="avt">
                      <img src="images/review/client.jpg" alt="images" />
                      <div className="badge"> </div>
                    </div>
                    <div className="content">
                      <h6 className="number wrap-counter">
                        <span className="number counter-number" data-speed="1000" data-to="20"></span><span>k+</span>
                      </h6>
                      <div className="des">Candidates</div>
                    </div>
                  </div>
                </div>
                <div className="icon1 ani3">
                  <img src="images/review/icon1.png" alt="images" />
                </div>
                <div className="icon2 ani4">
                  <img src="images/review/icon2.png" alt="images" />
                </div>
                <div className="icon3 ani6">
                  <img src="images/review/icon3.png" alt="images" />
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-12 wow fadeInRight">
              <div className="wd-review-job contentbox1 page-text stc">
              <h3>About</h3>
              <p>
                We Are A Leading Global Executive Search Firm Specializing In Leadership And Senior Technical Hires.
 
                Through Our Range Of Value-Added Services, We Help You Make Smart Hiring Decisions That Will Let You Build A Growing Organization.
              </p>
              <p>
                We Understand Your Organizational Needs, Culture, And Help You Find The Best Talent With Unique Leadership Attributes.
 
                {showAdditionalContent && (
                  <>
                     &nbsp;We Leverage Seamless Networking And Data-Driven Search Strategies In Recruiting Executive Talent Across A Broad Range Of Industries, Business Functions, And Job Levels.
                  </>
                )}
              </p>
              <a  className="tf-button style-1" onClick={toggleContent}>
                {showAdditionalContent ? 'Read less' : 'Read more'}
              </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="wd-banner-counter">
      <div className="tf-container st3">
        <div className="row">
          <div className="col-lg-12">
            <div className="group-title-counter stc">
              <h3>The numbers don't lie</h3>
              <p>About 800+ new jobs every day</p>
            </div>
            <div className="group-counter wow fadeInUp">
              <div className="row align-item-center">
                <div className="col-lg-3 col-md-6">
                  <div className="wd-counter widget-counter">
                    <div className="inner wrap-counter">
                      <h2>
                        <span className="counter-number" data-speed="1000" data-to="50"></span>
                        <span>+</span>
                      </h2>
                    </div>
                    <p className="description">Live Jobs</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="wd-counter widget-counter">
                    <div className="inner wrap-counter">
                      <h2>
                        <span className="counter-number" data-speed="1000" data-to="10"></span>
                        <span>k+</span>
                      </h2>
                    </div>
                    <p className="description">Hiring Companies</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="wd-counter widget-counter">
                    <div className="inner wrap-counter">
                      <h2>
                        <span className="counter-number" data-speed="1000" data-to="7"></span>
                        <span> Days</span>
                      </h2>
                    </div>
                    <p className="description">Hiring Process</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="wd-counter widget-counter br-none">
                    <div className="inner wrap-counter">
                      <h2>
                        <span className="counter-number" data-speed="1000" data-to="20"></span>
                        <span>k+</span>
                      </h2>
                    </div>
                    <p className="description">Candidates</p>
                  </div>
                </div>
              </div>
              <img className="thumb ani4" src="images/partners/thum-1.png" alt="images" />
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="wd-banner-CTA">
    <div className="tf-container">
      <div className="row">
        <div className="col-lg-12  wow fadeInUp">
          <div className="group-banner-CTA">
            <h3>Job Opportunities Are Always Open</h3>
            <p>
                Streamline your hiring process with strategic channels to reach
                qualified candidates
              </p>
            <div className="group-btn">
              <a href="/candidate"><button className="tf-btn">Find Jobs</button></a>
              <a href="/recruiter"><button className="tf-btn">Find Candidates</button></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>     
    </div>
  )
}
