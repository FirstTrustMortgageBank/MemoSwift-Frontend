<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Header Section -->
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Approval Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and review memos pending your approval
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
        
        <button 
          @click="refreshData"
          :disabled="isRefreshing"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50"
        >
          <svg class="w-5 h-5" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Pending Total Card -->
      <div class="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">Pending Approval</span>
          <span v-if="pendingChange !== 0" class="px-2 py-1 text-xs font-medium rounded-full" :class="pendingChange > 0 ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500' : 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'">
            {{ pendingChange > 0 ? '+' : '' }}{{ pendingChange }} since yesterday
          </span>
        </div>
        <div class="flex items-end justify-between mt-2">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ formatNumber(pendingTotal) }}</h4>
          <span class="text-sm text-gray-500">Need action</span>
        </div>
      </div>

      <!-- High Priority Card -->
      <div class="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">High Priority</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">Urgent</span>
        </div>
        <div class="flex items-end justify-between mt-2">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ formatNumber(highPriorityCount) }}</h4>
          <span class="text-sm text-gray-500">Requires immediate attention</span>
        </div>
      </div>

      <!-- Awaiting Response Card -->
      <div class="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">Awaiting Response</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">{{ avgResponseTime }}h avg</span>
        </div>
        <div class="flex items-end justify-between mt-2">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ formatNumber(awaitingResponse) }}</h4>
          <span class="text-sm text-gray-500">Waiting > 24h</span>
        </div>
      </div>

      <!-- Approval Rate Card -->
      <div class="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">Approval Rate</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full" :class="approvalRate >= 70 ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500' : 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500'">
            {{ approvalRate }}%
          </span>
        </div>
        <div class="flex items-end justify-between mt-2">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ formatNumber(approvedThisMonth) }}</h4>
          <span class="text-sm text-gray-500">Coming Soon</span>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 -translate-y-2"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-2"
    >
      <div v-if="showFilters" class="p-4 mb-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Branch Filter -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
            <select v-model="filters.branch" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              <option value="">All Branches</option>
              <option value="Head Office">Head Office</option>
              <option value="Abuja">Abuja</option>
              <option value="Ikeja">Ikeja</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select v-model="filters.priority" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Waiting Time</label>
            <select v-model="filters.waitingTime" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              <option value="">Any Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Over 1 Week</option>
              <option value="month">Over 1 Month</option>
            </select>
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
      </div>
    </Transition>

    <!-- Loading State -->
    <div v-if="isLoading && !isRefreshing" class="flex justify-center items-center py-12">
      <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !isRefreshing" class="text-center py-8">
      <p class="text-error-600 dark:text-error-500">{{ error }}</p>
      <button 
        @click="fetchPendingMemos" 
        class="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
      >
        Retry
      </button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Tabs -->
      <div class="mb-4 border-b border-gray-200 dark:border-gray-800">
        <nav class="flex gap-4">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            {{ tab.name }}
            <span v-if="getTabCount(tab) > 0" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
              {{ formatNumber(getTabCount(tab)) }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Approval Queue -->
      <div class="bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <!-- Search and Bulk Actions -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative flex-1 max-w-md">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by title, reference, or author..."
                class="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div v-if="selectedMemos.length > 0" class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ selectedMemos.length }} selected
              </span>
              <button 
                @click="bulkApprove"
                class="px-3 py-1.5 text-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600"
              >
                Approve All
              </button>
              <button 
                @click="bulkReject"
                class="px-3 py-1.5 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600"
              >
                Reject All
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
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
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Priority</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Reference</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Author</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Branch</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Waiting</th>
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
                <td class="px-4 py-3">
                  <span
                    :class="{
                      'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full': true,
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': memo.priority === 'LOW',
                      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': memo.priority === 'MEDIUM',
                      'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400': memo.priority === 'HIGH',
                      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': memo.priority === 'URGENT',
                      'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300': !memo.priority
                    }"
                  >
                    <span v-if="memo.priority === 'URGENT'" class="relative flex h-2 w-2 mr-1">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    {{ formatPriority(memo.priority) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.reference || 'N/A' }}</td>
                <td class="px-4 py-3">
                  <router-link :to="`/memo/${memo.id}`" class="text-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400">
                    {{ memo.title || 'Untitled' }}
                  </router-link>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-medium">
                      {{ getInitials(memo.authorName || 'Unknown User') }}
                    </div>
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ memo.authorName || 'Unknown' }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.branch || 'N/A' }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(memo.submittedAt) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ formatWaitingTime(memo.submittedAt) }}</span>
                    <span 
                      v-if="memo.submittedAt && isOverdue(memo.submittedAt)"
                      class="text-xs text-error-600 dark:text-error-400"
                    >
                      (Overdue)
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button 
                      @click="openApprovalModal(memo)"
                      class="p-1 text-success-600 hover:text-success-700 dark:text-success-500 dark:hover:text-success-400"
                      title="Approve"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </button>
                    <button 
                      @click="openRejectModal(memo)"
                      class="p-1 text-error-600 hover:text-error-700 dark:text-error-500 dark:hover:text-error-400"
                      title="Reject"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                    <router-link 
                      :to="`/memo/${memo.id}`"
                      class="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                      title="View Details"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </router-link>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredMemos.length === 0">
                <td colspan="9" class="py-12 text-center">
                  <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white/90">No pending approvals</h3>
                  <p class="mt-2 text-gray-500 dark:text-gray-400">All caught up! No memos waiting for your approval.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredMemos.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
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
    </template>

    <!-- Approval Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showApproveModal" class="modal-overlay" @click.self="closeModals">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Approve Memo</h3>
            <button @click="closeModals" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="mb-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <p class="text-sm font-medium text-gray-900 dark:text-white/90">{{ selectedMemo?.title || 'Untitled' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Ref: {{ selectedMemo?.reference || 'N/A' }}</p>
            </div>

            <div class="form-group">
              <label>Approval Comment (optional)</label>
              <textarea
                v-model="approvalComment"
                rows="3"
                placeholder="Add any comments or notes..."
                class="message-input"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="notifyAuthor">
                <span>Notify author of approval</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeModals" class="cancel-btn">Cancel</button>
            <button @click="approveMemo" class="send-btn">Approve</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Reject Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeModals">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Reject Memo</h3>
            <button @click="closeModals" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="mb-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <p class="text-sm font-medium text-gray-900 dark:text-white/90">{{ selectedMemo?.title || 'Untitled' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Ref: {{ selectedMemo?.reference || 'N/A' }}</p>
            </div>

            <div class="form-group">
              <label>Reason for rejection <span class="text-error-500">*</span></label>
              <textarea
                v-model="rejectionReason"
                rows="3"
                placeholder="Explain why this memo is being rejected..."
                class="message-input"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="requestChanges">
                <span>Request changes instead of rejection</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeModals" class="cancel-btn">Cancel</button>
            <button 
              @click="rejectMemo" 
              :disabled="!rejectionReason.trim()"
              class="send-btn reject"
            >
              {{ requestChanges ? 'Request Changes' : 'Reject' }}
            </button>
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

