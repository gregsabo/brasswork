/* global THREE, createjs, window, document, console, requestAnimationFrame */

var Vector3 = THREE.Vector3;
var Tween = createjs.Tween;

var camera, scene, renderer;
var updateables = [];

createjs.Ticker.framerate = 60;

function init() {
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#000" );
  scene.add(light);

  var starting = makeStartingBlock();
  tweenLeader(starting);
  scene.add(starting);
  addPointLights();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
}

// function choose(inArray) {
//   return inArray[Math.floor(Math.random() * inArray.length)];
// }

function randomOrbitShape(size) {
  return new Vector3(
    (Math.random() * size * 2) - size,
    (Math.random() * size * 2) - size,
    (Math.random() * size * 2) - size
  );
}

function pojo(inVector) {
  return {
    x: inVector.x,
    y: inVector.y,
    z: inVector.z
  }
}

function tweenLeader(leader) {
  // var positionCursor = pojo(leader.position);
  var target = pojo(randomOrbitShape(200));
  Tween.get(leader.position).to(target, 2000).call(tweenLeader, [leader]);
}

function addPointLights() {
  var sun = new THREE.DirectionalLight( 0xffffff, 1);
  sun.position.set(100, 100, 200);
  scene.add(sun);
  var lights = [];
  lights[ 0 ] = new THREE.PointLight( 0xffffff, 0.1, 0 );
  lights[ 1 ] = new THREE.PointLight( 0xffffff, 0.1, 0 );
  lights[ 2 ] = new THREE.PointLight( 0xffffff, 0.1, 0 );

  lights[ 0 ].position.set( 0, 400, -400 );
  lights[ 1 ].position.set( 200, 400, 200 );
  lights[ 2 ].position.set( - 200, - 400, - 200 );

  scene.add( lights[ 0 ] );
  scene.add( lights[ 1 ] );
  scene.add( lights[ 2 ] );
}

function makeStartingBlock() {
  // var geometry = new THREE.BoxGeometry( 200, 200, 200 );
  var geometry = new THREE.TorusGeometry( 50, 2, 16, 100 );
  // var geometry = new THREE.OctahedronGeometry(50);

  var material = new THREE.MeshPhongMaterial({
    color: "#B6A636",
    shininess: 30,
    specular: "#FFF",
    emissive: "#000",
  });

  var mesh = new THREE.Mesh( geometry, material );
  return mesh;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  updateables.forEach(function(updateable) {
    updateable.update();
  });

  renderer.render( scene, camera );

  requestAnimationFrame( animate );
}

window.onload = function() {
  init();
  animate();
};
