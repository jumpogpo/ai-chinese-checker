import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import AI from './ai';

enum PlayersAmount {
	Two = 2,
	Three = 3,
	Four = 4,
	Six = 6
}

enum Level {
	Easy = 2,
	Medium = 6,
	Hard = 4
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class ChineseCheckerGameLogic {
	public board: number[][] = new Array(17);
	private snapshot: number[][] = new Array(17);

	public static rows: number = 17;
	public static cols: number = 17; // 17 or 25

	public selected: [number, number] = [0, 0];
	private depth: Level = Level.Easy; // 2, 4, 6
	private playersAmount: PlayersAmount = PlayersAmount.Two;
	private allPlayers: number[] = [];
	private agent: AI | null = null;
	private onChange: (() => void) | null = null;

	public boardStore: Writable<number[][]> = writable([]);
	public isMove = writable(false);
	public playerWin = writable(0);
	public gameState = writable(6);

	constructor(haveAI: boolean, playersAmount: PlayersAmount = 2) {
		if (haveAI) {
			ChineseCheckerGameLogic.cols = 17;
			this.gameState.set(6);
			this.agent = new AI();
			this.allPlayers = [1, 6];

			for (let i = 0; i < 17; i++) {
				this.board[i] = new Array(17).fill(0);
				this.snapshot[i] = new Array(17).fill(0);
			}

			for (let i = 0; i < 17; i++) {
				for (let j = 0; j < 17; j++) {
					if ((i + j) % 2 == 1 || Math.abs(i - 8) + Math.abs(j - 8) > 8) this.board[i][j] = -1;
					else if (i < 4) this.board[i][j] = 1;
					else if (i > 12) this.board[i][j] = 6;
				}
			}
		} else {
			if (!playersAmount) throw new Error('Players amount is required');

			ChineseCheckerGameLogic.cols = 25;
			this.board = [];
			this.playersAmount = playersAmount;

			for (let i = 0; i < ChineseCheckerGameLogic.rows; i++) {
				this.snapshot[i] = new Array(ChineseCheckerGameLogic.rows).fill(0);
				const row: number[] = new Array(ChineseCheckerGameLogic.cols).fill(-1);

				if (i === 0) {
					row[12] = 0; // Row 1
				} else if (i === 1) {
					row[11] = 0;
					row[13] = 0; // Row 2
				} else if (i === 2) {
					row[10] = 0;
					row[12] = 0;
					row[14] = 0; // Row 3
				} else if (i === 3) {
					row[9] = 0;
					row[11] = 0;
					row[13] = 0;
					row[15] = 0; // Row 4
				} else if (i === 4) {
					// Row 5 (odd positions)
					for (let j = 0; j < ChineseCheckerGameLogic.cols; j += 2) {
						row[j] = 0;
					}
				} else if (i === 5) {
					// Row 6 (even positions)
					for (let j = 1; j < ChineseCheckerGameLogic.cols; j += 2) {
						row[j] = 0;
					}
				} else if (i === 6) {
					// Row 7 (odd positions)
					for (let j = 2; j < ChineseCheckerGameLogic.cols - 2; j += 2) {
						row[j] = 0;
					}
				} else if (i === 7) {
					// Row 8 (even positions)
					for (let j = 3; j < ChineseCheckerGameLogic.cols - 3; j += 2) {
						row[j] = 0;
					}
				} else if (i === 8) {
					// Row 9 (odd positions)
					for (let j = 4; j < ChineseCheckerGameLogic.cols - 4; j += 2) {
						row[j] = 0;
					}
				} else if (i === 9) {
					// Row 10 (even positions)
					for (let j = 3; j < ChineseCheckerGameLogic.cols - 3; j += 2) {
						row[j] = 0;
					}
				} else if (i === 10) {
					// Row 11 (odd positions)
					for (let j = 2; j < ChineseCheckerGameLogic.cols - 2; j += 2) {
						row[j] = 0;
					}
				} else if (i === 11) {
					// Row 12 (even positions)
					for (let j = 1; j < ChineseCheckerGameLogic.cols; j += 2) {
						row[j] = 0;
					}
				} else if (i === 12) {
					// Row 13 (odd positions)
					for (let j = 0; j < ChineseCheckerGameLogic.cols; j += 2) {
						row[j] = 0;
					}
				} else if (i === 13) {
					row[9] = 0;
					row[11] = 0;
					row[13] = 0;
					row[15] = 0; // Row 14
				} else if (i === 14) {
					row[10] = 0;
					row[12] = 0;
					row[14] = 0; // Row 15
				} else if (i === 15) {
					row[11] = 0;
					row[13] = 0; // Row 16
				} else if (i === 16) {
					row[12] = 0; // Row 17
				}

				this.board.push(row);
			}

			this.setupZones();
			this.gameState.set(this.allPlayers[0]);
		}

		AI.copy(this.board, this.snapshot);

		this.boardStore = writable(this.board, (set) => {
			const updateBoard = () => set(this.board);
			this.onChange = updateBoard;

			return () => {
				this.onChange = null;
			};
		});
	}

	// Set the depth of the AI
	public setDepth(depth: Level): void {
		this.depth = depth;
	}

	// Check if the cell is clickable
	public clickable(cell: number): boolean {
		const isSpecialCell = cell === 7 || cell === 8;
		const isInitialSelection = cell === 6 && this.selected[0] === 0 && this.selected[1] === 0;
		return isSpecialCell || isInitialSelection;
	}

	// Clear the cells marked with 7 or 8
	public clearNext(): void {
		// Iterate through each cell in the board
		for (let row = 0; row < ChineseCheckerGameLogic.rows; row++) {
			for (let col = 0; col < ChineseCheckerGameLogic.cols; col++) {
				// Clear cells marked with 7 or 8
				if (this.board[row][col] === 7 || this.board[row][col] === 8) {
					this.board[row][col] = 0;
				}
			}
		}

		// Trigger the onChange callback if it exists
		if (this.onChange) {
			this.onChange();
		}
	}

	// Handle the click event on a cell
	public clickHole(x: number, y: number, isPlayer: boolean): void {
		const currentPlayer = get(this.gameState);
		const [selectedX, selectedY] = this.selected;
		const cellValue = this.board[x][y];

		// If the selected cell is the current player's piece and no piece is currently selected
		if (cellValue === currentPlayer && selectedX === 0 && selectedY === 0) {
			this.clearNext();
			this.selected = [x, y];
			this.drawNext(x, y, true);
		}
		// If the selected cell is a valid move (7)
		else if (cellValue === 7) {
			this.clearNext();
			this.board[selectedX][selectedY] = 0;
			this.board[x][y] = currentPlayer;
			this.selected = [x, y];
			this.checkWinner();

			if (isPlayer) this.isMove.set(true);
		}
		// If the selected cell is another valid move (8)
		else if (cellValue === 8) {
			this.clearNext();
			this.board[selectedX][selectedY] = 0;
			this.board[x][y] = currentPlayer;
			this.selected = [x, y];
			this.drawNext(x, y, false);
			this.checkWinner();

			if (isPlayer) this.isMove.set(true);
		}
	}

	// Cancel the current move
	public cancel(): void {
		this.selected = [0, 0];
		AI.copy(this.snapshot, this.board);
		this.isMove.set(false);
	}

	// Submit the current move
	public async submit(): Promise<void> {
		if (!get(this.isMove)) return;

		this.isMove.set(false);
		this.clearNext();
		this.selected = [0, 0];

		AI.copy(this.board, this.snapshot);

		// Find the index of the current game state and calculate the next index
		const currentIndex = this.allPlayers.indexOf(get(this.gameState));
		const nextIndex = (currentIndex + 1) % this.allPlayers.length;

		// Update the game state to the next player
		this.gameState.set(this.allPlayers[nextIndex]);

		// Get the best path for the AI move and execute it
		if (this.agent == null) return;
		const bestPath = this.agent.getMovingPath(1, { snapshot: this.board, depth: this.depth });
		await this.executeMoves(bestPath);
	}

	// Get a hint for the next move
	public async getHint(): Promise<number[][] | null> {
		if (this.agent == null) return null;

		const bestPath = this.agent.getMovingPath(get(this.gameState), {
			snapshot: this.board,
			depth: this.depth
		});

		return bestPath.path;
	}

	// Execute the moves of AI
	private async executeMoves(result: { path: number[][]; v: number }): Promise<void> {
		const { path } = result;

		for (const move of path) {
			this.clickHole(move[0], move[1], false);
			if (this.onChange) this.onChange();
			await sleep(300);
		}

		this.clearNext();
		this.selected = [0, 0];
		AI.copy(this.board, this.snapshot);

		const outcome: { player1: number; player2: number } = AI.checkEnd(this.board);

		if (outcome['player1'] && outcome['player2']) {
			this.gameState.set(5);
		} else if (outcome['player1']) {
			this.gameState.set(3);
		} else if (outcome['player2']) {
			this.gameState.set(4);
		} else {
			// Find the index of the current game state and calculate the next index
			const currentIndex = this.allPlayers.indexOf(get(this.gameState));
			const nextIndex = (currentIndex + 1) % this.allPlayers.length;

			// Update the game state to the next player
			this.gameState.set(this.allPlayers[nextIndex]);
		}
	}

	// Draw the next possible moves
	private drawNext(x: number, y: number, first: boolean) {
		const { crawls, jumps } = AI.getNext(this.board, x, y, first);

		for (const crawl of crawls) {
			this.board[crawl[0]][crawl[1]] = 7;
		}

		for (const jump of jumps) {
			this.board[jump[0]][jump[1]] = 8;
		}
	}

	// Setup the zones for each player
	private setupZones() {
		const zones = {
			1:
				this.playersAmount === PlayersAmount.Two || this.playersAmount === PlayersAmount.Six
					? [
							[0, 12],
							[1, 11],
							[1, 13],
							[2, 10],
							[2, 12],
							[2, 14],
							[3, 9],
							[3, 11],
							[3, 13],
							[3, 15]
						]
					: [],

			2:
				this.playersAmount === PlayersAmount.Three ||
				this.playersAmount === PlayersAmount.Four ||
				this.playersAmount === PlayersAmount.Six
					? [
							[4, 0],
							[4, 2],
							[4, 4],
							[4, 6],
							[5, 1],
							[5, 3],
							[5, 5],
							[6, 2],
							[6, 4],
							[7, 3]
						]
					: [],

			3:
				this.playersAmount === PlayersAmount.Three ||
				this.playersAmount === PlayersAmount.Four ||
				this.playersAmount === PlayersAmount.Six
					? [
							[4, 18],
							[4, 20],
							[4, 22],
							[4, 24],
							[5, 19],
							[5, 21],
							[5, 23],
							[6, 20],
							[6, 22],
							[7, 21]
						]
					: [],

			4:
				this.playersAmount === PlayersAmount.Four || this.playersAmount === PlayersAmount.Six
					? [
							[9, 3],
							[10, 2],
							[10, 4],
							[11, 1],
							[11, 3],
							[11, 5],
							[12, 0],
							[12, 2],
							[12, 4],
							[12, 6]
						]
					: [],

			5:
				this.playersAmount === PlayersAmount.Four || this.playersAmount === PlayersAmount.Six
					? [
							[9, 21],
							[10, 20],
							[10, 22],
							[11, 19],
							[11, 21],
							[11, 23],
							[12, 18],
							[12, 20],
							[12, 22],
							[12, 24]
						]
					: [],

			6:
				this.playersAmount === PlayersAmount.Two ||
				this.playersAmount === PlayersAmount.Three ||
				this.playersAmount === PlayersAmount.Six
					? [
							[13, 9],
							[13, 11],
							[13, 13],
							[13, 15],
							[14, 10],
							[14, 12],
							[14, 14],
							[15, 11],
							[15, 13],
							[16, 12]
						]
					: []
		};

		// Set up the board with the zones
		for (const [zoneNumber, positions] of Object.entries(zones)) {
			const zoneValue = parseInt(zoneNumber); // Convert zone number to integer

			if (positions.length > 0) {
				this.allPlayers.push(zoneValue); // Add active zone to allPlayers
			}

			for (const [row, col] of positions) {
				this.board[row][col] = zoneValue; // Set the board cell to the zone value
			}
		}
	}

	private checkWinner() {
		// Define the type for goalZones keys
		const goalZones: { [key in 1 | 2 | 3 | 4 | 5 | 6]: number[][] } = {
			1: [
				[13, 9],
				[13, 11],
				[13, 13],
				[13, 15],
				[14, 10],
				[14, 12],
				[14, 14],
				[15, 11],
				[15, 13],
				[16, 12]
			],
			2: [
				[9, 21],
				[10, 20],
				[10, 22],
				[11, 19],
				[11, 21],
				[11, 23],
				[12, 18],
				[12, 20],
				[12, 22],
				[12, 24]
			],
			3: [
				[9, 3],
				[10, 2],
				[10, 4],
				[11, 1],
				[11, 3],
				[11, 5],
				[12, 0],
				[12, 2],
				[12, 4],
				[12, 6]
			],
			4: [
				[4, 0],
				[4, 2],
				[4, 4],
				[4, 6],
				[5, 1],
				[5, 3],
				[5, 5],
				[6, 2],
				[6, 4],
				[7, 3]
			],
			5: [
				[4, 18],
				[4, 20],
				[4, 22],
				[4, 24],
				[5, 19],
				[5, 21],
				[5, 23],
				[6, 20],
				[6, 22],
				[7, 21]
			],
			6: [
				[0, 12],
				[1, 11],
				[1, 13],
				[2, 10],
				[2, 12],
				[2, 14],
				[3, 9],
				[3, 11],
				[3, 13],
				[3, 15]
			]
		};

		// If agent is not null, modify goalZones
		if (this.agent != null) {
			// If you want to override or add to goalZones when agent is not null
			// You can keep the existing ones or redefine as needed
			goalZones[1] = [
				[13, 5],
				[13, 7],
				[13, 9],
				[13, 11],
				[14, 6],
				[14, 8],
				[14, 10],
				[15, 7],
				[15, 9],
				[16, 8]
			];

			goalZones[6] = [
				[0, 8],
				[1, 7],
				[1, 9],
				[2, 6],
				[2, 8],
				[2, 10],
				[3, 5],
				[3, 7],
				[3, 9],
				[3, 11]
			];
		}

		// Check if each player's pieces occupy all positions in their goal zone
		for (const player of this.allPlayers) {
			if (player in goalZones) {
				// Add a type guard to ensure valid keys
				const zone = goalZones[player as 1 | 2 | 3 | 4 | 5 | 6];

				let isWinner = true;
				for (const [row, col] of zone) {
					if (this.board[row][col] !== player) {
						isWinner = false;
						break;
					}
				}

				if (isWinner) {
					this.playerWin.set(player);
					return player; // Return the winning player
				}
			}
		}

		return null; // No winner
	}
}
