/**
 * Created by gleicher on 9/25/15.
 *
 * Note: this program is not meant to be looked at by 559 students - they should write it
 * themselves!
 *
 * So the quality of the code is lacking. Everything is simple.
 */

// stuff to do to make initial stuff
// here instead of in HTML
// yes, the writeln is yucky but easy

// these should really get used
var xsize = 400;
var ysize = 400;

// these are the sliders I want
var sliders = [ ["speed",0,5,2],             // the last is the default value !
    ["fov",10,90,60],["lookAtX",-10,10,0],["lookAtY",-10,10,0],["lookAtZ",-10,10,0],
	["lookFromX",-10,10,0], ["lookFromY",-10,10,5],["lookFromZ",-10,10,10],
	["perspective",0,1,1]
];
// make the sliders
sliders.forEach(function(s) {
	"use strict";
	document.write("<span style='display: inline-block; width: 80px;'>"+s[0]+"</span>")
	document.write("<input id=\""+s[0]+"\" type=\"range\" width=\"300\" " + "min=\"" + s[1] +"\" "  + "max=\"" + s[2] +"\" "  + "></input><br/>");
});

// have twgl handy
var m4 = twgl.m4;
var v3 = twgl.v3;

// to help with debugging
function say(str) { document.writeln(str); }
function br() { say("<br/>"); }
function writePoint(p) {
  say("["+p[0]+","+p[1]+","+p[2]+"] <br/>");
}

function toRadians(a) { "use strict"; return a/180*Math.PI; }

// the actual guts
function myApp() {
	"use strict";

	var mySliders = {};
	var myCanvas = document.getElementById("myCanvas");
	var context = myCanvas.getContext('2d');
    var painter = new Painter(myCanvas);                // VERY IMPORTANT !!!
    var cb = document.getElementById("cb");
    var ns = document.getElementById("ns");
    ns.checked=false;

    var cubeVerts = [ [0,0,0], [1,0,0], [1,1,0], [0,1,0], [0,0,1], [1,0,1], [1,1,1], [0,1,1] ];
    var cubeTris = [
                     [3,2,7], [2,6,7],  // top is   2,3,6,7   y=1
                     [0,1,2], [0,2,3],  // front is 0,1,2,3   z=0
                     [1,5,2], [5,2,6],  // side is  1,2,5,6   x=1
                     [4,5,6], [4,6,7],  // back is  4,5,6,7   z=1
                     [4,0,3], [4,3,7],  // side is  0,3,4,7   x=0
                     [0,1,4], [1,4,5]
                    ];

    function drawCube(viewProj,model, rbase,gbase,bbase, triemph) { // model    is local->world
	                                                                // viewProj is world->camera
        rbase = rbase || 180;
        bbase = bbase || 150;
        gbase = gbase || 220;
        triemph = triemph || 10;
		
        model = model || m4.identity();
        var dir = v3.normalize([1,3,2]);                       // direction of the light !!
        for (var i=0; i<cubeTris.length; i++ ) {

            var t=cubeTris[i];                                 // one face
            var p1 = m4.transformPoint(model,cubeVerts[t[0]]); // three points of this face
            var p2 = m4.transformPoint(model,cubeVerts[t[1]]);
            var p3 = m4.transformPoint(model,cubeVerts[t[2]]);

            // compute the normal
            var e1 = v3.subtract(p1,p2);
            var e2 = v3.subtract(p1,p3);
            var n = v3.normalize(v3.cross(e1,e2));             // normal vector of this face

            var p1 = m4.transformPoint(viewProj,p1);
            var p2 = m4.transformPoint(viewProj,p2);
            var p3 = m4.transformPoint(viewProj,p3);

            var r,g,b;

            r = rbase + (i%2) * triemph;
            g = gbase + (i%2) * triemph;
            b = bbase;

            var l = .5 + Math.abs(v3.dot(n,dir)); // dot product of light and norm of a face !!!
			
            r = r*l;                              // black is #000000
            g = g*l;
            b = b*l;

            var color = "rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";
            painter.triangle(p1,p2,p3, color);
        };

    }

    var theta = 0;
	
	function draw() {
		// hack to clear the canvas fast
		myCanvas.width = myCanvas.width;

		// set a reasonable viewport
		var viewport = m4.scaling([xsize/2,-ysize/2,1]);  // A vector of three entries specifying
                                                          // the factor by which to scale in each dimension.
		m4.setTranslation(viewport,[xsize/2,ysize/2,0],viewport);  // The matrix. The vector. the dst
		// writePoint(m4.transformPoint(viewport,[0,0,0]));
		// writePoint(m4.transformPoint(viewport,[.5,.5,0]));

		// get the projection
		var projM;
		if (mySliders.perspective.value > 0) {
			var fov = toRadians(mySliders.fov.value); 
			projM = m4.perspective(fov, 1, 0.1, 100);  // fieldOfViewYInRadians, aspect, zNear, zFar
		} else {
			projM = m4.scaling([.1,.1,1]);
		}
		// don't forget... lookat give the CAMERA matrix, not the view matrix
		var lookAtPt = [mySliders.lookAtX.value, mySliders.lookAtY.value, mySliders.lookAtZ.value];        // target
		var lookFromPt = [mySliders.lookFromX.value, mySliders.lookFromY.value, mySliders.lookFromZ.value];// eye
		var lookatI = m4.lookAt(lookFromPt, lookAtPt, [0,1,0]);                                            // up
		var lookatM = m4.inverse(lookatI);

		// the whole transform
        var viewii = m4.multiply(m4.identity(),lookatM);
		var viewi = m4.multiply(viewii,projM);
		var view = m4.multiply(viewi,viewport);


        painter.clear();

		// draw a groundplane - a 5x5 checkerboard
		var x,z;
		for(x=-2; x<2; x+=1) {
            for(z=-2; z<2; z+=1) {
                var corner1 = m4.transformPoint(view, [x, 0, z]);  // [x,0,z] is the coordinate in the world system(right hand)!
                var corner2 = m4.transformPoint(view, [x, 0, z+1]); // view change transform coordinate in world system into that in camera view
                var corner3 = m4.transformPoint(view, [x +1, 0, z + 1]);
                var corner4 = m4.transformPoint(view, [x +1, 0, z]);
                painter.triangle(corner1,corner2,corner3,((x+z)%2) ? "#888" : "#CCC");
                painter.triangle(corner1,corner3,corner4,((x+z)%2) ? "#999" : "#DDD");
            }
		}

        var ctr = m4.translation([-.5, -.5, -.5]);
        drawCube(view,                                                   m4.translation([.5,.5,.5]));
        drawCube(view, m4.multiply(m4.multiply(ctr,m4.rotationY(theta)), m4.translation([-1,1,1]) ));
        drawCube(view, m4.multiply(m4.multiply(ctr,m4.rotationX(theta)), m4.translation([-1,1,-1]) ));
        drawCube(view, m4.multiply(m4.multiply(ctr,m4.rotationZ(theta)), m4.translation([1,1,-1]) ));

        theta += +mySliders.speed.value / 50;

        if (cb.checked) {
            painter.wireframe();
        } else {
    		painter.render(ns.checked);
        }
    	window.requestAnimationFrame(draw);;

	}

	// set up the sliders before drawing
	sliders.forEach(function(s) {
		var sl = document.getElementById(s[0]);
		sl.value = s[3];
		mySliders[s[0]] = sl;
	});

	window.requestAnimationFrame(draw);; // this sentence will be executed recursivly
}
window.onload = myApp();