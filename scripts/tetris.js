var canvas = document.getElementById("the-game");
var context = canvas.getContext("2d");
var ncanvas = document.getElementById("nextPiece");
var ncontext = ncanvas.getContext("2d");

Array.prototype.indexesOf = function (elem) {
    var indexes = [];
    var index = this.indexOf(elem);
    while (index !== -1) {
        indexes.push(index);
        index = this.indexOf(elem, index + 1);
    }
    return indexes;
};

game = {

    score: null,
    fps: null,
    over: null,
    message: null,
    pSize: null,
    frame: null,
    stats: {
        I: 0,
        J: 0,
        L: 0,
        O: 0,
        S: 0,
        T: 0,
        Z: 0
    },
    cPiece: null,
    nPiece: null,
    inactives: [],
    linesToClear: [],

    start: function () {
        game.over = false;
        game.message = null;
        game.score = 0;
        game.fps = 2;
        game.pSize = 24;
        game.frame = 0;
        game.cPiece = Tetrimino(120 - game.pSize / 2, 0 - game.pSize / 2);
        game.nPiece = Tetrimino(0, 0);
        game.nPiece.setCenter();
        game.inactives = [];
        game.linesToClear = [];
        game.ndrawBoard();
        $('#score').text(0);
        $('#' + game.cPiece.letter).text(++game.stats[game.cPiece.letter]);
    },

    stop: function () {
        game.over = true;
        game.message = 'GAME OVER - PRESS SPACEBAR';
    },

    drawBox: function (x, y, size, color) {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(x - (size / 2), y - (size / 2));
        context.lineTo(x + (size / 2), y - (size / 2));
        context.lineTo(x + (size / 2), y + (size / 2));
        context.lineTo(x - (size / 2), y + (size / 2));
        context.closePath();
        context.stroke();
        context.fill();
    },

    ndrawBox: function (x, y, size, color) {
        ncontext.fillStyle = color;
        ncontext.beginPath();
        ncontext.moveTo(x - (size / 2), y - (size / 2));
        ncontext.lineTo(x + (size / 2), y - (size / 2));
        ncontext.lineTo(x + (size / 2), y + (size / 2));
        ncontext.lineTo(x - (size / 2), y + (size / 2));
        ncontext.closePath();
        ncontext.stroke();
        ncontext.fill();
    },

    drawPiece: function (T) {
        converted = T.convertXYs();
        for (var i = 0; i < converted.x.length; i++) {
            game.drawBox(converted.x[i], converted.y[i],
            game.pSize,
            T.color);
        }
    },

    ndrawPiece: function (T) {
        converted = T.convertXYs();
        for (var i = 0; i < converted.x.length; i++) {
            game.ndrawBox(converted.x[i], converted.y[i],
            game.pSize,
            T.color);
        }
    },

    drawBoard: function () {
        game.resetCanvas();
        game.drawPiece(game.cPiece);
        for (var i = 0; i < game.inactives.length; i++) {
            game.drawBox(game.inactives[i].x,
            game.inactives[i].y,
            game.pSize,
            game.inactives[i].color);
        }
    },

    ndrawBoard: function () {
        game.nresetCanvas();
        game.ndrawPiece(game.nPiece);
    },

    clearBox: function (x, y, size) {
        context.clearRect(x - (size / 2), y - (size / 2),
        x + (size / 2), y + (size / 2));
    },

    clearPiece: function (T) {
        converted = T.convertXYs();
        for (var i = 0; i < converted.x.length; i++) {
            game.clearBox(converted.x[i], converted.y[i], game.pSize);
        }
    },

    occupiedQ: function (x, y) {
        if (x < 0 || x > $('#the-game').width()) {
            return true;
        }

        if (y > $('#the-game').height()) {
            return true;
        }

        for (var i = 0; i < game.inactives.length; i++) {
            var piece = game.inactives[i];
            if (x === piece.x && y === piece.y) {
                return true;
            }
        }

        return false;
    },

    checkFullLines: function () {
        for (var i = 0; i < $('#the-game').height() / game.pSize; i += 1) {
            var full = true;
            for (var j = 0; j < $('#the-game').width() / game.pSize; j += 1) {
                //console.log("checking (" + (j + 0.5) * game.pSize + ", " + (i + 0.5) * game.pSize + ")");

                if (!game.occupiedQ((j + 0.5) * game.pSize, (i + 0.5) * game.pSize)) {
                    //console.log(i + ":" + j + " is not occupied, line not full");
                    full = false;
                    break;
                }

            }

            if (full) {
                //console.log('line ' + i + ' is full');
                game.linesToClear.push(i);
            }
        }
    },

    clearLines: function () {
        for (var line = 0; line < game.linesToClear.length; line++) {
            //console.log('clearing line ' + game.linesToClear[line] + ', col ' + game.frame);

            for (var pInd = 0; pInd < game.inactives.length; pInd++) {
                // frame = x, line = y

                if (game.inactives[pInd].x === (game.frame + 0.5) * game.pSize && game.inactives[pInd].y === (game.linesToClear[line] + 0.5) * game.pSize) {
                    game.inactives.splice(game.inactives.indexOf(game.inactives[pInd]), 1);
                }
            }
        }
    },

    convert: function (T) {
        var converted = T.convertXYs();

        for (var i = 0; i < T.x.length; i++) {
            game.inactives.push({
                x: converted.x[i],
                y: converted.y[i],
                color: T.color
            });
        }
    },

    gravity: function (lToClear) {
        var line = lToClear[lToClear.length - 1];
        while (lToClear.length > 0) {
            for (var i = 0; i < game.inactives.length; i++) {
                if (game.inactives[i].y + game.pSize <= (line + 0.5) * game.pSize) {
                    game.inactives[i].y += game.pSize;
                }
            }
            lToClear.splice(lToClear.length - 1, 1);
        }
    },

    drawScore: function () {
        context.fillStyle = '#999';
        context.font = (canvas.height) + 'px Impact, sans-serif';
        context.textAlign = 'center';
        context.fillText(game.score, canvas.width / 2, canvas.height * 0.9);
    },

    drawMessage: function () {
        if (game.message !== null) {
            context.fillStyle = '#00F';
            context.strokeStyle = '#FFF';
            context.font = (canvas.height / 10) + 'px Impact';
            context.textAlign = 'center';
            context.fillText(game.message, canvas.width / 2, canvas.height / 2);
            context.strokeText(game.message, canvas.width / 2, canvas.height / 2);
        }
    },

    overQ: function () {
        for (var i = 0; i < game.inactives.length; i++) {
            if (game.inactives[i].y <= 0) {
                return true;
            }
        }
        return false;
    },

    resetCanvas: function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
    },

    nresetCanvas: function () {
        ncontext.clearRect(0, 0, ncanvas.width, ncanvas.height);
    }

};

