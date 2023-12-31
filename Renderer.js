import { mat4 } from './lib/gl-matrix-module.js';

import { WebGL } from './WebGL.js';

import { shaders } from './shaders.js';

import { Light } from './Light.js';

export class Renderer {

    constructor(gl) {
        this.gl = gl;

        gl.clearColor(0.529, 0.807, 0.921, 0.8);
        //NIGHT SKY
        //gl.clearColor(0.0, 0.0, 0.5, 0.8);
        /*{
            "type": "light",
            "ambientColor" : [150, 150, 255],
            "diffuseColor" : [0, 0, 0],
            "specularColor" : [0, 0, 0],
            "shininess" : 10,
            "lightPosition" : [-20, 20000, -20],
            "attenuatuion" : [1, 0, 0.000001]
        },*/
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        this.programs = WebGL.buildPrograms(gl, shaders);

        this.defaultTexture = WebGL.createTexture(gl, {
            width  : 1,
            height : 1,
            data   : new Uint8Array([255, 255, 255, 255])
        });
    }

    prepare(scene) {
        scene.nodes.forEach(node => {
            node.gl = {};
            if (node.mesh) {
                Object.assign(node.gl, this.createModel(node.mesh));
            }
            if (node.image) {
                node.gl.texture = this.createTexture(node.image);
            }
        });
    }

    prepareForOneNode(node) {
        node.gl = {};
        if (node.mesh) {
            Object.assign(node.gl, this.createModel(node.mesh));
        }
        if (node.image) {
            node.gl.texture = this.createTexture(node.image);
        }
    }

    render(scene, camera, light,color) {
        const gl = this.gl;
        gl.clearColor(color[0], color[1], color[2], color[3])
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);

        let matrix = mat4.create();
        let matrixStack = [];

        const viewMatrix = camera.getGlobalTransform();
        mat4.invert(viewMatrix, viewMatrix);
        mat4.copy(matrix, viewMatrix);
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, camera.projection);

        gl.uniform3fv(program.uniforms.uAmbientColor, light.ambientColor);
        gl.uniform3fv(program.uniforms.uDiffuseColor, light.diffuseColor);
        gl.uniform3fv(program.uniforms.uSpecularColor, light.specularColor);
        gl.uniform1f(program.uniforms.uShininess, light.shininess);
        gl.uniform3fv(program.uniforms.uLightPosition, light.lightPosition);
        gl.uniform3fv(program.uniforms.uLightAttenuation, light.attenuatuion);

        scene.traverse(
            node => {
                matrixStack.push(mat4.clone(matrix));
                mat4.mul(matrix, matrix, node.transform);
                if (node.gl.vao) {
                    gl.bindVertexArray(node.gl.vao);
                    gl.uniformMatrix4fv(program.uniforms.uViewModel, false, matrix);
                    const normalMatrix = mat4.create();
                    mat4.invert(normalMatrix, matrix);
                    mat4.transpose(normalMatrix, normalMatrix);
                    gl.uniformMatrix4fv(program.uniforms.uNormalMatrix, false, normalMatrix);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, node.gl.texture);
                    gl.uniform1i(program.uniforms.uTexture, 0);
                    gl.drawElements(gl.TRIANGLES, node.gl.indices, gl.UNSIGNED_SHORT, 0);
                }
            },
            node => {
                matrix = matrixStack.pop();
            }
        );
    }

    createModel(model) {
        const gl = this.gl;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        const indices = model.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        return { vao, indices };
    }

    createTexture(texture) {
        const gl = this.gl;
        return WebGL.createTexture(gl, {
            image : texture,
            min   : gl.NEAREST,
            mag   : gl.NEAREST
        });
    }

}
