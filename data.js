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
     * TERRAIN
     */
    countAccessibleSpacesAroundStructure(structure) {
        console.log('Check '+structure);
        let spaces=0;


        // Checking the immediate spaces so start top right
        let x=structure.pos.x - 1;
        let y=structure.pos.y - 1;

        console.log('Structure xy: '+structure.pos.x+','+structure.pos.y);
        console.log('Start xy: '+x+','+y);

        console.log('End xy: '+x+','+y);
        console.log(spaces+' empty spaces around '+structure);

    }
};
