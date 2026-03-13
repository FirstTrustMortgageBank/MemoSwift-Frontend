<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
      <div class="w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Memo Statistics</h3>
        <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Memo creation and approval trends
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <div
            class="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900"
          >
            <button
              v-for="option in periodOptions"
              :key="option.value"
              @click="selectedPeriod = option.value"
              :class="[
                selectedPeriod === option.value
                  ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800'
                  : 'text-gray-500 dark:text-gray-400',
                'px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 hover:shadow-theme-xs dark:hover:bg-gray-800 dark:hover:text-white',
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="relative">
          <flat-pickr
            v-model="dateRange"
            :config="flatpickrConfig"
            class="pl-3 sm:pl-9 dark:bg-dark-900 h-10 w-10 sm:w-40 rounded-lg border border-gray-200 bg-white text-transparent sm:text-theme-sm sm:text-gray-800 shadow-theme-xs placeholder:text-transparent sm:placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-transparent sm:dark:text-gray-400 dark:placeholder:text-transparent sm:dark:placeholder:text-gray-400 dark:focus:border-brand-800"
            placeholder="Select Date Range"
          />
          <span
            class="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-1/2 -translate-x-1/2 sm:left-3 sm:translate-x-0 top-1/2 dark:text-gray-400"
          >
            <svg
              class="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                fill=""
              />
            </svg>
          </span>
        </div>
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

    <!-- Chart -->
    <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartThree" class="-ml-4 min-w-[1000px] xl:min-w-full pl-2">
        <VueApexCharts type="area" height="310" :options="chartOptions" :series="chartSeries" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import flatPickr from 'vue-flatpickr-component'
import type { BaseOptions } from 'flatpickr/dist/types/options'
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

interface ChartData {
  categories: string[]
  created: number[]
  approved: number[]
}

type PeriodType = 'monthly' | 'quarterly' | 'annually'

interface PeriodOption {
  value: PeriodType
  label: string
}

const API_BASE_URL = 'http://localhost:3000/api/v1'

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const allMemos = ref<Memo[]>([])
const selectedPeriod = ref<PeriodType>('monthly')
const dateRange = ref('')

// Period options - typed as PeriodOption[]
const periodOptions: PeriodOption[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
]

// Flatpickr configuration with proper typing
const flatpickrConfig: Partial<BaseOptions> = {
  mode: 'range',
  dateFormat: 'M j, Y',
  defaultDate: [
    new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
    new Date()
  ],
  onChange: (selectedDates: Date[]) => {
    if (selectedDates.length === 2) {
      filterMemosByDateRange(selectedDates[0], selectedDates[1])
    }
  }
}

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

// Filter memos by date range
const filterMemosByDateRange = (startDate: Date, endDate: Date) => {
  // This will be used to filter the displayed data
  console.log('Date range selected:', startDate, endDate)
  // In a real app, you might want to refetch data with date parameters
  // or filter the existing data client-side
}

// Group memos by month
const groupMemosByMonth = (memos: Memo[]): ChartData => {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const created = new Array(12).fill(0)
  const approved = new Array(12).fill(0)
  
  memos.forEach(memo => {
    const date = new Date(memo.createdAt)
    const month = date.getMonth()
    
    created[month]++
    
    if (memo.status?.toLowerCase() === 'approved') {
      approved[month]++
    }
  })
  
  return { categories, created, approved }
}

// Group memos by quarter
const groupMemosByQuarter = (memos: Memo[]): ChartData => {
  const categories = ['Q1', 'Q2', 'Q3', 'Q4']
  const created = new Array(4).fill(0)
  const approved = new Array(4).fill(0)
  
  memos.forEach(memo => {
    const date = new Date(memo.createdAt)
    const quarter = Math.floor(date.getMonth() / 3)
    
    created[quarter]++
    
    if (memo.status?.toLowerCase() === 'approved') {
      approved[quarter]++
    }
  })
  
  return { categories, created, approved }
}

