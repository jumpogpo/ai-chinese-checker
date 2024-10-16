<script lang="ts">
    import Icon from '@iconify/svelte';
</script>
<div class="mx-auto w-full text-white text-center">
    <div class="relative isolate bg-[#FDBA74] h-full">
        <center>
            <div class="flex flex-col px-96 text-black">
                <div class="p-5 py-8">
                    <h1 class="text-6xl font-bold text-white">HOW TO PLAY</h1>
                </div>
                <div class="p-2">
                    <img src="../src/lib/images/howto-walk-1.png"  alt="home" class="object-cover w-[350px] rounded-lg">
                    <div class="font-semibold p-10">
                        <h1 class="text-2xl bg-yellow-100 p-5 px-5 rounded-2xl">1. ผู้เล่นสามารถเคลื่อนหมากของตนหนึ่งช่องในทิศทางใดก็ได้ (ขึ้น, ลง, ซ้าย, ขวา, ทะแยงมุม)</h1>
                    </div>
                </div>

                <div class="p-2">
                    <img src="../src/lib/images/howto-walk-2.png"  alt="home" class="object-cover w-[350px] rounded-lg">
                    <div class="font-semibold p-10">
                        <h3 class="text-2xl bg-yellow-100 p-5 px-5 rounded-2xl">2. ผู้เล่นสามารถกระโดดข้ามหมากของตนเองหรือของผู้เล่นคนอื่นได้หากมีช่องว่างหนึ่งช่องหลังหมากนั้น<br>การกระโดดสามารถทำได้หลายครั้งในตาเดียวถ้าหากมีหมากและช่องว่างที่เหมาะสม </h3>
                    </div>
                </div>
                <div class="p-4">
                    <Icon icon="material-symbols:cancel-outline" width="100px" height="100px" style="color: red;" />
                    <div class="font-semibold p-8">
                        <h3 class="text-2xl bg-yellow-100 p-5 px-5 rounded-2xl">3. ผู้เล่นสามารถกดปุ่มยกเลิกการเดินได้ถ้าต้องการ</h3>
                    </div>

                </div>
                <div class="p-4">
                    <Icon icon="material-symbols:check" width="100px" height="100px" style="color: green;" />
                    <div class="font-semibold p-8">
                        <h3 class="text-2xl bg-yellow-100 p-5 px-5 rounded-2xl">4. ผู้เล่นสามารถกดปุ่มเครื่องหมายถูกเพื่อบอกว่าเป็นการจบตานั้น ให้ผู้เล่นถัดไปได้เริ่มเล่น</h3>
                    </div>
                </div>
                <div class="p-4">
                    <Icon icon="octicon:light-bulb-24"width="100px" height="100px" style="color: yellow;" />
                    <div class="font-semibold p-8">
                        <h3 class="text-2xl bg-yellow-100 p-5 px-5 rounded-2xl">5. ผู้เล่นสามารถกดปุ่มนี้ได้ถ้าต้องการตัวช่วยในการเลือกทางเดิน</h3>
                    </div>
                </div>
            </div>
        </center>
    </div>
</div>