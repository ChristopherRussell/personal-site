$(function() {

    var player = '<div id="player"></div>';
    $("#map").append(player);
    var lpos = $("#map").position().left;
    var newlpos = lpos + 200 + 'px';
    $("#map").css("left", newlpos);

    $(document).keydown(function(e) {    
        var p = $("#player").position();
        switch (e.keyCode) {
            case 37:    //left
                $("#player").css("left", (p.left - 20) + 'px');
                break;
            case 38:    //up
                $("#player").css("top", (p.top - 20) + 'px');
                break;
            case 39:    //right
                $("#player").css("left", (p.left + 20) + 'px');
                break;
            case 40:    //down
                $("#player").css("top", (p.top + 20) + 'px');
                break;
        }
    });
});
