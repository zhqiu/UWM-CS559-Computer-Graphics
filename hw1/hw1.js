// javascript file for hw1
function main(){
	var canvas = document.getElementById("myCanvas");
	var slider = document.getElementById("slider");
	var context = canvas.getContext("2d");
	
	// draw the border
	context.rect(0, 0, 400, 400);     
	context.stroke();
	
	// draw the static part -- tower
	drawStaticPart(context);
	// draw the moving part
	drawDynamicPart(context);
	
	canvas.addEventListener("input", drawDynamicPart);
	
	setInterval(function(){
        drawDynamicPart(context);
    }, 50);
}

function drawStaticPart(context){
	context.fillStyle = 'red';
	context.lineWidth = 40;
    context.beginPath();
    context.moveTo(200, 150);
    context.lineTo(150, 390);
    context.lineTo(250, 390);
    context.closePath();
	context.fill();
}

var time = 0;

function drawDynamicPart(context){
	//clear the board
	context.clearRect(0,0,400,400);
    drawStaticPart(context);
	// save this context
    context.save();
    context.translate(200,150);
	
	windSpeed = slider.value/25;
    context.rotate(time*8*windSpeed*Math.PI/180); // set rotate degree
	
	context.fillStyle = 'blue'
	context.fillRect(-5, -5, 10, 50);
	context.fillRect(-45, 45, 50, 100);
	context.fillRect(-5, -5, 50, 10);
	context.fillRect(45, -5, 100, 50);
	context.fillRect(-5, -45, 10, 50);
	context.fillRect(-5, -145, 50, 100);
	context.fillRect(-45, -5, 50, 10);
	context.fillRect(-145, -45, 100, 50);
	
	context.restore();
	time += 1;
}

window.onload = main