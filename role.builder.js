const roleBuilder = {

    run: function(creep, room) {
        // creep.say('b');
        creep.findNearestOrLeastBusySource(room);
        let buildingSites = room.constructionsites;
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
            Tasks.buildNearestStructure(creep, room);
        }
        else {
            if(creep.carry.energy == creep.carryCapacity) {
                // drop it off
                // Find new drop off
                if(!creep.memory.targetDropoff) {
                    Tasks.findBestEnergyDump(creep, room);
                }
                delete creep.memory.targetSource;
                delete creep.memory.targetStorageSource;
                creep.depositEnergy(room);
            } else {
                // collect energy
                if (!creep.memory.targetSource) {
                    creep.findNearestOrLeastBusySource(room);
                }
                delete creep.memory.targetDropoff;
                creep.collectEnergy();
            }
        }
    }
};

module.exports = roleBuilder;