'use strict';

Structure.prototype.structureHasSpaceForEnergy = function () {
    if(this.structureType == STRUCTURE_CONTAINER || this.structureType == STRUCTURE_STORAGE) {
        return _.sum(this.store) < this.storeCapacity;
    }
    return this.energy < this.energyCapacity;
}
