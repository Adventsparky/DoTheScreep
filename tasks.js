const manCave=Game.spawns.Bastion;
const HITS_MIN=5000;
const HITS_IMPROVED=10000;
const HITS_NOW_WERE_SUCKIN_DIESEL=40000;

module.exports = {

    /*
     * ENERGY COLLECTION
     */
    collectNearestEnergy: function(creep) {
        let closestSource=creep.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },
    collectNearestEnergyToHomeBase: function(creep) {
        let closestSource=manCave.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },

    /*
     * ENERGY DUMPING
     */
    dumpEnergyAtBase: function(creep) {
        if(creep.transfer(manCave, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(manCave);
        }
    },
    dumpEnergyIntoExtension: function(creep, extension) {
        if(creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(extension);
        }
    },
    upgradeController: function(creep) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    },
    pickBestEnergyDump: function(creep) {
        let dropOffStructures = _.filter(Memory.structures, function(structure) {
                return structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity;
            });
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(Memory.structures, function(structure) {
                return structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
            });
        }
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(Memory.structures, function(structure) {
                return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity) ||
                    // (structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity) ||
                    (structure.structureType == STRUCTURE_CONTROLLER)
            });
        }
        // console.log('Potential drop-off structures');
        // console.log(dropOffStructures);
        // console.log('---');
        // if(dropOffStructures.length > 0) {
        //     let target = _.reduce(dropOffStructures, function(result, structure) {
        //         let range=creep.pos.getRangeTo(structure);
        //         if(result && result.range < range) {
        //             return result;
        //         }
        //         return {range: range, structure: structure}
        //     },{range: 99999});
        //     creep.memory.dropoff =  target.structure.id
        // } else{
        //  creep.say('aw snap girrl');
        // }
        if(manCave.energy >= (manCave.energyCapacity-(manCave.energyCapacity*.05))){
            // let closestUnfilledExtension=_.filter(Game.structures, function(structure) {
            //     return  structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
            // });
            let closestUnfilledExtension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return typeof(structure.energyCapacity)!=='undefined' && structure.energy < structure.energyCapacity && structure.structureType == STRUCTURE_EXTENSION;
                }
            });

            if(closestUnfilledExtension){
                this.dumpEnergyIntoExtension(creep, closestUnfilledExtension);
            } else {
                this.upgradeController(creep);
            }
        } else{
            this.dumpEnergyAtBase(creep);
        }
    },

    /*
     * CONSTRUCTION
     */
    buildingTypeAvailable: function(type) {
        return _.filter(Memory.structures, function(structure){ return structure.structureType == type; }).length < CONTROLLER_STRUCTURES[type][manCave.room.controller.level];
    },
    buildingTypeAffordable: function(type) {
        return _.filter(Memory.structures, function(structure){ return this.energyAvailablestructure.structureType == type; }).length >= CONSTRUCTION_COST[type];
    },
    buildNearestStructure: function(creep) {

        let closestBuildingSite=creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(closestBuildingSite) {
            if (creep.build(closestBuildingSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestBuildingSite);
            }
        } else{
            this.repairNearestStructure(creep);
        }
    },
    repairNearestStructure: function(creep) {
        let closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < HITS_MIN && structure.hits < structure.hitsMax);
            }
        });
        if(!closestDamagedStructure) {
            // Try again with higher threshold
            closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < HITS_IMPROVED && structure.hits < structure.hitsMax);
                }
            });
        }
        if(!closestDamagedStructure) {
            // Try again with higher threshold
            closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < HITS_NOW_WERE_SUCKIN_DIESEL && structure.hits < structure.hitsMax);
                }
            });
        }
        if(closestDamagedStructure) {
            console.log('Repair closest ' + closestDamagedStructure);
            let status = creep.repair(closestDamagedStructure);
            if(status == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestDamagedStructure);
            } else {
                creep.say('Repairing')
            }
        } else {
            creep.say('Nothing to repair, I\'ll dump');
            this.pickBestEnergyDump(creep);
        }
    },

    /*
     * UTILS
     */
    clearMemoryOfDeadCreeples: function() {
        for (let name in Memory.creeps) {
            if(Memory.creeps.hasOwnProperty(name)) {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name];
                    console.log('Clearing non-existing creep memory:', name);
                }
            }
        }
    },

    /*
     * CREEPLE MANAGEMENT
     */
    performCreepleCensusByRole: function(role) {
        let creepleCountForRole = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
        if(creepleCountForRole.length < role.minRoomPopulation) {
            manCave.createCreep(role.parts,undefined, {role: role.role});
            return false;
        }
        return true;
    }
};