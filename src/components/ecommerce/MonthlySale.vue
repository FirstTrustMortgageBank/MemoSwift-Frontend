<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Memos</h3>

      <div class="relative h-fit">
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
    <div v-if="isLoading" class="flex justify-center items-center py-8">
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
      <div id="chartOne" class="-ml-5 min-w-[650px] xl:min-w-full pl-2">
        <VueApexCharts type="bar" height="180" :options="chartOptions" :series="series" />
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
const allMemos = ref<Memo[]>([])

// Compute monthly data from memos
const monthlyData = computed(() => {
  // Initialize array with 12 zeros for each month
  const monthlyCounts = new Array(12).fill(0)
  
  // Get current year
  const currentYear = new Date().getFullYear()
  
  // Count memos created in each month of the current year
  allMemos.value.forEach(memo => {
    const memoDate = new Date(memo.createdAt)
    if (memoDate.getFullYear() === currentYear) {
      const month = memoDate.getMonth() // 0-11
      monthlyCounts[month]++
    }
  })
  
  return monthlyCounts
})

// Format data for the chart
const series = computed(() => [
  {
    name: 'Memos Created',
    data: monthlyData.value,
  },
])

const menuItems = [
  { label: 'Export Data', onClick: () => {
    // Handle export - could download as CSV
    console.log('Export Data clicked')
    exportToCSV()
  }},
  { label: 'View Details', onClick: () => {
    console.log('View Details clicked')
    // Could navigate to detailed reports page
  }},
]

// Export data as CSV
const exportToCSV = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const data = months.map((month, index) => ({
    Month: month,
    'Memos Created': monthlyData.value[index]
  }))
  
  const csv = [
    ['Month', 'Memos Created'],
    ...data.map(item => [item.Month, item['Memos Created']])
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `monthly-memos-${new Date().getFullYear()}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
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

// Fetch memos from /memos/me endpoint
const fetchMemos = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await axiosInstance.get<ApiResponse>('/memos/me', {
      params: {
        limit: 1000, // Get enough data for yearly stats
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      }
    })
    
    console.log('Memos Response for Monthly Chart:', response.data)
    
    // Extract memos from response.data.data[0] based on your API structure
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      allMemos.value = response.data.data[0] || []
    } else {
      allMemos.value = []
    }
    
  } catch (err) {
    console.error('Error fetching memos for monthly chart:', err)
    error.value = 'Failed to load monthly memo data'
    
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
  
  // Generate sample data matching the original [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]
  const sampleData = [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]
  
  sampleData.forEach((count, monthIndex) => {
    for (let i = 0; i < count; i++) {
      const date = new Date(currentYear, monthIndex, Math.floor(Math.random() * 28) + 1)
      memos.push({
        id: `memo-${currentYear}-${monthIndex}-${i}`,
        title: `Sample Memo ${monthIndex + 1}-${i}`,
        status: i % 3 === 0 ? 'approved' : (i % 3 === 1 ? 'pending' : 'draft'),
        authorId: 'user-1',
        createdAt: date.toISOString(),
        reference: `MEM-${currentYear}-${String(monthIndex + 1).padStart(2, '0')}${String(i).padStart(3, '0')}`,
        content: 'Sample content'
      })
    }
  })
  
  return memos
}

const chartOptions = ref({
  colors: ['#465fff'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 4,
    colors: ['transparent'],
  },
  xaxis: {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
    markers: {
      radius: 99,
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
  grid: {
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    x: {
      show: false,
    },
    y: {
      formatter: function (val: number) {
        return val + ' memos'
      },
    },
  },
})

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