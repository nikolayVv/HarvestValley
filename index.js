import { GUI } from './lib/dat.gui.module.js';

import { Application } from './Application.js';

import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Camera } from './Camera.js';
import { SceneLoader } from './SceneLoader.js';
import { SceneBuilder } from './SceneBuilder.js';
import { Light } from "./Light.js";
import { Player } from "./Player.js";
import { Timer } from "./Timer.js";
import { Mesh } from "./Mesh.js";

class App extends Application {
    
    start() {
        const gl = this.gl;

        this.countingDowns = [];

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        //max == 720 start at 8*30
        this.timeDay = 18 * 30;
        this.dayo = 0;
        this.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        this.startTime = this.time;
        this.aspect = 1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.load('scene.json');
        this.inventoryItems = [];
        for (let i = 0; i < 11; i++) {
            let item = document.getElementById(`item${i}`);
            this.inventoryItems[i] = item;
        }
        //init playerja

        this.player = new Player({ item: this.inventoryItems[0], index: 0 }, 1, { appleSeeds: 1 }, { apple : 1, tomato : 1 }, [true, false, false, false, false, false, false, false, false], [true, false, false, false, false, false, false, false, false]);
        this.updateMoney();
        this.inventoryItems[0].style.borderColor = "black";
        this.inventoryItems[0].style.borderWidth = "thick";
        this.isPaused = false;
        document.addEventListener('keydown', ev => {
            if(ev.key === 'p' || ev.key === 'P'){
                this.pause();
            }
        })
        document.getElementById('resume').addEventListener('click', ev => {
            this.pause();
        });
        document.getElementById('controls').addEventListener('click', ev => {
            this.controls();
        });
        document.getElementById('volume').addEventListener('click', ev => {
            this.volume();
        });

        this.setDynamicInventory();

        this.volumeLevel = 0.5;
        this.addIcon('inventory');
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        this.builder = new SceneBuilder(scene);
        this.scene = this.builder.build();
        this.physics = new Physics(this.scene);

        // Find first camera.
        this.camera = null;
        this.light = null;
        this.sun = null;
        this.moon = null;
        this.scene.traverse(node => {
            //console.log(node);
            if (node instanceof Camera) {
                this.camera = node;
            }
            else if (node instanceof Light) {
                this.light = node;//500-1500 dan
                this.light.lightPosition[1] = 500
                this.light.updateTransform();
                console.log(this.light);
            } else if (node.name == "sun") {
                this.sun = node;//62
                this.sun.translation[1] = 70;
                this.sun.updateTransform();
            } else if (node.name == "moon") {
                this.moon = node;//77
                this.moon.translation[1] = -50;
                this.moon.updateTransform();
            }
        });

        this.color = [0.500, 0.800, 0.900, 0.8]
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
    }

