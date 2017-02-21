const roleUpgrader = {

    run: function(creep, roomInfo) {
        // creep.say('u');
        if(roomInfo.controller) {
            if (creep.carry.energy == 0) {
                creep.memory.upgrading = false;
                creep.findNearestOrLeastBusySource(roomInfo);
            }

            if (!creep.currentlyUpgrading() && creep.carry.energy == creep.carryCapacity) {
                creep.memory.upgrading = true;
                delete creep.memory.targetSource;
            }

            // Aimless creeps who get their cycles broken particular when collecting or dumping
            // energy and the target filled/expired/destroyed
            if (creep.hasNoPurposeInLife()) {
                creep.getABasicJob(roomInfo);
            }

            if (creep.currentlyUpgrading()) {
                creep.upgradeControllerInRoom();
            } else {
                creep.collectEnergy();
            }
        }
    }
};

module.exports = roleUpgrader;