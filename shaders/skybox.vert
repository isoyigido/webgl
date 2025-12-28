attribute vec3 aPos;

varying vec3 fragTexCoord; // Directions for cubemap

uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragTexCoord = aPos;

    // Remove translation: only rotation matters for the sky
    mat4 viewNoTranslation = mat4(mat3(mView)); 
    vec4 pos = mProj * viewNoTranslation * vec4(aPos, 1.0);
    
    // The xyww trick: force depth to 1.0
    gl_Position = pos.xyww;
}