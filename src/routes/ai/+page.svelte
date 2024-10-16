<script>
	import { goto } from '$app/navigation'; // นำเข้า goto สำหรับการนำทาง
	let selectedLevel = ''; // ตัวแปรเก็บค่าที่ผู้ใช้เลือก
	const levels = ['Easy', 'Medium', 'Hard']; // ตัวเลือกใน dropdown

	function handleSubmit() {
		if (selectedLevel) {
			goto(`/ai/${selectedLevel}`);
		} else {
			alert('กรุณาเลือกระดับก่อน');
		}
	}
	function back() {
		goto(`/`);
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-[#FDBA74] space-y-6">
	<div class="relative inline-block w-80">
		<select
			bind:value={selectedLevel}
			class="py-5 px-8 text-3xl text-center bg-white block w-full rounded-full border-0 pl-5 pr-5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-2xl sm:leading-8 appearance-none"
		>
			<option value="" disabled selected hidden>Please select the level</option>
			{#each levels as level}
				<option value={level.toLowerCase()}>{level}</option>
			{/each}
		</select>
		<div class="absolute inset-y-0 right-5 flex items-center pointer-events-none">
			<svg class="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</div>

	<!-- ปุ่มตกลง -->
	<div class="flex space-x-5 py-16">
		<div class="py-8">
			<button class="p-6 px-8 text-2xl bg-white rounded-full shadow-md" on:click={handleSubmit}>
				Next
			</button>
		</div>
		<div class="py-8">
			<button class="p-6 px-8 text-2xl bg-white rounded-full shadow-md" on:click={back}>Back</button>
		</div>
	</div>
</div>