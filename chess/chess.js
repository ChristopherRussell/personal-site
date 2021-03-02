var board = document.getElementById("board");
// create chess board
for (i = 1; i < 9; i++) {
    for (j = 1; j < 9; j++) {
        sq = document.createElement("div");
        sq.classList.add("square");
        sq.id = String(i) + String(j);
        if ((i + j) % 2 == 0) {
            sq.style.backgroundColor = "SeaShell";
        }   else {
            sq.style.backgroundColor = "Khaki";
        }
        board.appendChild(sq);
    }
}

// allow squares to have pieces dropped on them
var squares = document.getElementsByClassName("square");
var i;
for (i = 0; i < squares.length; i++) {
    squares[i].ondragover=allowDrop;
    squares[i].droppable="true";
    squares[i].ondrop = drop;
}

var src; // source of piece being moved
var movingPiece; // piece being moved 
var turn = 1; // turn number, odd is white, even is black

// place pieces
newGame();

// set onclick for new game button

// place white pieces
function placePiece(piece, x, y) {
    // class string
    var cl = "piece";
    // white or black
    if (piece[0] == "w") {
        cl += " white";
    } else {
        cl += " black";
    }
    // piece type
    switch(piece[1]) {
        case "r":
            cl += " rook";
            break;
        case "n":
            cl += " knight";
            break;
        case "b":
            cl += " bishop";
            break;
        case "q":
            cl += " queen";
            break;
        case "k":
            cl += " king";
            break;
        case "p":
            cl += " pawn";
            break;
    }
    // add piece to board
    $("#" + x + y).append('<img class="' + cl + '" id="' + piece +
                          '" src="chess/' + piece[0] + piece[1] + '.png">');
}

function newGame() {
    // reset turn number
    turn = 1;

    // if there are already pieces on the board then remove them
    pieces = document.getElementsByClassName("piece");
    while (pieces.length > 0) {
        pieces.item(0).remove();
    }

    // place white major pieces
    placePiece("wr1", 8, 1);
    placePiece("wn1", 8, 2);
    placePiece("wb1", 8, 3);
    placePiece("wq", 8, 4);
    placePiece("wk", 8, 5);
    placePiece("wb2", 8, 6);
    placePiece("wn2", 8, 7);
    placePiece("wr2", 8, 8);

    // place white pawns
    placePiece("wp1", 7, 1);
    placePiece("wp2", 7, 2);
    placePiece("wp3", 7, 3);
    placePiece("wp4", 7, 4);
    placePiece("wp5", 7, 5);
    placePiece("wp6", 7, 6);
    placePiece("wp7", 7, 7);
    placePiece("wp8", 7, 8);

    // place black major pieces
    placePiece("br1", 1, 1);
    placePiece("bn1", 1, 2);
    placePiece("bb1", 1, 3);
    placePiece("bq", 1, 4);
    placePiece("bk", 1, 5);
    placePiece("bb2", 1, 6);
    placePiece("bn2", 1, 7);
    placePiece("br2", 1, 8);

    // place black pawns
    placePiece("bp1", 2, 1);
    placePiece("bp2", 2, 2);
    placePiece("bp3", 2, 3);
    placePiece("bp4", 2, 4);
    placePiece("bp5", 2, 5);
    placePiece("bp6", 2, 6);
    placePiece("bp7", 2, 7);
    placePiece("bp8", 2, 8);

    // allow pieces to be dragged and dropped
    var i;
    var pieces = document.getElementsByClassName("piece");
    for (i = 0; i < pieces.length; i++) {
        pieces[i].draggable="true";
        pieces[i].ondragstart=drag;
    }
}

// drag and drop functionallity for squares and pieces
function allowDrop(e) {
    e.preventDefault();
}
function drag(e) {
    e.dataTransfer.setData("text", e.target.id);
    src = e.target.parentElement.id;
    movingPiece = e.target.id;
}
function drop(e) {
    e.preventDefault();
    // image to move
    var data = e.dataTransfer.getData("text");

    // determine location
    if (e.target.classList.contains("square")) {
        var dest = e.target; // empty square
    } else if (e.target.parentElement.classList.contains("square")) {
        var dest = e.target.parentElement;
    }

    // determine whether move is legal
    if (move(movingPiece, src, dest.id)) {
        dest.appendChild(document.getElementById(data));
        turn++;
    }
}

function move(pc, start, end) {
    // only allow white or black to move on their turn
    if (pc[0] == "w" && (turn % 2) != 1) { return false; }
    if (pc[0] == "b" && (turn % 2) != 0) { return false; }

    // can't move to the current square
    if (start == end) { return false; }

    var dif1 = start[0] - end[0];
    var dif2 = start[1] - end[1];
    switch(pc[1]) {
        case "r": // rooks
            return rMove(pc[0], start, end);
            break;
        case "n": // knights
            if (dif1 == 0 ||
                dif2 == 0 ||
                (Math.abs(dif1) + Math.abs(dif2) != 3)) {
                return false; 
            } else if (isSquareOccupied(end[0], end[1])) {
                return take(pc[0], end[0], end[1]);
            }
            return true;
            break;
        case "b": // bishops
            return bMove(pc[0], start, end);
            break;
        case "k": // kings
            return kMove(pc[0], start, end);
            break;
        case "q": // queens
            return (rMove(pc[0], start, end) || bMove(pc[0], start, end));
            break;
        case "p": // pawns- black pawns and white pawns move differently
            return pMove(pc[0], start, end);
            break;
        default:
            return false;
    }
}

