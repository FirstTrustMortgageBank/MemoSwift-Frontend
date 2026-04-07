<template>
  <div class="memo-editor-container">
    <!-- Loading overlay while loading -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- Header with Dashboard Button and Memo Actions -->
    <div class="editor-header">
      <div class="header-left">
        <button @click="goToDashboard" class="dashboard-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Dashboard
        </button>
        
        <div class="title-input-container">
          <input
            v-model="memoTitle"
            type="text"
            placeholder="Enter document title..."
            class="title-input"
            :disabled="isLoading"
            @input="scheduleAutoSave"
          />
          <span v-if="memoReference" class="reference-badge">{{ memoReference }}</span>
          <span v-if="autoSaveStatus" class="auto-save-status" :class="autoSaveStatus.type">
            {{ autoSaveStatus.message }}
          </span>
        </div>
      </div>
      
      <div class="header-actions">
        <div class="approval-badge" :class="approvalStatusClass">
          <span class="status-dot"></span>
          {{ currentApprovalStatus }}
        </div>
        
        <button 
          v-if="memoId && currentApprovalStatus === 'Draft'"
          @click="openApproverModal" 
          class="action-btn primary"
          :disabled="isSaving"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Send to Approver
        </button>
        
        <button 
          @click="handleSave" 
          class="action-btn secondary"
          :disabled="isSaving"
        >
          <svg v-if="isSaving" class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save Draft' }}
        </button>
      </div>
    </div>

    <!-- Approver Selection Modal -->
    <div v-if="showApproverModal" class="modal-overlay" @click.self="closeApproverModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Send for Approval</h3>
          <button @click="closeApproverModal" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Select Approver</label>
            <select v-model="selectedApprover" class="approver-select" :disabled="isLoadingApprovers">
              <option value="" disabled>Choose next approver...</option>
              <option v-for="approver in approversList" :key="approver.id" :value="approver.id">
                {{ approver.name }} - {{ approver.role }} ({{ approver.department }})
              </option>
            </select>
            <div v-if="isLoadingApprovers" class="text-sm text-gray-500 mt-1">Loading approvers...</div>
            <div v-if="!isLoadingApprovers && approversList.length === 0" class="text-sm text-error-500 mt-1">No approvers available</div>
          </div>
          
          <div class="form-group">
            <label>Priority Level</label>
            <div class="priority-options">
              <label class="priority-option"><input type="radio" v-model="priority" value="LOW"><span class="priority-badge low">Low</span></label>
              <label class="priority-option"><input type="radio" v-model="priority" value="MEDIUM"><span class="priority-badge medium">Medium</span></label>
              <label class="priority-option"><input type="radio" v-model="priority" value="HIGH"><span class="priority-badge high">High</span></label>
              <label class="priority-option"><input type="radio" v-model="priority" value="URGENT"><span class="priority-badge urgent">Urgent</span></label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Due Date (Optional)</label>
            <input type="date" v-model="dueDate" class="date-input">
          </div>
          
          <div class="form-group">
            <label>Message to Approver</label>
            <textarea v-model="approverMessage" placeholder="Add any notes or instructions for the approver..." rows="3" class="message-input"></textarea>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="notifyByEmail">
              Notify approver by email
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeApproverModal" class="cancel-btn">Cancel</button>
          <button @click="sendToApprover" class="send-btn" :disabled="!selectedApprover || isSending || approversList.length === 0">
            {{ isSending ? 'Sending...' : 'Send for Approval' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
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

    <!-- Menubar -->
    <div class="menubar">
      <div class="relative" @click.stop>
        <button @click="toggleMenu('file')" class="menubar-btn">File</button>
        <div v-if="activeMenu === 'file'" class="menu-dropdown">
          <button @click="handleNew" class="menu-item">New</button>
          <button @click="handleOpen" class="menu-item">Open...</button>
          <button @click="handleSave" class="menu-item">Save</button>
          <button @click="handleSaveAs" class="menu-item">Save As...</button>
          <div class="menu-divider"></div>
          <button @click="handleExportPDF" class="menu-item">Export as PDF</button>
          <button @click="handleExportDOCX" class="menu-item">Export as DOCX</button>
          <div class="menu-divider"></div>
          <button @click="handlePrint" class="menu-item">Print</button>
        </div>
      </div>
      <div class="relative" @click.stop>
        <button @click="toggleMenu('edit')" class="menubar-btn">Edit</button>
        <div v-if="activeMenu === 'edit'" class="menu-dropdown">
          <button @click="editor?.chain().focus().undo().run()" class="menu-item">Undo</button>
          <button @click="editor?.chain().focus().redo().run()" class="menu-item">Redo</button>
          <div class="menu-divider"></div>
          <button @click="handleCut" class="menu-item">Cut</button>
          <button @click="handleCopy" class="menu-item">Copy</button>
          <button @click="handlePaste" class="menu-item">Paste</button>
        </div>
      </div>
      <div class="relative" @click.stop>
        <button @click="toggleMenu('view')" class="menubar-btn">View</button>
        <div v-if="activeMenu === 'view'" class="menu-dropdown">
          <button @click="toggleFullscreen" class="menu-item">{{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}</button>
          <button @click="toggleDarkMode" class="menu-item">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</button>
          <button @click="toggleRuler" class="menu-item">{{ showRuler ? 'Hide Ruler' : 'Show Ruler' }}</button>
        </div>
      </div>
    </div>

    <!-- Main Toolbar -->
    <div class="toolbar">
      <select v-model="headingLevel" @change="setHeading" class="toolbar-select">
        <option value="0">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
      <div class="toolbar-divider"></div>
      <button @click="editor?.chain().focus().toggleBold().run()" class="toolbar-btn" :class="{ active: editor?.isActive('bold') }" title="Bold (Ctrl+B)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
      </button>
      <button @click="editor?.chain().focus().toggleItalic().run()" class="toolbar-btn" :class="{ active: editor?.isActive('italic') }" title="Italic (Ctrl+I)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 4h-9M14 20H5M15 4L9 20"/></svg>
      </button>
      <button @click="editor?.chain().focus().toggleUnderline().run()" class="toolbar-btn" :class="{ active: editor?.isActive('underline') }" title="Underline (Ctrl+U)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><path d="M4 21h16"/></svg>
      </button>
      <button @click="editor?.chain().focus().toggleStrike().run()" class="toolbar-btn" :class="{ active: editor?.isActive('strike') }" title="Strikethrough">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4H9a4 4 0 0 0-4 4 4 4 0 0 0 4 4h6a4 4 0 0 1 4 4 4 4 0 0 1-4 4H7"/><path d="M3 12h18"/></svg>
      </button>
      <div class="toolbar-divider"></div>
      <select v-model="fontFamily" @change="setFontFamily" class="toolbar-select font-family">
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Calibri">Calibri</option>
        <option value="Verdana">Verdana</option>
        <option value="Courier New">Courier New</option>
      </select>
      <select v-model="fontSize" @change="setFontSize" class="toolbar-select font-size">
        <option v-for="size in [8,9,10,11,12,14,16,18,20,22,24,26,28,36,48]" :key="size" :value="size">{{ size }}px</option>
      </select>
      <div class="toolbar-divider"></div>
      <div class="color-picker-container">
        <button @click="showColorPicker = !showColorPicker" class="toolbar-btn">
          <div class="color-preview" :style="{ backgroundColor: textColor }"></div>
        </button>
        <div v-if="showColorPicker" class="color-picker-dropdown">
          <input type="color" v-model="textColor" @change="setTextColor" class="color-input">
        </div>
      </div>
      <div class="toolbar-divider"></div>
      <button @click="editor?.chain().focus().setTextAlign('left').run()" class="toolbar-btn" :class="{ active: editor?.isActive({ textAlign: 'left' }) }" title="Align Left">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h12M3 18h18"/></svg>
      </button>
      <button @click="editor?.chain().focus().setTextAlign('center').run()" class="toolbar-btn" :class="{ active: editor?.isActive({ textAlign: 'center' }) }" title="Center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M7 12h10M5 18h14"/></svg>
      </button>
      <button @click="editor?.chain().focus().setTextAlign('right').run()" class="toolbar-btn" :class="{ active: editor?.isActive({ textAlign: 'right' }) }" title="Align Right">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M9 12h12M3 18h18"/></svg>
      </button>
      <button @click="editor?.chain().focus().setTextAlign('justify').run()" class="toolbar-btn" :class="{ active: editor?.isActive({ textAlign: 'justify' }) }" title="Justify">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div class="toolbar-divider"></div>
      <button @click="editor?.chain().focus().toggleBulletList().run()" class="toolbar-btn" :class="{ active: editor?.isActive('bulletList') }" title="Bullet List">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/></svg>
      </button>
      <button @click="editor?.chain().focus().toggleOrderedList().run()" class="toolbar-btn" :class="{ active: editor?.isActive('orderedList') }" title="Numbered List">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 6h11M10 12h11M10 18h11M4 6h1M4 12h1M4 18h1"/><path d="M4 6v3M4 12v3M4 18v3"/></svg>
      </button>
      <button @click="editor?.chain().focus().indent().run()" class="toolbar-btn" title="Increase Indent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18M13 8l4 4-4 4"/></svg>
      </button>
      <button @click="editor?.chain().focus().outdent().run()" class="toolbar-btn" title="Decrease Indent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18M17 8l-4 4 4 4"/></svg>
      </button>
      <div class="toolbar-divider"></div>
      <select v-model="lineHeight" @change="setLineHeight" class="toolbar-select line-height">
        <option value="1">1.0</option>
        <option value="1.15">1.15</option>
        <option value="1.5">1.5</option>
        <option value="2">2.0</option>
        <option value="2.5">2.5</option>
        <option value="3">3.0</option>
      </select>
      <div class="toolbar-divider"></div>
      <button @click="insertTable" class="toolbar-btn" title="Insert Table">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
      </button>
      <button @click="insertImage" class="toolbar-btn" title="Insert Image">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L6 21"/></svg>
      </button>
      <button @click="insertLink" class="toolbar-btn" title="Insert Link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button @click="insertHorizontalRule" class="toolbar-btn" title="Horizontal Line">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18"/></svg>
      </button>
      
      <!-- Attachment Button -->
      <div class="toolbar-divider"></div>
      <button @click="triggerAttachmentUpload" class="toolbar-btn" title="Add Attachment">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
      
      <!-- Hidden file input -->
      <input 
        type="file" 
        ref="attachmentInput" 
        multiple 
        style="display: none" 
        @change="handleAttachmentSelect"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      />
    </div>

    <!-- Attachment List -->
    <div v-if="memoAttachments.length > 0" class="attachment-list">
      <div v-for="(file, index) in memoAttachments" :key="index" class="attachment-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <span class="attachment-name">{{ file.name }}</span>
        <span class="attachment-size">{{ formatFileSize(file.size) }}</span>
        <button @click="removeAttachment(index)" class="remove-attachment">✕</button>
      </div>
    </div>

    <!-- Ruler -->
    <div v-if="showRuler" class="ruler">
      <div class="ruler-container">
        <div class="ruler-base"></div>
        <div v-for="i in 15" :key="i" class="ruler-mark" :style="{ left: (i * 60) + 'px' }"></div>
        <div v-for="i in 15" :key="i + 'num'" class="ruler-number" :style="{ left: (i * 60 - 5) + 'px' }">{{ i }}</div>
      </div>
    </div>

    <!-- Editor + Footer scroll container -->
    <div class="editor-scroll-container">
      <div
        class="document-page"
        :style="{ fontFamily, fontSize: fontSize + 'px', lineHeight }"
      >
        <!-- Tiptap editor (memo body) -->
        <editor-content v-if="editor" :editor="editor" class="editor-content" />
        <div v-else class="editor-placeholder"><p>Loading document...</p></div>

        <!-- ═══ Memo Footer — always rendered below the editor body ═══ -->
        <div class="memo-footer-divider"></div>
        <MemoFooter v-model="footerFields" @update="handleFooterUpdate" />
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div>Words: {{ wordCount }} | Characters: {{ charCount }}</div>
      <div class="status-right">
        <span v-if="currentApprover" class="approver-indicator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Next: {{ currentApprover }}
        </span>
        <span class="document-indicator" v-if="memoReference">📄 {{ memoReference }}</span>
        <span>{{ editor?.isEditable ? 'Editing' : 'Read Only' }} | Page 1 of {{ pageCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Extension } from '@tiptap/core'
import * as mammoth from 'mammoth'
import axios from 'axios'
import { debounce } from 'lodash-es'

// Import the footer component
import MemoFooter from './Memofooter.vue'

import defaultTemplate from '../../assets/templates/memo-template.docx?url'

const API_BASE_URL = 'http://localhost:3000/api/v1'

// Custom LineHeight extension
const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading'],
      attributes: {
        lineHeight: {
          default: '1.5',
          parseHTML: element => element.style.lineHeight || '1.5',
          renderHTML: attributes => {
            if (!attributes.lineHeight) return {}
            return { style: `line-height: ${attributes.lineHeight}` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setLineHeight: (height) => ({ commands }) => {
        return ['paragraph', 'heading'].every(type =>
          commands.updateAttributes(type, { lineHeight: height })
        )
      },
    }
  },
})

const router = useRouter()
const route = useRoute()

const getAuthHeader = () => {
  const token = JSON.parse(localStorage.getItem('token') || '{}')
  return { Authorization: `Bearer ${token}` }
}

const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return {} }
}

// State
const activeMenu = ref(null)
const isFullscreen = ref(false)
const showRuler = ref(true)
const showColorPicker = ref(false)
const textColor = ref('#000000')
const fontFamily = ref('Century Gothic')
const fontSize = ref(12)
const headingLevel = ref('0')
const lineHeight = ref('1.5')
const isLoading = ref(false)
const loadingMessage = ref('Loading...')
const showApproverModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const isSaving = ref(false)
const isSending = ref(false)
const isLoadingApprovers = ref(false)
const autoSaveStatus = ref(null)

const memoId = ref(route.params.id || null)
const memoTitle = ref('')
const memoReference = ref('')
const currentApprovalStatus = ref('Draft')
const currentApprover = ref('')

const hasUnsavedChanges = ref(false)
const lastSavedContent = ref('')
const lastSavedTitle = ref('')

// Attachment state
const memoAttachments = ref([])
const attachmentInput = ref(null)

// Footer fields state - initialize with default values
const footerFields = ref({
  signatories: [
    { name: 'Ugochukwu Alagbu', role: 'IT Department' },
    { name: 'Yemi Ogundare', role: 'Ag Head, IT Department' }
  ],
  monthlyBudget: '',
  monthlyExpense: '',
  monthlyBalance: '',
  annualBudget: '',
  annualExpense: '',
  annualBalance: '',
  fincon: '',
  signature: '',
  finconDate: '',
  comments: '',
  concurrence: [
    { name: 'Michael Olubunmi Asalu', role: 'Group Head, General Services' },
    { name: 'John Odey', role: 'Executive Director, General Services' }
  ],
  approvedBy: [
    { name: 'Korede Adedayo', role: 'Managing Director/CEO' }
  ]
})

const autoSaveDebounced = debounce(() => {
  if (hasUnsavedChanges.value) handleAutoSave()
}, 2000)

const selectedApprover = ref('')
const priority = ref('MEDIUM')
const dueDate = ref('')
const approverMessage = ref('')
const notifyByEmail = ref(true)
const approversList = ref([])

// Editor
const editor = useEditor({
  content: '<p>Start typing your memo...</p>',
  extensions: [
    StarterKit, Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle, Color, FontFamily,
    Table.configure({ resizable: true }),
    TableRow, TableHeader, TableCell,
    Image,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: 'Write your memo...' }),
    CharacterCount,
    LineHeight,
  ],
  editorProps: { attributes: { class: 'focus:outline-none' } },
  immediatelyRender: false,
  onUpdate: () => {
    checkForUnsavedChanges()
    scheduleAutoSave()
  },
})

