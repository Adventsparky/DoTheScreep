const roleHarvester = {

    run: function(creep, roomInfo) {
        // creep.say('h');
        let currentlyHarvesting=creep.memory.targetSource;

        // We haven't started harvesting yet and we're out of energy, creep's gotta eat
        if(!currentlyHarvesting && creep.carry.energy == 0) {
            creep.findNearestOrLeastBusySource(roomInfo);
        }

        // We were harvesting and now we're full, time to dump
        if(currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
            creep.findBestEnergyDump(roomInfo);
        }

        // Fallback for aimless creeps (like when this code went live, might be able to remove later)
        // console.log(JSON.stringify(creep));
        if(!creep.memory.targetSource && !creep.memory.targetDropoff) {
            // console.log(creep+' had no target source or dropoff, gap in workflow?');
            if(creep.carry.energy < creep.carryCapacity) {
                creep.findNearestOrLeastBusySource(roomInfo);
            }
            if(creep.carry.energy == creep.carryCapacity) {
                creep.findBestEnergyDump(roomInfo);
            }
        }

        // Keep the setup checks above and these action perform checks separate, these actions need to happen every tick
        creep.collectEnergy();
        creep.depositEnergy(roomInfo);
    }
};

module.exports = roleHarvester;