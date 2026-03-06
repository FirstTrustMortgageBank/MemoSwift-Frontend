<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Header with actions -->
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Memos</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and track all your memos across branches
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="showFilters = !showFilters"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filters
          <span v-if="activeFilterCount" class="flex items-center justify-center w-5 h-5 text-xs text-white bg-brand-500 rounded-full">{{ activeFilterCount }}</span>
        </button>
        
        <router-link
          to="/memo"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Memo
        </router-link>
      </div>
    </div>

    <!-- Filters Card -->
    <ComponentCard title="Filters" v-if="showFilters" class="mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Branch Filter -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
          <select v-model="filters.branch" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <option value="">All Branches</option>
            <option value="head-office">Head Office</option>
            <option value="abuja">Abuja</option>
            <option value="ikeja">Ikeja</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select v-model="filters.status" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <!-- Date Range -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
          <select v-model="filters.dateRange" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <!-- Custom Date Range (shown when custom selected) -->
        <div v-if="filters.dateRange === 'custom'" class="col-span-full lg:col-span-1">
          <div class="flex gap-2">
            <input type="date" v-model="filters.startDate" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <input type="date" v-model="filters.endDate" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
          </div>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex items-center justify-between mt-4">
        <button @click="resetFilters" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          Clear All Filters
        </button>
        <button @click="applyFilters" class="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600">
          Apply Filters
        </button>
      </div>
    </ComponentCard>

    <!-- Search Bar -->
    <div class="relative mb-4">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by title, reference number, or content..."
        class="w-full h-12 pl-10 pr-4 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        @input="debouncedSearch"
      />
    </div>

    <!-- Memo List Table Card -->
    <ComponentCard title="All Memos">
      <template #action>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select v-model="sortBy" class="h-8 px-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
      </template>

      <!-- Memo Count Summary -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Showing <span class="font-medium">{{ paginatedMemos.length }}</span> of <span class="font-medium">{{ filteredMemos.length }}</span> memos
        </p>
      </div>

      <!-- Memo List Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <th class="px-4 py-3 text-left">
                <div class="flex items-center gap-2">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500">
                </div>
              </th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Reference</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Branch</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="memo in paginatedMemos" :key="memo.id" class="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3">
                <input type="checkbox" v-model="selectedMemos" :value="memo.id" class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500">
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.reference }}</td>
              <td class="px-4 py-3">
                <router-link :to="`/memo/${memo.id}`" class="text-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400">
                  {{ memo.title }}
                </router-link>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ memo.branch }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(memo.date) }}</td>
              <td class="px-4 py-3">
                <span
                  :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500': memo.status === 'pending',
                    'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500': memo.status === 'approved',
                    'bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400': memo.status === 'draft',
                    'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500': memo.status === 'rejected'
                  }"
                >
                  {{ formatStatus(memo.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button @click="viewMemo(memo.id)" class="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400" title="View">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button @click="editMemo(memo.id)" class="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400" title="Edit">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button v-if="memo.status === 'pending'" @click="approveMemo(memo.id)" class="p-1 text-success-500 hover:text-success-600" title="Approve">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                  <button @click="deleteMemo(memo.id)" class="p-1 text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400" title="Delete">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Empty State -->
            <tr v-if="filteredMemos.length === 0">
              <td colspan="7" class="py-12 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white/90">No memos found</h3>
                <p class="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your filters or create a new memo</p>
                <router-link to="/memo/new" class="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Create New Memo
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions Bar -->
      <div v-if="selectedMemos.length > 0" class="flex items-center justify-between px-4 py-3 mt-4 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ selectedMemos.length }} memo(s) selected
        </span>
        <div class="flex items-center gap-2">
          <button @click="bulkApprove" class="px-3 py-1.5 text-sm font-medium text-success-600 bg-success-50 rounded-lg hover:bg-success-100 dark:bg-success-500/15 dark:text-success-500 dark:hover:bg-success-500/25">
            Approve Selected
          </button>
          <button @click="bulkDelete" class="px-3 py-1.5 text-sm font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/15 dark:text-error-500 dark:hover:bg-error-500/25">
            Delete Selected
          </button>
          <button @click="selectedMemos = []" class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 mt-4 border-t border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
          <select v-model="rowsPerPage" class="h-8 px-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <div class="flex items-center gap-2">
            <button @click="currentPage--" :disabled="currentPage === 1" class="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button @click="currentPage++" :disabled="currentPage === totalPages" class="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </ComponentCard>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'

const router = useRouter()
const currentPageTitle = ref('Memos')

// Mock data - replace with actual API calls
const mockMemos = [
  {
    id: 1,
    reference: 'MEM-2024-001',
    title: 'Q4 Budget Approval',
    branch: 'Head Office',
    date: '2024-03-15',
    status: 'approved'
  },
  {
    id: 2,
    reference: 'MEM-2024-002',
    title: 'Staff Leave Policy Update',
    branch: 'Abuja',
    date: '2024-03-14',
    status: 'pending'
  },
  {
    id: 3,
    reference: 'MEM-2024-003',
    title: 'IT Infrastructure Upgrade',
    branch: 'Ikeja',
    date: '2024-03-14',
    status: 'draft'
  },
  {
    id: 4,
    reference: 'MEM-2024-004',
    title: 'Annual General Meeting',
    branch: 'Head Office',
    date: '2024-03-13',
    status: 'approved'
  },
  {
    id: 5,
    reference: 'MEM-2024-005',
    title: 'Health & Safety Compliance',
    branch: 'Ikeja',
    date: '2024-03-12',
    status: 'rejected'
  },
  {
    id: 6,
    reference: 'MEM-2024-006',
    title: 'New Hire Onboarding Process',
    branch: 'Abuja',
    date: '2024-03-11',
    status: 'approved'
  },
  {
    id: 7,
    reference: 'MEM-2024-007',
    title: 'Product Launch Plan',
    branch: 'Head Office',
    date: '2024-03-10',
    status: 'pending'
  },
  {
    id: 8,
    reference: 'MEM-2024-008',
    title: 'HR Policy Updates 2024',
    branch: 'Head Office',
    date: '2024-03-09',
    status: 'approved'
  }
]

// State
const showFilters = ref(false)
const searchQuery = ref('')
const selectedMemos = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const sortBy = ref('date-desc')

// Filters
const filters = ref({
  branch: '',
  status: '',
  dateRange: 'all',
  startDate: '',
  endDate: ''
})

// Computed
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.branch) count++
  if (filters.value.status) count++
  if (filters.value.dateRange !== 'all') count++
  return count
})