// Computed
const wordCount = computed(() => {
  if (!editor.value) return 0
  const text = editor.value.getText()
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
})
const charCount = computed(() => editor.value ? editor.value.getText().length : 0)
const pageCount = computed(() => 1)
const isDark = computed(() => document.documentElement.classList.contains('dark'))
const approvalStatusClass = computed(() => ({
  'status-draft': currentApprovalStatus.value === 'Draft',
  'status-pending': currentApprovalStatus.value === 'Pending Approval',
  'status-approved': currentApprovalStatus.value === 'Approved',
  'status-rejected': currentApprovalStatus.value === 'Rejected',
}))

// Auto-save
const checkForUnsavedChanges = () => {
  const currentContent = editor.value?.getHTML() || ''
  const currentFooterString = JSON.stringify(footerFields.value)
  const lastFooterString = JSON.stringify(lastSavedFooterFields.value)
  
  hasUnsavedChanges.value =
    currentContent !== lastSavedContent.value ||
    memoTitle.value !== lastSavedTitle.value ||
    currentFooterString !== lastFooterString
}
const scheduleAutoSave = () => { if (memoId.value) autoSaveDebounced() }
const updateAutoSaveStatus = (message, type = 'success') => {
  autoSaveStatus.value = { message, type }
  setTimeout(() => { autoSaveStatus.value = null }, 3000)
}

