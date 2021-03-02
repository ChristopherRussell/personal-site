function Game(ctx, unit, view_length, map_length) {
    this.armies = [];
    this.cities = [];
    ctx.font = '16px Arial';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';

    Tile = function(x, y, c) {
        this.x = x;
        this.y = y;
        this.contents = c;
        this.resolved = false;
           
        this.raid = function(army, city) {
            if (city.status_ == "n") {
                army.gold += city.gold;
                city.status_ = "d";
                city.gold = 0;
            }
        }

        this.battle = function(army1, army2) {
            var loss = Math.min(army1.mass, army2.mass);
            army1.mass -= loss;
            army2.mass -= loss;
        }

        this.garrison = function(army, city) {
            city.status_ = "g";
        }

        this.resolve = function() {
            if (this.resolved || this.contents.length < 2) {
                return;
            }
            var c0 = this.contents[0],
                c1 = this.contents[1];
            switch (c0.type+ c1.type) {
                case "ac":
                    if (c1.owner == c0) {
                        this.garrison(c0, c1);
                    } else {
                        this.raid(c0, c1);
                    }
                    break;
                case "ca":
                    if (c0.owner == c1) {
                        this.garrison(c1, c0);
                    } else {
                        this.raid(c1, c0);
                    }

                    break;
                case "aa":
                    this.battle(c0, c1);
                    break;
                default:
                    console.log("resolve failure");
            }
            this.resolved = true;
        }
    }

    tiles = Array(map_length);
    for (var i = 0; i < map_length; i++) {
        tiles[i] = Array(map_length);
        for (var j = 0; j < map_length; j++) {
            tiles[i][j] = new Tile(i, j, []);
        }
    }

    this.Army = function(x, y, m, g) {
        this.x = x;
        this.y = y;
        this.tile = tiles[x][y];
        this.mass = m;
        this.gold = g;
        this.type = "a";
        this.justMoved = false;

        // draw relative to view with top-left tile being tile at (a,b)
        this.show = function(l, t) {
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.ellipse((this.x - l + 0.5) * unit,
                        (this.y - t + 0.5) * unit,
                        unit / 2.5, unit / 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            // ctx.font = '20px Arial';
            // ctx.textAlign = "center";
            // ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white'; 
            ctx.fillText(this.mass, unit * (this.x - l + 0.5), unit * (this.y - t + 0.5));
        }

        this.moveX = function(m) {
            if (this.x + m >= 0 && this.x + m < map_length) {
                this.x += m;
                var i = this.tile.contents.indexOf(this);
                this.tile.contents.splice(i, 1);
                this.tile = tiles[this.x][this.y];
                this.tile.contents.push(this);
            }
        }

        this.moveY = function(m) {
            if (this.y + m >= 0 && this.y + m < map_length) {
                this.y += m;
                var i = this.tile.contents.indexOf(this);
                this.tile.contents.splice(i, 1);
                this.tile = tiles[this.x][this.y];
                this.tile.contents.push(this);
            }
        }

        this.tile.contents.push(this);
    }

    this.City = function(x, y, g = 100, i = 1, s = 500, st = "n", p) {
        this.x = x;
        this.y = y;
        this.tile = tiles[x][y];
        this.gold = g;
        this.industry = i;
        this.storage = s;
        this.damaged = false; // deprecated, remove soon
        this.status_ = st; // n - normal , d - damaged, g - garrisoned
        this.type = "c";
        this.owner = p;

        // draw relative to view with top-left tile being tile at (l,t)
        this.show = function(l, t) {
            ctx.beginPath();
            switch (this.status_) {
                case "n":
                    ctx.fillStyle = 'black';
                    break;
                case "d":
                    ctx.fillStyle = 'grey';
                    break;
                case "g":
                    ctx.fillStyle = 'teal';
                    break;
            }
            ctx.rect((this.x - l + 0.1) * unit,
                     (this.y - t + 0.1) * unit, 0.8 * unit, 0.8 * unit)
            ctx.fill();
            ctx.closePath();
        }
        this.tile.contents.push(this);        
    }

    // draw local view around <army>
    this.draw = function(army) {
        var x = army.x,
            y = army.y,
            d = (view_length - 1) / 2,
            l = Math.min(map_length - view_length,
                         Math.max(0, x - d));
            t = Math.min(map_length - view_length,
                         Math.max(0, y - d));
        ctx.clearRect(0, 0, view_length * unit, view_length * unit);
        for (var i = l; i < l + view_length; i++) {
            for (var j = t; j < t + view_length; j++) {
                tiles[i][j].contents.forEach( (element) => {element.show(l, t);} );
            }
        }
    }

    // update objects after one game step
    this.update = function() {
        // add gold to undamaged cities and
        // repair damaged cities with 20% probability
        for (var i = 0; i < this.cities.length; i++) {
            if (this.cities[i].status_ != "d") {
                var g = this.cities[i].gold + this.cities[i].industry * 100;
                if (g > this.cities[i].storage) {
                    this.cities[i].gold = this.cities[i].storage;
                } else {
                    this.cities[i].gold = g;
                }
            } else if (Math.random() < 0.1) {
                this.cities[i].status_ = "n";
            }
        }

        // resolve battles, garrisons, and raids due to army movement
        for (var i = 0; i < this.armies.length; i++) {
            if (this.armies[i].justMoved) {
                this.armies[i].tile.resolve();
                this.armies[i].justMoved = false;
            }
        }

        // remove armies with mass 0 and reset resolved attribute
        for (var i = 0; i < this.armies.length; i++) {
            if (this.armies[i].mass == 0) {
                var j = this.armies[i].tile.contents.indexOf(this.armies[i]);
                this.armies[i].tile.contents.splice(j, 1);
            }
            this.armies[i].tile.resolved = false;
        }

        this.armies = this.armies.filter( army => army.mass > 0 );
    }
}
