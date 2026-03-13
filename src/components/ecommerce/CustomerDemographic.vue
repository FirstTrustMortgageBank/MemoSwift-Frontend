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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-error-600 dark:text-error-500">{{ error }}</p>
      <button 
        @click="fetchMemos" 
        class="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Retry
      </button>
    </div>

    <template v-else>
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
        <div v-if="branchStats.headOffice.count > 0" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V15H15V21M12 12H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Head Office</p>
              <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
                {{ formatNumber(branchStats.headOffice.count) }} Memos
              </span>
            </div>
          </div>

          <div class="flex w-full max-w-[140px] items-center gap-3">
            <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
              <div
                class="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                :style="{ width: branchStats.headOffice.percentage + '%' }"
              ></div>
            </div>
            <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ branchStats.headOffice.percentage }}%</p>
          </div>
        </div>

        <!-- Abuja Branch -->
        <div v-if="branchStats.abuja.count > 0" class="flex items-center justify-between">
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
                {{ formatNumber(branchStats.abuja.count) }} Memos
              </span>
            </div>
          </div>

          <div class="flex w-full max-w-[140px] items-center gap-3">
            <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
              <div
                class="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                :style="{ width: branchStats.abuja.percentage + '%' }"
              ></div>
            </div>
            <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ branchStats.abuja.percentage }}%</p>
          </div>
        </div>

        <!-- Ikeja Branch -->
        <div v-if="branchStats.ikeja.count > 0" class="flex items-center justify-between">
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
                {{ formatNumber(branchStats.ikeja.count) }} Memos
              </span>
            </div>
          </div>

          <div class="flex w-full max-w-[140px] items-center gap-3">
            <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
              <div
                class="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                :style="{ width: branchStats.ikeja.percentage + '%' }"
              ></div>
            </div>
            <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ branchStats.ikeja.percentage }}%</p>
          </div>
        </div>

        <!-- Other Branches (if any) -->
        <div v-if="branchStats.other.count > 0" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Other Branches</p>
              <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
                {{ formatNumber(branchStats.other.count) }} Memos
              </span>
            </div>
          </div>

          <div class="flex w-full max-w-[140px] items-center gap-3">
            <div class="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
              <div
                class="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                :style="{ width: branchStats.other.percentage + '%' }"
              ></div>
            </div>
            <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ branchStats.other.percentage }}%</p>
          </div>
        </div>

        <!-- Total Stats Summary -->
        <div class="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500 dark:text-gray-400">Total Memos</span>
            <span class="text-lg font-semibold text-gray-800 dark:text-white/90">{{ formatNumber(totalMemos) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import axios from 'axios'
import jsVectorMap from 'jsvectormap'
import 'jsvectormap/dist/maps/world'

interface Memo {
  id: string
  title: string
  content?: string
  status?: string
  priority?: string
  authorId: string
  branch?: string
  createdAt: string
  updatedAt?: string
  reference: string
}

interface ApiResponse {
  data: Memo[][]
  message?: string
  statusCode?: number
}

interface BranchStat {
  count: number
  percentage: number
}

interface BranchStats {
  headOffice: BranchStat
  abuja: BranchStat
  ikeja: BranchStat
  other: BranchStat
}

const API_BASE_URL = 'http://localhost:3000/api/v1'

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const allMemos = ref<Memo[]>([])
const mapOneRef = ref<HTMLElement | null>(null)
const mapInstance = ref<any>(null)

// Create axios instance with auth interceptor
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const parsedToken = JSON.parse(token)
        config.headers.Authorization = `Bearer ${parsedToken}`
      } catch {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Compute branch statistics from memos
const branchStats = computed<BranchStats>(() => {
  const stats: BranchStats = {
    headOffice: { count: 0, percentage: 0 },
    abuja: { count: 0, percentage: 0 },
    ikeja: { count: 0, percentage: 0 },
    other: { count: 0, percentage: 0 }
  }

  // Count memos by branch
  allMemos.value.forEach(memo => {
    const branch = memo.branch?.toLowerCase() || ''
    
    if (branch.includes('head') || branch.includes('hq') || branch.includes('corporate')) {
      stats.headOffice.count++
    } else if (branch.includes('abuja')) {
      stats.abuja.count++
    } else if (branch.includes('ikeja') || branch.includes('lagos')) {
      stats.ikeja.count++
    } else if (branch) {
      stats.other.count++
    } else {
      // If no branch specified, count as other
      stats.other.count++
    }
  })

  // Calculate percentages
  const total = allMemos.value.length
  if (total > 0) {
    stats.headOffice.percentage = Math.round((stats.headOffice.count / total) * 100)
    stats.abuja.percentage = Math.round((stats.abuja.count / total) * 100)
    stats.ikeja.percentage = Math.round((stats.ikeja.count / total) * 100)
    stats.other.percentage = Math.round((stats.other.count / total) * 100)
  }

  return stats
})

// Total memos
const totalMemos = computed(() => allMemos.value.length)

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Initialize or update map with current stats
const initMap = () => {
  if (!mapOneRef.value) return

  // Destroy existing map instance if it exists
  if (mapInstance.value) {
    try {
      mapInstance.value.destroy()
    } catch (e) {
      console.log('Error destroying map:', e)
    }
  }

  const markers = [
    {
      name: 'Head Office',
      coords: [9.0579, 7.4951], // Abuja coordinates
      count: branchStats.value.headOffice.count
    },
    {
      name: 'Abuja Branch',
      coords: [9.0579, 7.4951], // Abuja coordinates
      count: branchStats.value.abuja.count
    },
    {
      name: 'Ikeja Branch',
      coords: [6.6018, 3.3515], // Ikeja, Lagos coordinates
      count: branchStats.value.ikeja.count
    }
  ].filter(marker => marker.count > 0) // Only show branches with memos

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
    markers: markers,
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
        const count = marker.count || 0
        tooltip.setContent(`${marker.name} - ${formatNumber(count)} memos`)
      }
    },
  })
  
  // Center the map on Nigeria
  setTimeout(() => {
    try {
      if (mapInstance.value && mapInstance.value.map) {
        mapInstance.value.map.setView([9.0820, 8.6753], 5)
      }
    } catch (e) {
      console.log('Could not center map')
    }
  }, 100)
}

