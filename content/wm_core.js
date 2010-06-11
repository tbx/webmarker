/*
__          __   _                          _                              
\ \        / /  | |                        | |                             
 \ \  /\  / /___| |__  _ __ ___   __ _ _ __| | _____ _ __   _ __ ___   ___ 
  \ \/  \/ // _ \ '_ \| '_ ` _ \ / _` | '__| |/ / _ \ '__| | '_ ` _ \ / _ \
   \  /\  /|  __/ |_) | | | | | | (_| | |  |   <  __/ | _  | | | | | |  __/
    \/  \/  \___|_.__/|_| |_| |_|\__,_|_|  |_|\_\___|_|(_) |_| |_| |_|\___|

          Webmarker Firefox Add-on, visit: www.webmarker.me

          - Authors: Tobias Leingruber, Greg Leuch, Jamie Wilkinson, Florian Strübe
          - Based on GML and the 000000book.com API/ GML Database
*/

// mock console.log() if no Firebug etc. 
if(!console || !console.log) {
	var console = new Array();
	console.log = function () {}
}

//***************Global Vars*****************
//*******************************************
var wm_stroke_size = 30;	// set default stroke size to 30
var wm_color = '#FF00FF'; 	// set default color to pink

var wm_dripping = 0; // Not Implemented yet
var wm_location = window.location;
var wm_username = "TestUser";

var last_memory_data = new Date().getTime();
var testx = 0;
var testy = 0;
var timeSeconds = 0;
var points = "";
var points_opening_tag = "<GML spec='0.1b'><tag><header><client><location>" + wm_location + "</location><name>Webmarker.me</name><version>0.4b</version><username>" + wm_username + "</username><keywords>All your Interwebs are belong to Us</keywords></client></header><environment></environment><drawing>"; 
var points_closing_tag = "</drawing></tag></GML>"
var points_reset_backup = "<GML spec='0.1b'><tag><header><client><location>" + wm_location + "</location><name>Webmarker.me</name><version>0.4b</version><username>" + wm_username + "</username><keywords>All your Interwebs are belong to Us</keywords></client></header><environment></environment><drawing>"; // Always a copy of points in here.
//var wm_gml_data = points + "</drawing></tag></GML>" // FINAL GML DATA for 000000book.com
var letzte_zeit_verstrichen=0;
var letzter_speicher_wert=0;
var myCanvas;


console.log("YAY! wm_core.js LOADED");



