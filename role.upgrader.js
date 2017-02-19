const roleUpgrader = {

    run: function(creep, room) {
        // creep.say('u');
        if(room.controller) {
            if (creep.carry.energy == 0) {
                creep.memory.upgrading = false;
                creep.findNearestOrLeastBusySource(room);
            }

            if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
                creep.memory.upgrading = true;
            }

            if (creep.memory.upgrading) {
                creep.upgradeControllerInRoom();
            } else {
                creep.collectEnergy();
            }
        }
    }
};

module.exports = roleUpgrader;