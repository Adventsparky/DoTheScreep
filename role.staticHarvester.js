const Tasks=require('tasks');

const roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let room=Memory.roomInfo[creep.room.name];

        // Get to spawn, find a source without a flag for static harvest
        if (!creep.memory.targetSource) {
            let potentialSources=_.sortBy(room.availableSources, s => creep.pos.getRangeTo(s));
            let closestSourceWithoutStaticHarvester = _.find(potentialSources, function (source) {
                return !source.dedicatedMiner;
            });
            if (closestSourceWithoutStaticHarvester) {
                creep.memory.targetSource = closestSourceWithoutStaticHarvester.id;
            }
        }

        let source = _.find(room.availableSources, function (source) {
            return source.id == creep.memory.targetSource;
        });

        // We have our target, check if there's a container spot there already
        if (source.container) {

            // console.log('check we are on the container for this source');
            // This is where we need to sit if we can, if there's a creep on it, wait.
            // console.log('X');
            // console.log(creep.pos.x);
            // console.log(source.container.pos.x);
            // console.log('Y');
            // console.log(creep.pos.y);
            // console.log(source.container.pos.y);
            if (creep.pos.x != source.container.pos.x || creep.pos.y != source.container.pos.y) {
                if (creep.room.lookForAt(LOOK_CREEPS, source.container.pos)) {
                    // We should wait
                    // console.log('we are here already');
                } else{
                    // console.log('moving in');
                    creep.moveTo(source.container.pos);
                }
            } else {
                // console.log('arrived');
                source.dedicatedMiner=creep.id;
                creep.memory.staticMinerContainer=source.container;
                Tasks.collectEnergy(creep);
            }
        } else {

            let harvestResult=Tasks.collectEnergy(creep);
            if (harvestResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.memory.targetSource);
                return;
            } else if (harvestResult == OK) {
                source.dedicatedMiner=creep.id;

                // We got this far check for adjacent container
                if (!creep.memory.staticMinerContainer || !source.container) {
                    // console.log('Ok we are harvesting away not a bother');
                    let closestContainer = _.filter(Memory.roomInfo[creep.room.name].structures, function (structure) {
                        return structure.structureType == STRUCTURE_CONTAINER;
                    });
                    // console.log(closestContainer);
                    // console.log(closestContainer[0]);
                    if (!closestContainer || closestContainer == undefined || closestContainer[0] == undefined || closestContainer[0].pos.x != creep.pos.x || closestContainer[0].pos.y != creep.pos.y) {
                        let nearestSite = _.filter(Memory.roomInfo[creep.room.name].constructions, function (site) {
                            return site.structureType == STRUCTURE_CONTAINER;
                        });
                        if (!nearestSite || nearestSite.pos != creep.pos) {
                            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                        }

                    } else {
                        // console.log('set container stuff');
                        source.container={}=closestContainer[0];
                        creep.memory.staticMinerContainer=closestContainer[0];
                    }
                } else {
                    // console.log('dont check');
                }

                Tasks.collectEnergy(creep);
            }
        }


        // Wait for Container or dump
        if (creep.carry > 0) {
            creep.drop(RESOURCE_ENERGY, creep.carry);
        }
    }
};

module.exports = roleStaticHarvester;