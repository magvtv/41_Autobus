<template>
	<section class="relative bg-cover bg-center h-screen flex items-center justify center" :style="backgroundStyle">
		<div class="absolute inset-0 bg-black opacity-40">
			<div class="relative z-10 text-center text-white max-w-3xl px-4">
				<h1 class="text-4xl font-bold p-2 capitalize mb-6">
					navigate the roads with comfort
				</h1>
				<form action=""
					class="flex flex-col md:flex-row bg-green-300 justify-evenly items-center space-y-4 md:space-y-0 md:space-x-4">
					<div class="flex items-center bg-white p-2 rounded-md shadow-md">
						<!-- <box-icon name='current-location' class="w-8 h-8 text-red-400"></box-icon> -->
						<input type="text" placeholder="From" class="flex-1 p-2 text-gray-700 rounded-l-md">
					</div>

					<div class="flex items-center bg-white p-2 rounded-md shadow-md">
						<!-- <box-icon class="w-8 h-8" name='current-location'></box-icon> -->
						<input type="text" placeholder="To" class="flex-1 p-2 text-gray-700 rounded-l-md">
					</div>

					<div class="flex items-center bg-white p-2 rounded-md shadow-md">
						<input type="date" placeholder="To" class="flex-1 p-2 text-gray-700 rounded-l-md">
					</div>

					<button class="bg-gray-300 text-white capitalize px-4 py-2 rounded-md shadow-md">
						search
					</button>
				</form>
			</div>
		</div>
	</section>
</template>

<script>

import { ref, computed } from 'vue';

export default {
	name: 'AppHero',
	setup() {
		const backgroundImage = ref('../assets/images/hero.webp');
		const backgroundStyle = ref({
			backgroundImage: `url(${backgroundImage.value})`
		});

		const isRoundTrip = ref(true);
		const adultCount = ref(1);
		const childrenCount = ref(1);


		const totalPassengers = computed(() => adultCount.value + childrenCount.value);

		const toggleRoundTrip = () => {
			isRoundTrip.value = !isRoundTrip.value
		}

		const incrementAdults = () => {
			adultCount.value += 1
		}

		const incrementChildren = () => {
			childrenCount.value += 1
		}

		const decrementAdults = () => {
			if (adultCount.value > 1) {
				adultCount.value -= 1
			}
		}

		const decrementChildren = () => {
			if (childrenCount.value > 0) {
				childrenCount.value -= 1
			}
		}

		return {
			backgroundStyle,
			isRoundTrip,
			toggleRoundTrip,
			adultCount,
			incrementAdults,
			decrementAdults,
			childrenCount,
			incrementChildren,
			decrementChildren,
			totalPassengers
		};
	}
}

</script>