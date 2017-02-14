const nonBuildableTypes = ['wall', STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_CONTAINER, STRUCTURE_SPAWN, STRUCTURE_EXTRACTOR, STRUCTURE_LAB,
    STRUCTURE_LINK, STRUCTURE_NUKER, STRUCTURE_STORAGE, LOOK_SOURCES, STRUCTURE_OBSERVER, STRUCTURE_TERMINAL, STRUCTURE_POWER_BANK, STRUCTURE_POWER_SPAWN,
    STRUCTURE_PORTAL, STRUCTURE_RAMPART];
const typesAllowedBesideExtension = ['plain', 'swamp', STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_CONTAINER, STRUCTURE_ROAD];
const typesRequiredBesideExtension = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN]; // One of, is ok, doesn't need to match ALL

function getTypeFromLookAtAreaResult(result) {
    let type=result.type;

    if (type == 'terrain') {
        return result[type];
    }

    if (type == 'structure') {
        let typeOfThing = result[type];
        return typeOfThing.structureType;
    }

    if (type == 'constructionSite') {
        let typeOfThing = result[type];
        return typeOfThing.structureType;
    }

}

module.exports = {
    /*
     * ENERGY
     */

    /*
     * UTILITY
     */
    countRolesInRoom: function(checkRoom, checkRole) {
        if(checkRoom && checkRoom.creeps && checkRoom.creeps[0]){
            return _.filter(checkRoom.creeps, function(creep) {
                if (creep && creep.memory && creep.memory.role) {
                    return creep.memory.role && creep.memory.role == checkRole;
                }
            }).length;
        }
        return 0;
    },

    /*
     * CONSTRUCTION
     */
    structuresOfTypeAlreadyBuilt : function(type,room){
        if (!room || !room.structures) {
            return 0;
        }
        return _.filter(room.structures, function(structure){
            return structure.structureType == type; });
    },
    structuresOfTypeAlreadyPlanned : function(type,room){
        if (!room || !room.constructionsites) {
            return 0;
        }
        return _.filter(room.constructionsites, function(site){
            return site.structureType == type; });
    },
    structuresTotalInPlayInRoom : function(type, roomInfo) {
        // console.log(this.structuresOfTypeAlreadyBuilt(type, room).length);
        // console.log(this.structuresOfTypeAlreadyPlanned(type, room).length);
        // console.log(this.structuresOfTypeAlreadyBuilt(type, room).length + this.structuresOfTypeAlreadyPlanned(type, room).length);
        return this.structuresOfTypeAlreadyBuilt(type, roomInfo.mystructures).length + this.structuresOfTypeAlreadyPlanned(type, roomInfo.myconstructionsites).length;
    },
    numberOfBuildingTypeAvailable : function(type, roomInfo) {
        // console.log(CONTROLLER_STRUCTURES[type][room.controller.level]);
        // console.log(this.structuresTotalInPlayInRoom(type, storedRoom));

        return CONTROLLER_STRUCTURES[type][Game.rooms[roomInfo.name].controller.level] - this.structuresTotalInPlayInRoom(type, roomInfo);
    },
    isBuildingTypeAvailable : function(type, roomInfo) {
        return this.numberOfBuildingTypeAvailable(type, roomInfo) > 0;
    },
    safeCoord : function(c, buffer) {
        let b=buffer ? buffer : 0;
        c = c < b ? c=b : c;
        c = c > (49-b) ? c=(49-b) : c;
        return c;
    },
    checkIfSiteIsSuitableForExtensionConstruction : function(pos, room) {
        // If there's anything within 1 square (ie 3x3 grid) play it safe
        // let startPos = new RoomPosition(pos.x-1, pos.y-1, room.name);
        // let endPos = new RoomPosition(pos.x+1, pos.y+1, room.name);

        // attachedConstructionOnly is to ensure building only continues where extensions are near other extensions,
        // but we might need to override this sometimes depending on bad terrain

        // console.log('check around '+(pos));
        let canBuildHere=true;

        let scanResults = Game.rooms[room.name].lookAtArea(this.safeCoord(pos.y-1, 2), this.safeCoord(pos.x-1, 2),
            this.safeCoord(pos.y+1, 2), this.safeCoord(pos.x+1, 2), true);
        if (scanResults) {
            //     // console.log('We found '+scanResults.length+' things around '+pos);

            let foundOneOfTheRequiredTypesNearby = false;
            // console.log(scanResults);

            _.each(scanResults, function(thing){
                if (thing) {
                    let type=getTypeFromLookAtAreaResult(thing);

                    if (thing && type) {
                        if (thing.x == pos.x && thing.y == pos.y) {
                            //             // Special check for the actual square we want to build on

                            if (_.contains(nonBuildableTypes, type)) {
                                canBuildHere=false;
                            }
                        } else {
                            // console.log(type);

                            if(!_.contains(typesAllowedBesideExtension, type)) {
                                canBuildHere = false;
                            }
                        }

                        if (_.contains(typesRequiredBesideExtension, type)) {
                            foundOneOfTheRequiredTypesNearby = true;
                        }
                    }
                }
            });

            // console.log(canBuildHere && foundOneOfTheRequiredTypesNearby);
            return canBuildHere && foundOneOfTheRequiredTypesNearby;
        }
        return true;
    },

    /*
     * TERRAIN
     */
    countAccessibleSpacesAroundPoint : function(room,pos) {
        // console.log('Check '+pos+' in '+room);
        let spaces=0;

        // Checking the immediate spaces so start top right
        let x=pos.x - 1;
        let y=pos.y - 1;

        // console.log('Structure xy: '+structure.pos.x+','+structure.pos.y);
        // console.log('Start xy: '+x+','+y);

        for(let i=0; i<3; i++) {
            y=pos.y - 1;
            for(let j=0; j<3; j++) {
                // console.log('Check: '+x+','+y);
                // console.log(Game.map.getTerrainAt(x,y,room.name));
                if(Game.map.getTerrainAt(x,y,room.name) == 'plain' ||
                    Game.map.getTerrainAt(x,y,room.name) == 'swamp') {
                    spaces++;
                }
                y++;
            }
            x++;
        }
        // console.log('Found '+spaces+' '+pos+' in '+room);
        return spaces;
    },
    locateContainersAroundPoint : function(pos, availableStructures) {
        console.log('Check '+pos+' in '+pos.room);

        // We have min and max xy to check, load the containers and check if we have one here
        // todo fix to use lookAtArea
        _.each(availableStructures, function (structure) {
            if (structure.structureType == STRUCTURE_CONTAINER && structure.pos.isNearTo(pos)) {
                // we have a container
                return structure;
            }
        });

        return null;
    },
    locateAnyEmptySpaceClosestToSpawnAroundPoint : function(pos, posToCheckProximity) {
        // console.log('Check '+pos+' in '+room);
        let emptySpacePosition=null;

        // Checking the immediate spaces so start top right
        let minX=pos.x - 1;
        let maxX=pos.x + 1;
        let minY=pos.y - 1;
        let maxY=pos.y + 1;

        let scanResults = Game.rooms[pos.roomName].lookAtArea(this.safeCoord(minY, 2), this.safeCoord(minX, 2),
            this.safeCoord(maxY, 2), this.safeCoord(maxX, 2), true);

        if (scanResults) {
            _.each(scanResults, function(thing){
                if (thing) {
                    let type=getTypeFromLookAtAreaResult(thing);

                    if (thing && type) {
                        if (thing.x != pos.x && thing.y != pos.y) {
                            if (!_.contains(nonBuildableTypes, type)) {
                                let checkPos=new RoomPosition(thing.x, thing.y, pos.roomName);
                                if (!emptySpacePosition) {
                                    emptySpacePosition = checkPos;
                                } else{
                                    if (checkPos.getRangeTo(posToCheckProximity) < emptySpacePosition.getRangeTo(posToCheckProximity)) {
                                        emptySpacePosition = checkPos;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        return emptySpacePosition;
    }
};
