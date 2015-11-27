/*jslint browser: true, plusplus: true*/
/*global $, jQuery, console, alert*/

function generateSudoku(table) {
    "use strict";
    var base = [[1, 2, 3, 4, 5, 6, 7, 8, 9],
                [4, 5, 6, 7, 8, 9, 1, 2, 3],
                [7, 8, 9, 1, 2, 3, 4, 5, 6],
                [2, 3, 4, 5, 6, 7, 8, 9, 1],
                [5, 6, 7, 8, 9, 1, 2, 3, 4],
                [8, 9, 1, 2, 3, 4, 5, 6, 7],
                [3, 4, 5, 6, 7, 8, 9, 1, 2],
                [6, 7, 8, 9, 1, 2, 3, 4, 5],
                [9, 1, 2, 3, 4, 5, 6, 7, 8]],
        mix_func = [],
        i = 0,
        k = 0,
        j = 0;
    
    function transponing() {
        var T = [],
            i = 0,
            j = 0;
        
        for (i = 0; i < 9; ++i) {
            T[i] = [];
        }
        
        for (i = 0; i < 9; ++i) {
            for (j = 0; j < 9; ++j) {
                T[i][j] = base[j][i];
            }
        }
        
        base = T;
        
        //console.log("Transpose");
        
    }
    
    function swap_rows_small() {
        var i = Math.floor(Math.random() * 8),
            j = 0,
            tmp = base[i];
        
        //console.log("i: " + i);
        
        do {
            j = (i - i % 3) + Math.floor(Math.random() * 2);
        } while (j === i);
        
        //console.log("j: " + j);
        
        base[i] = base[j];
        base[j] = tmp;
        //console.log("Rows swaped(" + i + "," + j + ")");
    }
    
    function swap_cols_small(){
        transponing();
        swap_rows_small();
        transponing();
    }
    
    function swap_rows_area() {
        var i = Math.round(Math.random() * 2),
            j,
            k = 0,
            tmp = [];
        
        //console.log("i:" + i);
        
        do {
            j = Math.round(Math.random() * 2);
        } while (i === j);
        
        //console.log("j:" + j);
        
        for (k = 0; k < 3; ++k) {
            tmp = base[i * 3 + k];
            base[i * 3 + k] = base[j * 3 + k];
            base[j * 3 + k] = tmp;
        }
        
        //console.log("Row areas swaped (" + i + "," + j + ")");
    }
    
    function swap_cols_area() {
        transponing();
        swap_rows_area();
        transponing();
    }
    
    mix_func = [transponing,
                swap_rows_small,
                swap_cols_small,
                swap_rows_area,
                swap_cols_area];
    
    for (i = 0; i < 10000; ++i) {
        j = Math.floor(Math.random() * 5);
        mix_func[j].call();
    }
    
    for (i = 0; i < 45; ++i) {
        do {
            j = Math.floor(Math.random() * 9);
            k = Math.floor(Math.random() * 9);
        } while ((base[j][k] === 0));
        //console.log("(" + i + "," + j + "): " + base[j][k]);
        base[j][k] = 0;
    }
    
    table = base;
    
    return table;
}

function startTime(intervalID) {
    "use strict";
    var seconds = 0,
        minutes = 0,
        hours = 0,
        time;
    intervalID = setInterval(function () {
        ++seconds;
        if (seconds > 59) {
            seconds -= 60;
            ++minutes;
        }
        if (minutes > 59) {
            minutes -= 60;
            ++hours;
        }
        if (hours > 0) {
            time = ((hours < 10) ? "0" + hours : hours) + ":" + ((minutes < 10) ? "0" + minutes : minutes) + ":" + ((seconds < 10) ? "0" + seconds : seconds);
        } else {
            time = ((minutes < 10) ? "0" + minutes : minutes) + ":" + ((seconds < 10) ? "0" + seconds : seconds);
        }
        $("#timer div").text(time);
    }, 1000);
}

