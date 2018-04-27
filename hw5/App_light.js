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
'varying vec3 fragColor;',              // output of vs
'varying vec3 fNormal;',                // output of vs
'varying vec3 fPosition;',              // output of vs
'',
'void main()',
'{',
'	fragColor = vertColor;',
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
'varying vec3 fragColor;',              // input to fs
'varying vec3 fPosition;',              // input to fs
'varying vec3 fNormal;',                // input to fs
'const float ca      = 0.7;',
'const float cd      = 0.7;',
'const float cs      = 0.7;',
'const float sExp    = 8.0;',
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
'	vec3 ambientCol  = ca * fragColor;',
'	vec3 diffuseCol  = cd * fragColor * dot(l,n);',
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
	var m4 = twgl.m4;
	
	if (!gl){
		alert('WebGL not supported on this browser!')
	}
	
	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.enable(gl.DEPTH_TEST); // z-buffer test !
	
	// create new shader objectS
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	
	//
	// compile the GLSL code
	//
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
 
    // link
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	
	// validate
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
	
	//
	// create buffer
	//
	// 8 colors of 8 vertices
	// [[0.5, 0.5, 0.5],[0.75, 0.25, 0.5],[1.0, 0.0, 0.15],[0.25, 0.25, 0.75]]
	// [[0.0, 1.0, 0.15],[0.5, 0.5, 1.0],[0.8,0.9,0.1],[0.5,0.9,0.2]]
	var boxVertices = 
	[ // x , y , z     R, G, B             normal
	  // top (y=1)
	  1.0, 1.0, 1.0,   0.5, 0.5, 0.5,      0.0, 1.0, 0.0,
	 -1.0, 1.0, 1.0,   0.75, 0.25, 0.5,    0.0, 1.0, 0.0,
	  1.0, 1.0, -1.0,  1.0, 0.0, 0.15,     0.0, 1.0, 0.0,
	 -1.0, 1.0, -1.0,  0.25, 0.25, 0.75,   0.0, 1.0, 0.0,
	   
	  // left (x=-1)
	 -1.0, 1.0, 1.0,   0.75, 0.25, 0.5,    -1.0, 0.0, 0.0,
	 -1.0, -1.0, 1.0,  0.0, 1.0, 0.15,     -1.0, 0.0, 0.0,
	 -1.0, 1.0, -1.0,  0.25, 0.25, 0.75,   -1.0, 0.0, 0.0,
	 -1.0, -1.0, -1.0, 0.5, 0.5, 1.0,      -1.0, 0.0, 0.0,
	  
	  // right (x=1)
	  1.0, 1.0, 1.0,   0.5, 0.5, 0.5,      1.0, 0.0, 0.0,
	  1.0, -1.0, 1.0,  0.8,0.9,0.1,        1.0, 0.0, 0.0,
	  1.0, 1.0, -1.0,  1.0, 0.0, 0.15,     1.0, 0.0, 0.0,
	  1.0, -1.0, -1.0, 0.5,0.9,0.2,        1.0, 0.0, 0.0,
	  
	  // front (z=1)
	  1.0, 1.0, 1.0,   0.5, 0.5, 0.5,      0.0, 0.0, 1.0,
	  -1.0, 1.0, 1.0,  0.75, 0.25, 0.5,    0.0, 0.0, 1.0,
	  1.0, -1.0, 1.0,  0.8,0.9,0.1,        0.0, 0.0, 1.0,
	  -1.0, -1.0, 1.0, 0.0, 1.0, 0.15,     0.0, 0.0, 1.0,
	  
	  // bottom (y=-1)
	  1.0, -1.0, 1.0,   0.8,0.9,0.1,       0.0, -1.0, 0.0,
	  -1.0, -1.0, 1.0,  0.0, 1.0, 0.15,    0.0, -1.0, 0.0,
	  1.0, -1.0, -1.0,  0.5,0.9,0.2,       0.0, -1.0, 0.0,
	  -1.0, -1.0, -1.0, 0.5, 0.5, 1.0,     0.0, -1.0, 0.0,
	  
	  // back (z=-1) 
	  1.0, 1.0, -1.0,    1.0, 0.0, 0.15,   0.0, 0.0, -1.0,
	  -1.0, 1.0, -1.0,   0.25, 0.25, 0.75, 0.0, 0.0, -1.0,
	  1.0, -1.0, -1.0,   0.5,0.9,0.2,      0.0, 0.0, -1.0,
	  -1.0, -1.0, -1.0,  0.5, 0.5, 1.0,    0.0, 0.0, -1.0,
	];
	
	var boxIndices = 
	[
		// top
		0, 1, 2,
		1, 2, 3,
		
		// left
		4, 5, 6,
		5, 6, 7,
		
		// right
		8, 9, 10,
		9, 10, 11,
		
		// front
		12, 13, 14,
		13, 14, 15,
		
		// bottom
		16, 17, 18,
		17, 18, 19,
		
		// back
		20, 21, 22,
		21, 22, 23,
	]
	
	var boxVertexBufferObject = gl.createBuffer(); // create a buffer in GPU
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);  // buffer type: for vertex attributes
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW) // initialize the buffer
	
	var boxIndexBufferObject = gl.createBuffer(); // create a buffer in GPU
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);    // buffer type: for vertex array indices
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW) // initialize the buffer
	
	//
	// pass data to attributes in vertex shader
	//
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition'); // location of attribute 'vertPosition' in GPU
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor'); // get the position of attribute 'vertColor' in GPU
	var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal'); // get the position of attribute 'vertNormal' in GPU
	gl.vertexAttribPointer(                 // tell GPU how to get the data from active buffer
		positionAttribLocation,             // attribute location  (get data for which attribute)
		3,                                  // number of elements per attribute
		gl.FLOAT,                           // type of elements
		gl.FALSE,                           // normalized
		9 * Float32Array.BYTES_PER_ELEMENT, // stride, size of an individual vertex
		0                                   // offset from the beginning
	);
	gl.vertexAttribPointer(                
		colorAttribLocation,          
		3,                                  
		gl.FLOAT,                           
		gl.FALSE,                           
		9 * Float32Array.BYTES_PER_ELEMENT,  
		3 * Float32Array.BYTES_PER_ELEMENT                                  
	);
	gl.vertexAttribPointer(                
		normalAttribLocation,          
		3,                                  
		gl.FLOAT,                           
		gl.FALSE,                           
		9 * Float32Array.BYTES_PER_ELEMENT,  
		6 * Float32Array.BYTES_PER_ELEMENT                                  
	);
	
	gl.enableVertexAttribArray(positionAttribLocation); // enable position attribute
	gl.enableVertexAttribArray(colorAttribLocation);    // enable color attribute
	gl.enableVertexAttribArray(normalAttribLocation);    // enable normal attribute
	
	// tell webGL which program should be active !
	gl.useProgram(program);
	
	//
	// pass data to fragment shader
	//
	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');  // location of uniform variables in GPU
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
	var normMatUniformLocation = gl.getUniformLocation(program, 'normalMatrix');
	
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
	
	//
	// main render loop
	//
	var angle = 0;
	var loop = function(){
		angle = angle + (2 * Math.PI)/300;
		// rotate around x-axis and y-axis
		var rtY = m4.rotationY(angle, m4.identity());
		var rtX = m4.rotationX(angle/3, m4.identity());
		worldMatrix = m4.multiply(rtX, rtY);
		m4.transpose(m4.inverse(m4.multiply(worldMatrix, viewMatrix)), normMatrix);
		
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		gl.uniformMatrix4fv(normMatUniformLocation, gl.FALSE, normMatrix);
		
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0); // it will use indices in ELEMENT_ARRAY_BUFFER to find vertices and render them
		
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
};