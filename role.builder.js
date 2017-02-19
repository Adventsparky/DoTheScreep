const roleBuilder = {

    run: function(creep, roomInfo) {
        // creep.say('b');

        if (creep.carry.energy == 0 && !creep.currentlyHarvesting) {
            delete creep.memory.building;
            creep.findNearestOrLeastBusySource(roomInfo);
        } else if (!creep.currentlyHarvesting && !creep.memory.targetConstruction && creep.carry.energy>0) {
            // Find a new building if we have energy and are fin
            creep.findNearestConstructionTowerContainerExtensionRampartWall(roomInfo);
            if (creep.memory.targetConstruction) {
                this.memory.building=true;
                creep.buildNearestStructure(roomInfo);
            } else {
                // Nothing to build, but we have energy
            }
        }

        // Aimless creeps who get their cycles broken particular when collecting or dumping
        // energy and the target filled/expired/destroyed
        if (creep.hasNoPurposeInLife()) {
            creep.getABasicJob(roomInfo);
        }

        if(!creep.currentlyBuilding) {
            if(creep.carry.energy == creep.carryCapacity) {
                if(!creep.memory.targetDropoff) {
                    creep.findBestEnergyDump(roomInfo);
                }
                creep.depositEnergy(roomInfo);
            } else if (creep.currentlyHarvesting){
                creep.collectEnergy();
            }
        }
    }
};

module.exports = roleBuilder;