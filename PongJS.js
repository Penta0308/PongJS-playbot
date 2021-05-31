</script>
<script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/firebase_inject.js"></script>
<script src="https://raw.githubusercontent.com/Penta0308/PongJS-playbot/main/inject.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js"></script>
<script>

// 0-based 좌표계

const block_colors = ["#000000", "#404040", "#202020"];
//change_speed(-1);

const layers = 2;
const layer_ball = 0;
const layer_racket = 1;
const racketl = 3;

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
	getcolor(l, x, y) { return this.layers[l][x][y] }
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
	if(d === 'l')      repeat("turn_left()", (6 - get_direction()) % 4);
	else if(d === 'r') repeat("turn_left()", (4 - get_direction()) % 4);
	else if(d === 'u') repeat("turn_left()", (5 - get_direction()) % 4);
	else if(d === 'd') repeat("turn_left()", (7 - get_direction()) % 4);
	else error("set_direction only takes 'l', 'r', 'u', 'd' for input #0: " + d.toString());
}

function crashwall(loop, crashdir) { // 벽 충돌 Event Function
	print("CrsW " + loop.pong.ball["p"] + " " + crashdir);
	if([1, 4, 7].includes(crashdir)) { // 우측 승
		print("WIN  " + loop.pong.t);
		addleaderboard(loop.pong.t);
		loop.ai.store_lose(loop);
		return 1;
	} else if([3, 6, 9].includes(crashdir)) { // 좌측 승
		print("LOSE " + loop.pong.t);
		addleaderboard(loop.pong.t);
		//loop.ai.store_win(loop);
		return 2;
	} else return -1;
}
function crashblock(loop, crashdir) { // 블럭 충돌 Event Function
	print("CrsB " + loop.pong.ball["p"] + " " + crashdir);
	if([1, 4, 7].includes(crashdir)) { // 좌측 라켓에 충돌
		console.log("Rk1V " + loop.rk1.vy);
		loop.pong.ball["v"][1] += + loop.rk1.vy * 0.2;
		loop.ai.store_tick(loop);
	} else if([3, 6, 9].includes(crashdir)) { // 우측 라켓에 충돌
		console.log("Rk2V " + loop.rk2.vy);
		loop.pong.ball["v"][1] += loop.rk2.vy * 0.2;
		loop.pong.t += 1;
	}
	if(loop.pong.ball["v"][1] < -1.0 * loop.pong.maxvy) loop.pong.ball["v"][1] = -1.0 * loop.pong.maxvy;
	else if(loop.pong.ball["v"][1] > +1.0 * loop.pong.maxvy) loop.pong.ball["v"][1] = +1.0 * loop.pong.maxvy;
	return -1;
}

class ai {
	constructor() {
		print("Starting Ai...");
		this.model = tf.sequential();
		this.model.add(tf.layers.dense({units: 5, inputShape: [4], activation: 'elu'}));
		this.model.add(tf.layers.dense({units: 5, activation: 'elu'}));
		this.model.add(tf.layers.dense({units: 3, activation: 'elu'}));
		this.optimizer = tf.train.adam(0.001);
		this.model.compile({loss: 'meanSquaredError', optimizer: this.optimizer});
		this.last_data = null;
		this.training_data = [];
		this.training_reward = [];
		this.training = false;	// TODO: TURN ON THIS
		this.reset();
	}

	update(loop) {
		let p = this.pred([[loop.pong.ball["p"][0], loop.pong.ball["p"][1], loop.rk1.y, 1]]);
		switch(p) {
			case 0:
				loop.rk1.incr()
				break;
			case 2:
				loop.rk2.decr();
				break;
		}
		if(this.training) {
			this.store_data(loop.pong.ball["p"][0], loop.pong.ball["p"][1], loop.rk1.y, p);
		}
	}

	store_tick(loop) {
		if(!this.training) return;
		for(let i = 0; i < this.training_data.length; i++) {
			this.training_reward[i] = +1.0 * (i / this.training_data.length);
		}
		this.train();
		this.reset();
	}

	store_lose(loop) {
		if(!this.training) return;
		for(let i = 0; i < this.training_data.length; i++) {
			this.training_reward[i] = -2.0 * (i / this.training_data.length);
		}
		this.train();
		this.reset();
	}

	store_data(ballx, bally, computery, did) {
		if(!this.training) return;
		this.training_data.push([ballx, bally, computery, did]);
		this.training_reward.push([0.0]);
	}

