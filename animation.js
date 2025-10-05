import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
camera.position.z = 3.5; //Z axis must be changed for seeing further
document.body.appendChild(renderer.domElement);



//const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = false; //For dragging the object

//Planet Earth
const geo = new THREE.IcosahedronGeometry(1, 12);
const mat = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load("earth.jpg")
})
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

var switcher = true;

//Vector at the point the zoom in will happen
const target = new THREE.Vector3(0, 0, -0.4);
const zoomSpeed = 0.01;
let isZooming = false;
const zoomTargetPosition = new THREE.Vector3(); // final camera position

zoomIn.addEventListener('click', function(){
	switcher = false;
	mesh.rotation.set(0.7, 3.3, 0);
	// Compute the direction vector from camera to target
	const direction = new THREE.Vector3().subVectors(target, camera.position).normalize();

	const distance = 1.5; // how close you want to get
	zoomTargetPosition.copy(target).addScaledVector(direction, -distance);

	isZooming = true; // trigger zoom in animate()
});

function animate(t = 0){
	requestAnimationFrame(animate);
	if(switcher == true) mesh.rotation.y += 0.003;
	renderer.render(scene, camera);
	//mesh.scale.setScalar(Math.cos(t * 0.001) + 1.0);

	if (isZooming) {
		// Lerp camera position toward zoomTargetPosition
		camera.position.lerp(zoomTargetPosition, zoomSpeed);

		// Always look at the target
		camera.lookAt(target);

		// Stop zooming when close enough
		if (camera.position.distanceTo(zoomTargetPosition) < 0.01) {
			camera.position.copy(zoomTargetPosition);
			isZooming = false;
		}
	}

}



animate();


