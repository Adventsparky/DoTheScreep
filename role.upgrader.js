const Tasks=require('tasks');

const roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.say('u');
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            console.log('upgrading');
            Tasks.upgradeController(creep);
        } else {
            console.log('need energy');
            if(!creep.memory.targetSource) {
                Tasks.findNearestEnergy(creep);
            }
            console.log('collect at '+creep.memory.targetSource);
            Tasks.collectEnergy(creep);
        }
    }
};

module.exports = roleUpgrader;