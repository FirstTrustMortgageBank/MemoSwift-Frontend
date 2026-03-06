<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Header Section -->
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Archive & Search</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Search and retrieve archived memos across all branches
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="exportResults"
          :disabled="filteredMemos.length === 0"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Export Results
        </button>
        
        <button 
          @click="clearAllFilters"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Clear All
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title, content, reference number, or author..."
          class="w-full h-14 pl-12 pr-4 text-base border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          @input="debouncedSearch"
        />
        <button 
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Search Suggestions -->
      <div v-if="showSuggestions && searchQuery" class="absolute z-10 mt-2 w-full max-w-2xl bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-2">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Recent Searches</div>
          <button 
            v-for="suggestion in recentSearches" 
            :key="suggestion"
            @click="applySuggestion(suggestion)"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg class="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div class="mb-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <button 
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="flex items-center justify-between w-full text-left"
        >
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Filters</span>
          <svg 
            class="w-5 h-5 text-gray-500 transition-transform dark:text-gray-400"
            :class="{ 'rotate-180': showAdvancedFilters }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="showAdvancedFilters" class="p-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <!-- Date Range -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
              <div class="flex gap-2">
                <input 
                  type="date" 
                  v-model="filters.dateFrom"
                  class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                <span class="text-gray-500 self-center">to</span>
                <input 
                  type="date" 
                  v-model="filters.dateTo"
                  class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
              </div>
            </div>

            <!-- Branch -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
              <select v-model="filters.branch" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                <option value="">All Branches</option>
                <option value="head-office">Head Office</option>
                <option value="abuja">Abuja</option>
                <option value="ikeja">Ikeja</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select v-model="filters.status" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <!-- Department/Author -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <select v-model="filters.department" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                <option value="">All Departments</option>
                <option value="it">IT</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
                <option value="operations">Operations</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            <!-- Author -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
              <input 
                type="text" 
                v-model="filters.author"
                placeholder="Search by author name"
                class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
            </div>

            <!-- Reference Number -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Reference Number</label>
              <input 
                type="text" 
                v-model="filters.reference"
                placeholder="e.g., MEM-2024-001"
                class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="flex items-center justify-between mt-4">
            <button @click="resetFilters" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Reset Filters
            </button>
            <button @click="applyFilters" class="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600">
              Apply Filters
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Results Summary -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Found <span class="font-medium">{{ filteredMemos.length }}</span> results
          <span v-if="searchQuery" class="text-gray-500"> for "{{ searchQuery }}"</span>
        </p>
        <span v-if="activeFilterCount > 0" class="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-600 rounded-full dark:bg-brand-500/20 dark:text-brand-400">
          {{ activeFilterCount }} active filters
        </span>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
        <select v-model="sortBy" class="h-8 px-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="relevance">Relevance</option>
        </select>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-800/50">
              <th class="w-10 px-4 py-3">
                <input 
                  type="checkbox" 
                  v-model="selectAll" 
                  @change="toggleSelectAll"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                >
              </th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Reference</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Author</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Branch</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="memo in paginatedMemos" :key="memo.id" class="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3">
                <input 
                  type="checkbox" 
                  v-model="selectedMemos" 
                  :value="memo.id"
                  class="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                >
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.reference }}</td>
              <td class="px-4 py-3">
                <router-link :to="`/memo/${memo.id}`" class="text-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400">
                  <span v-html="highlightText(memo.title)"></span>
                </router-link>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-medium">
                    {{ getInitials(memo.author) }}
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ memo.author }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.branch }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(memo.date) }}</td>
              <td class="px-4 py-3">
                <span
                  :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': memo.status === 'draft',
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400': memo.status === 'pending',
                    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400': memo.status === 'approved',
                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': memo.status === 'rejected',
                    'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400': memo.status === 'archived'
                  }"
                >
                  {{ formatStatus(memo.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <router-link 
                    :to="`/memo/${memo.id}`"
                    class="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                    title="View"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </router-link>
                  <button 
                    @click="restoreMemo(memo)"
                    v-if="memo.status === 'archived'"
                    class="p-1 text-green-500 hover:text-green-600"
                    title="Restore"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                  <button 
                    @click="downloadMemo(memo)"
                    class="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                    title="Download"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredMemos.length === 0">
              <td colspan="8" class="py-12 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white/90">No results found</h3>
                <p class="mt-2 text-gray-500 dark:text-gray-400">
                  {{ searchQuery ? `No memos matching "${searchQuery}"` : 'Try adjusting your filters or search terms' }}
                </p>
                <button 
                  @click="clearAllFilters"
                  class="px-4 py-2 mt-4 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                >
                  Clear all filters
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedMemos.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ selectedMemos.length }} memo(s) selected
        </span>
        <div class="flex items-center gap-2">
          <button 
            @click="bulkDownload"
            class="px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
          >
            Download Selected
          </button>
          <button 
            @click="bulkArchive"
            class="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
          >
            Archive Selected
          </button>
          <button 
            @click="bulkDelete"
            class="px-3 py-1.5 text-sm font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500 dark:hover:bg-error-500/20"
          >
            Delete Selected
          </button>
          <button 
            @click="selectedMemos = []"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
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
    </div>

    <!-- Save Search Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showSaveSearchModal" class="modal-overlay" @click.self="showSaveSearchModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Save Search</h3>
            <button @click="showSaveSearchModal = false" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Search Name</label>
              <input 
                type="text" 
                v-model="savedSearchName"
                placeholder="e.g., Q4 Budget Memos"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="shareSearch">
                <span>Share with team</span>
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="emailNotifications">
                <span>Email me when new results match</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showSaveSearchModal = false" class="cancel-btn">Cancel</button>
            <button @click="saveSearch" class="send-btn">Save Search</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success Toast -->
    <div v-if="showToast" class="toast-notification" :class="toastType">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path v-if="toastType === 'success'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline v-if="toastType === 'success'" points="22 4 12 14.01 9 11.01"/>
        <circle v-if="toastType === 'error'" cx="12" cy="12" r="10"/>
        <line v-if="toastType === 'error'" x1="12" y1="8" x2="12" y2="12"/>
        <line v-if="toastType === 'error'" x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ toastMessage }}
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const currentPageTitle = ref('Archive & Search')
const searchQuery = ref('')
const showAdvancedFilters = ref(false)
const showSuggestions = ref(false)
const showSaveSearchModal = ref(false)
const selectedMemos = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const sortBy = ref('date-desc')
const savedSearchName = ref('')
const shareSearch = ref(false)
const emailNotifications = ref(false)

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Recent searches
const recentSearches = ref([
  'Q4 budget',
  'HR policy',
  'IT infrastructure',
  'Meeting minutes'
])

