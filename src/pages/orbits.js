/* global window, document, console, requestAnimationFrame, setTimeout */

/*
  - A single ring, moving and rotating once.
  - Multiple movements, dovetailed togeher.

  - launch timeout/interval for each guide (or chain callbacks)

  - Four rings, mirrored.
  - A trail of ten rings.
*/

import THREE from 'three';
import * as motion from 'popmotion';
// import threeAdapter from 'popmotion-adapter-three';
import { keys, range } from 'lodash';

var camera, scene, renderer;

var MOTION_DURATION = 4000;
var NUM_OVERLAPPING = 10;
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
      ring.guide = new Guide(100, i * TAIL_DELAY, x, y).startNewMotion();
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
var GENERATION_DELAY_LOOKUP = {};
class Guide {
  constructor(max, delay, flipX, flipY) {
    this.delay = delay;
    this.max = max;
    this.flipX = flipX;
    this.flipY = flipY;
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

  generateCursor() {
    return {
      x: 0,
      y: 0,
      z: 0,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0
    };
  }

  startNewMotion(generation) {
    if (!generation) {
      generation = 0;
    }

    if (GENERATION_DELAY_LOOKUP[String(generation) + '.' + String(this.delay)]) {
      // There's already a cursor for thie generation + delay.
      return this;
    }

    var target = this.generateTargetAndUpdateCumulative(generation);
    var cursor = this.generateCursor();

    motion.tween({
      element: cursor,
      delay: generation === 0 ? this.delay : 0,
      values: target,
      ease: motion.easing.quartInOut,
      duration: MOTION_DURATION,
    }).start();
    setTimeout(
      this.startNewMotion.bind(this, 0, generation + 1),
      MOTION_DURATION / NUM_OVERLAPPING
    )
    GENERATION_DELAY_LOOKUP[String(generation) + '.' + String(this.delay)] = true;

    return this;
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

  applyToObject(object) {
    var combined = {};
    CURSORS.forEach(function(cursor) {
      keys(cursor).forEach(function(key) {
        if (!combined[key]) {
          combined[key] = 0;
        }
        combined[key] += cursor[key]
      })
    });

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

function animate() {
  scene.traverse(function(obj) {
    if (obj.guide) {
      obj.guide.applyToObject(obj);
    }
  })
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

export default function() {
  init();
  animate();
}
