'use strict';

const HITS_MIN=5000;
const HITS_IMPROVED=20000;
const HITS_NOW_WERE_COOKING_WITH_GAS=60000;
const HITS_NOW_WERE_SUCKIN_DIESEL=250000;

const STORAGE_TYPES=['extension', 'storage', 'container'];

Creep.prototype.findNearestOrLeastBusySource = function(roomInfo) {

    let bestChoiceSource=null;
    // Count how many are heading to this vs how many slots it has
    // Allow default of available harvest points +1 to wait
    // After that, prefer the point with more available slots
    // X=slots, allowance=x+1, prefer higher slot number until allowance*1.5 is breached.
    let allSources = null;
    // Make sure we only allow builders to pull from stores, and only if the room is far enough along to have broken 700 capacity, and we currently have more than 600 of that

    if (this.memory.role == 'builder' && this.memory.targetConstruction && roomInfo.energyCapacity >= 800 && roomInfo.energyAvailable >=  600 && roomInfo.fullExtensions && roomInfo.fullExtensions[0]) {
        // console.log('this is a builder, allow extensions as sources');
        allSources = _.sortBy(_.union(roomInfo.availableSources, roomInfo.fullExtensions), s => this.pos.getRangeTo(s));
    }

    if (!allSources || !allSources[0]) {
        allSources = _.sortBy(roomInfo.availableSources, s => this.pos.getRangeTo(s));
    }

    bestChoiceSource={};
bestChoiceSource.source=allSources[0];
    // _.each(allSources, function(source) {
    //     let targetSource=source;
    //     // console.log('check source ' + targetSource.id);
    //     let creepAssignedToSourceCount = 0;
    //     _.each(roomInfo.creeps, function (harvestingCreep) {
    //         if (harvestingCreep.memory.targetSource && harvestingCreep.memory.targetSource == targetSource.id) {
    //             creepAssignedToSourceCount++;
    //         }
    //     });
    //
    //     let creepAllowanceForSource = Game.rooms[roomInfo.name].countAccessibleSpacesAroundPoint(targetSource.pos) + 1;
    //     let creepOverflowForSource = source.accessibleSpaces * 1.5;
    //
    //
    //     if (bestChoiceSource == null) {
    //         // We have nothing, so ANYTHING is the best choice
    //         bestChoiceSource={};
    //         bestChoiceSource.source=targetSource;
    //         bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
    //         bestChoiceSource.overFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
    //         bestChoiceSource.spaces=creepAllowanceForSource - creepAssignedToSourceCount;
    //     } else if (bestChoiceSource.spaces <= 0) {
    //         // Only come in here if the source we've chosen, is tight on spaces
    //
    //         let sourceScore=creepAssignedToSourceCount / creepAllowanceForSource;
    //         let sourceOverFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
    //         // console.log('Score for '+bestChoiceSource.source.id+': '+bestChoiceSource.score);
    //         // console.log('Score for '+source.id+': '+sourceScore);
    //
    //         if (sourceScore < bestChoiceSource.score || sourceOverFlowScore < bestChoiceSource.overFlowScore){
    //             bestChoiceSource.source=targetSource;
    //             bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
    //             bestChoiceSource.overFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
    //             bestChoiceSource.spaces=creepAllowanceForSource - creepAssignedToSourceCount;
    //         }
    //     }
    // });

    if(bestChoiceSource){
        // todo pick container of source with miner
        let container=Game.rooms[roomInfo.name].locateContainersAroundPoint(bestChoiceSource.source.pos, roomInfo.structures);
        console.log(container);
        if (container && Memory.dedicatedMiners[bestChoiceSource.source.id]) {
            this.memory.targetStorageSource=bestChoiceSource.source.id;
            delete this.memory.targetSource;
        }else {
            this.memory.targetSource=bestChoiceSource.source.id;
            delete this.memory.targetStorageSource;
        }

        delete this.memory.targetDropoff; // This will only be for harvesters
    } else {
        console.log('Could not find a best choice source?? What??');
    }
};

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
        if(targetStorage && (targetStorage.energy > (this.energyCapacity - this.energy))){
            harvestResult=this.withdraw(targetStorage, RESOURCE_ENERGY);
            if(harvestResult == ERR_NOT_IN_RANGE) {
                this.moveTo(targetStorage);
            }
        }
    }
    return harvestResult;
};

