function hide(arg) {
    if (!checkNowRobot("hide"))
        return false;
    check_arg(arg, "hide");
    save_cmd(_nowRobot.varname, "hide", "");
    _nowRobot.releaseNowRobot();
}
function hide_action() {
    $("#" + _nowRobot.varname).css("z-index", "-1");
}
function unhide(arg) {
    if (!checkNowRobot("unhide"))
        return false;
    check_arg(arg, "unhide");
    save_cmd(_nowRobot.varname, "unhide", "");
    _nowRobot.releaseNowRobot();
}
function unhide_action() {
    $("#" + _nowRobot.varname).css("z-index", "10");
}
function initBtn() {
    $(".btn").mouseover(function(e) {
        show_btn_str($(this).attr("id"), e.pageX, 73);
    });
    $(".btn").mouseout(function(e) {
        hide_btn_str();
    });
    $("#worldstory").mouseover(function(e) {
        if (get_px("worldstory", "h") <= 15) {
            var ey = 145;
            if (e.pageY < 100) {
                ey = 45;
            }
            show_btn_str("월드스토리", e.pageX, ey, "#c3d69b");
        }
    });
    $("#worldstory").mouseout(function(e) {
        hide_btn_str();
    });
    $("#cbbtn").mouseover(function(e) {
        var ey = 127;
        if (e.pageY < 100) {
            ey = 27;
        }
        show_btn_str("코드블록", e.pageX, ey, "#c3d69b");
    });
    $("#cbbtn").mouseout(function(e) {
        hide_btn_str();
    });
    $("#speedBtn2").click(function(e) {
        if ($("#speedlist").length) {
            $("#speedlist").remove();
        } else {
            $("body").append(str_speedlist);
            $("#speedlist").css("left", e.pageX - 13);
        }
        $(".speedlist").click(function() {
            _delayTime = (10 - Number($(this).text()) + 1) * 50;
            initSliderValue("speed", _delayTime);
            $("#speedlist").remove();
        });
    });
}
function fadeout_logo() {
    $("#loadingLogo").fadeOut(1000);
    if (_br.search("chrome") < 0) {
        $("div.cb").css("letter-spacing", "-1px");
    }
}
var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "application/javascript",
    matchBrackets: true,
    smartIndent: false,
    tabMode: "indent",
    indentWithTabs: true,
    indentUnit: 4,
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true
});
editor.on("change", function() {
    clearTimeout(_delayKeyIn);
    _delayKeyIn = setTimeout(updateCdata, 300);
    if ($(".userblock").length) {
        codeblock_userblock();
    }
});
editor.on("focus", function() {
    if (editor.state.overwrite == true) {
        editor.state.overwrite = false;
    }
});
editor.setOption("extraKeys", {
    Insert: function(editor) {
        if (editor.state.overwrite == true) {
            editor.state.overwrite = false;
        }
    }
});
window.onkeydown = function() {
    if (event.keyCode == 27) {
        push_esc();
    }
    if (event.keyCode == 8) {
        if (_keyctrl) {
            event.returnValue = false;
        }
    }
    if (event.keyCode == 113) {
        if (!_running) {
            if (sessionStorage['language'] == "js") {
                executeRobot();
            } else {
                $("#executeBtn_py").click();
            }
        } else {
            stopRobot();
        }
    }
    if (event.keyCode == 115) {
        stopRobot();
        refreshRobot();
    }
    if (event.keyCode == 118) {
        if (_userid) {
            document.location = "./logout.php";
        } else {
            loginForm();
        }
    }
    if (!is_open_playbot()) {
        if (event.keyCode == 119) {
            hideCodeArea();
        }
        if (event.keyCode == 120) {
            fullscreen();
            initWindowSize();
        }
        if (event.keyCode == 121) {
            codemirror_fontsize();
        }
    }
    if (_keypress) {
        KEY = "";
        for (var i = 0; i <= _keycode.length - 1; i++) {
            if (event.keyCode == _keycode[i]) {
                keypress_what(event.keyCode);
                clearAllCmd();
                backupBeforeState();
                _runposition = "form";
                executeCode(_keyfunc[i], _runposition);
                restoreBeforeState();
                clearTimeout(_delayID);
                _delayID = setTimeout(runRobot, 0);
                clear_move();
                break;
            }
        }
    }
}
;
Array.prototype.removeElement = function(index) {
    this.splice(index, 1);
    return this;
}
;
var _startX = 0
  , _nowX = 0;
var _oldWidth = 0
  , _newWidth = 0;
