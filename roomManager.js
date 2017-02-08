const Tasks=require('tasks');
const Query=require('data');
const RoleManager=require('role.manager');

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

        // SITES
        let availableConstructions = roomInfo.constructions = thisRoom.find(FIND_CONSTRUCTION_SITES);

        // SPAWNS
        roomInfo.spawn = _.filter(myAvailableStructures, function (structure) {
            if (structure.structureType == STRUCTURE_SPAWN) {
                return structure;
            }
        });

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
        if (roomInfo.spawn[0]) {
            roomInfo.gravePos = new RoomPosition(roomInfo.spawn[0].pos.x + 1, roomInfo.spawn[0].pos.y + 1, thisRoom.name);
        }

        // EXTENSION BUILDER SOURCE
        if (!roomInfo.extensionBuilderSource && roomInfo.spawn[0]) {
            // We only want one extension builder source. OR DO WE.... todo, maybe. Might check second source instead of allowed the "broken" pattern.
            roomInfo.extensionBuilderSource = roomInfo.spawn[0].pos;
        }

        // Basic tower code taken directly from tutorial
        if (roomInfo.towers) {
            _.each(roomInfo.towers, function (tower) {
                let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 50000 // todo remove hardcoded hits check for tower repair
                });
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }

                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestHostile) {
                    tower.attack(closestHostile);
                }
            });
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
                                closestContainer[0].pos.x < (source.pos.x - 1) || closestContainer[0].pos.x > (source.pos.x + 1) ||
                                closestContainer[0].pos.y < (source.pos.y - 1) || closestContainer[0].pos.y > (source.pos.y + 1)) {

                                let constructionsByDistance = _.sortBy(availableConstructions, c => source.pos.getRangeTo(c));
                                let nearestSite = _.filter(constructionsByDistance, function (site) {
                                    return site.structureType == STRUCTURE_CONTAINER;
                                });

                                if (!nearestSite ||
                                    nearestSite == undefined ||
                                    closestContainer[0] == undefined ||
                                    nearestSite[0].pos.x < (source.pos.x - 1) || nearestSite[0].pos.x > (source.pos.x + 1) ||
                                    nearestSite[0].pos.y < (source.pos.y - 1) || nearestSite[0].pos.y > (source.pos.y + 1)) {

                                    // todo make up a "closest to spawn" function for the  passable xy at a source
                                    let buildPos = Query.locateAnyEmptySpaceClosestToSpawnAroundPoint(source.pos);

                                    if (buildPos) {
                                        // console.log('WE CAN BUILD CONTAINER AT ' + buildPos);
                                        // thisRoom.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                                    }
                                }

                            } else {
                                // console.log('set container stuff');
                                source.container = {} = closestContainer[0];
                            }
                        } catch (e) {
                            // console.log('static check'+e);
                        }
                    }
                }

                let sourceContainer = Query.locateContainersAroundPoint(source.pos, availableStructures);
                if (sourceContainer) {
                    source.container = {} = sourceContainer;
                }
            }
        }

        // FULL EXTENSIONS
        roomInfo.fullExtensions = {} = _.filter(myAvailableStructures, function (structure) {
            return structure.structureType == STRUCTURE_EXTENSION && structure.energy == structure.energyCapacity
        });

        // ENERGY CAPACITY
        roomInfo.energyCapacity = thisRoom.energyCapacityAvailable;

        // ENERGY AVAILABLE
        roomInfo.energyAvailable = thisRoom.energyAvailable;

        // CREEPS
        roomInfo.creeps = thisRoom.find(FIND_MY_CREEPS);

        // ROLES
        if (Memory.creepRoles == undefined) {
            Memory.creepRoles = {};
        }
        for (let roleName in RoleManager) {
            if (RoleManager.hasOwnProperty(roleName)) {
                let role = RoleManager[roleName];
                if (role != undefined) {
                    Memory.creepRoles[role.role] = role;
                }
            }
        }

        // GRAVE
        // Use energy capacity as a marker for how advanced the room is, let's not care about graves early on
        if (roomInfo.spawn && roomInfo.energyCapacity > 500 && (!roomInfo.grave || !Game.getObjectById[roomInfo.grave.id])) {
            // We always want a grave, let's say in the top right square, right beside the spawn, for creeps to die on, to drop energy
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
        if (roomInfo.spawn && Query.isBuildingTypeAvailable(STRUCTURE_EXTENSION, thisRoom)) {
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

        Memory.roomInfo[thisRoom.name] = roomInfo;
    }
}
