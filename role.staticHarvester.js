const Tasks=require('tasks');

const roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.say('h');
        let currentlyHarvesting=creep.memory.targetSource;

        // Two checks to set up the harvesting flag only get run when it fills, or empties

        if(!currentlyHarvesting && creep.carry.energy == 0) {
            // We haven't started harvesting yet and we're out of energy, creep's gotta eat
            Tasks.findNearestEnergy(creep);
            delete creep.memory.targetDropoff;
        }

        if(currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
            // We were harvesting and now we're full, time to dump
            creep.memory.targetDropoff = Tasks.findBestEnergyDump(creep);
            delete creep.memory.targetSource;

        }

        // Fallback for aimless creeps (like when this code went live, might be able to remove later)
        // console.log(JSON.stringify(creep));
        if(!creep.memory.targetSource && !creep.memory.targetDropoff) {
            // console.log('aimless harvester: '+creep.name);
            if(creep.carry.energy < creep.carryCapacity) {
                // Find fresh source
                Tasks.findNearestEnergy(creep);
                delete creep.memory.targetDropoff;
            }
            if(creep.carry.energy == creep.carryCapacity) {
                // Find new drop off
                Tasks.findBestEnergyDump(creep);
                delete creep.memory.targetSource;
            }
        } else {
            // console.log('grand harvester : '+creep.name);
        }

        // Keep the setup checks above and these action perform checks separate, these actions need to happen every tick
        Tasks.collectEnergy(creep);
        Tasks.depositEnergy(creep);
    }
};

module.exports = roleHarvester;