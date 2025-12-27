import Mesh from "./Mesh.js";

export default class Entity {
    /**
     * Entity constructor
     * @param {*} url The URL of the object file
     * @param {*} gl The GL context
     */
    constructor(url, gl, x, y, z) {
        // Load in the mesh for the entity
        this.loadMesh(url, gl);

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

    // Helper method to load in a mesh from a URL
    async loadMesh(url, gl) {
        // Get the text for the object file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load shader: ${url}`);
        }
        const objString = await response.text();

        // Parse the data
        const data = this.parseOBJ(objString);

        // Return a new mesh with the vertices and indices
        this.mesh = new Mesh(gl, data.vertices, data.indices);
    }

    parseOBJ(objString) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const vertices = []; 
        const indices = [];
        const cache = {};

        const lines = objString.split('\n');

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            const parts = line.split(/\s+/);
            const type = parts[0];

            if (type === 'v') {
                positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'vn') {
                normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'vt') {
                uvs.push([parseFloat(parts[1]), 1.0 - parseFloat(parts[2])]);
            } else if (type === 'f') {
                const faceVertices = [];
                for (let i = 1; i < parts.length; i++) {
                    const specs = parts[i].split('/');
                
                    // specs[0]: v, specs[1]: vt, specs[2]: vn
                    const posIdxRaw = parseInt(specs[0]);
                    const uvIdxRaw = parseInt(specs[1]);
                    const normIdxRaw = parseInt(specs[2]);

                    const posIdx = posIdxRaw >= 0 ? posIdxRaw - 1 : positions.length + posIdxRaw;
                    const uvIdx = uvIdxRaw >= 0 ? uvIdxRaw - 1 : uvs.length + uvIdxRaw;
                    const normIdx = normIdxRaw >= 0 ? normIdxRaw - 1 : normals.length + normIdxRaw;

                    // The cache key now must include the normal index
                    const key = `${posIdx}/${uvIdx}/${normIdx}`;

                    if (!(key in cache)) {
                        const pos = positions[posIdx] || [0, 0, 0];
                        const norm = normals[normIdx] || [0, 1, 0]; // Default up if missing
                        const uv = uvs[uvIdx] || [0, 0];
                        const rgb = [1.0, 1.0, 1.0];

                        const newIndex = vertices.length / 11;
                        // Layout: x,y,z (3), r,g,b (3), nx,ny,nz (3), u,v (2) = 11 total
                        vertices.push(...pos, ...norm, ...rgb, ...uv);
                        cache[key] = newIndex;
                    }
                    faceVertices.push(cache[key]);
                }

                for (let i = 1; i < faceVertices.length - 1; i++) {
                    indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
                }
            }
        }
        return { vertices: new Float32Array(vertices), indices: new Uint32Array(indices) };
    }

    // Moves the entity
    move(x, y, z) {
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;

        this.updateWorldMatrix();
    }

    // Rotates the entity
    rotate(yaw, pitch, roll) {
        this.rotation[0] += yaw;
        this.rotation[1] += pitch;
        this.rotation[2] += roll;

        this.updateWorldMatrix();
    }

    // Adjusts the scale of the entity
    adjustScale(x, y, z) {
        this.scale[0] += x;
        this.scale[1] += y;
        this.scale[2] += z;

        this.updateWorldMatrix();
    }

    // Sets the scale of the entity
    setScale(x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;

        this.updateWorldMatrix();
    }

    // Updates the entity world matrix
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

    // Renders the entity on the input GL context and shader
    render(gl, shader) {
        // Wait until loaded
        if (!this.mesh) return;

        // Send this entity's unique matrix to the GPU
        gl.uniformMatrix4fv(shader.getUniformLocation('mWorld'), false, this.worldMatrix);
        // Set up attributes
        this.mesh.setupAttributes(shader);
        // Draw the mesh
        this.mesh.draw();
    }
}