
const PGN = {
	parse(pgnString, fen) {
		let lastHeaderElement = pgnString.lastIndexOf("]\n\n") + 1;
		let headerString = pgnString.substr(0, lastHeaderElement);
		let historyString = pgnString.substr(lastHeaderElement);
		let parsedMoves = this.pegParse(historyString.replace(/\s\s+/g, ' ').replace(/\n/g, " "));

		return this.createValidMoves(parsedMoves[0], fen);
	},
	createValidMoves(parsedMoves, fen) {
		let chess = fen ? new Chess(fen) : new Chess();
		let moves = [{fen: chess.fen()}];

		parsedMoves.map(parsedMove => {
			if (parsedMove.notation) {
				let notation = parsedMove.notation.notation;
				let move = chess.move(notation, {sloppy: true});
				if (move) {
					move.fen = chess.fen();
					if (parsedMove.nag) {
						move.nag = parsedMove.nag[0];
					}
					if (parsedMove.commentBefore) {
						move.commentBefore = parsedMove.commentBefore;
					}
					if (parsedMove.commentMove) {
						move.commentMove = parsedMove.commentMove;
					}
					if (parsedMove.commentAfter) {
						move.commentAfter = parsedMove.commentAfter;
					}
					move.variations = [];
					let parsedVariations = parsedMove.variations;
					if (parsedVariations.length > 0) {
						let lastFen = moves.length > 0 ? moves[moves.length - 1].fen : fen;
						for (let parsedVariation of parsedVariations) {
							move.variations.push(this.createValidMoves(parsedVariation, lastFen));
						}
					}
					moves.push(move);
				} else {
					throw new IllegalMoveException(chess.fen(), notation);
				}
			}
		});

		return moves;
	}
};

