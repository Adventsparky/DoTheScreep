const roleBuilder = {

    run: function(creep, roomInfo) {
        // creep.say('b');

        if (creep.carry.energy == 0 && !creep.currentlyHarvesting()) {
            creep.memory.building=false;
            creep.findNearestOrLeastBusySource(roomInfo);
        } else if (!creep.currentlyHarvesting() && creep.carry.energy>0) {
            // Find a new building if we have energy and are fin
            if (!creep.memory.targetConstruction) {
                creep.findNearestConstructionTowerContainerExtensionRampartWall(roomInfo);
            }
            creep.memory.building=true;
        }

        // Aimless creeps who get their cycles broken particular when collecting or dumping
        // energy and the target filled/expired/destroyed
        if (creep.hasNoPurposeInLife()) {
            console.log(creep+' needs a job');
            creep.getABasicJob(roomInfo);
        }

        if(!creep.currentlyBuilding()) {
            if (creep.currentlyDepositing() && creep.carry.energy > 0) {
                creep.depositEnergy(roomInfo);
            } else if(creep.carry.energy == creep.carryCapacity) {
                if(!creep.memory.targetDropoff) {
                    creep.findBestEnergyDump(roomInfo);
                }
                creep.depositEnergy(roomInfo);
            } else if (creep.currentlyHarvesting()){
                creep.collectEnergy();
            }
        } else {
            console.log(creep+' should build');
            creep.buildStructure(roomInfo);
        }
    }
};

module.exports = roleBuilder;