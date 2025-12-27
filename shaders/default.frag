precision mediump float;

varying vec3 fragPos;
varying vec3 fragNormal;
varying vec3 fragColor;
varying vec2 fragTexCoord;

uniform sampler2D uTexture;

const vec3 lightPos = vec3(5.0, 5.0, 5.0);
const float ambient = 0.1;

void main() {
    // gl_FragColor = texture2D(uTexture, fragTexCoord);

    // gl_FragColor = vec4(fragColor, 1.0);

    vec3 normal = normalize(fragNormal);
    vec3 lightDirection = normalize(lightPos - fragPos);

    float diffuse = max(dot(normal, lightDirection), 0.);

    gl_FragColor = vec4(fragColor * diffuse, 1.0);
}