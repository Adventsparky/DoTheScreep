const Query=require('data');
const RoleManager=require('role.manager');

const HITS_MIN=5000;
const HITS_IMPROVED=20000;
const HITS_NOW_WERE_COOKING_WITH_GAS=60000;
const HITS_NOW_WERE_SUCKIN_DIESEL=250000;

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
    findNearestOrLeastBusySource : function(creep, room) {

        let bestChoiceSource=null;
        // Count how many are heading to this vs how many slots it has
        // Allow default of available harvest points +1 to wait
        // After that, prefer the point with more available slots
        // X=slots, allowance=x+1, prefer higher slot number until allowance*1.5 is breached.
        let allSources = null;
        // Make sure we only allow builders to pull from stores, and only if the room is far enough along to have broken 700 capacity, and we currently have more than 600 of that

        if (creep.memory.role == 'builder' && room.energyCapacity >= 800 && room.energyAvailable >=  600 && room.fullExtensions && room.fullExtensions[0]) {
            // console.log('this is a builder, allow extensions as sources');
            allSources = _.sortBy(_.union(room.availableSources, room.fullExtensions), s => creep.pos.getRangeTo(s));
        }

        if (!allSources || !allSources[0]) {
            allSources = _.sortBy(room.availableSources, s => creep.pos.getRangeTo(s));
        }

        _.each(allSources, function(source) {
            let targetSource=source;
            // console.log('check source ' + targetSource.id);
            let creepAssignedToSourceCount = 0;
            _.each(room.creeps, function (harvestingCreep) {
                if (harvestingCreep.memory.targetSource && harvestingCreep.memory.targetSource == targetSource.id) {
                    creepAssignedToSourceCount++;
                }
            });

            let creepAllowanceForSource = Query.countAccessibleSpacesAroundPoint(room, targetSource.pos) + 1;
            let creepOverflowForSource = source.accessibleSpaces * 1.5;


            if (bestChoiceSource == null) {
                // We have nothing, so ANYTHING is the best choice
                bestChoiceSource={};
                bestChoiceSource.source=targetSource;
                bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
                bestChoiceSource.overFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
                bestChoiceSource.spaces=creepAllowanceForSource - creepAssignedToSourceCount;
            } else if (bestChoiceSource.spaces <= 0) {
                // Only come in here if the source we've chosen, is tight on spaces

                let sourceScore=creepAssignedToSourceCount / creepAllowanceForSource;
                let sourceOverFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
                // console.log('Score for '+bestChoiceSource.source.id+': '+bestChoiceSource.score);
                // console.log('Score for '+source.id+': '+sourceScore);

                if (sourceScore < bestChoiceSource.score || sourceOverFlowScore < bestChoiceSource.overFlowScore){
                    bestChoiceSource.source=targetSource;
                    bestChoiceSource.score=creepAssignedToSourceCount / creepAllowanceForSource;
                    bestChoiceSource.overFlowScore=creepAssignedToSourceCount / creepOverflowForSource;
                    bestChoiceSource.spaces=creepAllowanceForSource - creepAssignedToSourceCount;
                }
            }

            // console.log(source);
            // console.log(JSON.stringify(source));
            // console.log(source.structureType);
            // console.log(source.structureType == STRUCTURE_EXTENSION);
            // if (source.structureType && source.structureType == STRUCTURE_EXTENSION) {
                bestChoiceSource.source.extension = false;
            // }
        });

        if(bestChoiceSource){
            // todo pick container of source with miner
            // console.log(creep+ ' choosing '+bestChoiceSource.source.id);
            // console.log(JSON.stringify(bestChoiceSource.source));
            // console.log(bestChoiceSource.source.container);

            // if (bestChoiceSource.extension) {
            //     creep.memory.targetStorageSource=bestChoiceSource.source.id;
            //     delete creep.memory.targetSource;
            // }

            if (bestChoiceSource.source) {
                if (bestChoiceSource.source.extension) {
                    creep.memory.targetStorageSource=bestChoiceSource.source.id;
                    delete creep.memory.targetSource;
                } else if (bestChoiceSource.source.container) {
                    creep.memory.targetStorageSource=bestChoiceSource.source.container.id;
                    delete creep.memory.targetSource;
                } else {
                    creep.memory.targetSource=bestChoiceSource.source.id;
                    delete creep.memory.targetStorageSource;
                }
            }

            delete creep.memory.targetDropoff; // This will only be for harvesters
        } else {
            console.log('Could not find a best choice source?? What??');
        }
    },
    structureHasSpaceForEnergy : function (structure) {
        if(structure.structureType == STRUCTURE_CONTAINER) {
            return _.sum(structure.store) < structure.storeCapacity;
        }
        return structure.energy < structure.energyCapacity;
    },
    collectEnergy : function(creep) {
        let harvestResult=OK;
        if (creep.memory.targetSource) {
            let targetSource = Game.getObjectById(creep.memory.targetSource);
            if(targetSource){
                harvestResult=creep.harvest(targetSource);
                if(harvestResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetSource);
                }
            }
        } else if (creep.memory.targetStorageSource) {
            let targetStorage = Game.getObjectById(creep.memory.targetStorageSource);
            if(targetStorage){
                harvestResult=creep.withdraw(targetStorage, RESOURCE_ENERGY);
                if(harvestResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetStorage);
                }
            }
        }
        return harvestResult;
    },
    depositEnergy : function(creep, room) {
        if(creep.memory.targetDropoff) {
            let targetDropoff = Game.getObjectById(creep.memory.targetDropoff);
            // Let's make sure it's still a valid energy dump
            if(!this.structureHasSpaceForEnergy(targetDropoff)) {
                targetDropoff = this.findBestEnergyDump(creep, room);
            }

            // Creep could get stuck at the source if everything is full, move to the dump regardless and wait
            // console.log(creep.transfer(targetDropoff, RESOURCE_ENERGY));
            let transferResult=creep.transfer(targetDropoff, RESOURCE_ENERGY);
            if(transferResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetDropoff);
            } else if(transferResult == ERR_INVALID_TARGET ||
                transferResult == ERR_FULL) {
                delete creep.targetDropoff;
            }
        }
    },

    /*
     * ENERGY DUMPING
     */
    dumpEnergyAtBase: function(creep, spawn) {
        if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        }
    },
    dumpEnergyIntoExtension: function(creep, extension) {
        if(creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(extension);
        }
    },
    upgradeController: function(creep, room) {
        if(creep.upgradeController(room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(room.controller);
        }
    },
    findBestEnergyDump: function(creep, room) {
        // console.log(creep);
        // console.log(creep.room.name);
        let potentialDropOffsInThisRoom = room.structures;
        let dropOffStructures = _.filter(potentialDropOffsInThisRoom, function (structure) {
            return structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity;
        });
        let towers=false;
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
                return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < (structure.energyCapacity*.3))
            });
            if (dropOffStructures.length > 0) {
                towers=true;
            }
        }
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
                return structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
            });
        }
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
                return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity)
            });
        }
        if(dropOffStructures.length == 0) {
            dropOffStructures = _.filter(potentialDropOffsInThisRoom, function(structure) {
                return structure.structureType == STRUCTURE_CONTROLLER
            });
        }


        if(dropOffStructures.length > 0) {
            let target=false;
            if (towers) {
                console.log(' drop off in tower');
                target = _.reduce(dropOffStructures, function(result, structure) {
                    let energy=structure.energy;
                    console.log('This energy: '+energy);
                    console.log(JSON.stringify(result));
                    console.log('Result energy: '+result.energy);
                    if(result && result.energy < energy) {
                        return result;
                    }
                    return {energy: energy, structure: structure}
                },{energyAvailable: 1000});
            } else {
                target = _.reduce(dropOffStructures, function(result, structure) {
                    let range=creep.pos.getRangeTo(structure);
                    if(result && result.range < range) {
                        return result;
                    }
                    return {range: range, structure: structure}
                },{range: 99999});
            }
            if(target) {
                // console.log('Chose '+JSON.stringify(target)+' for '+creep.name);
                creep.memory.targetDropoff=target.structure.id
            }
        } else{
            creep.say('no dumps');
        }
    },

    /*
     * CONSTRUCTION
     */
    // Pointless check, it's not paid from spawn, it's filled
    // buildingTypeAffordable: function(type) {
    //     return this.energyAvailable() >= CONSTRUCTION_COST[type];
    // },
    findNearestConstructionTowerContainerExtensionRampartWall : function(creep) {
        let sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

        let potentialConstructions = _.filter(sites, function(constructionSite) {
            return constructionSite.structureType == STRUCTURE_TOWER;
        });
        if(potentialConstructions.length == 0) {
            potentialConstructions = _.filter(sites, function(constructionSite) {
                return constructionSite.structureType == STRUCTURE_CONTAINER;
            });
        }

        if(potentialConstructions.length == 0) {
            potentialConstructions = _.filter(sites, function(constructionSite) {
                return constructionSite.structureType == STRUCTURE_EXTENSION ||
                    constructionSite.structureType == STRUCTURE_RAMPART ||
                    constructionSite.structureType == STRUCTURE_WALL;
            });
        }
        // console.log(potentialConstructions);

        if(potentialConstructions.length == 0) {
            potentialConstructions=sites;
        }

        if(potentialConstructions.length > 0) {
            let target = _.reduce(potentialConstructions, function(result, site) {
                let range=creep.pos.getRangeTo(site);
                if(result && result.range < range) {
                    return result;
                }
                return {range: range, site: site}
            },{range: 99999});
            // console.log('Chose '+JSON.stringify(target)+' for '+creep.name);
            creep.memory.targetConstruction=target.site.id
        } else {
            // creep.say('no builds');
        }
    },
    buildNearestStructure: function(creep, room) {
        if(creep.memory.targetConstruction) {
            let targetConstruction = Game.getObjectById(creep.memory.targetConstruction);
            if(targetConstruction) {
                if (creep.build(targetConstruction) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetConstruction);
                }
            } else{
                delete creep.memory.targetConstruction;
                delete creep.memory.building;
            }
        } else{
            delete creep.memory.building;
            // If we've no towers, repair
            if (!room.towers) {
                this.repairNearestStructure(creep);
            }
        }
    },
    repairNearestStructure: function(creep) {
        // Prioritise towers
        let closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER && (structure.hits < HITS_MIN && structure.hits < structure.hitsMax);
            }
        });
        if(!closestDamagedStructure) {
            closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < HITS_MIN && structure.hits < structure.hitsMax);
                }
            });
        }
        if(!closestDamagedStructure) {
            // Try again with higher threshold
            closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < HITS_IMPROVED && structure.hits < structure.hitsMax);
                }
            });
        }
        if(!closestDamagedStructure) {
            // Try again with higher threshold
            closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < HITS_NOW_WERE_COOKING_WITH_GAS && structure.hits < structure.hitsMax);
                }
            });
        }
        if(!closestDamagedStructure) {
            // Try again with higher threshold
            closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < HITS_NOW_WERE_SUCKIN_DIESEL && structure.hits < structure.hitsMax);
                }
            });
        }
        if(closestDamagedStructure) {
            // console.log('Repair closest ' + closestDamagedStructure);
            let status = creep.repair(closestDamagedStructure);
            if(status == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestDamagedStructure);
            } else {
                creep.say('Repairing')
            }
        } else {
            creep.say('Nothing to repair, I\'ll dump');
            // this.findBestEnergyDump(creep);
        }
    },
    checkForExtensionsAndRoadConstruction : function (roomInfo) {
        // We should have roads right beside the spawn, extensions will be diagonal

        // Go out from spawn one ring at a time looking for open (non wall, road and extensions will overlap) 3x3 areas to build new spawns
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

        // Kick off point is always the spawn
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
    clearMemoryOfDeadCreeples: function() {
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
    outputPopulationInfoPerRoom: function(room) {
        if(Game.time % 5 == 0) {
            let roomPopSummary = roomName+': ';
            for(let roleName in RoleManager) {
                if (RoleManager.hasOwnProperty(roleName)) {
                    roomPopSummary+=(roleName+': '+Query.countRolesInRoom(room, roleName)+',');
                }
            }
            console.log(roomPopSummary);
        }
    },
    performCreepleCensusByRole: function(spawn, creeps) {

        if(spawn != undefined && spawn.length) {

            if (this.checkIfWeAreReadyForStaticHarvesters()) {
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
                spawn.createCreep(soldierRole.parts, soldierRole.name, {role: soldierRole.role});
            }
            let prepClaimFlag = Game.flags['prep-claim'];
            if (prepClaimFlag) {
                let claimerRole = RoleManager['basicClaimer'];
                spawn.createCreep(claimerRole.parts, claimerRole.name, {role: claimerRole.role});
            }

            for(let roleName in RoleManager) {
                if(RoleManager.hasOwnProperty(roleName)) {
                    let role=RoleManager[roleName];
                    let creepName=role.name();

                    try {
                        let creepleCountForRole = 0;

                        if (creeps !== undefined && creeps.length) {
                            creepleCountForRole = _.filter(creeps, function (creep) {
                                return creep.memory.role == role.role;
                            }).length;
                        }

                        if (creepleCountForRole === undefined) {
                            creepleCountForRole = 0;
                        }

                        if (creepleCountForRole < role.targetRoomPopulation) {
                            // console.log('New: '+'need to spawn a ' + role.role + ' in '+roomId+', only have '+creepleCountForRole);
                            // console.log(room.spawn[0].canCreateCreep(role.stage2Parts, undefined));
                            // console.log(Game.rooms[roomId].energyCapacityAvailable);
                            // console.log(Memory.roleBuildCosts[role.role+'Stage2Parts']);

                            if(spawn.canCreateCreep(role.stage2Parts, creepName) == OK){
                                // console.log('Build big one');
                                spawn.createCreep(role.stage2Parts, creepName, {role: role.role});
                            } else {
                                // console.log('Build little one');
                                spawn.createCreep(role.parts, creepName, {role: role.role});
                            }
                            return false;
                        }
                    }catch(e){
                        console.log('census: '+e);

                        // Fall back to this non cache based stuff if we murder the census
                        let basicCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
                        // console.log('ST: '+creeps.length+' '+role.role);
                        if(basicCreeps.length < role.targetRoomPopulation) {
                            console.log('ST: '+'need to spawn a '+role.role);
                            spawn.createCreep(role.parts, creepName, {role: role.role});
                            return false;
                        }
                    }
                }
            }

            return true;
        }

        return false;
    },
    checkIfWeAreReadyForStaticHarvesters : function(room) {
        // console.log(sourceWithoutStaticHarvester+' does not have id');

        if(room.energyCapacityAvailable > Memory.roleBuildCosts['staticHarvester'] * 1.3){ // 130% capacity, just for some wiggle room
            // console.log('Ready for big bastard harvesters');
            for(let roleName in RoleManager) {
                if(RoleManager.hasOwnProperty(roleName)) {
                    let role=RoleManager[roleName];
                    if(role.minRoomPopulation){
                        if (room.creeps !== undefined && room.creeps.length) {
                            let creepsOfRole = _.filter(room.creeps, function (creep) {
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

            // we're good to spawn statics

            return true;
        }
    }
};