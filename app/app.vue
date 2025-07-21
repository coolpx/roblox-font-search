<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

// Reactive data
const fonts = ref<Font[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedCategory = ref<Font['category'] | 'all'>('all');
const copiedId = ref<number | null>(null);

// Function to fetch fonts
const fetchFonts = async () => {
    try {
        loading.value = true;
        error.value = null;

        const response = await $fetch<{ data: Font[] }>('/api/fonts');
        fonts.value = response.data;
    } catch (err) {
        console.error('Error fetching fonts:', err);
        error.value = 'Failed to load fonts';
    } finally {
        loading.value = false;
    }
};

// Computed filtered fonts
const filteredFonts = computed(() => {
    if (selectedCategory.value === 'all') {
        return fonts.value;
    }
    return fonts.value.filter(font => font.category === selectedCategory.value);
});

// Get unique categories for filter dropdown
const categories = computed(() => {
    const uniqueCategories = [...new Set(fonts.value.map(font => font.category))];
    return uniqueCategories.sort();
});

// Copy font ID to clipboard
const copyFontId = async (fontId: number) => {
    try {
        await navigator.clipboard.writeText(fontId.toString());
        copiedId.value = fontId;
        // Clear the copied state after 2 seconds
        setTimeout(() => {
            copiedId.value = null;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy font ID:', err);
    }
};

// Fetch fonts on component mount
onMounted(() => {
    fetchFonts();
});
</script>

<template>
    <div class="min-h-dvh bg-zinc-50 dark:bg-zinc-900">
        <!-- Header -->
        <div
            class="w-full h-16 bg-white dark:bg-zinc-800 flex items-center justify-center outline-2 outline-zinc-200 dark:outline-zinc-700"
        >
            <span class="text-2xl font-bold text-zinc-800 dark:text-zinc-100"
                >Roblox Font Search</span
            >
        </div>

        <div class="container mx-auto px-4 py-8">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div
                        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                    ></div>
                    <p class="text-zinc-600 dark:text-zinc-300">Loading fonts...</p>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div class="text-red-500 dark:text-red-400 text-xl mb-2">⚠️</div>
                    <p class="text-red-600 dark:text-red-400">{{ error }}</p>
                    <button
                        @click="fetchFonts"
                        class="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>

            <!-- Fonts Grid -->
            <div v-else>
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                                Available Fonts
                            </h2>
                            <p class="text-zinc-600 dark:text-zinc-300">
                                Showing {{ filteredFonts.length }} of {{ fonts.length }} fonts
                            </p>
                        </div>

                        <!-- Category Filter -->
                        <div class="flex items-center gap-2">
                            <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Filter by category:
                            </label>
                            <select
                                v-model="selectedCategory"
                                class="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Categories</option>
                                <option
                                    v-for="category in categories"
                                    :key="category"
                                    :value="category"
                                >
                                    {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div
                        v-for="font in filteredFonts"
                        :key="font.id"
                        @click="copyFontId(font.id)"
                        class="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        :class="{ 'ring-2 ring-green-500 ring-opacity-75': copiedId === font.id }"
                    >
                        <!-- Font Preview Image -->
                        <div
                            class="p-2 aspect-10 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center"
                        >
                            <img
                                v-if="font.preview"
                                :src="font.preview"
                                :alt="`Preview of ${font.name}`"
                                class="max-w-full max-h-full object-contain"
                                loading="lazy"
                            />
                            <div v-else class="text-zinc-400 dark:text-zinc-500 text-sm">
                                No preview
                            </div>
                        </div>

                        <!-- Font Info -->
                        <div class="p-4">
                            <h3
                                class="font-semibold text-zinc-800 dark:text-zinc-100 mb-1 truncate"
                                :title="font.name"
                            >
                                {{ font.name }}
                            </h3>
                            <div
                                class="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400"
                            >
                                <span class="capitalize">{{ font.category }}</span>
                                <div class="flex items-center gap-1">
                                    <span>ID: {{ font.id }}</span>
                                    <div class="flex items-center">
                                        <svg
                                            v-if="copiedId === font.id"
                                            class="w-4 h-4 text-green-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M5 13l4 4L19 7"
                                            ></path>
                                        </svg>
                                        <svg
                                            v-else
                                            class="w-4 h-4 opacity-50"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            ></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div
                    v-if="filteredFonts.length === 0 && fonts.length > 0"
                    class="text-center py-12"
                >
                    <div class="text-zinc-400 dark:text-zinc-500 text-6xl mb-4">🔍</div>
                    <h3 class="text-lg font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                        No fonts found in this category
                    </h3>
                    <p class="text-zinc-500 dark:text-zinc-400">
                        Try selecting a different category
                    </p>
                </div>

                <!-- No fonts loaded state -->
                <div v-else-if="fonts.length === 0" class="text-center py-12">
                    <div class="text-zinc-400 dark:text-zinc-500 text-6xl mb-4">📝</div>
                    <h3 class="text-lg font-medium text-zinc-600 dark:text-zinc-300 mb-2">
                        No fonts found
                    </h3>
                    <p class="text-zinc-500 dark:text-zinc-400">Try refreshing the page</p>
                </div>
            </div>
        </div>
    </div>
</template>
