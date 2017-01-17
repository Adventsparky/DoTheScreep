var manCave=Game.spawns.Bastion;
var tasks=require('tasks');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy < creep.carryCapacity) {
            // If the creep is hungry, eat
            tasks.collectNearestEnergy(creep)
        } else {
            // Not hungry, xmas stuffed, dump required!
            tasks.pickBestEnergyDump(creep);
        }
    }
};

module.exports = roleHarvester;