    setDynamicInventory() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case '1':
                    this.changeChosenItemInInventory(0);
                    break;
                case '2':
                    this.changeChosenItemInInventory(1);
                    break;
                case '3':
                    this.changeChosenItemInInventory(2);
                    break;
                case '4':
                    this.changeChosenItemInInventory(3);
                    break;
                case '5':
                    this.changeChosenItemInInventory(4);
                    break;
                case '6':
                    this.changeChosenItemInInventory(5);
                    break;
                case '7':
                    this.changeChosenItemInInventory(6);
                    break;
                case '8':
                    this.changeChosenItemInInventory(7);
                    break;
                case '9':
                    this.changeChosenItemInInventory(8);
                    break;
                case '0':
                    this.changeChosenItemInInventory(9);
                    break;
                case '-':
                    this.changeChosenItemInInventory(10);
            }
        })
    }

    changeChosenItemInInventory(index) {
        this.player.chosenItemInventory.item.style.borderColor = "gray";
        this.player.chosenItemInventory.item.style.borderWidth = "inherit";
        
        this.player.chosenItemInventory.item = this.inventoryItems[index];
        this.player.chosenItemInventory.index = index;

        this.player.chosenItemInventory.item.style.borderColor = "black";
        this.player.chosenItemInventory.item.style.borderWidth = "thick";
    }
    
    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
            this.audio(0);
        } else {
            this.camera.disable();
        }
    }

    zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    }

    secsToHour(time) {
        const hour = Math.floor(time / 30);
        const minutes = Math.floor((time - hour * 30) / 0.5);
        return this.zeroPad(hour, 2) + ":" + this.zeroPad(minutes, 2);
    }

    riseAndShine( dt, di) {
        if (di == 1) {
            if (this.sun.translation[1] >= 70) {
                this.sun.translation[1] = 70;
                this.sun.updateTransform();
                if (this.moon.translation[1] <= -50) {
                    this.moon.translation[1] = -50;
                    this.moon.updateTransform();
                    return false;
                } else {
                    this.moon.translation[1] -= (dt / 30) * 120;
                    this.moon.updateTransform();
                }
                return false;
            }
            this.sun.translation[1] += (dt / 30) * 120;
            this.sun.updateTransform();
            if (this.moon.translation[1] <= -50) {
                this.moon.translation[1] = -50;
                this.moon.updateTransform();
                return false;
            }
            this.moon.translation[1] -= (dt / 30) * 120;
            this.moon.updateTransform();
            return true;
        } else {
            if (this.moon.translation[1] >= 70) {
                this.moon.translation[1] = 70;
                this.moon.updateTransform();
                if (this.sun.translation[1] <= -50) {
                    this.sun.translation[1] = -50;
                    this.sun.updateTransform();
                    return false;
                } else {
                    this.sun.translation[1] -= (dt / 30) * 120;
                    this.sun.updateTransform();
                }
                return false;
            }
            this.moon.translation[1] += (dt / 30) * 120;
            this.moon.updateTransform();
            if (this.sun.translation[1] <= -50) {
                this.sun.translation[1] = -50;
                this.sun.updateTransform();
                return false;
            }
            this.sun.translation[1] -= (dt / 30) * 120;
            this.sun.updateTransform();
            return true;
        }

    }

    lightMeUp(dt, di) {
        //console.log(this.light.lightPosition);
        if (di == 1) {
            if (this.light.lightPosition[1] >= 1500) {
                this.light.lightPosition[1] = 1500;
                this.light.updateTransform();
                
                return false;
            }
            this.light.lightPosition[1] += (dt / 30) * 1000;
            this.light.updateTransform();
            return true;
        } else {
            if (this.light.lightPosition[1] <= 500) {
                this.light.lightPosition[1] = 500;
                this.light.updateTransform();

                return false;
            }
            this.light.lightPosition[1] -= (dt / 30) * 1000;
            this.light.updateTransform();
            return true;
        }
    }

    colorMeImpressed(dt, di) {
        5, 8, 9
        if (di == 1) {//tuki grejo proti 0
            if (this.color[0] <= 0) {
                this.color[0] = 0;
            } else {
                this.color[0] -= (dt / 30) * 0.5;
            }
            if (this.color[1] <= 0) {
                this.color[1] = 0;
            } else {
                this.color[1] -= (dt / 30) * 0.8;
            }
            if (this.color[2] <= 0) {
                this.color[2] = 0;
            } else {
                this.color[2] -= (dt / 30) * 0.9;
            }
        } else {
            if (this.color[0] >= 0.5) {
                this.color[0] = 0.5;
            } else {
                this.color[0] += (dt / 30) * 0.5;
            }
            if (this.color[1] >= 0.8) {
                this.color[1] = 0.8;
            } else {
                this.color[1] += (dt / 30) * 0.8;
            }
            if (this.color[2] >= 0.9) {
                this.color[2] = 0.9;
            } else {
                this.color[2] += (dt / 30) * 0.9;
            }
        }
    }

    update() {
        this.dt = new Date();
        
        if(!this.isPaused) {
            this.time = Date.now();
        }
        const dt = (this.time - this.startTime) * 0.001;
        
        if (!this.isPaused && dt<0.3) {
            
            const tim = this.timeDay;
            this.timeDay = (this.timeDay + dt) % 720;
            if (tim > this.timeDay) {
                this.dayo = (this.dayo + 1) % 7;
            }
            //console.log(dt);
            document.getElementById('day').innerHTML = this.days[this.dayo];

            document.getElementById('time').innerHTML = this.secsToHour(this.timeDay)//this.dt.getHours() + ":" + this.dt.getMinutes();
            if (this.timeDay >= 19 * 30 - 1 && this.timeDay <= 20 * 30) {
                this.riseAndShine(dt, 0);
                this.lightMeUp(dt, 1);
                this.colorMeImpressed(dt, 1);
            } else if (this.timeDay >= 7 * 30 - 1 && this.timeDay <= 8 * 30) {
                this.riseAndShine(dt, 1);
                this.lightMeUp(dt, 0);
                this.colorMeImpressed(dt, 0);
            }
        }
        
        

        this.startTime = this.time;
        

        if (this.camera) {
            this.camera.update(dt);
            let fruitsInteraction = this.scene.nodes[0].InteractionWith(this.scene.nodes.slice(2), "fruits");
            let farmingInteraction = this.scene.nodes[0].InteractionWith(this.scene.nodes.slice(2), "farm");
            let itemsInteraction = this.scene.nodes[0].InteractionWith(this.scene.nodes.slice(2), "items");
            if (fruitsInteraction.index !== -1 && fruitsInteraction.action !== "") {
                this.interact(fruitsInteraction);
            } else if (farmingInteraction.index !== -1 && farmingInteraction.action !== "") {
                this.interact(farmingInteraction);
            } else if (itemsInteraction.index !== -1 && itemsInteraction.action !== "") {
                this.interact(itemsInteraction);
            } else {
                this.interact({ action: "close", index: -1 });
            }
        }

        if (this.physics) {
            this.physics.update(dt);
        }

        if (document.pointerLockElement !== null) {
            this.scene.nodes[2].translation[0] = this.camera.translation[0];
            this.scene.nodes[2].translation[2] = this.camera.translation[2];
            this.scene.nodes[2].rotation[1] = this.camera.rotation[1]+Math.PI;
            /*console.log(this.scene.nodes[2].rotation[1]);
            if(this.scene.nodes[2].rotation[1] > 8){
                this.scene.nodes[2].rotation[1] = 8;
            }
            if(this.scene.nodes[2].rotation[1] < 8.4){
                this.scene.nodes[2].rotation[1] = 8.4;
            }*/
            this.scene.nodes[2].updateTransform();
        }
    }

    interact(interaction) {
        if (this.countingDowns && this.countingDowns.length !== 0) {
            this.countingDowns.forEach((timer, index) => {
                let timerMessage = timer.getTime(this.dt);
                if (timerMessage === "Ready to harvest") {
                    this.countingDowns.splice(index, 1);
                    this.showFruitForHarvesting(timer);
                }
            });
        }
        if (interaction.action === "close") {
            document.querySelector(".timerHUD").style.display = 'none';
            document.getElementById("action").style.display = 'none';
            document.getElementById("popUp").style.display = 'none';
            document.onkeydown = null;
        } else if (!this.isPaused) {
            if (this.countingDowns && this.countingDowns.length !== 0) {
                    for (let index = 0; index < this.countingDowns.length; index++) {
                        let timer = this.countingDowns[index];
                        if (timer.placeIndex === interaction.index) {
                            document.getElementById("action").style.display = 'none';
                            document.onkeydown = null;
                            let timerMessage = timer.getTime(this.dt);
                            if (timerMessage === "Ready to harvest") {
                                document.querySelector(".timerHUD").style.display = 'none';
                                this.countingDowns.splice(index, 1);
                                this.showFruitForHarvesting(timer);
                            } else {
                                document.querySelector(".timerHUD").style.display = 'block';
                                document.querySelector("#timer").innerHTML = timerMessage;
                            }
                            break;
                        } else {
                            if (index < this.countingDowns.length - 1)
                                continue;
                            document.querySelector(".timerHUD").style.display = 'none';
                            document.getElementById("action").style.display = 'block';
                            document.getElementById("actionMessage").innerText = interaction.message;
                            document.onkeydown = (e) => {
                                if (e.code === "Space") {
                                    switch(interaction.action) {
                                        case "unlock":
                                            this.unlock(interaction.target, interaction.index);
                                            break;
                                        case "chest":
                                            this.chest();
                                            break;
                                        case "plant":
                                            this.plant(interaction.index);
                                            break;
                                        case "harvest":
                                            this.harvest(interaction.target, interaction.index);
                                            break;
                                        case "shop":
                                            this.shop();
                                            break;
                                    }
                                }
                            };
                        }
                }  
            } else {
                document.querySelector(".timerHUD").style.display = 'none';
                document.getElementById("action").style.display = 'block';
                document.getElementById("actionMessage").innerText = interaction.message;
                document.onkeydown = (e) => {
                    if (e.code === "Space") {
                        switch(interaction.action) {
                            case "unlock":
                                this.unlock(interaction.target, interaction.index);
                                break;
                            case "chest":
                                this.chest();
                                break;
                            case "plant":
                                this.plant(interaction.index);
                                break;
                            case "harvest":
                                this.harvest(interaction.target, interaction.index);
                                break;
                            case "shop":
                                this.shop();
                                break;
                        }
                    }
                };
            }
        }
        if (interaction.action === "unlock") {
            let message = `You need ${this.price(interaction.target)} € to unlock this ${interaction.target}`;
            document.getElementById("popUp").style.display = 'block';
            document.getElementById("popUp").innerText = message;
        }
    }

    showFruitForHarvesting(timer) {
        let spawnItem = JSON.parse(JSON.stringify(this.scene.nodes[timer.placeIndex + 2]));
        spawnItem.__proto__ = Object.getPrototypeOf(this.scene.nodes[timer.placeIndex+2]);
        spawnItem.name = timer.spawnItem;
        switch(timer.spawnItem) {
            case "apple":
                spawnItem.aabb.max = [0.05, 1, 0.05];
                spawnItem.aabb.min = [-0.05, 0, -0.05];
                spawnItem.rotation = [0, 0, 0];
                spawnItem.translation = [spawnItem.translation[0] + 0.3, 0.41, spawnItem.translation[2] + 0.2]
                spawnItem.scale = [0.16, 0.16, 0.16];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[14]);
                spawnItem.image = this.builder.spec.textures[21];
                break;
            case "banana":
                spawnItem.aabb.max = [1, 0.1, 1];
                spawnItem.aabb.min = [-1, -0.1, -1];
                spawnItem.rotation = [0, 0, -0.33];
                spawnItem.translation = [spawnItem.translation[0], 0.52, spawnItem.translation[2] + 0.4]
                spawnItem.scale = [0.15, 0.15, 0.15];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[16])
                spawnItem.image = this.builder.spec.textures[23];
                break;
            case "lemon":
                spawnItem.aabb.max = [1, 0.1, 1];
                spawnItem.aabb.min = [-1, -0.1, -1];
                spawnItem.rotation = [0, 0, -1.57079633];
                spawnItem.translation = [spawnItem.translation[0], 0.6, spawnItem.translation[2] + 0.4]
                spawnItem.scale = [12, 12, 12];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[15])
                spawnItem.image = this.builder.spec.textures[22];
                break;
            case "cherry":
                spawnItem.aabb.max = [1, 0.1, 1];
                spawnItem.aabb.min = [-1, -0.1, -1];
                spawnItem.rotation = [0, 2, 0];
                spawnItem.translation = [spawnItem.translation[0] - 1, 0.3, spawnItem.translation[2] + 0.2]
                spawnItem.scale = [0.26, 0.26, 0.26];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[13])
                spawnItem.image = this.builder.spec.textures[20];
                break;
            case "tomato":
                spawnItem.aabb.max = [1, 0.1, 1];
                spawnItem.aabb.min = [-1, -0.1, -1];
                spawnItem.rotation = [0, 0, 0];
                spawnItem.translation = [spawnItem.translation[0], 0.23, spawnItem.translation[2]]
                spawnItem.scale = [0.5, 0.5, 0.5];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[12])
                spawnItem.image = this.builder.spec.textures[19];
                break;
            case "cucumber":
                spawnItem.aabb.max = [1, 0.1, 1];
                spawnItem.aabb.min = [-1, -0.1, -1];
                spawnItem.rotation = [0, 0, 0];
                spawnItem.translation = [spawnItem.translation[0], 0.1, spawnItem.translation[2]]
                spawnItem.scale = [0.9, 0.9, 0.9];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[11])
                spawnItem.image = this.builder.spec.textures[18];
                break;
            case "carrot":
                spawnItem.aabb.max = [1, 0.1, 1];
                spawnItem.aabb.min = [-1, -0.1, -1];
                spawnItem.rotation = [0, 0, -0.2];
                spawnItem.translation = [spawnItem.translation[0], -0.45, spawnItem.translation[2]]
                spawnItem.scale = [0.6, 0.6, 0.6];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[9])
                spawnItem.image = this.builder.spec.textures[16];
                break;
            case "eggplant":
                spawnItem.aabb.max = [1, 0.1, 1];
                spawnItem.aabb.min = [-1, -0.1, -1];
                spawnItem.rotation = [0, 0, 0];
                spawnItem.translation = [spawnItem.translation[0], 0.17, spawnItem.translation[2]]
                spawnItem.scale = [0.6, 0.6, 0.6];
                spawnItem.mesh = new Mesh(this.builder.spec.meshes[10])
                spawnItem.image = this.builder.spec.textures[17];
        }
        spawnItem.updateTransform();
        this.renderer.prepareForOneNode(spawnItem);
        this.scene.addNode(spawnItem);
        
        
        
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera, this.light,this.color);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }

    pause(){
        if (this.isPaused === false) {
            //console.log(this.camera.translation);
            this.audio(1);
            this.isPaused = true;
            document.getElementById('pause').style.display = 'block';
            document.exitPointerLock();
        }
        else{
            this.audio(0);
            this.isPaused = false;
            document.getElementById('pause').style.display = 'none';
            document.getElementById('volumeBox').style.display = 'none';
            document.getElementById('controlsBox').style.display = 'none';
            this.enableCamera();
        }
    }

    volume(){
        document.getElementById('pause').style.display = 'none';
        document.getElementById('volumeBox').style.display = 'block';
        document.getElementById('volumeSlider').addEventListener('mouseup', ev => {
            this.volumeLevel = document.getElementById('volumeSlider').value*0.01;
            this.adjustVolume();
        })
        document.getElementById('back2').addEventListener('click', ev => {
            document.getElementById('pause').style.display = 'block';
            document.getElementById('volumeBox').style.display = 'none';
        })
    }

    controls(){
        document.getElementById('pause').style.display = 'none';
        document.getElementById('controlsBox').style.display = 'block';
        document.getElementById('back1').addEventListener('click', ev => {
            document.getElementById('pause').style.display = 'block';
            document.getElementById('controlsBox').style.display = 'none';
        })
    }

    audio(x){
        this.mutePage();
        if (x === 0){
            document.getElementById('audioGame').volume = this.volumeLevel;
            document.getElementById('audioGame').play();
        }
        else if (x === 1){
            document.getElementById('audioPause').volume = this.volumeLevel;
            document.getElementById('audioPause').currentTime = 0;
            document.getElementById('audioPause').play();
        }
    }

    mutePage() {
        this.elems = document.querySelectorAll("audio");
        if(this.elems !== undefined) {
            [].forEach.call(this.elems, function (elem) {
                muteMe(elem);
            });
        }

        function muteMe(elem) {
            elem.pause();
        }
    }

    adjustVolume() {
        document.getElementById('audioGame').volume = this.volumeLevel;
        document.getElementById('audioPause').volume = this.volumeLevel;
    }

    plant(index) {
        if (this.player.chosenItemInventory.item.hasChildNodes() && !this.countingDowns[index]) {
            let src = this.player.chosenItemInventory.item.querySelector("img").src.split("/");
            let target = src[src.length - 1].split(".")[0]; 
            if (this.isTree(index)) {
                switch(target) {
                    case "appleSeeds":
                        this.setTimer(1, 0, index, target, "apple");
                        break;
                    case "bananaSeeds":
                        this.setTimer(3, 0, index, target, "banana");
                        break;
                    case "lemonSeeds":
                        this.setTimer(5, 0, index, target, "lemon");
                        break;
                    case "cherrySeeds":
                        this.setTimer(10, 0, index, target, "cherry");
                        break;
                    default:
                        if (target !== "apple" && target !== "banana" && target !== "lemon" && target !== "cherry" 
                            && target !== "tomato" && target !== "cucumber" && target !== "carrot" && target !== "eggplant")
                            this.popUpMessage(`You must choose a farm to plant ${target}!`);
                        else
                            this.popUpMessage(`You must choose a seed to be able to plant!`);
                }
            } else {
                switch(target) {
                    case "tomatoSeeds":
                        this.setTimer(1, 0, index, target, "tomato");
                        break;
                    case "cucumberSeeds":
                        this.setTimer(3, 0, index, target, "cucumber");
                        break;
                    case "carrotSeeds":
                        this.setTimer(5, 0, index, target, "carrot");
                        break;
                    case "eggplantSeeds":
                        this.setTimer(10, 0, index, target, "eggplant");
                        break
                    default:
                        if (target !== "apple" && target !== "banana" && target !== "lemon" && target !== "cherry" 
                            && target !== "tomato" && target !== "cucumber" && target !== "carrot" && target !== "eggplant")
                            this.popUpMessage(`You must choose a tree to plant ${target}!`);
                        else {
                            this.popUpMessage(`You must choose a seed to be able to plant!`);
                        }
                }
            }
        } else {
            this.popUpMessage(`You must choose a seed to be able to plant!`);
        }
    }

    popUpMessage(message) {
        document.getElementById("popUp").style.display = 'block';
        document.getElementById("popUp").innerText = message;
        setTimeout(() => {
            document.getElementById("popUp").style.display = 'none';
        }, 5000);
    }
    
    isTree(index) {
        switch (index) {
            case 223:
            case 225:
            case 227:
            case 245:
            case 247:
            case 249:
            case 267:
            case 269:
            case 271:
                return false;
            case 309:
            case 310:
            case 311:
            case 312:
            case 313:
            case 314:
            case 315:
            case 316:
            case 317:
                return true;
        }
    }

    price(target) {
        let price = 50;
        let unlocked = this.numberOfAlreadyUnlocked(target);
        if (unlocked >= 3 && unlocked < 6) {
            price = 100;
        } else if (unlocked >= 6) {
            price = 200;
        }
        return price;
    }

    numberOfAlreadyUnlocked(target) {
        let count = 0;
        if (target === "tree") {
            this.player.trees.forEach(tree => {
                if (tree) {
                    count++;
                }
            })
        } else if (target === "land") {
            this.player.farmland.forEach(land => {
                if (land) {
                    count++;
                }
            })
        }
        return count;
    }

    setTimer(m, s, index, target, harvestItem) {
        const timer = new Timer(m, s, this.dt, harvestItem, index);
        this.player.removeInventory(target, -1);
        document.querySelector(".timerHUD").style.display = 'block';
        document.getElementById("action").style.display = 'none';
        this.countingDowns.push(timer);
        this.addIcon('inventory');
    }

    harvest(target, index) {
        this.player.addInventory(target, 1);
        this.addIcon('inventory');
        this.scene.nodes.splice(index + 2, 1);
    }

    unlock(target, index) {
        let price = this.price(target);
        if (this.player.wallet >= price) {
            if (target === "tree") {
                this.player.unlockTree(index);
                this.scene.nodes[index + 2].name = "treeUnlocked";
                this.scene.nodes[index + 2].image = this.builder.spec.textures[9];
            } else if (target === "land") {
                this.player.unlockLand(index);
                this.scene.nodes[index + 2].name = "dirtUnlocked";
                this.scene.nodes[index + 2].image = this.builder.spec.textures[6];
            }
            this.player.spendMoney(-price);
            this.updateMoney();
            this.renderer.prepareForOneNode(this.scene.nodes[index + 2]);
            document.getElementById("popUp").style.display = 'none';
        }
        
    }

    shop() {
        this.updateMoney();
        if (document.getElementById('shopHUD').style.display === 'none') {
            document.getElementById('shopHUD').style.display = 'block';
            document.getElementById("action").style.display = 'none';
            this.isPaused = true;
            this.addIcon('inventory');
            document.exitPointerLock();
            this.addListenersInv();
            this.addListenersShop();
        } else {
            document.getElementById('shopHUD').style.display = 'none';
            document.getElementById("action").style.display = 'block';
            this.isPaused = false;
            
            this.enableCamera();
        }

    }

    updateMoney() {
        document.getElementById('money').textContent = this.player.wallet + "€";
    }
    chest() {
            if(document.getElementById('chestHUD').style.display === 'none') {
                document.getElementById('chestHUD').style.display = 'block';
                document.getElementById("action").style.display = 'none';
                this.isPaused = true;
                this.addIcon('chest');
                this.addIcon('inventory');
                document.exitPointerLock();
                this.addListeners();
            } else {
                document.getElementById('chestHUD').style.display = 'none';
                document.getElementById("action").style.display = 'block';
                this.isPaused = false;
                this.removeListeners();
                this.enableCamera();
            }
    }

    addListenersShop() {
        let chld = document.getElementById('shopHUD').children;
        for (let i in chld) {
            if (this.checkValue(chld[i].id)) {
                chld[i].addEventListener('click', ev => {
                    try {
                        this.player.spendMoney(-1 * this.checkValue(chld[i].id));
                        this.player.addInventory(chld[i].id, 1);
                        this.addIcon('inventory');
                        this.removeListeners();
                        this.addListenersInv();
                        this.addListenersShop();
                        this.updateMoney();
                    } catch (e) {
                        document.getElementById('info').textContent = "you are poor";
                    }
                });
                chld[i].addEventListener('mouseover', ev => {
                    document.getElementById('info').textContent = this.checkValue(chld[i].id) + "€";

                });
            }
        }
    }

    addListenersInv() {
        this.updateMoney();
        let count2 = 0;
        for (let j in this.player.inventory) {
            document.getElementById('hud-border').children[count2].addEventListener('click', ev => {
                this.player.removeInventory(j, -1);
                this.player.addMoney(this.checkValue(j));
                this.addIcon('inventory');
                this.removeListeners();
                this.addListenersShop();
                this.addListenersInv();
            });
            count2++;
        }
    }

    checkValue(fruit) {
        switch (fruit) {
            case 'apple':
                return 1;
            case 'appleSeeds':
                return 0.5;
            case 'banana':
                return 4;
            case 'bananaSeeds':
                return 1.5;
            case 'carrot':
                return 10;
            case 'carrotSeeds':
                return 4.5;
            case 'cherry':
                return 25;
            case 'cherrySeeds':
                return 9;
            case 'cucumber':
                return 4;
            case 'cucumberSeeds':
                return 1.5;
            case 'eggplant':
                return 25;
            case 'eggplantSeeds':
                return 9;
            case 'lemon':
                return 10;
            case 'lemonSeeds':
                return 4.5;
            case 'tomato':
                return 1;
            case 'tomatoSeeds':
                return 0.5;
        }
    }


    addListeners() {
        let count1 = 0;
        for(let i in this.player.storage){
            document.getElementById('chestHUD').children[count1].addEventListener('click', ev =>  {
                this.player.toInventoryFromChest(i);
                this.addIcon('chest');
                this.addIcon('inventory');
                this.removeListeners();
                this.addListeners();
            });
            count1++;
        }
        let count2 = 0;
        for(let j in this.player.inventory){
            document.getElementById('hud-border').children[count2].addEventListener('click', ev => {
                this.player.toChestFromInventory(j);
                this.addIcon('chest');
                this.addIcon('inventory');
                this.removeListeners();
                this.addListeners();
            });
            count2++;
        }
    }

    removeListeners() {
        for(let x = 0; x < 16; x++) {
            document.getElementById('chestHUD').children[x].replaceWith(document.getElementById('chestHUD').children[x].cloneNode(true));
        }
        for(let y = 0; y < 11; y++) {
            document.getElementById('hud-border').children[y].replaceWith(document.getElementById('hud-border').children[y].cloneNode(true));
        }
        for (let x = 0; x < 16; x++) {
            document.getElementById('shopHUD').children[x].replaceWith(document.getElementById('shopHUD').children[x].cloneNode(true));
        }
        for (let i = 0; i < 11; i++) {
            let item = document.getElementById(`item${i}`);
            this.inventoryItems[i] = item;
        }
        this.changeChosenItemInInventory(this.player.chosenItemInventory.index);
    }

    addIcon(hud){
        if (hud === 'chest') {
            let index = 0;
            let number = 0;
            for(let i in this.player.storage){
                if(this.player.storage[i] > 0){
                    switch (i) {
                        case 'apple':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['apple'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/apple.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'appleSeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['appleSeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/appleSeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'banana':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['banana'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/banana.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'bananaSeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['bananaSeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/bananaSeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'carrot':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['carrot'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/carrot.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'carrotSeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['carrotSeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/carrotSeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cherry':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['cherry'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/cherry.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cherrySeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['cherrySeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/cherrySeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cucumber':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['cucumber'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/cucumber.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cucumberSeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['cucumberSeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/cucumberSeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'eggplant':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['eggplant'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/eggplant.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'eggplantSeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['eggplantSeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/eggplantSeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'lemon':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['lemon'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/lemon.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'lemonSeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['lemonSeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/lemonSeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'tomato':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['tomato'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/tomato.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'tomatoSeeds':
                            document.getElementById('chestHUD').children[index].innerHTML = '';
                            number = this.player.storage['tomatoSeeds'];
                            document.getElementById('chestHUD').children[index].innerHTML = "<img src=./icons/tomatoSeeds.png class=storageIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                    }
                    index++;
                }
            }
            for(let x = index; x < 16; x++) {
                if(document.getElementById('chestHUD').children[x].innerHTML !== ''){
                    document.getElementById('chestHUD').children[x].innerHTML = '';
                }
            }
        }
        else if(hud === 'inventory'){
            let index = 0;
            let number = 0;
            for(let j in this.player.inventory){
                if(this.player.inventory[j] > 0){
                    switch (j) {
                        case 'apple':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['apple'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/apple.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'appleSeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['appleSeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/appleSeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'banana':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['banana'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/banana.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'bananaSeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['bananaSeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/bananaSeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'carrot':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['carrot'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/carrot.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'carrotSeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['carrotSeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/carrotSeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cherry':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['cherry'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/cherry.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cherrySeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['cherrySeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/cherrySeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cucumber':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['cucumber'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/cucumber.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'cucumberSeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['cucumberSeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/cucumberSeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'eggplant':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['eggplant'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/eggplant.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'eggplantSeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['eggplantSeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/eggplantSeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'lemon':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['lemon'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/lemon.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'lemonSeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['lemonSeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/lemonSeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'tomato':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['tomato'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/tomato.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                        case 'tomatoSeeds':
                            document.getElementById('hud-border').children[index].innerHTML = '';
                            number = this.player.inventory['tomatoSeeds'];
                            document.getElementById('hud-border').children[index].innerHTML = "<img src=./icons/tomatoSeeds.png class=inventoryIcon> <div class='count'>"+number.toString()+"</div>";
                            break;
                    }
                    index++;
                }
            }
            for(let y = index; y < 11; y++) {
                if(document.getElementById('hud-border').children[y].innerHTML !== null){
                    document.getElementById('hud-border').children[y].innerHTML = '';
                }
            }
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, 'enableCamera');
});
