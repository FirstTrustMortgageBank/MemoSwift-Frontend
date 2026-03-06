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
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Pending Total Card -->
      <div class="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">Pending Approval</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">
            +{{ pendingChange }} since yesterday
          </span>
        </div>
        <div class="flex items-end justify-between mt-2">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ pendingTotal }}</h4>
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
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ highPriorityCount }}</h4>
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
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ awaitingResponse }}</h4>
          <span class="text-sm text-gray-500">Waiting > 24h</span>
        </div>
      </div>

      <!-- Approval Rate Card -->
      <div class="p-5 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">Approval Rate</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {{ approvalRate }}%
          </span>
        </div>
        <div class="flex items-end justify-between mt-2">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ approvedThisMonth }}</h4>
          <span class="text-sm text-gray-500">Approved this month</span>
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
              <option value="head-office">Head Office</option>
              <option value="abuja">Abuja</option>
              <option value="ikeja">Ikeja</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select v-model="filters.priority" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Waiting Time</label>
            <select v-model="filters.waitingTime" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              <option value="">Any Time</option>
              <option value="today">Since Today</option>
              <option value="yesterday">Since Yesterday</option>
              <option value="week">Over 1 Week</option>
              <option value="month">Over 1 Month</option>
            </select>
          </div>

          <!-- Department -->
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
          <span v-if="tab.count" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
            {{ tab.count }}
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
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Waiting</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="memo in filteredMemos" :key="memo.id" class="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
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
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': memo.priority === 'low',
                    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400': memo.priority === 'medium',
                    'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400': memo.priority === 'high',
                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400': memo.priority === 'urgent'
                  }"
                >
                  <span v-if="memo.priority === 'urgent'" class="relative flex h-2 w-2 mr-1">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  {{ formatPriority(memo.priority) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.reference }}</td>
              <td class="px-4 py-3">
                <router-link :to="`/memo/${memo.id}`" class="text-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400">
                  {{ memo.title }}
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
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ formatWaitingTime(memo.submittedDate) }}</span>
                  <span 
                    v-if="isOverdue(memo.submittedDate)"
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
              <td colspan="8" class="py-12 text-center">
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
              <p class="text-sm font-medium text-gray-900 dark:text-white/90">{{ selectedMemo?.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Ref: {{ selectedMemo?.reference }}</p>
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
              <p class="text-sm font-medium text-gray-900 dark:text-white/90">{{ selectedMemo?.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Ref: {{ selectedMemo?.reference }}</p>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const currentPageTitle = ref('Approval Dashboard')
const showFilters = ref(false)
const searchQuery = ref('')
const activeTab = ref('pending')
const selectedMemos = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const rowsPerPage = ref(10)

// Modal states
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedMemo = ref(null)
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
  waitingTime: '',
  department: ''
})

// Tabs
const tabs = [
  { id: 'pending', name: 'Pending', count: 24 },
  { id: 'high-priority', name: 'High Priority', count: 5 },
  { id: 'overdue', name: 'Overdue', count: 3 },
  { id: 'history', name: 'History' }
]

// Mock data - replace with API calls
const pendingMemos = ref([
  {
    id: 1,
    reference: 'MEM-2024-001',
    title: 'Q4 Budget Approval',
    author: 'John Smith',
    branch: 'Head Office',
    priority: 'high',
    submittedDate: '2024-03-14T09:30:00',
    department: 'it'
  },
  {
    id: 2,
    reference: 'MEM-2024-002',
    title: 'Staff Leave Policy Update',
    author: 'Sarah Johnson',
    branch: 'Abuja',
    priority: 'medium',
    submittedDate: '2024-03-13T14:20:00',
    department: 'hr'
  },
  {
    id: 3,
    reference: 'MEM-2024-003',
    title: 'IT Infrastructure Upgrade',
    author: 'Michael Chen',
    branch: 'Ikeja',
    priority: 'urgent',
    submittedDate: '2024-03-12T11:15:00',
    department: 'it'
  },
  {
    id: 4,
    reference: 'MEM-2024-004',
    title: 'Annual General Meeting Plans',
    author: 'Amara Okafor',
    branch: 'Head Office',
    priority: 'low',
    submittedDate: '2024-03-11T16:45:00',
    department: 'operations'
  },
  {
    id: 5,
    reference: 'MEM-2024-005',
    title: 'Health & Safety Compliance',
    author: 'David Okonkwo',
    branch: 'Ikeja',
    priority: 'high',
    submittedDate: '2024-03-10T10:00:00',
    department: 'operations'
  }
])

// Computed
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.branch) count++
  if (filters.value.priority) count++
  if (filters.value.waitingTime) count++
  if (filters.value.department) count++
  return count
})

