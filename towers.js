var camera, scene, renderer;
var hands = [];
var mesh;

var woodTexture = THREE.ImageUtils.loadTexture('../walnut.jpg', {}, function() {
  init();
  animate();
})

function init() {

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#fff" );
  scene.add(light);


  var starting = makeStartingBlock();
  hands.push(starting);
  scene.add(hand);
  for (var i = 0; i < 10; i++) {
    var hand = makeDerivedBlock(starting, i * 0.1);
    hands.push(hand);
    scene.add( hand );
  }
  addPointLights();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

}

function addPointLights() {
  var lights = [];
  lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
  lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
  lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

  lights[ 0 ].position.set( 0, 400, -400 );
  lights[ 1 ].position.set( 200, 400, 200 );
  lights[ 2 ].position.set( - 200, - 400, - 200 );

  scene.add( lights[ 0 ] );
  scene.add( lights[ 1 ] );
  scene.add( lights[ 2 ] );
}

function makeStartingBlock() {
  // var geometry = new THREE.BoxGeometry( 200, 200, 200 );
  var geometry = new THREE.TorusGeometry( 180, 3, 16, 100 );

  if (Math.random() < 0.5) {
    var material = new THREE.MeshStandardMaterial({
      color: "#B6A636",
      metalness: 0.9,
      roughness: 0.5,
    });
  }

  var mesh = new THREE.Mesh( geometry, material );
  mesh.velocityX = (Math.random() - 0.5) * 0.01;
  mesh.velocityY = (Math.random() - 0.5) * 0.01;
  mesh.velocityZ = (Math.random() - 0.5) * 0.01;
  mesh.velocityRX = (Math.random() - 0.5) * 0.01;
  mesh.velocityRY = (Math.random() - 0.5) * 0.01;
  mesh.velocityRZ = (Math.random() - 0.5) * 0.01;
  return mesh;
}

function makeDerivedBlock(startingBlock, multiplier) {
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
  return mesh;
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

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


  renderer.render( scene, camera );
}