Creep.prototype.depositEnergy = function(roomInfo) {
    if(this.memory.targetDropoff) {
        let targetDropoff = Game.getObjectById(this.memory.targetDropoff);
        // Let's make sure it's still a valid energy dump
        if(!targetDropoff.structureHasSpaceForEnergy()) {
            targetDropoff = this.findBestEnergyDump(roomInfo);
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
};

Creep.prototype.findBestEnergyDump = function(roomInfo) {
    // console.log(creep);
    // console.log(creep.room.name);
    let potentialDropOffsInThisRoom = roomInfo.structures;
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
        let currentPos=this.pos;
        if (towers) {
            target = _.reduce(dropOffStructures, function(result, structure) {
                let energy=structure.energy;
                if(result && result.energy < energy) {
                    return result;
                }
                return {energy: energy, structure: structure}
            },{energyAvailable: 1000});
        } else {
            target = _.reduce(dropOffStructures, function(result, structure) {
                let range=currentPos.getRangeTo(structure);
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
};

Creep.prototype.upgradeControllerInRoom = function() {
    if(this.room.controller && this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller);
    }
};

Creep.prototype.findNearestConstructionTowerContainerExtensionRampartWall = function(roomInfo) {
    let sites = roomInfo.myconstructionsites;

    let potentialConstructions = _.filter(sites, function(constructionSite) {
        return constructionSite.structureType == STRUCTURE_TOWER;
    });
    if(potentialConstructions.length == 0) {
        potentialConstructions = _.filter(sites, function(constructionSite) {
            return constructionSite.structureType == STRUCTURE_CONTAINER;
        });
    }

    if(potentialConstructions.length == 0) {
        potentialConstructions = _.filter(sites, function(constructionSite) {
            return constructionSite.structureType == STRUCTURE_EXTENSION ||
                constructionSite.structureType == STRUCTURE_RAMPART ||
                constructionSite.structureType == STRUCTURE_WALL;
        });
    }
    // console.log(potentialConstructions);

    if(potentialConstructions.length == 0) {
        potentialConstructions=sites;
    }

    if(potentialConstructions.length > 0) {
        let creepPos=this.pos;
        let target = _.reduce(potentialConstructions, function(result, site) {
            let range=creepPos.getRangeTo(site);
            if(result && result.range < range) {
                return result;
            }
            return {range: range, site: site}
        },{range: 99999});
        // console.log('Chose '+JSON.stringify(target)+' for '+creep.name);
        this.memory.targetConstruction=target.site.id
    } else {
        // creep.say('no builds');
    }
};

Creep.prototype.buildNearestStructure = function(roomInfo) {
    if(this.memory.targetConstruction) {
        let targetConstruction = Game.getObjectById(this.memory.targetConstruction);
        if(targetConstruction) {
            if (this.build(targetConstruction) == ERR_NOT_IN_RANGE) {
                this.moveTo(targetConstruction);
            }
        } else{
            delete this.memory.targetConstruction;
            delete this.memory.building;
        }
    } else{
        delete this.memory.building;
        // If we've no towers, repair
        if (!roomInfo.towers) {
            this.repairNearestStructure();
        }
    }
};

Creep.prototype.repairNearestStructure = function() {
    // Prioritise towers
    let closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER && (structure.hits < HITS_MIN && structure.hits < structure.hitsMax);
        }
    });
    if(!closestDamagedStructure) {
        closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < HITS_MIN && structure.hits < structure.hitsMax);
            }
        });
    }
    if(!closestDamagedStructure) {
        // Try again with higher threshold
        closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < HITS_IMPROVED && structure.hits < structure.hitsMax);
            }
        });
    }
    if(!closestDamagedStructure) {
        // Try again with higher threshold
        closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < HITS_NOW_WERE_COOKING_WITH_GAS && structure.hits < structure.hitsMax);
            }
        });
    }
    if(!closestDamagedStructure) {
        // Try again with higher threshold
        closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < HITS_NOW_WERE_SUCKIN_DIESEL && structure.hits < structure.hitsMax);
            }
        });
    }
    if(closestDamagedStructure) {
        // console.log('Repair closest ' + closestDamagedStructure);
        let status = this.repair(closestDamagedStructure);
        if(status == ERR_NOT_IN_RANGE) {
            this.moveTo(closestDamagedStructure);
        } else {
            this.say('Repairing')
        }
    } else {
        this.say('Nothing to repair, I\'ll dump');
        // this.findBestEnergyDump(creep);
    }
};