function Tetrimino(x, y, id) {
    var Pieces = [{
        x: [+0.0, +0.0, +0.0, -1.0],
        y: [+1.0, +0.0, -1.0, -1.0],
        letter: "L",
        color: "yellow"
    }, {
        x: [+0.0, +0.0, +0.0, +1.0],
        y: [+1.0, +0.0, -1.0, -1.0],
        letter: "J",
        color: "magenta"
    }, {
        x: [-1.0, +0.0, +0.0, +1.0],
        y: [+0.0, +0.0, +1.0, +1.0],
        letter: "Z",
        color: "lime"
    }, {
        x: [-1.0, +0.0, +0.0, +1.0],
        y: [+1.0, +1.0, +0.0, +0.0],
        letter: "S",
        color: "blue"
    }, {
        x: [-1.0, +0.0, +0.0, +1.0],
        y: [+0.0, +0.0, +1.0, +0.0],
        letter: "T",
        color: "grey"
    }, {
        x: [-0.0, -0.0, -0.0, -0.0],
        y: [+1.0, +0.0, -1.0, -2.0],
        letter: "I",
        color: "red"
    }, {
        x: [+1.0, +1.0, -0.0, -0.0],
        y: [+1.0, -0.0, -0.0, +1.0],
        letter: "O",
        color: "cyan"
    }];

    function Piece(id) {
        this.id = id;
        this.center_x = x;
        this.center_y = y;
        this.letter = Pieces[id].letter;
        this.color = Pieces[id].color;
        this.x = Pieces[id].x;
        this.y = Pieces[id].y;
    }

    Piece.prototype.convertXYs = function () {
        converted = {
            x: [],
            y: []
        };
        for (var i = 0; i < this.x.length; i++) {
            converted.x.push(this.x[i] * game.pSize + this.center_x);
            converted.y.push(this.y[i] * game.pSize + this.center_y);
        }
        return converted;
    };

    Piece.prototype.rotateCCW = function () {
        if (this.id === 6) return false;
        var tmp, tPiece, converted;
        tPiece = Tetrimino(this.center_x, this.center_y, this.id);

        for (var i = 0; i < this.x.length; i++) {
            tPiece.x[i] = this.y[i];
            tPiece.y[i] = -this.x[i];
        }

        converted = tPiece.convertXYs();
        for (i = 0; i < converted.x.length; i++) {
            if (game.occupiedQ(converted.x[i], converted.y[i])) {
                return false;
            }
        }

        // since piece rotates around its center 0 0, we copy x y directly

        this.x = tPiece.x;
        this.y = tPiece.y;

        return true;
    };

    Piece.prototype.rotateCW = function () {
        if (this.id === 6) return false;
        var tPiece, converted;
        tPiece = Tetrimino(this.center_x, this.center_y, this.id);

        for (var i = 0; i < this.x.length; i++) {
            tPiece.x[i] = -this.y[i];
            tPiece.y[i] = this.x[i];
        }

        converted = tPiece.convertXYs();
        for (i = 0; i < converted.x.length; i++) {
            if (game.occupiedQ(converted.x[i], converted.y[i])) {
                return false;
            }
        }

        // see rotateCCW
        this.x = tPiece.x;
        this.y = tPiece.y;

        return true;
    };

    Piece.prototype.moveLeft = function () {
        var tPiece, converted;
        tPiece = Tetrimino(this.center_x, this.center_y, this.id);
        for (var i = 0; i < this.x.length; i++) {
            tPiece.x[i] = this.x[i];
            tPiece.y[i] = this.y[i];
        }

        tPiece.center_x -= game.pSize;
        converted = tPiece.convertXYs();

        for (i = 0; i < converted.x.length; i++) {
            if (game.occupiedQ(converted.x[i], converted.y[i])) {
                return false;
            }
        }

        this.center_x = tPiece.center_x;
        return true;
    };

    Piece.prototype.moveRight = function () {
        var tPiece, converted;
        tPiece = Tetrimino(this.center_x, this.center_y, this.id);
        for (var i = 0; i < this.x.length; i++) {
            tPiece.x[i] = this.x[i];
            tPiece.y[i] = this.y[i];
        }

        tPiece.center_x += game.pSize;
        converted = tPiece.convertXYs();

        for (i = 0; i < converted.x.length; i++) {
            if (game.occupiedQ(converted.x[i], converted.y[i])) {
                return false;
            }
        }

        this.center_x = tPiece.center_x;
        return true;
    };

    Piece.prototype.drop = function () {
        var tPiece, converted;
        tPiece = Tetrimino(this.center_x, this.center_y, this.id);
        for (var i = 0; i < this.x.length; i++) {
            tPiece.x[i] = this.x[i];
            tPiece.y[i] = this.y[i];
        }

        tPiece.center_y += game.pSize;
        converted = tPiece.convertXYs();

        for (i = 0; i < converted.x.length; i++) {
            if (game.occupiedQ(converted.x[i], converted.y[i])) {
                return false;
            }
        }

        this.center_y = tPiece.center_y;
        return true;
    };

    Piece.prototype.setCenter = function (x, y) {
        if (arguments.length === 2) {
            this.center_x = arguments[0];
            this.center_y = arguments[1];
        } else {
            if (this.id === 0) {
                this.center_x = 72;
                this.center_y = 60;
            } else if (this.id === 1) {
                this.center_x = 48;
                this.center_y = 60;
            } else if (this.id === 2) {
                this.center_x = 60;
                this.center_y = 48;
            } else if (this.id === 3) {
                this.center_x = 60;
                this.center_y = 48;
            } else if (this.id === 4) {
                this.center_x = 60;
                this.center_y = 48;
            } else if (this.id === 5) {
                this.center_x = 60;
                this.center_y = 72;
            } else if (this.id === 6) {
                this.center_x = 48;
                this.center_y = 48;
            }
        }
    };

    if (typeof (id) === 'undefined') {
        id = Math.floor(Math.random() * Pieces.length);
    }
    return new Piece(id);
}

