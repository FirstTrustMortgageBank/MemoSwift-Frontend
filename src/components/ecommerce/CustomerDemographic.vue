<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
  >
    <div class="flex justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Memo Distribution
        </h3>
        <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Number of memos by branch location
        </p>
      </div>
    </div>
    <div
      class="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6"
    >
      <div
        ref="mapOneRef"
        id="mapOne"
        class="mapOne map-btn -mx-4 -my-6 h-[212px] w-full"
      ></div>
    </div>
    <div class="space-y-5">
      <!-- Head Office -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V15H15V21M12 12H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Head Office</p>
            <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
              2,845 Memos
            </span>
          </div>
        </div>

        <div class="flex w-full max-w-[140px] items-center gap-3">
          <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
            <div
              class="absolute left-0 top-0 flex h-full w-[62%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
            ></div>
          </div>
          <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">62%</p>
        </div>
      </div>

      <!-- Abuja Branch -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Abuja Branch</p>
            <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
              1,023 Memos
            </span>
          </div>
        </div>

        <div class="flex w-full max-w-[140px] items-center gap-3">
          <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
            <div
              class="absolute left-0 top-0 flex h-full w-[22%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
            ></div>
          </div>
          <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">22%</p>
        </div>
      </div>

      <!-- Ikeja Branch -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Ikeja Branch</p>
            <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
              732 Memos
            </span>
          </div>
        </div>

        <div class="flex w-full max-w-[140px] items-center gap-3">
          <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
            <div
              class="absolute left-0 top-0 flex h-full w-[16%] items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
            ></div>
          </div>
          <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">16%</p>
        </div>
      </div>

      <!-- Total Stats Summary -->
      <div class="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500 dark:text-gray-400">Total Memos</span>
          <span class="text-lg font-semibold text-gray-800 dark:text-white/90">4,600</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import jsVectorMap from 'jsvectormap'
import 'jsvectormap/dist/maps/world'

const mapOneRef = ref<HTMLElement | null>(null)
const mapInstance = ref<any>(null)

const initMap = () => {
  if (mapOneRef.value) {
    mapInstance.value = new jsVectorMap({
      selector: mapOneRef.value,
      map: 'world',
      zoomButtons: false,
      zoomOnScroll: false,
      regionStyle: {
        initial: {
          fontFamily: 'Outfit',
          fill: '#D9D9D9',
          fillOpacity: 0.5,
          stroke: '#9ca3af',
          strokeWidth: 0.5,
        },
        hover: {
          fillOpacity: 1,
          fill: '#465fff',
        },
      },
      markers: [
        {
          name: 'Head Office (Abuja)',
          coords: [9.0579, 7.4951], // Abuja coordinates
        },
        {
          name: 'Abuja Branch',
          coords: [9.0579, 7.4951], // Abuja coordinates
        },
        {
          name: 'Ikeja Branch (Lagos)',
          coords: [6.6018, 3.3515], // Ikeja, Lagos coordinates
        },
      ],
      markerStyle: {
        initial: {
          strokeWidth: 2,
          stroke: '#ffffff',
          fill: '#465fff',
          fillOpacity: 1,
          r: 8,
        },
        hover: {
          fill: '#10B981',
          fillOpacity: 1,
          stroke: '#ffffff',
          strokeWidth: 2,
          cursor: 'pointer',
        },
        selected: {},
        selectedHover: {},
      },
      onMarkerTooltipShow: function (event: MouseEvent, tooltip: any) {
        const marker = (event.target as any).__data__
        if (marker && marker.name) {
          if (marker.name.includes('Head Office')) {
            tooltip.setContent('Head Office - 2,845 memos')
          } else if (marker.name.includes('Abuja')) {
            tooltip.setContent('Abuja Branch - 1,023 memos')
          } else if (marker.name.includes('Ikeja')) {
            tooltip.setContent('Ikeja Branch - 732 memos')
          } else {
            tooltip.setContent(marker.name)
          }
        }
      },
    })
    
    // Center the map on Nigeria
    if (mapInstance.value && mapInstance.value.map) {
      // Wait a bit for map to initialize then pan to Nigeria
      setTimeout(() => {
        try {
          // Approximate bounds for Nigeria
          mapInstance.value.map.setView([9.0820, 8.6753], 5)
        } catch (e) {
          console.log('Could not center map')
        }
      }, 100)
    }
  }
}

onMounted(() => {
  initMap()
})
</script>