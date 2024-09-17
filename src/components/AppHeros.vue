<template>
	<section class="relative">
		<!-- Background image -->
		<div class="absolute inset-0 z-0">
			<img 
                src="../assets/images/hero.webp" 
                alt="Buses" 
                class="w-full h-full object-cover justify-center"    
            />
			<div class="absolute inset-0 bg-black bg-opacity-30"></div>
		</div>

		<!-- Content -->
		<div class="relative z-10 px-4 py-16 h-full">
			<h1 class="text-4xl text-center capitalize md:text-start font-bold text-white mb-8">
				navigate roads with comfort
			</h1>

			<!-- Search form -->
			<div class="bg-white my-4 rounded-lg shadow-lg p-6 md:w-full">
				<form @submit.prevent="handleSearch">
					<div class="grid grid-cols-1 md:grid-cols-5 gap-6">
						<div>
							<label for="from" class="block text-sm font-semibold capitalize text-gray-700">
                                from
                            </label>
							<input
								type="text"
								id="locationFrom"
								v-model="searchParams.from"
								placeholder="Nairobi"
								class="mt-1 block w-full px-4 py-1 rounded-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
						</div>
						<div>
							<label for="to" class="block text-sm capitalize font-semibold text-gray-700">
                                to
                            </label>
							<input
								type="text"
								id="to"
								v-model="searchParams.to"
								placeholder="Mombasa"
								class="mt-1 block w-full px-4 py-1 rounded-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-100"
							/>
						</div>
						<div>
							<label for="departure" class="block text-sm font-semibold capitalize text-gray-700">
                                departure
                            </label>
							<input
								type="date"
								id="departure"
								v-model="searchParams.departure"
								class="mt-1 block w-full px-4 py-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
						</div>
						<div>
							<label for="passengers" class="block text-sm font-semibold capitalize text-gray-700">
                                passengers
                            </label>
							<select
								id="passengers"
								v-model="searchParams.passengers"
								class="mt-1 block w-full rounded-md px-4 py-1 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							>
								<option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>




						<div class="flex items-end">
							<button
								type="submit"
								class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							>
								Search →
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</section>
</template>

<script setup>
	import { ref } from 'vue';

	const searchParams = ref({
		from: '',
		to: '',
		departure: '',
		passengers: 1,
	});

	const handleSearch = () => {
		// Implement search logic here
		console.log('Search params:', searchParams.value);
    };


</script>