// Fetch memos from /memos/me endpoint
const fetchMemos = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await axiosInstance.get<ApiResponse>('/memos/me', {
      params: {
        limit: 10000, // Get enough data for statistics
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      }
    })
    
    console.log('Memos Response for Distribution:', response.data)
    
    // Extract memos from response.data.data[0] based on your API structure
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      allMemos.value = response.data.data[0] || []
    } else {
      allMemos.value = []
    }
    
    // Initialize map after data is loaded
    setTimeout(() => {
      initMap()
    }, 100)
    
  } catch (err) {
    console.error('Error fetching memos for distribution:', err)
    error.value = 'Failed to load memo distribution data'
    
    // Set fallback data for development
    if (import.meta.env.DEV) {
      allMemos.value = generateFallbackMemos()
      setTimeout(() => {
        initMap()
      }, 100)
    }
  } finally {
    isLoading.value = false
  }
}

// Generate fallback memos for development
const generateFallbackMemos = (): Memo[] => {
  const memos: Memo[] = []
  const branches = [
    { name: 'Head Office', count: 2845 },
    { name: 'Abuja Branch', count: 1023 },
    { name: 'Ikeja Branch', count: 732 }
  ]
  
  branches.forEach((branch, branchIndex) => {
    for (let i = 0; i < branch.count; i++) {
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 365))
      
      memos.push({
        id: `memo-${branchIndex}-${i}`,
        title: `${branch.name} Memo ${i}`,
        status: i % 3 === 0 ? 'approved' : (i % 3 === 1 ? 'pending' : 'draft'),
        branch: branch.name,
        authorId: 'user-1',
        createdAt: date.toISOString(),
        reference: `MEM-2024-${String(i).padStart(4, '0')}`,
        content: 'Sample content'
      })
    }
  })
  
  return memos
}

// Watch for changes in memo data to update the map
watch(branchStats, () => {
  initMap()
}, { deep: true })

// Initial fetch
onMounted(() => {
  fetchMemos()
})
</script>

<style scoped>
.spinner-border {
  border-top-color: transparent;
  border-right-color: currentColor;
  border-bottom-color: currentColor;
  border-left-color: currentColor;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>