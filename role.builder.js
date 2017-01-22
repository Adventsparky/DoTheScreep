const Tasks=require('tasks');

const roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.say('b');
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('Gathering');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('Building');
        }

        if(creep.memory.building) {
            Tasks.buildNearestStructure(creep);
        }
        else {
            Tasks.findNearestEnergy(creep);
        }
    }
};

module.exports = roleBuilder;