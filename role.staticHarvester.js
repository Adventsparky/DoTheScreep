const Tasks=require('tasks');

const roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let currentlyHarvesting=creep.memory.targetSource;

        if(!currentlyHarvesting && creep.carry.energy == 0) {
            // We haven't started harvesting yet and we're out of energy, creep's gotta eat
            Tasks.findNearestEnergy(creep)
        }

        if(currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
            // We were harvesting and now we're full, time to dump
            Tasks.findBestEnergyDump(creep);
        }

        // Fallback for aimless creeps (like when this code went live, might be able to remove later)
        if(!creep.memory.targetSource && !creep.memory.targetDropoff) {
            if(creep.carry.energy < creep.carryCapacity) {
                // Find fresh source
                Tasks.findNearestEnergy(creep)
                delete creep.memory.targetDropoff;
            }
            if(creep.carry.energy == creep.carryCapacity) {
                // Find new drop off
                Tasks.findBestEnergyDump(creep);
                delete creep.memory.targetSource;
            }
        }

        Tasks.collectEnergy(creep);
        Tasks.depositEnergy(creep);
    }
};

module.exports = roleHarvester;