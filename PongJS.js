</script>
<script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/firebase_inject.js"></script>
<script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/inject.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js"></script>
<script>

// 0-based 좌표계

var block_colors = ["#010101", "#020202"];
change_speed(-1);

var layers = 2;
var layer_ball = 0;
var layer_racket = 1;
var ballspeed = 80;
var racketl = 3;
var learningRate = 0.001;

class ai {
	constructor() {
		print("Starting Ai...");
		this.model = tf.sequential();
		this.model.add(tf.layers.dense({units: 128, inputShape: [6]})); //input is a 1x8
		this.model.add(tf.layers.dense({units: 256, inputShape: [128]}));
		this.model.add(tf.layers.dense({units: 256, inputShape: [256]}));
		this.model.add(tf.layers.dense({units: 3, inputShape: [256]})); //returns a 1x3
		this.optimizer = tf.train.adam(learningRate);
		this.model.compile({loss: 'meanSquaredError', optimizer: this.optimizer});
		this.previous_data = null;
		this.training_data = [[], []];
		this.last_data_object = null;
		this.reset();
	}
	save_win() {
		this.training_data[1][this.training_data[1].length - 1] = +1.0;
		this.train();
		this.reset();
	}
	save_lose() {
		this.training_data[1][this.training_data[1].length - 1] = -1.0;
		this.train();
		this.reset();
	}
	save_data(computerx, ballx, bally) {
		var data_xs = [computerx, ballx, bally];
		if(this.previous_data == null) this.last_data_object = [...data_xs];
		else this.last_data_object = [...this.previous_data, ...data_xs];
		this.training_data[0].push(this.last_data_object);
		this.training_data[1].push(0.0);
		this.previous_data = data_xs;
	}
	reset() {
		this.previous_data = null;
		this.training_data = [[], []];
	}
	train() {
		if(!this.training_data.length){
			console.log("Nothing to Train");
			return;
		}
		var data_xs = this.training_data[0];
		var data_ys = this.training_data[1];
		
		const xs = tf.tensor(data_xs);
		const ys = tf.tensor(data_ys);

		(async function() {
			console.log('Training');
			let result = await model.fit(xs, ys);
			console.log(result);
		} ());
		console.log('Trained');
	}
	predict_move() {
		console.log('Predicting');
		if(this.last_data_object != null) {
			//use this.last_data_object for input data
			//do prediction here
			//return -1/0/1
			prediction = model.predict(tf.tensor([this.last_data_object]));
			return tf.argMax(prediction, 1).dataSync() - 1;
		}
	}
}

class layermap {
	constructor(n) {
		print("Starting LMap...");
		this.layers = [];
		this.n = n;
		for(var i = 0; i < this.n; i++) {
			var plane = [];
			for(var y = 0; y <= get_max_y(); y++) {
				var xl = [];
				for(var x = 0; x <= get_max_x(); x++) {
					var px = {'r': 1.0, 'g': 1.0, 'b': 1.0, 'a': 0.0}; // 투명 백색 RGBA
					xl.push(px);
				}
				plane.push(xl);
			}
			this.layers.push(plane);
		}
	}
	recalc(x, y) {
		var r = 1.0, g = 1.0, b = 1.0; // 배경 백색
		for(var i = 0; i < this.n; i++) {
			var a = this.layers[i][x][y]["a"];
			r = this.layers[i][x][y]["r"] * a + r * (1 - a);
			g = this.layers[i][x][y]["g"] * a + g * (1 - a);
			b = this.layers[i][x][y]["b"] * a + b * (1 - a);
		}
		var rs = (round(r * 255)).toString(16);
		var gs = (round(g * 255)).toString(16);
		var bs = (round(b * 255)).toString(16);
		if(rs.length != 2) rs = "0".repeat(2 - rs.length) + rs;
		if(gs.length != 2) gs = "0".repeat(2 - gs.length) + gs;
		if(bs.length != 2) bs = "0".repeat(2 - bs.length) + bs;
		set_color(x, y, "#" + rs + gs + bs);
	}
	setcolor(l, x, y, _r, _g, _b, _a) {
		var px = this.layers[l][x][y];
		px["r"] = _r;
		px["g"] = _g;
		px["b"] = _b;
		px["a"] = _a;
		this.recalc(x, y);
	}
}

var lmap = new layermap(layers);

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

  return [r, g, b];
}
// TO HERE
// https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js-L101 Line 108


// FROM HERE
// (c) 2021 Penta0308

var ai1 = new ai();

