<template>
	<header class="bg-white shadow-md">
		<div class="container mx-auto flex justify-between items-center p-4">
			<div class="flex items-center">
				<img src="/bus.svg" alt="autobus-logo" class="w-8 h-8 mr-2" />
				<span class="capitalize font-semibold">
					autobus
				</span>

				<nav class="hidden md:flex space-x-6 ml-8 capitalize">
					<a href="" class="text-gray-700 hover:text-gray-900">
						about
					</a>
					<a href="" class="text-gray-700 hover:text-gray-900">
						bus hire
					</a>
					<a href="" class="text-gray-700 hover:text-gray-900">
						parcels
					</a>
					<a href="" class="text-gray-700 hover:text-gray-900">
						contacts
					</a>
				</nav>
			</div>

			<div class="flex items-center">
				<button class="ml-4 bg-yellow-400 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-md capitalize font-semibold">
					get started
				</button>
			</div>
		</div>
	</header>
</template>


<script>

import { ref } from 'vue'

export default {
	name: 'AppHeader',
	setup() {
		const searchQuery = ref('')
		return {
			searchQuery
		}
	}
}
</script>
