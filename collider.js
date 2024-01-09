const Collider = function () {
    this.collide = function (value, player, tile_x, tile_y, tile_size = 64) {
        switch (value) {

            // 0 0 0 0 = l b r t (left bottom right top) in binary - example: 0001 = 01 = collision only from the top of the object (such as the ground)
            // based on the value from the collision map
            // if there is collision on one side, no need to check the other sides
            // there are 15 different types of collision, 4 directions (left bottom right top)
            case 1:
                this.collideTop(player, tile_y); break;
            case 2:
                this.collideRight(player, tile_x + tile_size); break;
            case 3:
                if (this.collideTop(player, tile_y)) return;
                this.collideRight(player, tile_x + tile_size); break;
            case 4:
                this.collideBottom(player, tile_y + tile_size); break;
            case 5:
                if (this.collideTop(player, tile_y)) return;
                this.collideBottom(player, tile_y + tile_size); break;
            case 6:
                if (this.collideRight(player, tile_x + tile_size)) return;
                this.collideBottom(player, tile_y + tile_size); break;
            case 7:
                if (this.collideTop(player, tile_y)) return;
                if (this.collideRight(player, tile_x + tile_size)) return;
                this.collideBottom(player, tile_y + tile_size); break;
            case 8:
                this.collideLeft(player, tile_x); break;
            case 9:
                if (this.collideTop(player, tile_y)) return;
                this.collideLeft(player, tile_x); break;
            case 10:
                if (this.collideLeft(player, tile_x)) return;
                this.collideRight(player, tile_x + tile_size); break;
            case 11:
                if (this.collideTop(player, tile_y)) return;
                if (this.collideLeft(player, tile_x)) return;
                this.collideRight(player, tile_x + tile_size); break;
            case 12:
                if (this.collideLeft(player, tile_x)) return;
                this.collideBottom(player, tile_y + tile_size); break;
            case 13:
                if (this.collideTop(player, tile_y)) return;
                if (this.collideLeft(player, tile_x)) return;
                this.collideBottom(player, tile_y + tile_size); break;
            case 14:
                if (this.collideLeft(player, tile_x)) return;
                if (this.collideRight(player, tile_x)) return;
                this.collideBottom(player, tile_y + tile_size); break;
            case 15:
                if (this.collideTop(player, tile_y)) return;
                if (this.collideLeft(player, tile_x)) return;
                if (this.collideRight(player, tile_x + tile_size)) return;
                this.collideBottom(player, tile_y + tile_size); break;
        }
    };
};

Collider.prototype = {
    constructor: Collider,
    //handle collision of players top side
    collideTop: function (player, tile) {
        if (player.getBottom() > tile && player.getPreviousBottom() <= tile) {
            player.setBottom(tile - 0.001);
            player.velocity_y = 0;
            player.jumping = false;
            return true;
        }
        return false;
    },

    //handle collision of players bottom side
    collideBottom: function (player, tile) {
        if (player.getTop() < tile && player.getPreviousTop() >= tile) {
            player.setTop(tile);
            player.velocity_y = 0;
            return true;
        }
        return false;
    },

    //handle collision of players left side
    collideLeft: function (player, tile) {
        if (player.getRight() > tile && player.getPreviousRight() <= tile) {
            player.setRight(tile - 0.001);
            player.velocity_x = 0;
            return true;
        }
        return false;
    },

    //handle collision of players right side
    collideRight: function (player, tile) {
        if (player.getLeft() < tile && player.getPreviousLeft() >= tile) {
            player.setLeft(tile);
            player.velocity_x = 0;
            return true;
        }
        return false;
    }
};