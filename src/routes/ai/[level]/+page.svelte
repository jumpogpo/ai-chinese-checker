<script lang="ts">
	export let data: { level: number };
	import Icon from '@iconify/svelte';
	import { Fireworks } from '@fireworks-js/svelte';
	import type { FireworksOptions } from '@fireworks-js/svelte';

	import { onDestroy } from 'svelte';
	import ChineseCheckerGameLogic from '$lib/utils/game-logic';

	let fw: Fireworks;
	let disabledHint: boolean = false;

	const gameLogic = new ChineseCheckerGameLogic(true);
	const options: FireworksOptions = {
		opacity: 0.5,
		particles: 100
	};

	gameLogic.setDepth(data.level);

	let board: any;
	let isMoveValue: boolean;
	let playerWinValue: number = 1;
	let gameState: number;

	const unsubscribeIsMove = gameLogic.isMove.subscribe((value) => {
		isMoveValue = value;
	});

	const unsubscribeGameState = gameLogic.gameState.subscribe((value) => {
		gameState = value;
	});

	const unsubscribePlayerWin = gameLogic.playerWin.subscribe((value) => {
		playerWinValue = value;
	});

	const unsubscribe = gameLogic.boardStore.subscribe((value: any) => {
		board = value; // จะอัปเดตเมื่อมีการเปลี่ยนแปลง
	});

	onDestroy(() => {
		unsubscribe();
		unsubscribeIsMove();
		unsubscribePlayerWin();
		unsubscribeGameState();
	});

	function handleClick(x: number, y: number) {
		gameLogic.clickHole(x, y, true);
	}
	$: if (playerWinValue != 0) {
		showFireWork();
	}
	function showFireWork() {
		const fireworks = fw.fireworksInstance();
		fireworks.start();
	}
</script>

<div class="h-screen fixed w-screen" class:hidden={playerWinValue == 0}>
	<Fireworks bind:this={fw} autostart={false} {options} class="h-screen fixed w-screen" />
</div>

<div class="h-screen fixed w-screen" class:hidden={playerWinValue == 0}>
	<Fireworks bind:this={fw} autostart={false} {options} class="h-screen fixed w-screen" />
</div>
<section class="flex md:justify-between justify-center min-h-screen max-w-7xl mx-auto">
	<div class="md:flex hidden flex-col justify-center">
		<button
			class="px-3 py-3 bg-red-500/20 text-red-500 text-6xl rounded-full"
			class:opacity-20={!isMoveValue}
			disabled={!isMoveValue}
			on:click={async () => {
				gameLogic.cancel();
				board = [...gameLogic.board];
				await gameLogic.getHint();
			}}
		>
			<Icon icon="material-symbols:cancel-outline" />
		</button>
	</div>
	<div class="flex flex-col justify-center items-center space-y-10 relative">
		<div class="board">
			{#each board as cell, x}
				<div class="col">
					<!-- {cell} -->
					{#each cell as row, y}
						<button
							class:void={row != -1}
							class:hole={row == 0}
							class:player1={row == 1}
							class:player6={row == 6}
							class:clickable={gameLogic.clickable(cell)}
							class:selected={x == gameLogic.selected[0] && y == gameLogic.selected[1]}
							class:canwalk={row == 7 || row == 8}
							class:hintSelect={row == 9}
							class:hintcanwalk={row == 10}
							on:click={() => handleClick(x, y)}
						/>
					{/each}
				</div>
			{/each}
		</div>

		<h1 class="text-3xl font-bold {gameState == 6 ? 'text-purple-500' : 'text-red-500'}">
			{gameState == 6 ? 'Your Turn: 👨' : "Bot's Turn: 🤖"}
		</h1>

		<div class="flex space-y-5 items-end">
			<button
				class="px-3 py-3 bg-red-500/20 text-red-500 text-6xl rounded-full md:hidden block"
				class:opacity-20={!isMoveValue}
				disabled={!isMoveValue}
				on:click={async () => {
					gameLogic.cancel();
					board = [...gameLogic.board];
					await gameLogic.getHint();
				}}
			>
				<Icon icon="material-symbols:cancel-outline" />
			</button>
			<button
				class="px-3 py-3 bg-amber-500/20 text-amber-500 text-6xl rounded-full disabled:opacity-30"
				disabled={disabledHint}
				on:click={async () => {
					disabledHint = true;
					const hints = await gameLogic.getHint();
					if (hints) {
						board[hints?.[0][0]][hints?.[0][1]] = 9;
						for (const i in hints) {
							if (Number(i) > 0) {
								board[hints?.[i][0]][hints?.[i][1]] = 10;
							}
						}

						setTimeout(() => {
							board[hints?.[0][0]][hints?.[0][1]] = 6;

							for (const i in hints) {
								if (Number(i) > 0) {
									board[hints?.[i][0]][hints?.[i][1]] = 0;
								}
							}
						}, 3000);
					}
				}}
			>
				<Icon icon="octicon:light-bulb-24" />
			</button>
			<button
				class="px-3 py-3 bg-green-500/20 text-green-500 text-6xl rounded-full md:hidden block"
				class:opacity-20={!isMoveValue}
				disabled={!isMoveValue}
				on:click={async () => {
					isMoveValue = false;
					await gameLogic.submit();
					board = [...gameLogic.board];
					disabledHint = false;
				}}
			>
				<Icon icon="material-symbols:check" />
			</button>
		</div>
		<p
			class:hidden={playerWinValue == 0}
			class="text-2xl font-black text-emerald-500 absolute bottom-0"
		>
			😍 {playerWinValue == 1 ? 'AI' : 'Player'} WIN !!
		</p>
	</div>
	<div class="md:flex hidden flex-col justify-center">
		<button
			class="px-3 py-3 bg-green-500/20 text-green-500 text-6xl rounded-full"
			class:opacity-20={!isMoveValue}
			disabled={!isMoveValue}
			on:click={async () => {
				isMoveValue = false;
				await gameLogic.submit();
				board = [...gameLogic.board];
				disabledHint = false;
			}}
		>
			<Icon icon="material-symbols:check" />
		</button>
	</div>
</section>

<style>
	.board {
		@apply flex flex-col justify-center;
	}
	.col {
		@apply flex justify-center space-x-1;
	}
	.void {
		@apply w-10 h-10 rounded-full;
	}
	.hole {
		@apply void bg-white;
	}
	.player1 {
		@apply void bg-red-500 opacity-60;
	}
	.player6 {
		@apply void opacity-100 scale-110 border-2 border-black/20 bg-purple-500;
	}
	.hintSelect {
		@apply player6 scale-125 animate-pulse;
	}
	.hintcanwalk {
		@apply void bg-white/50 border-4 border-primary-500/70 border-dashed animate-pulse;
	}
	.canwalk {
		@apply void bg-white/50 border-4 border-primary-500/70 border-dashed;
	}
</style>
