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
                console.log(room_name);
                console.log(creep.room.name);
                if (room_name == creep.room.name) {
                    console.log('ok got the room');
                    console.log(Memory.roomInfo[room_name]);
                    console.log(Memory.roomInfo[room_name].spawn);
                    return Memory.roomInfo[room_name].spawn;
                }
            }
        }
    }
};
