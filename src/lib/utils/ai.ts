import ChineseCheckerGameLogic from './game-logic';

interface Move {
    action: string;
    score: number;
    next: number[][];
}

interface MoveResult {
    path: number[][];
    v: number;
}

interface GameState {
    snapshot: number[][];
    depth: number;
}

export default class AI {
    public getMovingPath(player: number, ev: GameState): MoveResult {
        const { snapshot, depth } = ev;
        const legalMoves: Record<string, number[][]> = this.getLegalMoves(snapshot, player);
        const queue: Move[] = [];
        let startDepth = depth - 2;
        let v = player === 1 ? -Infinity : Infinity;

        for (const move in legalMoves) {
            const child = this.step(snapshot, move);
            queue.push({ action: move, score: 0, next: child });
        }

        while (queue.length > 1) {
            v = player === 1 ? -Infinity : Infinity;

            for (let i = 0; i < queue.length; i++) {
                const el = queue.shift();

                if (el) {
                    const curV = this.alphabeta(7 - player, el.next, v, 1000, startDepth, 1);
                    if (player === 1 && curV > v) v = curV;
                    if (player === 6 && curV < v) v = curV;
                    el.score = curV;
                    queue.push(el);
                }
            }

            queue.sort((a, b) => player === 1 ? b.score - a.score : a.score - b.score);

            if (startDepth === depth) break;
            queue.splice(Math.round(queue.length / (2 * depth)) + 1);
            startDepth += 2;
        }

        const candidates: string[] = [];

        for (const el of queue) {
            if (el.score === v) candidates.push(el.action);
            else break;
        }

        const move = candidates[Math.floor(Math.random() * candidates.length)];
        console.log(legalMoves[move]);
        return { path: legalMoves[move], v };
    }

    private alphabeta(player: number, state: number[][], a: number, b: number, depth: number, dug: number): number {
        const result = AI.checkEnd(state);
        const end = result.player1 || result.player2;
        if (depth === 0 || (player === 6 && end)) return this.score(state);

        const legalMoves = this.getLegalMoves(state, player);
        const queue: Move[] = [];

        for (const move in legalMoves) {
            const child = this.step(state, move);
            queue.push({ action: move, score: this.score(child), next: child });
        }

        queue.sort((a, b) => player === 1 ? b.score - a.score : a.score - b.score);
        queue.splice(Math.round(queue.length / (2 ** dug)) + 1);
        let v = player === 1 ? -Infinity : Infinity;

        for (const el of queue) {
            const score = this.alphabeta(7 - player, el.next, a, b, depth - 1, dug + 1);

            if (player === 1) {
                v = Math.max(v, score);
                a = Math.max(a, v);
                if (v >= b) return v;
            } else {
                v = Math.min(v, score);
                b = Math.min(b, v);
                if (v <= a) return v;
            }
        }

        return v;
    }

    public static checkEnd(state: number[][]): { player1: number; player2: number } {
        const result = { player1: 1, player2: 1 };

        for (let i = 0; i < 17; i++) {
            for (let j = 0; j < 17; j++) {
                if (i < 4 && state[i][j] !== -1 && state[i][j] !== 6) {
                    result.player2 = 0;
                }
                if (i > 12 && state[i][j] !== -1 && state[i][j] !== 1) {
                    result.player1 = 0;
                }
            }
        }
        return result;
    }

    private getLegalMoves(state: number[][], player: number): Record<string, number[][]> {
        const moves: Record<string, number[][]> = {};
        for (let i = 0; i < 17; i++) {
            for (let j = 0; j < 17; j++) {
                if (state[i][j] === player) {
                    Object.assign(moves, this.getMovesForOne(state, i, j));
                }
            }
        }
        return moves;
    }

    private step(state: number[][], move: string): number[][] {
        const newState: number[][] = Array.from({ length: 17 }, () => Array(17).fill(0));
        AI.copy(state, newState);
        const [pickX, pickY, destX, destY] = move.split(',').map(Number);
        const temp = state[pickX][pickY];
        newState[pickX][pickY] = 0;
        newState[destX][destY] = temp;
        return newState;
    }

