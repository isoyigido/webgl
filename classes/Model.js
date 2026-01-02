import ModelLoader from "./ModelLoader.js";

export default class Model {
    /**
     * Model constructor
     * @param {*} modelName The name of the model
     * @param {*} gl The GL context
     * @param {*} x The x coordinate of the model
     * @param {*} y The y coordinate of the model
     * @param {*} z The z coordinate of the model
     */
    constructor(modelName, gl, x, y, z) {
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
        this.rotation = glMatrix.vec3.fromValues(0, 0, 0);
        // Initialise scale (Default to 1, 1, 1)
        this.scale = glMatrix.vec3.fromValues(1, 1, 1);

        // Initialise the identity matrix
        this.identityMatrix = glMatrix.mat4.create();
        
        // Initialise the world matrix
        this.worldMatrix = glMatrix.mat4.create();

        // Update the world matrix
        this.updateWorldMatrix();
    }

    // Loads in the model resources
    async loadIn(modelName, gl) {
        // ModelLoader returns an array of {mesh, material}
        this.renderables = await ModelLoader.loadModel(modelName, gl);

        // Set loaded to true
        this.loaded = true;
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

    // Sets the rotation of the model
    setRotation(yaw, pitch, roll) {
        this.rotation[0] = yaw;
        this.rotation[1] = pitch;
        this.rotation[2] = roll;

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
}