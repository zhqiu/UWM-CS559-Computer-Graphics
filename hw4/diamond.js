/*
	Author: Zihao Qiu
	CS559 - Computer Graphics
	Object: Diamond
*/

// size of the canvas
var xsize = 400;
var ysize = 400;

// access to twgl
var m4 = twgl.m4;
var v3 = twgl.v3;

// convert into redius
function toRad(a) {"use strict"; return a/180*Math.PI;}

// parameters of the diamond
var edges_top = 8;
var r_top = 30;
var ht_top = 100;
var ht_toppoint = 110;
var r_mid = 50;
var ht_mid = 80;

function say(str) { document.writeln(str); }

function fillInDiamondVertex(diamondVertex){
	"use strict"
	diamondVertex.push([0,0,0]);                                                               // bottom point, 0
	for(var phi=(360/edges_top)/2; phi<360; phi=phi+360/edges_top)
		diamondVertex.push([r_top*Math.cos(toRad(phi)), r_top*Math.sin(toRad(phi)), ht_top]);  // top face, 1-8
	for(var phi=0; phi<360; phi=phi+360/edges_top)
		diamondVertex.push([r_mid*Math.cos(toRad(phi)), r_mid*Math.sin(toRad(phi)), ht_mid]);  // middle face, 9-16
	diamondVertex.push([0,0,ht_toppoint]);                                                     // top point, 17
	return diamondVertex;
}