$(document).ready(function () {
    "use strict";
    
    /*Starting class implementaition*/
    $('#select').hide();
    $('.block tr td').addClass("cell changeable");
    $('#select tr td').addClass("choice");
    $('#2 .cell, #4 .cell, #6 .cell, #8 .cell').addClass("darkened");
    $('.cell').html('&nbsp;&nbsp;');
    
    var notes_mode = false,
        moves = [],
        level = [],
        i = 1,
        j = 1,
        intervalID;
    
    startTime(intervalID);
    
    /*First level*/
    level = generateSudoku(level);
    for (i = 1; i <= 9; ++i) {
        for (j = 1; j <= 9; ++j) {
            if (level[i - 1][j - 1] !== 0) {
                $("#" + i + j).html(level[i - 1][j - 1]);
                $("#" + i + j).removeClass("changeable");
            } else {
                $("#" + i + j).html('&nbsp;&nbsp;');
                $("#" + i + j).addClass("changeable");
            }
        }
    }
    
    /*Digit selection*/
    $('.cell').on('click', function () {
        //console.log($(this).attr('id') + " " + $(this).attr("class"));
        if ($(this).hasClass("changeable")) {
            $('.error').removeClass("error");
            $('.waiting').removeClass("waiting");
            var     pos = $(this).offset(),
                height = $(this).height(),
                width = $(this).width();
            $('#select').hide();
            $('#select').css({
                position: "absolute",
                top: pos.top + "px",
                left: pos.left + "px"
            });
            $(this).addClass("waiting");
            $('#select').fadeIn(200);
        }
    });
    
    $('#select').on('mouseleave', function () {
        $('.waiting').removeClass("waiting");
        $('#select').fadeOut(200);
    });
    
    $('.choice').on('click', function () {
        var i = $('.waiting').attr("id")[0],
            j = $('.waiting').attr("id")[1];
        moves.push({cell_number: $('.waiting').attr('id'), previous_state: $('.waiting').text()});
        $('.waiting').text($(this).text());
        $('.waiting').removeClass("waiting");
        $('#select').fadeOut(200);
    });
    
/*MENU*/
    
    /*Undo (revert last move)*/
    $('#undo').on('click', function () {
        $('.error').removeClass("error");
        if (moves.length > 0) {
            var last = moves.pop();
            $("#" + last.cell_number).html(last.previous_state);
        }
    });
    
    /*Reset (all changable cells)*/
    $('#reset').on('click', function () {
        $('.changeable').html('&nbsp;&nbsp;');
        $('.error').removeClass("error");
        moves = [];
    });
    
    /*Notes (toggle nodes mode)*/
    $('#notes').on('click', function () {
        notes_mode = !notes_mode;
        $('#notes').toggleClass("toggled");
    });
    
    /*New game*/
    $('#new_game').on('click', function () {
        clearInterval(intervalID);
        startTime(intervalID);
        level = generateSudoku(level);
        $('.cell').html('&nbsp;&nbsp;');
        $('.error').removeClass("error");
        /*Generate new level*/
        var i = 1,
            j = 1;
        for (i = 1; i <= 9; ++i) {
            for (j = 1; j <= 9; ++j) {
                if (level[i - 1][j - 1] !== 0) {
                    $("#" + i + j).html(level[i - 1][j - 1]);
                    $("#" + i + j).removeClass("changeable");
                } else {
                    $("#" + i + j).html('&nbsp;&nbsp;');
                    $("#" + i + j).addClass("changeable");
                }
            }
        }
    });
    
    /*Check*/
    $('#check').on('click', function () {
        var i = 1,
            j = 1,
            k = 1,
            l = 1,
            max_X,
            max_Y,
            error = false,
            field_full = true,
            current_cell;
        
        for (i = 1; i <= 9; ++i) {
            for (j = 1; j <= 9; ++j) {
                current_cell = $("#" + i + j);
                for (k = 1; k <= 9; ++k) {
                    if (current_cell.html() !== '&nbsp;&nbsp;') {
                        
                        if (k !== j && current_cell.text() === $("#" + i + k).text()) {
                            current_cell.addClass("error");
                            $("#" + i + k).addClass("error");
                            error = true;
                        }
                        
                        if (k !== i && current_cell.text() === $("#" + k + j).text()) {
                            current_cell.addClass("error");
                            $("#" + k + j).addClass("error");
                            error = true;
                        }
                    } else {
                        field_full = false;
                    }
                }
                
                /*
                if (current_cell.html() !== '&nbsp;&nbsp;') {
                    max_X = current_cell.closest("table tl td").first().attr('id')[1];
                    max_Y = current_cell.closest("table tl td").first().attr('id')[2];
                    
                    for (k = max_X; k <= max_X + 2; ++k) {
                        for (l = max_Y; l <= max_Y + 2; ++l) {
                            if (k !== i && l !== j && current_cell.text() === $("#" + k + l).text()) {
                                current_cell.addClass("error");
                                $("#" + k + j).addClass("error");
                                error = true;
                            }
                        }
                    }
                } else {
                    field_full = false;
                }
                */
            }
        }
        if (field_full && !error) {
            alert("SUCCESS!!!");
        }
    });
    
});
