import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

//For the labels
const earthLabel = document.getElementById("earthLabel");
const sunLabel = document.getElementById("sunLabel");

const width = window.innerWidth;
const height = window.innerHeight;
const scene = new THREE.Scene();

//Creates Renderer
const renderer= new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.setPixelRatio(devicePixelRatio);

//Setup for the camera
const fov = 75;
const aspect = width / height;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 7.5; //Z axis must be changed for seeing further
document.body.appendChild(renderer.domElement);
//Makes the camera draggable
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false; //For dragging the object

//Planet Earth
const geoEarth = new THREE.IcosahedronGeometry(1, 12);
const matEarth = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load("images/earth.jpg")
});
const earth = new THREE.Mesh(geoEarth, matEarth);
earth.position.set(11, 0, 11);
scene.add(earth);

//Makes a sphere as the background
const geometryBG = new THREE.SphereGeometry(800, 20, 20); // Adjust size as needed
geometryBG.scale(-1, 1, 1); // Invert faces for inside viewing
const texture = new THREE.TextureLoader().load('images/stars.jpg');
const material = new THREE.MeshBasicMaterial({ 
	map: texture,
});
//Repeats the map texture
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(5,5);
const skybox = new THREE.Mesh(geometryBG, material);
scene.add(skybox);

scene.backgroundIntensity = 0.2;
var ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Lower intensity
scene.add(ambientLight);

// Sun Geometry & Material
const sunGeometry = new THREE.SphereGeometry(2, 64, 64);
// Option 1: Basic glowing material with emissive color
const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xFDB813, // Sun-like yellow
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0 ,0);
scene.add(sun);

// Realistic glowing texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load('images/sun_texture_nasa.jpg', (texture) => {
  sun.material.map = texture;
  sun.material.needsUpdate = true;
});

// Light Emission from the Sun
const sunLight = new THREE.PointLight(0x0fffff, 2, 300); // white light, strong intensity
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Add glow using sprite
const spriteMaterial = new THREE.SpriteMaterial({
  map: textureLoader.load('images/glow.png'),
  color: 0xFDB809,
  transparent: true,
  blending: THREE.AdditiveBlending,
});

const sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(10, 10, 1);
sun.add(sprite);

var switcher = true;

//Vector at the point the zoom in will happen
const target = new THREE.Vector3(0, 0, -0.3);
const zoomSpeed = 0.03;
let IsZoomingToEarth = false;
let IsZoomingToHouse = false;
const zoomTargetPosition = new THREE.Vector3(); // final camera position

var houseMesh;
const squareGeometry = new THREE.PlaneGeometry(6, 6);
const squareMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);

const objLoader = new OBJLoader();
function loadHouse(){
	objLoader.setPath('models/');
	objLoader.load('casita.obj', function(object){
		object.position.set(0, 0, 0); // Adjust based on your scene
		object.scale.set(0.05, 0.05, 0.05); // Optional scaling
		scene.add(object);
		houseMesh = object;
		squareMesh.position.set(0,0,0);
		squareMesh.rotateX(33);
		scene.add(squareMesh);
	})
}

// Compute the direction vector from camera to target
const direction = new THREE.Vector3().subVectors(target, camera.position).normalize();
const distance = 1.4; // how close you want to get

