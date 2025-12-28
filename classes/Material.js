export default class Material {
    /**
     * Material constructor
     * @param colorTexture The color texture
     * @param normalTexture The normal map
     */
    constructor(colorTexture, normalTexture = null) {
        this.colorTexture = colorTexture;
        this.normalTexture = normalTexture;
    }

    // Sets up the shader samplers
    static setupShaderSamplers(gl, program) {
        // Use the shader program
        program.use();

        // Get the uniform locations
        const uColorLoc = program.getUniformLocation('uColorSampler');
        const uNormalLoc = program.getUniformLocation('uNormalSampler');

        // Tell the shader variables which "Slots" to watch forever
        gl.uniform1i(uColorLoc, 0); // Color Texture is always Slot 0
        gl.uniform1i(uNormalLoc, 1); // Normal map is always Slot 1
    }

    // Applies the materials
    apply(gl) {
        // Bind color to Slot 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);

        // Bind normal to Slot 1 (if it exists)
        if (this.normalTexture) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
        }
    }
}