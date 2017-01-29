const Tasks=require('tasks');

const roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let room=Memory.roomInfo[creep.room.name];

        // Get to spawn, find a source without a flag for static harvest
        if (!creep.memory.targetSource) {
            let closestSourceWithoutStaticHarvester = _.find(room.availableSources, function (source) {
                return !source.staticHarvester;
            });
            if (closestSourceWithoutStaticHarvester) {
                creep.memory.targetSource = closestSourceWithoutStaticHarvester.id;
            }
        }

        let source = _.find(room.availableSources, function (source) {
            return source.id == creep.memory.targetSource;
        });

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
                if (!closestContainer || Game.getObjectById(creep.memory.targetSource).pos != creep.pos) {
                    let nearestSite = _.filter(Memory.roomInfo[creep.room.name].constructions, function (site) {
                        return site.structureType == STRUCTURE_CONTAINER;
                    });
                    if (!nearestSite || nearestSite.pos != creep.pos) {
                        creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                    }

                } else {
                    source.container=closestContainer;
                    creep.memory.staticMinerContainer=closestContainer;
                }
            }
        }

        Tasks.collectEnergy(creep);

        // Wait for Container or dump
        if (creep.carry > 0) {
            creep.drop(RESOURCE_ENERGY, creep.carry);
        }
    }
};

module.exports = roleStaticHarvester;