export default class Shader {
    /**
     * Shader constructor
     * @param {*} gl The GL context
     * @param {*} vertexSource The source text for the vertex shader
     * @param {*} fragmentSource The source text for the fragment shader
    */
    constructor(gl, vertexSource, fragmentSource) {
        // Set GL context
        this.gl = gl;
        // Create the shader program
        this.program = this._createProgram(vertexSource, fragmentSource);
        // Initialise attributes
        this.attribs = {};
        // Initialise uniforms
        this.uniforms = {};
    }

    // Public method to use this shader
    use() {
        this.gl.useProgram(this.program);
    }

    // Helper to get attribute locations and cache them
    getAttribLocation(name) {
        if (!this.attribs[name]) {
            this.attribs[name] = this.gl.getAttribLocation(this.program, name);
        }
        return this.attribs[name];
    }

    // Helper to get uniform locations and cache them
    getUniformLocation(name) {
        if (!this.uniforms[name]) {
            this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
        }
        return this.uniforms[name];
    }

    // Private helper for creating a shader program
    _createProgram(vertCode, fragCode) {
        // Initialise the constant for the GL context
        const gl = this.gl;
        // Compile the vertex shader
        const vs = this._compileShader(gl.VERTEX_SHADER, vertCode);
        // Compile the fragment shader
        const fs = this._compileShader(gl.FRAGMENT_SHADER, fragCode);

        // Generate the program
        const program = gl.createProgram();
        // Attach the vertex shader
        gl.attachShader(program, vs);
        // Attach the fragment shader
        gl.attachShader(program, fs);
        // Link the program
        gl.linkProgram(program);

        // Check for errors
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader Link Error: ', gl.getProgramInfoLog(program));
        }
        // Return the shader program
        return program;
    }

    // Private helper for compiling a shader
    _compileShader(type, source) {
        // Initialise the constant for the GL context
        const gl = this.gl;
        // Create the shader
        const shader = gl.createShader(type);
        // Set the shader source
        gl.shaderSource(shader, source);
        // Compile the shader
        gl.compileShader(shader);

        // Check for errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader Compile Error: ', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        // Return the shader
        return shader;
    }
}