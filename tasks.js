const Query=require('data');
const RoleManager=require('manager.role');

module.exports = {

    /*
     * ENERGY
     */
    // findNearestEnergy: function(creep) {
    //     let closestSource=creep.pos.findClosestByRange(FIND_SOURCES);
    //     if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
    //         creep.memory.targetSource = closestSource.id;
    //         delete creep.memory.targetDropoff; // This will only be for harvesters
    //     }
    // },
    // findNearestEnergyToStructure: function(creep,structure) {
    //     let closestSource=structure.pos.findClosestByRange(FIND_SOURCES);
    //     if(closestSource) {
    //         creep.memory.targetSource=closestSource.id;
    //         delete creep.memory.targetDropoff; // This will only be for harvesters
    //     }
    // },

    /*
     * CONSTRUCTION
     */
    // Pointless check, it's not paid from mainSpawn, it's filled
    // buildingTypeAffordable: function(type) {
    //     return this.energyAvailable() >= CONSTRUCTION_COST[type];
    // },
    checkForExtensionsAndRoadConstruction : function (roomInfo) {
        // We should have roads right beside the mainSpawn, extensions will be diagonal

        // Go out from mainSpawn one ring at a time looking for open (non wall, road and extensions will overlap) 3x3 areas to build new spawns
        // ring one is special, extension at 3 corners only (one reserved for grave)

        // It's ALIVE!!
        // [11:33:46 PM]  o,x,o
        // [11:33:46 PM]  x,-,x
        // [11:33:46 PM]  o,x,x
        // [11:33:46 PM]o,x,o,x,o
        // [11:33:46 PM]x,-,-,-,x
        // [11:33:46 PM]o,-,-,-,o
        // [11:33:46 PM]x,-,-,-,x
        // [11:33:46 PM]o,x,o,x,o

        if (!roomInfo.extensionBuilderSource) {
            return;
        }
        let extensionBuilderSource=roomInfo.extensionBuilderSource;
        let forbiddenXs=[extensionBuilderSource.x];
        let forbiddenYs=[extensionBuilderSource.y];

        // This is the total number of extensions we are ready to build
        let availableExtensionsCount=Query.numberOfBuildingTypeAvailable(STRUCTURE_EXTENSION, roomInfo);
        if (availableExtensionsCount == 0) {
            return;
        }
        console.log(availableExtensionsCount+' available extensions');

        // This is a limiter for how far out we should spin
        let emergencyLoopCounter=0;
        let innerLoopCounter=0;
        let loopRange=3;

        // Kick off point is always the mainSpawn
        let startX=extensionBuilderSource.x;
        let startY=extensionBuilderSource.y;

        // 10 ring spins is too many, something went wrong
        // let emergencyLoopStop=2;

        // let checked=0;

        // while(availableExtensions > 0 && emergencyLoopStop>0) {
        let allowOnForbidden = true;
        // console.log('Loop level: '+loopCounter);
        // console.log('allow on forbidden: '+ allowOnForbidden);

        // console.log('Loop range: '+loopRange);

        // RING
        while (availableExtensionsCount > 0 && emergencyLoopCounter<15) {

            innerLoopCounter++;
            emergencyLoopCounter++;

            allowOnForbidden=!allowOnForbidden;

            startX=extensionBuilderSource.x - innerLoopCounter;
            startY=extensionBuilderSource.y - innerLoopCounter;

            let newForbiddenXs=[];
            let newForbiddenYs=[];

            let x=startX;

            // COLUMN
            for(let i=0; i < loopRange; i++) {

                x = Query.safeCoord(x, 2);

                let y=startY;
                let rowStuff=[];

                // ROW
                for (let j = 0; j < loopRange; j++) {

                    y = Query.safeCoord(y, 2);

                    let checkPos=new RoomPosition(x, y, roomInfo.name);
                    // console.log('checking '+checkPos);

                    // Only loop down the whole column, if it's the first or last X, otherwise we only need the top and bottom
                    if (checkPos.x != startX && checkPos.x != (startX + loopRange - 1)) {
                        if(checkPos.y > startY && checkPos.y < (startY + loopRange - 1)) {
                            //  console.log('this is a centre location, skip: '+x+','+y);
                            y++;
                            rowStuff.push('-');
                            continue;
                        }
                    }

                    // checked++;

                    let room=Game.rooms[roomInfo.name];
                    let canWeBuildHere = Query.checkIfSiteIsSuitableForExtensionConstruction(checkPos,room);
                    // console.log(canWeBuildHere);

                    if (!_.contains(forbiddenXs, checkPos.x) && !_.contains(forbiddenYs, checkPos.y) &&
                        (!roomInfo.gravePos || !(checkPos.x == roomInfo.gravePos.x && checkPos.y == roomInfo.gravePos.y))) {
                        // console.log('Found a site at ' + x + ',' + y);

                        if(canWeBuildHere){
                            // room.createFlag(x,y,''+x+y,COLOR_YELLOW);

                            //  let flag=Game.flags[''+x+y];
                            //  if (flag){
                            //      flag.remove();
                            //  }

                            if (room.createConstructionSite(checkPos,STRUCTURE_EXTENSION) == OK) {
                                let existingRoad = room.lookForAt(LOOK_STRUCTURES, checkPos.x, checkPos.y);
                                if (existingRoad && existingRoad.structureType == STRUCTURE_ROAD) {
                                    existingRoad.destroy();
                                }
                                availableExtensionsCount--;
                            }
                        }

                        newForbiddenXs.push(checkPos.x);
                        newForbiddenYs.push(checkPos.y);

                        rowStuff.push('o');

                    } else{

                        if (canWeBuildHere) {
                            room.createConstructionSite(checkPos,STRUCTURE_ROAD);

                            // room.createFlag(x,y,''+x+y, COLOR_CYAN);

                            // let flag=Game.flags[''+x+y];
                            // if (flag){
                            //     flag.remove();
                            // }
                        }
                        rowStuff.push('x');
                    }

                    y++;
                }
                // console.log(rowStuff);

                x++;
            }

            // console.log(newForbiddenXs);
            // console.log(newForbiddenYs);

            forbiddenXs=_.uniq(newForbiddenXs);
            forbiddenYs=_.uniq(newForbiddenYs);

            // console.log('ring done, forbidden for next ring (Start:'+(spawnPos.x - (i+1))+','+(spawnPos.y - (i+1)));
            // console.log(forbiddenXs);
            // console.log(forbiddenYs);

            loopRange=loopRange+2;
        }

        // emergencyLoopStop--;
        // }

        // console.log(checked+' spots checked');
    },

    /*
     * UTILS
     */
    clearMemoryOfDeadCreeps: function() {
        for (let name in Memory.creeps) {
            if(Memory.creeps.hasOwnProperty(name)) {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name];
                    console.log('Clearing non-existing creep memory:', name);
                }
            }
        }
    },

    /*
     * CREEPLE MANAGEMENT
     */
    outputPopulationInfoPerRoom: function(roomInfo) {
        if(Game.time % 5 == 0) {
            let roomName=roomInfo.name;
            let roomPopSummary = roomName+': ';
            for(let roleName in RoleManager) {
                if (RoleManager.hasOwnProperty(roleName)) {
                    roomPopSummary+=(roleName+': '+Query.countRolesInRoom(roomInfo, roleName)+',');
                }
            }
            console.log(roomPopSummary);
        }
    },
    performCreepleCensusByRole: function(roomInfo) {

        if(roomInfo.mainSpawn) {

            if (this.checkIfWeAreReadyForStaticHarvesters(roomInfo)) {
                // Build the containers we're going to need
                // _.each(room.availableSources, function(source) {
                //    // Check they have an extension, if so, STATIC TIME, else make sure it's under construction at least
                //     if (source.container && !source.dedicatedMiner) {
                //         // Whatevs, cool bruv
                //     } else if (source.container && !source.dedicatedMiner) {
                //         // This one is good to go, need to get a miner on it
                //     } else if (source.container && source.dedicatedMiner) {
                //         // Check is he alive
                //     } else if (!source.container) {
                //         // We need to at least be building a container here
                //         this.check
                //     }
                //
                //
                // });
                // room.staticHarvesterLimit=room.availableSources.length;
            } else{
                // room.staticHarvesterLimit=0;
            }

            // Check if we need a soldier
            let prepAttackFlag = Game.flags['prep-attack'];
            if (prepAttackFlag) {
                let soldierRole = RoleManager['basicSoldier'];
                roomInfo.mainSpawn.createCreep(soldierRole.parts, soldierRole.name, {role: soldierRole.role});
            }
            let prepClaimFlag = Game.flags['prep-claim'];
            if (prepClaimFlag) {
                let claimerRole = RoleManager['basicClaimer'];
                roomInfo.mainSpawn.createCreep(claimerRole.parts, claimerRole.name, {role: claimerRole.role});
            }

            for(let roleName in RoleManager) {
                if(RoleManager.hasOwnProperty(roleName)) {
                    let role=RoleManager[roleName];
                    let creepName=role.name();

                    let creepleCountForRole = 0;

                    if (roomInfo.creeps !== undefined && roomInfo.creeps.length) {
                        creepleCountForRole = _.filter(roomInfo.creeps, function (creep) {
                            return creep.memory.role == role.role;
                        }).length;
                    }

                    if (creepleCountForRole === undefined) {
                        creepleCountForRole = 0;
                    }

                    if (creepleCountForRole < role.targetRoomPopulation) {
                        // console.log('New: '+'need to mainSpawn a ' + role.role + ' in '+roomId+', only have '+creepleCountForRole);
                        // console.log(room.mainSpawn[0].canCreateCreep(role.stage2Parts, undefined));
                        // console.log(Game.rooms[roomId].energyCapacityAvailable);

                        if(roomInfo.mainSpawn.canCreateCreep(role.stage2Parts, creepName) == OK){
                            // console.log('Build big one');
                            // roomInfo.mainSpawn.createCreep(role.stage2Parts, creepName, {role: role.role});
                        } else {
                            // console.log('Build little one');
                            // roomInfo.mainSpawn.createCreep(role.parts, creepName, {role: role.role});
                        }
                        return false;
                    }
                }
            }

            return true;
        }

        return false;
    },
    checkIfWeAreReadyForStaticHarvesters : function(roomInfo) {
        // console.log(sourceWithoutStaticHarvester+' does not have id');

        if(roomInfo.energyCapacityAvailable > RoleManager['staticHarvester'].pricePerBlock * 1.3){ // 130% capacity, just for some wiggle room
            // console.log('Ready for big bastard harvesters');
            for(let roleName in RoleManager) {
                if(RoleManager.hasOwnProperty(roleName)) {
                    let role=RoleManager[roleName];
                    if(role.minRoomPopulation){
                        if (roomInfo.creeps !== undefined && roomInfo.creeps.length) {
                            let creepsOfRole = _.filter(roomInfo.creeps, function (creep) {
                                return creep.memory.role == role.role;
                            }).length;
                            if(creepsOfRole < role.minRoomPopulation){
                                // wa waaaaa
                                console.log('wa waaaa, have the energy capacity but not the min screeps required damn you '+roleName);
                                return false;
                            }
                        }
                    }
                }
            }

            // we're good to mainSpawn statics

            return true;
        }
    }
};