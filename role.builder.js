const Tasks=require('tasks');

const roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.say('b');
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            delete creep.memory.targetDropoff;
            delete creep.memory.targetConstruction;
            creep.say('Gathering');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            delete creep.memory.targetSource;
            delete creep.memory.targetStorageSource;
            creep.say('Building');
        }

        if(creep.memory.building) {
            if(!creep.memory.targetConstruction){
                Tasks.findNearestConstructionTowerContainerExtensionRampartWall(creep);
            }
            Tasks.buildNearestStructure(creep);
        }
        else {
            if(creep.carry.energy == creep.carryCapacity) {
                // drop it off
                // Find new drop off
                if(!creep.memory.targetDropoff) {
                    Tasks.findBestEnergyDump(creep);
                }
                delete creep.memory.targetSource;
                delete creep.memory.targetStorageSource;
                Tasks.depositEnergy(creep);
            } else {
                // collect energy
                if (!creep.memory.targetSource) {
                    Tasks.findNearestOrLeastBusySource(creep);
                }
                delete creep.memory.targetDropoff;
                Tasks.collectEnergy(creep);
            }
        }
    }
};

module.exports = roleBuilder;