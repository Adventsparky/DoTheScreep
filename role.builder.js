const roleBuilder = {

    run: function(creep, roomInfo) {
        // creep.say('b');
        // creep.findNearestOrLeastBusySource(roomInfo);

        let currentlyHarvesting=creep.memory.targetSource;
        let currentlyBuilding=creep.memory.building;

        if (creep.carry.energy == 0 && !currentlyHarvesting) {
            creep.memory.building = false;
            creep.findNearestOrLeastBusySource(roomInfo);
        } else if (!currentlyHarvesting && !creep.memory.targetConstruction && creep.carry.energy>0) {
            // Find a new building if we have energy and are fin
            creep.findNearestConstructionTowerContainerExtensionRampartWall(roomInfo);
            if (creep.memory.targetConstruction) {
                this.memory.building=true;
                creep.buildNearestStructure(roomInfo);
            } else {
                // Nothing to build, but we have energy
            }
        }

        // Fallback for aimless creeps (like when this code went live, might be able to remove later)
        // console.log(JSON.stringify(creep));
        if(!creep.memory.targetSource && !creep.memory.targetDropoff) {
            console.log(creep+' had no target source or dropoff, gap in workflow?');
            if(creep.carry.energy < creep.carryCapacity) {
                creep.findNearestOrLeastBusySource(roomInfo);
            }
            if(creep.carry.energy == creep.carryCapacity) {
                creep.findBestEnergyDump(roomInfo);
            }
        }

        if(!currentlyBuilding) {
            if(creep.carry.energy == creep.carryCapacity) {
                // drop it off
                // Find new drop off
                if(!creep.memory.targetDropoff) {
                    creep.findBestEnergyDump(roomInfo);
                }
                creep.depositEnergy(roomInfo);
            } else if (currentlyHarvesting){
                creep.collectEnergy();
            }
        }
    }
};

module.exports = roleBuilder;