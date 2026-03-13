<template>
  <div
    class="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div
      class="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6"
    >
      <div class="flex justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Target</h3>
          <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Memo completion target for each month
          </p>
        </div>
        <div>
          <DropdownMenu :menu-items="menuItems">
            <template #icon>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z"
                  fill="currentColor"
                />
              </svg>
            </template>
          </DropdownMenu>
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

      <!-- Chart and Stats -->
      <template v-else>
        <div class="relative max-h-[195px]">
          <div id="chartTwo" class="h-full">
            <div class="radial-bar-chart">
              <VueApexCharts type="radialBar" height="330" :options="chartOptions" :series="series" />
            </div>
          </div>
          <span
            v-if="trendPercentage !== 0"
            class="absolute left-1/2 top-[85%] -translate-x-1/2 -translate-y-[85%] rounded-full px-3 py-1 text-xs font-medium"
            :class="trendPercentage > 0 ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500' : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'"
          >
            {{ trendPercentage > 0 ? '+' : '' }}{{ trendPercentage }}%
          </span>
        </div>
        <p class="mx-auto mt-1.5 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {{ motivationalMessage }}
        </p>
      </template>
    </div>

    <div class="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
      <!-- Monthly Target -->
      <div>
        <p class="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
          Monthly Target
        </p>
        <p
          class="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg"
        >
          {{ formatNumber(monthlyTarget) }} Memos
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
              fill="#D92D20"
            />
          </svg>
        </p>
        <p class="text-xs text-center text-gray-400">{{ monthlyCompletionPercentage }}% achieved</p>
      </div>

      <div class="w-px bg-gray-200 h-12 dark:bg-gray-800"></div>

      <!-- Completed -->
      <div>
        <p class="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
          Completed
        </p>
        <p
          class="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg"
        >
          {{ formatNumber(monthlyCompleted) }} Memos
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
              fill="#039855"
            />
          </svg>
        </p>
        <p class="text-xs text-center text-gray-400">{{ monthlyVsLastMonth > 0 ? '+' : '' }}{{ formatNumber(monthlyVsLastMonth) }} vs last month</p>
      </div>

      <div class="w-px bg-gray-200 h-12 dark:bg-gray-800"></div>

      <!-- Today -->
      <div>
        <p class="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
          Today
        </p>
        <p
          class="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg"
        >
          {{ formatNumber(todayCompleted) }} Memos
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
              fill="#039855"
            />
          </svg>
        </p>
        <p class="text-xs text-center text-gray-400">Daily goal: {{ formatNumber(dailyGoal) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import DropdownMenu from '../common/DropdownMenu.vue'
import VueApexCharts from 'vue3-apexcharts'

interface Memo {
  id: string
  title: string
  content?: string
  status?: string
  priority?: string
  authorId: string
  createdAt: string
  updatedAt?: string
  reference: string
}

interface ApiResponse {
  data: Memo[][]
  message?: string
  statusCode?: number
}

const API_BASE_URL = 'http://localhost:3000/api/v1'

const isLoading = ref(true)
const error = ref<string | null>(null)

// Store all memos
const allMemos = ref<Memo[]>([])

// Computed statistics from memos
const totalMemos = computed(() => allMemos.value.length)

const approvedMemos = computed(() => 
  allMemos.value.filter(memo => memo.status?.toLowerCase() === 'approved').length
)

const pendingMemos = computed(() => 
  allMemos.value.filter(memo => memo.status?.toLowerCase() === 'pending').length
)

const draftMemos = computed(() => 
  allMemos.value.filter(memo => memo.status?.toLowerCase() === 'draft').length
)

// Monthly statistics
const monthlyCompleted = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return allMemos.value.filter(memo => {
    const memoDate = new Date(memo.createdAt)
    return memoDate.getMonth() === currentMonth && 
           memoDate.getFullYear() === currentYear &&
           memo.status?.toLowerCase() === 'approved'
  }).length
})

// Today's completed memos
const todayCompleted = computed(() => {
  const now = new Date()
  const today = now.toDateString()
  
  return allMemos.value.filter(memo => {
    const memoDate = new Date(memo.createdAt)
    return memoDate.toDateString() === today && 
           memo.status?.toLowerCase() === 'approved'
  }).length
})

