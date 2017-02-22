'use strict';

const Utils=require('tasks');

Room.prototype.countAccessibleSpacesAroundPoint = function(pos) {
    // console.log('Check '+pos+' in '+room);
    let spaces=0;

    // Checking the immediate spaces so start top right
    let x=pos.x - 1;
    let y=pos.y - 1;

    // console.log('Structure xy: '+structure.pos.x+','+structure.pos.y);
    // console.log('Start xy: '+x+','+y);

    for(let i=0; i<3; i++) {
        y=pos.y - 1;
        for(let j=0; j<3; j++) {
            // console.log('Check: '+x+','+y);
            // console.log(Game.map.getTerrainAt(x,y,room.name));
            if(Game.map.getTerrainAt(x,y,this.name) == 'plain' ||
                Game.map.getTerrainAt(x,y,this.name) == 'swamp') {
                spaces++;
            }
            y++;
        }
        x++;
    }
    // console.log('Found '+spaces+' '+pos+' in '+room);
    return spaces;
};

Room.prototype.locateContainersAroundPoint = function(pos, availableStructures) {
    // console.log('Check '+pos+' in '+pos.room);
    let container=null;

    // We have min and max xy to check, load the containers and check if we have one here
    // todo fix to use lookAtArea
    _.each(availableStructures, function (structure) {
        if (structure.structureType == STRUCTURE_CONTAINER && structure.pos.isNearTo(pos)) {
            // we have a container
            container=structure;
        }
    });

    return container;
};

Room.prototype.addEntryToSpawnQueue = function(roomInfo, roleName) {
    Utils.addEntryToSpawnQueue(roomInfo, roleName);
};