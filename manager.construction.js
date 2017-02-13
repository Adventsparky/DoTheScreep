const OBSTACLE_OBJECT_TYPES_NO_CREEP = ["spawn", "wall", "source", "constructedWall", "extension", "link", "storage", "tower", "observer", "powerSpawn", "powerBank", "lab", "terminal","nuker"]

let roomCostCache = {};

function roomCost(roomInfo) {
    let roomName=roomInfo.name;
    if(roomCostCache[roomName]) {
        return roomCostCache[roomName];
    }
    let room = Game.rooms[roomName];
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

function planRoads(roomInfo) {console.log('plan roads');
    let roomName=roomInfo.name;
    let room=Game.rooms[roomName];
    roomInfo.spawns.forEach(function(spawn) {

        // utils.spacesAround(room,spawn.pos,function (space) {
        //     room.createConstructionSite(space, STRUCTURE_ROAD);
        // });

        roomInfo.sources.forEach(function (source) {
            let results = PathFinder.search(spawn.pos,
                { pos: source.pos, range: 1 },
                {
                    plainCost: 2,
                    swampCost: 10,
                    roomCallback: roomCost
                });
            if(!results.incomplete) {
                let lastPos;
                results.path.forEach(function(pos) {
                    room.createConstructionSite(pos, STRUCTURE_ROAD);
                    lastPos = pos;
                });
                if(lastPos) {
                    room.createConstructionSite(lastPos, STRUCTURE_CONTAINER);
                    room.memory.sources[source.id].containerPos = lastPos;
                }
            }
        })
    });
}

module.exports = {
    process: function (roomInfo) {
        // if(Game.time % 100 == 0) {
            planRoads(roomInfo);
        // }
    }
};