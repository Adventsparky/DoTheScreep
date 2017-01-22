const Tasks=require('tasks');

const roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let currentlyHarvesting=creep.memory.targetSource;
console.log('here1');
        if(!currentlyHarvesting && creep.carry.energy == 0) {
            console.log('here2');
            // We haven't started harvesting yet and we're out of energy, creep's gotta eat
            creep.memory.targetSource = Tasks.findNearestEnergy(creep)
        }

        if(currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
            console.log('here3');
            // We were harvesting and now we're full, time to dump
            creep.memory.targetDropoff = Tasks.findBestEnergyDump(creep);
        }
        console.log('here4');

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
        } else if(creep.memory.targetDropoff) {
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