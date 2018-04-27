function setup() { "use strict";
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');
  var m4 = twgl.m4;
  
  var time = 0;
  
  var r_sun = 80;
  var r_earth = 40;
  var r_moon = 20;
  var dis_sun2earth = 200;
  var dis_earth2moon = 70;
  
  var zoom_factor = 1;
  
  var slider1 = document.getElementById('slider1');
  slider1.value = 0;
  var slider2 = document.getElementById('slider2');
  slider2.value = 0;
  var slider3 = document.getElementById('slider3');
  slider3.value = 0;
  var bt_zout = document.getElementById('button1');
  var bt_zin  = document.getElementById('button2');
                
  function moveToTx(x,y,z,Tx) {
    var loc = [x,y,z];
    var locTx = m4.transformPoint(Tx,loc);
    context.moveTo(locTx[0],locTx[1]);
  }

  function lineToTx(x,y,z,Tx) {
    var loc = [x,y,z];
    var locTx = m4.transformPoint(Tx,loc);
    context.lineTo(locTx[0],locTx[1]);
  }
  
  function drawOrbits(Tx, color, r){
	  context.beginPath();
	  context.strokeStyle = color;
	  
	  var xc = 0, yc = 150, zc = 0;
	  
	  var theta = 0;
	  moveToTx(xc+r*Math.sin(theta),yc,zc+r*Math.cos(theta),Tx);
	  for(theta=(1/32)*Math.PI;theta<2.001*Math.PI;theta=theta+(1/32)*Math.PI)
	    lineToTx(xc+r*Math.sin(theta),yc,zc+r*Math.cos(theta),Tx);
      context.stroke();
	  context.closePath();
  }

  function drawPlanet(Tx, color, r) {
      var xc = 0, yc = 150, zc = 0;
      var rx = r, ry = r, rz = r;
      var theta = 0, phi = 0;
	  var start_angle = 0;

	  context.beginPath();
	  context.strokeStyle = color;
	 
	  if (color == "green"){
		  phi = time * (1/16)*Math.PI;
		  start_angle = phi;
	  } else if (color == "red"){
		  phi = time * (1/128)*Math.PI;
		  start_angle = phi;
	  } else if (color == "blue"){
		  phi = time * (1/64)*Math.PI;
		  start_angle = phi;
	  }
	  
      for(; phi<start_angle+2.001*Math.PI; phi=phi+(1/8)*Math.PI){
          theta=0;
          moveToTx(xc+rx*Math.sin(theta)*Math.cos(phi),yc+ry*Math.cos(theta),zc+rz*Math.sin(theta)*Math.sin(phi),Tx);
          for(theta=(1/32)*Math.PI;theta<1.001*Math.PI;theta=theta+(1/32)*Math.PI)
              lineToTx(xc+rx*Math.sin(theta)*Math.cos(phi),yc+ry*Math.cos(theta),zc+rz*Math.sin(theta)*Math.sin(phi),Tx);
          context.stroke();
      }
      for(theta=(1/8)*Math.PI;theta<0.999*Math.PI;theta=theta+(1/8)*Math.PI){
          phi=0;
          moveToTx(xc+rx*Math.sin(theta)*Math.cos(phi),yc+ry*Math.cos(theta),zc+rz*Math.sin(theta)*Math.sin(phi),Tx);
          for(phi=(1/64)*Math.PI;phi<2.001*Math.PI;phi=phi+(1/64)*Math.PI)
              lineToTx(xc+rx*Math.sin(theta)*Math.cos(phi),yc+ry*Math.cos(theta),zc+rz*Math.sin(theta)*Math.sin(phi),Tx);
          context.stroke();
      }
	  context.closePath();
  }

  function draw() {
    // hack to clear the canvas fast
    canvas.width = canvas.width;
    
    var angle1 = slider1.value*0.01*Math.PI;
	var angle2 = slider2.value*0.01*Math.PI;
	var angle3 = slider3.value*0.01*Math.PI;
	
	var Tprojection=m4.ortho(-1*zoom_factor,1*zoom_factor,-1*zoom_factor,1*zoom_factor,-1,1);
  
    var Tworld_to_camera = m4.multiply(m4.scaling([1,-1,1]), // flip the y-axis
                           m4.multiply(m4.rotationY(angle1), // spin around the y-axis
						   m4.multiply(m4.rotationX(angle2), // spin around the x-axis
						   m4.multiply(m4.rotationZ(angle3), // spin around the z-axis
						   m4.multiply(Tprojection,          // projection
                           m4.translation([250,canvas.height-150,50])))))); // the orgin of world in camera's eyes
						   
    var T_sunmodel_to_world  = m4.identity();
	
	var alpha1 = (time/64)*Math.PI;   // earth to sun
	var alpha2 = (time/32)*Math.PI;   // moon to earth
	time = time + 1;
	
	var T_earthmodel_to_world = m4.translation([dis_sun2earth*Math.cos(alpha1),0,dis_sun2earth*Math.sin(alpha1)]);
	var T_moonmodel_to_earthmodel = m4.translation([dis_earth2moon*Math.cos(alpha2),0,dis_earth2moon*Math.sin(alpha2)]);
	
    var T_sunmodel_to_camera = m4.multiply(T_sunmodel_to_world, Tworld_to_camera);
	var T_earthmodel_to_camera = m4.multiply(T_earthmodel_to_world, Tworld_to_camera);
	var T_moonmodel_to_camera = m4.multiply(T_moonmodel_to_earthmodel, T_earthmodel_to_camera);
	
    drawPlanet(T_sunmodel_to_camera, "red", r_sun);
	drawOrbits(T_sunmodel_to_camera, "black", dis_sun2earth);
	drawPlanet(T_earthmodel_to_camera, "green", r_earth);
	drawOrbits(T_earthmodel_to_camera, "black", dis_earth2moon);
	drawPlanet(T_moonmodel_to_camera, "blue", r_moon);
  }
  
  slider1.addEventListener("input",draw);
  slider2.addEventListener("input",draw);
  slider3.addEventListener("input",draw);
  bt_zout.addEventListener("click",function(){
    zoom_factor *= 1.1; draw();
  });
  bt_zin.addEventListener("click",function(){
    zoom_factor /= 1.1; draw();
  });
  
  setInterval(function(){
        draw();
    }, 50)
}

window.onload = setup;