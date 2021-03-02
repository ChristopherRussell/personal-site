var c = document.getElementById("canvas");
c.style.backgroundColor = "khaki";
var ctx = c.getContext("2d");
var map_length = 11,
    view_length = 5,
    unit = 100;
game = new Game(ctx, unit, view_length, map_length);

var player = new game.Army(6, 6, 100, 100);
game.armies.push(player);
var playerCity = new game.City(6, 6, 500, 1, 1, "g", player);

// randomly place some other armies and cities
var coord = Array(map_length ** 2);
for (var i = 0; i < map_length; i++) {
    for (var j = 0; j < map_length; j++) {
        coord[i + j * map_length] = [i,j];
    }
}
coord.splice(6 + 6 * map_length, 1); // remove player start point


function Shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){}
	return o;
};

coord = Shuffle(coord);
for (var i = 0; i < 2 * map_length; i++) {
    game.cities.push(new game.City(coord[i][0], coord[i][1],
                                  Math.floor(501 * Math.random())));
}
for (var i = 2 * map_length; i < 3 * map_length; i++) {
    game.armies.push(new game.Army(coord[i][0], coord[i][1], 
                                  Math.floor(51 * Math.random()),
                                  Math.floor(501 * Math.random())));
}

var nextKey = null,
    tickLength = 20;
    timer = tickLength;

$(document).keydown(function(e) {    
    nextKey = e.keyCode;
});

keyPress = function() {
    clearInterval(timerInt);
    timer = tickLength;
    timerInt = setInterval(timerControl, 100);
    player.justMoved = true;
    switch (nextKey) {
        case 37:    //left
            player.moveX(-1);
            update();
            break;
        case 38:    //up
            player.moveY(-1);
            update();
            break;
        case 39:    //right
            player.moveX(+1);
            update();
            break;
        case 40:    //down
            player.moveY(+1);
            update();
            break;
    }
    nextKey = null;
}

var menu1 = document.getElementById("side-menu-1");
var menu2 = document.getElementById("side-menu-2");
var menu3 = document.getElementById("side-menu-3");
var menu4 = document.getElementById("side-menu-4");
var menu5 = document.getElementById("side-menu-5");

updateMenu = function() {
    menu1.innerHTML = "Mass: " + player.mass;
    menu2.innerHTML = "Gold: " + player.gold;
    menu3.innerHTML = "X: " + player.x;
    menu4.innerHTML = "Y: " + player.y;
}

update = function() {
    game.update();
    game.draw(player);
    updateMenu();
}

update();

function timerControl() {
    if (timer > 0) {
        timer--;
    } else {
        timer = tickLength;
    }
    menu5.innerHTML = "Next turn: " + (timer / 10);
}
var timerInt = setInterval(timerControl, 100);
setInterval(keyPress, 100 * tickLength);


// TODO: update only called when a key is pressed, should happen every game tick
