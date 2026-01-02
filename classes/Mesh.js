export default class Mesh {
    /**
     * Mesh constructor
     * @param {*} gl The GL context
     * @param {*} attributes The attributes of the mesh
     * @param {*} indices The indices of the mesh
     */
    constructor(gl, attributes, indices) {
        this.gl = gl;

        // Get the index data
        const rawIndices = indices?.value || indices;
        
        // 1. Handle Indices
        // If the indices are valid
        if (Array.isArray(rawIndices) || ArrayBuffer.isView(rawIndices)) {
            // Set the index count
            this.indexCount = rawIndices.length;
            // Create the index buffer
            this.indexBuffer = gl.createBuffer();
            // Bind the buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            // Buffer the index data
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rawIndices), gl.STATIC_DRAW);
        } else {
            console.error("Indices is not an array! Value:", indices);
        }

        // 2. Handle Attributes
        // Initialise the attribute buffers
        this.attributeBuffers = {};
        // For each attribute
        for (const [name, data] of Object.entries(attributes)) {
            // Get the attribute data
            const bufferValue = data.value || data;
            
            // If the data is valid
            if (Array.isArray(bufferValue) || ArrayBuffer.isView(bufferValue)) {
                // Create the array buffer
                const buffer = gl.createBuffer();
                // Bind the array buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                // Buffer the attribute data
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferValue), gl.STATIC_DRAW);
                
                // Save the attribute buffer
                this.attributeBuffers[name] = {
                    buffer: buffer,
                    size: name === 'TEXCOORD_0' ? 2 : 3 // UVs are 2, others 3
                };
            }
        }
    }

    // Sets up the attributes for the mesh
    setupAttributes(shader) {
        // Get the GL context
        const gl = this.gl;
        // Define the mapping
        const mapping = { 'POSITION': 'aPos', 'NORMAL': 'aNormal', 'TEXCOORD_0': 'aTexCoord', 'TANGENT': 'aTangent' };

        // For each mapping
        for (const [gltfName, shaderName] of Object.entries(mapping)) {
            // Get the attribute location
            const loc = shader.getAttribLocation(shaderName);
            // Get the attribute data
            const data = this.attributeBuffers[gltfName];

            // If the location is valid and data is not null
            if (loc !== -1 && data) {
                // Bind the array buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, data.buffer);
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, data.size, gl.FLOAT, false, 0, 0);
            }
        }

        // Bind the index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    // Draws the mesh
    draw() {
        // Draw the primitives (triangles) of the mesh
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}