const roleHarvester = {

    run: function(creep, roomInfo) {
        // creep.say('h');
        let currentlyHarvesting=creep.memory.targetSource || creep.memory.targetStorageSource;

        // Two checks to set up the harvesting flag only get run when it fills, or empties
        // Tasks.findNearestOrLeastBusySource(creep);

        if(!currentlyHarvesting && creep.carry.energy == 0) {
            // We haven't started harvesting yet and we're out of energy, creep's gotta eat
            creep.findNearestOrLeastBusySource(roomInfo);
            delete creep.memory.targetDropoff;
        }

        if(currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
            // We were harvesting and now we're full, time to dump
            creep.memory.targetDropoff = creep.findBestEnergyDump(roomInfo);
            delete creep.memory.targetSource;
            delete creep.memory.targetStorageSource;
        }

        // Fallback for aimless creeps (like when this code went live, might be able to remove later)
        // console.log(JSON.stringify(creep));
        if(!creep.memory.targetSource && !creep.memory.targetStorageSource && !creep.memory.targetDropoff) {
            // console.log('aimless harvester: '+creep.name);
            if(creep.carry.energy < creep.carryCapacity) {
                // Find fresh source
                creep.findNearestOrLeastBusySource(roomInfo);
                delete creep.memory.targetDropoff;
            }
            if(creep.carry.energy == creep.carryCapacity) {
                // Find new drop off
                creep.findBestEnergyDump(roomInfo);
                delete creep.memory.targetSource;
                delete creep.memory.targetStorageSource;
            }
        } else {
            // console.log('grand harvester : '+creep.name);
        }

        // Keep the setup checks above and these action perform checks separate, these actions need to happen every tick
        creep.collectEnergy();
        creep.depositEnergy(roomInfo);
    }
};

module.exports = roleHarvester;