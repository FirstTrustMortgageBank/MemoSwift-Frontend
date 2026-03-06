<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Header Section -->
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Memo Templates</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create and manage memo templates for your organization
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          @click="showUploadModal = true"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Template
        </button>
        
        <button 
          @click="showImportModal = true"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          Import
        </button>
      </div>
    </div>

    <!-- Template Categories Tabs -->
    <div class="mb-6">
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="activeCategory = category.id"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
            activeCategory === category.id
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          ]"
        >
          {{ category.name }}
          <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20 text-white" v-if="category.count">{{ category.count }}</span>
        </button>
      </div>
    </div>

    <!-- Template Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all dark:bg-gray-900 dark:border-gray-800"
      >
        <!-- Template Preview -->
        <div class="h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between">
            <span class="text-4xl">{{ template.icon }}</span>
            <div class="flex gap-1">
              <span 
                v-if="template.isDefault"
                class="px-2 py-1 text-xs font-medium bg-brand-100 text-brand-600 rounded-full dark:bg-brand-500/20 dark:text-brand-400"
              >
                Default
              </span>
              <span 
                v-if="template.isNew"
                class="px-2 py-1 text-xs font-medium bg-success-100 text-success-600 rounded-full dark:bg-success-500/20 dark:text-success-400"
              >
                New
              </span>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
            {{ template.preview }}
          </div>
        </div>

        <!-- Template Info -->
        <div class="p-4">
          <h3 class="font-semibold text-gray-800 dark:text-white/90 mb-1">{{ template.name }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">{{ template.description }}</p>
          
          <div class="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-4">
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              {{ template.lastModified }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              {{ template.usedBy }}
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <button 
              @click="useTemplate(template)"
              class="flex-1 px-3 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Use Template
            </button>
            <button 
              @click="openTemplateMenu(template)"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Context Menu Dropdown -->
        <div 
          v-if="activeTemplateMenu === template.id"
          class="absolute top-32 right-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-10"
        >
          <button 
            @click="editTemplate(template)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Edit Template
          </button>
          <button 
            @click="duplicateTemplate(template)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Duplicate
          </button>
          <button 
            v-if="!template.isDefault"
            @click="setAsDefault(template)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Set as Default
          </button>
          <div class="border-t border-gray-200 dark:border-gray-700"></div>
          <button 
            @click="exportTemplate(template)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Export
          </button>
          <button 
            @click="shareTemplate(template)"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Share
          </button>
          <div class="border-t border-gray-200 dark:border-gray-700"></div>
          <button 
            @click="deleteTemplate(template)"
            class="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-gray-100 dark:text-error-400 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Create New Template Card -->
      <div 
        @click="showUploadModal = true"
        class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:border-brand-500 dark:hover:bg-brand-500/10"
      >
        <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3 dark:bg-gray-700">
          <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </div>
        <h3 class="font-medium text-gray-800 dark:text-white/90 mb-1">Create New Template</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Start from scratch or upload a document</p>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showTemplateModal" class="modal-overlay" @click.self="closeTemplateModal">
        <div class="modal-content max-w-3xl">
          <div class="modal-header">
            <h3>{{ editingTemplate ? 'Edit Template' : 'Create New Template' }}</h3>
            <button @click="closeTemplateModal" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body max-h-[60vh] overflow-y-auto">
            <!-- Template Form -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label>Template Name <span class="text-error-500">*</span></label>
                  <input 
                    type="text" 
                    v-model="templateForm.name"
                    class="form-input"
                    placeholder="e.g., General Memo"
                  >
                </div>
                <div class="form-group">
                  <label>Category</label>
                  <select v-model="templateForm.category" class="form-select">
                    <option value="standard">Standard</option>
                    <option value="hr">HR</option>
                    <option value="policy">Policy</option>
                    <option value="meeting">Meeting</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea 
                  v-model="templateForm.description"
                  rows="2"
                  class="form-input"
                  placeholder="Brief description of this template..."
                ></textarea>
              </div>

              <div class="form-group">
                <label>Template Icon</label>
                <div class="flex items-center gap-4">
                  <span class="text-4xl">{{ templateForm.icon }}</span>
                  <div class="flex gap-2">
                    <button 
                      v-for="emoji in ['📋', '📝', '📄', '📊', '👥', '🏢', '💰', '⚖️']" 
                      :key="emoji"
                      @click="templateForm.icon = emoji"
                      class="w-10 h-10 text-xl border border-gray-300 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:hover:border-brand-400 dark:hover:bg-brand-500/10"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label>Default Font</label>
                  <select v-model="templateForm.fontFamily" class="form-select">
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Century Gothic">Century Gothic</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Font Size</label>
                  <select v-model="templateForm.fontSize" class="form-select">
                    <option value="10">10px</option>
                    <option value="11">11px</option>
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="templateForm.isDefault">
                  <span>Set as default template</span>
                </label>
              </div>

              <div class="form-group">
                <label>Template Placeholders</label>
                <div class="space-y-2">
                  <div v-for="(placeholder, index) in templateForm.placeholders" :key="index" class="flex items-center gap-2">
                    <input 
                      type="text" 
                      v-model="placeholder.name"
                      class="form-input flex-1"
                      placeholder="Placeholder name"
                    >
                    <input 
                      type="text" 
                      v-model="placeholder.default"
                      class="form-input flex-1"
                      placeholder="Default value"
                    >
                    <button @click="removePlaceholder(index)" class="p-2 text-gray-400 hover:text-error-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <button @click="addPlaceholder" class="text-sm text-brand-500 hover:text-brand-600">
                    + Add Placeholder
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Template Content</label>
                <div class="border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700">
                  <textarea 
                    v-model="templateForm.content"
                    rows="10"
                    class="w-full p-3 font-mono text-sm bg-white dark:bg-gray-800 dark:text-gray-300"
                    placeholder="Enter HTML content or use placeholders like {{recipientName}}"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeTemplateModal" class="cancel-btn">Cancel</button>
            <button 
              @click="saveTemplate"
              :disabled="!templateForm.name"
              class="send-btn"
            >
              {{ editingTemplate ? 'Update Template' : 'Create Template' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Import Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Import Template</h3>
            <button @click="showImportModal = false" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center dark:border-gray-700">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="text-gray-700 dark:text-gray-300 mb-1">Drag and drop your file here</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileImport"
                accept=".docx,.doc,.html,.txt"
                class="hidden"
              >
              <button 
                @click="$refs.fileInput.click()"
                class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Choose File
              </button>
              <p class="mt-4 text-xs text-gray-400">Supported formats: DOCX, DOC, HTML, TXT</p>
            </div>

            <div class="mt-4">
              <h4 class="font-medium text-gray-800 dark:text-white/90 mb-2">Import Options</h4>
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="radio" v-model="importOption" value="new">
                  Create as new template
                </label>
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="radio" v-model="importOption" value="replace">
                  Replace existing template
                </label>
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="radio" v-model="importOption" value="update">
                  Update existing template
                </label>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showImportModal = false" class="cancel-btn">Cancel</button>
            <button 
              @click="importTemplate"
              :disabled="!selectedFile"
              class="send-btn"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Share Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Share Template</h3>
            <button @click="showShareModal = false" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="mb-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <p class="font-medium text-gray-900 dark:text-white/90">{{ selectedTemplate?.name }}</p>
            </div>

            <div class="form-group">
              <label>Share with</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" v-model="shareWith.all">
                  Everyone in organization
                </label>
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" v-model="shareWith.department">
                  Specific department
                </label>
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" v-model="shareWith.users">
                  Specific users
                </label>
              </div>
            </div>

            <div v-if="shareWith.department" class="form-group">
              <label>Select Department</label>
              <select v-model="selectedDepartment" class="form-select">
                <option value="it">IT Department</option>
                <option value="hr">HR Department</option>
                <option value="finance">Finance Department</option>
                <option value="operations">Operations</option>
              </select>
            </div>

            <div v-if="shareWith.users" class="form-group">
              <label>Select Users</label>
              <div class="space-y-2 max-h-40 overflow-y-auto">
                <label v-for="user in users" :key="user.id" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" :value="user.id" v-model="selectedUsers">
                  {{ user.name }} - {{ user.department }}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Permission</label>
              <select v-model="sharePermission" class="form-select">
                <option value="view">Can view</option>
                <option value="use">Can use</option>
                <option value="edit">Can edit</option>
              </select>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showShareModal = false" class="cancel-btn">Cancel</button>
            <button @click="shareTemplate" class="send-btn">Share</button>
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
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

const router = useRouter()
const currentPageTitle = ref('Templates Management')
const activeCategory = ref('all')

// Modal states
const showTemplateModal = ref(false)
const showImportModal = ref(false)
const showShareModal = ref(false)
const activeTemplateMenu = ref(null)
const editingTemplate = ref(null)
const selectedTemplate = ref(null)
const selectedFile = ref(null)
const importOption = ref('new')

// Form state
const templateForm = ref({
  name: '',
  category: 'standard',
  description: '',
  icon: '📋',
  fontFamily: 'Century Gothic',
  fontSize: '12',
  isDefault: false,
  placeholders: [],
  content: ''
})

// Share state
const shareWith = ref({
  all: false,
  department: false,
  users: false
})
const selectedDepartment = ref('')
const selectedUsers = ref([])
const sharePermission = ref('view')

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Categories
const categories = [
  { id: 'all', name: 'All Templates', count: 12 },
  { id: 'standard', name: 'Standard', count: 4 },
  { id: 'hr', name: 'HR', count: 3 },
  { id: 'policy', name: 'Policy', count: 2 },
  { id: 'meeting', name: 'Meeting', count: 2 },
  { id: 'financial', name: 'Financial', count: 1 }
]

// Mock users for sharing
const users = ref([
  { id: 1, name: 'John Smith', department: 'IT' },
  { id: 2, name: 'Sarah Johnson', department: 'HR' },
  { id: 3, name: 'Michael Chen', department: 'Finance' },
  { id: 4, name: 'Amara Okafor', department: 'Operations' },
  { id: 5, name: 'David Okonkwo', department: 'Legal' }
])

// Mock templates data
const templates = ref([
  {
    id: 1,
    name: 'General Memo',
    description: 'Standard memo template for general communication',
    category: 'standard',
    icon: '📋',
    preview: 'Standard memo format with TO, FROM, DATE, SUBJECT fields',
    lastModified: '2 days ago',
    usedBy: '24 users',
    isDefault: true,
    isNew: false,
    content: '<h1>MEMORANDUM</h1><table><tr><td>TO:</td><td></td></tr>...</table>'
  },
  {
    id: 2,
    name: 'HR Policy Announcement',
    description: 'Template for announcing HR policies and updates',
    category: 'hr',
    icon: '👥',
    preview: 'HR policy format with effective dates and compliance notes',
    lastModified: '5 days ago',
    usedBy: '18 users',
    isDefault: false,
    isNew: true,
    content: '<h1>HUMAN RESOURCES MEMORANDUM</h1>...'
  },
  {
    id: 3,
    name: 'Meeting Minutes',
    description: 'Template for recording meeting minutes and action items',
    category: 'meeting',
    icon: '📅',
    preview: 'Meeting minutes format with agenda, discussion points, action items',
    lastModified: '1 week ago',
    usedBy: '32 users',
    isDefault: false,
    isNew: false,
    content: '<h1>MEETING MINUTES</h1>...'
  },
  {
    id: 4,
    name: 'Budget Approval Request',
    description: 'Template for requesting budget approvals',
    category: 'financial',
    icon: '💰',
    preview: 'Budget request format with tables and approval workflow',
    lastModified: '3 days ago',
    usedBy: '15 users',
    isDefault: false,
    isNew: false,
    content: '<h1>BUDGET APPROVAL REQUEST</h1>...'
  },
  {
    id: 5,
    name: 'IT Infrastructure Request',
    description: 'Template for IT equipment and infrastructure requests',
    category: 'standard',
    icon: '💻',
    preview: 'IT request format with technical specifications',
    lastModified: '1 day ago',
    usedBy: '12 users',
    isDefault: false,
    isNew: true,
    content: '<h1>IT INFRASTRUCTURE REQUEST</h1>...'
  },
  {
    id: 6,
    name: 'Leave Application',
    description: 'Template for staff leave applications',
    category: 'hr',
    icon: '🏖️',
    preview: 'Leave application format with dates and approval section',
    lastModified: '4 days ago',
    usedBy: '45 users',
    isDefault: false,
    isNew: false,
    content: '<h1>LEAVE APPLICATION</h1>...'
  },
  {
    id: 7,
    name: 'Policy Update Notice',
    description: 'Template for communicating policy updates',
    category: 'policy',
    icon: '⚖️',
    preview: 'Policy update format with change summary and effective dates',
    lastModified: '6 days ago',
    usedBy: '28 users',
    isDefault: false,
    isNew: false,
    content: '<h1>POLICY UPDATE NOTICE</h1>...'
  }
])

// Computed
const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') return templates.value
  return templates.value.filter(t => t.category === activeCategory.value)
})

// Methods
const useTemplate = (template) => {
  router.push({
    path: '/memo/new',
    query: { template: template.id }
  })
}

const openTemplateMenu = (template) => {
  activeTemplateMenu.value = activeTemplateMenu.value === template.id ? null : template.id
  selectedTemplate.value = template
}

const editTemplate = (template) => {
  editingTemplate.value = template
  templateForm.value = {
    name: template.name,
    category: template.category,
    description: template.description,
    icon: template.icon,
    fontFamily: template.fontFamily || 'Century Gothic',
    fontSize: template.fontSize || '12',
    isDefault: template.isDefault,
    placeholders: template.placeholders || [],
    content: template.content || ''
  }
  showTemplateModal.value = true
  activeTemplateMenu.value = null
}

const duplicateTemplate = (template) => {
  const newTemplate = {
    ...template,
    id: Date.now(),
    name: `${template.name} (Copy)`,
    isDefault: false,
    isNew: true,
    usedBy: '0 users'
  }
  templates.value.push(newTemplate)
  showToastMessage('Template duplicated successfully', 'success')
  activeTemplateMenu.value = null
}

const setAsDefault = (template) => {
  // Remove default from others
  templates.value.forEach(t => {
    if (t.isDefault) t.isDefault = false
  })
  template.isDefault = true
  showToastMessage(`${template.name} set as default template`, 'success')
  activeTemplateMenu.value = null
}

const exportTemplate = (template) => {
  const data = JSON.stringify(template, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.template.json`
  a.click()
  showToastMessage('Template exported successfully', 'success')
  activeTemplateMenu.value = null
}

const shareTemplate = () => {
  console.log('Sharing template:', selectedTemplate.value?.id, shareWith.value, selectedDepartment.value, selectedUsers.value, sharePermission.value)
  showShareModal.value = false
  showToastMessage('Template shared successfully', 'success')
  activeTemplateMenu.value = null
}

const deleteTemplate = (template) => {
  if (template.isDefault) {
    showToastMessage('Cannot delete default template', 'error')
    activeTemplateMenu.value = null
    return
  }
  
  if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
    templates.value = templates.value.filter(t => t.id !== template.id)
    showToastMessage('Template deleted successfully', 'success')
  }
  activeTemplateMenu.value = null
}

const closeTemplateModal = () => {
  showTemplateModal.value = false
  editingTemplate.value = null
  templateForm.value = {
    name: '',
    category: 'standard',
    description: '',
    icon: '📋',
    fontFamily: 'Century Gothic',
    fontSize: '12',
    isDefault: false,
    placeholders: [],
    content: ''
  }
}

const saveTemplate = () => {
  if (!templateForm.value.name) return
  
  if (editingTemplate.value) {
    // Update existing template
    const index = templates.value.findIndex(t => t.id === editingTemplate.value.id)
    if (index !== -1) {
      templates.value[index] = {
        ...editingTemplate.value,
        ...templateForm.value,
        lastModified: 'just now'
      }
    }
    showToastMessage('Template updated successfully', 'success')
  } else {
    // Create new template
    const newTemplate = {
      id: Date.now(),
      ...templateForm.value,
      preview: templateForm.value.description.substring(0, 50) + '...',
      lastModified: 'just now',
      usedBy: '0 users',
      isNew: true
    }
    templates.value.push(newTemplate)
    showToastMessage('Template created successfully', 'success')
  }
  
  closeTemplateModal()
}

const addPlaceholder = () => {
  templateForm.value.placeholders.push({ name: '', default: '' })
}

const removePlaceholder = (index) => {
  templateForm.value.placeholders.splice(index, 1)
}

const handleFileImport = (event) => {
  selectedFile.value = event.target.files[0]
}

const importTemplate = () => {
  if (!selectedFile.value) return
  
  console.log('Importing file:', selectedFile.value.name, 'Option:', importOption.value)
  // In real app: parse file and create template
  
  showImportModal.value = false
  showToastMessage('Template imported successfully', 'success')
  selectedFile.value = null
}

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Click outside to close menu
onMounted(() => {
  document.addEventListener('click', () => {
    activeTemplateMenu.value = null
  })
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

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: var(--color-white);
  color: var(--color-gray-900);
  cursor: pointer;
}

.dark .form-select {
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

/* Line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>