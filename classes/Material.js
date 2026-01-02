export default class Material {
    /**
     * Material constructor
     * @param colorTexture The color texture
     * @param normalMap The normal map
     */
    constructor(colorTexture, normalMap) {
        this.colorTexture = colorTexture;

        this.normalTexture = normalMap.texture;
        this.normalScale = normalMap.normalScale;
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
    apply(gl, shader) {
        // Bind color to Slot 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);

        // If there is a normal map
        if (this.normalTexture) {
            // Notify the shader that there is a normal map
            gl.uniform1i(shader.getUniformLocation('uHasNormalMap'), true);

            // Bind normal to Slot 1
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);

            // Send normal scale uniform
            gl.uniform1f(shader.getUniformLocation('uNormalScale'), this.normalScale);
        } else {
            // Notify the shader that there is no normal map
            gl.uniform1i(shader.getUniformLocation('uHasNormalMap'), false);
        }
    }
}