// Group memos by year
const groupMemosByYear = (memos: Memo[]): ChartData => {
  const yearMap = new Map<number, { created: number; approved: number }>()
  
  memos.forEach(memo => {
    const date = new Date(memo.createdAt)
    const year = date.getFullYear()
    
    if (!yearMap.has(year)) {
      yearMap.set(year, { created: 0, approved: 0 })
    }
    
    const stats = yearMap.get(year)!
    stats.created++
    
    if (memo.status?.toLowerCase() === 'approved') {
      stats.approved++
    }
  })
  
  // Sort years in ascending order
  const sortedYears = Array.from(yearMap.entries()).sort((a, b) => a[0] - b[0])
  
  return {
    categories: sortedYears.map(([year]) => year.toString()),
    created: sortedYears.map(([_, stats]) => stats.created),
    approved: sortedYears.map(([_, stats]) => stats.approved)
  }
}

// Compute chart data based on selected period
const chartData = computed<ChartData>(() => {
  if (allMemos.value.length === 0) {
    return {
      categories: [],
      created: [],
      approved: []
    }
  }

  switch (selectedPeriod.value) {
    case 'monthly':
      return groupMemosByMonth(allMemos.value)
    case 'quarterly':
      return groupMemosByQuarter(allMemos.value)
    case 'annually':
      return groupMemosByYear(allMemos.value)
    default:
      return groupMemosByMonth(allMemos.value)
  }
})

// Format series for ApexCharts
const chartSeries = computed(() => [
  {
    name: 'Memos Created',
    data: chartData.value.created,
  },
  {
    name: 'Memos Approved',
    data: chartData.value.approved,
  },
])

// Update chart options based on selected period
const chartOptions = computed(() => ({
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit, sans-serif',
    markers: {
      radius: 99,
    },
    itemMargin: {
      horizontal: 10,
    },
  },
  colors: ['#465FFF', '#10B981'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'area',
    toolbar: {
      show: false,
    },
  },
  fill: {
    gradient: {
      enabled: true,
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  },
  stroke: {
    curve: 'straight',
    width: [2, 2],
  },
  markers: {
    size: 4,
    hover: {
      size: 6,
    },
  },
  labels: {
    show: false,
    position: 'top',
  },
  grid: {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    x: {
      format: selectedPeriod.value === 'monthly' ? 'MMM' : 
              selectedPeriod.value === 'quarterly' ? 'q' : 'yyyy',
    },
    y: {
      formatter: function (val: number) {
        return val + ' memos'
      },
    },
  },
  xaxis: {
    type: 'category',
    categories: chartData.value.categories,
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    title: {
      text: 'Number of Memos',
      style: {
        fontSize: '12px',
        fontWeight: 400,
        color: '#6B7280',
      },
    },
  },
}))

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
    
    console.log('Memos Response for Statistics:', response.data)
    
    // Extract memos from response.data.data[0] based on your API structure
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      allMemos.value = response.data.data[0] || []
    } else {
      allMemos.value = []
    }
    
  } catch (err) {
    console.error('Error fetching memos for statistics:', err)
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
  const currentYear = new Date().getFullYear()
  const startYear = currentYear - 3
  
  // Generate memos for the last 4 years
  for (let year = startYear; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      // Random number of memos between 100 and 400
      const memoCount = Math.floor(Math.random() * 300) + 100
      
      for (let i = 0; i < memoCount; i++) {
        const date = new Date(year, month, Math.floor(Math.random() * 28) + 1)
        const isApproved = Math.random() > 0.2 // 80% approval rate
        
        memos.push({
          id: `memo-${year}-${month}-${i}`,
          title: `Sample Memo ${year}-${month + 1}-${i}`,
          status: isApproved ? 'approved' : (Math.random() > 0.5 ? 'pending' : 'draft'),
          authorId: 'user-1',
          createdAt: date.toISOString(),
          reference: `MEM-${year}-${String(month + 1).padStart(2, '0')}${String(i).padStart(3, '0')}`,
          content: 'Sample content'
        })
      }
    }
  }
  
  return memos
}

// Watch for period changes
watch(selectedPeriod, () => {
  // Chart will update automatically via computed properties
  console.log('Period changed to:', selectedPeriod.value)
})

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

.area-chart {
  width: 100%;
}
</style>