/*
position = sin(time) * shape
- create a ring which travels around a random circle forever

follower = make_follower(ring, delay)
- create a trail of rings which follow a "leader ring" at a delay

follower.delay = -1 * cos(time) * max_spread
- modulate the delay 
*/

var camera, scene, renderer;
var hands = [];
var mesh;
var leader;
var Vector3 = THREE.Vector3;

var frame_count = 0;
var TIME_MULTIPLIER = 0.01;
var FRAMES_PER_ORBIT = (2 * Math.PI) / TIME_MULTIPLIER;

function init() {

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#000" );
  scene.add(light);

  var starting = makeStartingBlock();
  starting.step = makeLeaderStep();
  scene.add(starting);
  scene.add(makeFollower(starting, 100));
  addPointLights();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
}

PERIOD_LENGTH = 30 * 30;

function choose(inArray) {
  return inArray[Math.floor(Math.random() * inArray.length)];
}

function isPauseFrame(inFrame, pauseLength) {
  var completeOrbitLength = FRAMES_PER_ORBIT + pauseLength;
  var positionInOrbit = inFrame % completeOrbitLength;
  if (positionInOrbit > FRAMES_PER_ORBIT) {
    return true;
  } else {
    return false;
  }

}

function frameWithPauses(inFrame, pauseLength) {
  var completeOrbitLength = FRAMES_PER_ORBIT + pauseLength;
  var numOrbits = Math.floor(inFrame / completeOrbitLength);
  return inFrame - (pauseLength * numOrbits);
}

function randomOrbitShape(size) {
  return new Vector3(
    (Math.random() * size * 2) - size,
    (Math.random() * size * 2) - size,
    (Math.random() * size * 2) - size
  );

}

function randomFlipAmounts() {
  var numFlipOptions = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];

  var flips = new Vector3(
    Math.PI / FRAMES_PER_ORBIT * choose(numFlipOptions),
    Math.PI / FRAMES_PER_ORBIT * choose(numFlipOptions),
    Math.PI / FRAMES_PER_ORBIT * choose(numFlipOptions)
  );
  flips[choose(['x', 'y', 'z'])] = 0;
  console.log(flips);
  return flips;
}

function makeLeaderStep() {
  // The leader is an invisible set of attributes
  // which will modulate with each frame
  var SIZE = 50;
  var orbitShape = randomOrbitShape(SIZE);
  var flipAmounts = randomFlipAmounts();


  return function(object, frame) {
    if (isPauseFrame(frame, 10 * 20)) {
      orbitShape = randomOrbitShape(SIZE);
      flipAmounts = randomFlipAmounts();
      return;
    }
    var virtualFrame = frameWithPauses(frame, 10 * 20);

    ['x', 'y', 'z'].forEach(function(dimension) {
      object.position[dimension] = (
        -1 * Math.cos(virtualFrame * TIME_MULTIPLIER) * orbitShape[dimension]
      ) + SIZE;

      object.rotation[dimension] += flipAmounts[dimension];
    });
  }
}

function makeFollower(leader, delay) {
  var follower = leader.clone();
  var history = [];

  follower.step = function(object, frame) {
    history.push({
      position: leader.position.clone(),
      rotation: leader.rotation.clone()
    });

    var historicalStep = history[history.length - delay];
    if (!historicalStep) {
      historicalStep = history[0];
    }

    if (historicalStep) {
      object.position.x = historicalStep.position.x;
      object.position.y = historicalStep.position.y;
      object.position.z = historicalStep.position.z;

      object.rotation.x = historicalStep.rotation.x;
      object.rotation.y = historicalStep.rotation.y;
      object.rotation.z = historicalStep.rotation.z;
    }
  }

  return follower;
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
  frame_count = frame_count + 1;

  requestAnimationFrame( animate );
  scene.traverse(function(object) {
    if (!object.step) {
      return;
    }

    object.step(object, frame_count);
  });

  renderer.render( scene, camera );
}

window.onload = function() {
  init();
  animate();
};
