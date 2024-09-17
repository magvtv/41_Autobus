<template>
	<div>
		<AppHeader />
        <!-- <AppHero /> -->
		<AppHeros />
        <AppSponsors />
		<TopBusRoutes />
		<AppFooter />
	</div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue'
// import AppHero from '../components/AppHero.vue'
import AppHeros from '@/components/AppHeros.vue';
import TopBusRoutes from '../components/TopBusRoutes.vue';
import AppFooter from '@/components/AppFooter.vue';
import AppSponsors from '@/components/AppSponsors.vue';


export default {
	components: {
        AppHeader,
        // AppHero,
        AppHeros,
        TopBusRoutes,
        AppSponsors,
		AppFooter
	}
}
</script>