function setup(){
	"use strict"
	var myCanvas = document.getElementById("myCanvas");
	var context = myCanvas.getContext('2d');
	
	var cb_wf = document.getElementById("cb_wf");           // checkbox - wireframe
	var cb_pers = document.getElementById("cb_pers");       // checkbox - perspective
	var cb_ns = document.getElementById("cb_ns");           // checkbox - no sort
	var rg_fov = document.getElementById("rg_fov");         // range - field of view
	var rg_cp = document.getElementById("rg_cp");           // range - camera position
	var rg_lt_s1 = document.getElementById("rg_lt_s1");     // range - light position
	var rg_lt_s2 = document.getElementById("rg_lt_s2");     // range - light position
	var rg_rt = document.getElementById("rg_rt");           // range - rotate the diamond
	
	var diamondVertex = fillInDiamondVertex([]);  // store all vertexs of the diamond into diamondVertex
	
	var transformed_diamondTri = [];              // store the triangles that have been transformed
	
    var diamondTri = [
                      [2,1,17],[3,2,17],[4,3,17],[5,4,17],[6,5,17],[7,6,17],[8,7,17],[1,8,17],      // top face
					  [1,2,10],[2,3,11],[3,4,12],[4,5,13],[5,6,14],[6,7,15],[7,8,16],[8,1,9],       // middle faces(up)
					  [9,1,10],[10,2,11],[11,3,12],[12,4,13],[13,5,14],[14,6,15],[15,7,16],[16,8,9],// middle faces(down)
					  [0,9,10],[0,10,11],[0,11,12],[0,12,13],[0,13,14],[0,14,15],[0,15,16],[0,16,9],// bottom faces
                     ];
					 
	function render(transformed_diamondTri){
		// sort all triangles first, using zsum(sum of z of all three vertexs)	
		if (!cb_ns.checked){
			transformed_diamondTri.sort(function(a,b){
				var a_zsum = a[0][2] + a[1][2] + a[2][2];
				var b_zsum = b[0][2] + b[1][2] + b[2][2];
				return a_zsum<b_zsum?-1:1;
			});
		}
		
		// base color
		var rbase = 180;
        var gbase = 150;
        var bbase = 220;
		
		// direction of light
		var dir = v3.normalize([Math.cos(rg_lt_s1.value*Math.PI/100),
		                        Math.sin(rg_lt_s1.value*Math.PI/100),
								rg_lt_s2.value/100]);
		
		transformed_diamondTri.forEach(function(t){
			// draw filled triangles
			context.beginPath();
			
			var l = 1 + v3.dot(t[3],dir); // t[3] is the normal vector
			
			var r = rbase*l;
            var g = gbase*l;
            var b = bbase*l;
			
			context.fillStyle = "rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";
			context.strokeStyle = "red";
			context.moveTo(t[0][0], t[0][1]);
			context.lineTo(t[1][0], t[1][1]);
			context.lineTo(t[2][0], t[2][1]);
			context.closePath();
			context.fill();
			context.stroke();
		});
	}
					 
	function drawDiamond(viewProj,model){ // model is local->world; viewProj is world->camera
		model = model || m4.identity();
		
		diamondTri.forEach(function(t){
			var tri_p1 = diamondVertex[t[0]]; // three points of this face, in local space
			var tri_p2 = diamondVertex[t[1]];
			var tri_p3 = diamondVertex[t[2]];
		
			tri_p1 = m4.transformPoint(model,tri_p1);   // three points of this face, in world space
			tri_p2 = m4.transformPoint(model,tri_p2);
			tri_p3 = m4.transformPoint(model,tri_p3);
			
			// compute the normal vector of each triangle in world space
            var e1 = v3.subtract(tri_p1, tri_p3);
            var e2 = v3.subtract(tri_p2, tri_p3);
            var n = v3.normalize(v3.cross(e1,e2));
			
			tri_p1 = m4.transformPoint(viewProj,tri_p1); // three points of this face, in camera space
			tri_p2 = m4.transformPoint(viewProj,tri_p2);
			tri_p3 = m4.transformPoint(viewProj,tri_p3);
			
			transformed_diamondTri.push([tri_p1, tri_p2, tri_p3, n]);  // three points and a normal vector
		});
		                           
		if (cb_wf.checked){
			transformed_diamondTri.forEach(function(t){
				context.beginPath();                   // just draw the framework
				context.moveTo(t[0][0], t[0][1]);
				context.lineTo(t[1][0], t[1][1]);
				context.lineTo(t[2][0], t[2][1]);
				context.closePath();
				context.stroke();
			});
		}
		else{
			render(transformed_diamondTri);
		}
	}
					 
	var theta = 0; 
					 
	function draw() {
		// hack to clear the canvas fast
		myCanvas.width = myCanvas.width;

		// set a reasonable viewport
		var viewport = m4.scaling([xsize/2,-ysize/2,1]);  // A vector of three entries specifying
                                                          // the factor by which to scale in each dimension.
		m4.setTranslation(viewport,[xsize/2,ysize/2,0],viewport);  // The matrix. The vector. the dst

		// get the projection
		var projM;
		if (cb_pers.checked) {
			var fov = toRad(rg_fov.value);
			projM = m4.perspective(fov, 1, 0.1, 500);  // fieldOfViewYInRadians, aspect, zNear, zFar
		} else {
			projM = m4.scaling([.01,.01,1]);
		} 
		
		var camera_dis = rg_cp.value;
		
		var lookAtPt = [0,0,0];                                   // target
		var lookFromPt = [0, 200, camera_dis];  // eye                     
		var lookatI = m4.lookAt(lookFromPt, lookAtPt, [0,1,0]);   // up   
		var lookatM = m4.inverse(lookatI);
		
		// the whole transform
		var view = m4.multiply(m4.multiply(lookatM,projM),viewport);  // world->camera
		
		var T_model = m4.multiply(m4.rotationZ(theta),m4.rotationY(rg_rt.value*Math.PI/100));  // local->world
		T_model = m4.multiply(T_model, m4.translation([0,0,-50]))
		
		theta += Math.PI/180; 
		
		transformed_diamondTri = [];
		drawDiamond(view, T_model); 
		
    	window.requestAnimationFrame(draw);

	}
	
	cb_pers.checked = true;
	rg_cp.value = -100;
	rg_rt.value = 0;
	
	window.requestAnimationFrame(draw); // this sentence will be executed recursivly
}

window.onload = setup();