function rMove(color, start, end) {
    var dif1 = start[0] - end[0];
    var dif2 = start[1] - end[1];
    var i;
    if ((dif1 != 0 && dif2 != 0)) { // rooks move along rows or columns
        return false; // not a rook move
    }

    // check if vertical move is blocked by another piece
    if (dif1 == 0) { // rook moving vertically
        var sign = Math.sign(start[1] - end[1]); // moving left or right?
        for (i = parseInt(start[1]) - sign; i != end[1]; i -= sign) {
            if (isSquareOccupied(start[0], i)) {
                console.log("invlaid move: blocked by another piece");
                return false; // move blocked
            }
        }
    }

    // check if horizontal move is blocked by another piece
    if (dif2 == 0) { // rook moving horizontally
        var sign = Math.sign(start[0] - end[0]); // moving up or down?
        for (i = parseInt(start[0]) - sign; i != end[0]; i -= sign) {
            if (isSquareOccupied(i, start[1])) {
                console.log("invlaid move: blocked by another piece");
                return false; // move blocked
            }
        }
    }

    // check if destination square is occupied
    if (isSquareOccupied(end[0], end[1])) {
        // if occupied by an enemy piece then take it and return true,
        // if occupied by a friendly piece then return false.
        return take(color, end[0], end[1]);
    }
    return true;
}

function bMove(color, start, end) {
    var dif1 = start[0] - end[0],
        dif2 = start[1] - end[1];
    if (Math.abs(dif1) != Math.abs(dif2)) {
        return false;
    }

    // these describe the four possible directions of the move
    var sign1 = Math.sign(dif1),
        sign2 = Math.sign(dif2);

    for (i = 1; i < Math.abs(dif1); i++) {
        // x, y are the co-ordinates of a square between start and end
        var x = parseInt(start[0]) - i * sign1,
            y = parseInt(start[1]) - i * sign2;
        if (isSquareOccupied(x, y)) { // if the square with id "xy" is occupied
            console.log("invlaid move: blocked by another piece");
            return false; // move blocked
        }
    }

    // check if destination square is occupied
    if (isSquareOccupied(end[0], end[1])) {
        // if occupied by an enemy piece then take it and return true,
        // if occupied by a friendly piece then return false.
        return take(color, end[0], end[1]);
    }
    return true;
}

function nMove(color, start, end) {
    var dif1 = start[0] - end[0];
    var dif2 = start[1] - end[1];

    if (dif1 == 0 ||
        dif2 == 0 ||
        (Math.abs(dif1) + Math.abs(dif2) != 3)) {
        return false;
    } else if (isSquareOccupied(end[0], end[1])) {
        return take(color, end[0], end[1]);
    }
    return true;
}

// TODO: disallow moves into check
function kMove(color, start, end) {
    var dif1 = start[0] - end[0];
    var dif2 = start[1] - end[1];
    
    if (Math.abs(dif1) >= 2 || Math.abs(dif2) >= 2) {
        return false;
    } else if (isSquareOccupied(end[0], end[1])) {
        return take(color, end[0], end[1]);
    }
    return true;
}

function pMove(color, start, end) {
    var dif1 = start[0] - end[0],
        dif2 = start[1] - end[1];
    
    // black pawns move down, white pawns move up
    var sign = 1; // dif1 should be positive for white
    if (color == "b") {
        sign = -1; // dif1 should be negative for black
    }

    // advancing one square
    if (dif1 == sign && dif2 == 0) {
        return !isSquareOccupied(end[0], end[1]);
    }
    
    // advancing two squares
    if (dif1 == 2 * sign && dif2 == 0) {
        // check if on starting square
        if (color == "w" && start[0] != 7) { return false; }
        if (color == "b" && start[0] != 2) { return false; }
        // check if move is blocked by another piece
        return !(isSquareOccupied(parseInt(start[0]) - sign, end[1]) ||
                 isSquareOccupied(end[0], end[1]));
    }

    // taking
    if (dif1 == sign && Math.abs(dif2) == 1 &&
                        isSquareOccupied(end[0], end[1])) {
        return take(color, end[0], end[1]);
    }
    return false; // invalid move
}
// check if a square contains a piece
function isSquareOccupied(i, j) {
    var sq = document.getElementById(String(i) + String(j));
    if (sq.querySelector(".piece") != null) {
        return true; // square occupied
    }
    return false; // square empty
}

// check if destination of a move is occupied by a piece. returns false if
// piece has the same color as the moving piece and returns true plus
// removes the piece if it has opposite color.
function take(color, i, j) {
    var sq = document.getElementById(String(i) + String(j));
    var pc = sq.querySelector(".piece");
    if (pc.id[0] == color) {
        return false;
    }
    pc.remove();
    return true;
}



//TODO: en-passant, pawn promotion, castling, invlaid moves due to check, forced king move due to check, checkmate