function domove(x, y, c, v) {
	space_jump(y, x);
	var s = round((1 - v) * 5);
	//change_speed(49);
	/*for(i = 0; i < s; i++)
		for(q = 0; q < 4; q++)
			turn_left(); // 시간 지연용 제자리 돌기
			*/
	//change_speed(-1);
	var color = hsvToRgb((((c * 3) % 360) / 360.0), 0.7 - (1.0 - v) * 0.7, 0.9 + (1.0 - v) * 0.1);
	if(!block_colors.includes(get_color(get_y(), get_x()))) lmap.setcolor(layer_ball, get_y(), get_x(), color[0], color[1], color[2], 1.0);
	//print("Vel  " + s + " v " + v);
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
		ai1.save_lose();
	} else if([3, 6, 9].includes(crashdir)) { // 좌측 승
		return 2;
		ai1.save_win();
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
		this.l = racketl; // 길이: 1 + 2 * l
		this.color = [parseInt(color.substring(1, 3), 10) / 255.0, parseInt(color.substring(3, 5), 10) / 255.0, parseInt(color.substring(5, 7), 10) / 255.0];
		for(var y = this.y - this.l; y <= this.y + this.l; y++) lmap.setcolor(layer_racket, y, this.x, this.color[0], this.color[1], this.color[2], 1.0);
	}
	incr() {
		if(this.y + this.l <= get_max_y() - 1) {
			lmap.setcolor(layer_racket, this.y - this.l, this.x, 0.0, 0.0, 0.0, 0.0); // Clear
			this.y += 1;
			lmap.setcolor(layer_racket, this.y + this.l, this.x, this.color[0], this.color[1], this.color[2], 1.0);
		}
		//setTimeout(callback);
		print("RkIc " + this.y);
	}
	decr() {
		if(this.y - this.l >= 1) {
			lmap.setcolor(layer_racket, this.y + this.l, this.x, 0.0, 0.0, 0.0, 0.0);
			this.y -= 1;
			lmap.setcolor(layer_racket, this.y - this.l, this.x, this.color[0], this.color[1], this.color[2], 1.0);
		}
		//setTimeout(callback);
		print("RkDc " + this.y);
	}
}

var rk1 = new racket(1, block_colors[0]);
var rk2 = new racket(get_max_x() - 1, block_colors[1]);

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
		var initangle = (Math.random() * 1 / 4 + 1 / 8 + 1 / 2 * round(Math.random())) * 2 * Math.PI;
		var initv = 1.0;
		this.ball["p"][0] = get_max_x() / 2.0;
		this.ball["p"][1] = get_max_y() / 2.0;
		this.ball["v"][0] = initv * Math.sin(initangle);
		this.ball["v"][1] = initv * Math.cos(initangle);
		space_jump(round(this.ball["p"][1]), round(this.ball["p"][0]))
		print("Init " + this.ball["v"]);
		this.c = 0;
	}
	roll() {
		if(this.loopid != null) clearInterval(this.loopid);
		if(this.c != 0 && this.loopid == null) this.init();
		var setInterval = window.setInterval;
		this.loopid = setInterval(pong2["pong1"].step, ballspeed);
	}
	step() {
		var me = pong2["pong1"];
		me.c += 1;
		var tx = me.ball["p"][0] + me.ball["v"][0];
		var ty = me.ball["p"][1] + me.ball["v"][1];
		var vt = Math.sqrt(me.ball["v"][0]*me.ball["v"][0] + me.ball["v"][1]*me.ball["v"][1]);
		var crashdir = 5;
		ai1.save_data(rk1.x, me.ball["p"][0], me.ball["p"][1]);
		if(round(tx) > get_max_x()) {
			tx = 2.0 * get_max_x() - tx;
			me.ball["v"][0] *= -1;
			crashdir += +1;
		} else if(round(tx) < 0.0) {
			tx = -tx;
			me.ball["v"][0] *= -1;
			crashdir += -1;
		}
		if(round(ty) > get_max_y()) {
			ty = 2.0 * get_max_y() - ty;
			me.ball["v"][1] *= -1;
			crashdir += -3;
		} else if(round(ty) < 0.0) {
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

press_key("b", "pong2[\"pong1\"].roll()");
press_key("s", "rk1.incr()");
press_key("w", "rk1.decr()");
press_key("k", "rk2.incr()");
press_key("i", "rk2.decr()");
button("pongjs-button-predict", "Predict", "print('AIPr ' + ai1.predict())");
//pong2["pong1"].roll();
print("PRESS [b] TO CONTINUE");
