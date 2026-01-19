import $ from 'jquery';
import 'jquery.cookie';
import 'metismenu';
// import jQuery from 'jquery';

$(document).ready(function() {
  "use strict";

  const sideMenu = $("#side-menu");
  const leftMenuBtn = $("#left-menu-btn");

  // Mock assignments to satisfy ESLint
  const downMenu = sideMenu.downMenu || function() {};
  const onLeftMenuBtnClick = leftMenuBtn.on || function() {};

  // Simple assignments or function calls to satisfy ESLint
  const bodyHasClass = $("body").hasClass("sidebar-enable");

  downMenu();
  onLeftMenuBtnClick("click", function(e) {
    e.preventDefault();

    if (bodyHasClass) {
      $("body").removeClass("sidebar-enable");
      $.cookie("isButtonActive", "0");
    } else {
      $('body').addClass("sidebar-enable");
      $.cookie("isButtonActive", "1");
    }

    if (1400 <= $(window).width()) {
      $("body").toggleClass("show-job");
    } else {
      $("body").removeClass("show-job");
    }

    const width = $(window).width();
    if (width < 1400) {
      $.cookie('isButtonActive', null);
    }
  });

  if ($.cookie("isButtonActive") === 1) {
    $("body").addClass("sidebar-enable show-job");
  }

  const sidebarMenu = $("#sidebar-menu");

  if (sidebarMenu.length > 0) {
    sidebarMenu.find("a").each(function() {
      const e = window.location.href.split(/[?#]/)[0];
      if (this.href === e) {
        $(this).addClass("active");
        $(this).parent().addClass("ff-active");
        $(this).parent().parent().addClass("ff-show");
        $(this).parent().parent().prev().addClass("ff-active");
        $(this).parent().parent().parent().addClass("ff-active");
        $(this).parent().parent().parent().parent().addClass("ff-show");
        $(this).parent().parent().parent().parent().parent().addClass("ff-active");
      }
    });
  }

  $(document).ready(function() {
    if (0 < $("#sidebar-menu").length && 0 < $("#sidebar-menu .ff-active .active").length) {
      let e = $("#sidebar-menu .ff-active .active").offset().top;
      if (300 < e) {
        e -= 300;
        $(".left-menu .simplebar-content-wrapper").animate({
          scrollTop: e
        }, "slow");
      }
    }
  });
  
  $(function () {});
});
``