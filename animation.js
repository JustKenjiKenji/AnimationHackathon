import * as THREE from "three";

const zoomIn = document.getElementById("closeup");

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();

const renderer= new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.setPixelRatio(devicePixelRatio);

//Setup for the camera
const fov = 75;
const aspect = width / height;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 4; //Z axis must be changed for seeing further
document.body.appendChild(renderer.domElement);

//Planet Earth
const geo = new THREE.IcosahedronGeometry(1, 12);
const mat = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load("earth.jpg")
})
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

var switcher = true;

zoomIn.addEventListener('click', function(){
	switcher = false;
	//Rotates mesh to Canada
	mesh.rotation.y = 3.4;
	mesh.rotation.x = 0.7;
	camera.position.set(0, 0, 1.1); //Must stop at 1.1
});

function animate(t = 0){
	requestAnimationFrame(animate);
	if(switcher == true) mesh.rotation.y += 0.002;
	renderer.render(scene, camera);
	//mesh.scale.setScalar(Math.cos(t * 0.001) + 1.0);
}
animate();


