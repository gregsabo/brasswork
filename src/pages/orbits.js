/* global window, document, console, requestAnimationFrame, setTimeout */

/*
  - A single ring, moving and rotating once.
*/

import THREE from 'three';
// import threeAdapter from 'popmotion-adapter-three';
import { keys, range } from 'lodash';
import Ease from '../easing';

var camera, scene, renderer;

var Vector3 = THREE.Vector3;
var MOTION_DURATION = 600000;
var NUM_OVERLAPPING = 10;
var TAIL_LENGTH = 20;
var TAIL_SPACE = 0.005;
var TAIL_DELAY = MOTION_DURATION * TAIL_SPACE;
var ROTATION_AMOUNT = 20;
var STRETCH_SPEED = 0.0001;

function init() {
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 300;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#000" );
  scene.add(light);

  forEachFlip(function(x, y) {
    range(TAIL_LENGTH).forEach(function(i) {
      var ring = makeRing();
      ring.guide = new Guide(50, i * TAIL_DELAY, x, y);
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
    [true].forEach(function(y) {
      [false].forEach(function(z) {
        inFunc(x, y, z);
      });
    });
  });
}

function negRand() {
  return Math.random() * 2 - 1;
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

    // at 5, between -15 and 5
    // at -5, between -5 and 15
    // at 5, between -5 and 5

    var target = {};
    ['x', 'y', 'z'].forEach((dim) => {
      target[dim] = negRand() * this.max - CUMULATIVE[dim];
      CUMULATIVE[dim] += target[dim];
      var rotate = (Math.random() * ROTATION_AMOUNT) - (ROTATION_AMOUNT / 2);
      target['rotate' + dim.toUpperCase()] = rotate;
    })
    target['y'] = 0;
    target['x'] *= 1.5;
    // target['rotateZ'] = 0;
    // target['rotate' + choose(['x', 'y', 'z']).toUpperCase()] = 0;

    TARGET_HISTORY[generation] = target;
    console.log('target', target);

    return target;
  }

  applyFlips(object) {
    if (this.flipX) {
      object.position.x *= -1;
      object.rotation.y *= -1;
      object.rotation.y += Math.PI;
    }

    if (this.flipY) {
      object.position.y *= -1;
      object.rotation.x *= -1;
    }
    object.rotation.z += Math.PI / 2;

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
        combined[key] += target[key] * Ease.easeInOutQuint(progressForThisTarget);
      })
    });

    return combined;
  }

  applyToObject(object, time) {
    var delay = ((Math.sin(time * STRETCH_SPEED) / 2) + .5) * this.delay;
    var combined = this.interpolateTargets(time - delay);

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
  var geometry = new THREE.TorusGeometry( 100, 5, 3, 50 );
  // var geometry = new THREE.TorusGeometry( 70, 3, 3, 10 );
  // var geometry = new THREE.OctahedronGeometry(50);

  // var material = new THREE.MeshPhongMaterial({
  //   color: "#B6A636",
  //   shininess: 30,
  //   specular: "#FFF",
  //   emissive: "#000",
  // });

  var material = new THREE.MeshStandardMaterial({
    color: "#B6A636",
    metalness: 1.0,
    roughness: 0.5,
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
function animate() {
  var now = window.performance.now();
  now += 7500000;
  scene.traverse(function(obj) {
    if (obj.guide) {
      obj.guide.applyToObject(obj, now - START_TIME);
    }
  })
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  // camera.position.x = Math.sin(now * 0.0001) * 100;
  // camera.position.z = (Math.cos(now * 0.00013) * 50) + 500;
  camera.lookAt(new Vector3(0, 0, 0));
}

export default function() {
  init();
  animate();
}
