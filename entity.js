const Entity = function (color, type) { // game object, can be anything that isnt the player: lava, enemy, portals etc
    this.x = 0; // x position
    this.spawn_x = 0; // x spawn position
    this.y = 0; // y position
    this.spawn_y = 0; // y spawn position
    this.start_threshold = 0; // start of threshold (for moving objects such as moving platforms and enemies)
    this.end_threshold = 0; // end of threshold
    this.width = 0; // width size
    this.height = 0; // height size
    this.velocity_x = 0; // x-speed
    this.color = color; // color
    this.state = false; // the state of the object (for checkpoints)
    this.dead = false; // is object dead (for enemies)
    this.type = type; // type of object
    this.destination = undefined; // where does it lead to (portals)
    this.portal_dir = undefined; // direction of portal (to make sure its not out of place)
};

Entity.prototype = { // functions
    constructor: Entity,

    // set stuff, self explanatory

    setSpawn: function (x, y) {
        this.spawn_x = x;
        this.spawn_y = y;
    },

    setPosition: function (x, y) {
        this.x = x;
        this.y = y;
    },

    setColor: function (col) {
        this.color = col;
    },

    setWidthHeight: function (w, h) {
        this.width = w;
        this.height = h
    },

    setThreshold: function (s, e) {
        this.start_threshold = this.x + (s * 64);
        this.end_threshold = this.x + (e * 64);
    },

    setState: function (state) {
        this.state = state;
    },

    setDestination: function (dest) {
        this.destination = dest;
    },

    setVelocityX: function (x) {
        this.velocity_x = x;
    },

    // get stuff, self explanatory

    getVelocityX: function () {
        return this.velocity_x;
    },

    getState: function () {
        return this.state;
    },

    getColor: function () {
        return this.color;
    },

    getType: function () {
        return this.type;
    },

    draw: function () {
        rectangle(this.x, this.y, this.width, this.height, this.color);
    },

    changeDirection: function () {
        this.velocity_x *= -1;
    },

    hasReachedThreshold: function () {
        return (this.x <= this.getEndThreshold()) || (this.x >= this.getStartThreshold());
    },

    getStartThreshold: function () {
        return this.start_threshold;
    },

    getEndThreshold: function () {
        return this.end_threshold;
    },

    getTop: function () {
        return this.y;
    },

    // get sides of object (used for collision or interacting with player)

    getBottom: function () {
        return this.y + this.height;
    },

    getLeft: function () {
        return this.x;
    },

    getRight: function () {
        return this.x + this.width;
    },

    isDead: function () {
        return this.dead;
    },

    // initializing the object and setting spawn, position width and height etc

    init: function (x, y, width, height, velocity_x, threshold) {
        this.setSpawn(x, y);
        this.setPosition(x, y);
        this.setWidthHeight(width, height);
        this.setThreshold(threshold, -threshold);
        this.setVelocityX(velocity_x);
    },

    // updating the object (for entities that needs to move)
    update: function () {
        if (!this.isDead() && this.getType() == "enemy" || this.getType() == "moving platform") {
            if (this.hasReachedThreshold()) { // change direction when reaching threshold
                this.changeDirection();
            }
            this.x += this.velocity_x;
        }
    }
};