// ************ Insert Control Panel ***************
//**************************************************
control_panelCode = ' \
<div id="control_panel1" style="position:fixed;z-index:1012;top:0px;right:0px;height:200px;width:74px; font-color:black; font-family:helvetica,arial!important;"> \
	<button id="wm_button" onclick="javascript:wm_toggle();"> WM ON/OFF </button> \
	<!-- Button Togles Control Panel ON/OFF, not working right now, lost its code snippet. --> \
	<div style="background-color:yellow; visibility:hidden;" id="control_panel"> \
	<a href="http://webmarker.me" ><img style="border-style:none;" src="http://webmarker.me/webmarker_logo_s.png" width="74" height="85"/></a> \
	<style>.color-select { border:1px solid; border-color:#666; margin:3px; float:left; width:25px; height:25px; }</style> \
	<table style="cell-padding:0; padding:0; font-color:black; color:black; font-size:13px!important; border-style:none;"> \
		<tr> \
			<td>Select Color</br>To Start</td> \
		</tr> \
		<tr> \
		<td> \
			<!-- color selectors / START MARKIN --> \
			<a href="javascript:wm_start(\'#FF00FF\');" alt"CLICK to select this Color"> \
				<div class="color-select" id="webmarker_pink" style="background-color:#FF00FF;"> </div> \
			</a> \
			<a href="javascript:wm_start(\'#FFFF00\');" alt"CLICK to select this Color"> \
				<div class="color-select" id="webmarker_yellow" style="background-color:#FFFF00;"></div> \
			</a> \
			<a href="javascript:wm_start(\'#000000\');" alt"CLICK to select this Color"> \
				<div class="color-select" id="webmarker_black" style="background-color:#000000;"></div> \
			</a>  \
			<a href="javascript:wm_start(\'#FFFFFF\');" alt"CLICK to select this Color"> \
				<div class="color-select" id="webmarker_white" style="background-color:#FFFFFF;"></div> \
			</a> \
		</td> \
		</tr> \
		<tr> \
			<td> </td> \
		</tr> \
		<tr> \
			<td>Tip Size<a href="javascript:wm_write_gml_to_console();" style="text-decoration:none;">: \
				</a> \
			</td> \
		</tr> \
		<tr> \
			<td> \
				<input type="radio"name="wb_marker_size"onclick="wm_change_marker_size(\'5\');createCanvasOverlay(\'rgba(0,0,0,0)\')">S</br> \
				<input type="radio"name="wb_marker_size"onclick="wm_change_marker_size(\'10\');createCanvasOverlay(\'rgba(0,0,0,0)\')">M</br> \
				<input type="radio"name="wb_marker_size"onclick="wm_change_marker_size(\'17\');createCanvasOverlay(\'rgba(0,0,0,0)\')">L</br> \
				<input type="radio"name="wb_marker_size"onclick="wm_change_marker_size(\'30\');createCanvasOverlay(\'rgba(0,0,0,0)\')" checked>XL</br> \
			</td> \
		</tr> \
		<tr> \
		<td> \
			<input type="checkbox" name="wm_street_mode" onclick="wm_street_mode();" checked>Street<p></p> \
			<button onClick="javascript:wm_delete_current_drawing();createCanvasOverlay(\'rgba(0,0,0,0)\');">Delete</button> \
			<form action="http://000000book.com/data" method="POST" id="wm_upload" onclick="appendGMLToForm();"> \
				<input id="wm_publish" type="submit" value="Upload" /> \
				<input type="hidden" name="application" value="Webmarker" /> \
				<!-- below tells #000000book to send us to the page it created, and not just return the ID --> \
				<input type="hidden" name="redirect_back" value="true" /> \
			</form> \
			<a href="http://000000book.com/data?app=Webmarker" style="font-size:11px;">000000book</a> \
		</td> \
		</tr> \
	</table> \
	</div> \
</div>';
var control_panel = document.createElement('div');
control_panel.innerHTML = control_panelCode;  //control_panelCode is a string of HTML
control_panel.setAttribute("style","position:absolute;z-index:1011;top:5px;right:5px;background:yellow;");
document.getElementsByTagName("body")[0].appendChild(control_panel);

// get upload button and disable it when the script starts
var upload_button = document.getElementById('wm_publish');
upload_button.setAttribute('disabled','true');


//*******TO-DO Generate Image From Canvas********
//***********************************************
//Problem: Only chrome privileged Code can take "real" screenshots.
/*
function generate_png(sourceCanvas) {
	// get base64 encoded png from Canvas
	var image = sourceCanvas.toDataURL("image/png");
	alert(image);
}
*/

//******GML UPLOAD CODE by Jamie Wilkinson*******
//***********************************************
// add the GML data to the form in the upload page (requires pageload)
// need to add GET to blackbook in order to ajaxify
function appendGMLToForm()
{
	if(points === '')
	{
			alert('points empty');
			console.log('points list empty. please draw something.');	
	}
	else
	{
		var wm_gml_data = points_opening_tag + points + points_closing_tag;
		//alert("Your GML Data: " + wm_gml_data);
		form = document.getElementById('wm_upload');
		var m = document.createElement('input');
		m.setAttribute('type', 'hidden');
		m.setAttribute('name', 'gml');
		m.setAttribute('value', wm_gml_data);
		form.appendChild(m);
		// we return false from the onclick() so we can call here
		//form.submit();
		//window.location.reload();
		//e.preventDefault();
	}
}

