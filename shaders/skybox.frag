precision mediump float;

varying vec3 fragTexCoord;

uniform samplerCube uSkybox;

void main() {
    gl_FragColor = textureCube(uSkybox, fragTexCoord);
}