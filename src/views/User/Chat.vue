<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
      <!-- Contacts Sidebar -->
      <div class="lg:w-80 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col">
        <!-- Search Contacts -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="contactSearch"
              type="text"
              placeholder="Search contacts..."
              class="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <!-- Contacts Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-800">
          <button 
            v-for="tab in contactTabs" 
            :key="tab.id"
            @click="activeContactTab = tab.id"
            :class="[
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeContactTab === tab.id
                ? 'text-brand-600 border-b-2 border-brand-500 dark:text-brand-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            {{ tab.name }}
            <span v-if="tab.count" class="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Contacts List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="filteredContacts.length === 0" class="p-8 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p class="mt-2 text-gray-500 dark:text-gray-400">No contacts found</p>
          </div>

          <div v-for="contact in filteredContacts" :key="contact.id" class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors" :class="{ 'bg-gray-50 dark:bg-gray-800': selectedContact?.id === contact.id }" @click="selectContact(contact)">
            <div class="flex items-start gap-3">
              <!-- Avatar with status -->
              <div class="relative flex-shrink-0">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-semibold">
                  {{ getInitials(contact.name) }}
                </div>
                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900" :class="{
                  'bg-success-500': contact.status === 'online',
                  'bg-gray-400': contact.status === 'away',
                  'bg-gray-500': contact.status === 'offline'
                }"></span>
              </div>

              <!-- Contact Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-800 dark:text-white/90 truncate">{{ contact.name }}</h4>
                  <span class="text-xs text-gray-400">{{ formatLastSeen(contact.lastSeen) }}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ contact.department }} • {{ contact.branch }}</p>
                
                <!-- Last Message Preview -->
                <div v-if="contact.lastMessage" class="flex items-center gap-2 mt-1">
                  <p class="text-xs text-gray-400 truncate">{{ contact.lastMessage }}</p>
                  <span v-if="contact.unreadCount" class="px-1.5 py-0.5 text-xs font-medium bg-brand-500 text-white rounded-full min-w-[1.25rem] text-center">
                    {{ contact.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col">
        <!-- Chat Header -->
        <div v-if="selectedContact" class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-semibold">
                {{ getInitials(selectedContact.name) }}
              </div>
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900" :class="{
                'bg-success-500': selectedContact.status === 'online',
                'bg-gray-400': selectedContact.status === 'away',
                'bg-gray-500': selectedContact.status === 'offline'
              }"></span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-white/90">{{ selectedContact.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedContact.department }} • {{ selectedContact.branch }}
                <span class="mx-1">•</span>
                <span :class="{
                  'text-success-500': selectedContact.status === 'online',
                  'text-gray-400': selectedContact.status !== 'online'
                }">
                  {{ formatStatus(selectedContact.status) }}
                </span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button class="p-2 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-800" title="Voice Call">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </button>
            <button class="p-2 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-800" title="Video Call">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
            <button class="p-2 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-800" title="More Options">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- No Contact Selected -->
        <div v-if="!selectedContact" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white/90">No conversation selected</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Choose a contact to start chatting</p>
          </div>
        </div>

        <!-- Messages -->
        <div v-else ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-for="message in messages" :key="message.id" class="flex" :class="{ 'justify-end': message.isMine }">
            <!-- Message Bubble -->
            <div class="max-w-[70%] flex gap-3" :class="{ 'flex-row-reverse': message.isMine }">
              <!-- Avatar (only for others) -->
              <div v-if="!message.isMine" class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                  {{ getInitials(selectedContact.name) }}
                </div>
              </div>

              <!-- Message Content -->
              <div>
                <div class="rounded-2xl px-4 py-2 text-sm" :class="message.isMine ? 'bg-brand-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-bl-none'">
                  <p>{{ message.content }}</p>
                </div>
                
                <!-- Message Meta -->
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-400" :class="{ 'justify-end': message.isMine }">
                  <span>{{ formatTime(message.timestamp) }}</span>
                  <span v-if="message.isMine" class="flex items-center gap-1">
                    <svg v-if="message.status === 'sent'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <svg v-else-if="message.status === 'delivered'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M9 13l2 2 6-6"></path>
                    </svg>
                    <svg v-else-if="message.status === 'read'" class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M9 13l2 2 6-6"></path>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              {{ getInitials(selectedContact.name) }}
            </div>
            <div class="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 rounded-bl-none">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div v-if="selectedContact" class="p-4 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-end gap-2">
            <div class="flex-1 relative">
              <textarea
                v-model="newMessage"
                rows="1"
                placeholder="Type your message..."
                class="w-full px-4 py-3 pr-12 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                @keydown.enter.prevent="sendMessage"
                @input="autoResize"
                ref="messageInput"
              ></textarea>
              
              <!-- Attachment Button -->
              <button class="absolute right-3 bottom-3 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </button>
            </div>

            <!-- Emoji Picker -->
            <button class="p-3 text-gray-400 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>

            <!-- Send Button -->
            <button 
              @click="sendMessage"
              :disabled="!newMessage.trim()"
              class="p-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>

          <!-- Typing Indicator (self) -->
          <div v-if="isTypingSelf" class="mt-2 text-xs text-gray-400">
            You are typing...
          </div>
        </div>
      </div>

      <!-- User Info Sidebar (optional) -->
      <div v-if="selectedContact && showUserInfo" class="lg:w-80 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800 dark:text-white/90">User Info</h3>
            <button @click="showUserInfo = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xl font-semibold mb-3">
              {{ getInitials(selectedContact.name) }}
            </div>
            <h4 class="font-semibold text-gray-800 dark:text-white/90">{{ selectedContact.name }}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ selectedContact.department }}</p>

            <div class="flex justify-center gap-2 mb-4">
              <span class="px-2 py-1 text-xs font-medium rounded-full" :class="{
                'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500': selectedContact.status === 'online',
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400': selectedContact.status === 'away',
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400': selectedContact.status === 'offline'
              }">
                {{ formatStatus(selectedContact.status) }}
              </span>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {{ selectedContact.branch }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contact Details -->
        <div class="p-6 space-y-4">
          <div>
            <h5 class="text-xs font-medium text-gray-400 uppercase mb-2">Contact Information</h5>
            <div class="space-y-2">
              <div class="flex items-center gap-3 text-sm">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="text-gray-600 dark:text-gray-400">{{ selectedContact.email || 'email@example.com' }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span class="text-gray-600 dark:text-gray-400">{{ selectedContact.phone || '+234 XXX XXX XXXX' }}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 class="text-xs font-medium text-gray-400 uppercase mb-2">Shared Files</h5>
            <div class="space-y-2">
              <div v-for="file in sharedFiles" :key="file.name" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{{ file.name }}</p>
                  <p class="text-xs text-gray-400">{{ file.size }}</p>
                </div>
                <button class="text-gray-400 hover:text-brand-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toggle User Info Button (when hidden) -->
      <button 
        v-if="selectedContact && !showUserInfo" 
        @click="showUserInfo = true"
        class="fixed right-6 bottom-24 lg:static lg:right-auto lg:bottom-auto p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
      >
        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </button>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const currentPageTitle = ref('Chat')
const contactSearch = ref('')
const activeContactTab = ref('all')
const selectedContact = ref(null)
const showUserInfo = ref(false)
const newMessage = ref('')
const isTyping = ref(false)
const isTypingSelf = ref(false)
const messagesContainer = ref(null)
const messageInput = ref(null)

// Contacts tabs
const contactTabs = [
  { id: 'all', name: 'All', count: 24 },
  { id: 'online', name: 'Online', count: 8 },
  { id: 'unread', name: 'Unread', count: 3 },
  { id: 'groups', name: 'Groups', count: 4 }
]

// Mock contacts data
const contacts = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    department: 'HR',
    branch: 'Head Office',
    status: 'online',
    lastSeen: new Date(),
    lastMessage: 'Please review the updated policy',
    unreadCount: 2,
    email: 'sarah.johnson@firsttrust.com',
    phone: '+234 801 234 5678'
  },
  {
    id: 2,
    name: 'Michael Chen',
    department: 'IT',
    branch: 'Ikeja',
    status: 'away',
    lastSeen: new Date(Date.now() - 15 * 60000),
    lastMessage: 'The server upgrade is scheduled',
    unreadCount: 0,
    email: 'michael.chen@firsttrust.com',
    phone: '+234 802 345 6789'
  },
  {
    id: 3,
    name: 'Amara Okafor',
    department: 'Operations',
    branch: 'Abuja',
    status: 'online',
    lastSeen: new Date(),
    lastMessage: 'Meeting at 3 PM?',
    unreadCount: 1,
    email: 'amara.okafor@firsttrust.com',
    phone: '+234 803 456 7890'
  },
  {
    id: 4,
    name: 'David Okonkwo',
    department: 'Finance',
    branch: 'Head Office',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60000),
    lastMessage: 'Budget approval needed',
    unreadCount: 0,
    email: 'david.okonkwo@firsttrust.com',
    phone: '+234 804 567 8901'
  },
  {
    id: 5,
    name: 'Blessing Eze',
    department: 'Legal',
    branch: 'Head Office',
    status: 'online',
    lastSeen: new Date(),
    lastMessage: 'Contract review complete',
    unreadCount: 3,
    email: 'blessing.eze@firsttrust.com',
    phone: '+234 805 678 9012'
  }
])