<script setup lang="ts">
import { ref, computed, onMounted, watch, type ComputedRef } from 'vue'
import axios from 'axios'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

interface Memo {
  id: string
  reference: string
  title: string
  content?: string
  authorName: string
  authorId?: string
  branch: string
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string
  submittedAt: string
  createdAt: string
  updatedAt: string
  currentApproverId?: string
  currentApproverName?: string | null
  metadata?: Record<string, any>
  attachments?: any
  responseAttachments?: any
}

interface ApiResponse {
  status: string
  message: string
  data: [Memo[], number]
  metadata: {
    timestamp: string
    path: string
    duration: number
    apiVersion: string
  }
}

interface Tab {
  id: string
  name: string
  count: number | ComputedRef<number>
}

const API_BASE_URL = 'http://localhost:3000/api/v1'

// State
const isLoading = ref(true)
const isRefreshing = ref(false)
const error = ref<string | null>(null)
const pendingMemos = ref<Memo[]>([])
const currentPageTitle = ref('Approval Dashboard')
const showFilters = ref(false)
const searchQuery = ref('')
const activeTab = ref('pending')
const selectedMemos = ref<string[]>([])
const selectAll = ref(false)
const currentPage = ref(1)
const rowsPerPage = ref(10)

// Modal states
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedMemo = ref<Memo | null>(null)
const approvalComment = ref('')
const rejectionReason = ref('')
const notifyAuthor = ref(true)
const requestChanges = ref(false)

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Filters
const filters = ref({
  branch: '',
  priority: '',
  waitingTime: ''
})

// Helper function to get tab count value
const getTabCount = (tab: Tab): number => {
  if (typeof tab.count === 'number') {
    return tab.count
  }
  return tab.count.value
}

