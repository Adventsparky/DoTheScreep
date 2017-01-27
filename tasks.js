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
    findNearestEnergyToStructure: function(creep,structure) {
        let closestSource=structure.pos.findClosestByRange(FIND_SOURCES);
        if(closestSource) {
            creep.memory.targetSource=closestSource.id;
            delete creep.memory.targetDropoff; // This will only be for harvesters
        }
    },
    findNearestOrLeastBusySource : function(creep) {
        let assignedToCurrentChoice = 0;
        let room = Memory.roomInfo[creep.room.name];
        console.log(room);

        let bestChoiceSource=null;
        // Count how many are heading to this vs how many slots it has
        // Allow default of available harvest points +1 to wait
        // After that, prefer the point with more available slots
        // X=slots, allowance=x+1, prefer higher slot number until allowance*1.5 is breached.
        _.each(room.availableSources, function(source) {
            if(source.dedicatedMiner) {
                console.log('Miner here, look for container');
                if (source.container) {
                   console.log('No container yet, tough shit.');
                }
            } else {

                console.log('check source ' + source.id);
                let creepAssignedToSourceCount = 0;
                _.each(room.creeps, function (harvestingCreep) {
                    if (harvestingCreep.memory.targetSource && harvestingCreep.memory.targetSource == source.id) {
                        creepAssignedToSourceCount++;
                    }
                });

                console.log('Total of ' + creepAssignedToSourceCount + ' at ' + source.id);

                let creepAllowanceForSource = source.accessibleSpaces + 1;
                // let creepOverflowForSource = source.accessibleSpaces * 1.5;


                if (bestChoiceSource == null) {
                    // We have nothing, so ANYTHING is the best choice
                    bestChoiceSource={};
                    bestChoiceSource.source=source;
                    bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
                    // bestChoiceSource.score=creepAssignedToSourceCount / creepOverflowForSource;
                } else {
                    let sourceScore=creepAssignedToSourceCount / creepAllowanceForSource;
                    // let sourceScore=creepAssignedToSourceCount / creepOverflowForSource;
                    // console.log('Score for '+bestChoiceSource.source.id+': '+bestChoiceSource.score);
                    // console.log('Score for '+source.id+': '+sourceScore);

                    if (sourceScore < bestChoiceSource.score){
                        bestChoiceSource.source=source;
                        bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
                        // bestChoiceSource.score=creepAssignedToSourceCount / creepOverflowForSource;
                    }
                }
            }
        });

        if(bestChoiceSource){
            console.log(creep+ ' choosing '+bestChoiceSource.source.id);
            creep.memory.targetSource=bestChoiceSource.source.id;
            delete creep.memory.targetDropoff; // This will only be for harvesters
        } else {
            console.log('Could not find a best choice source?? What??');
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
            if(targetSource){
                if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSource);
                }
            }
        }
    },
    depositEnergy : function(creep) {
        if(creep.memory.targetDropoff) {
            let targetDropoff = Game.getObjectById(creep.memory.targetDropoff);
            // Let's make sure it's still a valid energy dump
            if(!this.structureHasSpaceForEnergy(targetDropoff)) {
                targetDropoff = this.findBestEnergyDump(creep);
            }

            // Creep could get stuck at the source if everything is full, move to the dump regardless and wait
            // console.log(creep.transfer(targetDropoff, RESOURCE_ENERGY));
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
        let dropOffStructures = _.filter(potentialDropOffsInThisRoom, function (structure) {
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
    findNearestConstructionTowerContainerExtensionRampartWall : function(creep) {

        // let potentialConstructions=Memory.priorityConstructions;
        console.log('-- BUILD --');
        console.log(Memory.priorityConstructions);

        let sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        let potentialConstructions = _.filter(sites, function(constructionSite) {
            return constructionSite.structureType == STRUCTURE_TOWER;
        });
        if(potentialConstructions.length == 0) {
            potentialConstructions = _.filter(sites, function(constructionSite) {
                return constructionSite.structureType == STRUCTURE_TOWER ||
                    constructionSite.structureType == STRUCTURE_CONTAINER && constructionSite.staticHarvester ||
                    constructionSite.structureType == STRUCTURE_CONTAINER ||
                    constructionSite.structureType == STRUCTURE_EXTENSION ||
                    constructionSite.structureType == STRUCTURE_RAMPART ||
                    constructionSite.structureType == STRUCTURE_WALL;
            });
        }

        console.log(potentialConstructions);

        if(potentialConstructions.length == 0) {
            potentialConstructions=sites;
        }

        if(potentialConstructions.length > 0) {
            try {
                let target = _.reduce(potentialConstructions, function(result, site) {
                    let range=creep.pos.getRangeTo(site);
                    if(result && result.range < range) {
                        return result;
                    }
                    return {range: range, site: site}
                },{range: 99999});
                // console.log('Chose '+JSON.stringify(target)+' for '+creep.name);
                creep.memory.targetConstruction=target.site.id
            }catch(e) {
                console.log(e);
            }
        } else {
            // creep.say('no builds');
        }
    },
    buildNearestStructure: function(creep) {
        if(creep.memory.targetConstruction) {
            let targetConstruction = Game.getObjectById(creep.memory.targetConstruction);
            if(targetConstruction) {
                if (creep.build(targetConstruction) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetConstruction);
                }
            } else{
                delete creep.memory.targetConstruction;
                delete creep.memory.building;
            }
        } else{
            delete creep.memory.building;
            this.repairNearestStructure(creep);
        }
    },
    repairNearestStructure: function(creep) {
        // Prioritise towers
        let closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER && (structure.hits < HITS_MIN && structure.hits < structure.hitsMax);
            }
        });
        if(!closestDamagedStructure) {
            closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < HITS_MIN && structure.hits < structure.hitsMax);
                }
            });
        }
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
    performCreepleCensusByRole: function() {

        for(let roomId in Memory.roomInfo){
            if(Memory.roomInfo.hasOwnProperty(roomId)) {
                let room = Memory.roomInfo[roomId];
                if(room.spawn != undefined && room.spawn.length) {

                    this.checkIfWeAreReadyForStaticHarvesters(roomId);

                    if(!Memory.spawningPaused) {
                        for(let roleName in Memory.creepRoles) {
                            if(Memory.creepRoles.hasOwnProperty(roleName)) {
                                let role=Memory.creepRoles[roleName];

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

                                    if (creepleCountForRole < role.targetRoomPopulation) {
                                        console.log('New: '+'need to spawn a ' + role.role + ' in '+roomId+', only have '+creepleCountForRole);
                                        // console.log(room.spawn[0].canCreateCreep(role.stage2Parts, undefined));
                                        // console.log(Game.rooms[roomId].energyCapacityAvailable);
                                        // console.log(Memory.roleBuildCosts[role.role+'Stage2Parts']);

                                        if(room.spawn[0].canCreateCreep(role.stage2Parts, undefined) == OK){
                                            console.log('Build big one');
                                            room.spawn[0].createCreep(role.stage2Parts, undefined, {role: role.role});
                                        } else {
                                            console.log('Build little one');
                                            room.spawn[0].createCreep(role.parts, undefined, {role: role.role});
                                        }
                                        return false;
                                    }
                                }catch(e){
                                    console.log(e);

                                    // Fall back to this non cache based stuff if we murder the census
                                    let creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
                                    // console.log('ST: '+creeps.length+' '+role.role);
                                    if(creeps.length < role.targetRoomPopulation) {
                                        console.log('ST: '+'need to spawn a '+role.role);
                                        room.spawn[0].createCreep(role.parts,undefined, {role: role.role});
                                        return false;
                                    }
                                }
                            }
                        }
                    }

                    return true;
                }
            }

        }

        return true;
    },
    checkIfWeAreReadyForStaticHarvesters : function(room) {
        // count sources without static harvester flag
        // let sources = Memory.roomInfo[room.name].availableSources;
        // let sourceWithoutStaticHarvester = _.filter(sources, function (structure) {
        //     return structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity;
        // });

        // console.log(sourceWithoutStaticHarvester+' does not have id');

        if(Game.rooms[room].energyCapacityAvailable > Memory.roleBuildCosts['staticHarvester']){
            console.log('Pausing spawn system, ready for big bastard harvesters');
            // OK now we're onto something, lets check if we have enough regular creeps using an absolute minimum
            // then pause all spawning in favour of a static harvester
            // Memory.spawningPaused=true;
            for(let roleName in Memory.creepRoles) {
                if(Memory.creepRoles.hasOwnProperty(roleName)) {
                    let role=Memory.creepRoles[roleName];
                    if(role.minRoomPopulation){
                        if (room.creeps !== undefined && room.creeps.length) {
                            let creepsOfRole = _.filter(room.creeps, function (creep) {
                                return creep.memory.role == role.role;
                            }).length;
                            if(creepsOfRole < role.minRoomPopulation){
                                // wa waaaaa
                                console.log('wa waaaa, have the energy capacity but not the min screeps required, ENABLE SPAWNING AGAIN, damn you '+roleName);
                                // delete Memory.spawningPaused;
                                return;
                            }
                        }
                    }
                }
            }

            // we're good to spawn statics

            return true;
        } else{
            // delete Memory.spawningPaused;
        }
    }
};