precision mediump float;

varying vec3 fragPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;
varying mat3 vTBN;

uniform sampler2D uColorSampler;
uniform sampler2D uNormalSampler;
uniform sampler2D uOrmSampler;

uniform float uNormalScale;
uniform float uRoughFactor;
uniform float uMetalFactor;

uniform vec3 camPos;

uniform bool uHasNormalMap;
uniform bool uHasOrmMap;

const vec3 lightPos = vec3(0.0, 4.0, -4.0);

const vec3 ambientLightColor = vec3(0.2);

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
        // Use the mesh normal
        normal = fragNormal;
    }

    float ambientOcclusion;
    float roughness;
    float metalness;

    // If there is an ORM map
    if (uHasOrmMap) {
        // 1. Sample the ORM map
        vec3 orm = texture2D(uOrmSampler, fragTexCoord).rgb;
    
        // 2. Extract and apply factors
        ambientOcclusion = orm.r; 
        roughness = orm.g * uRoughFactor;
        metalness = orm.b * uMetalFactor;
    }
    // If there is no ORM map
    else {
        // Use default values
        ambientOcclusion = 1.0;
        roughness = uRoughFactor;
        metalness = uMetalFactor;
    }

    vec3 viewDir = normalize(camPos - fragPos);
    vec3 lightDir = normalize(lightPos - fragPos);
    vec3 halfwayDir = normalize(lightDir + viewDir);

    vec3 albedo = texture2D(uColorSampler, fragTexCoord).rgb;

    vec3 ambient = ambientLightColor * albedo * ambientOcclusion;

    float diffuse = dot(normal, lightDir);

    vec3 specularLight = vec3(0.0);
    if (diffuse > 0.0) {
        float shininess = pow(2.0, 8.0 * (1.0 - roughness));
        float specAmount = pow(max(dot(normal, halfwayDir), 0.0), shininess);

        float lightShadowMask = smoothstep(0.0, 0.05, diffuse);

        specularLight = mix(vec3(0.04), albedo, metalness) * specAmount * lightShadowMask;
    }

    diffuse = max(diffuse, 0.0) * (1.0 - metalness);

    gl_FragColor = vec4(ambient + (albedo * diffuse) + specularLight, 1.0);
}