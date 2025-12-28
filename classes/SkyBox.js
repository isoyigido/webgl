export default class SkyBox {
    constructor(gl, texture) {
        this.gl = gl;
        this.cubeMap = texture;

        // A simple unit cube centered at (0,0,0)
        const vertices = [
            -1,  1, -1,   -1, -1, -1,    1, -1, -1,    1,  1, -1, // Back
            -1, -1,  1,   -1,  1,  1,    1,  1,  1,    1, -1,  1, // Front
            -1,  1,  1,   -1,  1, -1,    1,  1, -1,    1,  1,  1, // Top
            -1, -1, -1,   -1, -1,  1,    1, -1,  1,    1, -1, -1, // Bottom
            -1,  1,  1,   -1, -1,  1,   -1, -1, -1,   -1,  1, -1, // Left
             1,  1, -1,    1, -1, -1,    1, -1,  1,    1,  1,  1  // Right
        ];

        const indices = [
            0,  1,  2,  2,  3,  0,  4,  5,  6,  6,  7,  4,
            8,  9,  10, 10, 11, 8,  12, 13, 14, 14, 15, 12,
            16, 17, 18, 18, 19, 16, 20, 21, 22, 22, 23, 20
        ];

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        
        this.indexCount = indices.length;
    }

    /**
     * Static Factory Method to handle async texture loading
     * @param {*} gl The GL context
     * @param {*} name The name of the sky box
     */
    static async create(gl, name) {
        const texture = await this.loadCubemap(gl, name);
        return new SkyBox(gl, texture);
    }

    // Helper method to load in the cube map
    static loadCubemap(gl, name) {
        return new Promise((resolve, reject) => {
            const url = '/skyboxes/' + name;
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

            const image = new Image();
            image.src = url;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const faceSize = image.width / 4; 
                canvas.width = faceSize;
                canvas.height = faceSize;

                const faces = [
                    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, x: 2, y: 1 }, // Right
                    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, x: 0, y: 1 }, // Left
                    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, x: 1, y: 0 }, // Top
                    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, x: 1, y: 2 }, // Bottom
                    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, x: 1, y: 1 }, // Front
                    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, x: 3, y: 1 }  // Back
                ];

                faces.forEach(face => {
                    ctx.clearRect(0, 0, faceSize, faceSize);
                    ctx.drawImage(image, 
                        face.x * faceSize, face.y * faceSize, faceSize, faceSize, 
                        0, 0, faceSize, faceSize
                    );
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                    gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                });

                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                
                // Apply parameters
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                resolve(texture);
            };
            image.onerror = () => reject(new Error(`Failed to load skybox image: ${url}`));
        });
    }

    // Sets up the attributes for the shader
    setupAttributes(shader) {
        // Initialise constant GL context
        const gl = this.gl;
        // Get the location of the position attribute
        const posLoc = shader.getAttribLocation('aPos');
        // Get the stride per primitive (triangle)
        const stride = 3 * Float32Array.BYTES_PER_ELEMENT;

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        
        // Get the vertex attribute pointers
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, gl.FALSE, stride, 0);

        // Enable the vertex attribute arrays
        gl.enableVertexAttribArray(posLoc);

        // Bind the index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    // Sets up the shader samplers
    static setupShaderSamplers(gl, program) {
        // Get the sky box sampler location
        const uSkyboxLoc = program.getUniformLocation('uSkybox');

        // Skybox is always Slot 0
        gl.uniform1i(uSkyboxLoc, 0);
    }

    // Renders the sky box on the shader
    render(shader) {
        // Set up the attributes
        this.setupAttributes(shader);

        // Bind the sky box texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.cubeMap);

        // Draw the cube
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }
}