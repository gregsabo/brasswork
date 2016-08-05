var camera, scene, renderer;
var hands = [];
var mesh;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#000" );
  scene.add(light);


  var starting = makeStartingBlock();
  hands.push(starting);
  scene.add(starting);
  for (var i = 0; i < 10; i++) {
    makeDerivedBlock(starting, i * 0.2, false, false, false);
    makeDerivedBlock(starting, i * 0.2, true, false, false);
    makeDerivedBlock(starting, i * 0.2, false, true, false);
    makeDerivedBlock(starting, i * 0.2, true, true, false);
  }
  addPointLights();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

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

  // var material = new THREE.MeshStandardMaterial({
  //   color: "#B6A636",
  //   metalness: 0.9,
  //   roughness: 0.5,
  // });

  var mesh = new THREE.Mesh( geometry, material );
  mesh.velocityX = (Math.random() - 0.5) * 0.2;
  mesh.velocityY = (Math.random() - 0.5) * 0.2;
  mesh.velocityZ = (Math.random() - 0.5) * 0.2;
  mesh.velocityRX = (Math.random() - 0.5) * 0.01;
  mesh.velocityRY = (Math.random() - 0.5) * 0.01;
  mesh.velocityRZ = (Math.random() - 0.5) * 0.01;
  return mesh;
}

function makeDerivedBlock(startingBlock, multiplier, flipX, flipY, flipZ) {
  var mesh = new THREE.Mesh(startingBlock.geometry, startingBlock.material);
  var keys = [
    'velocityX',
    'velocityY',
    'velocityZ',
    'velocityRX',
    'velocityRY',
    'velocityRZ',
  ];

  keys.forEach(function(key) {
    mesh[key] = startingBlock[key] * multiplier;
  });

  if (flipX) {
    mesh.velocityX = -1 * mesh.velocityX;
    mesh.velocityRX = -1 * mesh.velocityRX;
  }

  if (flipY) {
    mesh.velocityY = -1 * mesh.velocityY;
    mesh.velocityRY = -1 * mesh.velocityRY;
  }

  if (flipZ) {
    mesh.velocityZ = -1 * mesh.velocityZ;
    mesh.velocityRZ = -1 * mesh.velocityRZ;
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  hands.push(mesh);
  scene.add(mesh);
  return mesh;
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

var frameCount = 0;
function animate() {
  frameCount += 1;

  requestAnimationFrame( animate );

  for (var i = 0; i < hands.length; i++) {
    var hand = hands[i];
    hand.position.x += hand.velocityX;
    hand.position.y += hand.velocityY;
    hand.position.Z += hand.velocityZ;

    hand.rotation.x += hand.velocityRX;
    hand.rotation.y += hand.velocityRY;
    hand.rotation.z += hand.velocityRZ;
  }

  // camera.position.z = Math.sin(frameCount * 0.0005) * 400;
  // camera.position.x = Math.cos(frameCount * 0.0005) * 400;
  // camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer.render( scene, camera );
}