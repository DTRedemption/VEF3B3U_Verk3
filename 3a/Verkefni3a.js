/* 5%	 Útskýrðu	stuttlega	eftirfarandi	hugtök	og	hvað	þau	gera:
1. WebGL
2. GPU
3. rasterizing
4. GLSL	
5. Vertex
6. Primative	
7. Fragment	
8. Pixel
9. Clip	space
10. View frustum
11. Z-buffering
12. Right-hand	coordinate	system	(RHS)

1. JS API that renders 3D graphics for compatible web browsers without any extra plugins. The initial release was in March 2011 with version 1.0 with version 2.0 being 
released this year (2017). It uses the GPU and web page canvas to allow for various effects and image processing.

2. The Graphical processing unit. The focus of the GPU is to rapidly speed up the creation of images that end up being output on a display device, for 3D graphics, WebGL depends on the GPU to 
execute its code.

3. When you take a vector based format and convert it into pixels (raster image). This serves many purposes for image manipulation but in the 3D context it is a popular way to create 3D Graphics.

4. OpenGL Shading Language. As the name implies, its purpose is to allow people to write shaders. It is cross platform and will work on any GPU that supports it.

5. A point where two or more curves(or lines or edges) meet. In WebGL we use this for the Vertex Shader to generate clipspace coordinates.

6. How WebGL draws its objects. It uses data arrays called buffers which define the positions of the vertices that are drawn. There are certain types such as triangle sets, triangle strips, points and lines
which can all be used to draw.

7. One of the two shaders required by WebGL to draw objects (the other one being the vertex shader). The Fragment shader provides color for the pixels being rasterized, it can get data from 3 sources:
Uniforms, Textures or Varyings.

8. many tiny dots that can be used to make up an image via geometric coordinates. We can measure the amount of pixels we have on a display via its resolution e.g 1920x1080 = 2,073,600 pixels.

9. One of the coordinate systems in the OpenGL pipeline, it comes after camera space and before screen space in the transformation process. In clip space, every coordinate's
x, y and z values are always within the given range, otherwise anything outside the range will not be drawn on screen.

10. The shape of vision that the camera in the rendered space has, when looking at 3d objects through the frustum, anything that cannot be normally seen from that perspective will get clipped.
Objects in the distance will also appear smaller and vice versa.

11. An algorithm for checking whether objects are visible or obscured (partially or full). The GPU will store each pixel value in an area of memory called the Z-buffer and determine
based on the lowest z coordinate value which object is infront of the other (the lowest z value is the one displayed in front)

12. OpenGL uses this system. The x and y axes point right and up and the negative z axis points forward which contrasts with the left hand system where the positive z axis points forward.

0.5% Afhverju	eru	3D	objectar	búnir	til	útfrá	samsettum	þríhyrningum	í	3D	grafík?

Because every object can be split into triangles but triangles cannot be split into anything else but more triangles, this makes it the ideal shape to draw objects.
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
1.5%	 Útskýrðu	ítarlega og	tæknilega	(en	án	kóða) með	eigin	orðum ásmt	skýringamyndum	hvernig	
rendering	pipeline	virkar	í	WebGL.

The app sets up the vertex shader and fragment shader and gives WebGL data that the shaders will need: vertex data (the triangles that will be drawn) and texture data for the fragment shader.
Once all is set up, rendering starts by running the vertex shader for each vertex, which gives us the coordinates of the triangles in the canvas. Then the triangles are rasterized which determines
the amount of pixels to draw. The fragment shader then runs for each pixel, determing the color to be used.

Last, framebuffer determines how the colors affect the final framebuffer's pixel color at the given location which includes effects such as depth testing.

Here's a basic diagram I made in paint: https://i.imgur.com/YsDCU95.png
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1.5% Transform	(translation, rotation	og	scale).	Komdu	með	sýnidæmi	með vector/vigri)	í	cartesian	
hnitakerfi	(x,y,z)	fyrir:
a)	translation	
b)	rotation	
c)	scale	

*/
// a)
var tx = 0.5, ty = 0.5, tz = 0.0;
var translation = gl.getUniformLocation(shaderProgram, 'translation');
gl.uniform4f(translation, tx, ty, tz, 0.0);

// b)

function rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8]; 
        
    m[0] = c*m[0]-s*m[1];
    m[4] = c*m[4]-s*m[5];
    m[8] = c*m[8]-s*m[9];
    m[1] = c*m[1]+s*mv0;
    m[5] = c*m[5]+s*mv4;
    m[9] = c*m[9]+s*mv8;
 }

// c)

var sx = 1.0, sy = 1.5, sz = 1.0;
var xformMatrix = new Float32Array([
   sx,   0.0,  0.0,  0.0,
   0.0,  sy,   0.0,  0.0,
   0.0,  0.0,  sz,   0.0,
   0.0,  0.0,  0.0,  1.0  
]);

var u_xformMatrix = gl.getUniformLocation(shaderProgram, 'u_xformMatrix');
gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
/* 
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
1.5% Fylki	(e.	matrix).	Sýndu	með sýnidæmi	hvernig	4x4	fylki	vigri/vector	er reiknaður	með:
a)	translation	matrix
b)	rotation	 matrix
c)	scale	matrix
*/

// a)
var x = 10;
var y = 20;
var z = 0;

var translationMatrix = [
    1,    0,    0,   0,
    0,    1,    0,   0,
    0,    0,    1,   0,
    x,    y,    z,   1
];

// b)
var w = 5; // width  (x)
var h = 1.5; // height (y)
var d = 1;   // depth  (z)

var scaleMatrix = [
    w,    0,    0,   0,
    0,    h,    0,   0,
    0,    0,    d,   0,
    0,    0,    0,   1
];

// c)


var sin = Math.sin;
var cos = Math.cos;

var a = Math.PI * 0.3; //rotation

// rotate around the z axis
var rotateZ = [
  cos(a), -sin(a),    0,    0,
  sin(a),  cos(a),    0,    0,
       0,       0,    1,    0,
       0,       0,    0,    1
];
