import React, { useState,useEffect } from 'react';
import $ from 'jquery';

import '../../stylesheets/bootstrap.min.css';
import '../../stylesheets/boostrap-select.min.css';
import '../../stylesheets/swiper-bundle.min.css';
import '../../stylesheets/shortcodes.css';
import '../../stylesheets/style.css';
import '../../stylesheets/dashboard.css';
import '../../stylesheets/swiper-bundle.min.css';
import '../../stylesheets/colors/color6.css';
import '../../stylesheets/responsive.css';
import '../../fonts/fonts.css';
import '../../stylesheets/jquery.dataTables.min.css';

const Nav = () => {

  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);

    $("#left-menu-btn").on("click", function (e) {
      e.preventDefault();
      handleToggleMenu();
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <div>
  <>
  <a id="scroll-top" />

  <div className="boxed">
    <header id="header" className="header header-default">
      <div className="tf-container">
        <div className="row">
          <div className="col-md-12">
            <div className="sticky-area-wrap">
              <div className="header-ct-left">
                <div id="logo" className="logo">
                  <a href="/">
                    <img
                      className="site-logo"
                      src="images/logo.png"
                      alt="Image"
                    />
                  </a>
                </div>
              </div>

              <div className="header-ct-right st-1">
                <div class="header-customize-item account">
                <div class="sub-account-item">
                  <a href="/find-jobs-login" style={{ color: '#FFFFFF', backgroundColor: '#f97316', border: '1px solid #f97316', padding: '10px 10px 10px 30px', borderRadius: '8px', display: 'inline-flex', textAlign: 'center',width: '130px' }}
                    onMouseOver={(e) => { e.target.style.color = '#FFFFFF'; e.target.style.backgroundColor = '#EE6D12'; }}
                    onMouseOut={(e) => { e.target.style.color = '#FFFFFF'; e.target.style.backgroundColor = '#f97316'; }}
                    >
                   Find Jobs
                 </a>
                  </div>
                 
              </div>
                 </div>
                
       
            </div>
          </div>
        </div>
      </div>
    </header>
  </div>
</>
</div>
  );
};
export default Nav;