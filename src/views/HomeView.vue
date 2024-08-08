<template>
	<div>
		<AppHeader />
		<AppHero />
		<TopBusRoutes />
	</div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue'
import AppHero from '../components/AppHero.vue'
import TopBusRoutes from '../components/TopBusRoutes.vue';

export default {
	components: {
		AppHeader,
		AppHero,
		TopBusRoutes
	}
}
</script>
