export default class Mesh {
    /**
     * Mesh constructor
     * @param {*} gl The GL context
     * @param {*} vertices The vertices of the mesh
     * @param {*} indices The corner indices of the triangles that make up the mesh
     */
    constructor(gl, vertices, indices) {
        // Set the GL context
        this.gl = gl;
        // Set the number of indices
        this.indexCount = indices.length;

        // Create and fill Vertex Buffer (VBO)
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Create and fill Index Buffer (IBO/EBO)
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    }

    // Set up the attributes
    setupAttributes(shader) {
        // Initialise constant GL context
        const gl = this.gl;
        // Get the location of the position attribute
        const posLoc = shader.getAttribLocation('aPos');
        // Get the location of the normal attribute
        const normalLoc = shader.getAttribLocation('aNormal');
        // Get the location of the color attribute
        const colorLoc = shader.getAttribLocation('aColor');
        // Get the location of the texture coordinate attribute
        const texCoordLoc = shader.getAttribLocation('aTexCoord');
        // Get the stride per primitive (triangle)
        const stride = 11 * Float32Array.BYTES_PER_ELEMENT;

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        
        // Get the vertex attribute pointers
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, gl.FALSE, stride, 0);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, gl.FALSE, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, gl.FALSE, stride, 6 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, gl.FALSE, stride, 9 * Float32Array.BYTES_PER_ELEMENT);

        // Enable the vertex attribute arrays
        gl.enableVertexAttribArray(posLoc);
        gl.enableVertexAttribArray(normalLoc);
        gl.enableVertexAttribArray(colorLoc);
        gl.enableVertexAttribArray(texCoordLoc);

        // Bind the index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    draw() {
        // Draw the primitives (triangles)
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}