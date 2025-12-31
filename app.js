import Shader from "./classes/Shader.js";
import Camera from "./classes/Camera.js"
import Model from "./classes/Model.js"
import Material from "./classes/Material.js"
import SkyBox from "./classes/SkyBox.js"

var camera;
const keys = {};

async function updateInputs() {
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
        console.error('Browser does not support WebGL.')
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

	// Create the camera
	camera = new Camera(gl, Math.PI / 3, canvas.clientWidth / canvas.clientHeight);

	window.addEventListener('keydown', (e) => {
    	keys[e.code] = true;
	});

	window.addEventListener('keyup', (e) => {
    	keys[e.code] = false;
	});

	canvas.addEventListener('mousedown', () => {
    	canvas.requestPointerLock();
	});

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

	var millisUniformLocation = defaultShader.getUniformLocation('millis');
	var camPosUniformLocation = defaultShader.getUniformLocation('camPos');

	const models = [];
	
	const testModel = new Model('test_object', gl, 0, 0, -5);
	const idk = new Model('test_object', gl, 5, 5, 5);
	const bus = new Model('bus', gl, -8, 0, 0);
	const ak = new Model('ak', gl, 0, 0, 8);
	idk.setScale(0.2, 0.2, 0.2);
	bus.rotate(-1.5, 0.0, 0.0);
	bus.setScale(0.2, 0.2, 0.2);
	ak.setScale(0.05, 0.05, 0.05);
	ak.rotate(Math.PI/2, 0, 0);

	models.push(testModel);
	models.push(idk);
	models.push(bus);
	models.push(ak);

	// Set up shader samplers for the Material class
	Material.setupShaderSamplers(gl, defaultShader);
	// Set up shader samplers for the SkyBox class
	SkyBox.setupShaderSamplers(gl, skyboxShader);

	// --- Main render loop ---
	var loop = function() {
		// - Handle inputs -
		updateInputs();

		testModel.rotate(0.05, 0, 0);
		
		// - Clear the buffers -
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// - Use default shader and bind the camera -
		defaultShader.use();
		camera.bind(defaultShader);
		gl.depthFunc(gl.LESS);

		// - Pass uniforms -
		gl.uniform1f(millisUniformLocation, performance.now());
		gl.uniform3fv(camPosUniformLocation, camera.position);

    	// - Draw every object in the scene -
    	models.forEach(model => {
      		model.render(gl, defaultShader);
    	});

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
