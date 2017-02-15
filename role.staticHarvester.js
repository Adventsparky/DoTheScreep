const ticksToLiveToPerformSwap=150;

const roleStaticHarvester = {

    run: function(creep, room) {

        // Get to mainSpawn, find a source without a flag for static harvest
        if (!creep.memory.targetSource) {
            let potentialSources=_.sortBy(room.availableSources, s => creep.pos.getRangeTo(s));
            let closestSourceWithoutStaticOrNeedsReplacing = _.find(potentialSources, function (source) {
                return !source.dedicatedMiner || Game.creeps[source.dedicatedMiner].ticksToLive < ticksToLiveToPerformSwap;
            });
            if (closestSourceWithoutStaticOrNeedsReplacing) {
                creep.memory.targetSource = closestSourceWithoutStaticOrNeedsReplacing.id;
            }
        }

        let source = _.find(room.availableSources, function (source) {
            return source.id == creep.memory.targetSource;
        });

        // We have our target, check if there's a container spot there already
        if (source.container) {

            let sourceContainer=Game.getObjectById(source.container);

            if (sourceContainer) {
                // Check are we where we need to be
                if (creep.pos.x != sourceContainer.pos.x || creep.pos.y != sourceContainer.pos.y) {
                    // If non static source, move in directly
                    if (!source.dedicatedMiner) {
                        creep.moveTo(sourceContainer.pos);
                    } else {
                        // Check for a swap
                        let currentHarvester = Game.creeps[source.dedicatedMiner];
                        if (!currentHarvester || currentHarvester.ticksToLive < ticksToLiveToPerformSwap) {
                            // Move towards the spot and when we're 5 spaces away, tell the previous worker to, um, "retire"
                            creep.moveTo(source.container.pos);
                            let distanceLeftToTravel = creep.pos.getRangeTo(sourceContainer.pos);
                            if (distanceLeftToTravel <= 5) {
                                currentHarvester.memory.p45 = true;
                            }
                        }
                    }
                }

                // If we're in place, get workin'
                if (creep.pos.x == sourceContainer.pos.x || creep.pos.y == sourceContainer.pos.y) {
                    source.dedicatedMiner = creep.id;
                    creep.collectEnergy();
                }
            }
        }


        // Wait for Container or dump
        if (creep.carry > 0) {
            creep.drop(RESOURCE_ENERGY, creep.carry);
        }

        // Am I dying?
        if (creep.ticksToLive < ticksToLiveToPerformSwap) {
            // Uh oh, I need replacing
            Memory.highPrioritySpawns.push({'room':creep.memory.room, 'role':creep.memory.role});
        }
    }
};

module.exports = roleStaticHarvester;