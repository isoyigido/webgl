import ModelLoader from "./ModelLoader.js";

export default class Model {
    /**
     * Model constructor
     * @param {*} objectName The name of the model
     * @param {*} gl The GL context
     * @param {*} x The x coordinate of the model
     * @param {*} y The y coordinate of the model
     * @param {*} z The z coordinate of the model
     */
    constructor(objectName, gl, x, y, z) {
        // Set loaded to false
        this.loaded = false;

        // Load in the model
        this.loadIn(objectName, gl);

        // Initialise position
        this.position = glMatrix.vec3.fromValues(x, y, z);
        // Initialise rotation
        this.rotation = glMatrix.vec3.fromValues(0, 0, 0);
        // Initialise scale (Default to 1, 1, 1)
        this.scale = glMatrix.vec3.fromValues(1, 1, 1);

        // Initialise the identity matrix
        this.identityMatrix = new Float32Array(16);
        glMatrix.mat4.identity(this.identityMatrix);
        
        // Initialise the world matrix
        this.worldMatrix = new Float32Array(16);
        glMatrix.mat4.identity(this.worldMatrix);

        // Update the world matrix
        this.updateWorldMatrix();
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

    // Sets the position of the model
    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;

        this.updateWorldMatrix();
    }

    // Moves the model
    move(x, y, z) {
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;

        this.updateWorldMatrix();
    }

    // Rotates the model
    rotate(yaw, pitch, roll) {
        this.rotation[0] += yaw;
        this.rotation[1] += pitch;
        this.rotation[2] += roll;

        this.updateWorldMatrix();
    }

    // Adjusts the scale of the model
    adjustScale(x, y, z) {
        this.scale[0] += x;
        this.scale[1] += y;
        this.scale[2] += z;

        this.updateWorldMatrix();
    }

    // Sets the scale of the model
    setScale(x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;

        this.updateWorldMatrix();
    }

    // Updates the model world matrix
    updateWorldMatrix() {
        // 1. Reset to identity/translation
        glMatrix.mat4.translate(this.worldMatrix, this.identityMatrix, this.position);

        // 2. Apply Rotations
        glMatrix.mat4.rotateX(this.worldMatrix, this.worldMatrix, this.rotation[1]);
        glMatrix.mat4.rotateY(this.worldMatrix, this.worldMatrix, this.rotation[0]);
        glMatrix.mat4.rotateZ(this.worldMatrix, this.worldMatrix, this.rotation[2]);

        // 3. Apply Scale
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