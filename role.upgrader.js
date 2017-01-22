const Tasks=require('tasks');
const Query=require('data');

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
            Tasks.upgradeController(creep);
        } else {
            if(!creep.memory.targetSource) {
                console.log('Time for a new source')
                let controllerInThisRoom=Query.controllerInCreepRoom(creep);
                if(controllerInThisRoom) {
                    Tasks.findNearestEnergyToStructure(creep,controllerInThisRoom);
                }
            }
            Tasks.collectEnergy(creep);
        }
    }
};

module.exports = roleUpgrader;