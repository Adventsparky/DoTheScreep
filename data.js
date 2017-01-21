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
            "work": 20,
            "heal": 200,
            "tough": 20,
            "attack": 80,
            "ranged_attack": 150
        };
    },
    countRolesInRoom: function(checkRoomName, checkRole) {
        console.log('Check '+checkRole+' in '+checkRoomName)
        let checkRoom = _.find(Memory.roomInfo, function(room){
            return room.name == checkRoomName;
        });
        if(checkRoom){
            return _.filter(checkRoom.creeps, function(creep) {
                return creep.memory.role == checkRole;
            });
        }
        return 0;
    }
};
