const Tasks=require('tasks');

const roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            Tasks.upgradeController(creep);
        }
        else {
            if(!creep.memory.targetSource) {
                Tasks.findNearestEnergy(creep);
            }
            Tasks.collectEnergy(creep);
        }
    }
};

module.exports = roleUpgrader;