// should keys be part of game object?
keys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    lTurn: 90, // z
    rTurn: 88, // x
    start_game: 13,
    pause: 80, // p
    space: 32
};

keys.getKey = function (val) {
    for (var key in this) {
        if (this[key] === val) {
            return key;
        }
    }

    return null;
};

addEventListener("keydown", function (e) {
    lastKey = keys.getKey(e.keyCode);

    if (game.linesToClear.length === 0) {
        switch (lastKey) {
            case 'lTurn':
                game.cPiece.rotateCCW();
                break;
            case 'up':
            case 'rTurn':
                game.cPiece.rotateCW();
                break;
            case 'space':
                //game.inactives.push(cPiece);
                //cPiece = Tetrimino(120 - game.pSize / 2, 0 + game.pSize / 2);
                game.start();
                loop();
                break;
            case 'left':
                game.cPiece.moveLeft();
                break;
            case 'right':
                game.cPiece.moveRight();
                break;
            case 'down':
                game.cPiece.drop();
                break;
            default:
        }
    }

    game.drawBoard();
}, false);

var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

function loop() {
    if (game.over === false) {

        //console.log(game.inactives);
        // branch this loop into normal game state and clearing state

        if (game.linesToClear.length > 0) {

            game.clearLines();
            game.drawBoard();
            game.frame += 1;

            // gravity

            if (game.frame === 10) {
                game.frame = 0;
                game.score += 100 * game.linesToClear.length;
                $('#score').text(game.score);
                game.gravity(game.linesToClear);
                game.linesToClear = [];
                //console.log('no more line to clear, back to normal state');
            }
            setTimeout(function () {
                loop();
            }, 1000 / 15); // faster than normal state
        } else {
            //console.log('normal game state');

            // redraw board
            game.drawBoard();
            /////

            if (!game.cPiece.drop()) {
                // CHECK THIS
                if (game.overQ()) {
                    game.over = true;
                }
                game.convert(game.cPiece);
                game.checkFullLines();

                game.cPiece = game.nPiece;
                game.cPiece.setCenter(120 - game.pSize / 2, -24 - game.pSize / 2);
                game.nPiece = Tetrimino(0, 0);
                game.nPiece.setCenter();
                game.ndrawBoard();
                // Log
                $('#' + game.cPiece.letter).text(++game.stats[game.cPiece.letter]);
            }

            setTimeout(function () {
                loop();
            }, 1000 / game.fps);
        }
        /////
    } else {
        console.log("GAME OVER!");
        $('#message').text("GAME OVER!");
    }
}



// do we really need requestAnimationFrame?
$(function () {
	// Initiation
	game.start();

    $('#app-start').click(function () {
		loop();
	});
});