//
// GLSL code
//
var vertexShaderText = 
[
'precision highp float;',
'',
'attribute vec3 vertPosition;',         // input to vs 
'attribute vec3 vertColor;',            // input to vs
'attribute vec3 vertNormal;',           // input to vs
'uniform mat4 mWorld;',                 // input to vs
'uniform mat4 mView;',                  // input to vs
'uniform mat4 mProj;',                  // input to vs 
'uniform mat4 normalMatrix;',           // input to vs
'varying vec3 fColor;',                 // output of vs
'varying vec3 fNormal;',                // output of vs
'varying vec3 fPosition;',              // output of vs
'',
'void main()',
'{',
'	fColor = vertColor;',
'	fNormal = normalize(normalMatrix * vec4(vertNormal, 1.0)).xyz;',
'	vec4 pos = mView * mWorld * vec4(vertPosition, 1.0);',
'	fPosition = pos.xyz;',
'	gl_Position = mProj * pos;',
'}'
].join('\n')

var fragmentShaderText = 
[
'precision highp float;',
'',
'varying vec3 fColor;',                 // input to fs
'varying vec3 fPosition;',              // input to fs
'varying vec3 fNormal;',                // input to fs
'uniform float ca;',                    // input to fs
'uniform float cd;',                    // input to fs
'uniform float cs;',                    // input to fs
'uniform float sExp;',                  // input to fs
'const vec3 lightPos = vec3(5.0, 2.0, 5.0);',
'const vec3 lightCol = vec3(1.0, 1.0, 1.0);',
'',
'void main()',
'{',
'	vec3 l = normalize(lightPos);',
'	vec3 n = normalize(fNormal);',
'	vec3 e = normalize(-fPosition);',
'	vec3 h = normalize(e+l);',
'',
'	vec3 ambientCol  = ca * fColor;',
'	vec3 diffuseCol  = cd * fColor * dot(l,n);',
'	vec3 specularCol = cs * lightCol * pow(max(dot(h,n), 0.0), sExp);',
'	gl_FragColor = vec4(ambientCol+diffuseCol+specularCol, 1.0);',
'}'
].join('\n')


