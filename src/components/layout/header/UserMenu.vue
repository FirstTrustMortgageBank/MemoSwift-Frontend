<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
    >
      <span class="mr-3 flex items-center justify-center overflow-hidden rounded-full h-11 w-11 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-medium text-lg">
        {{ userInitials }}
      </span>

      <span class="block mr-1 font-medium text-theme-sm">{{ userFirstName }}</span>

      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ userFullName }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{ userEmail }}
        </span>
        <span v-if="userRole" class="mt-1 inline-block px-2 py-0.5 text-theme-xs font-medium rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          {{ userRole }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li v-for="item in menuItems" :key="item.href">
          <router-link
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            @click="closeDropdown"
          >
            <component
              :is="item.icon"
              class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />
            {{ item.text }}
          </router-link>
        </li>
      </ul>
      <router-link
        to="/"
        @click="signOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
      >
        <LogoutIcon
          class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        />
        Sign out
      </router-link>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup>
import { UserCircleIcon, ChevronDownIcon, LogoutIcon, SettingsIcon, InfoCircleIcon } from '@/icons'
import { RouterLink, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'

const router = useRouter()
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

// ========== USER DATA FROM LOCAL STORAGE ==========
// Parse user from localStorage (with error handling)
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

// Reactive user data
const user = ref(getUserFromStorage())

// Computed properties with safe fallbacks
const userFullName = computed(() => {
  return user.value?.username || 'User'
})

const userFirstName = computed(() => {
  const fullName = userFullName.value
  // Check if fullName exists before calling split
  if (!fullName) return 'User'
  const parts = fullName.split(' ')
  return parts[0] || 'User'
})

const userEmail = computed(() => {
  return user.value?.email || 'No email'
})

const userRole = computed(() => {
  const roles = user.value?.roles
  if (Array.isArray(roles) && roles.length > 0) {
    return roles[0].charAt(0).toUpperCase() + roles[0].slice(1)
  }
  return null
})

const userInitials = computed(() => {
  const fullName = userFullName.value
  if (!fullName || fullName === 'User') return 'U'
  
  const nameParts = fullName.split(' ').filter(part => part.length > 0)
  
  if (nameParts.length === 0) return 'U'
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase()
  }
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
})

// ========== MENU ITEMS ==========
const menuItems = [
  { href: '/profile', icon: UserCircleIcon, text: 'Edit profile' },
  { href: '/settings', icon: SettingsIcon, text: 'Account settings' },
  { href: '/support', icon: InfoCircleIcon, text: 'Support' },
]

// ========== DROPDOWN ACTIONS ==========
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = () => {
  // Clear all auth data from localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('id')
  
  // Clear user ref
  user.value = null
  
  // Close dropdown
  closeDropdown()
  
  // Redirect to login page
  router.push('/')
  
  console.log('Signed out successfully')
}

// ========== CLICK OUTSIDE HANDLER ==========
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// ========== WATCH FOR STORAGE CHANGES ==========
const handleStorageChange = () => {
  user.value = getUserFromStorage()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('storage', handleStorageChange)
})
</script>