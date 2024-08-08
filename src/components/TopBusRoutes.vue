<template>
	<section class="my-8">
		<h2 class="text-2xl font-bold capitalize mb-4">
			top bus routes this {{ currentMonth }}
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			<div v-for="route in busRoutes" :key="route.id"
				class="bg-white shadow-md rounded-lg overflow-hidden md:mx-2">
				<img :src="route.image" alt="route image" class="w-full h-48 object-cover">
				<div class="p-5">
					<h3 class="text-lg font-semibold capitalize">
						{{ route.routeName }}
					</h3>
					<p class="text-gray-600 capitalize">
						{{ route.busType }}
					</p>
					<p class="mt-2 font-bold capitalize text-red-400">
						starting from {{ route.price }}
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
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
</script>
