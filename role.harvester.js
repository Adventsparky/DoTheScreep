const Tasks=require('tasks');

const roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.carry.energy < creep.carryCapacity) {
            // If the creep is hungry, eat
            Tasks.collectNearestEnergyToHomeBase(creep)
        } else {
            // Not hungry, xmas stuffed, dump required!
            Tasks.pickBestEnergyDump(creep);
        }
    }
};

module.exports = roleHarvester;