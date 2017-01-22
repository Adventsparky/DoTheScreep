const Tasks=require('tasks');

const roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let currentlyHarvesting=creep.memory.targetSource;

        // Two checks to set up the harvesting flag only get run when it fills, or empties

        if(!currentlyHarvesting && creep.carry.energy == 0) {
            // We haven't started harvesting yet and we're out of energy, creep's gotta eat
            creep.memory.targetSource = Tasks.findNearestEnergy(creep)
            creep.memory.targetDropoff = false;
        }

        if(currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
            // We were harvesting and now we're full, time to dump
            creep.memory.targetDropoff = Tasks.findBestEnergyDump(creep);
            creep.memory.targetSource = false;

        }

        // Fallback for aimless creeps (like when this code went live, might be able to remove later)
        console.log(JSON.stringify(creep));
        if(!creep.memory.targetSource && !creep.memory.targetDropoff) {
            console.log('aimless harvester: '+creep.name);
            if(creep.carry.energy < creep.carryCapacity) {
                // Find fresh source
                creep.memory.targetSource = Tasks.findNearestEnergy(creep)
            }
            if(creep.carry.energy == creep.carryCapacity) {
                // Find new drop off
                creep.memory.targetDropoff = Tasks.findBestEnergyDump(creep);
            }
        } else {
            console.log('grand harvester : '+creep.name);
        }

        // Keep the setup checks above and these action perform checks separate, these actions need to happen every tick
        if(creep.memory.targetSource) {
            let targetSource = Game.getObjectById(creep.memory.targetSource);
            if(targetSource){
                if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSource);
                }
            }
        }

        if(creep.memory.targetDropoff) {
            let targetDropoff = Game.getObjectById(creep.memory.targetDropoff);
            // Let's make sure it's still a valid energy dump
            if(!Tasks.structureHasSpaceForEnergy(targetDropoff)) {
                targetDropoff = Tasks.findBestEnergyDump(creep);
            }

            if(creep.transfer(targetDropoff, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetDropoff);
            }
        }
    }
};

module.exports = roleHarvester;