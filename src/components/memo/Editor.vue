<template>
  <div class="memo-editor-container">
    <!-- Loading overlay while loading DOCX -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading memo template...</p>
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
        <span class="memo-title-indicator" v-if="documentInfo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          {{ documentInfo }}
        </span>
      </div>
      
      <div class="header-actions">
        <!-- Approval Workflow Buttons -->
        <div class="approval-badge" :class="approvalStatusClass">
          <span class="status-dot"></span>
          {{ currentApprovalStatus }}
        </div>
        
        <button @click="showApproverModal = true" class="action-btn primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Send to Approver
        </button>
        
        <button @click="handleSave" class="action-btn secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Draft
        </button>
      </div>
    </div>

    <!-- Approver Selection Modal -->
    <div v-if="showApproverModal" class="modal-overlay" @click.self="showApproverModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Send for Approval</h3>
          <button @click="showApproverModal = false" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Select Approver</label>
            <select v-model="selectedApprover" class="approver-select">
              <option value="" disabled>Choose next approver...</option>
              <option v-for="approver in approversList" :key="approver.id" :value="approver.id">
                {{ approver.name }} - {{ approver.role }} ({{ approver.department }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Priority Level</label>
            <div class="priority-options">
              <label class="priority-option">
                <input type="radio" v-model="priority" value="low">
                <span class="priority-badge low">Low</span>
              </label>
              <label class="priority-option">
                <input type="radio" v-model="priority" value="medium">
                <span class="priority-badge medium">Medium</span>
              </label>
              <label class="priority-option">
                <input type="radio" v-model="priority" value="high">
                <span class="priority-badge high">High</span>
              </label>
              <label class="priority-option">
                <input type="radio" v-model="priority" value="urgent">
                <span class="priority-badge urgent">Urgent</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Due Date (Optional)</label>
            <input type="date" v-model="dueDate" class="date-input">
          </div>
          
          <div class="form-group">
            <label>Message to Approver</label>
            <textarea 
              v-model="approverMessage" 
              placeholder="Add any notes or instructions for the approver..."
              rows="3"
              class="message-input"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="notifyByEmail">
              Notify approver by email
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showApproverModal = false" class="cancel-btn">Cancel</button>
          <button 
            @click="sendToApprover" 
            class="send-btn"
            :disabled="!selectedApprover"
          >
            Send for Approval
          </button>
        </div>
      </div>
    </div>

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

    <!-- Menubar -->
    <div class="menubar">
      <!-- File Menu -->
      <div class="relative" @click.stop>
        <button @click="toggleMenu('file')" class="menubar-btn">
          File
        </button>
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

      <!-- Edit Menu -->
      <div class="relative" @click.stop>
        <button @click="toggleMenu('edit')" class="menubar-btn">
          Edit
        </button>
        <div v-if="activeMenu === 'edit'" class="menu-dropdown">
          <button @click="editor?.chain().focus().undo().run()" class="menu-item">Undo</button>
          <button @click="editor?.chain().focus().redo().run()" class="menu-item">Redo</button>
          <div class="menu-divider"></div>
          <button @click="handleCut" class="menu-item">Cut</button>
          <button @click="handleCopy" class="menu-item">Copy</button>
          <button @click="handlePaste" class="menu-item">Paste</button>
        </div>
      </div>

      <!-- View Menu -->
      <div class="relative" @click.stop>
        <button @click="toggleMenu('view')" class="menubar-btn">
          View
        </button>
        <div v-if="activeMenu === 'view'" class="menu-dropdown">
          <button @click="toggleFullscreen" class="menu-item">
            {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
          </button>
          <button @click="toggleDarkMode" class="menu-item">
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </button>
          <button @click="toggleRuler" class="menu-item">
            {{ showRuler ? 'Hide Ruler' : 'Show Ruler' }}
          </button>
        </div>
      </div>

      <!-- Approval Menu (New) -->
      <div class="relative" @click.stop>
        <button @click="toggleMenu('approval')" class="menubar-btn approval-menu-btn">
          Approval
          <span v-if="approvalHistory.length > 0" class="menu-badge">{{ approvalHistory.length }}</span>
        </button>
        <div v-if="activeMenu === 'approval'" class="menu-dropdown approval-dropdown">
          <div class="dropdown-header">
            <strong>Approval History</strong>
          </div>
          <div v-if="approvalHistory.length === 0" class="empty-history">
            No approval history yet
          </div>
          <div v-for="(item, index) in approvalHistory" :key="index" class="history-item">
            <div class="history-header">
              <span class="history-action" :class="item.action.toLowerCase()">{{ item.action }}</span>
              <span class="history-date">{{ formatDate(item.date) }}</span>
            </div>
            <div class="history-details">
              <span class="history-approver">{{ item.approver }}</span>
              <span class="history-role">{{ item.role }}</span>
            </div>
            <div v-if="item.comment" class="history-comment">"{{ item.comment }}"</div>
          </div>
          <div class="menu-divider"></div>
          <button @click="showApproverModal = true" class="menu-item approval-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Send to Next Approver
          </button>
          <button @click="viewApprovalFlow" class="menu-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M2 3h6a4 4 0 0 1 4 4v14"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14"/>
            </svg>
            View Approval Flow
          </button>
        </div>
      </div>
    </div>

    <!-- Main Toolbar -->
    <div class="toolbar">
      <!-- Text Style -->
      <select v-model="headingLevel" @change="setHeading" class="toolbar-select">
        <option value="0">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <div class="toolbar-divider"></div>

      <!-- Font Formatting -->
      <button @click="editor?.chain().focus().toggleBold().run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive('bold') }"
              title="Bold (Ctrl+B)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().toggleItalic().run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive('italic') }"
              title="Italic (Ctrl+I)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 4h-9M14 20H5M15 4L9 20"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().toggleUnderline().run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive('underline') }"
              title="Underline (Ctrl+U)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
          <path d="M4 21h16"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().toggleStrike().run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive('strike') }"
              title="Strikethrough">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 4H9a4 4 0 0 0-4 4 4 4 0 0 0 4 4h6a4 4 0 0 1 4 4 4 4 0 0 1-4 4H7"/>
          <path d="M3 12h18"/>
        </svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- Font Family & Size -->
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

      <!-- Text Color -->
      <div class="color-picker-container">
        <button @click="showColorPicker = !showColorPicker" class="toolbar-btn">
          <div class="color-preview" :style="{ backgroundColor: textColor }"></div>
        </button>
        <div v-if="showColorPicker" class="color-picker-dropdown">
          <input type="color" v-model="textColor" @change="setTextColor" class="color-input">
        </div>
      </div>

      <div class="toolbar-divider"></div>

      <!-- Alignment -->
      <button @click="editor?.chain().focus().setTextAlign('left').run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive({ textAlign: 'left' }) }"
              title="Align Left">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M3 12h12M3 18h18"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().setTextAlign('center').run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive({ textAlign: 'center' }) }"
              title="Center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M7 12h10M5 18h14"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().setTextAlign('right').run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive({ textAlign: 'right' }) }"
              title="Align Right">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M9 12h12M3 18h18"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().setTextAlign('justify').run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive({ textAlign: 'justify' }) }"
              title="Justify">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- Lists & Indent -->
      <button @click="editor?.chain().focus().toggleBulletList().run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive('bulletList') }"
              title="Bullet List">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().toggleOrderedList().run()" 
              class="toolbar-btn" 
              :class="{ active: editor?.isActive('orderedList') }"
              title="Numbered List">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M10 6h11M10 12h11M10 18h11M4 6h1M4 12h1M4 18h1"/>
          <path d="M4 6v3M4 12v3M4 18v3"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().indent().run()" 
              class="toolbar-btn" 
              title="Increase Indent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M3 12h18M3 18h18M13 8l4 4-4 4"/>
        </svg>
      </button>

      <button @click="editor?.chain().focus().outdent().run()" 
              class="toolbar-btn" 
              title="Decrease Indent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M3 12h18M3 18h18M17 8l-4 4 4 4"/>
        </svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- Line Spacing -->
      <select v-model="lineHeight" @change="setLineHeight" class="toolbar-select line-height">
        <option value="1">1.0</option>
        <option value="1.15">1.15</option>
        <option value="1.5">1.5</option>
        <option value="2">2.0</option>
        <option value="2.5">2.5</option>
        <option value="3">3.0</option>
      </select>

      <div class="toolbar-divider"></div>

      <!-- Insert Menu -->
      <button @click="insertTable" class="toolbar-btn" title="Insert Table">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 3h18v18H3z"/>
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
        </svg>
      </button>

      <button @click="insertImage" class="toolbar-btn" title="Insert Image">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="2" y="2" width="20" height="20" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L6 21"/>
        </svg>
      </button>

      <button @click="insertLink" class="toolbar-btn" title="Insert Link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>

      <button @click="insertHorizontalRule" class="toolbar-btn" title="Horizontal Line">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12h18"/>
        </svg>
      </button>
    </div>

    <!-- Document Ruler (optional) -->
    <div v-if="showRuler" class="ruler">
      <div class="ruler-container">
        <div class="ruler-base"></div>
        <div v-for="i in 15" :key="i" class="ruler-mark" :style="{ left: (i * 60) + 'px' }"></div>
        <div v-for="i in 15" :key="i + 'num'" class="ruler-number" :style="{ left: (i * 60 - 5) + 'px' }">{{ i }}</div>
      </div>
    </div>

    <!-- Editor Content Area with US Letter Format -->
    <div class="editor-scroll-container">
      <div class="document-page" 
           :style="{ 
             fontFamily, 
             fontSize: fontSize + 'px', 
             lineHeight 
           }">
        <editor-content v-if="editor" :editor="editor" class="editor-content" />
        <div v-else class="editor-placeholder">
          <p>Loading document...</p>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div>Words: {{ wordCount }} | Characters: {{ charCount }}</div>
      <div class="status-right">
        <span v-if="currentApprover" class="approver-indicator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Next: {{ currentApprover }}
        </span>
        <span class="document-indicator" v-if="documentInfo">
          📄 {{ documentInfo }}
        </span>
        <span>{{ editor?.isEditable ? 'Editing' : 'Read Only' }} | Page 1 of {{ pageCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
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

// Import the DOCX file (adjust the path to your actual file)
import defaultTemplate from '@/assets/templates/memo-template.docx?url'

// Custom extension for line height
const LineHeight = Extension.create({
  name: 'lineHeight',
  addGlobalAttributes() {
    return [
      {
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
      },
    ]
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

// Router
const router = useRouter()

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
const isLoading = ref(true)
const documentInfo = ref('Loading template...')
const showApproverModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Approval workflow state
const selectedApprover = ref('')
const priority = ref('medium')
const dueDate = ref('')
const approverMessage = ref('')
const notifyByEmail = ref(true)
const approvalHistory = ref([])
const currentApprovalStatus = ref('Draft')
const currentApprover = ref('')

// Mock data - replace with actual API calls
const approversList = ref([
  { id: 1, name: 'Sarah Johnson', role: 'Compliance Officer', department: 'Compliance' },
  { id: 2, name: 'Michael Chen', role: 'Risk Manager', department: 'Risk Management' },
  { id: 3, name: 'David Okonkwo', role: 'Branch Operations Head', department: 'Operations' },
  { id: 4, name: 'Amara Okafor', role: 'Legal Counsel', department: 'Legal' },
  { id: 5, name: 'James Wilson', role: 'Finance Director', department: 'Finance' },
  { id: 6, name: 'Patricia Eze', role: 'CEO', department: 'Executive' },
])

const editor = useEditor({
  content: '<p>Loading memo template...</p>',
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    FontFamily,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Image,
    Link.configure({
      openOnClick: false,
    }),
    Placeholder.configure({
      placeholder: 'Write your memo...',
    }),
    CharacterCount,
    LineHeight,
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none',
    },
  },
  immediatelyRender: false,
})

// Computed
const wordCount = computed(() => {
  if (!editor.value) return 0
  const text = editor.value.getText()
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
})

const charCount = computed(() => {
  if (!editor.value) return 0
  return editor.value.getText().length
})

const pageCount = computed(() => 1)

const isDark = computed(() => document.documentElement.classList.contains('dark'))

const approvalStatusClass = computed(() => {
  return {
    'status-draft': currentApprovalStatus.value === 'Draft',
    'status-pending': currentApprovalStatus.value === 'Pending Approval',
    'status-approved': currentApprovalStatus.value === 'Approved',
    'status-rejected': currentApprovalStatus.value === 'Rejected',
  }
})

// Methods
const goToDashboard = () => {
  router.push('/') // Adjust path as needed
}

const toggleMenu = (menu) => {
  activeMenu.value = activeMenu.value === menu ? null : menu
}

const handleNew = () => {
  if (confirm('Clear current memo and start a new one?')) {
    editor.value?.commands.clearContent()
    editor.value?.commands.setContent('<p>Start typing your memo here...</p>')
    documentInfo.value = 'New document'
    approvalHistory.value = []
    currentApprovalStatus.value = 'Draft'
    currentApprover.value = ''
    activeMenu.value = null
  }
}

const handleOpen = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.docx,.doc'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      loadDocxFromFile(file)
    }
  }
  input.click()
  activeMenu.value = null
}

