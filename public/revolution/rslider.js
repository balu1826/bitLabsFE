/* Slider 1*/
var	tpj = jQuery;
	if(window.RS_MODULES === undefined) window.RS_MODULES = {};
	if(RS_MODULES.modules === undefined) RS_MODULES.modules = {};
	RS_MODULES.modules["revslider11"] = {once: RS_MODULES.modules["revslider11"]!==undefined ? RS_MODULES.modules["revslider11"].once : undefined, init:function() {
		window.revapi1 = window.revapi1===undefined || window.revapi1===null || window.revapi1.length===0  ? document.getElementById("rev_slider_1_1") : window.revapi1;
		if(window.revapi1 === null || window.revapi1 === undefined || window.revapi1.length==0) { window.revapi1initTry = window.revapi1initTry ===undefined ? 0 : window.revapi1initTry+1; if (window.revapi1initTry<20) requestAnimationFrame(function() {RS_MODULES.modules["revslider11"].init()}); return;}
		window.revapi1 = jQuery(window.revapi1);
		if(window.revapi1.revolution==undefined){ revslider_showDoubleJqueryError("rev_slider_1_1"); return;}
		revapi1.revolutionInit({
				revapi:"revapi1",
				DPR:"dpr",
				visibilityLevels:"1240,1024,778,480",
				gridwidth:650,
				gridheight:620,
				perspective:600,
				perspectiveType:"global",
				editorheight:"620,768,960,720",
				responsiveLevels:"1240,1024,778,480",
				progressBar:{disableProgressBar:true},
				navigation: {
					onHoverStop:false
				},
				viewPort: {
					global:false,
					globalDist:"-200px",
					enable:false
				},
				fallbacks: {
					allowHTML5AutoPlayOnAndroid:true
				},
		});
		
	}} // End of RevInitScript
	if (window.RS_MODULES.checkMinimal!==undefined) { window.RS_MODULES.checkMinimal();};

	/* Slider 7*/
	var	tpj = jQuery;
		if(window.RS_MODULES === undefined) window.RS_MODULES = {};
		if(RS_MODULES.modules === undefined) RS_MODULES.modules = {};
		RS_MODULES.modules["revslider71"] = {once: RS_MODULES.modules["revslider71"]!==undefined ? RS_MODULES.modules["revslider71"].once : undefined, init:function() {
			window.revapi7 = window.revapi7===undefined || window.revapi7===null || window.revapi7.length===0  ? document.getElementById("rev_slider_7_1") : window.revapi7;
			if(window.revapi7 === null || window.revapi7 === undefined || window.revapi7.length==0) { window.revapi7initTry = window.revapi7initTry ===undefined ? 0 : window.revapi7initTry+1; if (window.revapi7initTry<20) requestAnimationFrame(function() {RS_MODULES.modules["revslider71"].init()}); return;}
			window.revapi7 = jQuery(window.revapi7);
			if(window.revapi7.revolution==undefined){ revslider_showDoubleJqueryError("rev_slider_7_1"); return;}
			revapi7.revolutionInit({
					revapi:"revapi7",
					DPR:"dpr",
					visibilityLevels:"1240,1024,778,480",
					gridwidth:"1230,1024,778,480",
					gridheight:"900,630,475,400",
					lazyType:"smart",
					perspective:600,
					perspectiveType:"global",
					editorheight:"900,630,475,400",
					responsiveLevels:"1240,1024,778,480",
					progressBar:{disableProgressBar:true},
					navigation: {
						onHoverStop:false
					},
					parallax: {
						levels:[5,10,15,20,25,30,35,40,45,46,47,48,49,50,51,30],
						type:"mouse",
						origo:"slidercenter",
						speed:0
					},
					viewPort: {
						global:true,
						globalDist:"-200px",
						enable:false
					},
					fallbacks: {
						allowHTML5AutoPlayOnAndroid:true
					},
			});
			
		}} // End of RevInitScript
		if (window.RS_MODULES.checkMinimal!==undefined) { window.RS_MODULES.checkMinimal();};