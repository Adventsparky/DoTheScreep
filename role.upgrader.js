const roleUpgrader = {

    run: function(creep, room) {
        // creep.say('u');
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            delete creep.memory.targetSource;
            delete creep.memory.targetStorageSource;
        }

        if(creep.memory.upgrading) {
            Tasks.upgradeController(creep);
        } else {
            if(!creep.memory.targetSource) {
                if(room.controller) {
                    creep.findNearestOrLeastBusySource(room);
                }
            }
            creep.collectEnergy(creep);
        }
    }
};

module.exports = roleUpgrader;