(function() {
	/*
	 * Original copied from: https://github.com/shaack/cm-pgn/blob/master/src/cm-pgn/parser/pgnParser.js
	 */

	function peg$subclass(child, parent) {
		function ctor() { this.constructor = child; }
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
	}

	function peg$SyntaxError(message, expected, found, location) {
		this.message  = message;
		this.expected = expected;
		this.found    = found;
		this.location = location;
		this.name     = "SyntaxError";

		if (typeof Error.captureStackTrace === "function") {
			Error.captureStackTrace(this, peg$SyntaxError);
		}
	}

	peg$subclass(peg$SyntaxError, Error);

	peg$SyntaxError.buildMessage = function(expected, found) {
		var DESCRIBE_EXPECTATION_FNS = {
					literal: function(expectation) {
						return "\"" + literalEscape(expectation.text) + "\"";
					},
					"class": function(expectation) {
						var escapedParts = "",
								i;
						for (i = 0; i < expectation.parts.length; i++) {
							escapedParts += expectation.parts[i] instanceof Array
								? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
								: classEscape(expectation.parts[i]);
						}
						return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
					},
					any: function(expectation) {
						return "any character";
					},
					end: function(expectation) {
						return "end of input";
					},
					other: function(expectation) {
						return expectation.description;
					}
				};

		function hex(ch) {
			return ch.charCodeAt(0).toString(16).toUpperCase();
		}

		function literalEscape(s) {
			return s
				.replace(/\\/g, '\\\\')
				.replace(/"/g,  '\\"')
				.replace(/\0/g, '\\0')
				.replace(/\t/g, '\\t')
				.replace(/\n/g, '\\n')
				.replace(/\r/g, '\\r')
				.replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
				.replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
		}

		function classEscape(s) {
			return s
				.replace(/\\/g, '\\\\')
				.replace(/\]/g, '\\]')
				.replace(/\^/g, '\\^')
				.replace(/-/g,  '\\-')
				.replace(/\0/g, '\\0')
				.replace(/\t/g, '\\t')
				.replace(/\n/g, '\\n')
				.replace(/\r/g, '\\r')
				.replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
				.replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
		}

		function describeExpectation(expectation) {
			return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
		}

		function describeExpected(expected) {
			var descriptions = new Array(expected.length),
					i, j;

			for (i = 0; i < expected.length; i++) {
				descriptions[i] = describeExpectation(expected[i]);
			}

			descriptions.sort();

			if (descriptions.length > 0) {
				for (i = 1, j = 1; i < descriptions.length; i++) {
					if (descriptions[i - 1] !== descriptions[i]) {
						descriptions[j] = descriptions[i];
						j++;
					}
				}
				descriptions.length = j;
			}

			switch (descriptions.length) {
				case 1:
					return descriptions[0];

				case 2:
					return descriptions[0] + " or " + descriptions[1];

				default:
					return descriptions.slice(0, -1).join(", ")
						+ ", or "
						+ descriptions[descriptions.length - 1];
			}
		}

		function describeFound(found) {
			return found ? "\"" + literalEscape(found) + "\"" : "end of input";
		}

		return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
	};


	function peg$parse(input, options) {
		options = options !== void 0 ? options : {};

		var peg$FAILED = {},
			peg$startRuleFunctions = { pgn: peg$parsepgn },
			peg$startRuleFunction  = peg$parsepgn,
			peg$c0 = function(pw, all) { var arr = (all ? all : []); arr.unshift(pw);return arr; },
			peg$c1 = function(pb, all) { var arr = (all ? all : []); arr.unshift(pb); return arr; },
			peg$c2 = function() { return [[]]; },
			peg$c3 = function(pw) { return pw; },
			peg$c4 = function(pb) { return pb; },
			peg$c5 = function(cm, mn, cb, hm, nag, ca, vari, all) { var arr = (all ? all : []);
						var move = {}; move.turn = 'w'; move.moveNumber = mn;
						move.notation = hm; move.commentBefore = cb; move.commentAfter = ca; move.commentMove = cm;
						move.variations = (vari ? vari : []); move.nag = (nag ? nag : null); arr.unshift(move); return arr; },
			peg$c6 = function(cm, me, cb, hm, nag, ca, vari, all) { var arr = (all ? all : []);
						var move = {}; move.turn = 'b'; move.moveNumber = me;
						move.notation = hm; move.commentBefore = cb; move.commentAfter = ca;
						move.variations = (vari ? vari : []); arr.unshift(move); move.nag = (nag ? nag : null); return arr; },
			peg$c7 = "1:0",
			peg$c8 = peg$literalExpectation("1:0", false),
			peg$c9 = () => ["1:0"],
			peg$c10 = "0:1",
			peg$c11 = peg$literalExpectation("0:1", false),
			peg$c12 = () => ["0:1"],
			peg$c13 = "1-0",
			peg$c14 = peg$literalExpectation("1-0", false),
			peg$c15 = () => ["1-0"],
			peg$c16 = "0-1",
			peg$c17 = peg$literalExpectation("0-1", false),
			peg$c18 = () => ["0-1"],
			peg$c19 = "1/2-1/2",
			peg$c20 = peg$literalExpectation("1/2-1/2", false),
			peg$c21 = () => ["1/2-1/2"],
			peg$c22 = "*",
			peg$c23 = peg$literalExpectation("*", false),
			peg$c24 = () => ["*"],
			peg$c25 = /^[^}]/,
			peg$c26 = peg$classExpectation(["}"], true, false),
			peg$c27 = cm => cm.join("").trim(),
			peg$c28 = "{",
			peg$c29 = peg$literalExpectation("{", false),
			peg$c30 = "}",
			peg$c31 = peg$literalExpectation("}", false),
			peg$c32 = function(vari, all, me) { var arr = (all ? all : []); arr.unshift(vari); return arr; },
			peg$c33 = function(vari, all) { var arr = (all ? all : []); arr.unshift(vari); return arr; },
			peg$c34 = "(",
			peg$c35 = peg$literalExpectation("(", false),
			peg$c36 = ")",
			peg$c37 = peg$literalExpectation(")", false),
			peg$c38 = ".",
			peg$c39 = peg$literalExpectation(".", false),
			peg$c40 = num => num,
			peg$c41 = peg$otherExpectation("integer"),
			peg$c42 = /^[0-9]/,
			peg$c43 = peg$classExpectation([["0", "9"]], false, false),
			peg$c44 = digits => makeInteger(digits),
			peg$c45 = " ",
			peg$c46 = peg$literalExpectation(" ", false),
			peg$c47 = () => '',
			peg$c48 = function(fig, disc, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.disc =  (disc ? disc : null); hm.strike = (str ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.promotion = pr; hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : ""); return hm; },
			peg$c49 = function(fig, cols, rows, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str =='x' ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.notation = (fig && (fig!=='P') ? fig : "") + cols + rows + (str=='x' ? str : "-") + col  + row + (pr ? pr : "") + (ch ? ch : ""); hm.promotion = pr; return hm; },
			peg$c50 = function(fig, str, col, row, pr, ch) { var hm = {}; hm.fig = (fig ? fig : null); hm.strike = (str ? str : null); hm.col = col; hm.row = row; hm.check = (ch ? ch : null); hm.notation = (fig ? fig : "") + (str ? str : "") + col  + row + (pr ? pr : "") + (ch ? ch : ""); hm.promotion = pr; return hm; },
			peg$c51 = "O-O-O",
			peg$c52 = peg$literalExpectation("O-O-O", false),
			peg$c53 = function(ch) { var hm = {}; hm.notation = 'O-O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; },
			peg$c54 = "O-O",
			peg$c55 = peg$literalExpectation("O-O", false),
			peg$c56 = function(ch) { var hm = {}; hm.notation = 'O-O'+ (ch ? ch : ""); hm.check = (ch ? ch : null); return  hm; },
			peg$c57 = "+-",
			peg$c58 = peg$literalExpectation("+-", false),
			peg$c59 = "+",
			peg$c60 = peg$literalExpectation("+", false),
			peg$c61 = ch => ch[1],
			peg$c62 = "$$$",
			peg$c63 = peg$literalExpectation("$$$", false),
			peg$c64 = "#",
			peg$c65 = peg$literalExpectation("#", false),
			peg$c66 = "=",
			peg$c67 = peg$literalExpectation("=", false),
			peg$c68 = f => '=' + f,
			peg$c69 = function(nag, nags) { var arr = (nags ? nags : []); arr.unshift(nag); return arr; },
			peg$c70 = "$",
			peg$c71 = peg$literalExpectation("$", false),
			peg$c72 = num => "$" + num,
			peg$c73 = "!!",
			peg$c74 = peg$literalExpectation("!!", false),
			peg$c75 = () => '$3',
			peg$c76 = "??",
			peg$c77 = peg$literalExpectation("??", false),
			peg$c78 = () => '$4',
			peg$c79 = "!?",
			peg$c80 = peg$literalExpectation("!?", false),
			peg$c81 = () => '$5',
			peg$c82 = "?!",
			peg$c83 = peg$literalExpectation("?!", false),
			peg$c84 = () => '$6',
			peg$c85 = "!",
			peg$c86 = peg$literalExpectation("!", false),
			peg$c87 = () => '$1',
			peg$c88 = "?",
			peg$c89 = peg$literalExpectation("?", false),
			peg$c90 = () => '$2',
			peg$c91 = "\u203C",
			peg$c92 = peg$literalExpectation("\u203C", false),
			peg$c93 = "\u2047",
			peg$c94 = peg$literalExpectation("\u2047", false),
			peg$c95 = "\u2049",
			peg$c96 = peg$literalExpectation("\u2049", false),
			peg$c97 = "\u2048",
			peg$c98 = peg$literalExpectation("\u2048", false),
			peg$c99 = "\u25A1",
			peg$c100 = peg$literalExpectation("\u25A1", false),
			peg$c101 = () => '$7',
			peg$c102 = () => '$10',
			peg$c103 = "\u221E",
			peg$c104 = peg$literalExpectation("\u221E", false),
			peg$c105 = () => '$13',
			peg$c106 = "\u2A72",
			peg$c107 = peg$literalExpectation("\u2A72", false),
			peg$c108 = () => '$14',
			peg$c109 = "\u2A71",
			peg$c110 = peg$literalExpectation("\u2A71", false),
			peg$c111 = () => '$15',
			peg$c112 = "\xB1",
			peg$c113 = peg$literalExpectation("\xB1", false),
			peg$c114 = () => '$16',
			peg$c115 = "\u2213",
			peg$c116 = peg$literalExpectation("\u2213", false),
			peg$c117 = () => '$17',
			peg$c118 = () => '$18',
			peg$c119 = "-+",
			peg$c120 = peg$literalExpectation("-+", false),
			peg$c121 = () => '$19',
			peg$c122 = "\u2A00",
			peg$c123 = peg$literalExpectation("\u2A00", false),
			peg$c124 = () => '$22',
			peg$c125 = "\u27F3",
			peg$c126 = peg$literalExpectation("\u27F3", false),
			peg$c127 = () => '$32',
			peg$c128 = "\u2192",
			peg$c129 = peg$literalExpectation("\u2192", false),
			peg$c130 = () => '$36',
			peg$c131 = "\u2191",
			peg$c132 = peg$literalExpectation("\u2191", false),
			peg$c133 = () => '$40',
			peg$c134 = "\u21C6",
			peg$c135 = peg$literalExpectation("\u21C6", false),
			peg$c136 = () => '$132',
			peg$c137 = "D",
			peg$c138 = peg$literalExpectation("D", false),
			peg$c139 = () => '$220',
			peg$c140 = /^[RNBQKP]/,
			peg$c141 = peg$classExpectation(["R", "N", "B", "Q", "K", "P"], false, false),
			peg$c142 = /^[a-h]/,
			peg$c143 = peg$classExpectation([["a", "h"]], false, false),
			peg$c144 = /^[1-8]/,
			peg$c145 = peg$classExpectation([["1", "8"]], false, false),
			peg$c146 = "x",
			peg$c147 = peg$literalExpectation("x", false),
			peg$c148 = "-",
			peg$c149 = peg$literalExpectation("-", false),
			peg$currPos          = 0,
			peg$savedPos         = 0,
			peg$posDetailsCache  = [{ line: 1, column: 1 }],
			peg$maxFailPos       = 0,
			peg$maxFailExpected  = [],
			peg$silentFails      = 0,
			peg$result;

		if ("startRule" in options) {
			if (!(options.startRule in peg$startRuleFunctions)) {
				throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
			}

			peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
		}

		function text() {
			return input.substring(peg$savedPos, peg$currPos);
		}

		function location() {
			return peg$computeLocation(peg$savedPos, peg$currPos);
		}

		function expected(description, location) {
			location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

			throw peg$buildStructuredError(
				[peg$otherExpectation(description)],
				input.substring(peg$savedPos, peg$currPos),
				location
			);
		}

		function error(message, location) {
			location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

			throw peg$buildSimpleError(message, location);
		}

		function peg$literalExpectation(text, ignoreCase) {
			return { type: "literal", text: text, ignoreCase: ignoreCase };
		}

		function peg$classExpectation(parts, inverted, ignoreCase) {
			return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
		}

		function peg$anyExpectation() {
			return { type: "any" };
		}

		function peg$endExpectation() {
			return { type: "end" };
		}

		function peg$otherExpectation(description) {
			return { type: "other", description: description };
		}

		function peg$computePosDetails(pos) {
			var details = peg$posDetailsCache[pos], p;

			if (details) {
				return details;
			} else {
				p = pos - 1;
				while (!peg$posDetailsCache[p]) {
					p--;
				}

				details = peg$posDetailsCache[p];
				details = {
					line:   details.line,
					column: details.column
				};

				while (p < pos) {
					if (input.charCodeAt(p) === 10) {
						details.line++;
						details.column = 1;
					} else {
						details.column++;
					}

					p++;
				}

				peg$posDetailsCache[pos] = details;
				return details;
			}
		}

		function peg$computeLocation(startPos, endPos) {
			var startPosDetails = peg$computePosDetails(startPos),
					endPosDetails   = peg$computePosDetails(endPos);

			return {
				start: {
					offset: startPos,
					line:   startPosDetails.line,
					column: startPosDetails.column
				},
				end: {
					offset: endPos,
					line:   endPosDetails.line,
					column: endPosDetails.column
				}
			};
		}

		function peg$fail(expected) {
			if (peg$currPos < peg$maxFailPos) { return; }

			if (peg$currPos > peg$maxFailPos) {
				peg$maxFailPos = peg$currPos;
				peg$maxFailExpected = [];
			}

			peg$maxFailExpected.push(expected);
		}

		function peg$buildSimpleError(message, location) {
			return new peg$SyntaxError(message, null, null, location);
		}

		function peg$buildStructuredError(expected, found, location) {
			return new peg$SyntaxError(
				peg$SyntaxError.buildMessage(expected, found),
				expected,
				found,
				location
			);
		}

		function peg$parsepgn() {
			var s0, s1, s2;

			s0 = peg$currPos;
			s1 = peg$parsepgnStartWhite();
			if (s1 !== peg$FAILED) {
				s2 = peg$parsepgnBlack();
				if (s2 === peg$FAILED) {
					s2 = null;
				}
				if (s2 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c0(s1, s2);
					s0 = s1;
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
			if (s0 === peg$FAILED) {
				s0 = peg$currPos;
				s1 = peg$parsepgnStartBlack();
				if (s1 !== peg$FAILED) {
					s2 = peg$parsepgnWhite();
					if (s2 === peg$FAILED) {
						s2 = null;
					}
					if (s2 !== peg$FAILED) {
						peg$savedPos = s0;
						s1 = peg$c1(s1, s2);
						s0 = s1;
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
				if (s0 === peg$FAILED) {
					s0 = peg$currPos;
					s1 = peg$parsewhiteSpace();
					if (s1 === peg$FAILED) {
						s1 = null;
					}
					if (s1 !== peg$FAILED) {
						peg$savedPos = s0;
						s1 = peg$c2();
					}
					s0 = s1;
				}
			}

			return s0;
		}

		function peg$parsepgnStartWhite() {
			var s0, s1;

			s0 = peg$currPos;
			s1 = peg$parsepgnWhite();
			if (s1 !== peg$FAILED) {
				peg$savedPos = s0;
				s1 = peg$c3(s1);
			}
			s0 = s1;

			return s0;
		}

		function peg$parsepgnStartBlack() {
			var s0, s1;

			s0 = peg$currPos;
			s1 = peg$parsepgnBlack();
			if (s1 !== peg$FAILED) {
				peg$savedPos = s0;
				s1 = peg$c4(s1);
			}
			s0 = s1;

			return s0;
		}

		function peg$parsepgnWhite() {
			var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;

			s0 = peg$currPos;
			s1 = peg$parsewhiteSpace();
			if (s1 === peg$FAILED) {
				s1 = null;
			}
			if (s1 !== peg$FAILED) {
				s2 = peg$parsecomment();
				if (s2 === peg$FAILED) {
					s2 = null;
				}
				if (s2 !== peg$FAILED) {
					s3 = peg$parsewhiteSpace();
					if (s3 === peg$FAILED) {
						s3 = null;
					}
					if (s3 !== peg$FAILED) {
						s4 = peg$parsemoveNumber();
						if (s4 === peg$FAILED) {
							s4 = null;
						}
						if (s4 !== peg$FAILED) {
							s5 = peg$parsewhiteSpace();
							if (s5 === peg$FAILED) {
								s5 = null;
							}
							if (s5 !== peg$FAILED) {
								s6 = peg$parsecomment();
								if (s6 === peg$FAILED) {
									s6 = null;
								}
								if (s6 !== peg$FAILED) {
									s7 = peg$parsewhiteSpace();
									if (s7 === peg$FAILED) {
										s7 = null;
									}
									if (s7 !== peg$FAILED) {
										s8 = peg$parsehalfMove();
										if (s8 !== peg$FAILED) {
											s9 = peg$parsewhiteSpace();
											if (s9 === peg$FAILED) {
												s9 = null;
											}
											if (s9 !== peg$FAILED) {
												s10 = peg$parsenags();
												if (s10 === peg$FAILED) {
													s10 = null;
												}
												if (s10 !== peg$FAILED) {
													s11 = peg$parsewhiteSpace();
													if (s11 === peg$FAILED) {
														s11 = null;
													}
													if (s11 !== peg$FAILED) {
														s12 = peg$parsecomment();
														if (s12 === peg$FAILED) {
															s12 = null;
														}
														if (s12 !== peg$FAILED) {
															s13 = peg$parsewhiteSpace();
															if (s13 === peg$FAILED) {
																s13 = null;
															}
															if (s13 !== peg$FAILED) {
																s14 = peg$parsevariationWhite();
																if (s14 === peg$FAILED) {
																	s14 = null;
																}
																if (s14 !== peg$FAILED) {
																	s15 = peg$parsepgnBlack();
																	if (s15 === peg$FAILED) {
																		s15 = null;
																	}
																	if (s15 !== peg$FAILED) {
																		peg$savedPos = s0;
																		s1 = peg$c5(s2, s4, s6, s8, s10, s12, s14, s15);
																		s0 = s1;
																	} else {
																		peg$currPos = s0;
																		s0 = peg$FAILED;
																	}
																} else {
																	peg$currPos = s0;
																	s0 = peg$FAILED;
																}
															} else {
																peg$currPos = s0;
																s0 = peg$FAILED;
															}
														} else {
															peg$currPos = s0;
															s0 = peg$FAILED;
														}
													} else {
														peg$currPos = s0;
														s0 = peg$FAILED;
													}
												} else {
													peg$currPos = s0;
													s0 = peg$FAILED;
												}
											} else {
												peg$currPos = s0;
												s0 = peg$FAILED;
											}
										} else {
											peg$currPos = s0;
											s0 = peg$FAILED;
										}
									} else {
										peg$currPos = s0;
										s0 = peg$FAILED;
									}
								} else {
									peg$currPos = s0;
									s0 = peg$FAILED;
								}
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
			if (s0 === peg$FAILED) {
				s0 = peg$parseendGame();
			}

			return s0;
		}

		function peg$parsepgnBlack() {
			var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15;

			s0 = peg$currPos;
			s1 = peg$parsewhiteSpace();
			if (s1 === peg$FAILED) {
				s1 = null;
			}
			if (s1 !== peg$FAILED) {
				s2 = peg$parsecomment();
				if (s2 === peg$FAILED) {
					s2 = null;
				}
				if (s2 !== peg$FAILED) {
					s3 = peg$parsewhiteSpace();
					if (s3 === peg$FAILED) {
						s3 = null;
					}
					if (s3 !== peg$FAILED) {
						s4 = peg$parsemoveEllipse();
						if (s4 === peg$FAILED) {
							s4 = null;
						}
						if (s4 !== peg$FAILED) {
							s5 = peg$parsewhiteSpace();
							if (s5 === peg$FAILED) {
								s5 = null;
							}
							if (s5 !== peg$FAILED) {
								s6 = peg$parsecomment();
								if (s6 === peg$FAILED) {
									s6 = null;
								}
								if (s6 !== peg$FAILED) {
									s7 = peg$parsewhiteSpace();
									if (s7 === peg$FAILED) {
										s7 = null;
									}
									if (s7 !== peg$FAILED) {
										s8 = peg$parsehalfMove();
										if (s8 !== peg$FAILED) {
											s9 = peg$parsewhiteSpace();
											if (s9 === peg$FAILED) {
												s9 = null;
											}
											if (s9 !== peg$FAILED) {
												s10 = peg$parsenags();
												if (s10 === peg$FAILED) {
													s10 = null;
												}
												if (s10 !== peg$FAILED) {
													s11 = peg$parsewhiteSpace();
													if (s11 === peg$FAILED) {
														s11 = null;
													}
													if (s11 !== peg$FAILED) {
														s12 = peg$parsecomment();
														if (s12 === peg$FAILED) {
															s12 = null;
														}
														if (s12 !== peg$FAILED) {
															s13 = peg$parsewhiteSpace();
															if (s13 === peg$FAILED) {
																s13 = null;
															}
															if (s13 !== peg$FAILED) {
																s14 = peg$parsevariationBlack();
																if (s14 === peg$FAILED) {
																	s14 = null;
																}
																if (s14 !== peg$FAILED) {
																	s15 = peg$parsepgnWhite();
																	if (s15 === peg$FAILED) {
																		s15 = null;
																	}
																	if (s15 !== peg$FAILED) {
																		peg$savedPos = s0;
																		s1 = peg$c6(s2, s4, s6, s8, s10, s12, s14, s15);
																		s0 = s1;
																	} else {
																		peg$currPos = s0;
																		s0 = peg$FAILED;
																	}
																} else {
																	peg$currPos = s0;
																	s0 = peg$FAILED;
																}
															} else {
																peg$currPos = s0;
																s0 = peg$FAILED;
															}
														} else {
															peg$currPos = s0;
															s0 = peg$FAILED;
														}
													} else {
														peg$currPos = s0;
														s0 = peg$FAILED;
													}
												} else {
													peg$currPos = s0;
													s0 = peg$FAILED;
												}
											} else {
												peg$currPos = s0;
												s0 = peg$FAILED;
											}
										} else {
											peg$currPos = s0;
											s0 = peg$FAILED;
										}
									} else {
										peg$currPos = s0;
										s0 = peg$FAILED;
									}
								} else {
									peg$currPos = s0;
									s0 = peg$FAILED;
								}
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
			if (s0 === peg$FAILED) {
				s0 = peg$parseendGame();
			}

			return s0;
		}

		function peg$parseendGame() {
			var s0, s1;

			s0 = peg$currPos;
			if (input.substr(peg$currPos, 3) === peg$c7) {
				s1 = peg$c7;
				peg$currPos += 3;
			} else {
				s1 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c8); }
			}
			if (s1 !== peg$FAILED) {
				peg$savedPos = s0;
				s1 = peg$c9();
			}
			s0 = s1;
			if (s0 === peg$FAILED) {
				s0 = peg$currPos;
				if (input.substr(peg$currPos, 3) === peg$c10) {
					s1 = peg$c10;
					peg$currPos += 3;
				} else {
					s1 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c11); }
				}
				if (s1 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c12();
				}
				s0 = s1;
				if (s0 === peg$FAILED) {
					s0 = peg$currPos;
					if (input.substr(peg$currPos, 3) === peg$c13) {
						s1 = peg$c13;
						peg$currPos += 3;
					} else {
						s1 = peg$FAILED;
						if (peg$silentFails === 0) { peg$fail(peg$c14); }
					}
					if (s1 !== peg$FAILED) {
						peg$savedPos = s0;
						s1 = peg$c15();
					}
					s0 = s1;
					if (s0 === peg$FAILED) {
						s0 = peg$currPos;
						if (input.substr(peg$currPos, 3) === peg$c16) {
							s1 = peg$c16;
							peg$currPos += 3;
						} else {
							s1 = peg$FAILED;
							if (peg$silentFails === 0) { peg$fail(peg$c17); }
						}
						if (s1 !== peg$FAILED) {
							peg$savedPos = s0;
							s1 = peg$c18();
						}
						s0 = s1;
						if (s0 === peg$FAILED) {
							s0 = peg$currPos;
							if (input.substr(peg$currPos, 7) === peg$c19) {
								s1 = peg$c19;
								peg$currPos += 7;
							} else {
								s1 = peg$FAILED;
								if (peg$silentFails === 0) { peg$fail(peg$c20); }
							}
							if (s1 !== peg$FAILED) {
								peg$savedPos = s0;
								s1 = peg$c21();
							}
							s0 = s1;
							if (s0 === peg$FAILED) {
								s0 = peg$currPos;
								if (input.charCodeAt(peg$currPos) === 42) {
									s1 = peg$c22;
									peg$currPos++;
								} else {
									s1 = peg$FAILED;
									if (peg$silentFails === 0) { peg$fail(peg$c23); }
								}
								if (s1 !== peg$FAILED) {
									peg$savedPos = s0;
									s1 = peg$c24();
								}
								s0 = s1;
							}
						}
					}
				}
			}

			return s0;
		}

		function peg$parsecomment() {
			var s0, s1, s2, s3;

			s0 = peg$currPos;
			s1 = peg$parsecl();
			if (s1 !== peg$FAILED) {
				s2 = [];
				if (peg$c25.test(input.charAt(peg$currPos))) {
					s3 = input.charAt(peg$currPos);
					peg$currPos++;
				} else {
					s3 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c26); }
				}
				while (s3 !== peg$FAILED) {
					s2.push(s3);
					if (peg$c25.test(input.charAt(peg$currPos))) {
						s3 = input.charAt(peg$currPos);
						peg$currPos++;
					} else {
						s3 = peg$FAILED;
						if (peg$silentFails === 0) { peg$fail(peg$c26); }
					}
				}
				if (s2 !== peg$FAILED) {
					s3 = peg$parsecr();
					if (s3 !== peg$FAILED) {
						peg$savedPos = s0;
						s1 = peg$c27(s2);
						s0 = s1;
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parsecl() {
			var s0;

			if (input.charCodeAt(peg$currPos) === 123) {
				s0 = peg$c28;
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c29); }
			}

			return s0;
		}

		function peg$parsecr() {
			var s0;

			if (input.charCodeAt(peg$currPos) === 125) {
				s0 = peg$c30;
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c31); }
			}

			return s0;
		}

		function peg$parsevariationWhite() {
			var s0, s1, s2, s3, s4, s5, s6, s7;

			s0 = peg$currPos;
			s1 = peg$parsepl();
			if (s1 !== peg$FAILED) {
				s2 = peg$parsepgnWhite();
				if (s2 !== peg$FAILED) {
					s3 = peg$parsepr();
					if (s3 !== peg$FAILED) {
						s4 = peg$parsewhiteSpace();
						if (s4 === peg$FAILED) {
							s4 = null;
						}
						if (s4 !== peg$FAILED) {
							s5 = peg$parsevariationWhite();
							if (s5 === peg$FAILED) {
								s5 = null;
							}
							if (s5 !== peg$FAILED) {
								s6 = peg$parsewhiteSpace();
								if (s6 === peg$FAILED) {
									s6 = null;
								}
								if (s6 !== peg$FAILED) {
									s7 = peg$parsemoveEllipse();
									if (s7 === peg$FAILED) {
										s7 = null;
									}
									if (s7 !== peg$FAILED) {
										peg$savedPos = s0;
										s1 = peg$c32(s2, s5, s7);
										s0 = s1;
									} else {
										peg$currPos = s0;
										s0 = peg$FAILED;
									}
								} else {
									peg$currPos = s0;
									s0 = peg$FAILED;
								}
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parsevariationBlack() {
			var s0, s1, s2, s3, s4, s5;

			s0 = peg$currPos;
			s1 = peg$parsepl();
			if (s1 !== peg$FAILED) {
				s2 = peg$parsepgnStartBlack();
				if (s2 !== peg$FAILED) {
					s3 = peg$parsepr();
					if (s3 !== peg$FAILED) {
						s4 = peg$parsewhiteSpace();
						if (s4 === peg$FAILED) {
							s4 = null;
						}
						if (s4 !== peg$FAILED) {
							s5 = peg$parsevariationBlack();
							if (s5 === peg$FAILED) {
								s5 = null;
							}
							if (s5 !== peg$FAILED) {
								peg$savedPos = s0;
								s1 = peg$c33(s2, s5);
								s0 = s1;
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parsepl() {
			var s0;

			if (input.charCodeAt(peg$currPos) === 40) {
				s0 = peg$c34;
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c35); }
			}

			return s0;
		}

		function peg$parsepr() {
			var s0;

			if (input.charCodeAt(peg$currPos) === 41) {
				s0 = peg$c36;
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c37); }
			}

			return s0;
		}

		function peg$parsemoveNumber() {
			var s0, s1, s2;

			s0 = peg$currPos;
			s1 = peg$parseinteger();
			if (s1 !== peg$FAILED) {
				if (input.charCodeAt(peg$currPos) === 46) {
					s2 = peg$c38;
					peg$currPos++;
				} else {
					s2 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c39); }
				}
				if (s2 === peg$FAILED) {
					s2 = null;
				}
				if (s2 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c40(s1);
					s0 = s1;
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parseinteger() {
			var s0, s1, s2;

			peg$silentFails++;
			s0 = peg$currPos;
			s1 = [];
			if (peg$c42.test(input.charAt(peg$currPos))) {
				s2 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s2 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c43); }
			}
			if (s2 !== peg$FAILED) {
				while (s2 !== peg$FAILED) {
					s1.push(s2);
					if (peg$c42.test(input.charAt(peg$currPos))) {
						s2 = input.charAt(peg$currPos);
						peg$currPos++;
					} else {
						s2 = peg$FAILED;
						if (peg$silentFails === 0) { peg$fail(peg$c43); }
					}
				}
			} else {
				s1 = peg$FAILED;
			}
			if (s1 !== peg$FAILED) {
				peg$savedPos = s0;
				s1 = peg$c44(s1);
			}
			s0 = s1;
			peg$silentFails--;
			if (s0 === peg$FAILED) {
				s1 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c41); }
			}

			return s0;
		}

		function peg$parsewhiteSpace() {
			var s0, s1, s2;

			s0 = peg$currPos;
			s1 = [];
			if (input.charCodeAt(peg$currPos) === 32) {
				s2 = peg$c45;
				peg$currPos++;
			} else {
				s2 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c46); }
			}
			if (s2 !== peg$FAILED) {
				while (s2 !== peg$FAILED) {
					s1.push(s2);
					if (input.charCodeAt(peg$currPos) === 32) {
						s2 = peg$c45;
						peg$currPos++;
					} else {
						s2 = peg$FAILED;
						if (peg$silentFails === 0) { peg$fail(peg$c46); }
					}
				}
			} else {
				s1 = peg$FAILED;
			}
			if (s1 !== peg$FAILED) {
				peg$savedPos = s0;
				s1 = peg$c47();
			}
			s0 = s1;

			return s0;
		}

		function peg$parsehalfMove() {
			var s0, s1, s2, s3, s4, s5, s6, s7, s8;

			s0 = peg$currPos;
			s1 = peg$parsefigure();
			if (s1 === peg$FAILED) {
				s1 = null;
			}
			if (s1 !== peg$FAILED) {
				s2 = peg$currPos;
				peg$silentFails++;
				s3 = peg$parsecheckdisc();
				peg$silentFails--;
				if (s3 !== peg$FAILED) {
					peg$currPos = s2;
					s2 = void 0;
				} else {
					s2 = peg$FAILED;
				}
				if (s2 !== peg$FAILED) {
					s3 = peg$parsediscriminator();
					if (s3 !== peg$FAILED) {
						s4 = peg$parsestrike();
						if (s4 === peg$FAILED) {
							s4 = null;
						}
						if (s4 !== peg$FAILED) {
							s5 = peg$parsecolumn();
							if (s5 !== peg$FAILED) {
								s6 = peg$parserow();
								if (s6 !== peg$FAILED) {
									s7 = peg$parsepromotion();
									if (s7 === peg$FAILED) {
										s7 = null;
									}
									if (s7 !== peg$FAILED) {
										s8 = peg$parsecheck();
										if (s8 === peg$FAILED) {
											s8 = null;
										}
										if (s8 !== peg$FAILED) {
											peg$savedPos = s0;
											s1 = peg$c48(s1, s3, s4, s5, s6, s7, s8);
											s0 = s1;
										} else {
											peg$currPos = s0;
											s0 = peg$FAILED;
										}
									} else {
										peg$currPos = s0;
										s0 = peg$FAILED;
									}
								} else {
									peg$currPos = s0;
									s0 = peg$FAILED;
								}
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
			if (s0 === peg$FAILED) {
				s0 = peg$currPos;
				s1 = peg$parsefigure();
				if (s1 === peg$FAILED) {
					s1 = null;
				}
				if (s1 !== peg$FAILED) {
					s2 = peg$parsecolumn();
					if (s2 !== peg$FAILED) {
						s3 = peg$parserow();
						if (s3 !== peg$FAILED) {
							s4 = peg$parsestrikeOrDash();
							if (s4 === peg$FAILED) {
								s4 = null;
							}
							if (s4 !== peg$FAILED) {
								s5 = peg$parsecolumn();
								if (s5 !== peg$FAILED) {
									s6 = peg$parserow();
									if (s6 !== peg$FAILED) {
										s7 = peg$parsepromotion();
										if (s7 === peg$FAILED) {
											s7 = null;
										}
										if (s7 !== peg$FAILED) {
											s8 = peg$parsecheck();
											if (s8 === peg$FAILED) {
												s8 = null;
											}
											if (s8 !== peg$FAILED) {
												peg$savedPos = s0;
												s1 = peg$c49(s1, s2, s3, s4, s5, s6, s7, s8);
												s0 = s1;
											} else {
												peg$currPos = s0;
												s0 = peg$FAILED;
											}
										} else {
											peg$currPos = s0;
											s0 = peg$FAILED;
										}
									} else {
										peg$currPos = s0;
										s0 = peg$FAILED;
									}
								} else {
									peg$currPos = s0;
									s0 = peg$FAILED;
								}
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
				if (s0 === peg$FAILED) {
					s0 = peg$currPos;
					s1 = peg$parsefigure();
					if (s1 === peg$FAILED) {
						s1 = null;
					}
					if (s1 !== peg$FAILED) {
						s2 = peg$parsestrike();
						if (s2 === peg$FAILED) {
							s2 = null;
						}
						if (s2 !== peg$FAILED) {
							s3 = peg$parsecolumn();
							if (s3 !== peg$FAILED) {
								s4 = peg$parserow();
								if (s4 !== peg$FAILED) {
									s5 = peg$parsepromotion();
									if (s5 === peg$FAILED) {
										s5 = null;
									}
									if (s5 !== peg$FAILED) {
										s6 = peg$parsecheck();
										if (s6 === peg$FAILED) {
											s6 = null;
										}
										if (s6 !== peg$FAILED) {
											peg$savedPos = s0;
											s1 = peg$c50(s1, s2, s3, s4, s5, s6);
											s0 = s1;
										} else {
											peg$currPos = s0;
											s0 = peg$FAILED;
										}
									} else {
										peg$currPos = s0;
										s0 = peg$FAILED;
									}
								} else {
									peg$currPos = s0;
									s0 = peg$FAILED;
								}
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
					if (s0 === peg$FAILED) {
						s0 = peg$currPos;
						if (input.substr(peg$currPos, 5) === peg$c51) {
							s1 = peg$c51;
							peg$currPos += 5;
						} else {
							s1 = peg$FAILED;
							if (peg$silentFails === 0) { peg$fail(peg$c52); }
						}
						if (s1 !== peg$FAILED) {
							s2 = peg$parsecheck();
							if (s2 === peg$FAILED) {
								s2 = null;
							}
							if (s2 !== peg$FAILED) {
								peg$savedPos = s0;
								s1 = peg$c53(s2);
								s0 = s1;
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
						if (s0 === peg$FAILED) {
							s0 = peg$currPos;
							if (input.substr(peg$currPos, 3) === peg$c54) {
								s1 = peg$c54;
								peg$currPos += 3;
							} else {
								s1 = peg$FAILED;
								if (peg$silentFails === 0) { peg$fail(peg$c55); }
							}
							if (s1 !== peg$FAILED) {
								s2 = peg$parsecheck();
								if (s2 === peg$FAILED) {
									s2 = null;
								}
								if (s2 !== peg$FAILED) {
									peg$savedPos = s0;
									s1 = peg$c56(s2);
									s0 = s1;
								} else {
									peg$currPos = s0;
									s0 = peg$FAILED;
								}
							} else {
								peg$currPos = s0;
								s0 = peg$FAILED;
							}
						}
					}
				}
			}

			return s0;
		}

		function peg$parsecheck() {
			var s0, s1, s2, s3;

			s0 = peg$currPos;
			s1 = peg$currPos;
			s2 = peg$currPos;
			peg$silentFails++;
			if (input.substr(peg$currPos, 2) === peg$c57) {
				s3 = peg$c57;
				peg$currPos += 2;
			} else {
				s3 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c58); }
			}
			peg$silentFails--;
			if (s3 === peg$FAILED) {
				s2 = void 0;
			} else {
				peg$currPos = s2;
				s2 = peg$FAILED;
			}
			if (s2 !== peg$FAILED) {
				if (input.charCodeAt(peg$currPos) === 43) {
					s3 = peg$c59;
					peg$currPos++;
				} else {
					s3 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c60); }
				}
				if (s3 !== peg$FAILED) {
					s2 = [s2, s3];
					s1 = s2;
				} else {
					peg$currPos = s1;
					s1 = peg$FAILED;
				}
			} else {
				peg$currPos = s1;
				s1 = peg$FAILED;
			}
			if (s1 !== peg$FAILED) {
				peg$savedPos = s0;
				s1 = peg$c61(s1);
			}
			s0 = s1;
			if (s0 === peg$FAILED) {
				s0 = peg$currPos;
				s1 = peg$currPos;
				s2 = peg$currPos;
				peg$silentFails++;
				if (input.substr(peg$currPos, 3) === peg$c62) {
					s3 = peg$c62;
					peg$currPos += 3;
				} else {
					s3 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c63); }
				}
				peg$silentFails--;
				if (s3 === peg$FAILED) {
					s2 = void 0;
				} else {
					peg$currPos = s2;
					s2 = peg$FAILED;
				}
				if (s2 !== peg$FAILED) {
					if (input.charCodeAt(peg$currPos) === 35) {
						s3 = peg$c64;
						peg$currPos++;
					} else {
						s3 = peg$FAILED;
						if (peg$silentFails === 0) { peg$fail(peg$c65); }
					}
					if (s3 !== peg$FAILED) {
						s2 = [s2, s3];
						s1 = s2;
					} else {
						peg$currPos = s1;
						s1 = peg$FAILED;
					}
				} else {
					peg$currPos = s1;
					s1 = peg$FAILED;
				}
				if (s1 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c61(s1);
				}
				s0 = s1;
			}

			return s0;
		}

		function peg$parsepromotion() {
			var s0, s1, s2;

			s0 = peg$currPos;
			if (input.charCodeAt(peg$currPos) === 61) {
				s1 = peg$c66;
				peg$currPos++;
			} else {
				s1 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c67); }
			}
			if (s1 !== peg$FAILED) {
				s2 = peg$parsefigure();
				if (s2 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c68(s2);
					s0 = s1;
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parsenags() {
			var s0, s1, s2, s3;

			s0 = peg$currPos;
			s1 = peg$parsenag();
			if (s1 !== peg$FAILED) {
				s2 = peg$parsewhiteSpace();
				if (s2 === peg$FAILED) {
					s2 = null;
				}
				if (s2 !== peg$FAILED) {
					s3 = peg$parsenags();
					if (s3 === peg$FAILED) {
						s3 = null;
					}
					if (s3 !== peg$FAILED) {
						peg$savedPos = s0;
						s1 = peg$c69(s1, s3);
						s0 = s1;
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parsenag() {
			var s0, s1, s2;

			s0 = peg$currPos;
			if (input.charCodeAt(peg$currPos) === 36) {
				s1 = peg$c70;
				peg$currPos++;
			} else {
				s1 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c71); }
			}
			if (s1 !== peg$FAILED) {
				s2 = peg$parseinteger();
				if (s2 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c72(s2);
					s0 = s1;
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
			if (s0 === peg$FAILED) {
				s0 = peg$currPos;
				if (input.substr(peg$currPos, 2) === peg$c73) {
					s1 = peg$c73;
					peg$currPos += 2;
				} else {
					s1 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c74); }
				}
				if (s1 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c75();
				}
				s0 = s1;
				if (s0 === peg$FAILED) {
					s0 = peg$currPos;
					if (input.substr(peg$currPos, 2) === peg$c76) {
						s1 = peg$c76;
						peg$currPos += 2;
					} else {
						s1 = peg$FAILED;
						if (peg$silentFails === 0) { peg$fail(peg$c77); }
					}
					if (s1 !== peg$FAILED) {
						peg$savedPos = s0;
						s1 = peg$c78();
					}
					s0 = s1;
					if (s0 === peg$FAILED) {
						s0 = peg$currPos;
						if (input.substr(peg$currPos, 2) === peg$c79) {
							s1 = peg$c79;
							peg$currPos += 2;
						} else {
							s1 = peg$FAILED;
							if (peg$silentFails === 0) { peg$fail(peg$c80); }
						}
						if (s1 !== peg$FAILED) {
							peg$savedPos = s0;
							s1 = peg$c81();
						}
						s0 = s1;
						if (s0 === peg$FAILED) {
							s0 = peg$currPos;
							if (input.substr(peg$currPos, 2) === peg$c82) {
								s1 = peg$c82;
								peg$currPos += 2;
							} else {
								s1 = peg$FAILED;
								if (peg$silentFails === 0) { peg$fail(peg$c83); }
							}
							if (s1 !== peg$FAILED) {
								peg$savedPos = s0;
								s1 = peg$c84();
							}
							s0 = s1;
							if (s0 === peg$FAILED) {
								s0 = peg$currPos;
								if (input.charCodeAt(peg$currPos) === 33) {
									s1 = peg$c85;
									peg$currPos++;
								} else {
									s1 = peg$FAILED;
									if (peg$silentFails === 0) { peg$fail(peg$c86); }
								}
								if (s1 !== peg$FAILED) {
									peg$savedPos = s0;
									s1 = peg$c87();
								}
								s0 = s1;
								if (s0 === peg$FAILED) {
									s0 = peg$currPos;
									if (input.charCodeAt(peg$currPos) === 63) {
										s1 = peg$c88;
										peg$currPos++;
									} else {
										s1 = peg$FAILED;
										if (peg$silentFails === 0) { peg$fail(peg$c89); }
									}
									if (s1 !== peg$FAILED) {
										peg$savedPos = s0;
										s1 = peg$c90();
									}
									s0 = s1;
									if (s0 === peg$FAILED) {
										s0 = peg$currPos;
										if (input.charCodeAt(peg$currPos) === 8252) {
											s1 = peg$c91;
											peg$currPos++;
										} else {
											s1 = peg$FAILED;
											if (peg$silentFails === 0) { peg$fail(peg$c92); }
										}
										if (s1 !== peg$FAILED) {
											peg$savedPos = s0;
											s1 = peg$c75();
										}
										s0 = s1;
										if (s0 === peg$FAILED) {
											s0 = peg$currPos;
											if (input.charCodeAt(peg$currPos) === 8263) {
												s1 = peg$c93;
												peg$currPos++;
											} else {
												s1 = peg$FAILED;
												if (peg$silentFails === 0) { peg$fail(peg$c94); }
											}
											if (s1 !== peg$FAILED) {
												peg$savedPos = s0;
												s1 = peg$c78();
											}
											s0 = s1;
											if (s0 === peg$FAILED) {
												s0 = peg$currPos;
												if (input.charCodeAt(peg$currPos) === 8265) {
													s1 = peg$c95;
													peg$currPos++;
												} else {
													s1 = peg$FAILED;
													if (peg$silentFails === 0) { peg$fail(peg$c96); }
												}
												if (s1 !== peg$FAILED) {
													peg$savedPos = s0;
													s1 = peg$c81();
												}
												s0 = s1;
												if (s0 === peg$FAILED) {
													s0 = peg$currPos;
													if (input.charCodeAt(peg$currPos) === 8264) {
														s1 = peg$c97;
														peg$currPos++;
													} else {
														s1 = peg$FAILED;
														if (peg$silentFails === 0) { peg$fail(peg$c98); }
													}
													if (s1 !== peg$FAILED) {
														peg$savedPos = s0;
														s1 = peg$c84();
													}
													s0 = s1;
													if (s0 === peg$FAILED) {
														s0 = peg$currPos;
														if (input.charCodeAt(peg$currPos) === 9633) {
															s1 = peg$c99;
															peg$currPos++;
														} else {
															s1 = peg$FAILED;
															if (peg$silentFails === 0) { peg$fail(peg$c100); }
														}
														if (s1 !== peg$FAILED) {
															peg$savedPos = s0;
															s1 = peg$c101();
														}
														s0 = s1;
														if (s0 === peg$FAILED) {
															s0 = peg$currPos;
															if (input.charCodeAt(peg$currPos) === 61) {
																s1 = peg$c66;
																peg$currPos++;
															} else {
																s1 = peg$FAILED;
																if (peg$silentFails === 0) { peg$fail(peg$c67); }
															}
															if (s1 !== peg$FAILED) {
																peg$savedPos = s0;
																s1 = peg$c102();
															}
															s0 = s1;
															if (s0 === peg$FAILED) {
																s0 = peg$currPos;
																if (input.charCodeAt(peg$currPos) === 8734) {
																	s1 = peg$c103;
																	peg$currPos++;
																} else {
																	s1 = peg$FAILED;
																	if (peg$silentFails === 0) { peg$fail(peg$c104); }
																}
																if (s1 !== peg$FAILED) {
																	peg$savedPos = s0;
																	s1 = peg$c105();
																}
																s0 = s1;
																if (s0 === peg$FAILED) {
																	s0 = peg$currPos;
																	if (input.charCodeAt(peg$currPos) === 10866) {
																		s1 = peg$c106;
																		peg$currPos++;
																	} else {
																		s1 = peg$FAILED;
																		if (peg$silentFails === 0) { peg$fail(peg$c107); }
																	}
																	if (s1 !== peg$FAILED) {
																		peg$savedPos = s0;
																		s1 = peg$c108();
																	}
																	s0 = s1;
																	if (s0 === peg$FAILED) {
																		s0 = peg$currPos;
																		if (input.charCodeAt(peg$currPos) === 10865) {
																			s1 = peg$c109;
																			peg$currPos++;
																		} else {
																			s1 = peg$FAILED;
																			if (peg$silentFails === 0) { peg$fail(peg$c110); }
																		}
																		if (s1 !== peg$FAILED) {
																			peg$savedPos = s0;
																			s1 = peg$c111();
																		}
																		s0 = s1;
																		if (s0 === peg$FAILED) {
																			s0 = peg$currPos;
																			if (input.charCodeAt(peg$currPos) === 177) {
																				s1 = peg$c112;
																				peg$currPos++;
																			} else {
																				s1 = peg$FAILED;
																				if (peg$silentFails === 0) { peg$fail(peg$c113); }
																			}
																			if (s1 !== peg$FAILED) {
																				peg$savedPos = s0;
																				s1 = peg$c114();
																			}
																			s0 = s1;
																			if (s0 === peg$FAILED) {
																				s0 = peg$currPos;
																				if (input.charCodeAt(peg$currPos) === 8723) {
																					s1 = peg$c115;
																					peg$currPos++;
																				} else {
																					s1 = peg$FAILED;
																					if (peg$silentFails === 0) { peg$fail(peg$c116); }
																				}
																				if (s1 !== peg$FAILED) {
																					peg$savedPos = s0;
																					s1 = peg$c117();
																				}
																				s0 = s1;
																				if (s0 === peg$FAILED) {
																					s0 = peg$currPos;
																					if (input.substr(peg$currPos, 2) === peg$c57) {
																						s1 = peg$c57;
																						peg$currPos += 2;
																					} else {
																						s1 = peg$FAILED;
																						if (peg$silentFails === 0) { peg$fail(peg$c58); }
																					}
																					if (s1 !== peg$FAILED) {
																						peg$savedPos = s0;
																						s1 = peg$c118();
																					}
																					s0 = s1;
																					if (s0 === peg$FAILED) {
																						s0 = peg$currPos;
																						if (input.substr(peg$currPos, 2) === peg$c119) {
																							s1 = peg$c119;
																							peg$currPos += 2;
																						} else {
																							s1 = peg$FAILED;
																							if (peg$silentFails === 0) { peg$fail(peg$c120); }
																						}
																						if (s1 !== peg$FAILED) {
																							peg$savedPos = s0;
																							s1 = peg$c121();
																						}
																						s0 = s1;
																						if (s0 === peg$FAILED) {
																							s0 = peg$currPos;
																							if (input.charCodeAt(peg$currPos) === 10752) {
																								s1 = peg$c122;
																								peg$currPos++;
																							} else {
																								s1 = peg$FAILED;
																								if (peg$silentFails === 0) { peg$fail(peg$c123); }
																							}
																							if (s1 !== peg$FAILED) {
																								peg$savedPos = s0;
																								s1 = peg$c124();
																							}
																							s0 = s1;
																							if (s0 === peg$FAILED) {
																								s0 = peg$currPos;
																								if (input.charCodeAt(peg$currPos) === 10227) {
																									s1 = peg$c125;
																									peg$currPos++;
																								} else {
																									s1 = peg$FAILED;
																									if (peg$silentFails === 0) { peg$fail(peg$c126); }
																								}
																								if (s1 !== peg$FAILED) {
																									peg$savedPos = s0;
																									s1 = peg$c127();
																								}
																								s0 = s1;
																								if (s0 === peg$FAILED) {
																									s0 = peg$currPos;
																									if (input.charCodeAt(peg$currPos) === 8594) {
																										s1 = peg$c128;
																										peg$currPos++;
																									} else {
																										s1 = peg$FAILED;
																										if (peg$silentFails === 0) { peg$fail(peg$c129); }
																									}
																									if (s1 !== peg$FAILED) {
																										peg$savedPos = s0;
																										s1 = peg$c130();
																									}
																									s0 = s1;
																									if (s0 === peg$FAILED) {
																										s0 = peg$currPos;
																										if (input.charCodeAt(peg$currPos) === 8593) {
																											s1 = peg$c131;
																											peg$currPos++;
																										} else {
																											s1 = peg$FAILED;
																											if (peg$silentFails === 0) { peg$fail(peg$c132); }
																										}
																										if (s1 !== peg$FAILED) {
																											peg$savedPos = s0;
																											s1 = peg$c133();
																										}
																										s0 = s1;
																										if (s0 === peg$FAILED) {
																											s0 = peg$currPos;
																											if (input.charCodeAt(peg$currPos) === 8646) {
																												s1 = peg$c134;
																												peg$currPos++;
																											} else {
																												s1 = peg$FAILED;
																												if (peg$silentFails === 0) { peg$fail(peg$c135); }
																											}
																											if (s1 !== peg$FAILED) {
																												peg$savedPos = s0;
																												s1 = peg$c136();
																											}
																											s0 = s1;
																											if (s0 === peg$FAILED) {
																												s0 = peg$currPos;
																												if (input.charCodeAt(peg$currPos) === 68) {
																													s1 = peg$c137;
																													peg$currPos++;
																												} else {
																													s1 = peg$FAILED;
																													if (peg$silentFails === 0) { peg$fail(peg$c138); }
																												}
																												if (s1 !== peg$FAILED) {
																													peg$savedPos = s0;
																													s1 = peg$c139();
																												}
																												s0 = s1;
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}

			return s0;
		}

		function peg$parsediscriminator() {
			var s0;

			s0 = peg$parsecolumn();
			if (s0 === peg$FAILED) {
				s0 = peg$parserow();
			}

			return s0;
		}

		function peg$parsecheckdisc() {
			var s0, s1, s2, s3, s4;

			s0 = peg$currPos;
			s1 = peg$parsediscriminator();
			if (s1 !== peg$FAILED) {
				s2 = peg$parsestrike();
				if (s2 === peg$FAILED) {
					s2 = null;
				}
				if (s2 !== peg$FAILED) {
					s3 = peg$parsecolumn();
					if (s3 !== peg$FAILED) {
						s4 = peg$parserow();
						if (s4 !== peg$FAILED) {
							s1 = [s1, s2, s3, s4];
							s0 = s1;
						} else {
							peg$currPos = s0;
							s0 = peg$FAILED;
						}
					} else {
						peg$currPos = s0;
						s0 = peg$FAILED;
					}
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parsemoveEllipse() {
			var s0, s1, s2, s3;

			s0 = peg$currPos;
			s1 = peg$parseinteger();
			if (s1 !== peg$FAILED) {
				s2 = [];
				if (input.charCodeAt(peg$currPos) === 46) {
					s3 = peg$c38;
					peg$currPos++;
				} else {
					s3 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c39); }
				}
				if (s3 !== peg$FAILED) {
					while (s3 !== peg$FAILED) {
						s2.push(s3);
						if (input.charCodeAt(peg$currPos) === 46) {
							s3 = peg$c38;
							peg$currPos++;
						} else {
							s3 = peg$FAILED;
							if (peg$silentFails === 0) { peg$fail(peg$c39); }
						}
					}
				} else {
					s2 = peg$FAILED;
				}
				if (s2 !== peg$FAILED) {
					peg$savedPos = s0;
					s1 = peg$c40(s1);
					s0 = s1;
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}

			return s0;
		}

		function peg$parsefigure() {
			var s0;

			if (peg$c140.test(input.charAt(peg$currPos))) {
				s0 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c141); }
			}

			return s0;
		}

		function peg$parsecolumn() {
			var s0;

			if (peg$c142.test(input.charAt(peg$currPos))) {
				s0 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c143); }
			}

			return s0;
		}

		function peg$parserow() {
			var s0;

			if (peg$c144.test(input.charAt(peg$currPos))) {
				s0 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c145); }
			}

			return s0;
		}

		function peg$parsestrike() {
			var s0;

			if (input.charCodeAt(peg$currPos) === 120) {
				s0 = peg$c146;
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c147); }
			}

			return s0;
		}

		function peg$parsestrikeOrDash() {
			var s0;

			if (input.charCodeAt(peg$currPos) === 120) {
				s0 = peg$c146;
				peg$currPos++;
			} else {
				s0 = peg$FAILED;
				if (peg$silentFails === 0) { peg$fail(peg$c147); }
			}
			if (s0 === peg$FAILED) {
				if (input.charCodeAt(peg$currPos) === 45) {
					s0 = peg$c148;
					peg$currPos++;
				} else {
					s0 = peg$FAILED;
					if (peg$silentFails === 0) { peg$fail(peg$c149); }
				}
			}

			return s0;
		}


				function makeInteger(o) {
						return parseInt(o.join(""), 10);
				}


		peg$result = peg$startRuleFunction();

		if (peg$result !== peg$FAILED && peg$currPos === input.length) {
			return peg$result;
		} else {
			if (peg$result !== peg$FAILED && peg$currPos < input.length) {
				peg$fail(peg$endExpectation());
			}

			throw peg$buildStructuredError(
				peg$maxFailExpected,
				peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
				peg$maxFailPos < input.length
					? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
					: peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
			);
		}
	}

	PGN.pegParse = peg$parse;

})();
