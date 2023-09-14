import { vec3, mat4 } from './lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';

export class Light extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);
    }

}

Light.defaults = {
    ambientColor     : [51, 51, 51],
    diffuseColor     : [0, 0, 0],
    specularColor    : [0, 0 ,0],
    shininess        : 10,
    lightPosition    : [0, 0, 100],
    attenuatuion     : [1.0, 0, 0.02]
};