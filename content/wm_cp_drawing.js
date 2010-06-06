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

console.log("YAY! wm_cp_drawing.js LOADED");

function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function hex2rgb2(hexcolor)
{
R = parseInt((cutHex(hexcolor)).substring(0,2),16);
G = parseInt((cutHex(hexcolor)).substring(2,4),16);
B = parseInt((cutHex(hexcolor)).substring(4,6),16)

return R + ',' + G + ',' + B;
}

// *************** Callback Method ************
// ********************************************
function load_gml(data) 
{
	if(typeof(data) != 'undefined')	
	{
		gml_ids = new Array(data.length);
		gml_gml = new Array(data.length);
		console.log(data.length + ' GML objects received');
		
		
		
		var draw_count = 10; // only show latest 10 tags
		if(data.length < 10)
		 draw_count = data_length;

		for(var i=0; i<draw_count; i++) {
		
		
		//for(var i=0; i<data.length; i++) {
			if (typeof(data[i]) != 'undefined') {
				gml = data[i].gml;
				//console.log(gml);
						
				// attach sketch script tag
				var sketch_script = document.createElement('script');
				sketch_script.setAttribute('id','sketch'+i);
				sketch_script.type = 'application/processing';
				document.getElementsByTagName('body')[0].appendChild(sketch_script);
				
				// attach Canvas Player canvas tag
				var wm_cp_canvas = document.createElement('canvas');
				wm_cp_canvas.setAttribute('width','200px');
				wm_cp_canvas.setAttribute('height','200px');
				// uncomment following line to see the tags seperated
				wm_cp_canvas.setAttribute('style','width: 100%; height: 100%; position:absolute; pointer-events:none; z-index:1001; top:0px; left:0px;');
				//wm_cp_canvas.setAttribute('style','position:absolute; pointer-events:none; z-index:1001; top:0px; left:0px;');
				//wm_cp_canvas.setAttribute('id','canvas'+i); // single canvas for every tag
				wm_cp_canvas.setAttribute('id','canvas'); // one canvas for all tags
				document.getElementsByTagName('body')[0].appendChild(wm_cp_canvas);
						
				/* 
				 * concatenate pointlists of one tag and set them as global variables, so the processing.js draw function can acces them.
				 * This is kind of a workarround because one can't give parameters to the setup or drawing functions.
				 * Working with the iteration variable here because Objects can't be serialized and attached to the created sketch scripts, but numbers/strings can.
				 */
				pts = []; 
				pts_opts = []; 
				strokes = (gml.tag.drawing.stroke instanceof Array ? gml.tag.drawing.stroke : [gml.tag.drawing.stroke]); 
				for(j in strokes){ 
					pts = pts.concat(strokes[j].pt); 
					pts_opts = pts_opts.concat({stroke: (strokes[j].stroke_size || 30), color: (hex2rgb2(strokes[j].color) || '255,0,255'), drips: (strokes[j].dripping || false)}); 
				}

				// create global vars on demand
				eval("pts" + i + " = pts");
			    eval("pts_opts" + i + " = pts_opts");

				// appending sketch script for current tag to its script tag
				document.getElementById('sketch'+i).innerHTML = " \
				function setup() { \
				  size(1000, 800); \
				  frameRate(60); \
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
				  if(frameCount >= pts"+i+".length){ \
					return; \
				  } \
				  i = frameCount % pts"+i+".length; \
				  prev = pts"+i+"[i-1]; \
				  pt = pts"+i+"[i]; \
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
				  strokeWeight(pts_opts"+i+"[0]['stroke']); \
				  var colors = pts_opts"+i+"[0]['color'].split(','); \
				  stroke(colors[0],colors[1],colors[2]); \
				  line(prev.x*width, prev.y*height, pt.x*width, pt.y*height);}";
				
				//var canvas 	= document.getElementById('canvas' + i); // single canvas for every tag
				var canvas 	= document.getElementById('canvas'); // one canvas for all tags
				var sketch 	= document.getElementById('sketch' + i).text;

				// draw sketch on canvas
				new Processing(canvas, sketch);
			}
			else
			{
				console.log('error reading gml. gml undefined');
			}
		}
	}
}
  
// ***************** Load GML ****************
// *******************************************
//load our GML data! using JSON+callback from 000000book.com, the GML database
//<script src="http://000000book.com/data/2365.json?callback=load_gml" type="text/javascript" charset="utf-8">

// ?id=154
// ?random
// ?latest
var tag_id = 2737; // default to Katsu 

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
s.setAttribute('src','http://000000book.com/data.json?location='+ document.location.href +'&callback=load_gml&redirect_back=1');
//http://000000book.com/data.json?location=http://google.com/
s.setAttribute('id','drawing_stuff');
document.getElementsByTagName('body')[0].appendChild(s);