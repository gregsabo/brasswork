var camera, scene, renderer;
var hands = [];
var mesh;

console.log("this is happening");
init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "#444" );
  scene.add(light);


  for (var i = 0; i < 10; i++) {
    var hand = makeHand();
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

function makeHand() {
  var geometry = new THREE.BoxGeometry( 200, 200, 200 );
  var material = new THREE.MeshStandardMaterial({
    color: "#B6A636",
    metalness: 1.0,
    roughness: 0.5,
    shading: THREE.flatShading,
  });

  var mesh = new THREE.Mesh( geometry, material );
  mesh.velocityX = (Math.random() - 0.5) * 0.001;
  mesh.velocityY = (Math.random() - 0.5) * 0.001;
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
    hand.rotation.x += hand.velocityX;
    hand.rotation.y += hand.velocityY;
  }


  renderer.render( scene, camera );

}