export default class Camera {
    /**
     * Camera constructor
     * @param {*} gl The GL context
     * @param {*} fov The FOV (Field of View)
     * @param {*} aspect The aspect ratio
     * @param {*} near The near clip distance
     * @param {*} far The far clip distance
     */
    constructor(gl, fov = Math.PI / 4, aspect = 1.33, near = 0.1, far = 1000.0) {
        // Set the constants
        this.moveSpeed = 0.05;
        this.rotationSpeed = 0.01;
        this.mouseSensitivity = 0.002;

        // Set the GL context
        this.gl = gl;

        // Set the FOV, near clip distance and far clip distance
        this.fov = fov;
        this.near = near;
        this.far = far;
        
        // Set initial position
        this.position = glMatrix.vec3.fromValues(0, 0, 0);
        // Set initial rotation
        this.rotation = glMatrix.vec3.fromValues(0, 0, 0); // [Yaw, Pitch, Roll]

        // Create the view and project matrices
        this.viewMatrix = glMatrix.mat4.create();
        this.projMatrix = glMatrix.mat4.create();
        
        // Set the projection matrix
        glMatrix.mat4.perspective(this.projMatrix, fov, aspect, near, far);
        // Update the view matrix
        this.updateViewMatrix();
    }

    // Sets the aspect ratio for the camera
    setAspectRatio(aspectRatio) {
        // Update the projection matrix
        glMatrix.mat4.perspective(this.projMatrix, this.fov, aspectRatio, this.near, this.far);
    }

    // Moves the camera in world space
    move(x, y, z) {
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;

        this.updateViewMatrix();
    }

    // Rotates the camera (angles in radians)
    rotate(yaw, pitch, roll) {
        this.rotation[0] += yaw;
        this.rotation[1] += pitch;
        this.rotation[2] += roll;

        this.updateViewMatrix();
    }

    // Updates the camera view matrix
    updateViewMatrix() {
        // Create a temporary matrix to represent the camera's location in the world
        let cameraWorldMatrix = glMatrix.mat4.create();

        // Position the camera in the world
        glMatrix.mat4.translate(cameraWorldMatrix, cameraWorldMatrix, this.position);

        // Apply rotations
        // Y (yaw) rotation is done first to avoid Gimbal-locking
        glMatrix.mat4.rotateY(cameraWorldMatrix, cameraWorldMatrix, this.rotation[0]);
        glMatrix.mat4.rotateX(cameraWorldMatrix, cameraWorldMatrix, this.rotation[1]);
        glMatrix.mat4.rotateZ(cameraWorldMatrix, cameraWorldMatrix, this.rotation[2]);

        // Invert the camera world matrix to get the view matrix
        glMatrix.mat4.invert(this.viewMatrix, cameraWorldMatrix);
    }

    // Helper to send both matrices to a shader at once
    bind(shader) {
        // Use the shader
        shader.use();

        // Send the view and projection matrices
        this.gl.uniformMatrix4fv(shader.getUniformLocation('mView'), false, this.viewMatrix);
        this.gl.uniformMatrix4fv(shader.getUniformLocation('mProj'), false, this.projMatrix);
    }

    // --- Movement Functions ---
    moveForward(dist) {
        // Forward vector on XZ plane: [-sin(yaw), -cos(yaw)]
        this.position[0] -= Math.sin(this.rotation[0]) * dist;
        this.position[2] -= Math.cos(this.rotation[0]) * dist;
        this.updateViewMatrix();
    }
    moveBackward(dist) {
        this.moveForward(-dist);
    }
    moveRight(dist) {
        // Right vector is perpendicular to forward: [cos(yaw), sin(yaw)]
        this.position[0] += Math.cos(this.rotation[0]) * dist;
        this.position[2] -= Math.sin(this.rotation[0]) * dist;
        this.updateViewMatrix();
    }
    moveLeft(dist) {
        this.moveRight(-dist);
    }
    moveUp(dist) {
        this.position[1] += dist;
        this.updateViewMatrix();
    }
    moveDown(dist) {
        this.position[1] -= dist;
        this.updateViewMatrix();
    }

    // --- Input Handling ---
    handleInputs(keys) {
        // Rotation (Arrows)
        if (keys['ArrowLeft'])  { this.rotation[0] += this.rotationSpeed; this.updateViewMatrix(); }
        if (keys['ArrowRight']) { this.rotation[0] -= this.rotationSpeed; this.updateViewMatrix(); }
        if (keys['ArrowUp'])    { this.rotation[1] += this.rotationSpeed; this.updateViewMatrix(); }
        if (keys['ArrowDown'])  { this.rotation[1] -= this.rotationSpeed; this.updateViewMatrix(); }

        // Prevent camera from flipping upside down (Pitch cap)
        const limit = Math.PI / 2 - 0.01;
        if (this.rotation[1] > limit) this.rotation[1] = limit;
        if (this.rotation[1] < -limit) this.rotation[1] = -limit;

        // Movement (WASD + Space/Shift)
        if (keys['KeyW'])      this.moveForward(this.moveSpeed);
        if (keys['KeyS'])      this.moveBackward(this.moveSpeed);
        if (keys['KeyA'])      this.moveLeft(this.moveSpeed);
        if (keys['KeyD'])      this.moveRight(this.moveSpeed);
        if (keys['Space'])     this.moveUp(this.moveSpeed);
        if (keys['ShiftLeft']) this.moveDown(this.moveSpeed);
    }
    handleMouseMove(e) {
        // e.movementX/Y provides the change in pixels since the last frame
        this.rotate(-e.movementX * this.mouseSensitivity, -e.movementY * this.mouseSensitivity, 0);
    }
}