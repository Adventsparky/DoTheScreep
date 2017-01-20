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
        for(let room_name in Game.rooms){
            if(Game.rooms.hasOwnProperty(room_name)) {
                if (room_name === creep.room.name) {
                    return Game.rooms[room_name];
                }
            }
        }
    }
};
