export class Player {
    constructor(chosenItem, wallet, inventory, storage, trees, farmland) {
        this.chosenItemInventory = chosenItem;
        this.wallet = wallet;
        this.inventory = inventory;
        this.storage = storage;
        this.trees = trees;
        this.farmland = farmland;
    }

    //Prejme samo pozitivno da ne bo kdo ponesre� probal dodajat negativno
    addInventory(seed, amount) {
        if (amount < 0) {
            throw "Trying to add negative amount";
        } else if (Object.keys(this.inventory).length < 11){
            if (seed in this.inventory) {
                this.inventory[seed] += amount;
            } else {
                this.inventory[seed] = amount;
            }
        }
    }

    //Prejme samo negativno
    removeInventory(seed, amount) {
        if (amount > 0) {
            throw "Trying to remove positive amount";
        }
        if (seed in this.inventory && this.inventory[seed] >= -1*amount) {
            this.inventory[seed] += amount;
        } else { 
            throw "Do not have sufficient amount"
        }
        if (this.inventory[seed] <= 0) {
            delete this.inventory[seed];
        }
    }

    //Prejme indekse katera drevesa odkleniti
    unlockTree(index) {
        switch (index) {
            case 308:
                index = 0;
                break;
            case 309:
                index = 1;
                break;
            case 310:
                index = 2;
                break;
            case 311:
                index = 3;
                break;
            case 312:
                index = 4;
                break;
            case 313:
                index = 5;
                break;
            case 314:
                index = 6;
                break;
            case 315:
                index = 7;
                break;
            case 316:
                index = 8;
                break;
        }
        if (!this.trees[index]) {
            this.trees[index] = true;
        } else {
            throw "trying to unlock an unlocked tree";
        }
    }

    //Indeksi dreves za zaklent
    lockTrees(index) {
        for (const i in index) {
            if (!this.trees[index[i]]) {
                this.trees[index[i]] = false;
            } else {
                throw "trying to lock an locked tree";
            }
        }
    }

    //Prejme indekse katera farm odkleniti
    unlockLand(index) {
        switch (index) {
            case 223:
                index = 0;
                break;
            case 225:
                index = 1;
                break;
            case 227:
                index = 2;
                break;
            case 245:
                index = 3;
                break;
            case 247:
                index = 4;
                break;
            case 249:
                index = 5;
                break;
            case 267:
                index = 6;
                break;
            case 269:
                index = 7;
                break;
            case 271:
                index = 8;
                break;
        }
        if (!this.farmland[index]) {
            this.farmland[index] = true;
        } else {
            throw "trying to unlock an unlocked farm";
        }
    }

    //Indeksi farm za zaklent
    lockFarms(index) {
            if (!this.farmland[index]) {
                this.farmland[index] = false;
            } else {
                throw "trying to lock an locked farm";
            }
    }

    addMoney(amount) {
        if (amount < 0) {
            throw "you tried adding negative amount of money";
        }
        this.wallet += amount;
    }

    //prejema negativne vrednosti!!
    spendMoney(amount) {
        if (amount > 0) {
            throw "you tried subtracting positive amount of money";
        }
        if (-amount > this.wallet) {
            throw "you cannot afford this";
        }
        this.wallet += amount;
    }

    toInventoryFromChest(i) {
        if(i in this.inventory){
            this.inventory[i] += 1;
            this.storage[i] -= 1;
        }
        else if (Object.keys(this.inventory).length < 11){
            this.inventory[i] = 1;
            this.storage[i] -= 1;
        }
        if(this.storage[i] < 1){
            delete this.storage[i];
        }
    }

    toChestFromInventory(i) {
        if(i in this.storage){
            this.storage[i] += 1;
            this.inventory[i] -= 1;
        }
        else if (Object.keys(this.storage).length < 16){
            this.storage[i] = 1;
            this.inventory[i] -= 1;
        }
        if(this.inventory[i] < 1){
            delete this.inventory[i];
        }
    }

}