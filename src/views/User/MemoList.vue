<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="loading-spinner"></div>
      <p class="ml-3 text-gray-500 dark:text-gray-400">Loading your memos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center bg-white rounded-2xl dark:bg-gray-900">
      <svg class="w-16 h-16 mx-auto text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white/90">Error Loading Memos</h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">{{ error }}</p>
      <button @click="fetchMemos" class="px-4 py-2 mt-4 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600">
        Try Again
      </button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Header with actions -->
      <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Memos Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your memos across all branches
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
              <option value="Head Office">Head Office</option>
              <option value="Abuja">Abuja</option>
              <option value="Ikeja">Ikeja</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select v-model="filters.status" class="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
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
      <div class="relative mb-6">
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

      <!-- Memos Waiting for Approval Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90">Memos Waiting for My Approval</h2>
          <span class="px-3 py-1 text-sm font-medium bg-warning-100 text-warning-700 rounded-full dark:bg-warning-500/20 dark:text-warning-400">
            {{ pendingApprovals.length }} pending
          </span>
        </div>
        
        <ComponentCard title="Approval Queue">
          <!-- Memo Count Summary -->
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Showing <span class="font-medium">{{ paginatedPendingApprovals.length }}</span> of <span class="font-medium">{{ pendingApprovals.length }}</span> memos
            </p>
            <button @click="fetchMemos" class="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>

          <!-- Approval Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Reference</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Author</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Branch</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="memo in paginatedPendingApprovals" :key="memo.id" class="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.reference }}</td>
                  <td class="px-4 py-3">
                    <router-link :to="`/memo/${memo.id}`" class="text-sm font-medium text-gray-800 hover:text-brand-500 dark:text-white/90 dark:hover:text-brand-400">
                      {{ memo.title }}
                    </router-link>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.authorName || memo.author }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ memo.branch }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(memo.createdAt) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button @click="viewMemo(memo.id)" class="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400" title="View">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button @click="router.push(`/memo/${memo.id}`)" class="p-1 text-success-500 hover:text-success-600" title="Approve">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button @click="router.push(`/memo/${memo.id}`)" class="p-1 text-error-500 hover:text-error-600" title="Reject">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                
                <!-- Empty State -->
                <tr v-if="pendingApprovals.length === 0">
                  <td colspan="6" class="py-8 text-center">
                    <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="mt-2 text-gray-500 dark:text-gray-400">No memos waiting for your approval</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Approval Pagination -->
          <div v-if="pendingApprovals.length > rowsPerPage" class="flex items-center justify-between px-4 py-3 mt-4 border-t border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
              <select v-model="pendingRowsPerPage" class="h-8 px-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Page {{ pendingCurrentPage }} of {{ pendingTotalPages }}
              </span>
              <div class="flex items-center gap-2">
                <button @click="pendingCurrentPage--" :disabled="pendingCurrentPage === 1" class="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button @click="pendingCurrentPage++" :disabled="pendingCurrentPage === pendingTotalPages" class="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      <!-- My Memos Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90">My Memos</h2>
          <span class="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full dark:bg-gray-800 dark:text-gray-400">
            {{ myMemos.length }} total
          </span>
        </div>

        <!-- Memo List Table Card -->
        <ComponentCard title="My Memos">
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
              Showing <span class="font-medium">{{ paginatedMyMemos.length }}</span> of <span class="font-medium">{{ filteredMyMemos.length }}</span> memos
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
                <tr v-for="memo in paginatedMyMemos" :key="memo.id" class="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
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
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(memo.createdAt) }}</td>
                  <td class="px-4 py-3">
                    <span
                      :class="{
                        'px-2 py-1 text-xs font-medium rounded-full': true,
                        'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500': memo.status === 'PENDING_APPROVAL',
                        'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500': memo.status === 'APPROVED',
                        'bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400': memo.status === 'DRAFT',
                        'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500': memo.status === 'REJECTED'
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
                      <button v-if="memo.status === 'DRAFT'" @click="openDeleteModal(memo)" class="p-1 text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400" title="Delete">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                
                <!-- Empty State -->
                <tr v-if="filteredMyMemos.length === 0">
                  <td colspan="7" class="py-12 text-center">
                    <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white/90">No memos found</h3>
                    <p class="mt-2 text-gray-500 dark:text-gray-400">{{ searchQuery || filters.status || filters.branch ? 'Try adjusting your filters' : 'You haven\'t created any memos yet' }}</p>
                    <router-link to="/memo" class="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Create Your First Memo
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bulk Actions Bar - Only shows when selected memos are all drafts -->
          <div v-if="selectedMemos.length > 0 && allSelectedAreDrafts" class="flex items-center justify-between px-4 py-3 mt-4 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ selectedMemos.length }} draft memo(s) selected
            </span>
            <div class="flex items-center gap-2">
              <button @click="openBulkDeleteModal" class="px-3 py-1.5 text-sm font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/15 dark:text-error-500 dark:hover:bg-error-500/25">
                Delete Selected
              </button>
              <button @click="selectedMemos = []" class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
          
          <!-- Warning message if selected memos include non-drafts -->
          <div v-else-if="selectedMemos.length > 0 && !allSelectedAreDrafts" class="flex items-center justify-between px-4 py-3 mt-4 border-t border-gray-200 bg-warning-50 dark:bg-warning-500/10">
            <span class="text-sm text-warning-600 dark:text-warning-500">
              <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              Only draft memos can be deleted. Selected items include non-draft memos.
            </span>
            <button @click="selectedMemos = []" class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              Cancel
            </button>
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
                Page {{ myMemosCurrentPage }} of {{ myMemosTotalPages }}
              </span>
              <div class="flex items-center gap-2">
                <button @click="myMemosCurrentPage--" :disabled="myMemosCurrentPage === 1" class="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button @click="myMemosCurrentPage++" :disabled="myMemosCurrentPage === myMemosTotalPages" class="p-1 text-gray-500 hover:text-brand-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </template>

    <!-- Delete Confirmation Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-content max-w-md">
          <div class="modal-header">
            <h3>Delete {{ isBulkDelete ? 'Memos' : 'Memo' }}</h3>
            <button @click="closeDeleteModal" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="flex items-center justify-center mb-4 text-error-500">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
            
            <p class="text-center text-gray-700 dark:text-gray-300 mb-2">
              <span v-if="isBulkDelete">
                Are you sure you want to delete <span class="font-semibold">{{ selectedMemos.length }}</span> selected memos?
              </span>
              <span v-else>
                Are you sure you want to delete "<span class="font-semibold">{{ memoToDelete?.title }}</span>"?
              </span>
            </p>
            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
          
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="cancel-btn">Cancel</button>
            <button 
              @click="confirmDelete" 
              class="send-btn reject"
              :disabled="isDeleting"
            >
              <svg v-if="isDeleting" class="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success/Error Toast -->
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import axios from 'axios'

