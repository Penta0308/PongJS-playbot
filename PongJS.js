</script>
<script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/firebase_inject.js"></script>
<script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/inject.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js"></script>
<script>

// 0-based 좌표계

const block_colors = ["#000000", "#202020", "#101010"];
//change_speed(-1);

const layers = 2;
const layer_ball = 0;
const layer_racket = 1;
const racketl = 4;
//const learningRate = 0.001;

/*class ai {
	constructor() {
		print("Starting Ai...");
		this.model = tf.sequential();
		this.model.add(tf.layers.dense({units: 5, inputShape: [4], activation: 'elu'}));
		this.model.add(tf.layers.dense({units: 5, activation: 'elu'}));
		//this.model.add(tf.layers.dense({units: 5, activation: 'elu'}));
		this.model.add(tf.layers.dense({units: 3, activation: 'elu'}));
		this.optimizer = tf.train.adam(learningRate);
		this.model.compile({loss: 'meanSquaredError', optimizer: this.optimizer});
		this.previous_data = null;
		this.training_data = [[], []];
		this.last_data_object = null;
		this.reset();
	}
	save_win() {
		//this.training_data[1][this.training_data[1].length - 1] = [1.0, 0.0, 0.0];
		this.train();
	}
	save_lose() {
		//this.training_data[1][this.training_data[1].length - 1] = [-1.0];
		this.train();
	}
	save_data(humany, ballx, bally) {
		//var data_xs = [get_max_x() - ballx, bally];
		var data_xs = [ballx, bally];
		if(this.previous_data == null) {
			this.last_data_object = [data_xs];
			this.previous_data = data_xs;
			return;
		}
		this.last_data_object = [...this.previous_data, ...data_xs];
		this.training_data[0].push(this.last_data_object);
		//if(this.previous_data[1] > humany) this.training_data[1].push([0.0, 0.0, 1.0]);
		//else if(this.previous_data[1] < humany) this.training_data[1].push([1.0, 0.0, 0.0]);
		//else this.training_data[1].push([0.0, 1.0, 0.0]);
		var ta = new Array(get_max_y());
		ta.fill(0.0);
		ta[round([humany])] = 1.0;
		this.training_data[1].push(ta);
		this.previous_data = data_xs;
	}
	reset() {
		this.previous_data = null;
		this.training_data = [[], []];
	}
	train() {
		if(!this.training_data.length){
			//console.log("Nothing to Train");
			return;
		}
		
		const xs = tf.tensor(this.training_data[0]);
		const ys = tf.tensor(this.training_data[1]);

		const aitr = async function(me) {
			let result = await me.model.fit(xs, ys);
			print("AiTr");
			me.reset();
		};
		aitr(this);
	}
	pred() {
		//console.log("Predicting");
		if(this.last_data_object != null && this.last_data_object.length === 4) {
			var t = new Array(4);
			t[0] = get_max_x() - this.last_data_object[0];
			t[2] = get_max_x() - this.last_data_object[2];
			t[1] = this.last_data_object[1];
			t[3] = this.last_data_object[3];
			var pred = this.model.predict(tf.tensor([t]));
			return tf.argMax(pred, 1).dataSync();
		}
	}
}*/

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

let lmap = new layermap(layers);

// FROM HERE
/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @return  Array           The RGB representation
 * @param h
 * @param s
 * @param v
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return [r, g, b];
}
// TO HERE
// https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js-L101 Line 108


// FROM HERE
// (c) 2021 Penta0308

