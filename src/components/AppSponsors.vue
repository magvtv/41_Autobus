<template>
    <div class="sponsor-section py-8 bg-gray-100">
        <h2 class="text-center capitalize text-2xl font-semibold mb-6">
            our sponsors
        </h2>
        <div class="flex justify-center flex-wrap gap-8">
            <div v-for="sponsor in sponsors" :key="sponsor.id" class="sponsor-card">
                <img :src="getImagePath(sponsor.logo)" :alt="sponsor.name" class="h-16 w-auto object-contain" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Optional: Import the sponsor data from JSON
import sponsorsData from '@/assets/content/Sponsors.json';

const sponsors = ref([]);

// If using onMounted to load data (from JSON or API)
onMounted(() => {
    sponsors.value = sponsorsData;
});

// Method to resolve image paths
const getImagePath = (imageRelativePath) => {
    return require(`@/assets/${imageRelativePath}`);
};
</script>