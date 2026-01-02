import { load } from '@loaders.gl/core';
import { GLTFLoader, postProcessGLTF } from '@loaders.gl/gltf';
import Mesh from "./Mesh.js";
import Material from "./Material.js";

export default class ModelLoader {
    // Loads in a .glb file
    static async loadModel(modelName, gl) {
        // Get the URL for the model name (e.g., '/models/car.glb')
        const url = `models/${modelName}.glb`;
        // Get the raw GLTF data
        const gltfRaw = await load(url, GLTFLoader);
        // Process the raw GLTF data
        const gltf = postProcessGLTF(gltfRaw);

        // Initialise the list of renderables
        const renderables = [];

        // Get the scene
        const scene = gltf.scene || gltf.scenes[0];

        // Define traversal
        const traverse = (node, parentMatrix) => {
            // 1. Calculate this node's matrix relative to the model root
            let localMatrix = node.matrix || glMatrix.mat4.create();

            // Initialise the model space matrix
            let modelSpaceMatrix = glMatrix.mat4.create();
            
            // Multiply: modelSpaceMatrix = parentMatrix * localMatrix
            glMatrix.mat4.multiply(modelSpaceMatrix, parentMatrix, localMatrix);

            // 2. If this node has a mesh, save the pre-calculated matrix
            if (node.mesh) {
                // For each primitive
                for (const prim of node.mesh.primitives) {
                    // Initialise the list of attributes
                    const attributes = {};
                    // For each accessor
                    for (const [attrName, accessor] of Object.entries(prim.attributes)) {
                        // Save the attribute
                        attributes[attrName] = {
                            value: accessor.value,
                            size: accessor.size,
                            componentType: accessor.componentType
                        };
                    }

                    // Get the indices of the mesh
                    const indices = prim.indices ? {
                        value: prim.indices.value,
                        componentType: prim.indices.componentType
                    } : null;
                    
                    // Initialise the mesh instance
                    const mesh = new Mesh(gl, attributes, indices);
                    
                    // - Get the base color texture -
                    let colorTex = null;
                    if (prim.material?.pbrMetallicRoughness?.baseColorTexture?.texture) {
                        colorTex = this.createGLTexture(gl, prim.material.pbrMetallicRoughness.baseColorTexture.texture.source.image);
                    }

                    // - Get the normal map -
                    let normalTex = null;
                    let normalScale = 1.0; // default scale

                    // If the material has a normal map
                    if (prim.material?.normalTexture?.texture) {
                        // Get the normal map as a GL texture
                        normalTex = this.createGLTexture(gl, prim.material.normalTexture.texture.source.image);
                        
                        // Get the normal scale to control bump intensity
                        if (prim.material.normalTexture.scale !== undefined) {
                            normalScale = prim.material.normalTexture.scale;
                        }
                    }

                    // Add new renderable
                    renderables.push({ 
                        mesh, 
                        material: new Material(colorTex, {texture: normalTex, normalScale: normalScale}),
                        modelSpaceMatrix: modelSpaceMatrix 
                    });
                }
            }

            // 3. Keep traversing down to children
            if (node.children) {
                // For each child
                for (const child of node.children) {
                    // Traverse the child
                    traverse(child, modelSpaceMatrix);
                }
            }
        };

        // Initialise identity matrix
        const identity = glMatrix.mat4.create();

        // Start traversal for each node
        for (const node of scene.nodes) {
            traverse(node, identity); 
        }

        // Return the list of renderables
        return renderables;
    }

    static createGLTexture(gl, image) {
        if (!image) return null;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
        // Check if power of 2 for mipmaps (standard WebGL1 check)
        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // Non-power-of-2 settings (clamp to edge, no mipmaps)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        return texture;
    }

    // Helper to check dimensions
    static isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
}