const roleBuilder = {

    run: function(creep, roomInfo) {
        // creep.say('b');
        // creep.findNearestOrLeastBusySource(roomInfo);
        let buildingSites = roomInfo.constructionsites;
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            delete creep.memory.targetDropoff;
            // delete creep.memory.targetConstruction;
            creep.say('Gathering');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity && buildingSites && buildingSites[0]) {
            creep.memory.building = true;
            delete creep.memory.targetSource;
            delete creep.memory.targetStorageSource;
            creep.say('Building');
        }

        if(creep.memory.building) {
            if(!creep.memory.targetConstruction){
                creep.findNearestConstructionTowerContainerExtensionRampartWall(roomInfo);
            }
            creep.buildNearestStructure(roomInfo);
        }
        else {
            if (creep.memory.targetSource || creep.memory.targetStorageSource) {
                if (creep.collectEnergy() == ERR_NOT_ENOUGH_RESOURCES ) {
                    delete creep.memory.targetSource;
                    delete creep.memory.targetStorageSource;
                    return
                }
            }

            if(creep.carry.energy == creep.carryCapacity) {
                // drop it off
                // Find new drop off
                if(!creep.memory.targetDropoff) {
                    creep.findBestEnergyDump(roomInfo);
                }
                delete creep.memory.targetSource;
                delete creep.memory.targetStorageSource;
                creep.depositEnergy(roomInfo);
            } else {
                // new source and collect energy if we need to, otherwise we collected it already
                if (!creep.memory.targetSource && !creep.memory.targetStorageSource) {
                    creep.findNearestOrLeastBusySource(roomInfo);
                    delete creep.memory.targetDropoff;
                    creep.collectEnergy();
                }
            }
        }
    }
};

module.exports = roleBuilder;