const ticksToLiveToPerformSwap=150;

const roleStaticHarvester = {

    run: function(creep, roomInfo) {
        // Get to mainSpawn, find a source without a flag for static harvest
        let source=null;

        if (creep.memory.p45) {
            // move to spawn or grave
            let target=roomInfo.grave ? roomInfo.grave : roomInfo.mainSpawn;
            let targetPos=null;

            if (target && target.pos) {
                targetPos = target.pos;
            }

            if (targetPos) {
                if (roomInfo.grave) {
                    if (creep.pos.x != targetPos.x || creep.pos.y != targetPos.y) {
                        creep.moveTo(targetPos);
                    }
                } else{
                    if (!creep.pos.isNearTo(targetPos)){
                        creep.moveTo(targetPos);
                    }
                }
            }
        }

        if (creep.currentlyHarvesting()) {

            // Check we have the reserved spot
            let creepOnThisSpot=Memory.dedicatedMiners[creep.memory.targetSource];
            if (creepOnThisSpot) {
                let currentHarvester = Game.getObjectById(creepOnThisSpot);
                // Someone is on the spot, someone must have taken it??
                if (creepOnThisSpot != creep.id && currentHarvester && currentHarvester.ticksToLive > ticksToLiveToPerformSwap) {
                    // SOL
                    delete creep.memory.targetSource;
                    // console.log('Someone else is the miner. '+creep.id+' checked, found: '+creepOnThisSpot);
                    return;
                }
            }

            source = _.find(roomInfo.availableSources, function (source) {
                return source.id == creep.currentlyHarvesting();
            });
        }

        if (!creep.currentlyHarvesting() || !source) {
            console.log('find somewhere to take over');
            let potentialSources=_.sortBy(roomInfo.availableSources, s => creep.pos.getRangeTo(s));
            let closestSourceWithoutStaticOrNeedsReplacing = _.find(potentialSources, function (source) {
                let creepOnThisSpot=Memory.dedicatedMiners[source.id];
                return !creepOnThisSpot
                    || !Game.getObjectById(creepOnThisSpot)
                    || (Game.getObjectById(creepOnThisSpot).ticksToLive < ticksToLiveToPerformSwap);
            });
            if (closestSourceWithoutStaticOrNeedsReplacing) {
                creep.memory.targetSource = closestSourceWithoutStaticOrNeedsReplacing.id;
                source=closestSourceWithoutStaticOrNeedsReplacing;
            }
        }

        // We have our target, check if there's a container spot there already
        if (source && source.container) {
            // console.log('static decisions');
            // console.log(creep.id);

            let sourceContainer=Game.getObjectById(source.container);
            let dedicatedMiner=Memory.dedicatedMiners[source.id];
            // console.log(dedicatedMiner);

            if (sourceContainer) {
                // Check are we where we need to be
                if (creep.pos.x != sourceContainer.pos.x || creep.pos.y != sourceContainer.pos.y) {
                    // If non static source, move in directly
                    let currentHarvester = Game.getObjectById(dedicatedMiner);
                    if (!dedicatedMiner || dedicatedMiner==creep.id) {
                        creep.moveTo(sourceContainer.pos);
                    } else {
                        console.log('should tag in for '+currentHarvester);
                        // Check for a swap
                        if (!currentHarvester || currentHarvester.ticksToLive < ticksToLiveToPerformSwap) {
                            //     // Move towards the spot and when we're 5 spaces away, tell the previous worker to, um, "retire"
                            creep.moveTo(sourceContainer.pos);
                            let distanceLeftToTravel = creep.pos.getRangeTo(sourceContainer.pos);
                            if (distanceLeftToTravel <= 2 && currentHarvester && !currentHarvester.memory.p45) {
                                currentHarvester.memory.p45 = true;
                                creep.say('Piss off');
                                Memory.dedicatedMiners[source.id] = creep.id;
                            }
                        }
                    }
                }

                // If we're in place, get workin'
                if (creep.pos.x == sourceContainer.pos.x && creep.pos.y == sourceContainer.pos.y) {
                    Memory.dedicatedMiners[source.id] = creep.id;
                    creep.collectEnergy();
                }
            }
        }


        // Dump
        if (creep.carry > 0) {
            creep.drop(RESOURCE_ENERGY, creep.carry);
        }

        // Am I dying?
        if (creep.ticksToLive < ticksToLiveToPerformSwap && !creep.memory.calledreplacement) {
            // Uh oh, I need replacing
            creep.room.addEntryToSpawnQueue(roomInfo, creep.memory.role);
            creep.memory.calledreplacement=true;
        }

        // Am I deth but wasn't replaced?
        if (creep.ticksToLive < 5) {
            let targetSourceId=creep.memory.targetSource;
            if (targetSourceId) {
                let dedicatedMinerId=Memory.dedicatedMiners[targetSourceId];
                if (dedicatedMinerId) {
                    if (dedicatedMinerId == creep.id) {
                        // uh oh
                        // console.log('Last ditch static cleanup, handover didnt happen from '+creep);
                        delete Memory.dedicatedMiners[targetSourceId];
                        delete creep.memory.targetSource;
                    }
                }
            }
            // creep.room.addEntryToSpawnQueueIfNotThereAlready(roomInfo, creep.memory.role);
        }
    }
};

module.exports = roleStaticHarvester;