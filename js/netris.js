var netris = function(playerid, gameloop) {
    var blocks = [];

    // get the canvas element using the DOM
    var canvas;
    // use getContext to use the canvas for drawing
    var ctx;
    var DEFAULT_GAME_SPEED = 1;
    var game_speed = 1;
    var last_key = null;
    var DEFAULT_INTERVAL = 250;
    var player_id = playerid;
    var enable_game_loop = gameloop;

    var block_types = [];
    block_types[0] = [[1, 1, 1, 1, 1]];
    //VERTICAl/horizontal line
    block_types[1] = [[1, 1], [1, 1]];
    // square
    block_types[2] = [[1], [1], [1], [1, 1, 1]];
    // L shape
    var colors = ["#EE0000", "#C0FF3E", "#007FFF", "purple", "orange", "black"];

    var grid = new Object();
    var arrow = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space: 32
    };
    var game = {
        start: 0,
        running: 1,
        over: 2
    };
    var game_state = game.running;
    var BLOCK_SIZE = 20;
    var grid_full = [];
    var objIds = 0;
    var num_bottom = 0;
    var points = 0;

    var curMoving;

    function createBlock() {
        //We should only clear lines when new blocks are created so none are in motion
        clearfullLines();

        game_speed = DEFAULT_GAME_SPEED;
        var block = new Object();
        block.type = 1;
        //Math.floor(Math.random()*block_types.length); //pick a random number between 0-n types of blocks
        block.y = -3;
        block.x = 5;
        block.id = objIds;
        block.color = colors[Math.floor(Math.random() * colors.length)];
        block.blockdata = block_types[block.type].clone();
        block.largest_width = calc_width(block.blockdata);


        objIds++;
        if (curMoving) {
            blocks[curMoving.id] = curMoving;
        }
        curMoving = block;
        blocks.push(block);
    }



    function checkKeys() {
        var change = new Object();
        change.x = 0,
        change.y = 0;
        //x,y
        if (last_key) {
            switch (last_key) {
            case arrow.left:
                if (curMoving.x > 0) {
                    change.x -= 1;
                }
                break;
            case arrow.right:
                if ((curMoving.x + 1 + curMoving.largest_width) <= grid.x_size) {
                    change.x += 1;
                }
                break;
            case arrow.down:
                //we should probably just increase speed here
                // change.y += 1;
                break;
            case arrow.space:
                change.y += grid.y_size;
                break;
            }

        }
        //	last_key = null;
        return change;
    }
    function checkCollision(obj, change) {
        var collided_w_box = false;
        //Collide bottom
        var obj_h = obj.y + obj.blockdata.length + change.y;
        if (obj_h >= (grid.y_size)) {
            if (change.y > 1) {
                change.y -= 1;
                return checkCollision(obj, change);
            }
            curMoving.x += change.x;
            curMoving.y += change.y;

            createBlock();
            return true;
        }
        else {
            //lets check to see if it collided with another block
            _.each(blocks,
            function(block) {
                //Naive approach, see if we will collide with any blocks
                if (block.id != obj.id) {
                    // Draw shapes
                    _.each(block.blockdata,
                    function(line, i) {
                        _.each(line,
                        function(item, j) {
                            if (item == 1) {
                                //Lol this is bad, iterate each block in the current block
                                var b_x = (block.x + j);
                                var b_y = (block.y + i);
                                _.each(obj.blockdata,
                                function(oline, i2) {
                                    _.each(oline,
                                    function(oitem, j2) {
                                        if (oitem == 1) {
                                            var o_x = (obj.x + j2) + change.x;
                                            var o_y = (obj.y + i2) + change.y;
                                            if (b_x == o_x && o_y == b_y) {
                                                //Collide
                                                collided_w_box = true;
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
        if (collided_w_box) {
            if (curMoving.y <= 0) {
                //were at top game over;
                game_state = game.over;
                alert("game over!");
                return true;
            }


            createBlock();
            return true;
        }

        return false;
    }

    function addPoints() {
        points += 115;
        $("#points1").text(points);
    }

    function clearfullLines() {
        var empty_rows = [];
        _.each(grid_full,
        function(g, i) {
            if (g.join().indexOf("0") == -1) {
                empty_rows.push(i);
                addPoints();
                //Add points for each line that gets cleared
            }
        });

        if (empty_rows.length > 0) {

            _.each(blocks,
            function(block) {
                _.each(block.blockdata,
                function(line, i) {
                    _.each(line,
                    function(item, j) {
                        _.each(empty_rows,
                        function(erow) {
                            if ((block.y + j) == erow) {
                                block.blockdata[i][j] = 0;
                            };
                        });
                    });
                });
            });
        }

    }

    function drawGrid() {
        ctx.fillStyle = '#00f';
        // blue
        ctx.strokeStyle = '#f00';
        // red
        ctx.lineWidth = 1;

        for (var i = 1; i < grid.x_size; i++) {
            ctx.beginPath();
            ctx.moveTo(BLOCK_SIZE * i, 0);
            ctx.lineTo(BLOCK_SIZE * i, canvas.height);

            ctx.stroke();
            ctx.closePath();
        }

        for (var i = 1; i < grid.y_size; i++) {
            ctx.beginPath();
            ctx.moveTo(0, BLOCK_SIZE * i);
            ctx.lineTo(canvas.width, BLOCK_SIZE * i);

            ctx.stroke();
            ctx.closePath();
        }


    }

    function drawObjects() {
        emptyGrid();
        _.each(blocks,
        function(block) {
            // Draw shapes
            _.each(block.blockdata,
            function(line, i) {
                _.each(line,
                function(item, j) {
                    if (item == 1) {
                        ctx.fillStyle = block.color;
                        ctx.fillRect((block.x + j) * BLOCK_SIZE, (block.y + i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE * item);
                        if (block.y >= 0) {
                            grid_full[block.y + j][block.x + i] = 1;
                        }
                    };
                });
            });
        });

    }

    function emptyGrid() {
        for (var i = 0; i < grid.y_size; i++) {
            grid_full[i] = [];
            for (var j = 0; j < grid.x_size; j++) {
                grid_full[i][j] = 0;
            }
        }
    }

    function calc_width(blockdata) {
        var largest = 0;
        _.each(blockdata,
        function(line, i) {
            var tlargest = 0;
            _.each(line,
            function(item, j) {
                if (j = 1) {
                    tlargest++;
                }
            });
            if (tlargest > largest) {
                largest = tlargest;
            }
        });
        return largest
    }

    Object.prototype.clone = function() {
        var newObj = (this instanceof Array) ? [] : {};
        for (i in this) {
            if (i == 'clone') continue;
            if (this[i] && typeof this[i] == "object") {
                newObj[i] = this[i].clone();
            } else newObj[i] = this[i]
        }
        return newObj;
    };

    $(document).keydown(function(e) {
        var keyCode = e.keyCode || e.which;
        last_key = keyCode;
    });

    $(document).keyup(function(e) {
        last_key = null;
    });

    return {
        start: function() {
            canvas = document.getElementById('tetris'+player_id);
            ctx = canvas.getContext('2d');

            // Make sure we don't execute when canvas isn't supported
            if (ctx) {
                grid.x_size = canvas.width / BLOCK_SIZE;
                grid.y_size = canvas.height / BLOCK_SIZE;
                points = 0;
                $("#points"+player_id).text(points);

				if(enable_game_loop) {
                	createBlock();
				}
                // Start with one block
               	setTimeout("player" + player_id + ".gameLoop()", DEFAULT_INTERVAL);
            } else {
                alert('You need Safari or Firefox 1.5+ to see this demo.');
            }
        },

        gameLoop: function() {
            if (game_state == game.running) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                drawGrid();
				if(enable_game_loop) {
	                var change = checkKeys();
	                change.y += 1;
	                //Move it down
	                if (!checkCollision(curMoving, change)) {
	                    curMoving.y += change.y;
	                    curMoving.x += change.x;
	                }
				}
                drawObjects();

                setTimeout("player" + player_id + ".gameLoop()", DEFAULT_INTERVAL / game_speed);
            }
        }


    }

};


var player1 = netris('1',true);