// Filters
const filters = ref({
  dateFrom: '',
  dateTo: '',
  branch: '',
  status: '',
  department: '',
  author: '',
  reference: ''
})

// Mock data - replace with API calls
const allMemos = ref([
  {
    id: 1,
    reference: 'MEM-2024-001',
    title: 'Q4 Budget Approval',
    content: 'This memo requests approval for the Q4 budget allocation...',
    author: 'John Smith',
    branch: 'Head Office',
    date: '2024-03-15T10:30:00',
    status: 'approved',
    department: 'finance'
  },
  {
    id: 2,
    reference: 'MEM-2024-002',
    title: 'Staff Leave Policy Update',
    content: 'Updates to the annual leave policy effective immediately...',
    author: 'Sarah Johnson',
    branch: 'Abuja',
    date: '2024-03-14T14:20:00',
    status: 'archived',
    department: 'hr'
  },
  {
    id: 3,
    reference: 'MEM-2024-003',
    title: 'IT Infrastructure Upgrade Proposal',
    content: 'Proposal for upgrading server infrastructure and network equipment...',
    author: 'Michael Chen',
    branch: 'Ikeja',
    date: '2024-03-12T11:15:00',
    status: 'pending',
    department: 'it'
  },
  {
    id: 4,
    reference: 'MEM-2024-004',
    title: 'Annual General Meeting Plans',
    content: 'Planning and logistics for the upcoming AGM scheduled for May...',
    author: 'Amara Okafor',
    branch: 'Head Office',
    date: '2024-03-10T16:45:00',
    status: 'approved',
    department: 'operations'
  },
  {
    id: 5,
    reference: 'MEM-2024-005',
    title: 'Health & Safety Compliance Report',
    content: 'Quarterly health and safety compliance report for all branches...',
    author: 'David Okonkwo',
    branch: 'Ikeja',
    date: '2024-03-08T09:00:00',
    status: 'archived',
    department: 'operations'
  },
  {
    id: 6,
    reference: 'MEM-2024-006',
    title: 'New Hire Onboarding Process',
    content: 'Revised onboarding procedures for new employees...',
    author: 'Sarah Johnson',
    branch: 'Abuja',
    date: '2024-03-05T13:30:00',
    status: 'approved',
    department: 'hr'
  },
  {
    id: 7,
    reference: 'MEM-2024-007',
    title: 'Software License Renewal',
    content: 'Renewal of software licenses for the upcoming fiscal year...',
    author: 'Michael Chen',
    branch: 'Ikeja',
    date: '2024-03-03T10:15:00',
    status: 'draft',
    department: 'it'
  },
  {
    id: 8,
    reference: 'MEM-2024-008',
    title: 'HR Policy Handbook Updates',
    content: 'Annual review and updates to the employee handbook...',
    author: 'Sarah Johnson',
    branch: 'Head Office',
    date: '2024-02-28T09:45:00',
    status: 'approved',
    department: 'hr'
  }
])

