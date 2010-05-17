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
function inspect(obj, maxLevels, level){var str = '', type, msg, indent = ''; for(var i=0; i<level; i++) indent += '  ';if(level == null)  level = 0;if(maxLevels == null) maxLevels = 1; if(maxLevels < 1) return 'Error: Levels number must be > 0';if(obj == null)return 'Error: Object NULL';for(property in obj){try{type =  typeof(obj[property]);str += indent+'(' + type + ') ' + property + ( (obj[property]==null)?(': NULL'):('')) + "\n";if((type == 'object') && (obj[property] != null) && (level+1 < maxLevels))str += inspect(obj[property], maxLevels, level+1);}catch(err){if(typeof(err) == 'string') msg = err;else if(err.message) msg = err.message;else if(err.description) msg = err.description;else msg = 'Unknown';str += '(Error) ' + property + ': ' + msg +"\n";}}return str;}

// ******** Attach our  drawing script ********
// ********************************************

var s2=document.createElement('script');
s2.setAttribute('id','sketch');
//s2.setAttribute('src','wm_cp_sketch.js');
document.getElementsByTagName('body')[0].appendChild(s2);

function rgb2hex(str) {str = str.replace(/\s/g, "").replace(/^(rgb\()(\d+),(\d+),(\d+)(\))$/, "$2|$3|$4").split("|"); return "#" + hex(str[0]) + hex(str[1]) + hex(str[2]);}
function hex2rgb(str) {if (str.match(/^(DefaultColor)/i)) return str.replace(/^(DefaultColor\()(.*)(\))$/ig, '$2'); str = str.replace(/\#/g, "").match(/^(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})|([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1}))$/i); return (str ? rgb(str[2]) +','+ rgb(str[3]) +','+ rgb(str[4]) : '255,0,255');}
function hex(x) {var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8","9", "A", "B", "C", "D", "E", "F"); return isNaN(x) ? "00" : hexDigits[(x-x%16)/16] + hexDigits[x%16];}
function rgb(x) {return isNaN(x) ? "0" : parseInt(x, 16);}

// InnerHTML is stored readable in wm_sketch.js
document.getElementById('sketch').innerHTML = " \
function setup() { \
  size(1000, 800); \
  frameRate(60); \
  pts = []; \
  pts_opts = []; \
  strokes = (gml.tag.drawing.stroke instanceof Array ? gml.tag.drawing.stroke : [gml.tag.drawing.stroke]); \
  for(i in strokes){ \
    pts = pts.concat(strokes[i].pt); \
    pts_opts = pts_opts.concat({stroke: (strokes[i].stroke_size || 30), color: (hex2rgb(strokes[i].color) || '255,0,255'), drips: (strokes[i].dripping || false)}); \
    if (false) pts.push(undefined); \
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
  strokeWeight(pts_opts[0]['stroke']); \
  var colors = pts_opts[0]['color'].split(','); \
  stroke(colors[0],colors[1],colors[2]); \
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
    if (typeof(data) != 'undefined' && typeof(data[0]) != 'undefined') {
      gml = data[0].gml;
      var canvas = document.getElementById("canvas"), sketch = document.getElementById("sketch").text;
      //document.getElementById("loading").innerHTML = '';

      // console.log("load_gml()");
      // console.log(gml);
      var p = Processing(canvas, sketch, gml);
    }
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