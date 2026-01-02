precision mediump float;

attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec2 aTexCoord;
attribute vec4 aTangent;

varying vec3 fragPos;
varying vec3 fragNormal;
varying vec2 fragTexCoord;
varying mat3 vTBN;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform bool uHasNormalMap;

void main() {
    // Calculate World Position
    vec4 worldPos = mWorld * vec4(aPos, 1.0);
    fragPos = worldPos.xyz;
    fragTexCoord = aTexCoord;

    // If there is a normal map
    if (uHasNormalMap) {
        // Transform Normal and Tangent to World Space
        vec3 T = normalize(vec3(mWorld * vec4(aTangent.xyz, 0.0)));
        vec3 N = normalize(vec3(mWorld * vec4(aNormal, 0.0)));

        // Re-orthogonalize T with respect to N (Gram-Schmidt process)
        // This ensures T and N are exactly 90 degrees apart after scaling/interpolation
        T = normalize(T - dot(T, N) * N);

        // Calculate Bitangent (B)
        // Use the cross product of N and T, then multiply by aTangent.w
        // to account for handedness/mirrored textures.
        vec3 B = cross(N, T) * aTangent.w;

        // Construct TBN Matrix (Tangent, Bitangent, Normal)
        vTBN = mat3(T, B, N);
    }
    // If there is no normal map
    else {
        // Calculate the normal based on the mesh
        fragNormal = (mWorld * vec4(aNormal, 0.0)).xyz;
    }

    // Set GL position
    gl_Position = mProj * mView * worldPos;
}