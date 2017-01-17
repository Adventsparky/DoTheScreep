const Tasks=require('tasks');

const roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('hungry');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('building');
        }

        if(creep.memory.building) {
            Tasks.buildNearestStructure(creep);
        }
        else {
            Tasks.collectNearestEnergy(creep);
        }
    }
};

module.exports = roleBuilder;