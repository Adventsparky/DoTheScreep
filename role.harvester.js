const roleHarvester = {

    run: function(creep, roomInfo) {
        // creep.say('h');
        // We haven't started harvesting yet and we're out of energy, creep's gotta eat
        if(!creep.currentlyHarvesting && creep.carry.energy == 0) {
            creep.findNearestOrLeastBusySource(roomInfo);
        }

        // We were harvesting and now we're full, time to dump
        if(creep.currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
            creep.findBestEnergyDump(roomInfo);
        }

        // Aimless creeps who get their cycles broken particular when collecting or dumping
        // energy and the target filled/expired/destroyed
        if (creep.hasNoPurposeInLife()) {
            creep.getABasicJob(roomInfo);
        }

        // Keep the setup checks above and these action perform checks separate, these actions need to happen every tick
        creep.collectEnergy();
        creep.depositEnergy(roomInfo);
    }
};

module.exports = roleHarvester;