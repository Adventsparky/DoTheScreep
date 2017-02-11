'use strict';

Creep.prototype.findNearestOrLeastBusySource = function(room) {

    let bestChoiceSource=null;
    // Count how many are heading to this vs how many slots it has
    // Allow default of available harvest points +1 to wait
    // After that, prefer the point with more available slots
    // X=slots, allowance=x+1, prefer higher slot number until allowance*1.5 is breached.
    let allSources = null;
    // Make sure we only allow builders to pull from stores, and only if the room is far enough along to have broken 700 capacity, and we currently have more than 600 of that

    if (this.memory.role == 'builder' && room.energyCapacity >= 800 && room.energyAvailable >=  600 && room.fullExtensions && room.fullExtensions[0]) {
        // console.log('this is a builder, allow extensions as sources');
        allSources = _.sortBy(_.union(room.availableSources, room.fullExtensions), s => this.pos.getRangeTo(s));
    }

    if (!allSources || !allSources[0]) {
        allSources = _.sortBy(room.availableSources, s => this.pos.getRangeTo(s));
    }

    _.each(allSources, function(source) {
        let targetSource=source;
        // console.log('check source ' + targetSource.id);
        let creepAssignedToSourceCount = 0;
        _.each(room.creeps, function (harvestingCreep) {
            if (harvestingCreep.memory.targetSource && harvestingCreep.memory.targetSource == targetSource.id) {
                creepAssignedToSourceCount++;
            }
        });

        let creepAllowanceForSource = room.countAccessibleSpacesAroundPoint(targetSource.pos) + 1;
        let creepOverflowForSource = source.accessibleSpaces * 1.5;


        if (bestChoiceSource == null) {
            // We have nothing, so ANYTHING is the best choice
            bestChoiceSource={};
            bestChoiceSource.source=targetSource;
            bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
            bestChoiceSource.overFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
            bestChoiceSource.spaces=creepAllowanceForSource - creepAssignedToSourceCount;
        } else if (bestChoiceSource.spaces <= 0) {
            // Only come in here if the source we've chosen, is tight on spaces

            let sourceScore=creepAssignedToSourceCount / creepAllowanceForSource;
            let sourceOverFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
            // console.log('Score for '+bestChoiceSource.source.id+': '+bestChoiceSource.score);
            // console.log('Score for '+source.id+': '+sourceScore);

            if (sourceScore < bestChoiceSource.score || sourceOverFlowScore < bestChoiceSource.overFlowScore){
                bestChoiceSource.source=targetSource;
                bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
                bestChoiceSource.overFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
                bestChoiceSource.spaces=creepAllowanceForSource - creepAssignedToSourceCount;
            }
        }

        // console.log(source);
        // console.log(JSON.stringify(source));
        // console.log(source.structureType);
        // console.log(source.structureType == STRUCTURE_EXTENSION);
        // if (source.structureType && source.structureType == STRUCTURE_EXTENSION) {
        bestChoiceSource.source.extension = false;
        // }
    });

    if(bestChoiceSource){
        // todo pick container of source with miner
        // console.log(creep+ ' choosing '+bestChoiceSource.source.id);
        // console.log(JSON.stringify(bestChoiceSource.source));
        // console.log(bestChoiceSource.source.container);

        // if (bestChoiceSource.extension) {
        //     creep.memory.targetStorageSource=bestChoiceSource.source.id;
        //     delete creep.memory.targetSource;
        // }

        if (bestChoiceSource.source) {
            if (bestChoiceSource.source.extension) {
                this.memory.targetStorageSource=bestChoiceSource.source.id;
                delete this.memory.targetSource;
            } else if (bestChoiceSource.source.container) {
                this.memory.targetStorageSource=bestChoiceSource.source.container.id;
                delete this.memory.targetSource;
            } else {
                this.memory.targetSource=bestChoiceSource.source.id;
                delete this.memory.targetStorageSource;
            }
        }

        delete this.memory.targetDropoff; // This will only be for harvesters
    } else {
        console.log('Could not find a best choice source?? What??');
    }
}

Creep.prototype.collectEnergy = function() {
    let harvestResult=OK;
    if (this.memory.targetSource) {
        let targetSource = Game.getObjectById(this.memory.targetSource);
        if(targetSource){
            harvestResult=this.harvest(targetSource);
            if(harvestResult == ERR_NOT_IN_RANGE) {
                this.moveTo(targetSource);
            }
        }
    } else if (this.memory.targetStorageSource) {
        let targetStorage = Game.getObjectById(this.memory.targetStorageSource);
        if(targetStorage){
            harvestResult=this.withdraw(targetStorage, RESOURCE_ENERGY);
            if(harvestResult == ERR_NOT_IN_RANGE) {
                this.moveTo(targetStorage);
            }
        }
    }
    return harvestResult;
}

Creep.prototype.depositEnergy = function(room) {
    if(this.memory.targetDropoff) {
        let targetDropoff = Game.getObjectById(this.memory.targetDropoff);
        // Let's make sure it's still a valid energy dump
        if(!this.structureHasSpaceForEnergy(targetDropoff)) {
            targetDropoff = this.findBestEnergyDump(this, room);
        }

        // Creep could get stuck at the source if everything is full, move to the dump regardless and wait
        // console.log(creep.transfer(targetDropoff, RESOURCE_ENERGY));
        let transferResult=this.transfer(targetDropoff, RESOURCE_ENERGY);
        if(transferResult == ERR_NOT_IN_RANGE) {
            this.moveTo(targetDropoff);
        } else if(transferResult == ERR_INVALID_TARGET ||
            transferResult == ERR_FULL) {
            delete this.targetDropoff;
        }
    }
}

Creep.prototype.findBestEnergyDump = function(room) {
    // console.log(creep);
    // console.log(creep.room.name);
    let potentialDropOffsInThisRoom = room.structures;
    let dropOffStructures = _.filter(potentialDropOffsInThisRoom, function (structure) {
        return structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity;
    });
    let towers=false;
    if(dropOffStructures.length == 0) {
        dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
            return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity*.3))
        });
        if (dropOffStructures.length > 0) {
            towers=true;
        }
    }
    if(dropOffStructures.length == 0) {
        dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
            return structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
        });
    }
    if(dropOffStructures.length == 0) {
        dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
            return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity)
        });
    }
    if(dropOffStructures.length == 0) {
        dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
            return structure.structureType == STRUCTURE_CONTROLLER
        });
    }


    if(dropOffStructures.length > 0) {
        let target=false;
        if (towers) {
            console.log(' drop off in tower');
            target = _.reduce(dropOffStructures, function(result, structure) {
                let energy=structure.energy;
                console.log('This energy: '+energy);
                console.log(JSON.stringify(result));
                console.log('Result energy: '+result.energy);
                if(result && result.energy < energy) {
                    return result;
                }
                return {energy: energy, structure: structure}
            },{energyAvailable: 1000});
        } else {
            target = _.reduce(dropOffStructures, function(result, structure) {
                let range=this.pos.getRangeTo(structure);
                if(result && result.range < range) {
                    return result;
                }
                return {range: range, structure: structure}
            },{range: 99999});
        }
        if(target) {
            // console.log('Chose '+JSON.stringify(target)+' for '+creep.name);
            this.memory.targetDropoff=target.structure.id
        }
    } else{
        this.say('no dumps');
    }
}

Creep.prototype.upgradeControllerInRoom = function(room) {
    if(this.upgradeController(room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(room.controller);
    }
}