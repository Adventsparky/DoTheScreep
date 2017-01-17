var Tasks=require('tasks');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy < creep.carryCapacity) {
            // If the creep is hungry, eat
            Tasks.collectNearestEnergy(creep)
        } else {
            // Not hungry, xmas stuffed, dump required!
            Tasks.pickBestEnergyDump(creep);
        }
    }
};

module.exports = roleHarvester;