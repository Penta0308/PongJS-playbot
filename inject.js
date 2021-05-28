// Add </script><script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/inject.js"></script><script> at Top

_limitcount = "_";

function sleep(milliseconds) {
  var start = new Date().getTime();
  while(new Date().getTime() - start < milliseconds) {}
  
} // https://www.phpied.com/sleep-in-javascript/

/*save_cmd = function(str1, str2, str3) {
    if (str2 == "print") {
        str3 = replace(str3, ">", ">");
        str3 = replace(str3, "<", "<");
    }
    _cmd[_cmds][0] = str1;
    _cmd[_cmds][1] = str2;
    _cmd[_cmds][2] = String(str3);
    ++_cmds;
    //_cmds = 1;
    //_cmdindex = 0;
    //runRobot_branch();
    //_cmds = 0;
    //_cmdindex = 0;
    //sleep(_delayTime);
}*/

save_cmd = function(str1, str2, str3) {
    if (str2 == "print") {
        str3 = replace(str3, ">", ">");
        str3 = replace(str3, "<", "<");
    }
    ++_cmds;
    _cmd.splice(_cmdindex, 0, [str1, str2, String(str3)]);
}

clearAllCmd = function() {
    console.log(_cmds);
    console.log(_cmdindex);
    _cmds = 0;
    _cmdindex = 0;
    for (var i = 0; i <= _maxCmds - 1; i++) {
        _cmd[i] = new Array();
        _cmd[i][0] = "";
        _cmd[i][1] = "";
        _cmd[i][2] = "";
    }
}
//clearAllCmd = function() {}

runRobot = function() {
    //if (_limitcnt == 5000) {
    //    print_action("주의 : 무한반복에 빠지는 코드입니다");
    //    _limitcnt = 0;
    //}
    if (!_fastmode) {
        if (_cmdindex == _cmds) {
            if (_cmds == 0) {
                stopRobot("endcmd");
            } else if (_nowRobot.state) {
                stopRobot("endcmd");
            }
        } else {
            while ((_cmdindex != _cmds) && (eval(_cmd[_cmdindex][0]).state == 0)) {
                _cmdindex++;
            }
            runRobot_branch();
            if ((_cmd[_cmdindex][1] == "show_message") || (_cmd[_cmdindex][1] == "say") || (_cmd[_cmdindex][1] == "show_chart")) {
                _cmdindex++;
            } else if ((_cmd[_cmdindex][1] == "change_speed") && (_cmd[_cmdindex][2] == -1)) {
                _cmdindex++;
                _delayID = setTimeout(runRobot, 0);
            } else {
                _cmdindex++;
                _delayID = setTimeout(runRobot, _delayTime);
            }
        }
    } else {
        while (_cmdindex <= _cmds - 1) {
            runRobot_branch();
            if ((_cmd[_cmdindex][1] == "show_message") || (_cmd[_cmdindex][1] == "say") || (_cmd[_cmdindex][1] == "show_chart")) {
                _cmdindex++;
                break;
            } else if ((_cmd[_cmdindex][1] == "change_speed") && (_cmd[_cmdindex][2] > -1)) {
                break;
            } else {
                _cmdindex++;
            }
        }
        if ((_cmd[_cmdindex][1] == "change_speed") && (_cmd[_cmdindex][2] > -1)) {
            _cmdindex++;
            runRobot();
        }
        if (_cmdindex == _cmds) {
            stopRobot("endcmd");
        }
    }
}
//runRobot = function() {}

