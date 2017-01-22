
// グローバルオブジェクトを取得する呪文
var global = new Function("return this")();

if (global.rivil == null) { global.rivil = {}; }

global.rivil.lang = ( function ()
{

// private =====================================================================

// ABCĈDEFGHIJKLMNOPQRSŜTUVWYZ
// abcĉdefghijklmnopqrsŝtuvwyz

	// あるパターンがルールに合っていなかった場合、
	// 添字にこの値を足して再試行する
	var INDEX_INC = 3;

	// 変換規則がガラッと変わるので、長さを変えないこと！
	var PATTERNS = [
		"a", "ai", "ae", "ao",
		"b", "ba", "bi", "bu", "be", "bo",
		"c", "ca", "ci", "ce",
		"ĉ", "ĉu",
		"d", "di", "du", "de",
		"e", "ea", "ei", "ee",
		"f", "fi", "fu",
		"g", "ga", "gi", "gu", "go",
		"h", "hi", "hu", "ho",
		"i", "ia", "iu", "io",
		"j", "ja", "ji", "ju", "je", "jo",
		"k", "ki", "ke", "ko",
		"l", "li",
		"m", "mi", "mu", "mo",
		"n", "ni", "ne",
		"o", "oe",
		"p", "pa", "pi", "p", "pe", "po", // puは削除
		"q", "qi", "qu", "qe", "qo",
		"r", "ra", "ri", "ru", "re", "ro",
		"s", "si", "su", "se",
		"ŝ", "ŝi", "ŝe",
		"t", "ta", "ti", "tu",
		"u", "ui", "uo", "us",
		"v", "vi", "vu", "ve",
		"w", "wa", "wi", "we",
		"y", "yi", "yu", "ye",
		"z", "zi",
		"rel", "zk", "gs",
		"br", "fr", "pr", "tr", "wr", "gz",
		"is", "us", "os", "i", "l", "ee", "ee", "ee", "v", "v", "p", "p", // 仮置き
	];
	// console.log(PATTERNS.length);
	// 語頭、語中、語尾
	// 0:NG | 1:OK
	var RULE = {
		"a": [0,0,1], "ai": [0,0,1], "ae": [0,0,1], "ao": [0,0,1],
		"b": [0,1,1],
		"c": [0,0,1],
		"ĉ": [0,0,1],
		"d": [0,0,1],
		"e": [0,0,1],
		"f": [0,1,1],
		"g": [0,0,1],
		"h": [0,0,0],
		"i": [0,1,0], "ia": [0,0,1], "iu": [0,0,1], "io": [0,0,1],
		"j": [0,0,0],
		"k": [0,0,0],
		"l": [0,0,1],
		"m": [0,0,1],
		"n": [0,0,1],
		"o": [0,0,1],
		"p": [0,1,1],
		"q": [0,0,1],
		"r": [0,0,0],
		"s": [0,1,1],
		"ŝ": [0,1,1],
		"t": [0,0,0],
		"u": [0,0,0], "us": [0,1,1],
		"v": [0,1,1],
		"w": [0,0,0], "wa": [1,0,0],
		"y": [0,0,0],
		"z": [0,0,1],
		"rel": [0,1,1], "zk": [0,0,1], "oz": [0,1,1], "gs": [0,0,1],
		"br": [1,0,0], "fr": [1,0,0], "pr": [1,0,0], "tr": [1,0,0], "wr": [1,0,0],
		"is": [0,0,1], "us": [0,0,1], "os": [0,0,1],
	};
	var DICTIONARY = {
		"rivil": "rivil"
	};
	var VAL_MAX = 9999943;
	var VAL_DIV = 5035651;
	// 値をループさせる
	// v: [min, max)
	function loop(v, min, max) {
		v -= min; var r = max - min; v = v % r; return v + min;
	}
	// 乱数的なハッシュ関数
	// 文字コードだけだとバリエーションがないのでインデックスも受け取る
	// c: str.charCodeAt(i);
	function hash(c, i) {
		i = Math.abs(i); i++; // iは正の整数
		var val = ((i + c * 187) * (i - c + 3443443));
		val = (Math.abs(i - c * 443) * (i * 223 + c)) % VAL_DIV;
		return val;
	}
	// 初期値を決める
	function init(str) {
		var val = 0;
		for(var i = 0; i < str.length; i++) {
			var c = str.charCodeAt(i);
			val = hash(c, val);
		}
		return val;
	}
	function getRule(pattern, i) {
		var rul = RULE[pattern];
		if (rul == null) { return 1; }
		return rul[i];
	}
	// head, body, tailの制約に反しないパターンを返す
	// index: latin_dbでのインデックス(0 ～ PATTERNS.length - 1)
	function getPattern(index, head, body, tail) {
		var dog = 0;
		while(true) {
			dog++;
			if (dog > 50) { throw new Error("無限ループです"); }
			index = loop(index, 0, PATTERNS.length);
			var pattern = PATTERNS[index];
			// console.log("index: "+index);
			// console.log("pattern: "+pattern);
			// 未使用領域
			if (pattern == null) {
				// index += PATTERNS.length;
				index += INDEX_INC;
				continue;
			}
			// 頭・胴・尾全てのルールにそぐわなかった場合
			// 1つでもtrueになったらやり直し
			if ( (head && getRule(pattern, 0) == 0) ||
			     (body && getRule(pattern, 1) == 0) ||
			     (tail && getRule(pattern, 2) == 0) ) {
				index += INDEX_INC;
				continue;
			}
			else {
				return pattern;
			}
		}
	}
	function convertWord(seed) {
		seed = seed.toLowerCase();
		seed = seed.replace(/^\s+/g, "");
		seed = seed.replace(/\s+$/g, "");
		var ret = { seed : seed, rivil : "" };
		// 英字列( ' と / を含む) → Rivil単語に変換する
		if (seed.match( /^['/a-z]+$/g )) {
			// 辞書にあればそれを返す
			var dict = DICTIONARY[seed];
			if (dict != null) {
				ret.rivil = dict;
			}
			else {
				var h = 0;
				for(var i = 0; i < seed.length; i++) {
					h += hash(seed.charCodeAt(i), i);
				}
				var rivilPatternNum = Math.round(0.5 + seed.length / 1.75 + (h % 3) - 1);
				if (rivilPatternNum < 1) { rivilPatternNum = 1; }
				// 語頭 | 語中 | 語尾
				var head = true;
				var body = false;
				var tail = (seed.length == 1); // TODO
				// seedに応じて初期値をバラつかせる
				// 0から始めるとパターン化する恐れがあるため
				var val = loop(init(seed), 0, VAL_DIV);
				// rivilPatternNumだけ繰り返す
				for(var i = 0; i < rivilPatternNum; i++) {
					if (i == rivilPatternNum - 1) {
						body = false;
						tail = true;
					}
					else {
						body = true;
						tail = false; // 次にhashを割ったら0になる（切り捨てで）
					}
					// 1パターン連結する
					ret.rivil += getPattern(val % PATTERNS.length, head, body, tail);
					val += hash(seed.charCodeAt(i), i);
					if (val >= VAL_MAX) {
						val = loop(val, 0, VAL_DIV);
					}
					head = false;
				}
			}
		}
		// 英字列以外 → そのまま返す
		else {
			ret.rivil = seed;
		}
		return ret;
	}
	function convertSentence(seedSentence) {
		var ret = [];
		var seeds = seedSentence.split( /\s*[- ]\s*/g ) || [];
		// console.log(seeds);
		var separators = seedSentence.match( /\s*[- ]\s*/g ) || [];
		// console.log(separators);
		separators.push(" ");
		for(var i = 0; i < seeds.length; i++) {
			var seed = seeds[i]; if (seed.length == 0) continue;
			var separator = separators[i].charAt(0);
			var word = convertWord(seed);
			ret.push(word);
			if (separator === "-") {
				ret.push( { seed: separator, rivil: " " } );
			}
			else {
				ret.push( { seed: separator, rivil: " " } );
			}
		}
		ret.pop();
		return ret;
	}
	function convertText(seedText) {
		var ret = [];
		seedText = seedText.replace(/\r\n/g, " ");
		seedText = seedText.replace(/\n/g, " ");
		var seedSentences = seedText.split( /\s*[!.]\s*/g ) || [];
		var separators = seedText.match( /[!.]/g ) || [];
		separators.push(".");
		for(var i = 0; i < seedSentences.length; i++) {
			var seedSentence = seedSentences[i];
			if (seedSentence.length == 0) continue;
			var separator = separators[i].charAt(0);
			var words = convertSentence(seedSentence);
			// if (separator === "!") {
			// 	ret.push( { seed: "", rivil: "!" } );
			// }
			// else {
			// 	ret.push( { seed: "", rivil: "." } );
			// }
			for(var j = 0; j < words.length; j++) {
				var word = words[j];
				ret.push(word);
			}
			if (separator === "!") {
				// ret.push( { seed : "!", rivil : "！" } );
				ret.push( { seed : "!", rivil : " " } );
			}
			else {
				// ret.push( { seed : ". ", rivil : ". " } );
				ret.push( { seed : ". ", rivil : " " } );
			}
		}
		return ret;
	}

// public ======================================================================

	return {
		getWord : convertWord,
		getSentence : convertSentence,
		getText : convertText,
	};
})();
