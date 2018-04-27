/**
 * Created by gleicher on 7/22/2015.
 */
//
// an implementation of a rendering back-end that is kind of like GL
// in that it takes screen space triangles
// it buffers the triangle so it can sort them to do painters algorithm ***
//
// it basically has 3 things:
//  clear()
//  addTriangle()
//  render
//
// X and Y are normal canvas coordinates (do the viewport trans
// before this thing)
// I am keeping things right-handed
// this means that positive Z is towards the viewer, so large Z goes last
//
//
"use strict";

/**
 * keep a set of triangles so we can draw them as a single buffer
 * this was put together so we can sort the triangles (for painter's algorithm)
 * it assumes that vertices are post-transformation
 * (they are points in screen space)
 * @param canvas - used to extract a context, and to provide size for Y flipping
 * @constructor
 */
function Painter(canvas, context) {
    this.triangles = [];
    this.canvas = canvas;
    this.context = context || canvas.getContext('2d');
	// if 'context' exists, then choose context, else choose canvas.getContext('2d')
}

/**
 * empties the set of triangles (this does not clear the canvas!)
 */
Painter.prototype.clear = function() {
    this.triangles = [];
};

// the triangle thing is tricky, since we don't know how many parameters
// we assume that we pass points as some kind of array-like thingy
// we don't assume that the colors are passed - but we'll always assign
/**
 * adds a triangle to the list - pass each vertex
 * @param v1 - vertex in screen coords with Y flipped
 * @param v2
 * @param v3
 * @param fill - a color string, or null gives blue
 * @param stroke - a color string, or null/undefined gives no stroke
 */
Painter.prototype.triangle = function(v1, v2, v3, fill, stroke){
    this.triangles.push(
        {
            "v1" : v1,
            "v2" : v2,
            "v3" : v3,
            "fill" : fill || "blue",
            "stroke" : stroke,
            "zmax" : Math.max(v1[2],v2[2],v3[2]),
            "zsum" : v1[2] + v2[2] +v3[2]
        }
    )
};

// drawing the triangle list
/**
 * draws the triangles to the context as wireframe
 */
Painter.prototype.wireframe = function()
{
    var that=this;
    this.triangles.forEach(function(t){
        that.context.strokeStyle = t.stroke || t.fill;
        that.context.beginPath();
        that.context.moveTo(t.v1[0], t.v1[1]);
        that.context.lineTo(t.v2[0], t.v2[1]);
        that.context.lineTo(t.v3[0], t.v3[1]);
        that.context.closePath();
        that.context.stroke();
    });
};

/**
 * draws the triangles into the context
 * @param {boolean} nosort - True if you don't want the Painter's Algorithm
 */
Painter.prototype.render = function(nosort)
{
    var that = this;
     if (!nosort) {
        this.triangles.sort(function (a, b) {  // sort the array !!
            if (a.zsum > b.zsum) {
                return -1;
            } else {
                return 1;
            }
        });
    } else {
        // console.log("Not Sorting");
    }
    this.triangles.forEach(function (t) {     // draw the triangles in the array in order
        that.context.beginPath();
        that.context.fillStyle = t.fill;
        // it is an error to set this to undefined - even though it works
        that.context.strokeStyle = t.stroke || "black";
        that.context.moveTo(t.v1[0], t.v1[1]);
        that.context.lineTo(t.v2[0], t.v2[1]);
        that.context.lineTo(t.v3[0], t.v3[1]);
        that.context.closePath();
        that.context.fill();
        if (t.stroke) {
            that.context.stroke()
        }
    });
};

/** send an indexed triangle set as a bunch of triangles
 * makes use of the matrix stack
 * @param painter
 * @param mstack
 * @param verts
 * @param tris
 * @param fills
 * @param strokes
 */
Painter.prototype.addTris = function(mstack, verts, tris, fills, strokes) {
    // we can't use a foreach because we need to index into 3 arrays
    for (var i=0; i<tris.length; i++ ) {
        var t=tris[i];
        var p1 = mstack.transform(verts[t[0]]);
        var p2 = mstack.transform(verts[t[1]]);
        var p3 = mstack.transform(verts[t[2]]);
        this.triangle(p1,p2,p3,fills && fills[i],strokes&&strokes[i]);
    };
};


/**
 * static variables for drawing a cube - done this way since I don't know how to
 * do statics in JavaScript
 * These actually could even be constants (but they are array constants
 * @type {*[]}
 */
Painter.prototype.cubeVerts = [ [0,0,0], [1,0,0], [1,1,0], [0,1,0], [0,0,1], [1,0,1], [1,1,1], [0,1,1] ]; // 8 vertexs !
Painter.prototype.cubeTris = [                                                   // 12 faces, each contains 2 triangles！
                     [0,1,2], [0,2,3],  // front is 0,1,2,3   z=0                // each index represents a vertex
                     [1,5,2], [5,2,6],  // side is  1,2,5,6   x=1
                     [4,5,6], [4,6,7],  // back is  4,5,6,7   z=1
                     [4,0,3], [4,3,7],  // side is  0,3,4,7   x=0
                     [3,2,7], [2,6,7],  // top is   2,3,6,7   y=1
                     [0,1,4], [1,4,5]
                    ];

Painter.prototype.cube = function(mstack, colors, strokes)
{
    this.addTris(mstack,this.cubeVerts,this.cubeTris,colors,strokes)
}

Painter.prototype.addFloor = function(matrixStack,color1,color2)
{
    var that = this;
    var color;
    for(var x=-3; x<3; x++) {
        for (var z=-3; z<3; z++) {
            var p1 = matrixStack.transform([x,0,z]);
            var p2 = matrixStack.transform([x+1,0,z]);
            var p3 = matrixStack.transform([x+1,0,z+1]);
            var p4 = matrixStack.transform([x,0,z+1]);
            if ( (x+z)%2 ) {
                color = color1 || "#EEE";
            } else {
                color = color2 || "#CCC";
            }
            that.triangle(p1,p2,p3,color);
            that.triangle(p1,p3,p4,color);
        }
    }
}