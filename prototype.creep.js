'use strict';

const HITS_MIN=5000;
const HITS_IMPROVED=20000;
const HITS_NOW_WERE_COOKING_WITH_GAS=60000;
const HITS_NOW_WERE_SUCKIN_DIESEL=250000;

const STORAGE_TYPES=['extension', 'storage', 'container'];

Creep.prototype.findNearestOrLeastBusySource = function(roomInfo) {

    if (this.memory.targetSource) {
        return;
    }

    let bestChoiceEnergySource=null;
    // Count how many are heading to this vs how many slots it has
    // Allow default of available harvest points +1 to wait
    // After that, prefer the point with more available slots
    // X=slots, allowance=x+1, prefer higher slot number until allowance*1.5 is breached.
    let allEnergySources = null;
    // Make sure we only allow builders to pull from stores, and only if the room is far enough along to have broken 700 capacity, and we currently have more than 600 of that

    if (this.memory.role == 'builder' && this.memory.targetConstruction && roomInfo.energyCapacity >= 800 && roomInfo.fullExtensions && roomInfo.fullExtensions[0]) {
        // console.log('this is a builder, allow extensions as sources');
        allEnergySources = _.sortBy(roomInfo.fullExtensions, s => this.pos.getRangeTo(s));
        if (allEnergySources && allEnergySources.length>0) {
            this.memory.targetSource=allEnergySources[0].id;
            return;
        }
    }

    // Are we full blown statics?
    let fullBlownStatic=true;
    _.each(roomInfo.availableSources, function(source) {
        if (!Memory.dedicatedMiners[source.id]) {
            fullBlownStatic=false;
        }
    });

    if (fullBlownStatic && roomInfo.staticContainers.length>0) {
        let allStaticContainers = _.sortBy(roomInfo.staticContainers, s => this.pos.getRangeTo(s));
        _.each(allStaticContainers, function (staticContainer) {

            let creepAssignedToSourceCount = 0;
            _.each(roomInfo.creeps, function (harvestingCreep) {
                if (harvestingCreep.memory.targetSource && harvestingCreep.memory.targetSource == staticContainer.id) {
                    creepAssignedToSourceCount++;
                }
            });

           if (bestChoiceEnergySource=null) {
               bestChoiceEnergySource = {};
               bestChoiceEnergySource.source = staticContainer;
               bestChoiceEnergySource.score = creepAssignedToSourceCount;
           } else if (creepAssignedToSourceCount < bestChoiceEnergySource.score) {
               bestChoiceEnergySource.source = staticContainer;
               bestChoiceEnergySource.score = creepAssignedToSourceCount;
           }
        });
        bestChoiceEnergySource={};
        bestChoiceEnergySource.source=allSources[0];
    } else {

        if (!allEnergySources || !allEnergySources[0]) {
            allEnergySources = _.sortBy(roomInfo.availableSources, s => this.pos.getRangeTo(s));
        }

        _.each(allEnergySources, function (source) {
            let targetSource = source;
            // console.log('check source ' + targetSource.id);
            let creepAssignedToSourceCount = 0;
            _.each(roomInfo.creeps, function (harvestingCreep) {
                if (harvestingCreep.memory.targetSource && harvestingCreep.memory.targetSource == targetSource.id) {
                    creepAssignedToSourceCount++;
                }
            });

            let targetPos = targetSource.pos;

            let creepAllowanceForSource = Game.rooms[roomInfo.name].countAccessibleSpacesAroundPoint(targetPos) + 1;
            let creepOverflowForSource = source.accessibleSpaces * 1.5;

            if (bestChoiceEnergySource == null) {
                // We have nothing, so ANYTHING is the best choice
                bestChoiceEnergySource = {};
                bestChoiceEnergySource.source = targetSource;
                bestChoiceEnergySource.score = creepAssignedToSourceCount / creepAllowanceForSource;
                bestChoiceEnergySource.overFlowScore = creepAssignedToSourceCount / creepOverflowForSource;
                bestChoiceEnergySource.spaces = creepAllowanceForSource - creepAssignedToSourceCount;
            } else if (bestChoiceEnergySource.spaces <= 0) {
                // Only come in here if the source we've chosen, is tight on spaces

                let sourceScore = creepAssignedToSourceCount / creepAllowanceForSource;
                let sourceOverFlowScore = creepAssignedToSourceCount / creepOverflowForSource;
                // console.log('Score for '+bestChoiceSource.source.id+': '+bestChoiceSource.score);
                // console.log('Score for '+source.id+': '+sourceScore);

                if (sourceScore < bestChoiceEnergySource.score || sourceOverFlowScore < bestChoiceEnergySource.overFlowScore) {
                    bestChoiceEnergySource.source = targetSource;
                    bestChoiceEnergySource.score = creepAssignedToSourceCount / creepAllowanceForSource;
                    bestChoiceEnergySource.overFlowScore = creepAssignedToSourceCount / creepOverflowForSource;
                    bestChoiceEnergySource.spaces = creepAllowanceForSource - creepAssignedToSourceCount;
                }
            }
        });

    }

    if(bestChoiceEnergySource){
        // todo pick container of source with miner
        let container=Game.rooms[roomInfo.name].locateContainersAroundPoint(bestChoiceEnergySource.source.pos, roomInfo.structures);
        if (container && (Memory.dedicatedMiners[bestChoiceEnergySource.source.id] || container.store.energy > this.carryCapacity)) {
            this.memory.targetSource=container.id;
        }else {
            this.memory.targetSource=bestChoiceEnergySource.source.id;
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

        if (targetSource) {
            if (!this.pos.isNearTo(targetSource.pos)) {
                this.moveTo(targetSource);
            } else {

                if (_.contains(STORAGE_TYPES, targetSource.structureType)) {
                    harvestResult = this.withdraw(targetSource, RESOURCE_ENERGY);
                    if (harvestResult == ERR_NOT_IN_RANGE) {
                        this.moveTo(targetSource);
                    }
                } else {
                    harvestResult = this.harvest(targetSource);
                    if (harvestResult == ERR_NOT_IN_RANGE) {
                        this.moveTo(targetSource);
                    }
                }

                if (harvestResult == ERR_NOT_ENOUGH_RESOURCES ) {
                    delete this.memory.targetSource;
                }

            }
        }

        if (this.carry.energy == this.carryCapacity && this.memory.role != 'staticHarvester') {
            delete this.memory.targetSource;
        }
    }
    return harvestResult;
};

Creep.prototype.depositEnergy = function(roomInfo) {
    let dropoffResult=0;
    if(this.memory.targetDropoff) {

        let targetDropoff = Game.getObjectById(this.memory.targetDropoff);

        if(targetDropoff) {
            // Let's make sure it's still a valid energy dump
            if (!targetDropoff.structureHasSpaceForEnergy()) {
                targetDropoff = this.findBestEnergyDump(roomInfo);
                if (!targetDropoff) {
                    // console.log(this+ ' had a target but its full now??');
                }
            }

            if (targetDropoff) {

                if (!targetDropoff.pos) {
                    console.log('ERROR: ' + this + ' was given a target dropoff (' + JSON.stringify(targetDropoff) + ') with no POS???');
                }

                if (!this.pos.isNearTo(targetDropoff.pos)) {
                    this.moveTo(targetDropoff);
                } else {
                    // Creep could get stuck at the source if everything is full, move to the dump regardless and wait
                    // console.log(creep.transfer(targetDropoff, RESOURCE_ENERGY));
                    dropoffResult = this.transfer(targetDropoff, RESOURCE_ENERGY);

                    if (dropoffResult == ERR_INVALID_TARGET ||
                        dropoffResult == ERR_FULL) {
                        delete this.memory.targetDropoff;
                    }

                    // If we dropped off but have energy left over, it filled, let's look for another site, towers doing upgrades trapped harvesters in a deposit loop
                    // We need to immediately find the new source though so the creep doesn't enter an idle state
                    if (dropoffResult == OK && this.carry.energy > 0) {
                        console.log(this+' dropped off ok but still has energy, needs a new dropoff');
                        delete this.memory.targetDropoff;
                        this.findBestEnergyDump(roomInfo);
                    }
                }
            }
        }

        if (this.carry.energy == 0) {
            delete this.memory.targetDropoff;
        }
    }
    return dropoffResult;
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
            return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity*.4))
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
        delete this.memory.targetSource;
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
        this.memory.targetConstruction=target.site.id;

        if (this.carry.energy>0) {
            this.memory.building=true;
        } else {
            this.memory.building=false;
        }
    } else {
        // creep.say('no builds');
        this.memory.building=false;
    }
};

