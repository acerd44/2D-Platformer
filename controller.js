const Controller = function () { // controller object
    // which inputs i want to allow
    this.up = new Controller.Input();
    this.left = new Controller.Input();
    this.right = new Controller.Input();
    this.d = new Controller.Input();
    this.s = new Controller.Input();

    // what happens when you press a key
    this.keyPress = function (type, key_code) {
        let held = (type == "keydown") ? true : false; // checking if youre holding down the key

        switch (key_code) {
            case 37:
                this.left.getInput(held);
                break;
            case 39:
                this.right.getInput(held);
                break;
            case 38:
            case 32:
                this.up.getInput(held);
                break;
            case 68:
                this.d.getInput(held);
                break;
            case 83:
                this.s.getInput(held);
        }
    };

    this.handleKeyPress = (event) => {
        this.keyPress(event.type, event.keyCode);
    }
};

Controller.prototype = {
    constructor: Controller
};

// getting the state of the key (if youre holding it or not)
Controller.Input = function () {
    this.active = this.held = false;
};

Controller.Input.prototype = {
    constructor: Controller.Input,

    //same as above
    getInput: function (held) {
        if (this.held != held) {
            this.active = held;
        }
        this.held = held;
    }
};