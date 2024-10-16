<script>
	import { goto } from '$app/navigation'; // นำเข้า goto

	function SINGLE() {
		goto('/ai'); // นำทางไปยังหน้า /human
	}

	function MULTIPLAYER() {
		goto('/human'); // นำทางไปยังหน้า /human
	}
	function HOWTOPLAY(){
		goto('/how-to-play');
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-[#FDBA74]">
	<h1 class="text-6xl font-bold mb-28 text-white">CHINESE CHECKERS GAMES</h1>
	<div class="flex items-center justify-center">
		<div class="relative">
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src="/tv.png" alt="TV Image" class="w-[500px] md:w-[1000px] h-auto shadow-lg" />
		</div>
		<div class="flex flex-col space-y-20 px-20 items-center justify-center py-8 text-2xl">
			<button class="px-14 py-10 bg-white rounded-md shadow hover:bg-gray-100"
				on:click={SINGLE}
				>SINGLE PLAYER MODE</button
			>
			<button class="px-16 py-10 bg-white rounded-md shadow hover:bg-gray-100"
				on:click={MULTIPLAYER}
				>MULTIPLAYER MODE</button
			>
			<button class="px-24 py-10 bg-white rounded-md shadow hover:bg-gray-100"
				on:click={HOWTOPLAY}
				>HOW TO PLAY</button
			>
		</div>
	</div>
</div>
