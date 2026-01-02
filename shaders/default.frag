precision mediump float;

varying vec3 fragPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;
varying mat3 vTBN;

uniform sampler2D uColorSampler;
uniform sampler2D uNormalSampler;
uniform float uNormalScale;

uniform vec3 camPos;

uniform bool uHasNormalMap;

const vec3 lightPos = vec3(0.0, 4.0, -4.0);
const float ambientLight = 0.1;
const float specularLight = 0.5;

void main() {
    vec3 normal;

    // If there is a normal map
    if (uHasNormalMap) {
        // 1. Sample the normal map (0.0 to 1.0)
        vec3 normalMap = texture2D(uNormalSampler, fragTexCoord).rgb;
        
        // 2. Unpack to Tangent Space (-1.0 to 1.0)
        vec3 tangentNormal = normalize(normalMap * 2.0 - 1.0);
        
        // 3. Apply the Scale to X and Y (Tangent and Bitangent)
        tangentNormal.xy *= uNormalScale;
        
        // 4. Re-normalize to ensure it's still a unit vector
        normal = normalize(vTBN * tangentNormal);
    }
    // If there is no normal map
    else {
        normal = fragNormal;
    }

    
    vec3 lightDirection = normalize(lightPos - fragPos);

    float diffuse = max(dot(normal, lightDirection), 0.);

    vec3 viewDirection = normalize(camPos - fragPos);
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.), 8.);
    float specular = specularLight * specAmount;

    vec3 albedo = texture2D(uColorSampler, fragTexCoord).rgb;

    gl_FragColor = vec4(albedo * (diffuse + ambientLight + specular), 1.0);
}