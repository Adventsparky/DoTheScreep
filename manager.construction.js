const OBSTACLE_OBJECT_TYPES_NO_CREEP = ["spawn", "wall", "source", "constructedWall", "extension", "link", "storage", "tower", "observer", "powerSpawn", "powerBank", "lab", "terminal","nuker"];

let roomCostCache = {};

function roomCost(roomName) {
    if(roomCostCache[roomName]) {
        return roomCostCache[roomName];
    }
    let room=Game.rooms[roomName];
    if(room) {
        let costs = new PathFinder.CostMatrix;
        room.find(FIND_STRUCTURES).forEach(function (structure) {
            if(structure.structureType == STRUCTURE_ROAD) {
                costs.set(structure.pos.x, structure.pos.y, 1);
            } else if(OBSTACLE_OBJECT_TYPES_NO_CREEP.includes(structure.structureType)) {
                costs.set(structure.pos.x, structure.pos.y, 0xff);
            }
        });
        return costs;
    }
    return false;
}

function planRoads(roomInfo) {
    let roomName=roomInfo.name;
    let room=Game.rooms[roomName];
    roomInfo.spawns.forEach(function(spawn) {

        // utils.spacesAround(room,spawn.pos,function (space) {
        //     room.createConstructionSite(space, STRUCTURE_ROAD);
        // });

        if (roomInfo.controller && roomInfo.controller.level > 2) {
            roomInfo.availableSources.forEach(function (source) {
                let results = PathFinder.search(spawn.pos,
                    {pos: source.pos, range: 1},
                    {
                        plainCost: 2,
                        swampCost: 10,
                        roomCallback: roomCost
                    });

                if (!results.incomplete) {

                    results.path.forEach(function (pos) {
                        room.createConstructionSite(pos, STRUCTURE_ROAD);
                    });
                }
            });
        }

        roomInfo.extensions.forEach(function (extenstion) {
            let pos=extenstion.pos;
            room.createConstructionSite(pos.x-1, pos.y, STRUCTURE_ROAD);
            room.createConstructionSite(pos.x+1, pos.y, STRUCTURE_ROAD);
            room.createConstructionSite(pos.x, pos.y-1, STRUCTURE_ROAD);
            room.createConstructionSite(pos.x, pos.y+1, STRUCTURE_ROAD);
        });
    });
}

module.exports = {
    process: function (roomInfo) {
        if(Game.time % 100 == 0) {
            planRoads(roomInfo);
        }
    }
};