const filteredMemos = computed(() => {
  let memos = [...mockMemos]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    memos = memos.filter(memo => 
      memo.title.toLowerCase().includes(query) ||
      memo.reference.toLowerCase().includes(query)
    )
  }

  // Apply branch filter
  if (filters.value.branch) {
    memos = memos.filter(memo => {
      const branchMap = {
        'head-office': 'Head Office',
        'abuja': 'Abuja',
        'ikeja': 'Ikeja'
      }
      return memo.branch === branchMap[filters.value.branch]
    })
  }

  // Apply status filter
  if (filters.value.status) {
    memos = memos.filter(memo => memo.status === filters.value.status)
  }

  // Apply date filter
  if (filters.value.dateRange === 'today') {
    const today = new Date().toISOString().split('T')[0]
    memos = memos.filter(memo => memo.date === today)
  } else if (filters.value.dateRange === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    memos = memos.filter(memo => memo.date >= weekAgoStr)
  } else if (filters.value.dateRange === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const monthAgoStr = monthAgo.toISOString().split('T')[0]
    memos = memos.filter(memo => memo.date >= monthAgoStr)
  } else if (filters.value.dateRange === 'custom' && filters.value.startDate && filters.value.endDate) {
    memos = memos.filter(memo => 
      memo.date >= filters.value.startDate && 
      memo.date <= filters.value.endDate
    )
  }

  // Apply sorting
  memos.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return b.date.localeCompare(a.date)
      case 'date-asc':
        return a.date.localeCompare(b.date)
      case 'title-asc':
        return a.title.localeCompare(b.title)
      case 'title-desc':
        return b.title.localeCompare(a.title)
      default:
        return 0
    }
  })

  return memos
})

const totalPages = computed(() => 
  Math.ceil(filteredMemos.value.length / rowsPerPage.value)
)

const paginatedMemos = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredMemos.value.slice(start, end)
})

// Watch for filter changes to reset pagination
watch([filters, searchQuery, sortBy], () => {
  currentPage.value = 1
})

// Methods
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatStatus = (status) => {
  const statusMap = {
    draft: 'Draft',
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected'
  }
  return statusMap[status] || status
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMemos.value = paginatedMemos.value.map(m => m.id)
  } else {
    selectedMemos.value = []
  }
}

watch(selectedMemos, (newVal) => {
  selectAll.value = paginatedMemos.value.length > 0 && 
    paginatedMemos.value.every(m => newVal.includes(m.id))
})

const resetFilters = () => {
  filters.value = {
    branch: '',
    status: '',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  }
  searchQuery.value = ''
}

const applyFilters = () => {
  showFilters.value = false
}

const debouncedSearch = () => {
  // In a real app, you'd debounce this to avoid too many API calls
}

const viewMemo = (id) => {
  router.push(`/memo/${id}`)
}

const editMemo = (id) => {
  router.push(`/memo/edit/${id}`)
}

const approveMemo = (id) => {
  console.log('Approve memo:', id)
  // In real app: API call to approve
}

const deleteMemo = (id) => {
  if (confirm('Are you sure you want to delete this memo?')) {
    console.log('Delete memo:', id)
    // In real app: API call to delete
  }
}

const bulkApprove = () => {
  console.log('Bulk approve:', selectedMemos.value)
  selectedMemos.value = []
}

const bulkDelete = () => {
  if (confirm(`Delete ${selectedMemos.value.length} selected memos?`)) {
    console.log('Bulk delete:', selectedMemos.value)
    selectedMemos.value = []
  }
}
</script>