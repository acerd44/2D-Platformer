const Game = function () { // game engine
    this.friction = 0.9;
    this.gravity = 3;
    this.debug = false; // enable debugging - press d to enable
    this.player = new Player("black"); // create new player
    this.controller = new Controller(); // create new instance of controller 
    this.collider = new Collider(); // create new instance of colliderhandler
    this.enemies = []; // enemies array
    this.lavas = []; // lava array
    this.checkpoints = []; // checkpoint array
    this.scubs = []; // coin array
    this.movingPlatforms = []; // moving platforms array
    this.movingPlatforms2 = [];
    this.timer; // timer for the checkpoint
    this.portal; // door that takes you to the next area
    this.return_portal; // door that takes you to the previous area
    // 0 = background, 1 = wall, 2 = player spawn, 3 = lava, 4 = coin, 5 = checkpoint, 6 = enemy, 7 = platform you can jump through the bottom
    // 8 = portal, 9 = portal that goes a zone back, 10 = position you get put in if you go back a zone, 11 moving platform X, 12 moving platform Y
    this.map; // current map
    // 0 0 0 0 = l b r t (left bottom right top) in binary - example: 0001 = 01 = collision only from the top of the object (such as the ground)
    this.collision_map; // current collision map
    this.zone_id = "00"; // start zone
    this.destination; // next zone 
    this.return_destination; // previous zone
    this.mapIndex; // index of map (for adding in objects and drawing tilemap)
    this.cols; // width of map
    this.rows; // height of map
    this.tile_size = 64; // size of each tile

    // update everything: controls, visuals/drawing, movement, object interactions, collision
    this.update = function () {
        clearScreen();
        if (this.controller.left.active) {
            this.player.moveLeft();
        }
        if (this.controller.right.active) {
            this.player.moveRight();
        }
        if (this.controller.up.active) {
            this.player.jump();
            this.controller.up.active = false; // set state of up key to false so you cant spam jump by holding spacebar or up
        }
        if (this.controller.s.active) { // just for testing purposes, press S to end the game
            this.player.endGame();
        }
        if (keyboard.r) { // restart when you press r
            location.reload();
        }
        if (keyboard.n && this.destination != "null") { // go to next area
            this.reloadZone(false);
            keyboard.n = false;
        }
        if (keyboard.b && this.return_destination != "null") { // go to previous area
            this.reloadZone(true);
            keyboard.b = false;
        }
        this.drawTileMap();
        this.debugging();
        this.player.draw();
        this.handleObjects();
        this.player.update(this.gravity, this.friction);
        this.handleCollision();
        if (this.zone_id == "00") {
            text(1216, 680, 20, "Portal to the next area", "white");
        }
        if (this.player.objective != "null")
            this.handleObjectives();

    };

    // after requesting zone.json file, get the new tile maps, destination, size of map etc, reset the values of objects and then add the objects of the respective area
    this.setup = function (zone, prev) {
        if (zone.objective) {
            this.player.objective = zone.objective;
            this.player.objectiveStatus = zone.objectiveStatus;
        } else this.player.objective = undefined;
        this.map = zone.map;
        this.collision_map = zone.collision_map;
        this.destination = zone.destination;
        this.return_destination = zone.return_destination;
        this.cols = zone.cols;
        this.rows = zone.rows;
        this.zone_id = zone.id;
        this.player.zone = zone.id;
        this.portal = undefined;
        this.return_portal = undefined;
        this.scubs = [];
        this.enemies = [];
        this.lavas = [];
        this.movingPlatforms = [];
        this.movingPlatforms2 = [];
        this.checkpoints = [];
        this.addObjects();
        this.addPlayer(prev);
    };

    // start up, add event listeners for controls and load the first zone
    this.startUp = function () {
        window.addEventListener("keydown", this.controller.handleKeyPress);
        window.addEventListener("keyup", this.controller.handleKeyPress);
        this.requestJSON("./zone" + this.zone_id + ".json", (zone) => {
            this.setup(zone, false);
        });
    };

    // reload zone after setup function, basically reset all stuff and then define them again
    this.reloadZone = function (prev) {
        let dest = prev ? this.return_destination : this.destination; // go to previous or next area
        this.requestJSON("./zone" + dest + ".json", (zone) => {
            this.setup(zone, prev);
        });
    }

    // utility/tools/collision

    //request json for zone, makes a http request, parses the text and sends the info back
    this.requestJSON = function (url, callback) {
        let request = new XMLHttpRequest();

        request.addEventListener("load", function (event) {
            callback(JSON.parse(this.responseText));
        }, { once: true });

        request.open("GET", url);
        request.send();
    };

    // handle objectives

    this.handleObjectives = function () {
        if (this.player.objective.includes("cub")) {
            if (this.player.objective.includes("heckpoint")) {
                if (this.player.objective.includes("nemi")) {
                    if (this.scubs.length < 1 && this.checkpoints.length < 1 && this.enemies.length < 1) {
                        this.player.objectiveStatus = "green";
                    }
                } else {
                    if (this.scubs.length < 1 && this.checkpoints.length < 1) {
                        this.player.objectiveStatus = "green";
                    }
                }
            } else if (this.player.objective.includes("nemi")) {
                if (this.scubs.length < 1 && this.enemies.length < 1) {
                    this.player.objectiveStatus = "green";
                }
            } else {
                if (this.scubs.length < 1) {
                    this.player.objectiveStatus = "green";
                }
            }
        } else if (this.player.objective.includes("heckpoint")) {
            if (this.player.objective.includes("nemi")) {
                if (this.checkpoints.length < 1 && this.enemies.length < 1) {
                    this.player.objectiveStatus = "green";
                }
            } else {
                if (this.checkpoints.length < 1) {
                    this.player.objectiveStatus = "green";
                }
            }
        } else if (this.player.objective.includes("nemi")) {
            if (this.enemies.length < 1) {
                this.player.objectiveStatus = "green";
            }
        }
    }

    // add objects
    this.addObjects = function () {
        this.addObject(this.lavas, 3, 64, 52, 0, 0, "red", "lava");
        this.addObject(this.checkpoints, 5, 64, 6, 0, 0, "blue", "checkpoint");
        this.addObject(this.enemies, 6, 32, 32, 3, 1, "purple", "enemy");
        this.addObject(this.scubs, 4, 16, 16, 0, 0, "green", "scub");
        this.addObject(this.movingPlatforms, 11, 64, 16, 3, 2, "grey", "moving platform");
        this.addObject(this.movingPlatforms2, 12, 64, 16, -6, 7, "grey", "moving platform");
        this.addObject(undefined, 8, 8, 64, 0, 0, "brown", "portal"); // portal
        this.addObject(undefined, 9, 8, 64, 0, 0, "pink", "portal"); // return portal
    };

    // handle/update objects
    this.handleObjects = function () {
        this.handleObject(this.movingPlatforms, true);
        this.handleObject(this.movingPlatforms2, true);
        this.handleObject(this.enemies, true, "kill");
        this.handleObject(this.checkpoints, false, "checkpoint");
        this.handleObject(this.lavas);
        this.handleObject(this.scubs, false, "scub");
        this.handleObject(undefined, false, "portal");
        this.handleObject(undefined, false, "return portal");
    };

    // handle collision
    this.handleCollision = function () {
        let top, left, bottom, right, value;
        //check which side needs to collide
        //calculating and comparing every side of player


        // calculate the top and left position of the player in tiles (position divided by tile size)
        top = Math.floor(this.player.getTop() / this.tile_size);
        left = Math.floor(this.player.getLeft() / this.tile_size);
        // index of player position in collision map (example: 1 means only has collision on top)
        value = this.collision_map[top * this.cols + left];
        // send back positions and index to the collider handler
        this.collider.collide(value, this.player, left * this.tile_size, top * this.tile_size);

        // repeat with the other sides

        top = Math.floor(this.player.getTop() / this.tile_size);
        right = Math.floor(this.player.getRight() / this.tile_size);
        value = this.collision_map[top * this.cols + right];
        this.collider.collide(value, this.player, right * this.tile_size, top * this.tile_size);

        bottom = Math.floor(this.player.getBottom() / this.tile_size);
        left = Math.floor(this.player.getLeft() / this.tile_size);
        value = this.collision_map[bottom * this.cols + left];
        this.collider.collide(value, this.player, left * this.tile_size, bottom * this.tile_size);

        bottom = Math.floor(this.player.getBottom() / this.tile_size);
        right = Math.floor(this.player.getRight() / this.tile_size);
        value = this.collision_map[bottom * this.cols + right];
        this.collider.collide(value, this.player, right * this.tile_size, bottom * this.tile_size);
    };

    // count how many times the number x appears in the tilemap
    this.countOccurrences = function (x) {
        let count = 0;
        for (let i = 0; i < this.map.length; i++) {
            if (this.map[i] === x) count++;
        }
        return count;
    };

    //draw the map
    this.drawTileMap = function () {
        // make sure mapIndex starts on 0
        mapIndex = 0;
        // loop through the rows and columns of the map
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++, mapIndex++) {
                let tile_x = x * this.tile_size; // x position of tile
                let tile_y = y * this.tile_size; // y position of tile

                let tileType = this.map[mapIndex]; // tile type which indicates what kind of property it should have
                switch (tileType) {
                    // 0 = background, 1 = wall, 2 = player spawn, 3 = lava, 4 = coin, 5 = checkpoint, 6 = enemy, 7 = platform you can jump through the bottom
                    // 8 = portal, 9 = portal that goes a zone back, 10 = position you get put in if you go back a zone, 11/12 moving platform
                    case 7: // small platform that you can jump through the bottom
                        rectangle(tile_x, tile_y, this.tile_size, this.tile_size, "lightblue");
                        rectangle(tile_x, tile_y, this.tile_size, this.tile_size - 50, "grey");
                        break;
                    case 1: // a wall
                        rectangle(tile_x, tile_y, this.tile_size, this.tile_size, "grey");
                        break;
                    case 20:
                        rectangle(tile_x, tile_y, this.tile_size + 60, this.tile_size, "grey");
                        break;
                    case 0:  // background/ no collision
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 10:
                        // drawing of enemies, checkpoints, players etc are handled in other functions so we just draw the background color so it isn't white.
                        rectangle(tile_x, tile_y, this.tile_size, this.tile_size, "lightblue");
                }
            }
        }
    };


    //debugging, just shows the positions of your players in pixels and tiles, same with your mouse.
    this.debugging = function () {
        if (this.controller.d.active) {
            if (!this.debug) {
                this.debug = true;
                this.controller.d.active = false;
            } else {
                this.debug = false;
                this.controller.d.active = false;
            }
        }

        if (this.debug) {
            let tile = Math.floor(mouse.y / this.tile_size) * this.cols + Math.floor(mouse.x / this.tile_size);
            text(100, 200, 20, "Pixels[Player]: " + Math.floor(this.player.x) + " - " + Math.floor(this.player.y), "black");
            text(100, 250, 20, "Tile (Collision - Graphic) [Player]: " + Math.floor(this.player.x / this.tile_size) + " - " + Math.floor(this.player.y / this.tile_size), "black");
            text(100, 300, 20, "Pixels[Mouse]: " + mouse.x + " - " + mouse.y, "black");
            text(100, 350, 20, "Tiles(Collision - Graphic) [Mouse]: (" + this.collision_map[tile] + " - " + this.map[tile] + ") - " + tile, "black");
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    rectangle(x * this.tile_size, y * this.tile_size, 1, this.tile_size, "black");
                    rectangle(x * this.tile_size, y * this.tile_size, this.tile_size, 1, "black");
                }
            }
        }
    };

    // objects + player stuff

    // set the player x speed, position, spawn etc. used when respawning after dying or loading into a zone
    this.addPlayer = function (prev) {
        this.player.velocity_x = 0;
        let pos;
        if (this.return_destination == "null") pos = 2; // if there is no return portal, spawn it to the value of 2 from the tile map
        else pos = prev ? 10 : 2; // if there is a return portal, based on the boolean prev, if true = spawn to value of 10, false = value of 2
        mapIndex = 0;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++, mapIndex++) {
                if (this.map[mapIndex] == pos) { // if mapIndex equals spawn value
                    this.player.init(x * this.tile_size, y * this.tile_size + 32); // initialize player
                }
            }
        }
    };

    // add object to the game
    this.addObject = function (arr, index, width, height, velocity_x, threshold, color, type) {
        if (this.countOccurrences(index) == 0) return; // if object's index cant be found in the map, stop
        mapIndex = 0;
        let x_pos, y_pos, port;
        if (type == "portal") {
            port = new Entity(color, "portal");
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++, mapIndex++) {
                    if (this.map[mapIndex] == index) {
                        y_pos = y * this.tile_size;
                        if (color == "brown") {
                            x_pos = (x * this.tile_size) + 56;
                            this.portal = port;
                            this.portal.init(x_pos, y_pos, 8, 64, 0, 0, "portal");
                        }
                        else {
                            x_pos = x * this.tile_size;
                            this.return_portal = port;
                            this.return_portal.init(x_pos, y_pos, 8, 64, 0, 0, "portal");
                        }
                        this.map.splice(mapIndex, 1, 0);
                    }
                }
            }
        } else {
            for (let i = 0; i < this.countOccurrences(index); i++) {
                arr.push(new Entity(color, type)); // add object to the respective array
            }
            // initialize objects position, size, speed, type and then replace index with 0 in the map so we can check for the next one
            for (let i = arr.length - 1; i > -1;) {
                for (let y = 0; y < this.rows; y++) {
                    for (let x = 0; x < this.cols; x++, mapIndex++) {
                        if (this.map[mapIndex] == index) {
                            switch (type) {
                                case "scub":
                                    x_pos = (x * this.tile_size) + 24;
                                    y_pos = (y * this.tile_size) + 24;
                                    break;
                                case "portal":
                                    x_pos = (x * this.tile_size) + 56;
                                    y_pos = y * this.tile_size;
                                    break;
                                case "enemy":
                                    x_pos = x * this.tile_size;
                                    y_pos = (y * this.tile_size) + 32;
                                    break;
                                case "lava":
                                    x_pos = x * this.tile_size;
                                    y_pos = (y * this.tile_size) + 28;
                                    height = 36;
                                    break;
                                case "moving platform":
                                    x_pos = x * this.tile_size;
                                    y_pos = (y * this.tile_size) + 64;
                                    break;
                                case "checkpoint":
                                    x_pos = x * this.tile_size;
                                    y_pos = (y * this.tile_size) + (58 - arr[i].width);
                                    break;
                                default:
                                    x_pos = x * this.tile_size;
                                    y_pos = y * this.tile_size;
                            }
                            arr[i].init(x_pos, y_pos, width, height, velocity_x, threshold);
                            this.map.splice(mapIndex, 1, 0);
                            i--
                        }
                    }
                }
            }
        }
    };

    // handle object interactions and drawing
    this.handleObject = function (arr, update, interaction) {
        if (interaction == "portal") {
            if (!this.portal) return; // if there isnt a portal in the area, stop function, else
            this.portal.draw(); // draw the portal
            //  && ((this.player.objectiveStatus != "red" && this.player.objective != "null") || this.player.objective == "null")
            if (this.player.interact(this.portal)) { // if player interacts with the portal
                this.reloadZone(false); // send the player to the next zone
            }
        } else if (interaction == "return portal") {
            if (!this.return_portal) return;  // if there isnt a return portal in the area, stop function, else
            this.return_portal.draw(); // draw the portal
            if (this.player.interact(this.return_portal)) { // if player interacts with the return portal
                this.reloadZone(true); // send the player to the previous zone
            }
        } else {
            if (arr.length < 1) return; // if there arent any objects, stop
            for (let i = arr.length - 1; i > -1; i--) {
                if (update) arr[i].update(); // if the object moves, make it move 
                arr[i].draw(); // draw the object
                switch (interaction) { // depending on what happens when you interact with the object
                    case "kill": // enemy interaction
                        if (this.player.interact(arr[i]) == "kill") {
                            arr.splice(i, 1);
                        }
                        break;
                    case "checkpoint":
                        if (!arr[i].getState() && this.player.interact(arr[i]) == "checkpoint") {
                            let x = arr[i].x;
                            let y = arr[i].y;
                            this.timer = setInterval(() => text(x - 20, y - 64, 13, "CHECKPOINT", "black"));
                            setTimeout(() => clearInterval(this.timer), 600);
                            this.player.setSpawn(x, y - 48);
                            arr.splice(i, 1);
                        }
                        break;
                    case "scub":
                        if (this.player.interact(arr[i]) == "scub") {
                            this.player.addScub();
                            this.player.addScore(50);
                            arr.splice(i, 1);
                        }
                        break;
                    default: // default interaction
                        this.player.interact(arr[i]);
                }
            }
        }
    };
};