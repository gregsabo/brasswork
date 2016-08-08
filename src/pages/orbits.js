/* global window, document, console, requestAnimationFrame, setTimeout */

/*
  - A single ring, moving and rotating once.
*/

import THREE from 'three';
// import threeAdapter from 'popmotion-adapter-three';
import { keys, range } from 'lodash';
import Ease from '../easing';

var camera, scene, renderer;

var MOTION_DURATION = 4000;
var NUM_OVERLAPPING = 2;
var TAIL_LENGTH = 10;
var TAIL_DELAY = 300;

function init() {
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 200;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#000" );
  scene.add(light);

  forEachFlip(function(x, y) {
    range(TAIL_LENGTH).forEach(function(i) {
      var ring = makeRing();
      ring.guide = new Guide(100, i * TAIL_DELAY, x, y);
    });
  });

  addPointLights();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
}

function choose(inArray) {
  return inArray[Math.floor(Math.random() * inArray.length)];
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

var TARGET_HISTORY = [];
var CUMULATIVE = {x: 0, y: 0, z: 0};
class Guide {
  constructor(max, delay, flipX, flipY) {
    this.delay = delay;
    this.max = max;
    this.flipX = flipX;
    this.flipY = flipY;
    this.generateTargetAndUpdateCumulative();
  }

  generateTargetAndUpdateCumulative(generation) {
    if (TARGET_HISTORY[generation]) {
      return TARGET_HISTORY[generation];
    }

    var target = {};
    ['x', 'y', 'z'].forEach((dim) => {
      target[dim] = Math.random() * this.max - CUMULATIVE[dim];
      CUMULATIVE[dim] += target[dim];
      target['rotate' + dim.toUpperCase()] = (Math.random() * 6) - 3;
    })
    // target['rotate' + choose(['x', 'y', 'z']).toUpperCase()] = 0;

    TARGET_HISTORY[generation] = target;

    return target;
  }

  applyFlips(object) {
    if (this.flipX) {
      object.position.x *= -1;
      object.rotation.y *= -1;
    }

    if (this.flipY) {
      object.position.y *= -1;
      object.rotation.x *= -1;
    }

    return object;
  }

  interpolateTargets(time) {
    var combined = {};
    var overlapSize = MOTION_DURATION / NUM_OVERLAPPING;
    var currentGeneration = Math.floor(time / overlapSize);

    range(currentGeneration + 1).forEach((i) => {
      var target = this.generateTargetAndUpdateCumulative(i);
      var progressForThisTarget = (time - (i * overlapSize)) / MOTION_DURATION
      if (progressForThisTarget > 1) {
        progressForThisTarget = 1;
      }
      if (progressForThisTarget < 0) {
        return;
      }

      keys(target).forEach(function(key) {
        if (!combined[key]) {
          combined[key] = 0;
        }
        combined[key] += target[key] * Ease.linear(progressForThisTarget);
      })
    });

    return combined;
  }

  applyToObject(object, time) {
    var combined = this.interpolateTargets(time - this.delay);

    object.position.x = combined.x;
    object.position.y = combined.y;
    object.position.y = combined.z;
    object.rotation.x = combined.rotateX;
    object.rotation.y = combined.rotateY;
    object.rotation.z = combined.rotateZ;

    return this.applyFlips(object);
  }
}

function addPointLights() {
  var sun = new THREE.DirectionalLight( 0xffffff, 1);
  sun.position.set(100, 100, 200);
  scene.add(sun);

  sun = new THREE.DirectionalLight( 0xffffff, 1);
  sun.position.set(200, -100, -200);
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

function makeRing() {
  // var geometry = new THREE.BoxGeometry( 200, 200, 200 );
  var geometry = new THREE.TorusGeometry( 70, 1, 16, 100 );
  // var geometry = new THREE.OctahedronGeometry(50);

  var material = new THREE.MeshPhongMaterial({
    color: "#B6A636",
    shininess: 30,
    specular: "#FFF",
    emissive: "#000",
  });

  var mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);
  return mesh;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

var START_TIME = window.performance.now();
console.log('starting', START_TIME);
function animate() {
  var now = window.performance.now();
  scene.traverse(function(obj) {
    if (obj.guide) {
      obj.guide.applyToObject(obj, now - START_TIME);
    }
  })
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

export default function() {
  init();
  animate();
}