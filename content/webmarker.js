// ==UserScript==
// @name           Webmarker
// @namespace      Mark the Web!!
// @include        *
// ==/UserScript==

/*
__          __   _                          _                              
\ \        / /  | |                        | |                             
 \ \  /\  / /___| |__  _ __ ___   __ _ _ __| | _____ _ __   _ __ ___   ___ 
  \ \/  \/ // _ \ '_ \| '_ ` _ \ / _` | '__| |/ / _ \ '__| | '_ ` _ \ / _ \
   \  /\  /|  __/ |_) | | | | | | (_| | |  |   <  __/ | _  | | | | | |  __/
    \/  \/  \___|_.__/|_| |_| |_|\__,_|_|  |_|\_\___|_|(_) |_| |_| |_|\___|

          Webmarker Firefox Add-on, visit: www.webmarker.me

          - By Tobias Leingruber, Greg Leuch 
          - Contributors: Jamie Wilkinson, Florian Strübe
          - Based on GML and the 000000book.com API/ GML Database
*/

// Maaany mann known bugs :/ Let's call them features for now!! /TBX




// ************ Load up webmarker code, so it's part of the DOM ***************
//*****************************************************************************
// Workaround for javascript security model. (read more: GM Unsafewindow)
var wm_main_script = document.createElement('script');
wm_main_script.src = 'chrome://webmarker/content/wm_code.js';
//wm_main_script.src = 'http://webmarker.me/wm_code.js';
wm_main_script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(wm_main_script);
