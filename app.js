import Shader from "./classes/Shader.js";
import Camera from "./classes/Camera.js"
import Model from "./classes/Model.js"
import Material from "./classes/Material.js"

// Helper function to load text files
async function loadShaderText(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader: ${url}`);
    }
    return await response.text();
};

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

	const vsText = await loadShaderText('./shaders/default.vert');
    const fsText = await loadShaderText('./shaders/default.frag');

	// Create new Shader object
    const defaultShader = new Shader(gl, vsText, fsText);

	// Use default shader
    defaultShader.use();

	// Create the camera
	camera = new Camera(gl, Math.PI / 3, canvas.clientWidth / canvas.clientHeight);
	// Bind the shaders to the camera
	camera.bind(defaultShader);

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

	var millisUniformLocation = defaultShader.getUniformLocation('millis');
	var camPosUniformLocation = defaultShader.getUniformLocation('camPos');

	const models = [];
	
	const testModel = new Model('test_object', gl, 0, 2.8, 0);
	const idk = new Model('test_object', gl, 5, 5, 5);
	const bus = new Model('bus', gl, -8, 0, 0);
	const ak = new Model('ak', gl, 0, 0, 8);
	testModel.setScale(3, 3, 3);
	idk.setScale(0.2, 0.2, 0.2);
	bus.rotate(-1.5, 0.0, 0.0)
	bus.setScale(0.2, 0.2, 0.2);
	ak.setScale(0.05, 0.05, 0.05);
	ak.rotate(Math.PI/2, 0, 0);

	models.push(testModel);
	models.push(idk);
	models.push(bus);
	models.push(ak);

	Material.setupShaderSamplers(gl, defaultShader);

	// --- Main render loop ---
	var loop = function() {
		// - Handle inputs -
		updateInputs();

		// - Clear the buffers -
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// - Use the shader and bind the camera -
		defaultShader.use();
    	camera.bind(defaultShader);

		// - Pass uniforms -
		gl.uniform1f(millisUniformLocation, performance.now());
		gl.uniform3fv(camPosUniformLocation, camera.position);

    	// - Draw every object in the scene -
    	models.forEach(model => {
      		model.render(gl, defaultShader);
    	});

		requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
};

// Initialise the demo
InitDemo();