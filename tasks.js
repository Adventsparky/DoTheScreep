const Query=require('data');
const HITS_MIN=5000;
const HITS_IMPROVED=10000;
const HITS_NOW_WERE_SUCKIN_DIESEL=40000;

module.exports = {

    /*
     * ENERGY
     */
    collectNearestEnergy: function(creep) {
        let closestSource=creep.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },
    collectNearestEnergyToHomeBase: function(creep) {
        let closestSource=Query.spawnInCreepRoom(creep).pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },

    /*
     * ENERGY DUMPING
     */
    dumpEnergyAtBase: function(creep) {
        if(creep.transfer(Query.spawnInCreepRoom(creep), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Query.spawnInCreepRoom(creep));
        }
    },
    dumpEnergyIntoExtension: function(creep, extension) {
        if(creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(extension);
        }
    },
    upgradeController: function(creep) {
        if(creep.upgradeController(Query.controllerInCreepRoom(creep)) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Query.controllerInCreepRoom(creep));
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
        // console.log('dump in spawn?');
        // console.log(Query.spawnInCreepRoom(creep).energy);
        // console.log(Query.spawnInCreepRoom(creep).energyCapacity-(Query.spawnInCreepRoom(creep).energyCapacity*.05));
        if(!Query.spawnInCreepRoom(creep) && Query.spawnInCreepRoom(creep).energy >= (Query.spawnInCreepRoom(creep).energyCapacity-(Query.spawnInCreepRoom(creep).energyCapacity*.05))){
            // let closestUnfilledExtension=_.filter(Game.structures, function(structure) {
            //     return  structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
            // });
            let closestUnfilledExtension = Query.spawnInCreepRoom(creep).pos.findClosestByPath(FIND_STRUCTURES, {
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
            // console.log('lets dump to base');
            this.dumpEnergyAtBase(creep);
        }
    },

    /*
     * CONSTRUCTION
     */
    buildingTypeAvailable: function(type, room) {
        return _.filter(Memory.structures, function(structure){ return structure.structureType == type; }).length < CONTROLLER_STRUCTURES[type][room.controller.level];
    },
    // Pointless check, it's not paid from spawn, it's filled
    // buildingTypeAffordable: function(type) {
    //     return this.energyAvailable() >= CONSTRUCTION_COST[type];
    // },
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
            // console.log('Repair closest ' + closestDamagedStructure);
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
        for(let roomId in Memory.roomInfo){
            if(Memory.roomInfo.hasOwnProperty(roomId)) {
                let room = Memory.roomInfo[roomId];
                    if(room.spawn != undefined && room.spawn.length) {
                        console.log('Check role: '+role.role);
                        let creepleCountForRole = 0;
                        console.log(room.creeps);
                        if(room.creeps !== undefined && room.creeps.length) {
                            creepleCountForRole = _.filter(room.creeps, function (creep) {
                                console.log(creep);
                                console.log(creep[0]);
                                if(creep.memory.role == undefined){
                                    return {};
                                }
                                return creep.memory.role == role.role;
                            }).length;
                        }

                        if (creepleCountForRole === undefined) {
                            creepleCountForRole = 0;
                        }

                        console.log('Found '+creepleCountForRole+' creeple');

                        if (creepleCountForRole < role.minRoomPopulation) {
                            console.log('need to spawn a ' + role.role);
                            room.spawn[0].createCreep(role.parts, undefined, {role: role.role});
                            return false;
                        }
                    }
            }

        }

        // if(!(Game.time % 5)) {
        //     let roomPopSummary = 'No cached rooms found!!';
        //     for(let roomId in Memory.roomInfo) {
        //         if (Memory.roomInfo.hasOwnProperty(roomId)) {
        //             roomPopSummary = '';
        //             for(let role in roleManager) {
        //                 if (roleManager.hasOwnProperty(role)) {
        //                     roomPopSummary+=(role+': '+Query.countRolesInRoom(roomId, role)+',');
        //                 }
        //             }
        //         }
        //     }
        //     console.log(roomPopSummary);
        // }

        return true;
    }
};