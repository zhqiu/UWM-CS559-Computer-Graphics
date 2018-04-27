function main(){ "use strict"
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	
	drawStaticPart(context);
	drawDynamicPart(context);
	
	setInterval(function(){
        drawDynamicPart(context);
    }, 50)
}

function drawPlanet(context, color, r){
	context.beginPath();
	context.fillStyle = color;
	context.arc(0, 0, r, 0, 2*Math.PI);
	context.closePath();
	context.fill();
}

function drawStaticPart(context)
{
	context.save();
	context.translate(center_start_point, center_start_point);
	drawPlanet(context, "red", r_sun);
	context.restore();
}

function drawOrbits(context, r)
{
	context.beginPath();
	context.arc(0, 0, r, 0, 2*Math.PI);
	context.stroke();
}

function drawDynamicPart(context)
{
	//clear the board
	context.clearRect(0,0,area_edge_len,area_edge_len);
    drawStaticPart(context);              // draw sun
	
	// draw orbits
	context.save();
	context.translate(center_start_point, center_start_point);
	drawOrbits(context, dis_sun2earth);   
	drawOrbits(context, dis_sun2venus);
	drawOrbits(context, dis_sun2mercury);
	context.restore();
	
	// draw the border
	context.rect(0, 0, area_edge_len, area_edge_len);     
	context.stroke();
	
	context.save();
	context.translate(center_start_point, center_start_point);
	
	context.save();                        // draw Halley's comet
	context.rotate(1/4*Math.PI);
	context.translate(0, -300);
	context.save();                        // the coordinate system for Halley's comet
	var theta = time*2*Math.PI/180; 
	var a = 200;
	var b = 88;
	var c = Math.sqrt(a*a-b*b);
	var r = (b*b/a) / (1-(c/a)*Math.cos(theta));  // polar coordinate system of this ellipse
	context.rotate(theta);
	context.translate(0, r);
	drawPlanet(context, "black", 5)          // Halley's comet
	context.restore();
	context.restore();                      
	
	context.save();                        // save the coordinate system for sun
	context.rotate(time*7*Math.PI/180);    // set rotate degree of mecury
	context.translate(0, dis_sun2mercury); // the coordinate system for mecury
	drawPlanet(context, "grey", r_mercury) // draw mecury
	context.restore();
	
	context.save();                        // save the coordinate system for sun
	context.rotate(time*6*Math.PI/180);    // set rotate degree of mecury
	context.translate(0, dis_sun2venus);   // the coordinate system for mecury
	drawPlanet(context, "brown", r_venus)  // draw mecury
	context.restore();
	
	
	context.rotate(time*1*Math.PI/180);  // set rotate degree of earth
	context.translate(0, dis_sun2earth); // the coordinate system for earth
	
	context.save();
	
	// draw the orbit of moon
	context.beginPath();
	context.arc(0, 0, dis_moon2earth, 0, 2*Math.PI);
	context.stroke();
	
	context.rotate(time*8*Math.PI/180);   // set rotate degree of moon
	context.translate(0, dis_moon2earth); // the coordinate system for moon
	drawPlanet(context, "blue", r_moon)            // draw moon
	context.restore();
	
	drawPlanet(context, "green", r_earth);         // draw earth
	context.restore();
	time += 1;
}

var area_edge_len = 500;

var dis_sun2mercury = 60;
var dis_sun2venus = 105;
var dis_sun2earth = 150
var dis_moon2earth = 25;

var r_sun = 30;
var r_mercury = 10;
var r_venus = 15;
var r_earth = 15;
var r_moon = 5;

var center_start_point = area_edge_len/2;
var time = 0;

window.onload = main;