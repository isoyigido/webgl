import ModelLoader from "./ModelLoader.js";

export default class ViewModel {
    /**
     * ViewModel constructor
     * @param {*} objectName The name of the model
     * @param {*} gl The GL context
     */
    constructor(objectName, gl, x = 0, y = 0, z = 0, yaw = 0, pitch = 0, roll = 0) {
        // Set loaded to false
        this.loaded = false;

        // Load in the model
        this.loadIn(objectName, gl);

        // Initialise position
        this.position = glMatrix.vec3.fromValues(x, y, z);
        // Initialise rotation
        this.rotation = glMatrix.vec3.fromValues(yaw, pitch, roll);
        // Initialise scale (Default to 1, 1, 1)
        this.scale = glMatrix.vec3.fromValues(1, 1, 1);

        // Initialise the identity matrix
        this.identityMatrix = new Float32Array(16);
        glMatrix.mat4.identity(this.identityMatrix);
        
        // Initialise the world matrix
        this.worldMatrix = new Float32Array(16);
        glMatrix.mat4.identity(this.worldMatrix);
    }

    // Helper method to load in the model
    async loadIn(objectName, gl) {
        // Load in the resources
        const data = await ModelLoader.loadModel(objectName, gl);
        
        // Set the mesh
        this.mesh = data.mesh;
        // Set the texture
        this.material = data.material;

        // Set loaded to true
        this.loaded = true;
    }

    // Updates the model world matrix
    updateWorldMatrix(cameraWorldMatrix) {
        // 1. Move to relative position
        glMatrix.mat4.translate(this.worldMatrix, cameraWorldMatrix, this.position);

        // 2. Apply relative rotations
        glMatrix.mat4.rotateX(this.worldMatrix, this.worldMatrix, this.rotation[1]);
        glMatrix.mat4.rotateY(this.worldMatrix, this.worldMatrix, this.rotation[0]);
        glMatrix.mat4.rotateZ(this.worldMatrix, this.worldMatrix, this.rotation[2]);

        // 3. Apply scale
        glMatrix.mat4.scale(this.worldMatrix, this.worldMatrix, this.scale);
    }

    // Renders the model on the input GL context and shader
    render(gl, shader) {
        // Wait until loaded
        if (!this.loaded) return;

        // 1. Apply the material
        this.material.apply(gl, shader);

        // 2. Send this model's unique matrix to the GPU
        gl.uniformMatrix4fv(shader.getUniformLocation('mWorld'), false, this.worldMatrix);

        // 3. Set up attributes
        this.mesh.setupAttributes(shader);
        
        // 4. Draw the mesh
        this.mesh.draw();
    }
}