<template>
	<section class="relative bg-cover bg-center h-screen">
		<div class="absolute inset-0 bg-black opacity-100">
			<div class="relative z-10 flex flex-col items-center justify-center h-full text-white" :style="{ backgroundImage: `url(${backgroundImage})` }">
				<h1 class="text-4xl font-bold capitalize p-2 mb-4">
					navigate the roads with comfort
				</h1>
				<form submit.prevent="handleSearch" action=""
					class="w-4/5 p-6 my-8 mx-auto bg-white bg-opacity-80 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
					<div class="cols-span-2">
						<label for="from" class="block text-gray-700 capitalize font-semibold mb-2">
							from
						</label>
						<!-- <box-icon name='current-location' class="w-8 h-8 text-red-400"></box-icon> -->
						<input type="text" placeholder="Departure city" id="locationFrom"
							v-model="form.locationFrom"
							class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-gray-100">
					</div>
					<div class="cols-span-2">
						<label for="to" class="block text-gray-700 capitalize font-semibold mb-2">
							to
						</label>
						<!-- <box-icon class="w-8 h-8" name='current-location'></box-icon> -->
						<input type="text" placeholder="Destination city" id="locationTo"
							v-model="form.locationTo"
							class="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring focus:ring-gray-100">
					</div>

					<div class="col-span-1">
						<label for="departure-date" class="block text-gray-700 capitalize font-semibold mb-2">
							when
						</label>
						<input type="date" id="departureDate" v-model="form.departureDate"
							class="w-full px-4 py-2 rounded-md border border-gray-100 focus:ring focus:ring-gray-100 text-black" />
					</div>

					<div class="col-span-1 relative w-full">
						<label for="passengers" class="block text-gray-700 font-semibold capitalize mb-2">
							passengers
						</label>
						<div @click="toggleDropdown"
							class="w-full px-4 py-2 rounded-md flex flex-col items-start justify-center border border-white focus:ring focus:ring-blue-500 cursor-pointer text-black">
							<span>
								{{ form.passengerCount.adults }} Adults,
							</span>

							<span>
								{{ form.passengerCount.children }} Children
							</span>
						</div>
						<div v-if="dropdownOpen"
							class="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20">
							<div class="p-3 flex flex-col items-center justify-center">
								<label for="adults" class="block text-gray-700 font-semibold capitalize">
									adults
								</label>
								<input type="number" id="adults" v-model="form.passengerCount.adults" min="1" max="10"
									class="md:w-full w-2/5 p-2 mt-1 rounded-md border border-gray-300 text-black" />
							</div>
							<div class="p-3 flex flex-col items-center justify-center">
								<label for="children" class="block text-gray-700 font-semibold capitalize">
									children
								</label>
								<input type="number" id="children" v-model="form.passengerCount.children" min="0"
									max="10" class=" md:w-full w-2/5 p-2 mt-1 rounded-md border border-gray-300 text-black" />
							</div>
						</div>
					</div>

					<div class="col-span-1 flex items-center">
						<label for="round-trip" class="flex text-gray-700 font-semibold mr-3 capitalize">
							round trip?
						</label>
						<!-- <input type="checkbox" id="isRoundTrip" v-model="form.isRoundTrip"
							class="w-4 h-4 rounded-md border border-gray-300 focus:ring focus:ring-blue-200" /> -->

						<select name="" id="" class="px-2 py-1 rounded-md border border-gray-300 focus:ring focus:ring-blue-200 capitalize">
							<option value="0" class="">
								Yes
							</option>
							<option value="1" class="">
								No
							</option>
						</select>
					</div>

					<div class="col-span-1 lg:col-span-2 flex">
						<button type="submit"
							class="justify-center items-center w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition capitalize">
							search
						</button>
					</div>
				</form>
			</div>
		</div>
	</section>
</template>

<script>

import { ref } from 'vue';

export default {
	name: 'AppHero',
	setup() {
		const backgroundImage = '../assets/images/hero.webp';

		const form = ref({
			from: '',
			to: '',
			departureDate: '',
			isRoundTrip: false,
			passengerCount: {
				adults: 1,
				children: 0,
			},

		})

		const dropdownOpen = ref(false);

		const handleSearch = () => {
			// handle search form submission
			console.log('Form submitted:', form.value)
		}

		const toggleDropdown = () => {
			dropdownOpen.value = !dropdownOpen.value;
		};

		return {
			backgroundImage,
			form,
			dropdownOpen,
			handleSearch,
			toggleDropdown,
		};		
	}
}

</script>