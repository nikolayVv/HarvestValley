import { vec3, mat4, quat } from './lib/gl-matrix-module.js';

import { Utils } from './Utils.js';

export class Node {

    constructor(options) {
        Utils.init(this, Node.defaults, options);

        this.transform = mat4.create();
        this.updateTransform();

        this.name = options.name;
        this.children = [];
        this.parent = null;
    }

    updateTransform() {
        const t = this.transform;
        const degrees = this.rotation.map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create(), ...degrees);
        const v = vec3.clone(this.translation);
        const s = vec3.clone(this.scale);
        mat4.fromRotationTranslationScale(t, q, v, s);
    }

    getGlobalTransform() {
        if (!this.parent) {
            return mat4.clone(this.transform);
        } else {
            let transform = this.parent.getGlobalTransform();
            return mat4.mul(transform, transform, this.transform);
        }
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    traverse(before, after) {
        if (before) {
            before(this);
        }
        for (let child of this.children) {
            child.traverse(before, after);
        }
        if (after) {
            after(this);
        }
    }

    InteractionWith(models, type) {
        let closestOld = new Float32Array([
            Infinity, Infinity, Infinity, Infinity,
            Infinity, Infinity, Infinity, Infinity,
            Infinity, Infinity, Infinity, Infinity,
            Infinity, Infinity, Infinity, Infinity
        ]);
        let closestNew = new Float32Array([
            Infinity, Infinity, Infinity, Infinity,
            Infinity, Infinity, Infinity, Infinity,
            Infinity, Infinity, Infinity, Infinity,
            Infinity, Infinity, Infinity, Infinity
        ]);
        let action = "";
        let target = "";
        let message = "";
        let index = -1;
        let modelReturn = null;
        models.forEach((model, modelIndex) => {
            if (type === "fruits") {
                if (model.name === "banana" || model.name === "apple" || model.name === "lemon" || model.name === "cherry" ||
                    model.name === "tomato" || model.name === "eggplant" || model.name === "cucumber" || model.name === "carrot") {
                    if(this.arraysAreEqual(this.translation, model.translation, 1.1)) {
                        closestNew = this.calculateDistance(this.getGlobalTransform(), model.getGlobalTransform(), closestOld);
                        if (JSON.stringify(closestNew) !== JSON.stringify(closestOld)) {
                            closestOld = closestNew;
                            action = "harvest";
                            message = "Press SPACE to harvest the " +  model.name + "!"
                            target = model.name;
                            index = modelIndex
                            modelReturn = model;
                        }
                    }
                }
            } else if (type === "farm") {
                if (model.name === "treeUnlocked" || model.name === "treeLocked" || model.name === "dirtUnlocked" || model.name === "dirtLocked") {
                    if(this.arraysAreEqual(this.translation, model.translation, 1.1)) {
                        closestNew = this.calculateDistance(this.getGlobalTransform(), model.getGlobalTransform(), closestOld);
                        if (JSON.stringify(closestNew) !== JSON.stringify(closestOld)) {
                            closestOld = closestNew;
                            if (model.name === "treeUnlocked" || model.name === "dirtUnlocked") {
                                action = "plant";
                                message = "Press SPACE to plant!"
                                if (model.name === "treeUnlocked")
                                    target = "tree";
                                if (model.name === "dirtUnlocked")
                                    target = "land";
                            } else {
                                if (model.name === "treeLocked") {
                                    action = "unlock";
                                    target = "tree";
                                } else {
                                    action = "unlock";
                                    target = "land";
                                }
                                message = "Press SPACE to unlock the " + target +"!"
                            }
                            index = modelIndex;
                            modelReturn = model;
                        }
                    }
                }
            } else {
                if (model.name === "seller" || model.name === "chest") {
                    if(this.arraysAreEqual(this.translation, model.translation, 0.6)) {
                        closestNew = this.calculateDistance(this.getGlobalTransform(), model.getGlobalTransform(), closestOld);
                        if (JSON.stringify(closestNew) !== JSON.stringify(closestOld)) {
                            closestOld = closestNew;
                            if (model.name === "seller") {
                                action = "shop";
                                target = "shop"
                            } else {
                                action = "chest";
                                target = "chest" 
                            }
                            message = "Press SPACE to open the " + target +"!"
                            index = modelIndex;
                            modelReturn = model;
                        }
                    }
                }
            }
            
        });
        return { action: action, target: target, index: index, message: message, model: modelReturn};
    }

    arraysAreEqual(camera, model,epsilon) {
        for (let i = 0; i < camera.length; i++) {
            if (Math.abs(camera[i] - model[i]) >= epsilon)
                return false;
        }
        return true;
    }

    calculateDistance(camera, model, closest) {
        let array = new Float32Array([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
        for (let i = 0; i < camera.length; i++) {

            array[i] = Math.abs(camera[i] - model[i]);
        }
        return array;
    }
}

Node.defaults = {
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    aabb: {
        min: [0, 0, 0],
        max: [0, 0, 0],
    },
};