// Track last saved footer state
const lastSavedFooterFields = ref({})

const handleAutoSave = async () => {
  if (!memoId.value || !hasUnsavedChanges.value) return
  try {
    await updateMemo(true)
    updateAutoSaveStatus('Auto-saved')
  } catch {
    updateAutoSaveStatus('Auto-save failed', 'error')
  }
}

// Footer update handler
const handleFooterUpdate = (fields) => {
  footerFields.value = fields
  // Footer changes count as unsaved changes too
  hasUnsavedChanges.value = true
  scheduleAutoSave()
}

// Toast helper
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

// Draft helpers
const checkForDraft = () => {
  const draftId = localStorage.getItem('memo_draft_id')
  const draftData = localStorage.getItem('memo_draft_data')
  if (draftId && draftData && !memoId.value) {
    try {
      const draft = JSON.parse(draftData)
      if (confirm('You have an unsaved draft. Would you like to restore it?')) {
        memoId.value = draftId
        memoTitle.value = draft.title
        memoReference.value = draft.reference
        if (editor.value && draft.content) editor.value.commands.setContent(draft.content)
        if (draft.metadata) {
          fontFamily.value = draft.metadata.fontFamily || 'Century Gothic'
          fontSize.value = draft.metadata.fontSize || 12
          lineHeight.value = draft.metadata.lineHeight || '1.5'
        }
        // Restore footer fields if saved
        if (draft.footerFields) footerFields.value = draft.footerFields
        lastSavedContent.value = draft.content
        lastSavedTitle.value = draft.title
        lastSavedFooterFields.value = { ...footerFields.value }
        hasUnsavedChanges.value = false
      } else {
        localStorage.removeItem('memo_draft_id')
        localStorage.removeItem('memo_draft_data')
      }
    } catch (e) { console.error('Error parsing draft:', e) }
  }
}

const saveDraftToLocal = () => {
  if (!memoId.value) return
  localStorage.setItem('memo_draft_id', memoId.value)
  localStorage.setItem('memo_draft_data', JSON.stringify({
    id: memoId.value,
    title: memoTitle.value,
    reference: memoReference.value,
    content: editor.value?.getHTML() || '',
    footerFields: footerFields.value,
    metadata: { 
      fontFamily: fontFamily.value, 
      fontSize: fontSize.value, 
      lineHeight: lineHeight.value 
    },
    lastModified: new Date().toISOString(),
  }))
}

const clearDraft = () => {
  localStorage.removeItem('memo_draft_id')
  localStorage.removeItem('memo_draft_data')
}

// Attachment helpers
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const triggerAttachmentUpload = () => {
  attachmentInput.value?.click()
}

