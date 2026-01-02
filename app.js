import Shader from "./classes/Shader.js";
import Camera from "./classes/Camera.js";
import Model from "./classes/Model.js";
import ViewModel from "./classes/ViewModel.js";
import Material from "./classes/Material.js";
import SkyBox from "./classes/SkyBox.js";

var camera;
const keys = {};

// Handles keyboard inputs
async function handleInputs() {
	camera.handleInputs(keys);
}

// Function to initialise the demo
var InitDemo = async function () {
    // Get the canvas from the HTML document
	var canvas = document.getElementById('webgl_canvas');
    // Get the WebGL context
	var gl = canvas.getContext('webgl');

    // If GL is not initialised
	if (!gl) {
        // Print warning in console
		console.warn('WebGL not supported, falling back on experimental-webgl.');
        // Use the experimental-webgl context
		gl = canvas.getContext('experimental-webgl');
	}

    // If GL is still not initialised (WebGL not supported)
	if (!gl) {
        // Print error in console
        console.error('Browser does not support WebGL.');
        // Alert the client
		alert('Your browser does not support WebGL.');
	}

	// Set background color
	gl.clearColor(0.8, 0.8, 0.8, 1.0);
    // Clear the buffers
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Enable depth test
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	// Create new Shader object
    const defaultShader = await Shader.create(gl, 'default.vert', 'default.frag');
	const skyboxShader = await Shader.create(gl, 'skybox.vert', 'skybox.frag');

	// Create the sky box
	const skyBox = await SkyBox.create(gl, 'clear_day.png');

	// Initialise the view model
	const pistol = new ViewModel(
		'pistol_view', gl,
		0, -0.3, 0,
		Math.PI, 0.1, 0,
		0.01, 0.01, 0.01
	);
	// Create the camera
	camera = new Camera(gl, Math.PI / 3, canvas.clientWidth / canvas.clientHeight, pistol);

	// Add an event listener for pressing keys
	window.addEventListener('keydown', (e) => {
    	keys[e.code] = true;
	});

	// Add an event listener for releasing keys
	window.addEventListener('keyup', (e) => {
    	keys[e.code] = false;
	});

	// Add an event listener for clicking
	canvas.addEventListener('mousedown', () => {
    	canvas.requestPointerLock();
	});

	// Add an event listener for mouse cursor movement
	window.addEventListener('mousemove', (e) => {
   		if (document.pointerLockElement === canvas) {
			camera.handleMouseMove(e);
    	}
	});

	// Define function to resize the canvas
	function resize() {
		// Lookup the size the browser is displaying the canvas in CSS pixels
		const displayWidth  = window.innerWidth;
		const displayHeight = window.innerHeight;

		// Check if the canvas is not the same size and update it
		if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
			canvas.width  = displayWidth;
			canvas.height = displayHeight;
			
			// Update the WebGL viewport to match the new dimensions
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			
			// Create a new camera for the new aspect ratio
			camera.setAspectRatio(canvas.clientWidth / canvas.clientHeight);
		}
	}

	// Add an event listener to resize the canvas
	window.addEventListener('resize', resize);
	// Initial resize
	resize();

	// Get the uniform location for the camera position (TEMPORARY)
	var camPosUniformLocation = defaultShader.getUniformLocation('camPos');

	// Initialise the array of models
	const models = [];
	
	const agent = new Model('sas_blue', gl, 4, 0, -8);
	const knight = new Model('bulky_knight', gl, -4, 0, -8);
	const cube = new Model('cube', gl, 0, 0, 0);
	knight.setScale(32, 32, 32);
	models.push(agent);
	models.push(knight);
	models.push(cube);

	// Set up shader samplers for the Material class
	Material.setupShaderSamplers(gl, defaultShader);
	// Set up shader samplers for the SkyBox class
	SkyBox.setupShaderSamplers(gl, skyboxShader);

	// --- Main render loop ---
	var loop = function() {
		// - Handle inputs -
		handleInputs();

		// - Clear the buffers -
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// - Use default shader and bind the camera -
		defaultShader.use();
		camera.bind(defaultShader);
		gl.depthFunc(gl.LESS);

		// - Pass uniforms -
		gl.uniform3fv(camPosUniformLocation, camera.position);

    	// - Draw every object in the scene -
    	models.forEach(model => {
      		model.render(gl, defaultShader);
    	});

		// - Render the camera view model *
		camera.renderViewModel(gl, defaultShader);

		// - Use the sky box shader and bind the camera -
		skyboxShader.use();
		camera.bind(skyboxShader);
		gl.depthFunc(gl.LEQUAL);

		// - Render the sky box -
		skyBox.render(skyboxShader);

		requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
};

// Initialise the demo
InitDemo();