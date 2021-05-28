</script><script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/inject.js"></script><script>

// 0-based (map) indexing

const block_colors = ["#010101", "#020202"]
change_speed(-1);

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

function domove(x, y, c, v) {
	var s = round((1 - v) * 5);
	change_speed(49);
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
	if(!block_colors.includes(get_color(get_y(), get_x()))) set_color(get_y(), get_x(), "#" + r + g + b);
	//print("Vel  " + s + " v " + v);
	space_jump(y, x);
	//clear_move(); // 리소스 엄청 먹더라
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
	} else return -1;
}
function crashblock(ball, crashdir) { // 블럭 충돌 Event Function
	print("CrsB " + ball["p"] + " " + crashdir);
	return -1;
}

class racket {
	constructor(x, color) {
		this.x = x;
		this.y = round(get_max_y() / 2.0);
		this.l = 6; // 길이: 1 + 2 * l
		this.color = color;
		this.cmap = new Array(get_max_y() + 1);
		this.cmap.fill("#FFFFFF");
		this.moving = false; // 뮤텍스
	}
	incr() {
		if(this.moving) return;
		this.moving = true;
		if(this.y + this.l != get_max_y()) {
			this.y += 1;
			this.cmap[this.y + this.l] = get_color(this.y + this.l, this.x);
			set_color(this.y + this.l, this.x, this.color);
			set_color(this.y - this.l, this.x, this.cmap[this.y - this.l]);
		}
		this.moving = false;
		//setTimeout(callback);
		print("RkIc " + this.y);
	}
	decr() {
		if(this.moving) return;
		this.moving = true;
		if(this.y - this.l != 0) {
			this.y -= 1;
			this.cmap[this.y - this.l] = get_color(this.y - this.l, this.x);
			set_color(this.y - this.l, this.x, this.color);
			set_color(this.y + this.l, this.x, this.cmap[this.y + this.l]);
		}
		this.moving = false;
		//setTimeout(callback);
		print("RkDc " + this.y);
	}
}

rk1 = new racket(1, block_colors[0]);
rk2 = new racket(get_max_x() - 1, block_colors[1]);

class pong {
	constructor(crashwall, crashblock) {
		this.ball = {"p": [0.0, 0.0], "v": [0.0, 0.0]};
		this.crashwall = crashwall;
		this.crashblock = crashblock;
		//this.contdrag = -0.005;
		this.contdrag = 0.0;
		this.init();
		this.loopid = null;
		this.brk = false;
	}
	init() {
		var initangle = Math.random() * 2 * Math.PI;
		var initv = 1.0;
		this.ball["p"][0] = get_max_x() / 2.0;
		this.ball["p"][1] = get_max_y() / 2.0;
		this.ball["v"][0] = initv * Math.cos(initangle);
		this.ball["v"][1] = initv * Math.sin(initangle);
		space_jump(round(this.ball["p"][1]), round(this.ball["p"][0]))
		print("Init " + this.ball["v"]);
		this.c = 0;
	}
	roll() {
		if(this.c != 0 && this.loopid == null) this.init();
		var setInterval = window.setInterval;
		this.loopid = setInterval(pong2["pong1"].step, 100);
	}
	step() {
		var me = pong2["pong1"];
		me.c += 1;
		var tx = me.ball["p"][0] + me.ball["v"][0];
		var ty = me.ball["p"][1] + me.ball["v"][1];
		var vt = Math.sqrt(me.ball["v"][0]*me.ball["v"][0] + me.ball["v"][1]*me.ball["v"][1]);
		var crashdir = 5;
		if(tx > get_max_x()) {
			tx = 2.0 * get_max_x() - tx;
			me.ball["v"][0] *= -1;
			crashdir += +1;
		} else if(tx < 0.0) {
			tx = -tx;
			me.ball["v"][0] *= -1;
			crashdir += -1;
		}
		if(ty > get_max_y()) {
			ty = 2.0 * get_max_y() - ty;
			me.ball["v"][1] *= -1;
			crashdir += -3;
		} else if(ty < 0.0) {
			ty = -ty;
			me.ball["v"][1] *= -1;
			crashdir += +3;
		}
		if(crashdir != 5) {
			if(me.crashwall(me.ball, crashdir) > 0) {
				clearInterval(me.loopid);
				me.loopid = null;
				return 3;
			}
		}

		if(block_colors.includes(get_color(round(ty), round(tx)))) { // get_color 함수 인자의 X와 Y가 바뀌어 있더이다
			var crashdir = 5
			if(me.ball["v"][0] < 0.0 && block_colors.includes(get_color(get_y(), get_x() - 1))) {
				tx = 2.0 * get_x() - tx;
				me.ball["v"][0] *= -1;
				crashdir += -1;
			} else if(me.ball["v"][0] > 0.0 && block_colors.includes(get_color(get_y(), get_x() + 1))) {
				tx = 2.0 * get_x() - tx;
				me.ball["v"][0] *= -1;
				crashdir += +1;
			}
			if(me.ball["v"][1] < 0.0 && block_colors.includes(get_color(get_y() - 1, get_x()))) {
				ty = 2.0 * get_y() - ty;
				me.ball["v"][1] *= -1;
				crashdir += +3;
			} else if(me.ball["v"][1] > 0.0 && block_colors.includes(get_color(get_y() + 1, get_x()))) {
				ty = 2.0 * get_y() - ty;
				me.ball["v"][1] *= -1;
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
			if(me.crashblock(me.ball, crashdir) > 0) {
				clearInterval(me.loopid);
				me.loopid = null;
				return 2;
			}
		}

		me.ball["p"][0] = tx;
		me.ball["p"][1] = ty;

		domove(round(tx), round(ty), me.c, vt);

		if(vt <= 0.0) {
			print("Stop " + me.ball["p"]);
			clearInterval(me.loopid);
			me.loopid = null;
			return 1;
		}

		me.ball["v"][0] *= Math.max((vt + me.contdrag) / vt, 0.0);
		me.ball["v"][1] *= Math.max((vt + me.contdrag) / vt, 0.0); // 속도에 상관없이 일정한 감속을 부여: 수정 필요함
		return -1;
	}
}

var pong1 = new pong(crashwall, crashblock);
var pong2 = {"pong1": pong1};

press_key("space", "pong2[\"pong1\"].roll()");
press_key("w", "rk1.incr()");
press_key("s", "rk1.decr()");
press_key("i", "rk2.incr()");
press_key("k", "rk2.decr()");
pong2["pong1"].roll();
//print("PRESS SPACE TO CONTINUE");