// Computed
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.dateFrom) count++
  if (filters.value.dateTo) count++
  if (filters.value.branch) count++
  if (filters.value.status) count++
  if (filters.value.department) count++
  if (filters.value.author) count++
  if (filters.value.reference) count++
  return count
})

const filteredMemos = computed(() => {
  let memos = [...allMemos.value]

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    memos = memos.filter(m => 
      m.title.toLowerCase().includes(query) ||
      m.content.toLowerCase().includes(query) ||
      m.reference.toLowerCase().includes(query) ||
      m.author.toLowerCase().includes(query)
    )
  }

  // Apply date filters
  if (filters.value.dateFrom) {
    memos = memos.filter(m => m.date >= filters.value.dateFrom)
  }
  if (filters.value.dateTo) {
    memos = memos.filter(m => m.date <= filters.value.dateTo)
  }

  // Apply branch filter
  if (filters.value.branch) {
    const branchMap = {
      'head-office': 'Head Office',
      'abuja': 'Abuja',
      'ikeja': 'Ikeja'
    }
    memos = memos.filter(m => m.branch === branchMap[filters.value.branch])
  }

  // Apply status filter
  if (filters.value.status) {
    memos = memos.filter(m => m.status === filters.value.status)
  }

  // Apply department filter
  if (filters.value.department) {
    memos = memos.filter(m => m.department === filters.value.department)
  }

  // Apply author filter
  if (filters.value.author) {
    const authorQuery = filters.value.author.toLowerCase()
    memos = memos.filter(m => m.author.toLowerCase().includes(authorQuery))
  }

  // Apply reference filter
  if (filters.value.reference) {
    const refQuery = filters.value.reference.toLowerCase()
    memos = memos.filter(m => m.reference.toLowerCase().includes(refQuery))
  }

  // Apply sorting
  memos.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date)
      case 'date-asc':
        return new Date(a.date) - new Date(b.date)
      case 'title-asc':
        return a.title.localeCompare(b.title)
      case 'title-desc':
        return b.title.localeCompare(a.title)
      case 'relevance':
        if (!searchQuery.value) return new Date(b.date) - new Date(a.date)
        // Simple relevance: check if title matches query first
        const aTitleMatch = a.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        const bTitleMatch = b.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        if (aTitleMatch && !bTitleMatch) return -1
        if (!aTitleMatch && bTitleMatch) return 1
        return new Date(b.date) - new Date(a.date)
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

