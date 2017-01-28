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

        if (creep.harvest(creep.memory.targetSource) == ERR_NOT_IN_RANGE) {
            console.log('get closer');
            creep.moveTo(creep.memory.targetSource);
            return;
        } else{
            console.log('set source');
            console.log(creep.id);
            source.dedicatedMiner=creep.id;

            // We got this far check for adjacent container
            if (!creep.memory.staticMinerContainer || !source.container) {
                console.log('Ok we are harvesting away not a bother');
                let closestContainer = creep.pos.findClosestByRange(STRUCTURE_CONTAINER);
                if (!closestContainer || closestContainer.pos != creep.pos) {
                    // Is there a site here already?
                    let nearestSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
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