const router = useRouter()
const currentPageTitle = ref('Memos Dashboard')

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1'

// Auth token helper
const getAuthHeader = () => {
  const token = JSON.parse(localStorage.getItem('token') || '{}')
  return { Authorization: `Bearer ${token}` }
}

// Get current user
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

const currentUser = getCurrentUser()
const currentUserId = currentUser?.id

// State
const isLoading = ref(true)
const error = ref(null)
const memos = ref([])
const showFilters = ref(false)
const searchQuery = ref('')
const selectedMemos = ref([])
const selectAll = ref(false)

// Pagination for My Memos
const myMemosCurrentPage = ref(1)
const rowsPerPage = ref(10)

// Pagination for Pending Approvals
const pendingCurrentPage = ref(1)
const pendingRowsPerPage = ref(5)

const sortBy = ref('date-desc')

// Delete modal state
const showDeleteModal = ref(false)
const memoToDelete = ref(null)
const isBulkDelete = ref(false)
const isDeleting = ref(false)

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Filters
const filters = ref({
  branch: '',
  status: '',
  dateRange: 'all',
  startDate: '',
  endDate: ''
})

// Fetch all memos from API
const fetchMemos = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Fetch memos created by the user
    const myMemosResponse = await axios.get(`${API_BASE_URL}/memos/me`, {
      headers: getAuthHeader()
    })
    
    console.log('My memos response:', myMemosResponse.data)
    
    // Handle the response structure
    const myMemosData = myMemosResponse.data?.data[0] || myMemosResponse.data
    const myMemosList = Array.isArray(myMemosData) ? myMemosData : (myMemosData?.data || [])
    
    // Fetch memos pending for current user's approval
    const pendingResponse = await axios.get(`${API_BASE_URL}/memos/pending`, {
      headers: getAuthHeader()
    }).catch(err => {
      console.log('Pending endpoint not available, using filter method')
      return null
    })
    
    let pendingList = []
    if (pendingResponse?.data) {
      const pendingData = pendingResponse.data?.data || pendingResponse.data
      pendingList = Array.isArray(pendingData) ? pendingData : (pendingData?.data || [])
    } else {
      // Filter from all memos if endpoint not available
      pendingList = myMemosList.filter(m => 
        m.currentApproverId === currentUserId && 
        m.status === 'PENDING_APPROVAL'
      )
    }
    
    // Store all memos with a flag for pending approvals
    memos.value = myMemosList.map(memo => ({
      ...memo,
      isPendingForMe: pendingList.some(p => p.id === memo.id) || 
                     (memo.currentApproverId === currentUserId && memo.status === 'PENDING_APPROVAL')
    }))
    
  } catch (err) {
    console.error('Error fetching memos:', err)
    error.value = err.response?.data?.message || 'Failed to load memos. Please try again.'
    memos.value = []
  } finally {
    isLoading.value = false
  }
}

