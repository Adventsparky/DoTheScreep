// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');

const RoleManager=require('role.manager');
const Tasks=require('tasks');
const Query=require('data');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {

        // console.log('- - - TICK - - -');

        // RIP in pieces
        Tasks.clearMemoryOfDeadCreeples();

        // Calculate role build costs
        if(Memory.roleBuildCosts === undefined){
            Memory.roleBuildCosts={};
            for(let roleName in Memory.creepRoles) {
                if(Memory.creepRoles.hasOwnProperty(roleName)) {
                    let role=RoleManager[roleName];
                    let cost=0;
                    _.each(role.parts, function(part){
                        cost+=Query.creepBodyPartCost()[part];
                    });
                    Memory.roleBuildCosts[roleName]=cost;

                    let improvedCost=0;
                    _.each(role.stage2Parts, function(part){
                        improvedCost+=Query.creepBodyPartCost()[part];
                    });
                    Memory.roleBuildCosts[roleName+'Stage2Parts']=improvedCost;
                }
            }
        }

        // Set up some lists of things we might use more than once per tick
        if(Memory.roomInfo == undefined) {
            Memory.roomInfo = {};
        }
        for(let roomId in Game.rooms){
            if(Game.rooms.hasOwnProperty(roomId)) {
                let thisRoom = Game.rooms[roomId];
                let storedRoom={};
                if(storedRoom == undefined) {
                    storedRoom=Memory.roomInfo[thisRoom.name] = {};
                }

                // NAME
                storedRoom.name=roomId;

                // STRUCTURES
                let availableStructures=storedRoom.structures=thisRoom.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType != STRUCTURE_ROAD &&
                    structure.structureType != STRUCTURE_WALL
                });

                // MY STRUCTURES
                let myAvailableStructures=storedRoom.mystructures=thisRoom.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType != STRUCTURE_ROAD &&
                    structure.structureType != STRUCTURE_WALL
                });

                // SITES
                let availableConstructions=storedRoom.constructions=thisRoom.find(FIND_CONSTRUCTION_SITES);

                // SPAWNS
                storedRoom.spawn=_.filter(myAvailableStructures, function(structure){
                    if(structure.structureType == STRUCTURE_SPAWN){
                        return structure;
                    }
                });

                // CONTROLLER
                storedRoom.controller = _.filter(myAvailableStructures, function(structure){
                    if(structure.structureType == STRUCTURE_CONTROLLER){
                        return structure;
                    }
                });

                // TOWERS
                storedRoom.towers=_.filter(myAvailableStructures, function(structure){
                    if(structure.structureType == STRUCTURE_TOWER){
                        return structure;
                    }
                });

                // GRAVE POS
                if(storedRoom.spawn[0]) {
                    storedRoom.gravePos = new RoomPosition(storedRoom.spawn[0].pos.x + 1, storedRoom.spawn[0].pos.y + 1, thisRoom.name);
                }

                // EXTENSION BUILDER SOURCE
                if (!storedRoom.extensionBuilderSource && storedRoom.spawn[0]) {
                    // We only want one extension builder source. OR DO WE.... todo, maybe. Might check second source instead of allowed the "broken" pattern.
                    storedRoom.extensionBuilderSource = storedRoom.spawn[0].pos;
                }

                // Basic tower code taken directly from tutorial
                if(storedRoom.towers) {
                    _.each(storedRoom.towers, function(tower) {
                        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 50000 // todo remove hardcoded hits check for tower repair
                        });
                        if(closestDamagedStructure) {
                            tower.repair(closestDamagedStructure);
                        }

                        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if(closestHostile) {
                            tower.attack(closestHostile);
                        }
                    });
                }

                // SOURCES
                let availableSources=storedRoom.availableSources=thisRoom.find(FIND_SOURCES);
                for(let sourceNum in availableSources) {
                    if(availableSources.hasOwnProperty(sourceNum)){
                        let source=availableSources[sourceNum];

                        // Query.countAccessibleSpacesAroundStructure(source);

                        if (source.dedicatedMiner === undefined) {
                            source.dedicatedMiner = 0;
                        }
                        // if (Memory.sources && Memory.sources[source.id]){
                        //     console.log(Memory.sources[source.id]);
                        // }

                        if (source.accessibleSpaces === undefined) {
                            source.accessibleSpaces = 0;
                        }
                        source.accessibleSpaces = Query.countAccessibleSpacesAroundPoint(source.room, source.pos);

                        if (Tasks.checkIfWeAreReadyForStaticHarvesters(thisRoom)) {
                            if (!source.container) {
                                try {
                                    // console.log('Ok we are harvesting away not a bother');
                                    let sourcesByDistance = _.sortBy(availableSources, s => source.pos.getRangeTo(s));
                                    let closestContainer = _.filter(sourcesByDistance, function (structure) {
                                        return structure.structureType == STRUCTURE_CONTAINER;
                                    });

                                    // console.log(closestContainer[0]);
                                    if (!closestContainer ||
                                        closestContainer == undefined ||
                                        closestContainer[0] == undefined ||
                                        closestContainer[0].pos.x < (source.pos.x-1) || closestContainer[0].pos.x > (source.pos.x+1) ||
                                        closestContainer[0].pos.y < (source.pos.y-1) || closestContainer[0].pos.y > (source.pos.y+1)) {

                                        let constructionsByDistance = _.sortBy(availableConstructions, c => source.pos.getRangeTo(c));
                                        let nearestSite = _.filter(constructionsByDistance, function (site) {
                                            return site.structureType == STRUCTURE_CONTAINER;
                                        });

                                        if (!nearestSite ||
                                            nearestSite == undefined ||
                                            closestContainer[0] == undefined ||
                                            nearestSite[0].pos.x < (source.pos.x-1) || nearestSite[0].pos.x > (source.pos.x+1) ||
                                            nearestSite[0].pos.y < (source.pos.y-1) || nearestSite[0].pos.y > (source.pos.y+1)) {

                                            // todo make up a "closest to spawn" function for the  passable xy at a source
                                            let buildPos = Query.locateAnyEmptySpaceClosestToSpawnAroundPoint(source.pos);

                                            if (buildPos) {
                                                console.log('WE CAN BUILD CONTAINER AT '+buildPos);
                                                // thisRoom.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                                            }
                                        }

                                    } else {
                                        // console.log('set container stuff');
                                        source.container={}=closestContainer[0];
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                        }

                        let sourceContainer = Query.locateContainersAroundPoint(source.pos, availableStructures);
                        if (sourceContainer) {
                            source.container={}=sourceContainer;
                        }
                    }
                }

                // FULL EXTENSIONS
                storedRoom.fullExtensions = {} = _.filter(myAvailableStructures, function(structure){
                    return structure.structureType == STRUCTURE_EXTENSION && structure.energy == structure.energyCapacity
                });

                // ENERGY CAPACITY
                storedRoom.energyCapacity = thisRoom.energyCapacityAvailable;

                // ENERGY AVAILABLE
                storedRoom.energyAvailable = thisRoom.energyAvailable;

                // CREEPS
                storedRoom.creeps = thisRoom.find(FIND_MY_CREEPS);

                // ROLES
                if(Memory.creepRoles == undefined){
                    Memory.creepRoles = {};
                }
                for(let roleName in RoleManager) {
                    if(RoleManager.hasOwnProperty(roleName)) {
                        let role=RoleManager[roleName];
                        if(role != undefined) {
                            Memory.creepRoles[role.role] = role;
                        }
                    }
                }

                // GRAVE
                // Use energy capacity as a marker for how advanced the room is, let's not care about graves early on
                if(storedRoom.spawn && storedRoom.energyCapacity > 500 && (!storedRoom.grave || !Game.getObjectById[storedRoom.grave.id])) {
                    // We always want a grave, let's say in the top right square, right beside the spawn, for creeps to die on, to drop energy
                    let structuresInGraveSpot = thisRoom.lookForAt(LOOK_STRUCTURES, storedRoom.gravePos);
                    if (!structuresInGraveSpot) {
                        let constructionsInGraveSpot = thisRoom.lookForAt(LOOK_CONSTRUCTION_SITES, storedRoom.gravePos);
                        if (!constructionsInGraveSpot) {
                            storedRoom.gravePos.createConstructionSite(STRUCTURE_CONTAINER);
                        } else if(constructionsInGraveSpot[0].structureType == STRUCTURE_CONTAINER) {
                            // all good
                        } else {
                            // can't put the grave here
                        }
                    } else {
                        let grave;
                        _.each(structuresInGraveSpot, function(structure) {
                            if (!grave && structure.structureType == STRUCTURE_CONTAINER) {
                                grave=structure;
                            }
                        });
                        if (grave) {
                            storedRoom.grave={}=structuresInGraveSpot[0];
                        } else {
                            storedRoom.gravePos.createConstructionSite(STRUCTURE_CONTAINER);
                        }
                    }
                }

                // BUILD ROADS AND EXTENSIONS AROUND SPAWN
                // console.log('Extensions available: '+Query.numberOfBuildingTypeAvailable(STRUCTURE_EXTENSION,thisRoom));
                // console.log('Is available? '+Query.isBuildingTypeAvailable(STRUCTURE_EXTENSION,thisRoom));
                if (storedRoom.spawn && Query.isBuildingTypeAvailable(STRUCTURE_EXTENSION,thisRoom)) {
                    Tasks.checkForExtensionsAndRoadConstruction(thisRoom);
                }

                // ENEMY DATA
                storedRoom.enemyData={};

                // ENEMY CREEPS
                storedRoom.enemyData.enemyCreeps=thisRoom.find(FIND_HOSTILE_CREEPS);

                // ENEMY STRUCTURES
                storedRoom.enemyData.enemyStructures=thisRoom.find(FIND_HOSTILE_STRUCTURES);

                // ENEMY STRUCTURES
                storedRoom.enemyData.enemyConstructions=thisRoom.find(FIND_HOSTILE_CONSTRUCTION_SITES);

                // ENEMY STRUCTURES
                storedRoom.enemyData.enemySpawns=thisRoom.find(FIND_HOSTILE_SPAWNS);

                // If we have no enemy data, remove the whole node
                if(!storedRoom.enemyData.enemyCreeps && !storedRoom.enemyData.enemyStructures && !storedRoom.enemyData.enemyConstructions && !storedRoom.enemyData.enemySpawns) {
                    delete storedRoom.enemyData;
                }

                Memory.roomInfo[thisRoom.name]=storedRoom;
            }
        }

        for(let name in Game.creeps) {
            if(Game.creeps.hasOwnProperty(name)) {
                let creep = Game.creeps[name];
                if(creep.memory.role !== undefined){
                    RoleManager[creep.memory.role].run(creep);
                } else {
                    console.log('wtf no defined role');
                    console.log(creep);
                    console.log(creep.memory.role);
                }
            }
        }

        Tasks.performCreepleCensusByRole();

        Tasks.outputPopulationInfoPerRoom();
    )};
};