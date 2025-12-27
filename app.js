import Shader from "./classes/Shader.js";
import Camera from "./classes/Camera.js"
import Entity from "./classes/Entity.js"

// Helper function to load text files
async function loadShaderText(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load shader: ${url}`);
    }
    return await response.text();
};

function loadTexture(gl, url) {
	// Create the texture
    const texture = gl.createTexture();
	// Bind the texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Placeholder: 1x1 blue pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

	// Create the image
    const image = new Image();

	// Set on image load
    image.onload = () => {
		// Bind the texture
        gl.bindTexture(gl.TEXTURE_2D, texture);
		// Get the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        
        // Generate mipmaps if the image is a power of 2 (e.g., 256x256)
        gl.generateMipmap(gl.TEXTURE_2D);
    };

	// Set the image source
    image.src = url;

	// Return the texture
    return texture;
}

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
	camera = new Camera(gl, Math.PI / 4, canvas.clientWidth / canvas.clientHeight);
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

	//var texture = loadTexture(gl, './textures/test.png')
	//gl.activeTexture(gl.TEXTURE0);
	//gl.bindTexture(gl.TEXTURE_2D, texture);

	//var textureUniformLocation = defaultShader.getUniformLocation('uTexture');
	//gl.uniform1i(textureUniformLocation, 0)

	const entities = [];
	
	const monkey = new Entity('./objects/suzanne.obj', gl, 0, 0, 0);
	entities.push(monkey);

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
    	entities.forEach(entity => {
      		entity.render(gl, defaultShader);
    	});

		requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
};

// Initialise the demo
InitDemo();