// after GET upload is added to 000book we can send things ajax-styles by appending a <script>
/*
function blackbookUpload()
{
var s=document.createElement('script');
s.setAttribute('src','http://000000book.com/data/upload?application=webmarker&gml='+escape(points));
document.getElementsByTagName('body')[0].appendChild(s);
}
*/

//***********Create Canvas Recorder Environment**************
// based on F. Parmadi's "dynamic canvas overlay...", 
// http://www.permadi.com , 2009
//************************************************************
 function createCanvasOverlay(color, canvasContainer)
 {
      if (!canvasContainer)
      {
        canvasContainer = document.createElement('div'); 
        document.body.appendChild(canvasContainer);
        canvasContainer.style.position="absolute";
        canvasContainer.style.left="0px";
        canvasContainer.style.top="0px";
        canvasContainer.style.width="100%";
        canvasContainer.style.height="100%";
        canvasContainer.style.zIndex="1010";
        superContainer=document.body;
      }
      else
        superContainer=canvasContainer; // I actually don't get this syntax!? -TBX
		// if you don't give the createCanvasOverlay function a canvas container as parameter, it uses the body as default container
		// otherwise it uses the container you gave the function as parameter -fstr
      {
      myCanvas = document.createElement('canvas');
      myCanvas.style.width = superContainer.scrollWidth+"px";
      myCanvas.style.height = superContainer.scrollHeight+"px";
      myCanvas.width=superContainer.scrollWidth; // otherwise the canvas will be streethed to fit the container
      myCanvas.height=superContainer.scrollHeight;    
      //surfaceElement.style.width=window.innerWidth; 
      myCanvas.style.overflow = 'visible';
      myCanvas.style.position = 'absolute';
			//myCanvas.id='canvas_recorder';
			myCanvas.setAttribute("class", "canvas_recorder");
      }

      var context=myCanvas.getContext('2d');
      context.fillStyle = color;
      context.fillRect(0,0, myCanvas.width, myCanvas.height);
      canvasContainer.appendChild(myCanvas);

      context.strokeStyle=wm_color;
      context.lineWidth=wm_stroke_size;    
      myCanvas.parentNode.addEventListener('mousemove', onMouseMoveOnMyCanvas, false); 
      myCanvas.parentNode.addEventListener('mouseup', onMouseUpOnMyCanvas, false);  // jdubs added this -- for closing the <stroke>
      myCanvas.parentNode.addEventListener('mousedown', onMouseClickOnMyCanvas, false);
      myCanvas.parentNode.addEventListener('mouseup', onMouseClickOnMyCanvas, false);  // TBX added this  
 }


//**************Create Drawing and GML for Recorder ************
// based on F. Parmadi's "dynamic canvas overlay...", 
// http://www.permadi.com , 2009
//**************************************************************
function onMouseMoveOnMyCanvas(event)
{
	if(!myCanvas.drawing){ return; }

	// cause GML needs relative coordinates 
	var docHeight = window.innerHeight;
	var docWidth = window.innerWidth;
	var mouseX=event.layerX;  
	var mouseY=event.layerY;
	var context = myCanvas.getContext("2d");
	testx = mouseX;
	testy = mouseY;

	if (myCanvas.pathBegun==false) {
		context.beginPath();
		myCanvas.pathBegun=true;
		points = points + "<stroke><color>" + wm_color + "</color><stroke_size>" + wm_stroke_size + "</stroke_size><dripping>" + wm_dripping + "</dripping>";  // Adds the info of the upcoming line
		letzter_speicher_wert = new Date().getTime()
	}
	else {
		// wenn der zuletzt gespeicherte Wert älter als 100ms  
		// ist, dann speichere einen neuen Wert in der Liste     
		// points
		//********* Create GML Time and put it together w/ Mouse coordinates into variable**********
		timestamp = new Date().getTime();			  
		var zeit_verstrichen = timestamp - letzter_speicher_wert;
		if (zeit_verstrichen > 50) {
			// gesamtzeit
			sum_zeit_verstrichen = zeit_verstrichen + letzte_zeit_verstrichen;
			// momentane punkte + timestamp an liste points 
			// anhängen
			points = points + "<pt><x>" + mouseX/docWidth + "</x><y>" + mouseY/docHeight + "</y><time>" + (sum_zeit_verstrichen / 1000).toFixed(2) + "</time></pt>";
			letzter_speicher_wert = timestamp;
			letzte_zeit_verstrichen = sum_zeit_verstrichen;
		}
		context.lineTo(mouseX, mouseY);
		context.stroke();
	}
}

