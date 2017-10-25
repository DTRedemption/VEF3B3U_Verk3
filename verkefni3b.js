// scene size
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

//camera attributes
var VIEW_ANGLE = 45;
var ASPECT = WIDTH / HEIGHT;
var NEAR = 0.1;
var FAR = 10000;

// attach to dom element
var container =
    document.querySelector('#container');

//renderer
var renderer = new THREE.WebGLRenderer();
//camera
var camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );
camera.position.z = 1000;

//vars for the dragging
var spheres = [];
var controls = false;

//scene
var scene = new THREE.Scene();

//add camera to scene
scene.add(camera);

//start renderer (use browser width and height)
renderer.setSize(WIDTH, HEIGHT);

// Attach the renderer-supplied
// DOM element.
container.appendChild(renderer.domElement);

// create a point light
var pointLight =
    new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

// set up sphere vars
var RADIUS = 50;
var SEGMENTS = 16;
var RINGS = 16;

// set up sphere mesh
for (var i = 0; i < 5; i++) {

    // create sphere mesh
    var sphereMaterial =
    new THREE.MeshLambertMaterial(
    {
        color: Math.random() * 0xffffff
    });

    var sphere = new THREE.Mesh(

        new THREE.SphereGeometry(
            RADIUS,
            SEGMENTS,
            RINGS),

        sphereMaterial);
    
    //make sphere visible
    sphere.position.x = Math.random() * 1000 - 500;
    sphere.position.y = Math.random() * 600 - 300;
    sphere.position.z = Math.random() * 800 - 400;

    sphere.castShadow = true;
    sphere.receiveShadow = true;
    //add sphere to scene
    scene.add(sphere);
    spheres.push(sphere);
}

// rotation
var SPEED = 0.01;

function rotateSphere() {
    for (i = 0; i < spheres.length; i++) {
        spheres[i].rotation.x -= SPEED * 2;
        spheres[i].rotation.y -= SPEED;
        spheres[i].rotation.z -= SPEED * 3;
    }
  
}

//interaction (dragging the sphere)
var dragControls = new THREE.DragControls(spheres, camera, renderer.domElement);
dragControls.addEventListener('dragstart', function (event) { controls.enabled = false; });
dragControls.addEventListener('dragend', function (event) { controls.enabled = true; });

var loader = new THREE.OBJLoader();

		// load a resource
		loader.load(
			// resource URL
			'three.js/examples/models/3ds/portalgun.3ds',
			// Function when resource is loaded
			function ( object ) {
				scene.add( object );
			}
		);



function update() {
    // draw the scene
    renderer.render(scene, camera);
    rotateSphere();

    // schedule frames
    requestAnimationFrame(update);
}

// schedule first frame
requestAnimationFrame(update);