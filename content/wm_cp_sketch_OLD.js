void setup() {
	
	size(1000, 700)
	frameRate(60)

	pts = []
	strokes = (gml.tag.drawing.stroke instanceof Array ? gml.tag.drawing.stroke : [gml.tag.drawing.stroke])

	
	for(i in strokes){ 

		pts = pts.concat(strokes[i].pt);
		pts.push(undefined);
	}

	var app_name = gml.tag.header && gml.tag.header.client && gml.tag.header.client.name;
	if(app_name == 'Graffiti Analysis 2.0: DustTag' || app_name == 'DustTag: Graffiti Analysis 2.0' || app_name == 'Fat Tag - Katsu Edition'){
		rotation = 80;
		translation = [0, 800]; 
		console.log('GML is known iPhone app, scaling...');
	} else {
		rotation = 0;
		translation = [0, 0];
		console.log('Unknown appplication source: '+app_name);		
	}
	console.log('rotation='+rotation+' translation='+translation);
}
var wm_stroke_color = "255,0,255";
var wm_stroke_weight = 30;
void draw() {
	if(frameCount >= pts.length){ return; }
	i = frameCount % pts.length;
	prev = pts[i-1];
	pt = pts[i];

	if(i == 0) {
		var b_canvas = document.getElementById('canvas');
		b_canvas.width = b_canvas.width;
	}
	if(pt == undefined || pt == []){ return; }		
	if(prev == undefined || prev == []){ prev = pt; }

	dimx = (prev.x -pt.x)*width;
	dimy = (prev.y -pt.y)*height;

	translate(translation[0], translation[1]);
	rotate(rotation);

	strokeWeight(wm_stroke_weight);

	stroke(wm_stroke_color);		
	line(prev.x*width, prev.y*height, pt.x*width, pt.y*height);

}