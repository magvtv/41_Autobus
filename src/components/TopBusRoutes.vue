<template>
	<section class="my-5 p-8">
		<h2 class="text-2xl font-bold capitalize mb-6 pl-2">
            top bus routes this {{ currentMonth }}
        </h2>

		<div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
			<div
				v-for="route in busRoutes"
				:key="route.id"
				class="p-4 bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl hover:transition-shadow duration-500 ease-in-out cursor-pointer"
			>
				<img src="@/assets/images/hero.webp" alt="route image" class="w-full h-40 object-cover rounded-lg" />
				<div class="p-4">
					<h3 class="text-lg font-semibold capitalize">
						{{ route.routeName }}
					</h3>
					<p class="text-gray-600 capitalize">
						{{ route.busType }}
					</p>
					<p class="mt-2 font-bold capitalize text-blue-400">
                        starting from {{ route.price }}
                    </p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import busRoutesData from '@/assets/content/BusRoutes.json';

	const currentMonth = ref('');
	const busRoutes = ref([]);

	// Set busRoutes data
	busRoutes.value = busRoutesData;

	// Use onMounted lifecycle hook to set the data
	onMounted(() => {
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];

		// Get the current month
		const currentDate = new Date();
		currentMonth.value = monthNames[currentDate.getMonth()];
	});
</script>

<!-- <script>

import { ref, onMounted } from "vue";
import busRoutesData from '@/assets/content/BusRoutes.json'

export default {
	name: 'TopBusRoutes',

	setup() {
		const currentMonth = ref("");
		const busRoutes = ref([])


		onMounted(() => {
			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];
			busRoutes.value = busRoutesData
			const currentDate = new Date();
			currentMonth.value = monthNames[currentDate.getMonth()];
		});

		return {
			currentMonth,
			busRoutes
		};
	},
};

</script> -->