// write the final closing </stroke> on mouseup if we are drawing
function onMouseUpOnMyCanvas(event)
{	
	if(myCanvas.pathBegun == true){
		points = points + "</stroke>";
		// points list filled, so activate the upload button
		upload_button.removeAttribute('disabled');
	}
}

// reset drawing on click
function onMouseClickOnMyCanvas(event)
{
	myCanvas.drawing = !myCanvas.drawing;
	// reset the path when starting over
	// if drawing is active
	if (myCanvas.drawing) { 
		myCanvas.pathBegun = false; 
	}
}

/* 
function hideCanvas() // Hide last drawn Canvas. Kind of like "undo", but only visually, doesn't remove the GML(yet)
    if (myCanvas)
    {
      myCanvas.parentNode.style.visibility='hidden';
    }
}
*/

// ********Show/Hide Control Panel + Deactivate Street Mode + Remember street mode status***********
// *************************************************************************************************
var wm_toggle_status = 3;
var wm_street_status_was = 0;
function wm_toggle()
{
	if(wm_toggle_status == 1) { 
		//alert("Panel ON -> Switching it off");
		window.document.getElementById('control_panel').style.visibility='hidden';
		wm_toggle_status = 0;
		wm_street_status_was = wm_street_status;
		wm_street_status = 0;
		//window.document.getElementsByTagName('canvas').style.visibility='hidden';
		toggle_street_mode();
		window.location.reload();
		console.log(wm_street_status);
	}
	else {//if (wm_toggle_status == 0 ) {
		//alert("Panel OFF -> Switching it on");
		window.document.getElementById('control_panel').style.visibility='visible';
		wm_toggle_status = 1;
		wm_street_status = wm_street_status_was;
		//toggle_street_mode();
		//alert(wm_street_status);
	 } 
	/*else { 
		var b_canvas = document.getElementById("canvas");
		b_canvas.width = b_canvas.width; // Reset Canvas
		wm_toggle_status = 0;
		wm_street_status_was = wm_street_status;
		wm_street_status = 0;
	}*/
}

//********** Select Color and start DRAWING!!*************
//********************************************************
function wm_start(color) // this is the onclick handler for the color selection buttons, which start the whole process
{	
	wm_change_color(color); // initialze a canvas! with a stroke color yay!
	createCanvasOverlay('rgba(0,0,0,0)');	
}

//******** Reset Canvases, empty GML points list ********
//*******************************************************

function wm_delete_current_drawing()
{
    if (myCanvas)
    {
      var recorder_canvases=document.getElementsByClassName('canvas_recorder');
		  for (var i = 0; i < recorder_canvases.length; i++) {recorder_canvases[i].width=recorder_canvases[i].width;}
		  // delete current GML points list
		  points = ''; 
		  // disable upload button because points list is empty 
		  upload_button.setAttribute('disabled','true');
    }
}

function wm_delete_all() //function probably obsolete now
{
    if (myCanvas)
    {
      var all_canvases=document.getElementsByTagName('canvas');
		  for (var i = 0; i < all_canvases.length; i++) {all_canvases[i].width=all_canvases[i].width;}
		  // delete current GML points list
		  points = ''; 
		  // disable upload button because points list is empty 
		  upload_button.setAttribute('disabled','true');
    }
}