var _resize = false;
var _rows, _cols, _arows, _acols, _maxRows = 15, _maxCols = 20;
var _world = new Array();
var _world2 = new Array();
var _wcolor = new Array();
var _wcolor2 = new Array();
var _wtext = new Array();
var _wtext2 = new Array();
var _wobject = new Array();
var _wobject2 = new Array();
var _background, _background_wall = 1;
var _objectBag = new Array();
var _prevEdit;
var _wall, _walledited;
var _maxCellBeeper = 100;
var _delayTime, _delayID, _delayKeyIn, _defaultDelayTime = 500;
var _userid, _username;
var _cmd = new Array();
var _cmds, _cmdindex, _maxCmds = 3000, _limitcnt = 0;
var _wuid, _wowner, _wsubject, _wstory, _wdata, _wcolors, _wrows, _wcols, _wstart, _wobjects, _wbg, _wbgwall, _wobjbag, _wtexts, _worigin = "", _wmode, _wsubwuid;
var _cuid, _csubject, _cdata, _cdata2, _cmode;
var _adata, _acolors, _aobject, _atexts, _acoord, _achecks;
var _rbeeper, _robject, _rcolor, _rtext, _rjump, _rcoord, _rposition, _rdirection, _ansresult;
var _robots = 0
  , _maxRobot = 3
  , _robot = new Array();
var _addedRobot, _nowRobot;
var _addedForm = "";
var _funcid = new Array();
var _funcbody = new Array();
var _runposition;
var _running = 0;
var _printid = 0;
var _worldchanged = 0;
var _functionList = new Array();
var _variableList = new Array();
var _keyctrl = 1;
var _codewidth;
var RNAME = ""
  , RX = RY = RD = 0;
var CX = CY = 0;
var _objcntshow = 1;
var _refresh = 0;
var _playbotmode = "";
var _fullscreen = 0;
var _fastmode = 0;
var _helpover = 1;
var _br = navigator.userAgent.toLowerCase();
var _printstack = ""
  , _rv = true;