// Last month's completed memos for comparison
const lastMonthCompleted = computed(() => {
  const now = new Date()
  const lastMonth = now.getMonth() - 1
  const year = lastMonth < 0 ? now.getFullYear() - 1 : now.getFullYear()
  const month = lastMonth < 0 ? 11 : lastMonth
  
  return allMemos.value.filter(memo => {
    const memoDate = new Date(memo.createdAt)
    return memoDate.getMonth() === month && 
           memoDate.getFullYear() === year &&
           memo.status?.toLowerCase() === 'approved'
  }).length
})

// Monthly target (could be configurable, using 250 as default)
const monthlyTarget = ref(250)

// Daily goal (could be configurable, using 30 as default)
const dailyGoal = ref(30)

// Comparison with last month
const monthlyVsLastMonth = computed(() => 
  monthlyCompleted.value - lastMonthCompleted.value
)

// Completion percentage
const monthlyCompletionPercentage = computed(() => 
  Math.min(Math.round((monthlyCompleted.value / monthlyTarget.value) * 100), 100)
)

// Trend percentage (simplified calculation)
const trendPercentage = computed(() => {
  if (lastMonthCompleted.value === 0) return monthlyCompleted.value > 0 ? 100 : 0
  return Math.round(((monthlyCompleted.value - lastMonthCompleted.value) / lastMonthCompleted.value) * 100)
})

const series = computed(() => [monthlyCompletionPercentage.value])

const motivationalMessage = computed(() => {
  if (todayCompleted.value > dailyGoal.value) {
    return `You've completed ${todayCompleted.value} memos today, exceeding your daily target. Keep up the great work!`
  } else if (todayCompleted.value === dailyGoal.value) {
    return `You've hit your daily target of ${dailyGoal.value} memos. Well done!`
  } else {
    return `You've completed ${todayCompleted.value} out of ${dailyGoal.value} daily memos. You've got this!`
  }
})

const menuItems = [
  { 
    label: 'View Details', 
    onClick: () => {
      console.log('View Details clicked')
    } 
  },
  { 
    label: 'Set New Target', 
    onClick: () => {
      // You could open a modal to set new targets
      console.log('Set New Target clicked')
    } 
  },
]

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

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Fetch memos from /memos/me endpoint
const fetchMemos = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await axiosInstance.get<ApiResponse>('/memos/me', {
      params: {
        limit: 1000, // Get a large number to calculate stats accurately
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      }
    })
    
    console.log('Memos Response:', response.data)
    
    // Extract memos from response.data.data[0] based on your API structure
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      allMemos.value = response.data.data[0] || []
    } else {
      allMemos.value = []
    }
    
    // You could also fetch target settings from a config endpoint if available
    // For now, we'll keep the default values
    
  } catch (err) {
    console.error('Error fetching memos:', err)
    error.value = 'Failed to load memo statistics'
    
    // Set fallback data for development
    if (import.meta.env.DEV) {
      allMemos.value = generateFallbackMemos()
    }
  } finally {
    isLoading.value = false
  }
}

// Generate fallback memos for development
const generateFallbackMemos = (): Memo[] => {
  const memos: Memo[] = []
  const now = new Date()
  
  // Generate some memos for this month
  for (let i = 0; i < 212; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() - Math.floor(Math.random() * 30))
    
    memos.push({
      id: `memo-${i}`,
      title: `Sample Memo ${i}`,
      status: i < 180 ? 'approved' : (i < 200 ? 'pending' : 'draft'),
      authorId: 'user-1',
      createdAt: date.toISOString(),
      reference: `MEM-2024-${String(i).padStart(3, '0')}`,
      content: 'Sample content'
    })
  }
  
  return memos
}

const chartOptions = {
  colors: ['#465FFF'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    sparkline: {
      enabled: true,
    },
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        size: '80%',
      },
      track: {
        background: '#E4E7EC',
        strokeWidth: '100%',
        margin: 5,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: 60,
          color: '#1D2939',
          formatter: function (val: number) {
            return val.toFixed(0) + '%'
          },
        },
      },
    },
  },
  fill: {
    type: 'solid',
    colors: ['#465FFF'],
  },
  stroke: {
    lineCap: 'round',
  },
  labels: ['Progress'],
}

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

.radial-bar-chart {
  width: 100%;
  max-width: 330px;
  margin: 0 auto;
}
</style>