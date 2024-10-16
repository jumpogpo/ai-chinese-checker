<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Fireworks } from '@fireworks-js/svelte';
	import type { FireworksOptions } from '@fireworks-js/svelte';
	import ChineseCheckerGameLogic from '$lib/utils/game-logic';
	import { onDestroy } from 'svelte';
	export let data;

	let gameLogic = new ChineseCheckerGameLogic(false, Number(data.player));
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

	const unsubscribeBoardStore = gameLogic.boardStore.subscribe((value: any) => {
		board = value; // จะอัปเดตเมื่อมีการเปลี่ยนแปลง
	});

	onDestroy(() => {
		unsubscribeIsMove();
		unsubscribePlayerWin();
		unsubscribeGameState();
		unsubscribeBoardStore();
	});

	let fw: Fireworks;
	const options: FireworksOptions = {
		opacity: 0.5,
		particles: 100
	};

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
<section class="flex justify-between min-h-screen max-w-7xl mx-auto z-20">
	<div class="flex flex-col justify-center">
		<button
			class="px-3 py-3 bg-red-500/20 text-red-500 text-6xl rounded-full"
			class:opacity-20={!isMoveValue}
			disabled={!isMoveValue}
			on:click={async () => {
				gameLogic.cancel();
				board = [...gameLogic.board];
			}}
		>
			<Icon icon="material-symbols:cancel-outline" />
		</button>
	</div>
	<div class="flex flex-col justify-center items-center space-y-10">
		<div class="board">
			{#each board as cell, x}
				<div class="col">
					<!-- {cell}  -->
					{#each cell as row, y}
						<button
							class:void={row != -1}
							class:hole={row == 0}
							class:player1={row == 1}
							class:player2={row == 2}
							class:player3={row == 3}
							class:player4={row == 4}
							class:player5={row == 5}
							class:player6={row == 6}
							class:showplayer1={gameState == 1 && row == 1}
							class:showplayer2={gameState == 2 && row == 2}
							class:showplayer3={gameState == 3 && row == 3}
							class:showplayer4={gameState == 4 && row == 4}
							class:showplayer5={gameState == 5 && row == 5}
							class:showplayer6={gameState == 6 && row == 6}
							class:clickable={gameLogic.clickable(cell)}
							class:selected={x == gameLogic.selected[0] && y == gameLogic.selected[1]}
							class:canwalk={row == 7 || row == 8}
							on:click={() => handleClick(x, y)}
						/>
					{/each}
				</div>
			{/each}
		</div>
		<p
			class:hidden={playerWinValue == 0}
			class="text-2xl font-black text-emerald-500 absolute bottom-0"
		>
			😍 {gameState === 1
				? 'Red'
				: gameState === 2
					? 'Green'
					: gameState === 3
						? 'Blue'
						: gameState === 4
							? 'Yellow'
							: gameState === 5
								? 'Pink'
								: gameState === 6
									? 'Purple'
									: ''} WIN !!
		</p>

		<div
			class="text-3xl px-6 py-1 rounded-xl font-bold"
			class:text-red-500={gameState === 1}
			class:text-green-500={gameState === 2}
			class:text-blue-500={gameState === 3}
			class:text-yellow-500={gameState === 4}
			class:text-pink-500={gameState === 5}
			class:text-purple-500={gameState === 6}
		>
			Turn: {gameState === 1
				? 'Red'
				: gameState === 2
					? 'Green'
					: gameState === 3
						? 'Blue'
						: gameState === 4
							? 'Yellow'
							: gameState === 5
								? 'Pink'
								: gameState === 6
									? 'Purple'
									: ''}
		</div>

	</div>
	<div class="flex flex-col justify-center">
		<button
			class="px-3 py-3 bg-green-500/20 text-green-500 text-6xl rounded-full"
			class:opacity-20={!isMoveValue}
			disabled={!isMoveValue}
			on:click={async () => {
				isMoveValue = false;
				await gameLogic.submit();
				board = [...gameLogic.board];
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
		@apply flex justify-center space-x-2 mb-2;
	}
	.void {
		@apply w-10 h-10 rounded-full opacity-30;
	}
	.hole {
		@apply bg-white;
	}
	.player1 {
		@apply bg-red-500 text-red-500;
	}
	.player2 {
		@apply bg-green-500 text-green-500;
	}
	.player3 {
		@apply bg-blue-500 text-blue-500;
	}
	.player4 {
		@apply bg-yellow-300 text-yellow-500;
	}
	.player5 {
		@apply bg-pink-400 text-pink-500;
	}
	.player6 {
		@apply bg-purple-500 text-purple-500;
	}
	.canwalk {
		@apply bg-white border-4 border-primary-500/70 border-dashed;
	}
	.showplayer1 {
		@apply opacity-100 scale-110 border-2 border-black/20;
	}
	.showplayer2 {
		@apply opacity-100 scale-110 border-2 border-black/20;
	}
	.showplayer3 {
		@apply opacity-100 scale-110 border-2 border-black/20;
	}
	.showplayer4 {
		@apply opacity-100 scale-110 border-2 border-black/20;
	}
	.showplayer5 {
		@apply opacity-100 scale-110 border-2 border-black/20;
	}
	.showplayer6 {
		@apply opacity-100 scale-110 border-2 border-black/20;
	}
</style>