Creep.prototype.buildStructure = function(roomInfo) {
    if(this.memory.targetConstruction) {

        let targetConstruction = Game.getObjectById(this.memory.targetConstruction);
        if(targetConstruction && targetConstruction.pos) {

            if (this.pos.isNearTo(targetConstruction.pos)) {

                let buildResult=this.build(targetConstruction);

                console.log(buildResult);
                if (buildResult == ERR_NOT_IN_RANGE) {
                    this.moveTo(targetConstruction);
                }

                if (buildResult == ERR_INVALID_TARGET) {
                    delete this.memory.targetConstruction;
                    delete this.memory.building;
                }
            }else {
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

Creep.prototype.currentlyHarvesting = function() { return this.memory.targetSource; };
Creep.prototype.currentlyBuilding = function() { return this.memory.building; };
Creep.prototype.currentlyDepositing = function() { return this.memory.targetDropoff; };
Creep.prototype.currentlyUpgrading = function() { return this.memory.upgrading; };

Creep.prototype.hasNoPurposeInLife = function() {
    return !this.currentlyHarvesting() && !this.currentlyBuilding() && !this.currentlyDepositing() && !this.currentlyUpgrading();
};

Creep.prototype.getABasicJob = function(roomInfo) {
    console.log(this+' is bone idle');
    if(this.carry.energy < this.carryCapacity) {
        this.findNearestOrLeastBusySource(roomInfo);
    }
    if(this.carry.energy == this.carryCapacity) {
        this.findBestEnergyDump(roomInfo);
    }
    console.log(JSON.stringify(this));
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