const handleSave = () => {
  const content = editor.value?.getHTML()
  console.log('Saving:', content)
  showToastMessage('Draft saved successfully', 'success')
  activeMenu.value = null
}

const handleSaveAs = () => {
  const content = editor.value?.getHTML()
  const filename = documentInfo.value?.replace('.docx', '') || 'memo'
  const fullFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.html`
  
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fullFilename
  a.click()
  showToastMessage('File saved successfully', 'success')
  activeMenu.value = null
}

const handleExportPDF = async () => {
  showToastMessage('PDF export coming soon', 'info')
  activeMenu.value = null
}

const handleExportDOCX = async () => {
  showToastMessage('DOCX export coming soon', 'info')
  activeMenu.value = null
}

const handlePrint = () => {
  window.print()
  activeMenu.value = null
}

const handleCut = () => {
  document.execCommand('cut')
  activeMenu.value = null
}

const handleCopy = () => {
  document.execCommand('copy')
  activeMenu.value = null
}

const handlePaste = () => {
  navigator.clipboard.readText().then(text => {
    editor.value?.commands.insertContent(text)
  })
  activeMenu.value = null
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
  activeMenu.value = null
}

const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark')
  activeMenu.value = null
}

const toggleRuler = () => {
  showRuler.value = !showRuler.value
  activeMenu.value = null
}

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
  editor.value?.chain().focus().setMark('textStyle', { fontSize: `${fontSize.value}px` }).run()
}

const setTextColor = () => {
  editor.value?.chain().focus().setColor(textColor.value).run()
  showColorPicker.value = false
}

const setLineHeight = () => {
  editor.value?.chain().focus().setLineHeight(lineHeight.value).run()
}

const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const insertImage = () => {
  const url = window.prompt('Enter image URL:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

const insertLink = () => {
  const url = window.prompt('Enter URL:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

const insertHorizontalRule = () => {
  editor.value?.chain().focus().setHorizontalRule().run()
}

// Load DOCX template function
const loadDocxTemplate = async (fileUrl) => {
  try {
    isLoading.value = true
    documentInfo.value = 'Loading template...'
    
    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()
    
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Subtitle'] => h2:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
      includeDefaultStyleMap: true,
      convertImage: mammoth.images.imgElement(function(element) {
        return element.read("base64").then(function(imageBuffer) {
          return {
            src: "data:" + element.contentType + ";base64," + imageBuffer
          };
        });
      })
    })
    
    let html = result.value
    html = `<div class="memo-content">${html}</div>`
    
    if (editor.value) {
      editor.value.commands.setContent(html)
    }
    
    const fileName = fileUrl.split('/').pop() || 'memo-template.docx'
    documentInfo.value = fileName
    
  } catch (error) {
    console.error('Error loading DOCX template:', error)
    documentInfo.value = 'Error loading template'
    
    if (editor.value) {
      editor.value.commands.setContent(`
        <h1 style="text-align: center;">MEMORANDUM</h1>
        <p><strong>Error loading template:</strong> ${error.message}</p>
        <p>Please check that the template file exists and try again.</p>
      `)
    }
  } finally {
    isLoading.value = false
  }
}

const loadDocxFromFile = async (file) => {
  try {
    isLoading.value = true
    documentInfo.value = file.name
    
    const arrayBuffer = await file.arrayBuffer()
    
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
      ],
      includeDefaultStyleMap: true,
    })
    
    let html = result.value
    html = `<div class="memo-content">${html}</div>`
    
    if (editor.value) {
      editor.value.commands.setContent(html)
    }
    
  } catch (error) {
    console.error('Error loading DOCX file:', error)
    documentInfo.value = 'Error loading file'
  } finally {
    isLoading.value = false
  }
}

// Approval workflow methods
const sendToApprover = () => {
  if (!selectedApprover.value) {
    showToastMessage('Please select an approver', 'error')
    return
  }
  
  const approver = approversList.value.find(a => a.id === parseInt(selectedApprover.value))
  
  // Add to approval history
  approvalHistory.value.push({
    action: 'Sent for Approval',
    approver: approver.name,
    role: approver.role,
    date: new Date(),
    comment: approverMessage.value || 'No comment',
    priority: priority.value,
  })
  
  // Update status
  currentApprovalStatus.value = 'Pending Approval'
  currentApprover.value = approver.name
  
  // Close modal
  showApproverModal.value = false
  
  // Save the memo first
  handleSave()
  
  // Show success message
  showToastMessage(`Memo sent to ${approver.name} for approval`, 'success')
  
  // Reset form
  selectedApprover.value = ''
  priority.value = 'medium'
  dueDate.value = ''
  approverMessage.value = ''
}

const viewApprovalFlow = () => {
  // This could open a modal showing the full approval flow
  showToastMessage('Approval flow view coming soon', 'info')
  activeMenu.value = null
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Load the default template on component mount
onMounted(() => {
  loadDocxTemplate(defaultTemplate)
  
  document.addEventListener('click', () => {
    activeMenu.value = null
    showColorPicker.value = false
  })
})

// Cleanup
onMounted(() => {
  return () => {
    editor.value?.destroy()
  }
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dark .memo-editor-container {
  background-color: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

/* Editor Header */
.editor-header {
  background-color: var(--color-white);
  border-bottom: 2px solid var(--color-gray-200);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .editor-header {
  background-color: var(--color-gray-900);
  border-bottom-color: var(--color-gray-700);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-brand-50);
  color: var(--color-brand-600);
  border: 1px solid var(--color-brand-200);
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: pointer;
}

.dark .dashboard-btn {
  background-color: var(--color-brand-500/10);
  color: var(--color-brand-400);
  border-color: var(--color-brand-500/20);
}

.dashboard-btn:hover {
  background-color: var(--color-brand-100);
}

.dark .dashboard-btn:hover {
  background-color: var(--color-brand-500/20);
}

.memo-title-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-gray-100);
  border-radius: 2rem;
  font-size: 0.875rem;
  color: var(--color-gray-700);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .memo-title-indicator {
  background-color: var(--color-gray-800);
  color: var(--color-gray-300);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background-color: var(--color-brand-500);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  background-color: var(--color-brand-600);
}

.action-btn.secondary {
  background-color: var(--color-white);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.dark .action-btn.secondary {
  background-color: var(--color-gray-800);
  color: var(--color-gray-300);
  border-color: var(--color-gray-600);
}

.action-btn.secondary:hover {
  background-color: var(--color-gray-50);
}

.dark .action-btn.secondary:hover {
  background-color: var(--color-gray-700);
}

.approval-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-draft .status-dot {
  background-color: var(--color-gray-500);
}
.status-pending .status-dot {
  background-color: #FF8C00;
  animation: pulse 2s infinite;
}
.status-approved .status-dot {
  background-color: #2E7D32;
}
.status-rejected .status-dot {
  background-color: #C62828;
}

.status-draft {
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
}
.status-pending {
  background-color: #FFF3E0;
  color: #FF8C00;
}
.status-approved {
  background-color: #E8F5E9;
  color: #2E7D32;
}
.status-rejected {
  background-color: #FFEBEE;
  color: #C62828;
}

.dark .status-draft {
  background-color: var(--color-gray-800);
  color: var(--color-gray-400);
}
.dark .status-pending {
  background-color: #4A3A2A;
  color: #FFB74D;
}
.dark .status-approved {
  background-color: #1B3A2B;
  color: #81C784;
}
.dark .status-rejected {
  background-color: #3A2A2A;
  color: #E57373;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
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

.approver-select,
.date-input,
.message-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: var(--color-white);
  color: var(--color-gray-900);
}

.dark .approver-select,
.dark .date-input,
.dark .message-input {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-gray-100);
}

.message-input {
  resize: vertical;
  font-family: inherit;
}

.priority-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.priority-option input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-badge.low {
  background-color: #E8F5E9;
  color: #2E7D32;
}
.priority-badge.medium {
  background-color: #E3F2FD;
  color: #1976D2;
}
.priority-badge.high {
  background-color: #FFF3E0;
  color: #F57C00;
}
.priority-badge.urgent {
  background-color: #FFEBEE;
  color: #C62828;
}

.dark .priority-badge.low {
  background-color: #1B3A2B;
  color: #81C784;
}
.dark .priority-badge.medium {
  background-color: #1A3A4A;
  color: #64B5F6;
}
.dark .priority-badge.high {
  background-color: #4A3A2A;
  color: #FFB74D;
}
.dark .priority-badge.urgent {
  background-color: #4A2A2A;
  color: #E57373;
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
.toast-notification.info {
  border-left: 4px solid #1976D2;
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

/* Approval Menu */
.menubar-btn.approval-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-badge {
  background-color: var(--color-brand-500);
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 1rem;
  min-width: 1.2rem;
  text-align: center;
}

.approval-dropdown {
  width: 18rem;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-gray-700);
  border-bottom: 1px solid var(--color-gray-200);
}

.dark .dropdown-header {
  color: var(--color-gray-300);
  border-bottom-color: var(--color-gray-700);
}

.empty-history {
  padding: 1.5rem;
  text-align: center;
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

.history-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.dark .history-item {
  border-bottom-color: var(--color-gray-800);
}

.history-item:last-child {
  border-bottom: none;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.history-action {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
}

.history-action.sent {
  background-color: #E3F2FD;
  color: #1976D2;
}
.history-action.approved {
  background-color: #E8F5E9;
  color: #2E7D32;
}
.history-action.rejected {
  background-color: #FFEBEE;
  color: #C62828;
}

.dark .history-action.sent {
  background-color: #1A3A4A;
  color: #64B5F6;
}
.dark .history-action.approved {
  background-color: #1B3A2B;
  color: #81C784;
}
.dark .history-action.rejected {
  background-color: #4A2A2A;
  color: #E57373;
}

.history-date {
  font-size: 0.7rem;
  color: var(--color-gray-500);
}

.history-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

.history-approver {
  font-weight: 500;
  color: var(--color-gray-900);
}

.dark .history-approver {
  color: var(--color-gray-100);
}

.history-role {
  color: var(--color-gray-500);
  font-size: 0.7rem;
}

.history-comment {
  font-size: 0.75rem;
  color: var(--color-gray-600);
  font-style: italic;
  background-color: var(--color-gray-50);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.25rem;
}

.dark .history-comment {
  color: var(--color-gray-400);
  background-color: var(--color-gray-800);
}

.approval-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Status Bar Approver Indicator */
.approver-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background-color: #FFF3E0;
  color: #FF8C00;
  border-radius: 1rem;
  font-size: 0.75rem;
}

.dark .approver-indicator {
  background-color: #4A3A2A;
  color: #FFB74D;
}

/* Menubar Styles (existing) */
.menubar {
  background-color: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
  padding: 0.5rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dark .menubar {
  background-color: var(--color-gray-800);
  border-bottom-color: var(--color-gray-700);
}

.menubar-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  background-color: transparent;
  border: none;
  color: var(--color-gray-700);
  cursor: pointer;
  transition: background-color 0.2s;
}

.dark .menubar-btn {
  color: var(--color-gray-300);
}

.menubar-btn:hover {
  background-color: var(--color-gray-200);
}

.dark .menubar-btn:hover {
  background-color: var(--color-gray-700);
}

/* Menu Dropdown Styles */
.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  width: 12rem;
  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-theme-lg);
  border: 1px solid var(--color-gray-200);
  z-index: 50;
  padding: 0.25rem 0;
}

.dark .menu-dropdown {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: transparent;
  border: none;
  color: var(--color-gray-700);
  cursor: pointer;
}

.dark .menu-item {
  color: var(--color-gray-300);
}

.menu-item:hover {
  background-color: var(--color-gray-100);
}

.dark .menu-item:hover {
  background-color: var(--color-gray-700);
}

.menu-divider {
  height: 1px;
  background-color: var(--color-gray-200);
  margin: 0.25rem 0;
}

.dark .menu-divider {
  background-color: var(--color-gray-700);
}

/* Toolbar Styles (existing) */
.toolbar {
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.dark .toolbar {
  background-color: var(--color-gray-900);
  border-bottom-color: var(--color-gray-700);
}

.toolbar-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  color: var(--color-gray-700);
  cursor: pointer;
  transition: all 0.2s;
}

.dark .toolbar-btn {
  color: var(--color-gray-300);
}

.toolbar-btn:hover {
  background-color: var(--color-gray-100);
}

.dark .toolbar-btn:hover {
  background-color: var(--color-gray-800);
}

.toolbar-btn.active {
  background-color: var(--color-gray-200);
  color: var(--color-brand-500);
}

.dark .toolbar-btn.active {
  background-color: var(--color-gray-800);
  color: var(--color-brand-400);
}

.toolbar-select {
  height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.375rem;
  background-color: var(--color-white);
  color: var(--color-gray-700);
  cursor: pointer;
  outline: none;
}

.dark .toolbar-select {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-600);
  color: var(--color-gray-300);
}

.toolbar-select.font-family {
  width: 8rem;
}

.toolbar-select.font-size {
  width: 5rem;
}

.toolbar-select.line-height {
  width: 5rem;
}

.toolbar-divider {
  width: 1px;
  height: 1.5rem;
  background-color: var(--color-gray-300);
  margin: 0 0.25rem;
}

.dark .toolbar-divider {
  background-color: var(--color-gray-600);
}

/* Color Picker Styles */
.color-picker-container {
  position: relative;
}

.color-preview {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
}

.color-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-theme-lg);
  border: 1px solid var(--color-gray-200);
  z-index: 50;
}

.dark .color-picker-dropdown {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
}

.color-input {
  width: 8rem;
  height: 2rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

/* Ruler Styles */
.ruler {
  background-color: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
  height: 1.5rem;
  padding: 0 2rem;
  display: flex;
  align-items: flex-end;
}

.dark .ruler {
  background-color: var(--color-gray-800);
  border-bottom-color: var(--color-gray-700);
}

.ruler-container {
  position: relative;
  width: 100%;
  height: 1rem;
}

.ruler-base {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 0.5rem;
  background-color: var(--color-gray-200);
  border-radius: 0.25rem;
}

.dark .ruler-base {
  background-color: var(--color-gray-700);
}

.ruler-mark {
  position: absolute;
  top: 0;
  width: 1px;
  height: 0.5rem;
  background-color: var(--color-gray-400);
}

.ruler-number {
  position: absolute;
  top: 0.75rem;
  font-size: 0.625rem;
  color: var(--color-gray-500);
}

/* Editor Scroll Container */
.editor-scroll-container {
  overflow: auto;
  padding: 2rem;
  background-color: var(--color-gray-100);
  flex: 1;
  min-height: 0;
}

.dark .editor-scroll-container {
  background-color: var(--color-gray-950);
}

.editor-scroll-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-scroll-container::-webkit-scrollbar-track {
  background: var(--color-gray-200);
  border-radius: 4px;
}

.dark .editor-scroll-container::-webkit-scrollbar-track {
  background: var(--color-gray-800);
}

.editor-scroll-container::-webkit-scrollbar-thumb {
  background: var(--color-gray-500);
  border-radius: 4px;
}

.editor-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-600);
}

/* Document Page */
.document-page {
  width: 8.5in;
  min-height: 11in;
  padding: 1in;
  box-sizing: border-box;
  background-color: var(--color-white);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.dark .document-page {
  background-color: var(--color-gray-900);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.editor-content {
  max-width: none;
  outline: none;
}

.editor-content :deep(p) {
  margin: 0 0 1rem 0;
}

.editor-content :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.editor-content :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.83em 0;
}

.editor-content :deep(h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin: 1em 0;
}

.editor-content :deep(ul), 
.editor-content :deep(ol) {
  padding-left: 2rem;
  margin: 1rem 0;
}

.editor-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.editor-content :deep(th) {
  background-color: var(--color-gray-100);
  font-weight: bold;
  padding: 0.5rem;
  border: 1px solid var(--color-gray-300);
}

.dark .editor-content :deep(th) {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
}

.editor-content :deep(td) {
  padding: 0.5rem;
  border: 1px solid var(--color-gray-300);
}

.dark .editor-content :deep(td) {
  border-color: var(--color-gray-700);
}

/* Status Bar */
.status-bar {
  background-color: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-200);
  padding: 0.25rem 1rem;
  font-size: 0.75rem;
  color: var(--color-gray-600);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .status-bar {
  background-color: var(--color-gray-800);
  border-top-color: var(--color-gray-700);
  color: var(--color-gray-400);
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.dark .loading-overlay {
  background-color: rgba(0, 0, 0, 0.9);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-brand-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  color: var(--color-gray-700);
  font-size: 0.875rem;
}

.dark .loading-overlay p {
  color: var(--color-gray-300);
}

/* Status Bar Document Indicator */
.status-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.document-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background-color: var(--color-brand-50);
  color: var(--color-brand-600);
  border-radius: 1rem;
  font-size: 0.75rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .document-indicator {
  background-color: var(--color-brand-500/10);
  color: var(--color-brand-400);
}

/* Editor placeholder */
.editor-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-gray-400);
  font-style: italic;
}

/* Print Styles */
@media print {
  .menubar,
  .toolbar,
  .ruler,
  .status-bar,
  .loading-overlay,
  .editor-header {
    display: none !important;
  }
  
  .document-page {
    box-shadow: none;
    margin: 0;
    padding: 0.5in;
  }
  
  .editor-scroll-container {
    padding: 0;
    background: white;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .priority-options {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>