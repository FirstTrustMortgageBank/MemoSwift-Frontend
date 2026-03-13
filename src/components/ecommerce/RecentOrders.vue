<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
  >
    <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Memos</h3>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="toggleFilter"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg
            class="stroke-current fill-white dark:fill-gray-800"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.29004 5.90393H17.7067"
              stroke=""
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17.7075 14.0961H2.29085"
              stroke=""
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
              fill=""
              stroke=""
              stroke-width="1.5"
            />
            <path
              d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
              fill=""
              stroke=""
              stroke-width="1.5"
            />
          </svg>

          Filter
        </button>

        <button
          @click="viewAllMemos"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          View all
        </button>
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
        @click="fetchRecentMemos" 
        class="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="recentMemos.length === 0" class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">No recent memos found</p>
    </div>

    <!-- Table -->
    <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-t border-gray-100 dark:border-gray-800">
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Memo Title</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Reference</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Date</p>
            </th>
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(memo, index) in recentMemos"
            :key="memo.id || index"
            class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            @click="viewMemoDetail(memo.id)"
          >
            <td class="py-3 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center h-[40px] w-[40px] overflow-hidden rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20V20H4V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 8H16V10H8V8Z" fill="currentColor"/>
                    <path d="M8 12H16V14H8V12Z" fill="currentColor"/>
                    <path d="M8 16H13V18H8V16Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ memo.title }}
                  </p>
                </div>
              </div>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ memo.reference || 'N/A' }}</p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ formatDate(memo.createdAt) }}</p>
            </td>
            <td class="py-3 whitespace-nowrap">
              <span
                :class="getStatusClass(memo.status)"
              >
                {{ formatStatus(memo.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

interface Memo {
  id: string
  title: string
  content?: string
  status?: string
  priority?: string
  branch?: string
  authorId: string
  createdAt: string
  updatedAt?: string
  reference: string
  tenantId?: string
  metadata?: any
}

interface ApiResponse {
  data: Memo[][]
  message?: string
  statusCode?: number
}

const router = useRouter()
const API_BASE_URL = 'http://localhost:3000/api/v1'

const isLoading = ref(true)
const error = ref<string | null>(null)
const recentMemos = ref<Memo[]>([])

// Create axios instance with default config
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
  (error) => {
    return Promise.reject(error)
  }
)

// Format date for display
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

// Format status for display
const formatStatus = (status?: string): string => {
  if (!status) return 'Unknown'
  
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'archived': 'Archived',
    'in_review': 'In Review'
  }
  return statusMap[status.toLowerCase()] || status
}

// Get status CSS class
const getStatusClass = (status?: string): string => {
  const baseClass = 'rounded-full px-2.5 py-1 text-theme-xs font-medium'
  
  if (!status) return `${baseClass} bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400`
  
  const statusClasses: Record<string, string> = {
    'draft': 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
    'pending': 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
    'approved': 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
    'rejected': 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
    'archived': 'bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400',
    'in_review': 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
  }
  
  const statusKey = status.toLowerCase()
  return `${baseClass} ${statusClasses[statusKey] || statusClasses.draft}`
}

// Fetch recent memos
const fetchRecentMemos = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Based on your response structure, the endpoint returns data.data[0] as the array of memos
    const response = await axiosInstance.get<ApiResponse>('/memos/me', {
      params: {
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      }
    })
    
    console.log('Recent Memos Response:', response.data)
    
    // Extract the memos array from response.data.data[0]
    // Based on your response: data.data[0] contains the array of memos
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      recentMemos.value = response.data.data[0] || []
    } else {
      recentMemos.value = []
    }
    
  } catch (err) {
    console.error('Error fetching recent memos:', err)
    error.value = 'Failed to load recent memos'
    
    // Set fallback data for development/demo using the actual data structure you provided
    if (import.meta.env.DEV) {
      recentMemos.value = [
        {
          id: '295ab8a5-1183-4409-85a7-51ecc16e51fc',
          reference: 'MEM-2026-008',
          title: 'Approval for the purchase of computer accessories',
          content: '<p style="line-height: 1.5;"><strong>DATE: JULY 31…yle="line-height: 1.5;">Managing Director/CEO</p>',
          authorId: 'cb164466-d55d-4c13-aba7-0efda893f268',
          createdAt: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: 'cdecb001-ff48-4d58-b516-e110b5c522b5',
          reference: 'MEM-2026-007',
          title: 'Approval for the purchase of computer',
          content: '<p style="line-height: 1.5;"><strong>DATE: JULY 31…yle="line-height: 1.5;">Managing Director/CEO</p>',
          authorId: 'cb164466-d55d-4c13-aba7-0efda893f268',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'approved'
        },
        {
          id: '93f332f7-941e-48d9-8d2f-2873ce5caa82',
          reference: 'MEM-2026-006',
          title: 'APPROVAL FOR THE PURCHASE OF COMPUTER ACCESSORIES',
          content: '<p style="line-height: 1.5;"><strong>DATE: JULY 31…yle="line-height: 1.5;">Managing Director/CEO</p>',
          authorId: 'cb164466-d55d-4c13-aba7-0efda893f268',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'draft'
        }
      ]
    }
  } finally {
    isLoading.value = false
  }
}

// Handle filter button click
const toggleFilter = () => {
  // Implement filter logic or emit event to parent
  console.log('Filter clicked')
  // You could emit an event or open a filter modal
}

// Handle view all button click
const viewAllMemos = () => {
  // Navigate to memos list page
  router.push('/memo-list')
}

// Handle memo row click
const viewMemoDetail = (memoId: string) => {
  if (memoId) {
    router.push(`/memo/${memoId}`)
  }
}

// Initial fetch
onMounted(() => {
  fetchRecentMemos()
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