const Tasks=require('tasks');
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
        }

        if(creep.memory.upgrading) {
            Tasks.upgradeController(creep);
        } else {
            if(!creep.memory.targetSource) {
                console.log('Time for a new source');
                let controllerInThisRoom=Query.controllerInCreepRoom(creep);
                if(controllerInThisRoom) {
                    console.log('lets find the closest source to the controller');
                    Tasks.findNearestEnergyToStructure(creep,controllerInThisRoom);
                }
            }
            Tasks.collectEnergy(creep);
        }
    }
};

module.exports = roleUpgrader;