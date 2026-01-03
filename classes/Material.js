export default class Material {
    /**
     * Material constructor
     * @param colorTexture The color texture
     * @param normalMap The normal map
     * @param ormMap The ORM (Occlusion, Roughness, Metalness) map
     */
    constructor(colorTexture, normalMap, ormMap) {
        this.colorTexture = colorTexture;

        this.normalTexture = normalMap.texture;
        this.normalScale = normalMap.normalScale;

        this.ormTexture = ormMap.texture;
        this.roughFactor = ormMap.roughFactor;
        this.metalFactor = ormMap.metalFactor;
    }

    // Sets up the shader samplers
    static setupShaderSamplers(gl, program) {
        // Use the shader program
        program.use();

        // Tell the shader variables which "Slots" to watch forever
        gl.uniform1i(program.getUniformLocation('uColorSampler'), 0); // Color Texture is always Slot 0
        gl.uniform1i(program.getUniformLocation('uNormalSampler'), 1); // Normal map is always Slot 1
        gl.uniform1i(program.getUniformLocation('uOrmSampler'), 2); // ORM map is always Slot 2
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

        // If there is an ORM map
        if (this.ormTexture) {
            // Notify the shader that there is an ORM map
            gl.uniform1i(shader.getUniformLocation('uHasOrmMap'), true);

            // Bind ORM to Slot 2
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.ormTexture);

            // Send roughness factor uniform
            gl.uniform1f(shader.getUniformLocation('uRoughFactor'), this.roughFactor);
            // Send metalness factor uniform
            gl.uniform1f(shader.getUniformLocation('uMetalFactor'), this.metalFactor);
        } else {
            // Notify the shader that there is no ORM map
            gl.uniform1i(shader.getUniformLocation('uHasOrmMap'), false);
        }
    }
}