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
        return _.filter(room.structures, function(structure){
            return structure.structureType == type; });
    },
    structuresOfTypeAlreadyPlanned : function(type,room){
        return _.filter(room.constructions, function(site){
            return site.structureType == type; });
    },
    structuresTotalInPlayInRoom : function(type, room) {
        return this.structuresOfTypeAlreadyBuilt(type, room).length + this.structuresOfTypeAlreadyPlanned(type, room).length;
    },
    numberOfBuildingTypeAvailable : function(type, room) {
        console.log(room);
        // console.log(CONTROLLER_STRUCTURES[type][room.controller.level]);
        // console.log(this.structuresTotalInPlayInRoom(type, room));
        return CONTROLLER_STRUCTURES[type][room.controller.level] - this.structuresTotalInPlayInRoom(type, room);
    },
    isBuildingTypeAvailable : function(type, room) {
        return this.numberOfBuildingTypeAvailable(type, room) > 0;
    },
    checkIfSiteIsSuitableForExtensionConstruction : function(pos, room) {
        // If there's anything within 1 square (ie 3x3 grid) play it safe
        let startPos = new RoomPosition(pos.x-1, pos.y-1, room.name);
        let endPos = new RoomPosition(pos.x+1, pos.y+1, room.name);

        // console.log('check around '+(pos));
        let canBuildHere=true;
        let scanResults = Game.rooms[room.name].lookAtArea(pos.y-1, pos.x-1, pos.y+1, pos.x+1, true);
        if (scanResults) {
            // console.log('We found '+scanResults.length+' things around '+pos);
            _.each(scanResults, function(thing){
                let type=thing.type;
                let typeOfThing = thing[type];

                console.log(typeOfThing);

                switch (type){
                    case LOOK_TERRAIN :
                        if (typeOfThing == 'wall'){
                            canBuildHere=false;
                        }
                        break;
                    case LOOK_STRUCTURES :
                        if (typeOfThing.structureType != STRUCTURE_EXTENSION ||
                            typeOfThing.structureType != STRUCTURE_SPAWN ||
                            typeOfThing.structureType != STRUCTURE_ROAD) {
                            canBuildHere=false;
                        }
                        break;
                    case LOOK_CONSTRUCTION_SITES :
                        if (typeOfThing.structureType != STRUCTURE_EXTENSION ||
                            typeOfThing.structureType != STRUCTURE_SPAWN ||
                            typeOfThing.structureType != STRUCTURE_ROAD) {
                            canBuildHere=false;
                        }
                        break;

                }
            });

            console.log(canBuildHere);
        }
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