var _psinfo = [], _psuser;
var _subindex = -1;
var _storyclick = 0;
$("#codeLoadBtn").bind("click", codeLoad);
$("#codeSaveBtn").bind("click", codeSave);
$("#worldLoadBtn").bind("click", worldLoad);
$("#worldSaveBtn").bind("click", worldSave);
$("#refreshAllBtn").bind("click", refreshAllPopup);
$("#refreshRobotBtn").bind("click", refreshRobot);
$("#executeBtn").bind("click", function() {
    if (_playbotmode == "problem") {
        change_speed_action(0);
    }
    executeRobot();
});
$("#executeBtn").bind("contextmenu", function() {
    change_speed_action(10);
    executeRobot();
});
$("#stopBtn").bind("click", stopRobot);
$("#editWallBtn").bind("click", editWall);
$("#mngWorldBtn").bind("click", mngWorldPopup);
$("#mngBagBtn").bind("click", mngBagPopup);
$("#mngRobotBtn").bind("click", mngRobotPopup);
$("#hideCodeBtn").bind("click", hideCodeArea);
$(".modebtn").bind("click", change_mode1);
$("#cb_more").bind("click", displayCodeBlock);
$("#cbbtn").bind("click", displayCodeBlock);
$("#worldstory").bind("click", displayWorldStory);
$("#worldstory").bind("contextmenu", whiteWorldStory);
$(".cb").bind("click", codeblock_use);
$("#joinBtn").bind("click", agreeForm);
$("#loginBtn").bind("click", loginForm);
$("#distributeBtn").bind("click", function() {
    document.location = "/student";
});
$("#regTeacherBtn").bind("click", regTeacherForm);
$("#managerBtn").bind("click", function() {
    document.location = "/manager";
});
$("#modInfoBtn").bind("click", modInfoForm);
$("#logoutBtn").bind("click", function() {
    document.location = "./logout.php";
});
$("#codearea").bind("contextmenu", cm_showMenu);
$("#cbmini").bind("contextmenu", function() {
    return false
});
$("#language").bind("click", change_language_session);
function change_language_session() {
    if (sessionStorage['language'] == "js") {
        sessionStorage['language'] = "py";
    } else {
        sessionStorage['language'] = "js";
    }
    change_language_btn();
}
function change_language_btn() {
    var code;
    code = editor.getValue();
    if (sessionStorage['language'] == "js") {
        $("#language").text("Javascript");
        $("#executeBtn").css("display", "");
        $("#executeBtn_py").css("display", "none");
        $(".jsblock").css("display", "");
        $(".pyblock").css("display", "none");
        code = code.replace(str_defaultcode2_py, str_defaultcode2);
        code = code.replace(str_defaultcode3_py, str_defaultcode3);
    } else {
        $("#language").text("Python");
        $("#executeBtn").css("display", "none");
        $("#executeBtn_py").css("display", "");
        $(".jsblock").css("display", "none");
        $(".pyblock").css("display", "");
        code = code.replace(str_defaultcode2, str_defaultcode2_py);
        code = code.replace(str_defaultcode3, str_defaultcode3_py);
    }
    editor.setValue(code);
    displayCodeBlock("reset");
}
var pyscript = "<script type='text/python3' id='tests_editor'>\n" + "from browser import document as doc, window\n" + "#from browser import html\n" + "#import header\n" + "import editor\n" + "doc['executeBtn_py'].bind('click',editor.run)\n" + "doc['executeBtn_py'].bind('contextmenu',editor.run2)\n" + "doc['pyrun'].bind('click',editor.pyrun)\n" + "</" + "script>\n";
document.write(pyscript);
document.write("<script src='./include/playbot_stable.js'></" + "script>");
document.write("<script src='./include/playbot_devel.js'></" + "script>");
document.write("<script src='./include/playbot_printbtn.js'></" + "script>");
$(document).ready(function() {
    setTimeout(fadeout_logo, 500);
    initSessionStorage();
    refreshF5();
    initWindowSize();
    initResize();
    initBtn();
    initHelpBot();
    init_psmode();
    $("#version").html(_version);
    if (!sessionStorage['viewnotice']) {
        sessionStorage.setItem("viewnotice", "");
    }
    if ((_notice) && (!sessionStorage['viewnotice'])) {
        interfacebg_on(_notice + "<br><br>버전 : " + _version, 500);
        sessionStorage.setItem("viewnotice", "yes");
    }
    if (is_teacher_playbot()) {
        _defaultDelayTime = 50;
    }
    if (is_open_playbot()) {
        $("#codearea").css("display", "none");
        $("#worldarea_pc").css("margin-left", "auto");
        $("#worldarea_pc").addClass("greybox");
        $("#user").text(_wowner);
        var all_width = get_px("board", "w") + 65;
        $("#worldarea_pc").css("width", all_width);
        $("#open_loginInfo").css("width", all_width);
        $("#open_codeBtnGroup").css("width", all_width - 30);
        $("#open_worldInfo").css("width", all_width);
    }
    if ((!is_open_playbot()) && (sessionStorage['from_distribute'])) {
        sessionStorage.removeItem("from_distribute");
        refreshAll();
    }
    editor.focus();
    updateModeString();
    jscolor();
    change_world_mode();
    change_language_btn();
});
var _pjs;
var turtle;
var _turtlestop = 0;
function change_world_mode() {
    if (sessionStorage['wmode']) {
        change_mode2(sessionStorage['wmode']);
    } else {
        change_mode2(sessionStorage['cmode']);
    }
}
function change_mode1() {
    if ($("#cblist").css("display") != "none") {
        displayCodeBlock();
    }
    change_mode2($(this).attr("id"));
}
function change_mode2(temp) {
    refreshRobot();
    switch (temp) {
    case ("mode2"):
    case ("pjs"):
        _playbotmode = "pjs";
        pjs_turtle_show();
        pjs_turtle_reset();
        break;
    case ("mode3"):
    case ("turtle"):
        _playbotmode = "turtle";
        pjs_turtle_show();
        pjs_turtle_reset();
        break;
    case ("mode4"):
    case ("problem"):
        _playbotmode = "problem";
        pjs_turtle_show();
        break;
    case ("mode1"):
    default:
        _playbotmode = "";
        pjs_turtle_show();
    }
    change_mode3();
    refreshRobot();
}
function pjs_turtle_show() {
    if (_playbotmode == "pjs") {
        $("#worldcontainer").hide();
        $("#beeperString2").show();
        $("#turtle").hide();
        $("#pjs").show();
        $("#jscolor").show();
        $("#beeperString2").html(str_mousecoord);
        $("#problem_print").hide();
    } else if (_playbotmode == "turtle") {
        $("#worldcontainer").hide();
        $("#beeperString2").hide();
        $("#turtle").show();
        $("#pjs").hide();
        $("#jscolor").hide();
        $("#problem_print").hide();
    } else if (_playbotmode == "problem") {
        $("#worldcontainer").hide();
        $("#beeperString2").hide();
        $("#turtle").hide();
        $("#pjs").hide();
        $("#jscolor").hide();
        $("#problem_print").show();
        displayWorldStory("reset");
    } else {
        $("#worldcontainer").show();
        $("#beeperString2").show();
        $("#turtle").hide();
        $("#pjs").hide();
        $("#jscolor").hide();
        $("#problem_print").hide();
    }
    pjs_stop();
    turtle_stop(1);
    updateModeString();
    initWindowSize();
}
function pjs_turtle_reset() {
    var w, h;
    w = (_cols * 35) + ((_cols - 1) * 5) + 10 + 45;
    h = (_rows * 35) + ((_rows - 1) * 5) + 10 + 45;
    $("#" + _playbotmode).attr("width", w).attr("height", h);
    turtle_stop(0);
    if (_playbotmode == "turtle") {
        turtle = new Turtle(document.getElementById('turtle'));
        turtle.position = new Position(w / 2,h / 2);
        turtle.nextPosition = turtle.position.copy();
    }
}
function pjs_stop() {
    if (_pjs) {
        _pjs.exit();
    }
}
function turtle_stop(stop) {
    _turtlestop = stop;
}
function updateModeString() {
    $(".modebtn").css("background-color", "grey");
    switch (_playbotmode) {
    case ("pjs"):
        $("#mode2").css("background-color", "skyblue");
        break;
    case ("turtle"):
        $("#mode3").css("background-color", "skyblue");
        break;
    case ("problem"):
        $("#mode4").css("background-color", "skyblue");
        break;
    default:
        $("#mode1").css("background-color", "skyblue");
        break;
    }
}
