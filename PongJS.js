// 0-based (map) indexing

const block_colors = ["#000000"]

change_speed(-1);

// FROM HERE
set_color(10, 9, block_colors[0]); // y, x
set_color(11, 9, block_colors[0]); // y, x
set_color(12, 9, block_colors[0]); // y, x
set_color(13, 9, block_colors[0]); // y, x
// TO HERE
// 테스트용 벽 만들기 코드


// FROM HERE
/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}
// TO HERE
// https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js-L101 Line 108



// FROM HERE
// (c) 2021 Penta0308

function domove(c, v) {
	var s = round((1 - v) * 5);
	change_speed(0);
	for(i = 0; i < s; i++)
		for(q = 0; q < 4; q++)
			turn_left(); // 시간 지연용 제자리 돌기
	change_speed(-1);
	var color = hsvToRgb((((c * 3) % 360) / 360.0), 0.7 - (1.0 - v) * 0.7, 0.9 + (1.0 - v) * 0.1);
	var r = (round(color[0])).toString(16);
	var g = (round(color[1])).toString(16);
	var b = (round(color[2])).toString(16);
	if(r.length != 2) r = "0".repeat(2 - r.length) + r;
	if(g.length != 2) g = "0".repeat(2 - g.length) + g;
	if(b.length != 2) b = "0".repeat(2 - b.length) + b;
	if(!block_colors.includes(get_color())) set_color("#" + r + g + b);
	//print("Vel  " + s + " v " + v);
	move();
	clear_move();
}

function set_direction(d) {
	if(d == 'l')      repeat("turn_left()", (6 - get_direction()) % 4);
	else if(d == 'r') repeat("turn_left()", (4 - get_direction()) % 4);
	else if(d == 'u') repeat("turn_left()", (5 - get_direction()) % 4);
	else if(d == 'd') repeat("turn_left()", (7 - get_direction()) % 4);
}

function crashwall(ball, crashdir) { // 벽 충돌 Event Function
	print("CrsW " + ball["p"] + " " + crashdir);
	if([1, 4, 7].includes(crashdir)) { // 우측 승
		return 1;
	} else if([3, 6, 9].includes(crashdir)) { // 좌측 승
		return 2;
	} else return 0;
}
function crashblock(ball, crashdir) { // 블럭 충돌 Event Function
	print("CrsB " + ball["p"] + " " + crashdir);
	return 0;
}

class racket {
	incr() {
	}
	decr() {
	}
}

rk1 = new racket();
rk2 = new racket();

function roll(crashwall, crashblock) {
	const contdrag = -0.005;
	var ball = {"p": [0.0, 0.0], "v": [0.0, 0.0]};
	var initangle = Math.random() * 2 * Math.PI;
	var initv = 1.0;
	ball["p"][0] = parseFloat(get_x());
	ball["p"][1] = parseFloat(get_y());
	ball["v"][0] = initv * Math.cos(initangle);
	ball["v"][1] = initv * Math.sin(initangle);
	print("Init " + ball["v"]);
	var c = 0;
	while(true) {
		var tx = ball["p"][0] + ball["v"][0];
		var ty = ball["p"][1] + ball["v"][1];
		var vt = Math.sqrt(ball["v"][0]*ball["v"][0] + ball["v"][1]*ball["v"][1]);
		var crashdir = 5;
		if(tx > get_max_x()) {
			tx = 2.0 * get_max_x() - tx;
			ball["v"][0] *= -1;
			crashdir += +1;
		} else if(tx < 0.0) {
			tx = -tx;
			ball["v"][0] *= -1;
			crashdir += -1;
		}
		if(ty > get_max_y()) {
			ty = 2.0 * get_max_y() - ty;
			ball["v"][1] *= -1;
			crashdir += -3;
		} else if(ty < 0.0) {
			ty = -ty;
			ball["v"][1] *= -1;
			crashdir += +3;
		}
		if(crashdir != 5) {
			if(crashwall(ball, crashdir) != 0) break;
		}
		
		if(block_colors.includes(get_color(round(ty), round(tx)))) { // get_color 함수 인자의 X와 Y가 바뀌어 있더이다
			var crashdir = 5
			if(ball["v"][0] < 0.0 && block_colors.includes(get_color(get_y(), get_x() - 1))) {
				tx = 2.0 * get_x() - tx;
				ball["v"][0] *= -1;
				crashdir += -1;
			} else if(ball["v"][0] > 0.0 && block_colors.includes(get_color(get_y(), get_x() + 1))) {
				tx = 2.0 * get_x() - tx;
				ball["v"][0] *= -1;
				crashdir += +1;
			}
			if(ball["v"][1] < 0.0 && block_colors.includes(get_color(get_y() - 1, get_x()))) {
				ty = 2.0 * get_y() - ty;
				ball["v"][1] *= -1;
				crashdir += +3;
			} else if(ball["v"][1] > 0.0 && block_colors.includes(get_color(get_y() + 1, get_x()))) {
				ty = 2.0 * get_y() - ty;
				ball["v"][1] *= -1;
				crashdir += -3;
			}
			if(crashdir == 5) {
				if(round(tx) > get_x()) {
					if(round(ty) > get_y()) crashdir = 3;
					else if(round(ty) < get_y()) crashdir = 9;
				} else if(round(tx) < get_x()) {
					if(round(ty) > get_y()) crashdir = 1;
					else if(round(ty) < get_y()) crashdir = 7;
				}
			}
			if(crashblock(ball, crashdir) != 0) break;
		}
		
		ball["p"][0] = tx;
		ball["p"][1] = ty;
		
		tx = round(tx);
		ty = round(ty);
		if(tx > get_x()) {
			set_direction('r');
			domove(c, vt);
		} else if(tx < get_x()) {
			set_direction('l');
			domove(c, vt);
		}
		if(ty > get_y()) {
			set_direction('d');
			domove(c, vt);
		} else if(ty < get_y()) {
			set_direction('u');
			domove(c, vt);
		}
		
		if(vt <= 0.0) {
			print("Stop " + ball["p"]);
			break;
		}
		
		ball["v"][0] *= Math.max((vt + contdrag) / vt, 0.0);
		ball["v"][1] *= Math.max((vt + contdrag) / vt, 0.0); // 속도에 상관없이 일정한 감속을 부여: 수정 필요함
		
		c += 1;
	}
}

press_key("space", "roll(crashwall, crashblock)")
press_key("w", "rk1.incr()")
press_key("s", "rk1.decr()")
press_key("i", "rk2.incr()")
press_key("j", "rk2.decr()")

print("PRESS space TO CONTINUE")
