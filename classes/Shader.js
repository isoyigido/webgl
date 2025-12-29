export default class Shader {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.attribs = {};
        this.uniforms = {};
    }

    // Static factory method to handle async loading
    static async create(gl, vertexName, fragmentName) {
        // Get the vertex and fragment shader texts
        const vsText = await this.loadShaderText('shaders/' + vertexName);
        const fsText = await this.loadShaderText('shaders/' + fragmentName);
        
        // Create the shader program
        const program = this._createProgram(gl, vsText, fsText);

        // Return a new Shader object
        return new Shader(gl, program);
    }

    // Helper method for loading in text for shaders
    static async loadShaderText(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load shader: ${url}`);
        return await response.text();
    }

    // Helper function to load text files
    async loadShaderText(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load shader: ${url}`);
        }
        return await response.text();
    };

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
    static _createProgram(gl, vertCode, fragCode) {
        // Compile the vertex shader
        const vs = this._compileShader(gl, gl.VERTEX_SHADER, vertCode);
        // Compile the fragment shader
        const fs = this._compileShader(gl, gl.FRAGMENT_SHADER, fragCode);

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
    static _compileShader(gl, type, source) {
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