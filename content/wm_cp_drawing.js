/*
__          __   _                          _                              
\ \        / /  | |                        | |                             
 \ \  /\  / /___| |__  _ __ ___   __ _ _ __| | _____ _ __   _ __ ___   ___ 
  \ \/  \/ // _ \ '_ \| '_ ` _ \ / _` | '__| |/ / _ \ '__| | '_ ` _ \ / _ \
   \  /\  /|  __/ |_) | | | | | | (_| | |  |   <  __/ | _  | | | | | |  __/
    \/  \/  \___|_.__/|_| |_| |_|\__,_|_|  |_|\_\___|_|(_) |_| |_| |_|\___|

          Webmarker Firefox Add-on, visit: www.webmarker.me

          - By Tobias Leingruber, Greg Leuch 
					- Contributeurs: Jamie Wilkinson, Florian Strübe
          - Based on GML and the 000000book.com API/ GML Database
*/

console.log("YAY! wm_cp_drawing.js LOADED");

// ******** Attach our  drawing script ********
// ********************************************

var s2=document.createElement('script');
s2.setAttribute('id','sketch');
//s2.setAttribute('src','wm_cp_sketch.js');
document.getElementsByTagName('body')[0].appendChild(s2);

// InnerHTML is stored readable in wm_sketch.js
document.getElementById('sketch').innerHTML = " \
function setup() { \
	size(1000, 800); \
	frameRate(60); \
	pts = []; \
	var wm_color = '255,0,255'; \
	strokes = (gml.tag.drawing.stroke instanceof Array ? gml.tag.drawing.stroke : [gml.tag.drawing.stroke]); \
	for(i in strokes){ \
		pts = pts.concat(strokes[i].pt); \
		pts.push(undefined); \
	} \
	var app_name = gml.tag.header && gml.tag.header.client && gml.tag.header.client.name; \
	if(app_name == 'Graffiti Analysis 2.0: DustTag' || app_name == 'DustTag: Graffiti Analysis 2.0' || app_name == 'Fat Tag - Katsu Edition'){ \
		rotation = 80; \
		translation = [0, 800]; \
		console.log('GML is known iPhone app, scaling...'); \
	} else { \
			rotation = 0; \
			translation = [0, 0]; \
			console.log('Unknown appplication source: '+app_name); \
		} console.log('rotation='+rotation+' translation='+translation); \
}; \
function draw() { \
	if(frameCount >= pts.length){ \
		return; \
	} \
	i = frameCount % pts.length; \
	prev = pts[i-1]; \
	pt = pts[i]; \
	if(i == 0) { \
		var b_canvas = document.getElementById('canvas'); \
		b_canvas.width = b_canvas.width; \
	} \
	if(pt == undefined || pt == []){ \
		return; \
	} \
	if(prev == undefined || prev == []){ \
		prev = pt; \
	} \
	dimx = (prev.x -pt.x)*width; \
	dimy = (prev.y -pt.y)*height; \
	translate(translation[0], translation[1]); \
	rotate(rotation); \
	strokeWeight(30); \
	stroke(255,0,255); \
	line(prev.x*width, prev.y*height, pt.x*width, pt.y*height);}"


/*
// append processing.js
var wm_script1 = document.createElement('script');
wm_script1.setAttribute('src','http://webmarker.me/processing.min.js');
    //wm_script1.type = 'text/javascript';
    document.getElementsByTagName('body')[0].appendChild(wm_script1);
*/

	// mock console.log() if no Firebug etc. 
	if(!console || !console.log) {
		var console = new Array();
		console.log = function () {}
	}

	// *************** Callback Method ************
	// ********************************************
	function load_gml(data){
		gml = data[0].gml;
		//document.getElementById("loading").innerHTML = '';
		
		// console.log("load_gml()");
		// console.log(gml);
		var canvas = document.getElementById("canvas"); 
		var sketch = document.getElementById("sketch").text; 
		var p = Processing(canvas, sketch, gml); 		
	
		
	};
	
	// ***************** Load GML ****************
	// *******************************************
//load our GML data! using JSON+callback from 000000book.com, the GML database
//<script src="http://000000book.com/data/2365.json?callback=load_gml" type="text/javascript" charset="utf-8">

	// ?id=154
	// ?random
	// ?latest
	var tag_id = 2737; // default to Katsu 
	
	//var found_on_the_street = (gml.tag.header.client instanceof Array ? gml.tag.header.client : [gml.tag.header.client])
	//alert(found_on_the_street);
	//strokes = (gml.tag.drawing.stroke instanceof Array ? gml.tag.drawing.stroke : [gml.tag.drawing.stroke])
//alert(strokes);
	
	var matches = document.location.href.match(/id=(\d+)/);
	console.log(matches);		
	if(matches && matches[1]){ tag_id = matches[1]; }
	else if(/latest/.test(document.location.href)){ tag_id = 'latest'; }		
	else if(/random/.test(document.location.href)){ tag_id = 'random'; }

	//update our "UI"
	//document.getElementById("tag_id").innerHTML = tag_id;
	//if(document.getElementById("link-"+tag_id)){ document.getElementById("link-"+tag_id).className = 'selected'; }
	
	// append the appropriate <script> tag
	var s=document.createElement('script');
	//s.setAttribute('src','http://000000book.com/data/'+tag_id+'.json?callback=load_gml');
	s.setAttribute('src','http://000000book.com/data.json?location='+ document.location.href +'&callback=load_gml');
	//http://000000book.com/data.json?location=http://google.com/
	s.setAttribute('id','drawing_stuff');
	document.getElementsByTagName('body')[0].appendChild(s);
	//alert(tag_id);
	/*
	var s3=document.createElement('script');
	s3.setAttribute('src','http://000000book.com/data.json?location=http://www.google.ch/');
	s3.setAttribute('id','location_stuff');
	document.getElementsByTagName('body')[0].appendChild(s3);
	*/
	/*
	var fest = document.getElementById('location_stuff').innerHtml;
	alert(fest);
	*/