const handleAttachmentSelect = (event) => {
  const files = Array.from(event.target.files)
  memoAttachments.value.push(...files)
  event.target.value = ''
}

const removeAttachment = (index) => {
  memoAttachments.value.splice(index, 1)
}

// API calls
const fetchMemo = async (id) => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Loading memo...'
    const response = await axios.get(`${API_BASE_URL}/memos/${id}`, { headers: getAuthHeader() })
    const memo = response.data.data
    
    console.log('Loaded memo data:', memo)
    
    if (editor.value && memo.content) editor.value.commands.setContent(memo.content)
    memoTitle.value = memo.title || 'Untitled Memo'
    memoReference.value = memo.reference
    currentApprovalStatus.value = memo.status
    currentApprover.value = memo.currentApproverName || ''
    
    if (memo.metadata) {
      fontFamily.value = memo.metadata.fontFamily || 'Century Gothic'
      fontSize.value = memo.metadata.fontSize || 12
      lineHeight.value = memo.metadata.lineHeight || '1.5'
      
      // Restore footer fields - use the new structure
      if (memo.metadata.footerFields) {
        const saved = memo.metadata.footerFields
        footerFields.value = {
          signatories: saved.signatories || [
            { name: 'Ugochukwu Alagbu', role: 'IT Department' },
            { name: 'Yemi Ogundare', role: 'Ag Head, IT Department' }
          ],
          monthlyBudget: saved.monthlyBudget || '',
          monthlyExpense: saved.monthlyExpense || '',
          monthlyBalance: saved.monthlyBalance || '',
          annualBudget: saved.annualBudget || '',
          annualExpense: saved.annualExpense || '',
          annualBalance: saved.annualBalance || '',
          fincon: saved.fincon || '',
          signature: saved.signature || '',
          finconDate: saved.finconDate || '',
          comments: saved.comments || '',
          concurrence: saved.concurrence || [
            { name: 'Michael Olubunmi Asalu', role: 'Group Head, General Services' },
            { name: 'John Odey', role: 'Executive Director, General Services' }
          ],
          approvedBy: saved.approvedBy || [
            { name: 'Korede Adedayo', role: 'Managing Director/CEO' }
          ]
        }
      }
    }
    
    lastSavedContent.value = memo.content
    lastSavedTitle.value = memo.title
    lastSavedFooterFields.value = { ...footerFields.value }
    clearDraft()
  } catch (error) {
    console.error('Error fetching memo:', error)
    showToastMessage('Failed to load memo', 'error')
    checkForDraft()
  } finally {
    isLoading.value = false
  }
}

const fetchApprovers = async () => {
  try {
    isLoadingApprovers.value = true
    const response = await axios.get(`${API_BASE_URL}/auth/users`, { headers: getAuthHeader() })
    const usersData = response.data?.data?.data || []
    approversList.value = usersData.map(user => ({
      id: user.id, 
      name: user.username,
      role: user.role || 'Staff', 
      department: user.department || 'General', 
      email: user.email,
    }))
    if (approversList.value.length === 0) showToastMessage('No approvers available', 'info')
  } catch (error) {
    console.error('Error fetching approvers:', error)
    showToastMessage('Failed to load approvers', 'error')
    approversList.value = []
  } finally {
    isLoadingApprovers.value = false
  }
}

const createMemo = async () => {
  try {
    isSaving.value = true
    const user = getCurrentUser()
    if (!memoTitle.value?.trim()) {
      showToastMessage('Please enter a document title', 'error')
      return
    }
    
    const formData = new FormData()
    formData.append('title', memoTitle.value.trim())
    formData.append('content', editor.value?.getHTML() || '')
    formData.append('branch', user.branch || 'Head Office')
    formData.append('metadata', JSON.stringify({
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      lineHeight: lineHeight.value,
      wordCount: wordCount.value,
      characterCount: charCount.value,
      footerFields: footerFields.value,
    }))
    
    // Append attachments
    for (const file of memoAttachments.value) {
      formData.append('attachments', file)
    }
    
    const response = await axios.post(`${API_BASE_URL}/memos`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
    })
    
    const newMemo = response.data.data
    memoId.value = newMemo.id
    memoReference.value = newMemo.reference
    router.replace({ params: { id: newMemo.id } })
    lastSavedContent.value = editor.value?.getHTML() || ''
    lastSavedTitle.value = memoTitle.value
    lastSavedFooterFields.value = { ...footerFields.value }
    hasUnsavedChanges.value = false
    memoAttachments.value = []
    clearDraft()
    showToastMessage('Memo created successfully', 'success')
    return newMemo
  } catch (error) {
    console.error('Error creating memo:', error)
    showToastMessage('Failed to create memo', 'error')
    throw error
  } finally {
    isSaving.value = false
  }
}

const updateMemo = async (silent = false) => {
  if (!memoId.value) return
  try {
    if (!silent) isSaving.value = true
    if (!memoTitle.value?.trim()) {
      if (!silent) showToastMessage('Please enter a document title', 'error')
      return
    }
    const payload = {
      title: memoTitle.value.trim(),
      content: editor.value?.getHTML() || '',
      metadata: {
        fontFamily: fontFamily.value, 
        fontSize: fontSize.value, 
        lineHeight: lineHeight.value,
        wordCount: wordCount.value, 
        characterCount: charCount.value,
        footerFields: footerFields.value,
      },
    }
    const response = await axios.put(`${API_BASE_URL}/memos/${memoId.value}`, payload, { headers: getAuthHeader() })
    lastSavedContent.value = payload.content
    lastSavedTitle.value = payload.title
    lastSavedFooterFields.value = { ...footerFields.value }
    hasUnsavedChanges.value = false
    clearDraft()
    if (!silent) showToastMessage('Memo updated successfully', 'success')
    return response.data.data
  } catch (error) {
    console.error('Error updating memo:', error)
    if (!silent) showToastMessage('Failed to update memo', 'error')
    throw error
  } finally {
    if (!silent) isSaving.value = false
  }
}

const handleSave = async () => {
  if (!editor.value?.getHTML() || editor.value.getHTML() === '<p></p>') {
    showToastMessage('Cannot save empty memo', 'error')
    return
  }
  if (!memoTitle.value?.trim()) {
    showToastMessage('Please enter a document title', 'error')
    return
  }
  try {
    if (memoId.value) await updateMemo()
    else await createMemo()
  } catch {}
}

const openApproverModal = async () => {
  if (hasUnsavedChanges.value) await handleSave()
  showApproverModal.value = true
  await fetchApprovers()
}

const closeApproverModal = () => {
  showApproverModal.value = false
  selectedApprover.value = ''
  priority.value = 'MEDIUM'
  dueDate.value = ''
  approverMessage.value = ''
}

