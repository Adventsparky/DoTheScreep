require('require');
const Tasks=require('tasks');
const Query=require('data');
const RoleManager=require('manager.role');
const Towers=require('manager.towers');
const Construction=require('manager.construction');

module.exports = {
    process : function (roomId) {

        let thisRoom = Game.rooms[roomId];
        let roomInfo = {};

        // NAME
        roomInfo.name = thisRoom.name;

        // STRUCTURES
        let availableStructures = roomInfo.structures = thisRoom.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_ROAD &&
            structure.structureType != STRUCTURE_WALL
        });

        // MY STRUCTURES
        let myAvailableStructures = roomInfo.mystructures = thisRoom.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_ROAD &&
            structure.structureType != STRUCTURE_WALL
        });

        // FULL EXTENSIONS
        roomInfo.extensions = {} = _.filter(myAvailableStructures, function (structure) {
            return structure.structureType == STRUCTURE_EXTENSION
        });

        // FULL EXTENSIONS
        roomInfo.fullExtensions = {} = _.filter(roomInfo.extensions, function (structure) {
            return structure.energy == structure.energyCapacity
        });

        // SITES
        let availableConstructions = roomInfo.constructionsites = thisRoom.find(FIND_CONSTRUCTION_SITES);

        // MY SITES
        let myAvailableConstructions = roomInfo.myconstructionsites = thisRoom.find(FIND_MY_CONSTRUCTION_SITES);

        // SPAWNS
        roomInfo.spawns = _.filter(myAvailableStructures, function (structure) {
            if (structure.structureType == STRUCTURE_SPAWN) {
                return structure;
            }
        });

        // MAIN SPAWN
        roomInfo.mainSpawn = roomInfo.spawns[0];

        // CONTROLLER
        roomInfo.controller = _.filter(myAvailableStructures, function (structure) {
            if (structure.structureType == STRUCTURE_CONTROLLER) {
                return structure;
            }
        });

        // TOWERS
        roomInfo.towers = _.filter(myAvailableStructures, function (structure) {
            if (structure.structureType == STRUCTURE_TOWER) {
                return structure;
            }
        });

        // GRAVE POS
        if (roomInfo.mainSpawn) {
            roomInfo.gravePos = new RoomPosition(roomInfo.mainSpawn.pos.x + 1, roomInfo.mainSpawn.pos.y + 1, thisRoom.name);
        }

        // EXTENSION BUILDER SOURCE
        if (!roomInfo.extensionBuilderSource && roomInfo.mainSpawn) {
            // We only want one extension builder source. OR DO WE.... todo, maybe. Might check second source instead of allowed the "broken" pattern.
            roomInfo.extensionBuilderSource = roomInfo.mainSpawn.pos;
        }

        // SOURCES
        let availableSources = roomInfo.availableSources = thisRoom.find(FIND_SOURCES);
        for (let sourceNum in availableSources) {
            if (availableSources.hasOwnProperty(sourceNum)) {
                let source = availableSources[sourceNum];

                // Query.countAccessibleSpacesAroundStructure(source);

                if (source.dedicatedMiner === undefined) {
                    source.dedicatedMiner = 0;
                }

                if (source.accessibleSpaces === undefined) {
                    source.accessibleSpaces = 0;
                }
                source.accessibleSpaces = thisRoom.countAccessibleSpacesAroundPoint(source.pos);

                if (!source.container && Tasks.checkIfWeAreReadyForStaticHarvesters(thisRoom)) {
                    try {
                        let thingsBeside = thisRoom.lookForAtArea(LOOK_STRUCTURES, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
                        let foundContainer = false;
                        _.each(thingsBeside, function(thing){
                            if(thing.type == 'structure') {
                                let typeOfThing = thing['structure'];
                                if (typeOfThing.structureType == STRUCTURE_CONTAINER) {
                                  foundContainer=true;
                                };
                            };
                        });

                        if (!foundContainer) {
                            let buildPos = Query.locateAnyEmptySpaceClosestToSpawnAroundPoint(source.pos, roomInfo.mainSpawn.pos);

                            if (buildPos) {
                                thisRoom.createConstructionSite(buildPos, STRUCTURE_CONTAINER);
                            }
                        }
                    } catch (e) {
                        // console.log('static check'+e);
                    }
                }

                let sourceContainer = Query.locateContainersAroundPoint(source.pos, availableStructures);
                if (sourceContainer) {
                    source.container = sourceContainer.id;
                }
            }
        }

        // ENERGY CAPACITY
        roomInfo.energyCapacity = thisRoom.energyCapacityAvailable;

        // ENERGY AVAILABLE
        roomInfo.energyAvailable = thisRoom.energyAvailable;

        // CREEPS
        roomInfo.creepsInThisRoom = thisRoom.find(FIND_MY_CREEPS);

        // GRAVE
        // Use energy capacity as a marker for how advanced the room is, let's not care about graves early on
        if (roomInfo.mainSpawn && roomInfo.energyCapacity > 500 && (!roomInfo.grave || !Game.getObjectById[roomInfo.grave.id])) {
            // We always want a grave, let's say in the top right square, right beside the mainSpawn, for creeps to die on, to drop energy
            let structuresInGraveSpot = thisRoom.lookForAt(LOOK_STRUCTURES, roomInfo.gravePos);
            if (!structuresInGraveSpot) {
                let constructionsInGraveSpot = thisRoom.lookForAt(LOOK_CONSTRUCTION_SITES, roomInfo.gravePos);
                if (!constructionsInGraveSpot) {
                    roomInfo.gravePos.createConstructionSite(STRUCTURE_CONTAINER);
                } else if (constructionsInGraveSpot[0].structureType == STRUCTURE_CONTAINER) {
                    // all good
                } else {
                    // can't put the grave here
                }
            } else {
                let grave;
                _.each(structuresInGraveSpot, function (structure) {
                    if (!grave && structure.structureType == STRUCTURE_CONTAINER) {
                        grave = structure;
                    }
                });
                if (grave) {
                    roomInfo.grave = {} = structuresInGraveSpot[0];
                } else {
                    roomInfo.gravePos.createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
        }

        // BUILD ROADS AND EXTENSIONS AROUND SPAWN
        // console.log('Extensions available: '+Query.numberOfBuildingTypeAvailable(STRUCTURE_EXTENSION,thisRoom));
        // console.log('Is available? '+Query.isBuildingTypeAvailable(STRUCTURE_EXTENSION,thisRoom));
        if (roomInfo.mainSpawn && Query.isBuildingTypeAvailable(STRUCTURE_EXTENSION, thisRoom)) {
            Tasks.checkForExtensionsAndRoadConstruction(thisRoom);
        }

        // ENEMY DATA
        roomInfo.enemyData = {};

        // ENEMY CREEPS
        roomInfo.enemyData.enemyCreeps = thisRoom.find(FIND_HOSTILE_CREEPS);

        // ENEMY STRUCTURES
        roomInfo.enemyData.enemyStructures = thisRoom.find(FIND_HOSTILE_STRUCTURES);

        // ENEMY STRUCTURES
        roomInfo.enemyData.enemyConstructions = thisRoom.find(FIND_HOSTILE_CONSTRUCTION_SITES);

        // ENEMY STRUCTURES
        roomInfo.enemyData.enemySpawns = thisRoom.find(FIND_HOSTILE_SPAWNS);

        // If we have no enemy data, remove the whole node
        if (!roomInfo.enemyData.enemyCreeps && !roomInfo.enemyData.enemyStructures && !roomInfo.enemyData.enemyConstructions && !roomInfo.enemyData.enemySpawns) {
            delete roomInfo.enemyData;
        }

        // CREEPS
        let creeps = roomInfo.creeps = _.filter(Game.creeps, function(creep) {
            let homeRoom = creep.memory.home;
            if (!homeRoom) {
                creep.memory.home = creep.room.name;
            }
            return homeRoom && homeRoom == roomInfo.name;
        });

        // RUN CREEPS
        _.each(creeps, function(creep) {
            if (creep.memory.home && creep.memory.home == thisRoom.name) {
                if (creep.memory.role !== undefined) {
                    RoleManager[creep.memory.role].run(creep, roomInfo);
                } else {
                    console.log('wtf no defined role');
                    console.log(creep);
                    console.log(creep.memory.role);
                }
            }
        });

        if (roomInfo.mainSpawn) {
            Towers.process(roomInfo);
            Construction.process(roomInfo);
            Tasks.performCreepleCensusByRole(roomInfo);
            // Tasks.outputPopulationInfoPerRoom(roomInfo);
        }
    }
};