	train() {
		for(let i = 0; i < this.training_data.length - 1; i++) {
			let q = this.model.predict(this.training_data[i + 1]).dataSync();
			let t = this.model.predict(this.training_data[i])[this.training_data[i + 1][3]].dataSync();
			if(i === this.training_data.length - 2) {
				q[this.training_data[3]] = this.training_reward[i];
			} else {
				q[this.training_data[3]] = this.training_reward[i] + 0.5 * t;
			}
			this.model.fit(tf.tensor([this.training_data[i]]), tf.tensor([q]), {epoch: 1});
		}
	}

	pred(x) {
		return tf.argMax(this.model.predict(tf.tensor(x)), 1).dataSync();
	}

	reset() {
		this.last_data = null;
		this.training_data = [];
		this.training_reward = [];
	}
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
		for(let y = 0; y <= get_max_y(); y++) {
			if(y >= this.y - this.l && y <= this.y + this.l)
				lmap.setcolor(layer_racket, y, this.x, this.color[0], this.color[1], this.color[2], 1.0);
			else
				lmap.setcolor(layer_racket, y, this.x, 1.0, 1.0, 1.0, 0.0);
		}
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

	update(loop) {
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
			if(this.crashwall(loop, crashdir) > 0) {
				return 3;
			}
		}

		crashdir = 5
		if(lmap.getcolor(layer_racket, round(ty), round(tx))["a"] > 0.0 ) {
			if (this.ball["v"][0] < 0.0 && lmap.getcolor(layer_racket, get_y(), get_x() - 1)["a"] > 0.0) {
				tx = 2.0 * get_x() - tx;
				this.ball["v"][0] *= -1;
				crashdir += -1;
			} else if (this.ball["v"][0] > 0.0 && lmap.getcolor(layer_racket, get_y(), get_x() + 1)["a"] > 0.0) {
				tx = 2.0 * get_x() - tx;
				this.ball["v"][0] *= -1;
				crashdir += +1;
			}
			if (this.ball["v"][1] < 0.0 && lmap.getcolor(layer_racket, get_y() - 1, get_x())["a"] > 0.0) {
				ty = 2.0 * get_y() - ty;
				this.ball["v"][1] *= -1;
				crashdir += +3;
			} else if (this.ball["v"][1] > 0.0 && lmap.getcolor(layer_racket, get_y() + 1, get_x())["a"] > 0.0) {
				ty = 2.0 * get_y() - ty;
				this.ball["v"][1] *= -1;
				crashdir += -3;
			}
			if (crashdir === 5) {
				if (round(tx) > get_x()) {
					if (round(ty) > get_y()) crashdir = 3;
					else if (round(ty) < get_y()) crashdir = 9;
				} else if (round(tx) < get_x()) {
					if (round(ty) > get_y()) crashdir = 1;
					else if (round(ty) < get_y()) crashdir = 7;
				}
			}
		}
		if(crashdir !== 5) {
			if(this.crashblock(loop, crashdir) > 0) return 2;
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
		this.init();
	}

	init() {
		// Init
		this.rk1 = new racket(1, block_colors[1]); // Ai-Controlled
		this.rk2 = new racket(get_max_x() - 1, block_colors[2]); // Human-Controlled
		this.pong = new pong(crashwall, crashblock);
		this.ai = new ai();
		this.reset();
	}

	start() {
		if(this.frameloopid != null) return;
		const setInterval = window.setInterval;
		this.reset();
		this.frameloopid = setInterval(() => {
			// Run
			this.rk1.update(); this.rk2.update();
			this.ai.update(this);
			if(this.pong.update(this) > 0) this.stop();

		}, this.looplatency); // 20 FPS Target
	}

	reset() {
		// Reset
		this.rk1.reset();
		this.rk2.reset();
		this.ai.reset();
		this.pong.reset();
	}

	stop() {
		clearInterval(this.frameloopid);
		this.frameloopid = null;
	}
}

var loop1 = new loop();

press_key("b", "loop1.start()");
press_key("k", "loop1.rk2.incr()");
press_key("i", "loop1.rk2.decr()");
press_key("l", "getleaderboard()");
print("PRESS [b] TO CONTINUE");
print("PRESS [i, k] TO MOVE");
print("PRESS [l] TO VIEW LEADERBOARD");