// Tabs
const tabs: Tab[] = [
  { id: 'pending', name: 'Pending', count: computed(() => pendingMemos.value.length) },
  { id: 'high-priority', name: 'High Priority', count: computed(() => highPriorityCount.value) },
  { id: 'overdue', name: 'Overdue', count: computed(() => overdueCount.value) }
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

// Fetch pending memos from API
const fetchPendingMemos = async () => {
  if (!isRefreshing.value) {
    isLoading.value = true
  }
  error.value = null
  
  try {
    const response = await axiosInstance.get<ApiResponse>('/memos/pending')
    
    console.log('Pending memos response:', response.data)
    
    // Extract memos from the nested array structure
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      pendingMemos.value = response.data.data[0] || []
    } else {
      pendingMemos.value = []
    }
    
  } catch (err) {
    console.error('Error fetching pending memos:', err)
    error.value = 'Failed to load pending approvals'
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

// Computed
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.branch) count++
  if (filters.value.priority) count++
  if (filters.value.waitingTime) count++
  return count
})

const filteredMemos = computed(() => {
  let memos = [...pendingMemos.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    memos = memos.filter(m => 
      (m.title || '').toLowerCase().includes(query) ||
      (m.reference || '').toLowerCase().includes(query) ||
      (m.authorName || '').toLowerCase().includes(query)
    )
  }

  // Apply branch filter
  if (filters.value.branch) {
    memos = memos.filter(m => m.branch === filters.value.branch)
  }

  // Apply priority filter
  if (filters.value.priority) {
    memos = memos.filter(m => m.priority === filters.value.priority)
  }

  // Apply waiting time filter
  if (filters.value.waitingTime) {
    const now = new Date()
    memos = memos.filter(m => {
      if (!m.submittedAt) return false
      const submitted = new Date(m.submittedAt)
      const diffDays = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (filters.value.waitingTime) {
        case 'today':
          return diffDays === 0
        case 'yesterday':
          return diffDays === 1
        case 'week':
          return diffDays > 7
        case 'month':
          return diffDays > 30
        default:
          return true
      }
    })
  }

  // Apply tab filtering
  if (activeTab.value === 'high-priority') {
    memos = memos.filter(m => m.priority === 'HIGH' || m.priority === 'URGENT')
  } else if (activeTab.value === 'overdue') {
    memos = memos.filter(m => m.submittedAt && isOverdue(m.submittedAt))
  }

  return memos
})

const paginatedMemos = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredMemos.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredMemos.value.length / rowsPerPage.value)
)

// Summary stats
const pendingTotal = computed(() => pendingMemos.value.length)
const pendingChange = computed(() => {
  // In a real app, this would come from comparing with yesterday's count
  return Math.floor(Math.random() * 10) - 2
})

const highPriorityCount = computed(() => 
  pendingMemos.value.filter(m => m.priority === 'HIGH' || m.priority === 'URGENT').length
)

const awaitingResponse = computed(() => 
  pendingMemos.value.filter(m => {
    if (!m.submittedAt) return false
    const submitted = new Date(m.submittedAt)
    const now = new Date()
    const diffHours = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60)
    return diffHours > 24
  }).length
)

const overdueCount = computed(() => 
  pendingMemos.value.filter(m => m.submittedAt && isOverdue(m.submittedAt)).length
)

const avgResponseTime = computed(() => {
  if (pendingMemos.value.length === 0) return 0
  const totalWait = pendingMemos.value.reduce((sum, memo) => {
    if (!memo.submittedAt) return sum
    const submitted = new Date(memo.submittedAt)
    const now = new Date()
    const diffHours = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60)
    return sum + diffHours
  }, 0)
  return Math.round(totalWait / pendingMemos.value.length)
})

const approvalRate = ref(0) // This would come from a stats endpoint
const approvedThisMonth = ref(0) // This would come from a stats endpoint

// Methods
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatPriority = (priority?: string): string => {
  if (!priority) return 'Not Set'
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
}

const formatDate = (date?: string): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getInitials = (name: string): string => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatWaitingTime = (date?: string): string => {
  if (!date) return 'N/A'
  
  const submitted = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - submitted.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  return `${diffDays}d`
}

const isOverdue = (date?: string): boolean => {
  if (!date) return false
  const submitted = new Date(date)
  const now = new Date()
  const diffDays = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays > 3 // Overdue after 3 days
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMemos.value = paginatedMemos.value.map(m => m.id)
  } else {
    selectedMemos.value = []
  }
}