// Computed for Pending Approvals
const pendingApprovals = computed(() => {
  return memos.value.filter(memo => 
    memo.isPendingForMe || 
    (memo.currentApproverId === currentUserId && memo.status === 'PENDING_APPROVAL')
  )
})

const filteredPendingApprovals = computed(() => {
  let filtered = [...pendingApprovals.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(memo => 
      memo.title?.toLowerCase().includes(query) ||
      memo.reference?.toLowerCase().includes(query)
    )
  }

  // Apply branch filter
  if (filters.value.branch) {
    filtered = filtered.filter(memo => memo.branch === filters.value.branch)
  }

  return filtered
})

const pendingTotalPages = computed(() => 
  Math.ceil(filteredPendingApprovals.value.length / pendingRowsPerPage.value)
)

const paginatedPendingApprovals = computed(() => {
  const start = (pendingCurrentPage.value - 1) * pendingRowsPerPage.value
  const end = start + pendingRowsPerPage.value
  return filteredPendingApprovals.value.slice(start, end)
})

// Computed for My Memos
const myMemos = computed(() => {
  return memos.value.filter(memo => 
    !(memo.isPendingForMe || (memo.currentApproverId === currentUserId && memo.status === 'PENDING_APPROVAL'))
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.branch) count++
  if (filters.value.status) count++
  if (filters.value.dateRange !== 'all') count++
  return count
})

const allSelectedAreDrafts = computed(() => {
  if (selectedMemos.value.length === 0) return false
  const selectedMemosList = myMemos.value.filter(m => selectedMemos.value.includes(m.id))
  return selectedMemosList.every(m => m.status === 'DRAFT')
})

const filteredMyMemos = computed(() => {
  let filtered = [...myMemos.value]

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(memo => 
      memo.title?.toLowerCase().includes(query) ||
      memo.reference?.toLowerCase().includes(query)
    )
  }

  // Apply branch filter
  if (filters.value.branch) {
    filtered = filtered.filter(memo => memo.branch === filters.value.branch)
  }

  // Apply status filter
  if (filters.value.status) {
    filtered = filtered.filter(memo => memo.status === filters.value.status)
  }

  // Apply date filter
  if (filters.value.dateRange === 'today') {
    const today = new Date().toISOString().split('T')[0]
    filtered = filtered.filter(memo => {
      const memoDate = memo.createdAt ? memo.createdAt.split('T')[0] : ''
      return memoDate === today
    })
  } else if (filters.value.dateRange === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    filtered = filtered.filter(memo => {
      const memoDate = memo.createdAt ? memo.createdAt.split('T')[0] : ''
      return memoDate >= weekAgoStr
    })
  } else if (filters.value.dateRange === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const monthAgoStr = monthAgo.toISOString().split('T')[0]
    filtered = filtered.filter(memo => {
      const memoDate = memo.createdAt ? memo.createdAt.split('T')[0] : ''
      return memoDate >= monthAgoStr
    })
  } else if (filters.value.dateRange === 'custom' && filters.value.startDate && filters.value.endDate) {
    filtered = filtered.filter(memo => {
      const memoDate = memo.createdAt ? memo.createdAt.split('T')[0] : ''
      return memoDate >= filters.value.startDate && memoDate <= filters.value.endDate
    })
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
    const titleA = a.title || ''
    const titleB = b.title || ''
    
    switch (sortBy.value) {
      case 'date-desc':
        return dateB - dateA
      case 'date-asc':
        return dateA - dateB
      case 'title-asc':
        return titleA.localeCompare(titleB)
      case 'title-desc':
        return titleB.localeCompare(titleA)
      default:
        return 0
    }
  })

  return filtered
})

