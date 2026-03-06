<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      @click="toggleDropdown"
    >
      <span
        :class="{ hidden: !hasNotifications, flex: hasNotifications }"
        class="absolute right-0 top-0.5 z-1 h-2 w-2 rounded-full bg-brand-500"
      >
        <span
          class="absolute inline-flex w-full h-full rounded-full opacity-75 -z-1 animate-ping bg-brand-500"
        ></span>
      </span>
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
          d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          fill=""
        />
      </svg>
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:w-[361px] lg:right-0"
    >
      <div
        class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800"
      >
        <h5 class="text-lg font-semibold text-gray-800 dark:text-white/90">Memo Notifications</h5>

        <button @click="closeDropdown" class="text-gray-500 dark:text-gray-400">
          <svg
            class="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <ul class="flex flex-col h-auto overflow-y-auto custom-scrollbar">
        <li v-for="notification in notifications" :key="notification.id">
          <a
            href="#"
            class="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
            @click.prevent="handleItemClick(notification)"
          >
            <span class="relative block w-full h-10 rounded-full z-1 max-w-10">
              <!-- MemoSwift Avatar - Using initials with color-coded backgrounds -->
              <span 
                class="flex items-center justify-center w-full h-full overflow-hidden rounded-full"
                :class="notification.avatarBg"
              >
                <span class="text-sm font-medium text-white">
                  {{ getInitials(notification.userName) }}
                </span>
              </span>
              <span
                :class="notification.status === 'online' ? 'bg-success-500' : 'bg-gray-400'"
                class="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white dark:border-gray-900"
              ></span>
            </span>

            <span class="block flex-1">
              <span class="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                <span class="font-medium text-gray-800 dark:text-white/90">
                  {{ notification.userName }}
                </span>
                {{ notification.action }}
                <span class="font-medium text-brand-500 dark:text-brand-400">
                  "{{ notification.memo }}"
                </span>
              </span>

              <span class="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <!-- Dynamic icon based on notification type -->
                  <svg v-if="notification.type === 'Approval'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <svg v-else-if="notification.type === 'Comment'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <svg v-else-if="notification.type === 'Share'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                  <svg v-else-if="notification.type === 'Mention'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <svg v-else-if="notification.type === 'Assignment'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <svg v-else-if="notification.type === 'Edit'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  <svg v-else-if="notification.type === 'Archive'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                  <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  {{ notification.type }}
                </span>
                <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ notification.time }}
                </span>
              </span>
            </span>
          </a>
        </li>
        
        <!-- Empty state if no notifications -->
        <li v-if="notifications.length === 0" class="py-8 text-center">
          <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <p class="mt-2 text-gray-500 dark:text-gray-400">No memo notifications</p>
        </li>
      </ul>

      <router-link
        to="/notifications"
        class="mt-3 flex items-center justify-center gap-2 rounded-lg border border-brand-500 bg-brand-50 p-3 text-theme-sm font-medium text-brand-600 shadow-theme-xs hover:bg-brand-500 hover:text-white dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500 dark:hover:text-white transition-colors"
        @click="handleViewAllClick"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        View All Memo Notifications
      </router-link>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink } from 'vue-router'

const dropdownOpen = ref(false)
const notifying = ref(true)
const dropdownRef = ref(null)

// MemoSwift color palette using theme colors
const avatarColors = [
  'bg-brand-500',
  'bg-purple-500',
  'bg-success-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-error-500',
  'bg-warning-500',
  'bg-blue-light-500'
]

const notifications = ref([
  {
    id: 1,
    userName: 'Alex Chen',
    action: 'commented on',
    memo: 'Q4 Budget Proposal',
    type: 'Comment',
    time: '5 min ago',
    status: 'online',
    avatarBg: 'bg-brand-500',
    memoId: 'MEM-2024-012'
  },
  {
    id: 2,
    userName: 'Sarah Kim',
    action: 'shared',
    memo: 'HR Policy Updates 2024',
    type: 'Share',
    time: '15 min ago',
    status: 'offline',
    avatarBg: 'bg-purple-500',
    memoId: 'MEM-2024-008'
  },
  {
    id: 3,
    userName: 'Marcus Wright',
    action: 'mentioned you in',
    memo: 'IT Infrastructure Review',
    type: 'Mention',
    time: '1 hour ago',
    status: 'online',
    avatarBg: 'bg-success-500',
    memoId: 'MEM-2024-015'
  },
  {
    id: 4,
    userName: 'Priya Patel',
    action: 'assigned you to review',
    memo: 'Marketing Strategy 2025',
    type: 'Assignment',
    time: '2 hours ago',
    status: 'online',
    avatarBg: 'bg-orange-500',
    memoId: 'MEM-2024-021'
  },
  {
    id: 5,
    userName: 'James Wilson',
    action: 'requested approval for',
    memo: 'Q3 Financial Report',
    type: 'Approval',
    time: '3 hours ago',
    status: 'offline',
    avatarBg: 'bg-error-500',
    memoId: 'MEM-2024-009'
  },
  {
    id: 6,
    userName: 'Elena Rodriguez',
    action: 'updated',
    memo: 'Project Timeline Memo',
    type: 'Edit',
    time: '5 hours ago',
    status: 'online',
    avatarBg: 'bg-indigo-500',
    memoId: 'MEM-2024-018'
  },
  {
    id: 7,
    userName: 'David Park',
    action: 'archived',
    memo: '2023 Annual Review',
    type: 'Archive',
    time: '1 day ago',
    status: 'offline',
    avatarBg: 'bg-teal-500',
    memoId: 'MEM-2023-045'
  },
  {
    id: 8,
    userName: 'Lisa Thompson',
    action: 'restored a previous version of',
    memo: 'Product Launch Plan',
    type: 'Restore',
    time: '2 days ago',
    status: 'online',
    avatarBg: 'bg-warning-500',
    memoId: 'MEM-2024-007'
  }
])

// Check if there are unread notifications (for the red dot)
const hasNotifications = computed(() => {
  return notifications.value.some(n => n.status === 'online')
})

// Get initials from username
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  // Clear notification dot when dropdown opens
  if (dropdownOpen.value) {
    notifying.value = false
  }
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

const handleItemClick = (notification) => {
  console.log('Notification clicked:', notification)
  // Navigate to specific memo
  // router.push(`/memo/${notification.memoId}`)
  closeDropdown()
}

const handleViewAllClick = () => {
  console.log('View All Notifications clicked')
  closeDropdown()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom scrollbar for the notifications list */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-gray-800);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-gray-600);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

/* Ensure proper positioning on mobile */
@media (max-width: 640px) {
  .absolute.-right-\[240px\] {
    right: -120px;
  }
}
</style>