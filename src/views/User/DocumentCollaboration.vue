<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Header Section -->
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white/90">Document Collaboration</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Share, comment, and collaborate on documents with your team
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
          Upload Document
        </button>
        
        <button 
          @click="showShareModal = true"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
          </svg>
          Quick Share
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-800">
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

    <!-- Main Grid: Documents List + Comments Panel -->
    <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)]">
      <!-- Documents List (Left Panel) - Narrower -->
      <div class="lg:w-72 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col">
        <!-- Search and Filter -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              v-model="documentSearch"
              type="text"
              placeholder="Search documents..."
              class="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          
          <!-- Filter Chips -->
          <div class="flex gap-2 mt-3">
            <button 
              v-for="filter in documentFilters" 
              :key="filter.id"
              @click="activeFilter = filter.id"
              :class="[
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                activeFilter === filter.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              ]"
            >
              {{ filter.name }}
            </button>
          </div>
        </div>

        <!-- Documents List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="filteredDocuments.length === 0" class="p-8 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="mt-2 text-gray-500 dark:text-gray-400">No documents found</p>
          </div>

          <div 
            v-for="doc in filteredDocuments" 
            :key="doc.id"
            @click="selectDocument(doc)"
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
            :class="{ 'bg-gray-50 dark:bg-gray-800': selectedDocument?.id === doc.id }"
          >
            <div class="flex items-start gap-3">
              <!-- Document Icon -->
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br" :class="getDocumentIconBg(doc.type)">
                <div class="w-full h-full flex items-center justify-center text-white text-lg">
                  {{ getDocumentIcon(doc.type) }}
                </div>
              </div>

              <!-- Document Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-800 dark:text-white/90 truncate">{{ doc.name }}</h4>
                  <span class="text-xs text-gray-400">{{ doc.size }}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Uploaded by {{ doc.uploadedBy }} • {{ formatDate(doc.uploadedAt) }}
                </p>
                
                <!-- Sharing Status -->
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex -space-x-2">
                    <div 
                      v-for="(share, idx) in doc.sharedWith.slice(0, 3)" 
                      :key="idx"
                      class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-medium"
                      :title="share.name"
                    >
                      {{ getInitials(share.name) }}
                    </div>
                    <div v-if="doc.sharedWith.length > 3" class="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                      +{{ doc.sharedWith.length - 3 }}
                    </div>
                  </div>
                  <span v-if="doc.commentCount > 0" class="flex items-center gap-1 text-xs text-gray-500">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    {{ doc.commentCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments Panel - Takes most of the space -->
      <div v-if="selectedDocument" class="flex-1 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col">
        <!-- Document Header - Compact -->
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br" :class="getDocumentIconBg(selectedDocument.type)">
              <div class="w-full h-full flex items-center justify-center text-white text-base">
                {{ getDocumentIcon(selectedDocument.type) }}
              </div>
            </div>
            <div>
              <h3 class="font-medium text-gray-800 dark:text-white/90">{{ selectedDocument.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedDocument.size }} • Uploaded {{ formatDate(selectedDocument.uploadedAt) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button 
              @click="openShareWithDocument(selectedDocument)"
              class="p-2 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-200 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-700"
              title="Share"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
            </button>
            
            <button 
              @click="downloadDocument(selectedDocument)"
              class="p-2 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-200 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-gray-700"
              title="Download"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Comments Section - Takes full remaining space -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Comments Header - Minimal -->
          <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-800">
            <h4 class="font-medium text-gray-800 dark:text-white/90">Comments <span class="text-sm text-gray-500 ml-2">({{ selectedDocument.comments?.length || 0 }})</span></h4>
          </div>

          <!-- Comments List - Takes most of the space -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div v-if="selectedDocument.comments?.length > 0" class="space-y-6">
              <div v-for="comment in selectedDocument.comments" :key="comment.id" class="space-y-3">
                <!-- Main Comment -->
                <div class="flex gap-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {{ getInitials(comment.author) }}
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-gray-800 dark:text-white/90">{{ comment.author }}</span>
                      <span class="text-xs text-gray-400">{{ formatTimeAgo(comment.timestamp) }}</span>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{{ comment.content }}</p>
                    
                    <!-- Reply Button -->
                    <button 
                      @click="replyToComment(comment)"
                      class="text-xs text-gray-500 hover:text-brand-500 flex items-center gap-1"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6"></path>
                      </svg>
                      Reply
                    </button>

                    <!-- Replies -->
                    <div v-if="comment.replies?.length" class="mt-3 ml-8 space-y-3">
                      <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-2">
                        <div class="flex-shrink-0">
                          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-xs font-medium">
                            {{ getInitials(reply.author) }}
                          </div>
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-0.5">
                            <span class="font-medium text-gray-800 dark:text-white/90 text-xs">{{ reply.author }}</span>
                            <span class="text-xs text-gray-400">{{ formatTimeAgo(reply.timestamp) }}</span>
                          </div>
                          <p class="text-sm text-gray-600 dark:text-gray-400">{{ reply.content }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State - Centered in available space -->
            <div v-else class="h-full flex flex-col items-center justify-center py-12">
              <svg class="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <h5 class="text-lg font-medium text-gray-800 dark:text-white/90 mb-1">No comments yet</h5>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                Be the first to share your thoughts on this document
              </p>
            </div>
          </div>

          <!-- Add Comment Input - Compact but functional -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-medium">
                  {{ getInitials('Current User') }}
                </div>
              </div>
              <div class="flex-1">
                <textarea
                  v-model="newComment"
                  rows="2"
                  placeholder="Add a comment... (Use @ to mention someone)"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                  @keydown.enter.prevent="handleCommentKeydown"
                ></textarea>
                <div class="flex items-center justify-between mt-2">
                  <div class="text-xs text-gray-400">
                    <span>Enter to post • Shift+Enter new line</span>
                    <span v-if="newComment.includes('@')" class="ml-3 text-brand-500">
                      <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Mention
                    </span>
                  </div>
                  <button 
                    @click="addComment"
                    :disabled="!newComment.trim()"
                    class="px-4 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Document Selected State -->
      <div v-else class="flex-1 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h4 class="text-lg font-medium text-gray-900 dark:text-white/90 mb-1">No document selected</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">Choose a document from the list to view comments</p>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h3>Upload Document</h3>
            <button @click="showUploadModal = false" class="close-btn">✕</button>
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
                @change="handleFileUpload"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.jpg,.jpeg,.png"
                class="hidden"
              >
              <button 
                @click="$refs.fileInput.click()"
                class="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Choose File
              </button>
              <p class="mt-4 text-xs text-gray-400">Supported formats: PDF, DOCX, XLSX, PPTX, Images</p>
            </div>

            <div class="mt-4">
              <div class="form-group">
                <label>Share with (optional)</label>
                <div class="flex items-center gap-2">
                  <input 
                    type="text" 
                    v-model="uploadShareWith"
                    placeholder="Enter names or email addresses"
                    class="form-input flex-1"
                  >
                  <select v-model="uploadPermission" class="form-select w-32">
                    <option value="view">Can view</option>
                    <option value="comment">Can comment</option>
                    <option value="edit">Can edit</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showUploadModal = false" class="cancel-btn">Cancel</button>
            <button 
              @click="uploadDocument"
              :disabled="!selectedFile"
              class="send-btn"
            >
              Upload
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
      <div v-if="showShareModal" class="modal-overlay" @click.self="closeShareModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Share Document</h3>
            <button @click="closeShareModal" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="mb-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <p class="font-medium text-gray-900 dark:text-white/90">{{ shareDocument?.name || 'Select a document' }}</p>
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
                <option value="comment">Can comment</option>
                <option value="edit">Can edit</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="notifyUsers">
                <span>Notify users via email</span>
              </label>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeShareModal" class="cancel-btn">Cancel</button>
            <button @click="handleShareDocument" class="send-btn">Share</button>
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

const currentPageTitle = ref('Document Collaboration')
const activeTab = ref('all')
const documentSearch = ref('')
const activeFilter = ref('all')
const selectedDocument = ref(null)
const showUploadModal = ref(false)
const showShareModal = ref(false)
const shareDocument = ref(null)
const selectedFile = ref(null)
const uploadShareWith = ref('')
const uploadPermission = ref('view')
const newComment = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Share state
const shareWith = ref({
  all: false,
  department: false,
  users: false
})
const selectedDepartment = ref('')
const selectedUsers = ref([])
const sharePermission = ref('view')
const notifyUsers = ref(true)

// Tabs
const tabs = [
  { id: 'all', name: 'All Documents', count: 12 },
  { id: 'shared', name: 'Shared with Me', count: 5 },
  { id: 'recent', name: 'Recent', count: 8 },
  { id: 'favorites', name: 'Favorites', count: 3 }
]

// Document filters
const documentFilters = [
  { id: 'all', name: 'All' },
  { id: 'pdf', name: 'PDF' },
  { id: 'doc', name: 'Documents' },
  { id: 'sheet', name: 'Spreadsheets' },
  { id: 'image', name: 'Images' }
]

// Mock users for sharing
const users = ref([
  { id: 1, name: 'John Smith', department: 'IT' },
  { id: 2, name: 'Sarah Johnson', department: 'HR' },
  { id: 3, name: 'Michael Chen', department: 'Finance' },
  { id: 4, name: 'Amara Okafor', department: 'Operations' },
  { id: 5, name: 'David Okonkwo', department: 'Legal' },
  { id: 6, name: 'Blessing Eze', department: 'IT' },
  { id: 7, name: 'James Wilson', department: 'Finance' }
])

// Mock documents data
const documents = ref([
  {
    id: 1,
    name: 'Q4 Financial Report 2024.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedBy: 'John Smith',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    previewUrl: '/sample.pdf',
    sharedWith: [
      { id: 2, name: 'Sarah Johnson' },
      { id: 3, name: 'Michael Chen' }
    ],
    commentCount: 5,
    comments: [
      {
        id: 101,
        author: 'Sarah Johnson',
        content: 'The Q4 numbers look good. Can we discuss the marketing expenses?',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        replies: [
          {
            id: 1011,
            author: 'John Smith',
            content: 'Sure, I\'ve scheduled a meeting for tomorrow at 2 PM.',
            timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 102,
        author: 'Michael Chen',
        content: 'Please include the breakdown for Q1 projections.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        replies: []
      }
    ]
  },
  {
    id: 2,
    name: 'HR Policy Handbook 2025.docx',
    type: 'doc',
    size: '1.8 MB',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    sharedWith: [
      { id: 1, name: 'John Smith' },
      { id: 4, name: 'Amara Okafor' }
    ],
    commentCount: 3,
    comments: [
      {
        id: 201,
        author: 'John Smith',
        content: 'The new leave policy section needs review.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        replies: []
      }
    ]
  },
  {
    id: 3,
    name: 'IT Infrastructure Proposal.pptx',
    type: 'ppt',
    size: '5.2 MB',
    uploadedBy: 'Michael Chen',
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    sharedWith: [
      { id: 1, name: 'John Smith' },
      { id: 5, name: 'David Okonkwo' },
      { id: 6, name: 'Blessing Eze' }
    ],
    commentCount: 2,
    comments: []
  },
  {
    id: 4,
    name: 'Q3 Budget Spreadsheet.xlsx',
    type: 'sheet',
    size: '892 KB',
    uploadedBy: 'Amara Okafor',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    sharedWith: [
      { id: 2, name: 'Sarah Johnson' },
      { id: 3, name: 'Michael Chen' }
    ],
    commentCount: 4,
    comments: []
  },
  {
    id: 5,
    name: 'Office Layout Blueprint.png',
    type: 'image',
    size: '3.1 MB',
    uploadedBy: 'David Okonkwo',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    sharedWith: [
      { id: 1, name: 'John Smith' },
      { id: 4, name: 'Amara Okafor' }
    ],
    commentCount: 1,
    comments: []
  },
  {
    id: 6,
    name: 'Contract Agreement - Vendor.pdf',
    type: 'pdf',
    size: '1.2 MB',
    uploadedBy: 'Blessing Eze',
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    sharedWith: [
      { id: 1, name: 'John Smith' },
      { id: 3, name: 'Michael Chen' },
      { id: 5, name: 'David Okonkwo' }
    ],
    commentCount: 7,
    comments: []
  }
])

// Computed
const filteredDocuments = computed(() => {
  let filtered = documents.value

  // Apply search
  if (documentSearch.value) {
    const query = documentSearch.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.name.toLowerCase().includes(query) ||
      doc.uploadedBy.toLowerCase().includes(query)
    )
  }

  // Apply type filter
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(doc => doc.type === activeFilter.value)
  }

  // Apply tab filter
  if (activeTab.value === 'shared') {
    // Show documents shared with current user (mock: current user ID = 1)
    filtered = filtered.filter(doc => 
      doc.sharedWith.some(user => user.id === 1)
    )
  } else if (activeTab.value === 'recent') {
    filtered = filtered.sort((a, b) => 
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
    ).slice(0, 5)
  }

  return filtered
})

// Methods
const getDocumentIcon = (type) => {
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    sheet: '📊',
    xlsx: '📊',
    ppt: '📽️',
    pptx: '📽️',
    image: '🖼️',
    default: '📁'
  }
  return icons[type] || icons.default
}

const getDocumentIconBg = (type) => {
  const bgClasses = {
    pdf: 'from-red-500 to-red-600',
    doc: 'from-blue-500 to-blue-600',
    docx: 'from-blue-500 to-blue-600',
    sheet: 'from-green-500 to-green-600',
    xlsx: 'from-green-500 to-green-600',
    ppt: 'from-orange-500 to-orange-600',
    pptx: 'from-orange-500 to-orange-600',
    image: 'from-purple-500 to-purple-600'
  }
  return bgClasses[type] || 'from-gray-500 to-gray-600'
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return formatDate(date)
}

const selectDocument = (doc) => {
  selectedDocument.value = doc
}

const openShareWithDocument = (doc) => {
  shareDocument.value = doc
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
  shareDocument.value = null
  shareWith.value = { all: false, department: false, users: false }
  selectedDepartment.value = ''
  selectedUsers.value = []
  sharePermission.value = 'view'
  notifyUsers.value = true
}

const handleShareDocument = () => {
  console.log('Sharing document:', shareDocument.value?.id, shareWith.value, selectedDepartment.value, selectedUsers.value, sharePermission.value)
  showShareModal.value = false
  showToastMessage('Document shared successfully', 'success')
  closeShareModal()
}

const downloadDocument = (doc) => {
  console.log('Downloading document:', doc.name)
  
  // In a real app, this would trigger a file download from your server
  // For demo, we'll create a mock download
  const link = document.createElement('a')
  link.href = doc.previewUrl || '#'
  link.download = doc.name
  link.click()
  
  showToastMessage(`Downloading ${doc.name}`, 'success')
}

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0]
}

const uploadDocument = () => {
  if (!selectedFile.value) return
  
  console.log('Uploading file:', selectedFile.value.name)
  // In real app: upload to server
  
  showUploadModal.value = false
  showToastMessage('Document uploaded successfully', 'success')
  selectedFile.value = null
  uploadShareWith.value = ''
  uploadPermission.value = 'view'
}

const addComment = () => {
  if (!newComment.value.trim() || !selectedDocument.value) return
  
  // Check for mentions (@username)
  const mentions = newComment.value.match(/@(\w+)/g) || []
  
  const comment = {
    id: Date.now(),
    author: 'Current User',
    content: newComment.value,
    timestamp: new Date(),
    replies: []
  }
  
  if (!selectedDocument.value.comments) {
    selectedDocument.value.comments = []
  }
  
  selectedDocument.value.comments.push(comment)
  selectedDocument.value.commentCount = (selectedDocument.value.commentCount || 0) + 1
  
  // Notify mentioned users
  if (mentions.length > 0) {
    console.log('Notifying mentioned users:', mentions)
    showToastMessage(`Mentioned ${mentions.length} user(s)`, 'info')
  }
  
  newComment.value = ''
}

const replyToComment = (comment) => {
  const replyText = prompt('Enter your reply:')
  if (!replyText) return
  
  const reply = {
    id: Date.now(),
    author: 'Current User',
    content: replyText,
    timestamp: new Date()
  }
  
  if (!comment.replies) {
    comment.replies = []
  }
  
  comment.replies.push(reply)
  showToastMessage('Reply added', 'success')
}

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
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

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .flex-col.lg\:flex-row {
    flex-direction: column;
    height: auto;
  }
  
  .lg\:w-96 {
    width: 100%;
  }
  
  .w-80 {
    width: 100%;
  }
}
</style>