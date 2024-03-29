
let pgn = `[White "User"]
[Black "AI:1"]

1. e4 d5 2. Nf3 dxe4 3. Ne5 Nc6 4. Nxc6 bxc6 5. d4 Qd5 6. Nc3 Qa5 7. Bd2 Qb4 8. Nxe4 Qxb2 9. Bc3 Qa3 10. Bc4 h5 11. Qf3 f6 12. Ng5 Bd7 13. Nf7 Rh7 14. Ng5 Rh8 15. Bb5 Qd6`;
// let pgn = `[Event "Reykjavik WCh"]
// [Site "Reykjavik WCh"]
// [Date "1972.07.11"]
// [EventDate "?"]
// [Round "1"]
// [Result "1-0"]
// [White "Boris Spassky"]
// [Black "Robert James Fischer"]
// [ECO "E56"]
// [WhiteElo "?"]
// [BlackElo "?"]
// [PlyCount "111"]

// 1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Bb4 5. e3 O-O 6. Bd3 c5
// 7. O-O Nc6 8. a3 Ba5 9. Ne2 dxc4 10. Bxc4 Bb6 11. dxc5 Qxd1
// 12. Rxd1 Bxc5 13. b4 Be7 14. Bb2 Bd7 15. Rac1 Rfd8 16. Ned4
// Nxd4 17. Nxd4 Ba4 18. Bb3 Bxb3 19. Nxb3 Rxd1+ 20. Rxd1 Rc8
// 21. Kf1 Kf8 22. Ke2 Ne4 23. Rc1 Rxc1 24. Bxc1 f6 25. Na5 Nd6
// 26. Kd3 Bd8 27. Nc4 Bc7 28. Nxd6 Bxd6 29. b5 Bxh2 30. g3 h5
// 31. Ke2 h4 32. Kf3 Ke7 33. Kg2 hxg3 34. fxg3 Bxg3 35. Kxg3 Kd6
// 36. a4 Kd5 37. Ba3 Ke4 38. Bc5 a6 39. b6 f5 40. Kh4 f4
// 41. exf4 Kxf4 42. Kh5 Kf5 43. Be3 Ke4 44. Bf2 Kf5 45. Bh4 e5
// 46. Bg5 e4 47. Be3 Kf6 48. Kg4 Ke5 49. Kg5 Kd5 50. Kf5 a5
// 51. Bf2 g5 52. Kxg5 Kc4 53. Kf5 Kb4 54. Kxe4 Kxa4 55. Kd5 Kb5
// 56. Kd6 1-0`;


let Test = {
	init() {
		return;
		setTimeout(() => chess.els.content.find(`.opt-opponents .icon-cpu`).trigger("click"), 200);
		return setTimeout(this.gameFromPgn, 300);
		return;
		setTimeout(() => chess.els.content.find(`.opt-opponents .icon-user`).trigger("click"), 100);
		// setTimeout(() => chess.els.content.find(`.opt-difficulty span:nth-child(2)`).trigger("click"), 150);

		// return;

		setTimeout(() => {
			// chess.els.content.find(`.pos-b2`).trigger("click");
			// chess.els.content.find(`.pos-b4`).trigger("click");
			chess.els.content.find(`.pos-b1`).trigger("click");
			chess.els.content.find(`.pos-c3`).trigger("click");
		}, 300);

		// setTimeout(() => chess.dispatch({ type: "undo-move" }), 500);

		return;
		setTimeout(() => chess.els.content.find(`.opt-opponents .icon-cpu`).trigger("click"), 200);

		// setTimeout(() => chess.els.content.find(`.move-history .move:nth(92)`).trigger("click"), 500);
	},
	gameFromPgn() {
		chess.dispatch({ type: "game-from-pgn", pgn });
	},
	gameFromFen() {
		// let arg = `N3R3/2Qp4/k7/6bp/8/8/PPP2PPP/R5K1 w - - 3 28`;
		let arg = `r3kbnr/ppp1pppp/6n1/6Q1/8/8/PPPB1PPP/RN2KBNR b KQkq - 3 8`;
		// let arg = `rnbqk2r/pppp1ppp/5n2/4p3/1b1P4/2N1P3/PPPB1PPP/R2QKBNR b KQkq - 3 4`;
		chess.dispatch({ type: "load-fen-game", opponent: "User", arg });
	}
};

// DEV-ONLY-START
Test.init();
// DEV-ONLY-END