executeCode = function(code, from) {
    var i, j;
    _bracket = bracket_string(code);
    //code = "_limitcnt = 0;" + code;
    //code = code.replace(/document.write/gi, "print");
    //code = code.replace(/alert/gi, "popup");
    //code = code.replace(/while\(/gi, "while ((++_limitcnt < 5000) && ");
    //code = code.replace(/while \(/gi, "while ((++_limitcnt < 5000) && ");
    var splitCode = code.split("\n");
    var splitName, tmpPosition;
    var fname = "", fixname;
    for (i = 0; i <= splitCode.length - 1; i++) {
        if (i == 0) {
            splitCode[i] = splitCode[i].replace(/_limitcnt = 0;/gi, "");
        }
        if (!(splitCode[i].trim().indexOf("function"))) {
            splitName = splitCode[i].trim().split(" ");
            tmpPosition = splitName[1].trim().indexOf("(");
            if (tmpPosition > 0) {
                fname = splitName[1].trim().substr(0, tmpPosition);
            } else {
                fname = splitName[1].trim();
            }
            if (_functionRegExp.test(fname)) {
                error(str_executeCode3.replace("temp", fname));
                fname = fname.replace(_functionRegExp, "");
                return false;
            }
            _functionList.push(fname);
            fixname = _functionFix.split("|");
            for (j = 0; j <= fixname.length - 2; j++) {
                if (fname == fixname[j]) {
                    error(str_executeCode1.replace("temp", fixname[j]));
                    return false;
                }
            }
        }
        var v1, v2, v3;
        v1 = splitCode[i].trim().indexOf("=");
        if (v1 > -1) {
            v2 = splitCode[i].trim().substr(v1 + 1, 1);
            if (v2 != "=") {
                v3 = splitCode[i].trim().substr(0, v1).trim();
                _variableList.push(v3);
            }
        }
    }
    try {
        $("#executearea").html("<script>" + code + "</" + "script>");
    } catch (e) {
        execute_catch(e);
        return false;
    } finally {
        if (from == "main") {
            refreshRobot_semi();
        }
    }
}

executeRobot = function() {
    displayCodeBlock("reset");
    var code;
    code = editor.getValue();
    code = code.replace(str_defaultcode2, "");
    code = code.replace(str_defaultcode3, "");
    code = code.trim();
    if (!code) {
        error(str_executeRobot);
    } else {
        if (code.indexOf("function setup()") >= 0 && code.indexOf("function draw()") >= 0 && _playbotmode != "pjs") {
            change_mode2("mode2");
        }
        if (_playbotmode == "turtle" || _playbotmode == "pjs") {
            if (!_running) {
                refreshRobot();
                running_on();
                if (_playbotmode == "pjs") {
                    code += pjs_added;
                }
                try {
                    $("#executearea").html("<script>" + code + "</" + "script>");
                } catch (e) {
                    execute_catch(e);
                    return false;
                }
            }
            _refresh = 0;
        } else {
            if (!_running) {
                if (!_refresh) {
                    refreshRobot();
                }
                clearAllCmd();
                running_on();
                close_editWall();
                _wall = 0;
                changeWall();
                displayWall();
                displayBeeper();
                displayObject();
                keypress_on();
                _runposition = "main";
                if (_achecks != "oj") {
                    executeCode(code, _runposition);
                    _delayID = setTimeout(runRobot, _delayTime);
                } else {
                    var instr, anstr, ti, tcode;
                    _adata = _adata.replace(/\r\n/gi, "");
                    instr = _adata.split("|");
                    _atexts = _atexts.replace(/\r\n/gi, "");
                    anstr = _atexts.split("|");
                    _rv = true;
                    _rtext = "";
                    for (ti = 0; ti <= instr.length - 2; ti++) {
                        _printstack = "";
                        print("입력 : " + instr[ti] + "<br>");
                        print("출력 : <br>");
                        tcode = instr[ti] + "\n" + code;
                        executeCode(tcode, _runposition);
                        clearUserFuncVar();
                        if (rightstr(_printstack, 4) != "<br>") {
                            print("<br>");
                        }
                        _printstack = psmode_rtrim_rbr(_printstack);
                        _rtext += _printstack + "|\r\n";
                        if (_printstack == anstr[ti]) {
                            print("결과 : 정답입니다.<br><br>");
                        } else {
                            print("결과 : 정답이 아닙니다.<br><br>");
                            _rv = false;
                        }
                        _printstack = "";
                    }
                    if (_running) {
                        _delayID = setTimeout(runRobot, _delayTime);
                    }
                }
            }
            delete i;
            _refresh = 0;
        }
    }
}

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
                console.log("KEYD " + event.keyCode);
                //clearAllCmd();
                backupBeforeState();
                _runposition = "form";
                if (_nowRobot.state) eval(_keyfunc[i]);
                else executeCode(_keyfunc[i], _runposition);
                restoreBeforeState();
                clearTimeout(_delayID);
                _delayID = setTimeout(runRobot, 0);
                //setTimeout(runRobot, 0);
                //clear_move();
                break;
            }
        }
    }
};

console.log("INJC");
