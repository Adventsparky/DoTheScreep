const roleBuilder = {

    run: function(creep, roomInfo) {
        // creep.say('b');
        // creep.findNearestOrLeastBusySource(roomInfo);

        if (creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.findNearestOrLeastBusySource(roomInfo);
            creep.collectEnergy();
        } else if (!creep.memory.targetConstruction && creep.carry.energy>0) {
            // Find a new building
            creep.findNearestConstructionTowerContainerExtensionRampartWall(roomInfo);
            creep.buildNearestStructure(roomInfo);
        }

        if(!creep.memory.building) {
            if(creep.carry.energy == creep.carryCapacity) {
                // drop it off
                // Find new drop off
                if(!creep.memory.targetDropoff) {
                    creep.findBestEnergyDump(roomInfo);
                }
                delete creep.memory.targetSource;
                creep.depositEnergy(roomInfo);
            }
        }
    }
};

module.exports = roleBuilder;