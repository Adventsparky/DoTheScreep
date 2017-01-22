const Query=require('data');
const HITS_MIN=5000;
const HITS_IMPROVED=10000;
const HITS_NOW_WERE_SUCKIN_DIESEL=40000;

module.exports = {

    /*
     * ENERGY
     */
    findNearestEnergy: function(creep) {
        let closestSource=creep.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.memory.targetSource = closestSource.id;
            delete creep.memory.targetDropoff; // This will only be for harvesters
        }
    },
    findNearestEnergyToHomeBase: function(creep) {
        let closestSource=Query.spawnInCreepRoom(creep).pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            return closestSource.id;
        }
    },
    structureHasSpaceForEnergy : function (structure) {
        if(structure.structureType == STRUCTURE_CONTAINER) {
            return _.sum(structure.store) < structure.storeCapacity;
        }
        return structure.energy < structure.energyCapacity;
    },
    collectEnergy : function(creep) {
        // Keep the setup checks above and these action perform checks separate, these actions need to happen every tick
        if(creep.memory.targetSource) {
            let targetSource = Game.getObjectById(creep.memory.targetSource);
            console.log(targetSource);
            if(targetSource){
                if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSource);
                }
            }
        }
    },
    depositEnergy : function(creep) {
        console.log(creep.name);
        console.log(creep.memory.targetDropoff);
        if(creep.memory.targetDropoff) {
            let targetDropoff = Game.getObjectById(creep.memory.targetDropoff);
            // Let's make sure it's still a valid energy dump
            if(!this.structureHasSpaceForEnergy(targetDropoff)) {
                targetDropoff = this.findBestEnergyDump(creep);
            }

            if(creep.transfer(targetDropoff, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetDropoff);
            }
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
    findBestEnergyDump: function(creep) {
        // console.log(creep);
        // console.log(creep.room.name);
        let potentialDropOffsInThisRoom = Memory.roomInfo[creep.room.name].structures;
        let dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
                return structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity;
            });
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
                return structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
            });
        }
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
                return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity) ||
                    // (structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity) ||
                    (structure.structureType == STRUCTURE_CONTROLLER)
            });
        }


        if(dropOffStructures.length > 0) {
            try {
                let target = _.reduce(dropOffStructures, function(result, structure) {
                    let range=creep.pos.getRangeTo(structure);
                    if(result && result.range < range) {
                        return result;
                    }
                    return {range: range, structure: structure}
                },{range: 99999});
                // console.log('Chose '+JSON.stringify(target)+' for '+creep.name);
                creep.memory.targetDropoff=target.structure.id
            }catch(e) {
                console.log(e);
            }
        } else{
            creep.say('no dumps');
        }
    },

    /*
     * CONSTRUCTION
     */
    buildingTypeAvailable: function(type, room) {
        return _.filter(Memory.structures, function(structure){
            return structure.structureType == type; }).length < CONTROLLER_STRUCTURES[type][room.controller.level];
    },
    // Pointless check, it's not paid from spawn, it's filled
    // buildingTypeAffordable: function(type) {
    //     return this.energyAvailable() >= CONSTRUCTION_COST[type];
    // },
    buildNearestStructure: function(creep) {

        let closestBuildingSite=creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        console.log(creep.name+' found '+closestBuildingSite+' to build');
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
            // this.findBestEnergyDump(creep);
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
    outputPopulationInfoPerRoom: function() {
        try {
            if(Game.time % 5 == 0) {
                let roomPopSummary = 'No cached rooms found!!';
                for(let roomName in Memory.roomInfo) {
                    if (Memory.roomInfo.hasOwnProperty(roomName)) {
                        let room=Memory.roomInfo[roomName];
                        roomPopSummary = roomName+': ';
                        for(let roleName in Memory.creepRoles) {
                            if (Memory.creepRoles.hasOwnProperty(roleName)) {
                                roomPopSummary+=(roleName+': '+Query.countRolesInRoom(room, roleName)+',');
                            }
                        }
                    }
                    console.log(roomPopSummary);
                }
            }
        } catch(e){
            console.log(e);
        }
    },
    performCreepleCensusByRole: function(role) {

        for(let roomId in Memory.roomInfo){
            if(Memory.roomInfo.hasOwnProperty(roomId)) {
                let room = Memory.roomInfo[roomId];
                if(room.spawn != undefined && room.spawn.length) {

                    try {
                        let creepleCountForRole = 0;
                        if (room.creeps !== undefined && room.creeps.length) {
                            creepleCountForRole = _.filter(room.creeps, function (creep) {
                                return creep.memory.role == role.role;
                            }).length;
                        }

                        if (creepleCountForRole === undefined) {
                            creepleCountForRole = 0;
                        }

                        if (creepleCountForRole < role.minRoomPopulation) {
                            console.log('New: '+'need to spawn a ' + role.role + ', only have '+creepleCountForRole);
                            room.spawn[0].createCreep(role.parts, undefined, {role: role.role});
                            return false;
                        }

                    }catch(e){
                        console.log(e);

                        // Fall back to this non cache based stuff if we murder the census
                        let creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
                        // console.log('ST: '+creeps.length+' '+role.role);
                        if(creeps.length < role.minRoomPopulation) {
                            console.log('ST: '+'need to spawn a '+role.role);
                            room.spawn[0].createCreep(role.parts,undefined, {role: role.role});
                            return false;
                        }
                    }

                    return true;
                }
            }

        }

        return true;
    }
};