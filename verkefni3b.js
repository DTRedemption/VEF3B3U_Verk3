
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);


var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


var cubegeometry = new THREE.CubeGeometry(1,1,1);
var cubematerial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});


var cube = new THREE.Mesh(cubegeometry, cubematerial);


scene.add(cube);


camera.position.z = 5;


var spheregeometry = new THREE.SphereGeometry(0.8, 16, 16);
var spherematerial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});
var sphere = new THREE.Mesh(spheregeometry, spherematerial);


sphere.position.set(-2.0, 0, 0);


scene.add(sphere);



var cylindergeometry = new THREE.CylinderGeometry(0.6, 0.6, 2, 50, false);


var cylindermaterial = new THREE.MeshLambertMaterial({wireframe: true, color: 0x000000});
var cylinder = new THREE.Mesh(cylindergeometry, cylindermaterial);


cylinder.position.set(2.0,0,0);
scene.add(cylinder);


var conegeometry = new THREE.CylinderGeometry(0, 0.6, 2, 50, false);
var conematerial = new THREE.MeshLambertMaterial({wireframe: true, color: 0x000000});
var cone = new THREE.Mesh(conegeometry, conematerial);
cone.position.set(4.0,0,0);
scene.add(cone);


var pyramidgeometry = new THREE.CylinderGeometry(0, 0.8, 2, 4, false);
var pyramidmaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});
var pyramid = new THREE.Mesh(pyramidgeometry, pyramidmaterial);
pyramid.position.set(-4.0,0,0);
scene.add(pyramid);

var render = function () {
    requestAnimationFrame(render);


    cube.rotation.y += 0.01;
    cube.rotation.x += 0.01;
    cube.rotation.z += 0.01;

    sphere.rotation.y += 0.01;

    cylinder.rotation.y += 0.01;
    cylinder.rotation.x += 0.01;
    cylinder.rotation.z += 0.01;

    cone.rotation.y += 0.01;
    cone.rotation.x += 0.01;

    pyramid.rotation.y += 0.01;
    //pyramid.rotation.x += 0.01;

    renderer.render(scene, camera);
};


render();