var InitDemo = function() {
	console.log('This is working');
	
	// get canvas element
	var canvas = document.getElementById('myCanvas');
	// get webGL context
	var gl = canvas.getContext('webgl');
	if (!gl){
		alert('WebGL not supported on this browser!')
	}
	
	var m4 = twgl.m4;
	
	// set the sliders
	var slider_amb = document.getElementById('slider1');
    slider1.value = 70;
    var slider_dif = document.getElementById('slider2');
    slider2.value = 70;
	var slider_scs = document.getElementById('slider3');
    slider3.value = 70;
    var slider_sexp = document.getElementById('slider4');
    slider4.value = 8;
	
	// **************************************
	// clean the screen and set Z-buffer test
	// **************************************
	
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.enable(gl.DEPTH_TEST); // z-buffer test !
	
	// ********************
	// create shader object
	// ********************
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	
	// *********************
	// compile the GLSL code
	// *********************
	gl.shaderSource(vertexShader, vertexShaderText); // set shader text
	gl.shaderSource(fragmentShader, fragmentShaderText); 
	
	gl.compileShader(vertexShader); // compile
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}
 
    // ****
    // link
	// ****
	
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	
	// ********
	// validate
	// ********
	
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
	
	// ******************************************************
	// create buffer
	// Vertices, Indices and Normals are in App_Light_data.js
	// ******************************************************
	
	// create Color array:
	var color_torus1 = [];
	for (var i=0; i<(torusVertices.length)/3; i=i+1){
		color_torus1 = color_torus1.concat([1.0, 0.0, 0.0]);
	}
	
	var color_torus2 = [];
	for (var i=0; i<(torusVertices.length)/3; i=i+1){
		color_torus2 = color_torus2.concat([0.0, 1.0, 0.0]);
	}
	
	var color_torus3 = [];
	for (var i=0; i<(torusVertices.length)/3; i=i+1){
		color_torus3 = color_torus3.concat([0.0, 0.0, 1.0]);
	}
	
	var color_icosphere = [];
	for (var i=0; i<(icosphereVertices.length)/3; i=i+1){
		
		color_icosphere = color_icosphere.concat([Math.random(), Math.random(), Math.random()]);
	}

	// ********************************************
	// create buffer objects, bind and feed in data
	// ********************************************
	
	// buffer for torus
	var torusVertexBufferObject = gl.createBuffer();  
	gl.bindBuffer(gl.ARRAY_BUFFER, torusVertexBufferObject);   
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(torusVertices), gl.STATIC_DRAW);
	
	var torusNormalsBufferObject = gl.createBuffer();  
	gl.bindBuffer(gl.ARRAY_BUFFER, torusNormalsBufferObject);   
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(torusNormals), gl.STATIC_DRAW);
	
	var torus1ColorBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, torus1ColorBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_torus1), gl.STATIC_DRAW);
	
	var torus2ColorBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, torus2ColorBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_torus2), gl.STATIC_DRAW);
	
	var torus3ColorBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, torus3ColorBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_torus3), gl.STATIC_DRAW);
	
	var torusIndexBufferObject = gl.createBuffer();  
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torusIndexBufferObject);    
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torusIndices), gl.STATIC_DRAW);
	
	// buffer for icosphere
	var icosphereVertexBufferObject = gl.createBuffer();  
	gl.bindBuffer(gl.ARRAY_BUFFER, icosphereVertexBufferObject);   
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(icosphereVertices), gl.STATIC_DRAW);
	
	var icosphereNormalsBufferObject = gl.createBuffer();  
	gl.bindBuffer(gl.ARRAY_BUFFER, icosphereNormalsBufferObject);   
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(icosphereNormals), gl.STATIC_DRAW);
	
	var icosphereIndexBufferObject = gl.createBuffer();  
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, icosphereIndexBufferObject);    
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(icosphereIndices), gl.STATIC_DRAW);
	
	var icosphereColorBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, icosphereColorBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color_icosphere), gl.STATIC_DRAW);
	
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
	var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal')
 	
	// *****************************************
	// enable these attributes(in vertex shader)
	// *****************************************
	
	gl.enableVertexAttribArray(positionAttribLocation);  
	gl.enableVertexAttribArray(colorAttribLocation);
	gl.enableVertexAttribArray(normalAttribLocation);
	
	// *******************************************
	// tell webGL which program should be active !
	// *******************************************
	gl.useProgram(program);
	
	// *********************************************************************
	// get location for uniform variables in vertex shader & fragment shader
	// *********************************************************************
	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');  // location of uniform variables in GPU
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
	var normMatUniformLocation = gl.getUniformLocation(program, 'normalMatrix');
	
	var caUniformLocation = gl.getUniformLocation(program, 'ca');
	var cdUniformLocation = gl.getUniformLocation(program, 'cd');
	var csUniformLocation = gl.getUniformLocation(program, 'cs');
	var sExpUniformLocation = gl.getUniformLocation(program, 'sExp');
	
	// initialize these transform matrices
	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	var normMatrix = new Float32Array(16);
	m4.identity(worldMatrix);
	m4.lookAt([0,0,-8], [0,0,0], [0,1,0], viewMatrix);
	m4.perspective(45*Math.PI/180, 1, 0.1, 100, projMatrix);
	m4.transpose(m4.inverse(m4.multiply(worldMatrix, viewMatrix)), normMatrix);
	
	// set the uniform variables for vertex shader
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	gl.uniformMatrix4fv(normMatUniformLocation, gl.FALSE, normMatrix);
	
	// ****************
	// main render loop
	// ****************
	var angle = 0;
	var loop = function(){
		// set parameters of light
		gl.uniform1f(caUniformLocation, slider_amb.value/100);
		gl.uniform1f(cdUniformLocation, slider_dif.value/100);
		gl.uniform1f(csUniformLocation, slider_scs.value/100);
		gl.uniform1f(sExpUniformLocation, slider_sexp.value);
		
		angle = angle + (2 * Math.PI)/200;
		
		var rtY = m4.rotationY(angle/4, m4.identity());
		var rtX = m4.rotationX(angle/3, m4.identity());
		var rtZ = m4.rotationZ(angle/2, m4.identity());
		
		// rotate around x-axis (for torus 1)
		var worldMatrix_t1 = m4.multiply(rtX, m4.identity());
		
		// rotate around y-axis (for torus 2)
		var worldMatrix_t2 = m4.multiply(rtY, m4.identity());
		
		// rotate around z-axis (for torus 3)
		var worldMatrix_t3 = m4.multiply(rtZ, m4.identity());
		
		// rotate around x-axis and y-axis (for icosphere)
		var worldMatrix_is = m4.multiply(m4.multiply(rtX, rtY), rtZ);
		
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT); 
		
		// draw torus 1
		// calculate the corresponding worldMatrix & normMatrix
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix_t1);
		m4.transpose(m4.inverse(m4.multiply(worldMatrix_t1, viewMatrix)), normMatrix); 
		gl.uniformMatrix4fv(normMatUniformLocation, gl.FALSE, normMatrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, torusVertexBufferObject); 
		gl.vertexAttribPointer(                 // tell GPU how to get the data from active buffer
			positionAttribLocation,             // attribute location  (get data for which attribute)
			3,                                  // number of elements per attribute
			gl.FLOAT,                           // type of elements
			gl.FALSE,                           // normalized
			3 * Float32Array.BYTES_PER_ELEMENT, // stride, size of an individual vertex
			0                                   // offset from the beginning
		); 
		gl.bindBuffer(gl.ARRAY_BUFFER, torus1ColorBufferObject);	
		gl.vertexAttribPointer(                  
			colorAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, torusNormalsBufferObject);	
		gl.vertexAttribPointer(                  
			normalAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torusIndexBufferObject);
		gl.drawElements(gl.TRIANGLES, torusIndices.length, gl.UNSIGNED_SHORT, 0);
		
		// draw torus 2
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix_t2);
		m4.transpose(m4.inverse(m4.multiply(worldMatrix_t2, viewMatrix)), normMatrix); 
		gl.uniformMatrix4fv(normMatUniformLocation, gl.FALSE, normMatrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, torusVertexBufferObject); 
		gl.vertexAttribPointer(                 // tell GPU how to get the data from active buffer
			positionAttribLocation,             // attribute location  (get data for which attribute)
			3,                                  // number of elements per attribute
			gl.FLOAT,                           // type of elements
			gl.FALSE,                           // normalized
			3 * Float32Array.BYTES_PER_ELEMENT, // stride, size of an individual vertex
			0                                   // offset from the beginning
		); 
		gl.bindBuffer(gl.ARRAY_BUFFER, torus2ColorBufferObject);	
		gl.vertexAttribPointer(                  
			colorAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, torusNormalsBufferObject);	
		gl.vertexAttribPointer(                  
			normalAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torusIndexBufferObject);
		gl.drawElements(gl.TRIANGLES, torusIndices.length, gl.UNSIGNED_SHORT, 0);
		
		// draw torus 3
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix_t3);
		m4.transpose(m4.inverse(m4.multiply(worldMatrix_t3, viewMatrix)), normMatrix); 
		gl.uniformMatrix4fv(normMatUniformLocation, gl.FALSE, normMatrix);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, torusVertexBufferObject); 
		gl.vertexAttribPointer(                 // tell GPU how to get the data from active buffer
			positionAttribLocation,             // attribute location  (get data for which attribute)
			3,                                  // number of elements per attribute
			gl.FLOAT,                           // type of elements
			gl.FALSE,                           // normalized
			3 * Float32Array.BYTES_PER_ELEMENT, // stride, size of an individual vertex
			0                                   // offset from the beginning
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, torus3ColorBufferObject);	
		gl.vertexAttribPointer(                  
			colorAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, torusNormalsBufferObject);	
		gl.vertexAttribPointer(                  
			normalAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torusIndexBufferObject);
		gl.drawElements(gl.TRIANGLES, torusIndices.length, gl.UNSIGNED_SHORT, 0);
		
		// draw icosphere
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix_is);
		m4.transpose(m4.inverse(m4.multiply(worldMatrix_is, viewMatrix)), normMatrix); 
		gl.uniformMatrix4fv(normMatUniformLocation, gl.FALSE, normMatrix);
		gl.bindBuffer(gl.ARRAY_BUFFER, icosphereVertexBufferObject); 
		gl.vertexAttribPointer(                 // tell GPU how to get the data from active buffer
			positionAttribLocation,             // attribute location  (get data for which attribute)
			3,                                  // number of elements per attribute
			gl.FLOAT,                           // type of elements
			gl.FALSE,                           // normalized
			3 * Float32Array.BYTES_PER_ELEMENT, // stride, size of an individual vertex
			0                                   // offset from the beginning
		); 
		gl.bindBuffer(gl.ARRAY_BUFFER, icosphereColorBufferObject);	
		gl.vertexAttribPointer(                  
			colorAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, icosphereNormalsBufferObject);	
		gl.vertexAttribPointer(                  
			normalAttribLocation,             
			3,                                  
			gl.FLOAT,                            
			gl.FALSE,                           
			0, 
			0                                    
		);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, icosphereIndexBufferObject);
		gl.drawElements(gl.TRIANGLES, icosphereIndices.length, gl.UNSIGNED_SHORT, 0);
		
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
};