const Query=require('data');

const roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
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
                let controllerInThisRoom=Query.controllerInCreepRoom(creep);
                if(controllerInThisRoom) {
                    Tasks.findNearestOrLeastBusySource(creep);
                }
            }
            Tasks.collectEnergy(creep);
        }
    }
};

module.exports = roleUpgrader;