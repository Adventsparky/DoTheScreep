const roleBuilder = {

    run: function(creep, roomInfo) {
        // creep.say('b');
        console.log(roomInfo);
        console.log(JSON.stringify(roomInfo));
        creep.findNearestOrLeastBusySource(roomInfo);
        let buildingSites = roomInfo.constructionsites;
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            delete creep.memory.targetDropoff;
            delete creep.memory.targetConstruction;
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
                Tasks.findNearestConstructionTowerContainerExtensionRampartWall(creep);
            }
            Tasks.buildNearestStructure(creep, roomInfo);
        }
        else {
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
                // collect energy
                if (!creep.memory.targetSource) {
                    creep.findNearestOrLeastBusySource(roomInfo);
                }
                delete creep.memory.targetDropoff;
                creep.collectEnergy();
            }
        }
    }
};

module.exports = roleBuilder;