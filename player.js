const Player = function (color) { // player object
    this.jumping = true; // is player jumping
    this.x = 0; // current x position
    this.prev_x = 0; // previous x position
    this.spawn_x = 0; // spawn x position
    this.y = 0; // current y position
    this.prev_y = 0; // previous y positionn
    this.spawn_y = 0; // spawn y position
    this.velocity_x = 0; // x speed
    this.velocity_y = 0; // v speed
    this.lives = 3;
    this.width = 32;
    this.height = 32;
    this.color = color;
    this.score = 0;
    this.scub = 0;
    this.deathSound = true; // play deathSound when dead
    this.deth = new Audio("./zappa.mp3", 0.7); // death sound
    this.zone = undefined; // current zone
    this.objective; // objective
    this.objectiveStatus = "red"; // status of objective (red = incomplete, green = complete, black = not really an objective, just what to do)
};

Player.prototype = { // functions
    constructor: Player,

    // self explanatory stuff

    setSpawn: function (x, y) {
        this.spawn_x = x;
        this.spawn_y = y;
    },

    setPosition: function (x, y) {
        this.x = x;
        this.y = y;
    },

    addScore: function (points) {
        this.score += points;
        return true;
    },

    getScore: function () {
        return this.score;
    },

    addScub: function () {
        this.scub++;
        return true;
    },

    getScubs: function () {
        return this.scub;
    },


    getLives: function () {
        return this.lives;
    },

    loseLife: function () {
        this.lives--;
    },

    getTop: function () {
        return this.y;
    },

    getPreviousTop: function () {
        return this.prev_y;
    },

    getBottom: function () {
        return this.y + this.height;
    },

    getPreviousBottom: function () {
        return this.prev_y + this.height;
    },

    getLeft: function () {
        return this.x;
    },

    getPreviousLeft: function () {
        return this.prev_x;
    },

    getRight: function () {
        return this.x + this.width;
    },

    getPreviousRight: function () {
        return this.prev_x + this.width;
    },

    setTop: function (y) {
        this.y = y;
    },

    setPreviousTop: function (y) {
        this.prev_y = y;
    },

    setBottom: function (y) {
        this.y = y - this.height;
    },

    setPreviousBottom: function (y) {
        this.prev_y = y - this.height;
    },

    setLeft: function (x) {
        this.x = x;
    },

    setPreviousLeft: function (x) {
        this.prev_x = x;
    },

    setRight: function (x) {
        this.x = x - this.width;
    },

    setPreviousRight: function (x) {
        this.prev_x = x - this.width;
    },

    // re-spawn player and remove a life
    die: function () {
        this.setPosition(this.spawn_x, this.spawn_y);
        this.velocity_x = 0;
        this.loseLife();
    },

    endGame: function () {
        this.lives = 0;
    },

    changeObjective: function (objective) {
        this.objective = objective;
    },

    changeObjectiveStatus: function (status) {
        this.objectiveStatus = status;
    },

    // check if player is colliding with an entity
    isColliding: function (entity) {
        return (this.getRight() > entity.getLeft() && this.getLeft() < entity.getRight()
            && entity.getBottom() > this.getTop() && entity.getTop() < this.getBottom());
    },

    // deciding what to do with entity when colliding/interacting with them based on entity's type
    interact: function (entity) {
        if (this.isColliding(entity)) {
            switch (entity.getType()) {
                case "moving platform":
                    if (this.getBottom() > entity.getTop() && this.getPreviousBottom() <= entity.getTop()) {
                        this.setBottom(entity.getTop() - 0.001);
                        this.velocity_y = 0;
                        //this.velocity_x = entity.velocity_x;  // give the same speed as the moving platform to the player so you'll follow it  
                        this.jumping = false;
                    } else if (this.getRight() > entity.getLeft() && this.getPreviousRight() <= entity.getLeft()) {
                        this.setRight(entity.getLeft() - 0.001);
                        this.velocity_x = 0;
                    } else if (this.getLeft() < entity.getRight() && this.getPreviousLeft() >= entity.getRight()) {
                        this.setLeft(entity.getRight());
                        this.velocity_x = 0;
                    }
                    break;
                case "enemy":
                    if (!entity.isDead() && Math.floor(entity.getTop() - this.getTop()) > 12 && this.addScore(200)) // if you jump on the enemy
                        return "kill"; // kill it
                    else if (this.addScore(-50))
                        this.die();
                    break;
                case "checkpoint":
                    if (this.addScore(50))
                        return "checkpoint";
                case "lava": // lava
                    this.die();
                    this.addScore(-50);
                    break;
                case "scub":
                    return "scub";
                default:
                    return true;
            }
        }
    },

    draw: function () {
        if (this.getLives() > 0) {
            rectangle(this.x, this.y, this.width, this.height, "black");
        }
    },

    moveLeft: function () {
        this.velocity_x -= 1;
    },

    moveRight: function () {
        this.velocity_x += 1;
    },

    jump: function () {
        if (!this.jumping) {
            this.jumping = true;
            this.velocity_y -= 35;
        }
    },

    update: function (gravity, friction) {
        text(32, 32, 20, "Lives: " + this.getLives() + "     Area: " + this.zone + "     Scubs: " + this.getScubs() + "     Score: " + this.getScore(), "white"); // hud
        text(32, 850, 20, "Press: N to go to the next area, B to the previous area, R to restart, S to end the game", "white");
        if (this.objective != "null") {
            text(32, 800, 20, "Objective: " + this.objective, this.objectiveStatus); // objective hud
        }
        if (this.getLives() > 0) { // update positions, speeds, friction, gravity etc
            this.velocity_y += gravity;
            this.prev_x = this.x;
            this.prev_y = this.y;
            this.x += this.velocity_x;
            this.y += this.velocity_y;
            this.velocity_x *= friction;
            this.velocity_y *= friction;
            if (this.velocity_y > 0) { // if you are on a platform, allow player to jump
                this.jumping = true;
            }
        } else { // game over when dead
            text(6.6 * 64, 6 * 64, 50, "GAME OVER", "black");
            text(4 * 64, 7 * 64, 50, "PRESS R TO RESTART", "black");
            if (this.deathSound) {
                this.deth.play();
                this.deathSound = false;
            }
        }
    },

    init: function (x, y) { // setting spawn + position
        this.setSpawn(x, y);
        this.setPosition(x, y);
    }
};