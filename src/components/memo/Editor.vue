<template>
  <div class="memo-editor-container">
    <!-- Loading overlay while loading DOCX -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading memo template...</p>
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
        <span v-if="documentInfo" class="document-indicator">
          📄 {{ documentInfo }}
        </span>
        <span>{{ editor?.isEditable ? 'Editing' : 'Read Only' }} | Page 1 of {{ pageCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
// Use ?url to import as a URL
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

// Load DOCX template function
const loadDocxTemplate = async (fileUrl) => {
  try {
    isLoading.value = true
    documentInfo.value = 'Loading template...'
    
    // Fetch the DOCX file
    const response = await fetch(fileUrl)
    const arrayBuffer = await response.arrayBuffer()
    
    // Convert DOCX to HTML using mammoth
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
    
    // Get the HTML content
    let html = result.value
    
    // Wrap in a container if needed
    html = `<div class="memo-content">${html}</div>`
    
    // Set the content in the editor
    if (editor.value) {
      editor.value.commands.setContent(html)
    }
    
    // Extract document name from URL
    const fileName = fileUrl.split('/').pop() || 'memo-template.docx'
    documentInfo.value = fileName
    
    console.log('DOCX loaded successfully', result.messages)
    
  } catch (error) {
    console.error('Error loading DOCX template:', error)
    documentInfo.value = 'Error loading template'
    
    // Fallback content if loading fails
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

// Alternative method to load DOCX from file input
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

// Methods
const toggleMenu = (menu) => {
  activeMenu.value = activeMenu.value === menu ? null : menu
}

const handleNew = () => {
  if (confirm('Clear current memo and start a new one?')) {
    editor.value?.commands.clearContent()
    editor.value?.commands.setContent('<p>Start typing your memo here...</p>')
    documentInfo.value = 'New document'
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
  activeMenu.value = null
}

const handleExportPDF = async () => {
  alert('PDF export functionality coming soon')
  activeMenu.value = null
}

const handleExportDOCX = async () => {
  alert('DOCX export functionality coming soon')
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

// Load the default template on component mount
onMounted(() => {
  // Load the default DOCX template
  loadDocxTemplate(defaultTemplate)
  
  // Click outside to close menus
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

/* Menubar Styles */
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

/* Toolbar Styles */
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
  .loading-overlay {
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
</style>