//if (typeof ai1 !== typeof undefined) print("Using Ai...");
//else var ai1 = new ai();

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
		addleaderboard(pong1.t);
		ai1.save_lose();
		return 1;
	} else if([3, 6, 9].includes(crashdir)) { // 좌측 승
		addleaderboard(pong1.t);
		ai1.save_win();
		return 2;
	} else return -1;
}
function crashblock(ball, crashdir) { // 블럭 충돌 Event Function
	print("CrsB " + ball["p"] + " " + crashdir);
	var limy = Math.sqrt(1 - pong1.ball["v"][0]*pong1.ball["v"][0]);
	if([1, 4, 7].includes(crashdir)) { // 좌측 라켓에 충돌
		console.log("Rk1V " + rk1.vy);
		pong1.ball["v"][1] += + rk1.vy * 0.2;
	} else if([3, 6, 9].includes(crashdir)) { // 우측 라켓에 충돌
		console.log("Rk2V " + rk2.vy);
		pong1.ball["v"][1] += rk2.vy * 0.2;
		pong1.t += 1;
	}
	if(pong1.ball["v"][1] < -1.0 * limy) pong1.ball["v"][1] = -1.0 * limy;
	else if(pong1.ball["v"][1] > +1.0 * limy) pong1.ball["v"][1] = +1.0 * limy;
	return -1;
}

class racket {
	constructor(x, color) {
		this.x = x;
		this.l = racketl; // 길이: 1 + 2 * l
		this.color = [parseInt(color.substring(1, 3), 10) / 255.0, parseInt(color.substring(3, 5), 10) / 255.0, parseInt(color.substring(5, 7), 10) / 255.0];
		this.reset();
	}
	incr() { this.targetjob = +1 }
	decr() { this.targetjob = -1 }
	update() {
		switch(this.targetjob) {
			case +1:
				if(this.y + this.l <= get_max_y() - 1) {
					lmap.setcolor(layer_racket, this.y - this.l, this.x, 0.0, 0.0, 0.0, 0.0); // Clear
					this.y += 1;
					this.vy = Math.min(this.vy + 0.2, +1.0);
					lmap.setcolor(layer_racket, this.y + this.l, this.x, this.color[0], this.color[1], this.color[2], 1.0);
				}
				break;
			case -1:
				if(this.y - this.l >= 1) {
					lmap.setcolor(layer_racket, this.y + this.l, this.x, 0.0, 0.0, 0.0, 0.0);
					this.y -= 1;
					this.vy = Math.max(this.vy - 0.2, -1.0);
					lmap.setcolor(layer_racket, this.y - this.l, this.x, this.color[0], this.color[1], this.color[2], 1.0);
				}
				break;
		}
		this.targetjob = 0;
		this.vy *= 0.8;
	}
	reset() {
		this.targetjob = 0;
		this.vy = 0.0;
		this.y = round(get_max_y() / 2.0);
	}
}

class pong {
	constructor(crashwall, crashblock) {
		this.ball = {"p": [0.0, 0.0], "v": [0.0, 0.0]};
		this.crashwall = crashwall;
		this.crashblock = crashblock;
		//this.contdrag = -0.005;
		this.contdrag = 0.0;
		this.reset();
		this.brk = false;
		this.t = 0;
	}
	reset() {
		var initangle = (Math.random() / 4 + 1 / 8) * 2 * Math.PI;
		this.ball["p"][0] = get_max_x() / 2.0;
		this.ball["p"][1] = get_max_y() / 2.0;
		this.ball["v"][0] = 0.4; // Init Vel-X
		this.maxvy = Math.sqrt(1 - this.ball["v"][0]*this.ball["v"][0]);
		this.ball["v"][1] = (2 * Math.random() - 1.0) * this.maxvy; // Init Vel-Y
		space_jump(round(this.ball["p"][1]), round(this.ball["p"][0]))
		print("Init " + this.ball["v"]);
		this.c = 0;
		this.t = 0;
		//ai1.reset();
	}

