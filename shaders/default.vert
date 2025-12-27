precision mediump float;

attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute vec2 aTexCoord;

varying vec3 fragPos;
varying vec3 fragNormal;
varying vec3 fragColor;
varying vec2 fragTexCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform float millis;

void main() {
    fragPos = (mWorld * vec4(aPos, 1.0)).xyz;
    fragNormal = (mWorld * vec4(aNormal, 0.0)).xyz;
    
    gl_Position = mProj * mView * mWorld * vec4(aPos, 1.0);
    
    fragColor = aColor;
    fragTexCoord = aTexCoord;
}