const filteredMemos = computed(() => {
  let memos = [...pendingMemos.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    memos = memos.filter(m => 
      m.title.toLowerCase().includes(query) ||
      m.reference.toLowerCase().includes(query) ||
      m.author.toLowerCase().includes(query)
    )
  }

  // Apply branch filter
  if (filters.value.branch) {
    memos = memos.filter(m => {
      const branchMap = {
        'head-office': 'Head Office',
        'abuja': 'Abuja',
        'ikeja': 'Ikeja'
      }
      return m.branch === branchMap[filters.value.branch]
    })
  }

  // Apply priority filter
  if (filters.value.priority) {
    memos = memos.filter(m => m.priority === filters.value.priority)
  }

  // Apply department filter
  if (filters.value.department) {
    memos = memos.filter(m => m.department === filters.value.department)
  }

  // Apply waiting time filter
  if (filters.value.waitingTime) {
    const now = new Date()
    memos = memos.filter(m => {
      const submitted = new Date(m.submittedDate)
      const diffDays = Math.floor((now - submitted) / (1000 * 60 * 60 * 24))
      
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

  return memos
})

const totalPages = computed(() => 
  Math.ceil(filteredMemos.value.length / rowsPerPage.value)
)

// Summary stats
const pendingTotal = computed(() => pendingMemos.value.length)
const pendingChange = ref(5)
const highPriorityCount = computed(() => pendingMemos.value.filter(m => m.priority === 'urgent').length)
const awaitingResponse = computed(() => pendingMemos.value.filter(m => {
  const submitted = new Date(m.submittedDate)
  const now = new Date()
  const diffHours = (now - submitted) / (1000 * 60 * 60)
  return diffHours > 24
}).length)
const avgResponseTime = ref(12)
const approvalRate = ref(85)
const approvedThisMonth = ref(128)

// Methods
const formatPriority = (priority) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatWaitingTime = (date) => {
  const submitted = new Date(date)
  const now = new Date()
  const diffMs = now - submitted
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  return `${diffDays}d`
}

const isOverdue = (date) => {
  const submitted = new Date(date)
  const now = new Date()
  const diffDays = (now - submitted) / (1000 * 60 * 60 * 24)
  return diffDays > 3 // Overdue after 3 days
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMemos.value = filteredMemos.value.map(m => m.id)
  } else {
    selectedMemos.value = []
  }
}

const resetFilters = () => {
  filters.value = {
    branch: '',
    priority: '',
    waitingTime: '',
    department: ''
  }
  searchQuery.value = ''
}

const applyFilters = () => {
  showFilters.value = false
  currentPage.value = 1
}

const refreshData = () => {
  showToastMessage('Data refreshed', 'success')
}

const openApprovalModal = (memo) => {
  selectedMemo.value = memo
  showApproveModal.value = true
}

const openRejectModal = (memo) => {
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

const approveMemo = () => {
  console.log('Approving memo:', selectedMemo.value?.id, 'Comment:', approvalComment.value)
  // In real app: API call to approve
  
  // Remove from list
  pendingMemos.value = pendingMemos.value.filter(m => m.id !== selectedMemo.value?.id)
  selectedMemos.value = selectedMemos.value.filter(id => id !== selectedMemo.value?.id)
  
  showToastMessage(`Memo ${selectedMemo.value?.reference} approved successfully`, 'success')
  closeModals()
}

const rejectMemo = () => {
  if (!rejectionReason.value.trim()) return
  
  console.log('Rejecting memo:', selectedMemo.value?.id, 'Reason:', rejectionReason.value)
  // In real app: API call to reject
  
  // Remove from list
  pendingMemos.value = pendingMemos.value.filter(m => m.id !== selectedMemo.value?.id)
  selectedMemos.value = selectedMemos.value.filter(id => id !== selectedMemo.value?.id)
  
  showToastMessage(`Memo ${selectedMemo.value?.reference} rejected`, 'error')
  closeModals()
}

const bulkApprove = () => {
  console.log('Bulk approve:', selectedMemos.value)
  pendingMemos.value = pendingMemos.value.filter(m => !selectedMemos.value.includes(m.id))
  showToastMessage(`${selectedMemos.value.length} memos approved`, 'success')
  selectedMemos.value = []
}

const bulkReject = () => {
  if (!confirm(`Reject ${selectedMemos.value.length} selected memos?`)) return
  
  console.log('Bulk reject:', selectedMemos.value)
  pendingMemos.value = pendingMemos.value.filter(m => !selectedMemos.value.includes(m.id))
  showToastMessage(`${selectedMemos.value.length} memos rejected`, 'error')
  selectedMemos.value = []
}

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

onMounted(() => {
  // In real app: fetch pending memos from API
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