<template>
	<div>
		<AppHeader />
		<AppHero />
		<TopBusRoutes />
		<AppFooter />
	</div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue'
import AppHero from '../components/AppHero.vue'
import TopBusRoutes from '../components/TopBusRoutes.vue';
import AppFooter from '@/components/AppFooter.vue';


export default {
	components: {
		AppHeader,
		AppHero,
		TopBusRoutes,
		AppFooter
	}
}
</script>
