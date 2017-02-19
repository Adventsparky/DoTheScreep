const ticksToLiveToPerformSwap=150;

const roleStaticHarvester = {

    run: function(creep, roomInfo) {
        console.log(' - - - Static - - - ');

        // Get to mainSpawn, find a source without a flag for static harvest
        let source=null;

        if (creep.memory.targetSource) {
            console.log(creep.memory.targetSource);
            source = _.find(roomInfo.availableSources, function (source) {
                console.log(source);
                console.log(source.id);
                return source.id == creep.memory.targetSource;
            });
        }

        if (!creep.memory.targetSource || !source) {
            let potentialSources=_.sortBy(roomInfo.availableSources, s => creep.pos.getRangeTo(s));
            let closestSourceWithoutStaticOrNeedsReplacing = _.find(potentialSources, function (source) {
                return !Memory.dedicatedMiners[source.id]
                    || !Game.getObjectById(Memory.dedicatedMiners[source.id])
                    || (Game.getObjectById(Memory.dedicatedMiners[source.id]).ticksToLive < ticksToLiveToPerformSwap);
            });
            if (closestSourceWithoutStaticOrNeedsReplacing) {
                creep.memory.targetSource = closestSourceWithoutStaticOrNeedsReplacing.id;
                source=closestSourceWithoutStaticOrNeedsReplacing;
            }
        }

        console.log(JSON.stringify(source));

        // We have our target, check if there's a container spot there already
        if (source && source.container) {

            let sourceContainer=Game.getObjectById(source.container);
            let dedicatedMiner=Memory.dedicatedMiners[source.id];

            if (sourceContainer) {
                console.log('lets go');
                // Check are we where we need to be
                if (creep.pos.x != sourceContainer.pos.x || creep.pos.y != sourceContainer.pos.y) {
                    console.log('not there');
                    // If non static source, move in directly
                    if (!dedicatedMiner || dedicatedMiner==creep.id) {
                        console.log('go go');
                        creep.moveTo(sourceContainer.pos);
                    } else {
                        // Check for a swap
                        let currentHarvester = Game.creeps[dedicatedMiner];
                        if (!currentHarvester || currentHarvester.ticksToLive < ticksToLiveToPerformSwap) {
                            //     // Move towards the spot and when we're 5 spaces away, tell the previous worker to, um, "retire"
                            creep.moveTo(source.container.pos);
                            let distanceLeftToTravel = creep.pos.getRangeTo(sourceContainer.pos);
                            if (distanceLeftToTravel <= 5 && currentHarvester && !currentHarvester.memory.p45) {
                                currentHarvester.memory.p45 = true;
                            }
                        }
                    }
                }

                // If we're in place, get workin'
                if (creep.pos.x == sourceContainer.pos.x || creep.pos.y == sourceContainer.pos.y) {
                    console.log('there');
                    Memory.dedicatedMiners[source.id] = creep.id;
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
            // this.addEntryToSpawnQueue(this.spawnQueueEntry(roomInfo, creep.memory.role));
        }
    }
};

module.exports = roleStaticHarvester;