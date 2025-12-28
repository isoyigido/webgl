precision mediump float;

attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

varying vec3 fragCamPos;
varying vec3 fragPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;

uniform vec3 camPos;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform float millis;

void main() {
    //vec3 baPos = aPos;
    //baPos.z += sin(millis/521.) * 0.5;
    //baPos.y += sin(millis/720.) * 1.2;
    //baPos.x += sin(millis/380.) * 0.7;

    fragCamPos = camPos;
    fragPos = (mWorld * vec4(aPos, 1.0)).xyz;
    fragNormal = (mWorld * vec4(aNormal, 0.0)).xyz;
    fragTexCoord = aTexCoord;

    gl_Position = mProj * mView * mWorld * vec4(aPos, 1.0);
}