	update() {
		this.c += 1;
		let tx = this.ball["p"][0] + this.ball["v"][0];
		let ty = this.ball["p"][1] + this.ball["v"][1];
		let vt = Math.sqrt(this.ball["v"][0] * this.ball["v"][0] + this.ball["v"][1] * this.ball["v"][1]);
		let crashdir = 5;
		if(round(tx) > get_max_x()) {
			tx = 2.0 * get_max_x() - tx;
			this.ball["v"][0] *= -1;
			crashdir += +1;
		} else if(round(tx) < 0.0) {
			tx = -tx;
			this.ball["v"][0] *= -1;
			crashdir += -1;
		}
		if(round(ty) > get_max_y()) {
			ty = 2.0 * get_max_y() - ty;
			this.ball["v"][1] *= -1;
			crashdir += -3;
		} else if(round(ty) < 0.0) {
			ty = -ty;
			this.ball["v"][1] *= -1;
			crashdir += +3;
		}
		if(crashdir !== 5) {
			if(this.crashwall(this.ball, crashdir) > 0) {
				clearInterval(this.loopid);
				this.loopid = null;
				return 3;
			}
		}

		if(block_colors.includes(get_color(round(ty), round(tx)))) { // get_color 함수 인자의 X와 Y가 바뀌어 있더이다
			let crashdir = 5
			if(this.ball["v"][0] < 0.0 && block_colors.includes(get_color(get_y(), get_x() - 1))) {
				tx = 2.0 * get_x() - tx;
				this.ball["v"][0] *= -1;
				crashdir += -1;
			} else if(this.ball["v"][0] > 0.0 && block_colors.includes(get_color(get_y(), get_x() + 1))) {
				tx = 2.0 * get_x() - tx;
				this.ball["v"][0] *= -1;
				crashdir += +1;
			}
			if(this.ball["v"][1] < 0.0 && block_colors.includes(get_color(get_y() - 1, get_x()))) {
				ty = 2.0 * get_y() - ty;
				this.ball["v"][1] *= -1;
				crashdir += +3;
			} else if(this.ball["v"][1] > 0.0 && block_colors.includes(get_color(get_y() + 1, get_x()))) {
				ty = 2.0 * get_y() - ty;
				this.ball["v"][1] *= -1;
				crashdir += -3;
			}
			if(crashdir === 5) {
				if(round(tx) > get_x()) {
					if(round(ty) > get_y()) crashdir = 3;
					else if(round(ty) < get_y()) crashdir = 9;
				} else if(round(tx) < get_x()) {
					if(round(ty) > get_y()) crashdir = 1;
					else if(round(ty) < get_y()) crashdir = 7;
				}
			}
			if(this.crashblock(this.ball, crashdir) > 0) {
				clearInterval(this.loopid);
				this.loopid = null;
				return 2;
			}
		}

		this.ball["p"][0] = tx;
		this.ball["p"][1] = ty;

		domove(round(tx), round(ty), this.c, vt);

		if(vt <= 0.0) {
			print("Stop " + this.ball["p"]);
			return 1;
		}

		this.ball["v"][0] *= Math.max((vt + this.contdrag) / vt, 0.0);
		this.ball["v"][1] *= Math.max((vt + this.contdrag) / vt, 0.0); // 속도에 상관없이 일정한 감속을 부여: 수정 필요함
	}
}

class loop {
	constructor() {
		this.frameloopid = null;
		this.looplatency = 25; // 20FPS Target

		// Init
		this.rk1 = new racket(1, block_colors[1]); // Ai-Controlled
		this.rk2 = new racket(get_max_x() - 1, block_colors[2]); // Human-Controlled
		this.pong = new pong(crashwall, crashblock);

	}

	start() {
		if(this.frameloopid != null) return;
		const setInterval = window.setInterval;
		this.frameloopid = setInterval(() => {
			// Run
			this.rk1.update();
			this.rk2.update();
			this.pong.update();

		}, this.looplatency); // 20 FPS Target

		// Reset
		this.rk1.reset();
		this.rk2.reset();
		this.pong.reset();
	}

	stop() {
		clearInterval(frameloopid);
		this.frameloopid = null;
	}
}

var loop1 = new loop();

press_key("b", "loop1.start()");
press_key("k", "loop1.rk2.incr()");
press_key("i", "loop1.rk2.decr()");
press_key("l", "getleaderboard()");
print("PRESS [b] TO CONTINUE");
