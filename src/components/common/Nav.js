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
 
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1301);
 
  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };
 
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1301);
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
  
  <a id="scroll-top" href="#"></a>

 

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
                      usemap="#image-map"
                    />
                    
                  </a>
              <p className="para1">A <a href="https://www.tekworks.in/" target='_blank'><span style={{color:'#808080'}}>TekWorks</span></a> Product</p>
                </div>
              </div>
             
             <div className="header-ct-right st-1">
  <div className="header-customize-item1 account">
  <div className="sub-account-item1 ">
    </div>
    </div>
    <div className="header-customize-item2 account2">
    <div className="sub-account-item">
 
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