import ModelLoader from "./ModelLoader.js";

export default class ViewModel {
    /**
     * ViewModel constructor
     * @param {*} modelName The name of the model
     * @param {*} gl The GL context
     */
    constructor(modelName, gl, x, y, z, yaw, pitch, roll, x_scale, y_scale, z_scale) {
        // Set the GL context
        this.gl = gl;

        // Set loaded to false
        this.loaded = false;

        // The list of { mesh, material }
        this.renderables = [];
        
        // Load in the model resources
        this.loadIn(modelName, gl);

        // Initialise position
        this.position = glMatrix.vec3.fromValues(x, y, z);
        // Initialise rotation
        this.rotation = glMatrix.vec3.fromValues(yaw, pitch, roll);
        // Initialise scale (Default to 1, 1, 1)
        this.scale = glMatrix.vec3.fromValues(x_scale, y_scale, z_scale);

        // Initialise the identity matrix
        this.identityMatrix = glMatrix.mat4.create();
        
        // Initialise the world matrix
        this.worldMatrix = glMatrix.mat4.create();
    }

    // Loads in the model resources
    async loadIn(modelName, gl) {
        // ModelLoader returns an array of {mesh, material}
        this.renderables = await ModelLoader.loadModel(modelName, gl);

        // Set loaded to true
        this.loaded = true;

        // Print console message
        console.log(`${modelName} loaded in successfully.`);
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

    // Renders the model
    render(shader) {
        if (!this.loaded) return;

        // Get the uniform location for the world matrix
        const uWorldLocation = shader.getUniformLocation('mWorld');
        // Create a temporary buffer
        const finalMatrix = glMatrix.mat4.create();

        // For each renderable
        for (const item of this.renderables) {
            // finalMatrix = EntityWorldPosition * MeshModelSpacePosition
            glMatrix.mat4.multiply(finalMatrix, this.worldMatrix, item.modelSpaceMatrix);

            // Upload the final calculated matrix
            this.gl.uniformMatrix4fv(uWorldLocation, false, finalMatrix);

            // Apply the material of the renderable
            item.material.apply(this.gl, shader);
            // Set up the attributes of the mesh
            item.mesh.setupAttributes(shader);
            // Draw the mesh of the renderable
            item.mesh.draw();
        }
    }
}