// Watch for filter changes
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
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    archived: 'Archived'
  }
  return statusMap[status] || status
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const highlightText = (text) => {
  if (!searchQuery.value) return text
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<span class="bg-yellow-200 dark:bg-yellow-900/50">$1</span>')
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

const debouncedSearch = () => {
  // In real app: debounce API calls
  showSuggestions.value = true
}

const applySuggestion = (suggestion) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
}

const resetFilters = () => {
  filters.value = {
    dateFrom: '',
    dateTo: '',
    branch: '',
    status: '',
    department: '',
    author: '',
    reference: ''
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  resetFilters()
  showAdvancedFilters.value = false
}

const applyFilters = () => {
  // Filters are already reactive
  showAdvancedFilters.value = false
}

const restoreMemo = (memo) => {
  memo.status = 'approved'
  showToastMessage(`Memo ${memo.reference} restored from archive`, 'success')
}

const downloadMemo = (memo) => {
  console.log('Downloading memo:', memo.id)
  showToastMessage(`Downloading ${memo.reference}`, 'success')
}

const exportResults = () => {
  console.log('Exporting results:', filteredMemos.value.length, 'memos')
  showToastMessage(`Exporting ${filteredMemos.value.length} memos`, 'success')
}

const bulkDownload = () => {
  console.log('Bulk download:', selectedMemos.value)
  showToastMessage(`Downloading ${selectedMemos.value.length} memos`, 'success')
  selectedMemos.value = []
}

const bulkArchive = () => {
  selectedMemos.value.forEach(id => {
    const memo = allMemos.value.find(m => m.id === id)
    if (memo) memo.status = 'archived'
  })
  showToastMessage(`${selectedMemos.value.length} memos archived`, 'success')
  selectedMemos.value = []
}

const bulkDelete = () => {
  if (!confirm(`Delete ${selectedMemos.value.length} selected memos?`)) return
  
  allMemos.value = allMemos.value.filter(m => !selectedMemos.value.includes(m.id))
  showToastMessage(`${selectedMemos.value.length} memos deleted`, 'success')
  selectedMemos.value = []
}

const saveSearch = () => {
  console.log('Saving search:', savedSearchName.value)
  showSaveSearchModal.value = false
  showToastMessage('Search saved successfully', 'success')
  savedSearchName.value = ''
  shareSearch.value = false
  emailNotifications.value = false
}

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Click outside to close suggestions
const handleClickOutside = (event) => {
  if (!event.target.closest('.search-container')) {
    showSuggestions.value = false
  }
}

// Add click outside listener
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--color-white);
  border-radius: 1rem;
  width: 450px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dark .modal-content {
  background-color: var(--color-gray-900);
  border: 1px solid var(--color-gray-800);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .modal-header {
  border-bottom-color: var(--color-gray-800);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900);
}

.dark .modal-header h3 {
  color: var(--color-gray-100);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-gray-500);
  padding: 0.5rem;
}

.close-btn:hover {
  color: var(--color-gray-700);
}

.dark .close-btn:hover {
  color: var(--color-gray-300);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dark .modal-footer {
  border-top-color: var(--color-gray-800);
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-gray-700);
}

.dark .form-group label {
  color: var(--color-gray-300);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: var(--color-white);
  color: var(--color-gray-900);
  font-family: inherit;
}

.dark .form-input {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-gray-100);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-gray-700);
}

.dark .checkbox-label {
  color: var(--color-gray-300);
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

/* Button Styles */
.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  color: var(--color-gray-700);
  font-weight: 500;
  cursor: pointer;
}

.dark .cancel-btn {
  border-color: var(--color-gray-700);
  color: var(--color-gray-300);
}

.cancel-btn:hover {
  background-color: var(--color-gray-50);
}

.dark .cancel-btn:hover {
  background-color: var(--color-gray-800);
}

.send-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-brand-500);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.send-btn:hover:not(:disabled) {
  background-color: var(--color-brand-600);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1100;
  animation: slideIn 0.3s ease;
}

.dark .toast-notification {
  background-color: var(--color-gray-800);
  border: 1px solid var(--color-gray-700);
}

.toast-notification.success {
  border-left: 4px solid #2E7D32;
}
.toast-notification.error {
  border-left: 4px solid #C62828;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>