earthLabel.addEventListener('click', function(event){
	planetZoomTarget.copy(earth.position)
		.add(new THREE.Vector3(0, 0, 3)); // Move camera near Earth
	planetLookTarget.copy(earth.position);
	isZoomingToPlanet = true;
	switcher = false;
	earth.rotation.set(0.7, 3.4, 0);
	earthLabel.style.display = "none";
	sunLabel.style.display = "none";
	zoomTargetPosition.copy(target).addScaledVector(direction, -distance);

	IsZoomingToEarth = true; // trigger zoom in animate()
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let planetZoomTarget = new THREE.Vector3();
let planetLookTarget = new THREE.Vector3();

window.addEventListener('click', function(event){
	// Convert screen coordinates to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Raycast from the camera using the mouse position
    raycaster.setFromCamera(mouse, camera);
    // Intersect with clickable objects (in this case, just the Earth for now)
	const clickablePlanets = [earth, sun];
	const intersects = raycaster.intersectObjects(clickablePlanets, true);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        if (clicked === earth) {
			console.log("Earth clicked");
        }else if (clicked === sun){
			planetZoomTarget.copy(sun.position)
				.add(new THREE.Vector3(0, 0, 4.5)); // Move camera near Sun 
			planetLookTarget.copy(sun.position); 
			isZoomingToPlanet = true;
			console.log("Sun clicked");
		}
    }
}, false)

let houseTargetPosition = new THREE.Vector3(); // where to move the camera 
let houseLookAt = new THREE.Vector3(0, 0, 0); // where camera should look
let isZoomingToPlanet = false;

var pos=[
	new THREE.Vector3(0, 1.8, 0),
	new THREE.Vector3(10, 10, 1)
]

function animate(t = 0){
	requestAnimationFrame(animate);
	skybox.rotation.y += 0.0007;
	sun.rotation.y += 0.002
	if(switcher == true) earth.rotation.y += 0.003;
	renderer.render(scene, camera);
	updateLabels();
	
	if (isZoomingToPlanet) {
    	zoom();
	}


	if (IsZoomingToEarth) {
		zoomEarth();
	}
	

	//Zoom animation to the house
	if (IsZoomingToHouse) {
		camera.position.lerp(zoomTargetPosition, zoomSpeed);
		camera.lookAt(houseLookAt);

		if (camera.position.distanceTo(zoomTargetPosition) < 0.05) {
			camera.position.copy(zoomTargetPosition);
			camera.lookAt(houseLookAt);
			IsZoomingToHouse = false;
			if(houseMesh) houseMesh.visible = false;
			squareMesh.visible = false;

		}
		
	}
	
}
animate();


function zoomEarth(){
    // Lerp camera position toward zoomTargetPosition
		camera.position.lerp(zoomTargetPosition, zoomSpeed);

		// Always look at the target
		camera.lookAt(target);

		// Stop zooming when close enough
		if (camera.position.distanceTo(zoomTargetPosition) < 0.05) {
			camera.position.copy(zoomTargetPosition);
			IsZoomingToEarth = false;
			earth.visible = false;
			//Loads house and zooms in there
			loadHouse();
			camera.position.set(0,1,0);
			camera.lookAt(new THREE.Vector3(0, 0, 0));
			zoomTargetPosition.set(0, 0.22, 0); // adjust as needed for your scene
			IsZoomingToHouse = true;
		}
}

function zoom(){
    camera.position.lerp(planetZoomTarget, zoomSpeed);
    camera.lookAt(planetLookTarget);

    if (camera.position.distanceTo(planetZoomTarget) < 0.05) {
        camera.position.copy(planetLookTarget);
        camera.lookAt(planetLookTarget);
        isZoomingToPlanet = false;
    }
}

function updateLabels() {
	const widthHalf = window.innerWidth / 2;
	const heightHalf = window.innerHeight / 2;

	// Earth label
	const earthPos = earth.position.clone();
	earthPos.project(camera); // project 3D position into 2D
	earthLabel.style.left = (earthPos.x * widthHalf + widthHalf) + "px";
	earthLabel.style.top = -(earthPos.y * heightHalf) + heightHalf + "px";
	earthLabel.style.display = earth.visible ? 'block' : 'none';

	// Sun label
	const sunPos = sun.position.clone();
	sunPos.project(camera);
	sunLabel.style.left = (sunPos.x * widthHalf + widthHalf) + "px";
	sunLabel.style.top = -(sunPos.y * heightHalf) + heightHalf + "px";
	sunLabel.style.display = sun.visible ? 'block' : 'none';

	if (earthPos.z < 1) {
  		earthLabel.style.display = 'block';
	} else {
  		earthLabel.style.display = 'none';
	}	
}