const myMemosTotalPages = computed(() => 
  Math.ceil(filteredMyMemos.value.length / rowsPerPage.value)
)

const paginatedMyMemos = computed(() => {
  const start = (myMemosCurrentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredMyMemos.value.slice(start, end)
})

// Watch for filter changes to reset pagination
watch([filters, searchQuery, sortBy], () => {
  myMemosCurrentPage.value = 1
  pendingCurrentPage.value = 1
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

const formatStatus = (status) => {
  const statusMap = {
    'DRAFT': 'Draft',
    'PENDING_APPROVAL': 'Pending Approval',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected'
  }
  return statusMap[status] || status || 'Unknown'
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMemos.value = paginatedMyMemos.value.map(m => m.id)
  } else {
    selectedMemos.value = []
  }
}

watch(selectedMemos, (newVal) => {
  selectAll.value = paginatedMyMemos.value.length > 0 && 
    paginatedMyMemos.value.every(m => newVal.includes(m.id))
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
  // Implement debounced search if needed
}

const viewMemo = (id) => {
  router.push(`/memo/${id}`)
}

const editMemo = (id) => {
  router.push(`/memo/${id}`)
}

// Delete modal methods
const openDeleteModal = (memo) => {
  memoToDelete.value = memo
  isBulkDelete.value = false
  showDeleteModal.value = true
}

const openBulkDeleteModal = () => {
  if (selectedMemos.value.length === 0) return
  
  // Check if all selected are drafts
  const selectedMemosList = myMemos.value.filter(m => selectedMemos.value.includes(m.id))
  const nonDrafts = selectedMemosList.filter(m => m.status !== 'DRAFT')
  
  if (nonDrafts.length > 0) {
    showToastMessage('Only draft memos can be deleted. Please unselect non-draft memos.', 'error')
    return
  }
  
  isBulkDelete.value = true
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  memoToDelete.value = null
  isBulkDelete.value = false
}

const confirmDelete = async () => {
  try {
    isDeleting.value = true
    
    if (isBulkDelete.value) {
      await Promise.all(selectedMemos.value.map(id => 
        axios.delete(`${API_BASE_URL}/memos/${id}`, {
          headers: getAuthHeader()
        })
      ))
      
      // Remove from local list
      memos.value = memos.value.filter(m => !selectedMemos.value.includes(m.id))
      showToastMessage(`${selectedMemos.value.length} memos deleted successfully`, 'success')
      selectedMemos.value = []
      await fetchMemos() // Refresh list after bulk delete
    } else {
      await axios.delete(`${API_BASE_URL}/memos/${memoToDelete.value.id}`, {
        headers: getAuthHeader()
      })
      
      // Remove from local list
      memos.value = memos.value.filter(m => m.id !== memoToDelete.value.id)
      selectedMemos.value = selectedMemos.value.filter(id => id !== memoToDelete.value.id)
      showToastMessage('Memo deleted successfully', 'success')
      await fetchMemos() // Refresh list after single delete
    }
    
    closeDeleteModal()
    
  } catch (err) {
    console.error('Error deleting memo(s):', err)
    const errorMessage = err.response?.data?.message || 'Failed to delete. Please try again.'
    showToastMessage(errorMessage, 'error')
  } finally {
    isDeleting.value = false
  }
}

// Toast methods
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Load memos on mount
onMounted(() => {
  fetchMemos()
})
</script>

<style scoped>
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-brand-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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
  width: 500px;
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
</style>