// handler to initialize on page load if ?test=1 is in the URL
document.addEventListener('DOMContentLoaded', wm_init_handler, false);
function wm_init_handler(event)
{
	if( /test=1/.test(window.location.href) ){		
		wm_start("#00FF00");
	} 
}

// ******* Change stroke color *******
// ***********************************
function wm_change_color(new_color) 
{
	//alert('Color SET to '+ new_color);
	wm_color = new_color;
}

// ****** Change brush size *******
// ********************************
function wm_change_marker_size(size) 
{
	wm_stroke_size = size;
//	alert("width set to" + wm_stroke_size);
}

// ***** GML Test Function ******
// Note: Link is hidden in Tip Size":"
// ******************************
function wm_write_gml_to_console()
{
	var wm_gml_data = points + "</drawing></tag></GML>";
    console.log(wm_gml_data);   
}


// ***********Switch ON/OFF Street Mode. Street Mode = Canvas Player activated.********
//*************************************************************************************

var wm_street_status = 123; // Just a number -> SWITCH and go to Function
function wm_street_mode() {
		if (wm_street_status == 1) { // If it's 1, switch to 0 and call function
			wm_street_status = 0;
			//console.log("wm_sm was 1 and now it's 0");
			toggle_street_mode();
		}
		else {
			wm_street_status = 1; // If it's 0, switch to 1 and reload page to exectue the code
			//console.log("wm_sm was not 1 and now it's 1");
			toggle_street_mode();
			//window.location.reload(); // Shitty solution but... yeah.
		}
}

function toggle_street_mode() { // = Canvas Player ON
	
// ************Canvas Player***************
//*****************************************

//***RESET***
if (wm_street_status == 0) { // If street mode is 0
	 //console.log(" wm_sm is 0 - Reset Canvas");
	 var b_canvas = document.getElementById("canvas");
	 b_canvas.width = b_canvas.width; // Reset Canvas
}
//***START***
else if (wm_street_status == 1) {
	//alert("Hell Yes Street Mode!");
	// Load Canvas Player Drawing Script
	//console.log("wm_sm is 1 -> activate player");
	
	// append script wm_cp_drawing.js to website head
	var script_cp_drawing 		= document.createElement('script');
    script_cp_drawing.src 		= 'chrome://webmarker/content/wm_canvasplayer.js';
    script_cp_drawing.type 		= 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script_cp_drawing);

	// append script processing.min.js to website head
	var script_processing_min 	= document.createElement('script');
    script_processing_min.src 	= 'chrome://webmarker/content/processing.min.js';
    script_processing_min.type 	= 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script_processing_min);
	


	/* // Saidly acted weird.
	// div popup stuff start 
	div_loadingCode = '<img src="http://www.histats.com/images/loading1.gif" alt="" title="" id="loading_animation" /><div id="div_loading_id">...</div>';

	var div_loading;
    div_loading = document.createElement('div');
    div_loading.innerHTML = div_loadingCode;  //div_loadingCode is a string of HTML
    div_loading.setAttribute("style","position:absolute;z-index:1000;top:5px;right:5px;");
    div_loading.setAttribute("id","tag_id");
    document.getElementsBydiv_loadingName("body")[0].appendChild(div_loading);
    */
	}
	//***FIRST RUN, set Status to 0*** // Does this even make sense? hahaha I forgot /TBX
	else if (wm_street_status == 123) { // On Pageload
		//alert("Hell Yes Street Mode!");
		// Load Canvas Player Drawing Script
		//console.log("wm_sm is NOT 0 and NOT 1, switched to 0");
		wm_street_status = 0;
		wm_street_mode();
		}

}

toggle_street_mode(); // just so the function gets initially called