    public static copy(from: number[][], to: number[][]): void {
        for (let i = 0; i < ChineseCheckerGameLogic.rows; i++) {
            for (let j = 0; j < ChineseCheckerGameLogic.cols; j++) {
                to[i][j] = from[i][j];
            }
        }
    }

    private getMovesForOne(state: number[][], i: number, j: number): Record<string, number[][]> {
        const temp = state[i][j];
        state[i][j] = 0;
        const paths: Record<string, number[][]> = {};
        const aiNextResult = AI.getNext(state, i, j, true);
        const crawls = aiNextResult.crawls;
        let jumps = aiNextResult.jumps;

        for (const move of crawls.concat(jumps)) {
            const key = `${i},${j},${move[0]},${move[1]}`;
            paths[key] = [[i, j], move];
        }

        let nextJumps: number[][] = [];

        while (jumps.length !== 0) {
            for (const jump of jumps) {
                const nextJumpsForOne = AI.getNext(state, jump[0], jump[1], false).jumps;
                for (const nextJump of nextJumpsForOne) {
                    const key = `${i},${j},${nextJump[0]},${nextJump[1]}`;
                    if (!(nextJump[0] === i && nextJump[1] === j) && paths[key] === undefined) {
                        nextJumps.push(nextJump);
                        const jumpKey = `${i},${j},${jump[0]},${jump[1]}`;
                        paths[key] = paths[jumpKey].concat([nextJump]);
                    }
                }
            }

            jumps = nextJumps;
            nextJumps = [];
        }
        state[i][j] = temp;
        return paths;
    }

    public static getNext(state: number[][], x: number, y: number, first: boolean): { crawls: number[][]; jumps: number[][] } {
        const allDir = [
            [-1, -1],
            [-1, 1],
            [0, -2],
            [0, 2],
            [1, -1],
            [1, 1]
        ];
        const crawls: number[][] = [];
        const jumps: number[][] = [];
        for (const dir of allDir) {
            const [dirX, dirY] = dir;
            const neiX = x + dirX;
            const neiY = y + dirY;
            if (neiX > ChineseCheckerGameLogic.rows - 1 || neiX < 0 || neiY > ChineseCheckerGameLogic.cols - 1 || neiY < 0)
                continue;
            if (state[neiX][neiY] === 0 && first) {
                crawls.push([neiX, neiY]);
            } else if (state[neiX][neiY] > 0) {
                const jumpX = neiX + dirX;
                const jumpY = neiY + dirY;
                if (jumpX > ChineseCheckerGameLogic.rows - 1 || jumpX < 0 || jumpY > ChineseCheckerGameLogic.cols - 1 || jumpY < 0)
                    continue;

                if (state[jumpX][jumpY] === 0) jumps.push([jumpX, jumpY]);
            }
        }
        return { crawls, jumps };
    }

    private score(state: number[][]): number {
        const playerStatus: [number, number][] = [];
        const opponentStatus: [number, number][] = [];

        for (let i = 0; i < 17; i++) {
            for (let j = 0; j < 17; j++) {
                if (state[i][j] === 1) {
                    playerStatus.push([i, j]);
                } else if (state[i][j] === 6) {
                    opponentStatus.push([i, j]);
                }
            }
        }

        let playerVerticalCount = -20;
        let opponentVerticalCount = -20;
        let playerHorizontalCount = 0;
        let opponentHorizontalCount = 0;

        for (const position of playerStatus) {
            playerVerticalCount += position[0];
            playerHorizontalCount += Math.abs(Math.abs(position[1] - 8) / 2 - 1);
        }

        for (const position of opponentStatus) {
            opponentVerticalCount += position[0];
            opponentHorizontalCount += Math.abs(Math.abs(position[1] - 8) / 2 - 1);
        }

        const heuristic =
            playerVerticalCount +
            opponentVerticalCount +
            (opponentHorizontalCount - playerHorizontalCount) / 2;

        return heuristic;
    }
}