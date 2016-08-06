/* global THREE, createjs, window, document, console, requestAnimationFrame, _ */

var Vector3 = THREE.Vector3;
var Tween = createjs.Tween;

var camera, scene, renderer;
var updateables = [];

createjs.Ticker.framerate = 60;

function init() {
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 200;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#000" );
  scene.add(light);

  var starting = makeStartingBlock();
  // function tweenObject(leader, motionNum, delay, flipX, flipY, flipZ) {
  tweenObject(starting, 0, 0);
  scene.add(starting);
  _.range(10).forEach(function(i) {
    forEachFlip(function(x, y, z) {
      var object = starting.clone();
      scene.add(object);
      tweenObject(object, 0, i * 2000, x, y, z);
    });
  });
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

var SHAPE_HISTORY = [];
function randomOrbitShape(size, seed) {
  if (!SHAPE_HISTORY[seed]) {
    SHAPE_HISTORY[seed] = new Vector3(
      (Math.random() * size * 2) - size,
      (Math.random() * size * 2) - size,
      (Math.random() * size * 2) - size
    );
  }
  return SHAPE_HISTORY[seed].clone();
}

function forEachFlip(inFunc) {
  [true, false].forEach(function(x) {
    [true, false].forEach(function(y) {
      [false].forEach(function(z) {
        inFunc(x, y, z);
      });
    });
  });
}

function pojo(inVector) {
  return {
    x: inVector.x,
    y: inVector.y,
    z: inVector.z
  }
}

function tweenObject(object, motionNum, delay, flipX, flipY, flipZ) {
  var targetPosition = randomOrbitShape(100, motionNum);

  var flipVector = new Vector3()
  flipVector.x = flipX ? 1 : -1;
  flipVector.y = flipY ? 1 : -1;
  flipVector.z = flipZ ? 1 : -1;

  targetPosition.multiplyVectors(targetPosition, flipVector);

  var tween = Tween.get(object.position);
  if (delay) {
    tween = tween.wait(delay);
  }
  tween.to(pojo(targetPosition), 10000)
    .call(tweenObject, [object, motionNum + 1, 0, flipX, flipY, flipZ]);
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