const sendToApprover = async () => {
  if (!selectedApprover.value) { 
    showToastMessage('Please select an approver', 'error')
    return 
  }
  if (!memoId.value || hasUnsavedChanges.value) await handleSave()
  try {
    isSending.value = true
    const payload = {
      approverId: selectedApprover.value, 
      priority: priority.value,
      dueDate: dueDate.value || undefined, 
      message: approverMessage.value || undefined,
      notifyByEmail: notifyByEmail.value,
    }
    await axios.post(`${API_BASE_URL}/memos/${memoId.value}/send-approval`, payload, { headers: getAuthHeader() })
    currentApprovalStatus.value = 'Pending Approval'
    const approver = approversList.value.find(a => a.id === selectedApprover.value)
    currentApprover.value = approver?.name || 'Approver'
    showToastMessage(`Memo sent to ${approver?.name} for approval`, 'success')
    showApproverModal.value = false
    selectedApprover.value = ''; 
    priority.value = 'MEDIUM'; 
    dueDate.value = ''; 
    approverMessage.value = ''
  } catch (error) {
    console.error('Error sending for approval:', error)
    showToastMessage('Failed to send for approval', 'error')
  } finally {
    isSending.value = false
  }
}

const loadDocxFromFile = async (file) => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Loading file...'
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1", 
        "p[style-name='Heading 2'] => h2", 
        "p[style-name='Heading 3'] => h3"
      ],
      includeDefaultStyleMap: true,
    })
    let html = result.value
    // Same trimming for user-opened files
    const cutMarkers = ['Opex/Capex', 'Ugochukwu Alagbu', 'Concurrence:']
    for (const marker of cutMarkers) {
      const idx = html.indexOf(marker)
      if (idx !== -1) {
        const tagStart = html.lastIndexOf('<', idx)
        html = html.substring(0, tagStart).trimEnd()
        break
      }
    }
    html = `<div class="memo-content">${html}</div>`
    if (editor.value) editor.value.commands.setContent(html)
    memoId.value = null
    memoTitle.value = file.name.replace(/\.[^/.]+$/, '')
    memoReference.value = ''
    memoAttachments.value = []
    
    // Reset footer for new file with the new structure
    footerFields.value = {
      signatories: [
        { name: 'Ugochukwu Alagbu', role: 'IT Department' },
        { name: 'Yemi Ogundare', role: 'Ag Head, IT Department' }
      ],
      monthlyBudget: '',
      monthlyExpense: '',
      monthlyBalance: '',
      annualBudget: '',
      annualExpense: '',
      annualBalance: '',
      fincon: '',
      signature: '',
      finconDate: '',
      comments: '',
      concurrence: [
        { name: 'Michael Olubunmi Asalu', role: 'Group Head, General Services' },
        { name: 'John Odey', role: 'Executive Director, General Services' }
      ],
      approvedBy: [
        { name: 'Korede Adedayo', role: 'Managing Director/CEO' }
      ]
    }
    lastSavedContent.value = html
    lastSavedTitle.value = memoTitle.value
    lastSavedFooterFields.value = { ...footerFields.value }
    showToastMessage('File loaded successfully', 'success')
  } catch (error) {
    console.error('Error loading DOCX file:', error)
    showToastMessage('Error loading file', 'error')
  } finally {
    isLoading.value = false
  }
}

// Template loading - load the default DOCX template
const loadDocxTemplate = async (fileUrl) => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Loading template...'
    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
        "table => table.doc-table",
        "tr => tr", 
        "td => td.doc-td", 
        "th => th.doc-th",
      ],
      includeDefaultStyleMap: true,
      ignoreEmptyParagraphs: false,
      convertImage: mammoth.images.imgElement(el =>
        el.read('base64').then(buf => ({ src: `data:${el.contentType};base64,${buf}` }))
      ),
    })

    let html = result.value

    // Remove the Opex/Capex paragraph and everything after it
    const cutMarkers = ['Opex/Capex', 'Ugochukwu Alagbu', 'Concurrence:']
    for (const marker of cutMarkers) {
      const idx = html.indexOf(marker)
      if (idx !== -1) {
        const tagStart = html.lastIndexOf('<', idx)
        html = html.substring(0, tagStart).trimEnd()
        break
      }
    }

    html = `<div class="memo-content">${html}</div>`
    if (editor.value) editor.value.commands.setContent(html)
    memoTitle.value = 'New Memo'
    memoReference.value = ''
    memoAttachments.value = []
    lastSavedContent.value = html
    lastSavedTitle.value = 'New Memo'
    
    // Reset footer fields for new document with the new structure
    footerFields.value = {
      signatories: [
        { name: 'Ugochukwu Alagbu', role: 'IT Department' },
        { name: 'Yemi Ogundare', role: 'Ag Head, IT Department' }
      ],
      monthlyBudget: '',
      monthlyExpense: '',
      monthlyBalance: '',
      annualBudget: '',
      annualExpense: '',
      annualBalance: '',
      fincon: '',
      signature: '',
      finconDate: '',
      comments: '',
      concurrence: [
        { name: 'Michael Olubunmi Asalu', role: 'Group Head, General Services' },
        { name: 'John Odey', role: 'Executive Director, General Services' }
      ],
      approvedBy: [
        { name: 'Korede Adedayo', role: 'Managing Director/CEO' }
      ]
    }
    lastSavedFooterFields.value = { ...footerFields.value }
  } catch (error) {
    console.error('Error loading DOCX template:', error)
    showToastMessage('Error loading template', 'error')
  } finally {
    isLoading.value = false
  }
}

// Utility functions
const goToDashboard = () => {
  if (hasUnsavedChanges.value) {
    if (confirm('You have unsaved changes. Leave anyway?')) router.push('/main-dashboard')
  } else {
    router.push('/main-dashboard')
  }
}

const toggleMenu = (menu) => { 
  activeMenu.value = activeMenu.value === menu ? null : menu 
}

const handleNew = () => {
  if (hasUnsavedChanges.value && !confirm('Clear current memo and start a new one? Unsaved changes will be lost.')) return
  editor.value?.commands.setContent('<p>Start typing your memo here...</p>')
  memoId.value = null
  memoTitle.value = 'New Memo'
  memoReference.value = ''
  currentApprovalStatus.value = 'Draft'
  currentApprover.value = ''
  memoAttachments.value = []
  footerFields.value = {
    signatories: [
      { name: 'Ugochukwu Alagbu', role: 'IT Department' },
      { name: 'Yemi Ogundare', role: 'Ag Head, IT Department' }
    ],
    monthlyBudget: '',
    monthlyExpense: '',
    monthlyBalance: '',
    annualBudget: '',
    annualExpense: '',
    annualBalance: '',
    fincon: '',
    signature: '',
    finconDate: '',
    comments: '',
    concurrence: [
      { name: 'Michael Olubunmi Asalu', role: 'Group Head, General Services' },
      { name: 'John Odey', role: 'Executive Director, General Services' }
    ],
    approvedBy: [
      { name: 'Korede Adedayo', role: 'Managing Director/CEO' }
    ]
  }
  router.replace({ params: {} })
  lastSavedContent.value = ''
  lastSavedTitle.value = 'New Memo'
  lastSavedFooterFields.value = { ...footerFields.value }
  hasUnsavedChanges.value = false
  clearDraft()
  activeMenu.value = null
}

