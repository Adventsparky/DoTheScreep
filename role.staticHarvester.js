const roleStaticHarvester = {

    run: function(creep, room) {

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