const resetFilters = () => {
  filters.value = {
    branch: '',
    priority: '',
    waitingTime: ''
  }
  searchQuery.value = ''
}

const applyFilters = () => {
  showFilters.value = false
  currentPage.value = 1
}

const refreshData = async () => {
  isRefreshing.value = true
  await fetchPendingMemos()
  showToastMessage('Data refreshed successfully', 'success')
}

const openApprovalModal = (memo: Memo) => {
  selectedMemo.value = memo
  showApproveModal.value = true
}

const openRejectModal = (memo: Memo) => {
  selectedMemo.value = memo
  showRejectModal.value = true
}

const closeModals = () => {
  showApproveModal.value = false
  showRejectModal.value = false
  selectedMemo.value = null
  approvalComment.value = ''
  rejectionReason.value = ''
  requestChanges.value = false
}

const approveMemo = async () => {
  if (!selectedMemo.value) return
  
  try {
    await axiosInstance.post(`/memos/${selectedMemo.value.id}/approve`, {
      comment: approvalComment.value,
      notifyAuthor: notifyAuthor.value
    })
    
    pendingMemos.value = pendingMemos.value.filter(m => m.id !== selectedMemo.value?.id)
    selectedMemos.value = selectedMemos.value.filter(id => id !== selectedMemo.value?.id)
    
    showToastMessage(`Memo ${selectedMemo.value.reference} approved successfully`, 'success')
    closeModals()
    
  } catch (err) {
    console.error('Error approving memo:', err)
    showToastMessage('Failed to approve memo', 'error')
  }
}

const rejectMemo = async () => {
  if (!selectedMemo.value || !rejectionReason.value.trim()) return
  
  try {
    const endpoint = requestChanges.value ? 'request-changes' : 'reject'
    
    await axiosInstance.post(`/memos/${selectedMemo.value.id}/${endpoint}`, {
      reason: rejectionReason.value,
      notifyAuthor: notifyAuthor.value
    })
    
    pendingMemos.value = pendingMemos.value.filter(m => m.id !== selectedMemo.value?.id)
    selectedMemos.value = selectedMemos.value.filter(id => id !== selectedMemo.value?.id)
    
    showToastMessage(`Memo ${selectedMemo.value.reference} ${requestChanges.value ? 'changes requested' : 'rejected'}`, 'error')
    closeModals()
    
  } catch (err) {
    console.error('Error rejecting memo:', err)
    showToastMessage('Failed to reject memo', 'error')
  }
}

const bulkApprove = async () => {
  try {
    await axiosInstance.post('/memos/bulk-approve', {
      memoIds: selectedMemos.value
    })
    
    pendingMemos.value = pendingMemos.value.filter(m => !selectedMemos.value.includes(m.id))
    showToastMessage(`${selectedMemos.value.length} memos approved`, 'success')
    selectedMemos.value = []
    selectAll.value = false
    
  } catch (err) {
    console.error('Error in bulk approve:', err)
    showToastMessage('Failed to approve some memos', 'error')
  }
}

const bulkReject = async () => {
  if (!confirm(`Reject ${selectedMemos.value.length} selected memos?`)) return
  
  try {
    await axiosInstance.post('/memos/bulk-reject', {
      memoIds: selectedMemos.value
    })
    
    pendingMemos.value = pendingMemos.value.filter(m => !selectedMemos.value.includes(m.id))
    showToastMessage(`${selectedMemos.value.length} memos rejected`, 'error')
    selectedMemos.value = []
    selectAll.value = false
    
  } catch (err) {
    console.error('Error in bulk reject:', err)
    showToastMessage('Failed to reject some memos', 'error')
  }
}

const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Watch for page changes
const updatePageWhenFiltered = () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
}

// Initial fetch
onMounted(() => {
  fetchPendingMemos()
})

// Watch for filter changes to reset page
watch([filteredMemos, rowsPerPage], () => {
  updatePageWhenFiltered()
})
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

.message-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: var(--color-white);
  color: var(--color-gray-900);
  font-family: inherit;
  resize: vertical;
}

.dark .message-input {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-gray-100);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
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

.send-btn.reject {
  background-color: #C62828;
}

.send-btn.reject:hover:not(:disabled) {
  background-color: #B71C1C;
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

/* Spinner */
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

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-wrap: wrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>