const handleOpen = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.docx,.doc'
  input.onchange = (e) => { 
    const file = e.target.files[0]
    if (file) loadDocxFromFile(file) 
  }
  input.click()
  activeMenu.value = null
}

const handleSaveAs = () => {
  const content = editor.value?.getHTML()
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${memoTitle.value || 'memo'}-${new Date().toISOString().slice(0, 10)}.html`
  a.click()
  showToastMessage('File saved successfully', 'success')
  activeMenu.value = null
}

// Editor formatting functions
const setHeading = () => {
  if (headingLevel.value === '0') {
    editor.value?.chain().focus().setParagraph().run()
  } else {
    editor.value?.chain().focus().setHeading({ level: parseInt(headingLevel.value) }).run()
  }
}

const setFontFamily = () => {
  editor.value?.chain().focus().setFontFamily(fontFamily.value).run()
}

const setFontSize = () => {
  editor.value?.chain().focus().setFontSize(`${fontSize.value}px`).run()
}

const setTextColor = () => {
  editor.value?.chain().focus().setColor(textColor.value).run()
}

const setLineHeight = () => {
  editor.value?.chain().focus().setLineHeight(lineHeight.value).run()
}

const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const insertImage = () => {
  const url = prompt('Enter image URL:')
  if (url) editor.value?.chain().focus().setImage({ src: url }).run()
}

const insertLink = () => {
  const url = prompt('Enter URL:')
  if (url) editor.value?.chain().focus().setLink({ href: url }).run()
}

const insertHorizontalRule = () => {
  editor.value?.chain().focus().setHorizontalRule().run()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark')
}

const toggleRuler = () => {
  showRuler.value = !showRuler.value
}

const handleCut = () => {
  document.execCommand('cut')
}

const handleCopy = () => {
  document.execCommand('copy')
}

const handlePaste = () => {
  document.execCommand('paste')
}

const handleExportPDF = () => {
  showToastMessage('PDF export feature coming soon', 'info')
}

const handleExportDOCX = () => {
  showToastMessage('DOCX export feature coming soon', 'info')
}

const handlePrint = () => {
  window.print()
}

// Watchers
watch([hasUnsavedChanges, memoId], () => {
  if (hasUnsavedChanges.value && memoId.value) saveDraftToLocal()
  else if (!hasUnsavedChanges.value && memoId.value) clearDraft()
})

// Lifecycle
onMounted(() => {
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges.value) { 
      e.preventDefault()
      e.returnValue = '' 
    }
  })
  
  if (memoId.value) {
    fetchMemo(memoId.value)
  } else { 
    loadDocxTemplate(defaultTemplate)
    checkForDraft()
  }
  
  document.addEventListener('click', () => { 
    activeMenu.value = null
    showColorPicker.value = false
  })
})

onUnmounted(() => {
  editor.value?.destroy()
  autoSaveDebounced.cancel()
  window.removeEventListener('beforeunload', () => {})
  document.removeEventListener('click', () => {})
})
</script>

<style scoped>
.memo-editor-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--color-white);
  border-radius: 1rem;
  border: 1px solid var(--color-gray-200);
  overflow: hidden;
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.dark .memo-editor-container { background-color: var(--color-gray-900); border-color: var(--color-gray-800); }

.editor-header {
  background-color: var(--color-white);
  border-bottom: 2px solid var(--color-gray-200);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.dark .editor-header { background-color: var(--color-gray-900); border-bottom-color: var(--color-gray-700); }

.header-left { display: flex; align-items: center; gap: 1rem; flex: 1; }

.dashboard-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-brand-50); color: var(--color-brand-600);
  border: 1px solid var(--color-brand-200); border-radius: 0.5rem;
  font-weight: 500; font-size: 0.875rem; cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
.dashboard-btn:hover { background-color: var(--color-brand-100); }

.title-input-container { display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 250px; position: relative; }
.title-input {
  flex: 1; height: 2.5rem; padding: 0 0.75rem;
  font-size: 1rem; font-weight: 500;
  border: 1px solid var(--color-gray-300); border-radius: 0.5rem;
  background-color: var(--color-white); color: var(--color-gray-900); transition: all 0.2s;
}
.dark .title-input { background-color: var(--color-gray-800); border-color: var(--color-gray-700); color: var(--color-gray-100); }
.title-input:focus { outline: none; border-color: var(--color-brand-500); box-shadow: 0 0 0 3px var(--color-brand-100); }

.auto-save-status { position: absolute; right: 0; top: -1.5rem; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 1rem; white-space: nowrap; }
.auto-save-status.success { background-color: var(--color-success-50); color: var(--color-success-600); }
.auto-save-status.error { background-color: var(--color-error-50); color: var(--color-error-600); }
.reference-badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; background-color: var(--color-gray-100); border-radius: 2rem; font-size: 0.75rem; color: var(--color-gray-600); white-space: nowrap; }
.dark .reference-badge { background-color: var(--color-gray-800); color: var(--color-gray-400); }

.header-actions { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
.action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
.action-btn.primary { background-color: var(--color-brand-500); color: white; border: none; }
.action-btn.primary:hover { background-color: var(--color-brand-600); }
.action-btn.secondary { background-color: var(--color-white); color: var(--color-gray-700); border: 1px solid var(--color-gray-300); }
.dark .action-btn.secondary { background-color: var(--color-gray-800); color: var(--color-gray-300); border-color: var(--color-gray-600); }
.action-btn.secondary:hover { background-color: var(--color-gray-50); }

.approval-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.875rem; font-weight: 500; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-draft { background-color: var(--color-gray-100); color: var(--color-gray-600); }
.status-draft .status-dot { background-color: var(--color-gray-500); }
.status-pending { background-color: #FFF3E0; color: #FF8C00; }
.status-pending .status-dot { background-color: #FF8C00; animation: pulse 2s infinite; }
.status-approved { background-color: #E8F5E9; color: #2E7D32; }
.status-approved .status-dot { background-color: #2E7D32; }
.status-rejected { background-color: #FFEBEE; color: #C62828; }
.status-rejected .status-dot { background-color: #C62828; }
.dark .status-draft { background-color: var(--color-gray-800); color: var(--color-gray-400); }
.dark .status-pending { background-color: #4A3A2A; color: #FFB74D; }
.dark .status-approved { background-color: #1B3A2B; color: #81C784; }
.dark .status-rejected { background-color: #3A2A2A; color: #E57373; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-content { background-color: var(--color-white); border-radius: 1rem; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
.dark .modal-content { background-color: var(--color-gray-900); border: 1px solid var(--color-gray-800); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid var(--color-gray-200); display: flex; justify-content: space-between; align-items: center; }
.dark .modal-header { border-bottom-color: var(--color-gray-800); }
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-gray-500); padding: .5rem; }
.close-btn:hover { color: var(--color-gray-700); }
.modal-body { padding: 1.5rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: .5rem; font-weight: 500; font-size: .875rem; color: var(--color-gray-700); }
.dark .form-group label { color: var(--color-gray-300); }
.approver-select, .date-input, .message-input { width: 100%; padding: .75rem; border: 1px solid var(--color-gray-300); border-radius: .5rem; font-size: .875rem; background-color: var(--color-white); color: var(--color-gray-900); }
.dark .approver-select, .dark .date-input, .dark .message-input { background-color: var(--color-gray-800); border-color: var(--color-gray-700); color: var(--color-gray-100); }
.message-input { resize: vertical; font-family: inherit; }
.priority-options { display: flex; gap: 1rem; flex-wrap: wrap; }
.priority-option { display: flex; align-items: center; gap: .5rem; cursor: pointer; }
.priority-badge { padding: .25rem .75rem; border-radius: 1rem; font-size: .75rem; font-weight: 500; }
.priority-badge.low { background-color: #E8F5E9; color: #2E7D32; }
.priority-badge.medium { background-color: #E3F2FD; color: #1976D2; }
.priority-badge.high { background-color: #FFF3E0; color: #F57C00; }
.priority-badge.urgent { background-color: #FFEBEE; color: #C62828; }
.checkbox-label { display: flex; align-items: center; gap: .5rem; cursor: pointer; }
.checkbox-label input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }
.modal-footer { padding: 1.5rem; border-top: 1px solid var(--color-gray-200); display: flex; justify-content: flex-end; gap: 1rem; }
.dark .modal-footer { border-top-color: var(--color-gray-800); }
.cancel-btn { padding: .75rem 1.5rem; background-color: transparent; border: 1px solid var(--color-gray-300); border-radius: .5rem; color: var(--color-gray-700); font-weight: 500; cursor: pointer; }
.dark .cancel-btn { border-color: var(--color-gray-700); color: var(--color-gray-300); }
.cancel-btn:hover { background-color: var(--color-gray-50); }
.send-btn { padding: .75rem 1.5rem; background-color: var(--color-brand-500); border: none; border-radius: .5rem; color: white; font-weight: 500; cursor: pointer; }
.send-btn:hover:not(:disabled) { background-color: var(--color-brand-600); }
.send-btn:disabled { opacity: .5; cursor: not-allowed; }

/* Toast */
.toast-notification { position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: .75rem; padding: 1rem 1.5rem; background-color: var(--color-white); border-radius: .5rem; box-shadow: 0 4px 20px rgba(0,0,0,.15); z-index: 1100; animation: slideIn .3s ease; }
.dark .toast-notification { background-color: var(--color-gray-800); border: 1px solid var(--color-gray-700); }
.toast-notification.success { border-left: 4px solid #2E7D32; }
.toast-notification.error { border-left: 4px solid #C62828; }
.toast-notification.info { border-left: 4px solid #1976D2; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* Menubar */
.menubar { background-color: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); padding: .5rem 1rem; display: flex; flex-wrap: wrap; gap: .5rem; flex-shrink: 0; }
.dark .menubar { background-color: var(--color-gray-800); border-bottom-color: var(--color-gray-700); }
.menubar-btn { padding: .375rem .75rem; font-size: .875rem; font-weight: 500; border-radius: .375rem; background-color: transparent; border: none; color: var(--color-gray-700); cursor: pointer; transition: background-color .2s; }
.dark .menubar-btn { color: var(--color-gray-300); }
.menubar-btn:hover { background-color: var(--color-gray-200); }
.menu-dropdown { position: absolute; top: 100%; left: 0; margin-top: .25rem; width: 12rem; background-color: var(--color-white); border-radius: .5rem; box-shadow: var(--shadow-theme-lg); border: 1px solid var(--color-gray-200); z-index: 50; padding: .25rem 0; }
.dark .menu-dropdown { background-color: var(--color-gray-800); border-color: var(--color-gray-700); }
.menu-item { width: 100%; text-align: left; padding: .5rem 1rem; font-size: .875rem; background-color: transparent; border: none; color: var(--color-gray-700); cursor: pointer; }
.dark .menu-item { color: var(--color-gray-300); }
.menu-item:hover { background-color: var(--color-gray-100); }
.dark .menu-item:hover { background-color: var(--color-gray-700); }
.menu-divider { height: 1px; background-color: var(--color-gray-200); margin: .25rem 0; }
.dark .menu-divider { background-color: var(--color-gray-700); }

/* Toolbar */
.toolbar { background-color: var(--color-white); border-bottom: 1px solid var(--color-gray-200); padding: .5rem; display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; flex-shrink: 0; }
.dark .toolbar { background-color: var(--color-gray-900); border-bottom-color: var(--color-gray-700); }
.toolbar-btn { width: 2rem; height: 2rem; border-radius: .375rem; display: flex; align-items: center; justify-content: center; background-color: transparent; border: none; color: var(--color-gray-700); cursor: pointer; transition: all .2s; }
.dark .toolbar-btn { color: var(--color-gray-300); }
.toolbar-btn:hover { background-color: var(--color-gray-100); }
.dark .toolbar-btn:hover { background-color: var(--color-gray-800); }
.toolbar-btn.active { background-color: var(--color-gray-200); color: var(--color-brand-500); }
.toolbar-select { height: 2rem; padding: 0 .5rem; font-size: .875rem; border: 1px solid var(--color-gray-300); border-radius: .375rem; background-color: var(--color-white); color: var(--color-gray-700); cursor: pointer; outline: none; }
.dark .toolbar-select { background-color: var(--color-gray-800); border-color: var(--color-gray-600); color: var(--color-gray-300); }
.toolbar-select.font-family { width: 8rem; }
.toolbar-select.font-size { width: 5rem; }
.toolbar-select.line-height { width: 5rem; }
.toolbar-divider { width: 1px; height: 1.5rem; background-color: var(--color-gray-300); margin: 0 .25rem; }
.dark .toolbar-divider { background-color: var(--color-gray-600); }
.color-picker-container { position: relative; }
.color-preview { width: 1rem; height: 1rem; border-radius: 9999px; }
.color-picker-dropdown { position: absolute; top: 100%; left: 0; margin-top: .25rem; padding: .5rem; background-color: var(--color-white); border-radius: .5rem; box-shadow: var(--shadow-theme-lg); border: 1px solid var(--color-gray-200); z-index: 50; }
.dark .color-picker-dropdown { background-color: var(--color-gray-800); border-color: var(--color-gray-700); }
.color-input { width: 8rem; height: 2rem; border: none; background: transparent; cursor: pointer; }

/* Attachment List */
.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
}
.dark .attachment-list {
  background-color: var(--color-gray-800);
  border-bottom-color: var(--color-gray-700);
}
.attachment-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: 2rem;
  font-size: 0.75rem;
}
.dark .attachment-badge {
  background-color: var(--color-gray-900);
  border-color: var(--color-gray-600);
}
.attachment-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.attachment-size {
  color: var(--color-gray-500);
  font-size: 0.7rem;
}
.remove-attachment {
  background: none;
  border: none;
  color: var(--color-error-500);
  cursor: pointer;
  font-size: 1rem;
  padding: 0 0.25rem;
  border-radius: 50%;
}
.remove-attachment:hover {
  color: var(--color-error-700);
}

/* Ruler */
.ruler { background-color: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); height: 1.5rem; padding: 0 2rem; display: flex; align-items: flex-end; flex-shrink: 0; }
.dark .ruler { background-color: var(--color-gray-800); border-bottom-color: var(--color-gray-700); }
.ruler-container { position: relative; width: 100%; height: 1rem; }
.ruler-base { position: absolute; left: 0; top: 0; width: 100%; height: .5rem; background-color: var(--color-gray-200); border-radius: .25rem; }
.dark .ruler-base { background-color: var(--color-gray-700); }
.ruler-mark { position: absolute; top: 0; width: 1px; height: .5rem; background-color: var(--color-gray-400); }
.ruler-number { position: absolute; top: .75rem; font-size: .625rem; color: var(--color-gray-500); }

/* Scroll + Document */
.editor-scroll-container { overflow: auto; padding: 2rem; background-color: var(--color-gray-100); flex: 1; min-height: 0; }
.dark .editor-scroll-container { background-color: var(--color-gray-950); }
.editor-scroll-container::-webkit-scrollbar { width: 8px; height: 8px; }
.editor-scroll-container::-webkit-scrollbar-track { background: var(--color-gray-200); border-radius: 4px; }
.dark .editor-scroll-container::-webkit-scrollbar-track { background: var(--color-gray-800); }
.editor-scroll-container::-webkit-scrollbar-thumb { background: var(--color-gray-500); border-radius: 4px; }
.editor-scroll-container::-webkit-scrollbar-thumb:hover { background: var(--color-gray-600); }

.document-page {
  width: 8.5in;
  min-height: 11in;
  padding: 1in;
  box-sizing: border-box;
  background-color: var(--color-white);
  box-shadow: 0 4px 20px rgba(0,0,0,.1);
  margin: 0 auto;
  max-width: 100%;
}
.dark .document-page { background-color: var(--color-gray-900); box-shadow: 0 4px 20px rgba(0,0,0,.3); }

/* Divider between editor body and footer */
.memo-footer-divider {
  border: none;
  border-top: 1px solid var(--color-gray-300);
  margin: 2rem 0 1.5rem;
}
.dark .memo-footer-divider { border-top-color: var(--color-gray-700); }

/* Editor content */
.editor-content { max-width: none; outline: none; }
.editor-content :deep(p) { margin: 0 0 1rem 0; }
.editor-content :deep(h1) { font-size: 2em; font-weight: bold; margin: .67em 0; }
.editor-content :deep(h2) { font-size: 1.5em; font-weight: bold; margin: .83em 0; }
.editor-content :deep(h3) { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
.editor-content :deep(ul), .editor-content :deep(ol) { padding-left: 2rem; margin: 1rem 0; }
.editor-content :deep(table) { border-collapse: collapse; width: 100%; margin: 1rem 0; }
.editor-content :deep(th) { background-color: var(--color-gray-100); font-weight: bold; padding: .5rem; border: 1px solid var(--color-gray-300); }
.dark .editor-content :deep(th) { background-color: var(--color-gray-800); border-color: var(--color-gray-700); }
.editor-content :deep(td) { padding: .5rem; border: 1px solid var(--color-gray-300); }
.dark .editor-content :deep(td) { border-color: var(--color-gray-700); }
.editor-content :deep(p:empty)::after { content: '\00a0'; }
.editor-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-gray-400); font-style: italic; }

/* Status Bar */
.status-bar { background-color: var(--color-gray-50); border-top: 1px solid var(--color-gray-200); padding: .25rem 1rem; font-size: .75rem; color: var(--color-gray-600); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.dark .status-bar { background-color: var(--color-gray-800); border-top-color: var(--color-gray-700); color: var(--color-gray-400); }
.status-right { display: flex; align-items: center; gap: 1rem; }
.approver-indicator { display: flex; align-items: center; gap: .25rem; padding: .125rem .5rem; background-color: #FFF3E0; color: #FF8C00; border-radius: 1rem; font-size: .75rem; }
.dark .approver-indicator { background-color: #4A3A2A; color: #FFB74D; }
.document-indicator { display: flex; align-items: center; gap: .25rem; padding: .125rem .5rem; background-color: var(--color-brand-50); color: var(--color-brand-600); border-radius: 1rem; font-size: .75rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dark .document-indicator { background-color: var(--color-brand-500/10); color: var(--color-brand-400); }

/* Loading */
.loading-overlay { position: absolute; inset: 0; background-color: rgba(255,255,255,.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
.dark .loading-overlay { background-color: rgba(0,0,0,.9); }
.loading-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-brand-500); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-overlay p { color: var(--color-gray-700); font-size: .875rem; }
.dark .loading-overlay p { color: var(--color-gray-300); }

/* Print */
@media print {
  .menubar, .toolbar, .ruler, .status-bar, .loading-overlay, .editor-header { display: none !important; }
  .document-page { box-shadow: none; margin: 0; padding: .5in; }
  .editor-scroll-container { padding: 0; background: white; }
}

/* Responsive */
@media (max-width: 768px) {
  .editor-header { flex-direction: column; gap: 1rem; align-items: stretch; }
  .header-left { flex-direction: column; align-items: stretch; }
  .title-input-container { width: 100%; }
  .header-actions { flex-wrap: wrap; justify-content: center; }
  .action-btn { flex: 1; justify-content: center; }
  .modal-content { width: 95%; margin: 1rem; }
  .priority-options { flex-direction: column; gap: .5rem; }
  .attachment-name { max-width: 120px; }
}
</style>