// Mock messages data
const messages = ref([])

// Mock shared files
const sharedFiles = ref([
  { name: 'Q4_Budget.xlsx', size: '245 KB' },
  { name: 'Meeting_Minutes.pdf', size: '1.2 MB' },
  { name: 'Policy_Update.docx', size: '512 KB' }
])

// Computed
const filteredContacts = computed(() => {
  let filtered = contacts.value

  // Apply search
  if (contactSearch.value) {
    const query = contactSearch.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.department.toLowerCase().includes(query) ||
      c.branch.toLowerCase().includes(query)
    )
  }

  // Apply tab filter
  switch (activeContactTab.value) {
    case 'online':
      filtered = filtered.filter(c => c.status === 'online')
      break
    case 'unread':
      filtered = filtered.filter(c => c.unreadCount > 0)
      break
    case 'groups':
      filtered = filtered.filter(c => c.department === 'Group')
      break
  }

  return filtered
})

// Methods
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatLastSeen = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectContact = (contact) => {
  selectedContact.value = contact
  showUserInfo.value = false
  
  // Load messages for this contact (mock data)
  loadMessages(contact.id)
}

const loadMessages = (contactId) => {
  // Mock messages
  messages.value = [
    {
      id: 1,
      content: 'Hi, can you review the budget memo?',
      timestamp: new Date(Date.now() - 30 * 60000),
      isMine: true,
      status: 'read'
    },
    {
      id: 2,
      content: 'Sure, I\'ll take a look. Any specific areas?',
      timestamp: new Date(Date.now() - 25 * 60000),
      isMine: false,
      status: null
    },
    {
      id: 3,
      content: 'Mainly the IT infrastructure costs',
      timestamp: new Date(Date.now() - 20 * 60000),
      isMine: true,
      status: 'delivered'
    },
    {
      id: 4,
      content: 'Got it. I\'ll get back to you in an hour',
      timestamp: new Date(Date.now() - 15 * 60000),
      isMine: false,
      status: null
    }
  ]

  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedContact.value) return

  const message = {
    id: messages.value.length + 1,
    content: newMessage.value,
    timestamp: new Date(),
    isMine: true,
    status: 'sent'
  }

  messages.value.push(message)
  newMessage.value = ''

  // Reset textarea height
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }

  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })

  // Simulate typing indicator
  setTimeout(() => {
    isTyping.value = true
  }, 1000)

  // Simulate response
  setTimeout(() => {
    isTyping.value = false
    
    const response = {
      id: messages.value.length + 1,
      content: 'Thanks for your message. I\'ll get back to you soon.',
      timestamp: new Date(),
      isMine: false,
      status: null
    }
    
    messages.value.push(response)
    
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }, 3000)
}

const autoResize = (event) => {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  
  // Show typing indicator
  isTypingSelf.value = true
  clearTimeout(window.typingTimeout)
  window.typingTimeout = setTimeout(() => {
    isTypingSelf.value = false
  }, 1000)
}

// Watch for contact changes
watch(selectedContact, () => {
  isTyping.value = false
})
</script>

<style scoped>
/* Animation for typing indicator */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>