import Mesh from "./Mesh.js"
import Material from "./Material.js"

export default class ModelLoader {
    // Helper method to load in the resources for a model
    static async loadModel(objectName, gl) {
        // Define the root-relative path to the object's folder
        const folderPath = `objects/${objectName}/`;
        const modelUrl = `${folderPath}model.obj`;

        // 1. Fetch the .obj file
        const response = await fetch(modelUrl);
        if (!response.ok) {
            throw new Error(`Could not find model for object: ${objectName} at ${modelUrl}`);
        }

        // 2. Parse the OBJ data (assuming it's always OBJ for now)
        const objString = await response.text();
        const data = this.parseOBJ(objString);

        // 3. Load textures in parallel for speed
        // Assume names are consistent: color.png and normal.png
        const [colorTexture, normalTexture] = await Promise.all([
            this.loadTexture(gl, `${folderPath}color.png`),
            this.loadTexture(gl, `${folderPath}normal.png`).catch(() => {
                console.warn(`Normal map missing for ${objectName}, skipping.`);
                return null;
            })
        ]);

        // 4. Return the bundle
        return {
            mesh: new Mesh(gl, data.vertices, data.indices),
            material: new Material(colorTexture, normalTexture)
        };
    }

    // Parses a .obj file
    static parseOBJ(objString) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const vertices = []; 
        const indices = [];
        const cache = {};

        const lines = objString.split('\n');

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            const parts = line.split(/\s+/);
            const type = parts[0];

            if (type === 'v') {
                positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'vn') {
                normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            } else if (type === 'vt') {
                uvs.push([parseFloat(parts[1]), 1.0 - parseFloat(parts[2])]);
            } else if (type === 'f') {
                const faceVertices = [];
                for (let i = 1; i < parts.length; i++) {
                    const specs = parts[i].split('/');
                
                    // specs[0]: v, specs[1]: vt, specs[2]: vn
                    const posIdxRaw = parseInt(specs[0]);
                    const uvIdxRaw = parseInt(specs[1]);
                    const normIdxRaw = parseInt(specs[2]);

                    const posIdx = posIdxRaw >= 0 ? posIdxRaw - 1 : positions.length + posIdxRaw;
                    const uvIdx = uvIdxRaw >= 0 ? uvIdxRaw - 1 : uvs.length + uvIdxRaw;
                    const normIdx = normIdxRaw >= 0 ? normIdxRaw - 1 : normals.length + normIdxRaw;

                    // The cache key now must include the normal index
                    const key = `${posIdx}/${uvIdx}/${normIdx}`;

                    if (!(key in cache)) {
                        const pos = positions[posIdx] || [0, 0, 0];
                        const norm = normals[normIdx] || [0, 1, 0]; // Default up if missing
                        const uv = uvs[uvIdx] || [0, 0];

                        const newIndex = vertices.length / 8;
                        // Layout: x,y,z (3), nx,ny,nz (3), u,v (2) = 8 total
                        vertices.push(...pos, ...norm, ...uv);
                        cache[key] = newIndex;
                    }
                    faceVertices.push(cache[key]);
                }

                for (let i = 1; i < faceVertices.length - 1; i++) {
                    indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
                }
            }
        }
        return { vertices: new Float32Array(vertices), indices: new Uint32Array(indices) };
    }

    // Loads in the texture at the input URL
    static async loadTexture(gl, url) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // 1. Keep the placeholder (so the texture is valid if used immediately)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        // 2. Return a promise that resolves once the image is bound
        return new Promise((resolve, reject) => {
            const image = new Image();
        
            image.onload = () => {
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
            
                resolve(texture); // Now we resolve the promise
            };

            image.onerror = () => reject(new Error(`Failed to load image at ${url}`));
            image.src = url;
        });
    }

    // Helper to check dimensions
    static isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
}