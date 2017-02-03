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
    energyAvailableInRoom: function(room) {
        return room.energyCapacityAvailable;
    },

    /*
     * UTILITY
     */
    spawnInCreepRoom: function(creep) {
        for(let room_name in Memory.roomInfo){
            if(Memory.roomInfo.hasOwnProperty(room_name)) {
                if (room_name == creep.room.name) {
                    return Memory.roomInfo[room_name].spawn[0];
                }
            }
        }
    },
    controllerInCreepRoom: function(creep) {
        for(let room_name in Memory.roomInfo){
            if(Memory.roomInfo.hasOwnProperty(room_name)) {
                if (room_name == creep.room.name) {
                    return Memory.roomInfo[room_name].controller[0];
                }
            }
        }
    },
    creepBodyPartCost: function() {
        return {
            "move": 50,
            "carry": 50,
            "work": 100,
            "heal": 250,
            "claim": 600,
            "tough": 10,
            "attack": 80,
            "ranged_attack": 150
        };
    },
    countRolesInRoom: function(checkRoom, checkRole) {
        if(checkRoom){
            return _.filter(checkRoom.creeps, function(creep) {
                return creep.memory.role == checkRole;
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
        if (!room || !room.constructions) {
            return 0;
        }
        return _.filter(room.constructions, function(site){
            return site.structureType == type; });
    },
    structuresTotalInPlayInRoom : function(type, room) {
        // console.log(this.structuresOfTypeAlreadyBuilt(type, room).length);
        // console.log(this.structuresOfTypeAlreadyPlanned(type, room).length);
        // console.log(this.structuresOfTypeAlreadyBuilt(type, room).length + this.structuresOfTypeAlreadyPlanned(type, room).length);
        return this.structuresOfTypeAlreadyBuilt(type, room).length + this.structuresOfTypeAlreadyPlanned(type, room).length;
    },
    numberOfBuildingTypeAvailable : function(type, room) {
        // console.log(room);
        let storedRoom = Memory.roomInfo[room.name];
        // console.log(CONTROLLER_STRUCTURES[type][room.controller.level]);
        // console.log(this.structuresTotalInPlayInRoom(type, storedRoom));

        return CONTROLLER_STRUCTURES[type][room.controller.level] - this.structuresTotalInPlayInRoom(type, storedRoom);
    },
    isBuildingTypeAvailable : function(type, room) {
        return this.numberOfBuildingTypeAvailable(type, room) > 0;
    },
    safeCoord : function(c) {
        c = c < 0 ? c=0 : c;
        c = c > 49 ? c=49 : c;
        return c;
    },
    checkIfSiteIsSuitableForExtensionConstruction : function(pos, room) {
        // If there's anything within 1 square (ie 3x3 grid) play it safe
        // let startPos = new RoomPosition(pos.x-1, pos.y-1, room.name);
        // let endPos = new RoomPosition(pos.x+1, pos.y+1, room.name);

        // console.log('check around '+(pos));
        let canBuildHere=true;
        let scanResults = Game.rooms[room.name].lookAtArea(this.safeCoord(pos.y-1), this.safeCoord(pos.x-1),
            this.safeCoord(pos.y+1), this.safeCoord(pos.x+1), true);
        if (scanResults) {
            //     // console.log('We found '+scanResults.length+' things around '+pos);

            let foundOneOfTheRequiredTypesNearby = false;
            _.each(scanResults, function(thing){

                let type=getTypeFromLookAtAreaResult(thing);

                if (type) {
                    if (thing.x == pos.x && thing.y == pos.y) {
                        //             // Special check for the actual square we want to build on

                        if (_.contains(nonBuildableTypes, type)) {
                            canBuildHere=false;
                        }
                    } else {
                        // console.log(type);

                        if (type == 'wall' ||
                            !_.contains(typesAllowedBesideExtension, type)) {
                            canBuildHere=false;
                        }
                    }

                    if (_.contains(typesRequiredBesideExtension, type)) {
                        foundOneOfTheRequiredTypesNearby=true;
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
    locateContainersAtPoint : function(pos,availableStructures) {
        // console.log('Check '+pos+' in '+room);
        let container;

        // Checking the immediate spaces so start top right
        let minX=pos.x - 1;
        let maxX=pos.x + 1;
        let minY=pos.y - 1;
        let maxY=pos.y + 1;

        // We have min and max xy to check, load the containers and check if we have one here
        _.each(availableStructures, function(structure) {
            if (!container && structure.structureType == STRUCTURE_CONTAINER) {
                // console.log('checking')
                // Check is in pos Range
                if (structure.pos.x >= minX &&
                    structure.pos.x <= maxX &&
                    structure.pos.y >= minY &&
                    structure.pos.y <= maxY) {
                    // we have a container
                    container=structure;
                }
            }
        });

        return container;
    }
};
