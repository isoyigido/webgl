precision mediump float;

varying vec3 fragCamPos;
varying vec3 fragPos;
varying vec3 fragNormal;
varying vec3 fragColor;
varying vec2 fragTexCoord;

uniform sampler2D uTexture;

const vec3 lightPos = vec3(0.0, 4.0, -4.0);
const float ambientLight = 0.1;
const float specularLight = 0.5;

void main() {
    vec3 normal = normalize(fragNormal);
    vec3 lightDirection = normalize(lightPos - fragPos);

    float diffuse = max(dot(normal, lightDirection), 0.);

    vec3 viewDirection = normalize(fragCamPos - fragPos);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.), 8.);
    float specular = specularLight * specAmount;

    vec4 texCol = texture2D(uTexture, fragTexCoord);

    gl_FragColor = vec4(texCol.rgb * (diffuse + ambientLight + specular), texCol.a);
}