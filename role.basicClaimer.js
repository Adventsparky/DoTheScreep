const Tasks=require('tasks');
const Query=require('data');

const roleBasicClaimer = {

    run: function(creep, room) {
        // creep.say('b-c');
        let claimFlag = Game.flags['claim-room'];
        if (claimFlag) {

            if (claimFlag.room == creep.room) {
                let closestUnclaimedController = _.filter(enemyData.enemyStructures, function (structure) {
                    if (structure.structureType == STRUCTURE_CONTROLLER) {
                        return structure;
                    }
                });

                if (closestUnclaimedController[0]) {
                    creep.moveTo(closestUnclaimedController[0]);
                    creep.claimController(closestUnclaimedController[0]);
                } else {

                    let controller = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER});
                    console.log(controller);
                    if (controller && controller[0]) {
                        if (!controller[0].my && controller[0].level == 0) {
                            creep.moveTo(controller[0]);
                            creep.claimController(controller[0]);
                        } else if (controller[0].my) {

                            // Literally harvester code
                            let currentlyHarvesting = creep.memory.targetSource || creep.memory.targetStorageSource;

                            // Two checks to set up the harvesting flag only get run when it fills, or empties
                            // Tasks.findNearestOrLeastBusySource(creep);

                            if (!currentlyHarvesting && creep.carry.energy == 0) {
                                // We haven't started harvesting yet and we're out of energy, creep's gotta eat
                                Tasks.findNearestOrLeastBusySource(creep, room);
                                delete creep.memory.targetDropoff;
                            }

                            if (currentlyHarvesting && creep.carry.energy == creep.carryCapacity) {
                                // We were harvesting and now we're full, time to dump
                                creep.memory.targetDropoff = controller[0];
                                delete creep.memory.targetSource;
                                delete creep.memory.targetStorageSource;
                            }
                        }

                        Tasks.collectEnergy(creep);
                        Tasks.depositEnergy(creep, room);

                    }
                }
            } else {
                creep.moveTo(claimFlag);
            }
        }

    }
};

module.exports = roleBasicClaimer;