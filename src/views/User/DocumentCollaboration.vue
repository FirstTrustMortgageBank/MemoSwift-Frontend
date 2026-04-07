<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <!-- Header -->
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </button>
        <button
          @click="openQuickShare"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
          @click="switchTab(tab.id)"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.id
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          ]"
        >
          {{ tab.name }}
          <span v-if="tab.count !== undefined" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Main Grid -->
    <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-280px)]">

      <!-- Documents List -->
      <div class="lg:w-72 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col">
        <!-- Search + Filter -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="documentSearch"
              type="text"
              placeholder="Search documents..."
              class="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              @input="debouncedSearch"
            />
          </div>
          <div class="flex gap-2 mt-3 flex-wrap">
            <button
              v-for="filter in documentFilters"
              :key="filter.id"
              @click="switchFilter(filter.id)"
              :class="[
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                activeFilter === filter.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
            >
              {{ filter.name }}
            </button>
          </div>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading -->
          <div v-if="api.loading.value && documents.length === 0" class="p-6 space-y-3">
            <div v-for="i in 4" :key="i" class="animate-pulse flex gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div class="flex-1 space-y-2 py-1">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="!api.loading.value && documents.length === 0" class="p-8 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-2 text-gray-500 dark:text-gray-400">No documents found</p>
          </div>

          <!-- Items -->
          <div
            v-for="doc in documents"
            :key="doc.id"
            @click="selectDocument(doc)"
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
            :class="{ 'bg-brand-50 dark:bg-brand-900/20': selectedDocument?.id === doc.id }"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-lg" :class="getDocumentIconBg(doc.type)">
                {{ getDocumentIcon(doc.type) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-800 dark:text-white/90 truncate text-sm">{{ doc.name }}</h4>
                  <span class="text-xs text-gray-400 ml-1 flex-shrink-0">{{ doc.size }}</span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {{ doc.uploadedBy }} · {{ formatDate(doc.uploadedAt) }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex -space-x-1.5">
                    <!-- In your template, you can also use optional chaining -->
                    <div
                      v-for="(share, idx) in (doc.sharedWith ?? []).slice(0, 3)"
                      :key="idx"
                      class="w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-[9px] font-medium"
                      :title="share.name"
                    >
                      {{ getInitials(share.name) }}
                    </div>
                    <div v-if="(doc.sharedWith ?? []).length > 3" class="w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] text-gray-600">
                      +{{ (doc.sharedWith ?? []).length - 3 }}
                    </div>
                  </div>
                  <span v-if="doc.commentCount > 0" class="flex items-center gap-1 text-xs text-gray-500">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {{ doc.commentCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments Panel -->
      <div v-if="selectedDocument" class="flex-1 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col">
        <!-- Document header -->
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm flex-shrink-0" :class="getDocumentIconBg(selectedDocument.type)">
              {{ getDocumentIcon(selectedDocument.type) }}
            </div>
            <div class="min-w-0">
              <h3 class="font-medium text-gray-800 dark:text-white/90 truncate">{{ selectedDocument.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedDocument.size }} · Uploaded {{ formatDate(selectedDocument.uploadedAt) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button @click="openShareWithDocument(selectedDocument)" class="p-2 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Share">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button @click="downloadDocument(selectedDocument)" class="p-2 text-gray-500 hover:text-brand-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Download">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Comments -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h4 class="font-medium text-gray-800 dark:text-white/90">
              Comments
              <span class="text-sm text-gray-500 ml-2">({{ activeComments.length }})</span>
            </h4>
            <div v-if="commentsLoading" class="flex items-center gap-1.5 text-xs text-gray-400">
              <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading
            </div>
          </div>

          <div ref="commentsListEl" class="flex-1 overflow-y-auto px-6 py-4">
            <!-- Comments list -->
            <div v-if="activeComments.length > 0" class="space-y-6">
              <div v-for="comment in activeComments" :key="comment.id" class="space-y-3">
                <div class="flex gap-3">
                  <div class="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {{ getInitials(comment.author) }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ comment.author }}</span>
                      <span class="text-xs text-gray-400">{{ formatTimeAgo(comment.timestamp) }}</span>
                    </div>
                    <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ comment.content }}</p>
                    <button
                      @click="startReply(comment)"
                      class="mt-1.5 text-xs text-gray-400 hover:text-brand-500 flex items-center gap-1 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6" />
                      </svg>
                      Reply
                    </button>

                    <!-- Replies -->
                    <div v-if="comment.replies?.length" class="mt-3 ml-6 space-y-3 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                      <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-2">
                        <div class="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-medium">
                          {{ getInitials(reply.author) }}
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-0.5">
                            <span class="font-medium text-gray-800 dark:text-white/90 text-xs">{{ reply.author }}</span>
                            <span class="text-xs text-gray-400">{{ formatTimeAgo(reply.timestamp) }}</span>
                          </div>
                          <p class="text-xs text-gray-600 dark:text-gray-400">{{ reply.content }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Inline reply input -->
                    <div v-if="replyingTo?.id === comment.id" class="mt-3 ml-6">
                      <div class="flex gap-2">
                        <textarea
                          v-model="replyContent"
                          ref="replyInputEl"
                          rows="2"
                          :placeholder="`Replying to ${comment.author}...`"
                          class="flex-1 px-3 py-2 text-xs border border-brand-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                          @keydown.enter.exact.prevent="submitReply(comment)"
                          @keydown.escape="cancelReply"
                        />
                      </div>
                      <div class="flex items-center gap-2 mt-1.5">
                        <button @click="submitReply(comment)" :disabled="!replyContent.trim() || submittingReply" class="px-3 py-1 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 text-xs font-medium">
                          {{ submittingReply ? 'Posting…' : 'Post Reply' }}
                        </button>
                        <button @click="cancelReply" class="px-3 py-1 text-gray-500 text-xs hover:text-gray-700">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else-if="!commentsLoading" class="h-full flex flex-col items-center justify-center py-12">
              <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h5 class="text-base font-medium text-gray-800 dark:text-white/90 mb-1">No comments yet</h5>
              <p class="text-sm text-gray-500 text-center">Be the first to share your thoughts</p>
            </div>
          </div>

          <!-- Add Comment -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div class="flex gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-medium">
                CU
              </div>
              <div class="flex-1">
                <textarea
                  v-model="newComment"
                  rows="2"
                  placeholder="Add a comment… (@ to mention)"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                  @keydown.enter.exact.prevent="submitComment"
                />
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-gray-400">Enter to post · Shift+Enter for new line</span>
                  <button
                    @click="submitComment"
                    :disabled="!newComment.trim() || submittingComment"
                    class="px-4 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {{ submittingComment ? 'Posting…' : 'Post' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No document selected -->
      <div v-else class="flex-1 bg-white border border-gray-200 rounded-2xl dark:bg-gray-900 dark:border-gray-800 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 class="text-lg font-medium text-gray-900 dark:text-white/90 mb-1">No document selected</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">Choose a document from the list to view comments</p>
        </div>
      </div>
    </div>

    <!-- ── Upload Modal ─────────────────────────────────────────────── -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h3>Upload Document</h3>
            <button @click="closeUploadModal" class="close-btn">✕</button>
          </div>
          <div class="modal-body">
            <!-- Drop zone -->
            <div
              class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
              :class="isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-700'"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p v-if="selectedFile" class="font-medium text-gray-800 dark:text-white/90">{{ selectedFile.name }}</p>
              <template v-else>
                <p class="text-gray-700 dark:text-gray-300 mb-1">Drag and drop your file here</p>
                <p class="text-sm text-gray-500 mb-4">or click to browse</p>
              </template>
              <input type="file" ref="fileInputEl" @change="handleFileSelect" accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.jpg,.jpeg,.png,.webp" class="hidden" />
              <button @click="fileInputEl?.click()" class="mt-3 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">
                {{ selectedFile ? 'Change File' : 'Choose File' }}
              </button>
              <p class="mt-3 text-xs text-gray-400">PDF, DOCX, XLSX, PPTX, Images · Max {{ maxFileSizeMB }}MB</p>
            </div>

            <!-- Upload progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading…</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-brand-500 rounded-full transition-all" :style="{ width: uploadProgress + '%' }" />
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display name (optional)</label>
              <input v-model="uploadName" type="text" placeholder="Leave blank to use filename" class="form-input" />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeUploadModal" class="cancel-btn">Cancel</button>
            <button @click="handleUpload" :disabled="!selectedFile || uploading" class="send-btn">
              {{ uploading ? 'Uploading…' : 'Upload' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Share Modal ─────────────────────────────────────────────── -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showShareModal" class="modal-overlay" @click.self="closeShareModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Share Document</h3>
            <button @click="closeShareModal" class="close-btn">✕</button>
          </div>
          <div class="modal-body">
            <div class="mb-4 p-3 bg-gray-50 rounded-lg dark:bg-gray-800 flex items-center gap-2">
              <span class="text-lg">{{ getDocumentIcon(shareTargetDoc?.type ?? '') }}</span>
              <p class="font-medium text-gray-900 dark:text-white/90 truncate">{{ shareTargetDoc?.name || 'Select a document first' }}</p>
            </div>

            <div class="form-group">
              <label>Share with</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" v-model="shareForm.all" class="rounded" />
                  Everyone in organisation
                </label>
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" v-model="shareForm.department" class="rounded" />
                  Specific department
                </label>
                <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input type="checkbox" v-model="shareForm.users" class="rounded" />
                  Specific users
                </label>
              </div>
            </div>

            <div v-if="shareForm.department" class="form-group">
              <label>Department</label>
              <select v-model="shareForm.departmentId" class="form-select">
                <option value="">— select —</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
              </select>
            </div>

            <div v-if="shareForm.users" class="form-group">
              <label>Users</label>
              <div class="space-y-1.5 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                <label v-for="user in users" :key="user.id" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
                  <input type="checkbox" :value="user.id" v-model="shareForm.selectedUserIds" class="rounded" />
                  <span>{{ user.name }}</span>
                  <span class="text-xs text-gray-400">{{ user.department }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Permission</label>
              <select v-model="shareForm.permission" class="form-select">
                <option value="view">Can view</option>
                <option value="comment">Can comment</option>
                <option value="edit">Can edit</option>
              </select>
            </div>

            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" v-model="shareForm.notify" class="rounded" />
              Notify recipients via email
            </label>
          </div>
          <div class="modal-footer">
            <button @click="closeShareModal" class="cancel-btn">Cancel</button>
            <button @click="handleShare" :disabled="sharing || !shareTargetDoc" class="send-btn">
              {{ sharing ? 'Sharing…' : 'Share' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-x-full opacity-0" enter-to-class="translate-x-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-x-0 opacity-100" leave-to-class="translate-x-full opacity-0">
      <div v-if="toast.show" class="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-[1100] border-l-4"
        :class="{
          'border-green-500': toast.type === 'success',
          'border-red-500': toast.type === 'error',
          'border-blue-500': toast.type === 'info',
        }"
      >
        <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ toast.message }}</span>
      </div>
    </Transition>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { useCollaborationApi, type ApiDocument, type ApiComment } from '@/composables/useCollaborationApi'

// ── API ────────────────────────────────────────────────────────────────────
const api = useCollaborationApi()

// ── State ─────────────────────────────────────────────────────────────────
const currentPageTitle = ref('Document Collaboration')
const activeTab = ref('all')
const activeFilter = ref('all')
const documentSearch = ref('')
const documents = ref<ApiDocument[]>([])
const selectedDocument = ref<ApiDocument | null>(null)
const activeComments = ref<ApiComment[]>([])
const commentsLoading = ref(false)

// Comment form
const newComment = ref('')
const submittingComment = ref(false)
const replyingTo = ref<ApiComment | null>(null)
const replyContent = ref('')
const submittingReply = ref(false)

// Upload modal
const showUploadModal = ref(false)
const selectedFile = ref<File | null>(null)
const uploadName = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)
const maxFileSizeMB = 50

// Share modal
const showShareModal = ref(false)
const shareTargetDoc = ref<ApiDocument | null>(null)
const sharing = ref(false)
const shareForm = ref({
  all: false,
  department: false,
  users: false,
  departmentId: '',
  selectedUserIds: [] as string[],
  permission: 'view' as 'view' | 'comment' | 'edit',
  notify: true,
})

// Toast
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' })

// Template refs
const fileInputEl = ref<HTMLInputElement | null>(null)
const commentsListEl = ref<HTMLElement | null>(null)
const replyInputEl = ref<HTMLTextAreaElement | null>(null)

// Static data
const tabs = [
  { id: 'all', name: 'All Documents', count: 24 },
  { id: 'shared', name: 'Shared with Me', count: 5 },
  { id: 'recent', name: 'Recent', count: 10 },
]

const documentFilters = [
  { id: 'all', name: 'All' },
  { id: 'pdf', name: 'PDF' },
  { id: 'doc', name: 'Docs' },
  { id: 'sheet', name: 'Sheets' },
  { id: 'image', name: 'Images' },
]

const departments = [
  { id: 'it', name: 'IT Department' },
  { id: 'hr', name: 'HR Department' },
  { id: 'finance', name: 'Finance Department' },
  { id: 'operations', name: 'Operations' },
  { id: 'legal', name: 'Legal' },
]

const users = ref([
  { id: '1', name: 'John Smith', department: 'IT' },
  { id: '2', name: 'Sarah Johnson', department: 'HR' },
  { id: '3', name: 'Michael Chen', department: 'Finance' },
  { id: '4', name: 'Amara Okafor', department: 'Operations' },
  { id: '5', name: 'David Okonkwo', department: 'Legal' },
  { id: '6', name: 'Blessing Eze', department: 'IT' },
])

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => loadDocuments())

// ── Data loading ───────────────────────────────────────────────────────────

// FIX: normalise every document so sharedWith and commentCount are always
//      defined arrays/numbers — prevents "Cannot read properties of undefined
//      (reading 'slice')" regardless of what the API returns.
function normaliseDoc(doc: any): ApiDocument {
  return {
    ...doc,
    sharedWith: Array.isArray(doc.sharedWith) ? doc.sharedWith : [],
    commentCount: doc.commentCount ?? 0,
  }
}

async function loadDocuments() {
  const res = await api.fetchDocuments({
    search: documentSearch.value || undefined,
    type: activeFilter.value !== 'all' ? activeFilter.value : undefined,
    tab: activeTab.value !== 'all' ? activeTab.value : undefined,
  })

  console.log('🔍 API Response:', res)

  // Helper function to find array in response
  function findDocumentsArray(obj: any): any[] {
    if (!obj) return []
    if (Array.isArray(obj)) return obj
    if (typeof obj === 'object') {
      // Check common property names
      if (obj.data && Array.isArray(obj.data)) return obj.data
      if (obj.documents && Array.isArray(obj.documents)) return obj.documents
      if (obj.items && Array.isArray(obj.items)) return obj.items
      
      // Recursively search through object properties
      for (const key in obj) {
        const found = findDocumentsArray(obj[key])
        if (found.length > 0) return found
      }
    }
    return []
  }

  const docs = findDocumentsArray(res)
  documents.value = docs.map(normaliseDoc)
  console.log('✅ Documents loaded:', documents.value.length)
}

async function loadComments(docId: string) {
  commentsLoading.value = true
  const res = await api.fetchComments(docId) as any

  if (Array.isArray(res)) {
    activeComments.value = res
  } else if (Array.isArray(res?.data?.data)) {
    activeComments.value = res.data.data
  } else if (Array.isArray(res?.data)) {
    activeComments.value = res.data
  } else {
    activeComments.value = []
    console.warn('Unexpected comments response structure:', res)
  }

  commentsLoading.value = false
}

// ── Navigation ─────────────────────────────────────────────────────────────
async function switchTab(tabId: string) {
  activeTab.value = tabId
  await loadDocuments()
}

async function switchFilter(filterId: string) {
  activeFilter.value = filterId
  await loadDocuments()
}

// ── Debounced search ───────────────────────────────────────────────────────
let searchTimer: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadDocuments(), 350)
}

// ── Select document ────────────────────────────────────────────────────────
async function selectDocument(doc: ApiDocument) {
  selectedDocument.value = doc
  replyingTo.value = null
  replyContent.value = ''
  newComment.value = ''
  await loadComments(doc.id)
  await nextTick()
  scrollCommentsToBottom()
}

function scrollCommentsToBottom() {
  if (commentsListEl.value) {
    commentsListEl.value.scrollTop = commentsListEl.value.scrollHeight
  }
}

// ── Comments ───────────────────────────────────────────────────────────────
async function submitComment() {
  if (!newComment.value.trim() || !selectedDocument.value || submittingComment.value) return

  const mentions = extractMentions(newComment.value)
  submittingComment.value = true

  const res = await api.postComment(selectedDocument.value.id, newComment.value, undefined, mentions)
  
  if (res && res.data) {
    // ✅ Ensure activeComments.value is an array before pushing
    if (!Array.isArray(activeComments.value)) {
      console.warn('activeComments was not an array, resetting to empty array')
      activeComments.value = []
    }
    
    activeComments.value.push(res.data)
    
    // Update count on list item
    const listDoc = documents.value.find(d => d.id === selectedDocument.value!.id)
    if (listDoc) listDoc.commentCount = (listDoc.commentCount || 0) + 1
    
    newComment.value = ''
    showToast('Comment posted', 'success')
    await nextTick()
    scrollCommentsToBottom()
  } else {
    showToast(api.error.value || 'Failed to post comment', 'error')
  }

  submittingComment.value = false
}

function startReply(comment: ApiComment) {
  replyingTo.value = comment
  replyContent.value = ''
  nextTick(() => replyInputEl.value?.focus())
}

function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

async function submitReply(parent: ApiComment) {
  if (!replyContent.value.trim() || !selectedDocument.value || submittingReply.value) return

  submittingReply.value = true
  const res = await api.postComment(selectedDocument.value.id, replyContent.value, parent.id)

  if (res) {
    const idx = activeComments.value.findIndex(c => c.id === parent.id)
    if (idx !== -1) {
      activeComments.value[idx].replies = [
        ...(activeComments.value[idx].replies || []),
        { id: res.data.id, author: res.data.author, authorId: res.data.authorId, content: res.data.content, timestamp: res.data.timestamp },
      ]
    }
    cancelReply()
    showToast('Reply posted', 'success')
  } else {
    showToast(api.error.value || 'Failed to post reply', 'error')
  }

  submittingReply.value = false
}

function extractMentions(text: string): string[] {
  return (text.match(/@(\w+)/g) || []).map(m => m.slice(1))
}

// ── Upload ─────────────────────────────────────────────────────────────────
function handleFileSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) selectedFile.value = f
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const f = e.dataTransfer?.files[0]
  if (f) selectedFile.value = f
}

async function handleUpload() {
  if (!selectedFile.value || uploading.value) return
  uploading.value = true
  uploadProgress.value = 10

  const progressTimer = setInterval(() => {
    if (uploadProgress.value < 85) uploadProgress.value += 10
  }, 200)

  const res = await api.uploadDocument(selectedFile.value, uploadName.value || undefined)

  clearInterval(progressTimer)
  uploadProgress.value = 100

  if (res) {
    // FIX: normalise the newly uploaded doc before prepending it to the list
    documents.value.unshift(normaliseDoc(res.data))
    showToast(`"${res.data.name}" uploaded successfully`, 'success')
    closeUploadModal()
  } else {
    showToast(api.error.value || 'Upload failed', 'error')
  }

  uploading.value = false
  uploadProgress.value = 0
}

function closeUploadModal() {
  showUploadModal.value = false
  selectedFile.value = null
  uploadName.value = ''
  uploadProgress.value = 0
  isDragging.value = false
}

// ── Share ──────────────────────────────────────────────────────────────────
function openShareWithDocument(doc: ApiDocument) {
  shareTargetDoc.value = doc
  showShareModal.value = true
}

function openQuickShare() {
  shareTargetDoc.value = selectedDocument.value
  showShareModal.value = true
}

function closeShareModal() {
  showShareModal.value = false
  shareTargetDoc.value = null
  shareForm.value = { all: false, department: false, users: false, departmentId: '', selectedUserIds: [], permission: 'view', notify: true }
}

async function handleShare() {
  if (!shareTargetDoc.value || sharing.value) return
  sharing.value = true

  const docId = shareTargetDoc.value.id
  const shares: Parameters<typeof api.bulkShareDocument>[1] = []

  if (shareForm.value.all) {
    shares.push({ shareType: 'organization', permission: shareForm.value.permission, notifyTarget: shareForm.value.notify })
  }
  if (shareForm.value.department && shareForm.value.departmentId) {
    const dept = departments.find(d => d.id === shareForm.value.departmentId)
    shares.push({ shareType: 'department', targetId: shareForm.value.departmentId, targetName: dept?.name, permission: shareForm.value.permission, notifyTarget: shareForm.value.notify })
  }
  if (shareForm.value.users) {
    for (const userId of shareForm.value.selectedUserIds) {
      const u = users.value.find(u => u.id === userId)
      shares.push({ shareType: 'user', targetId: userId, targetName: u?.name, permission: shareForm.value.permission, notifyTarget: shareForm.value.notify })
    }
  }

  if (shares.length === 0) {
    showToast('Please select at least one recipient', 'error')
    sharing.value = false
    return
  }

  const res = await api.bulkShareDocument(docId, shares)
  if (res) {
    showToast(`Document shared with ${res.count} recipient(s)`, 'success')
    await loadDocuments()
    closeShareModal()
  } else {
    showToast(api.error.value || 'Share failed', 'error')
  }

  sharing.value = false
}

// ── Download ───────────────────────────────────────────────────────────────
function downloadDocument(doc: ApiDocument) {
  const url = api.getDownloadUrl(doc)
  const a = document.createElement('a')
  a.href = url
  a.download = doc.name
  a.target = '_blank'
  a.click()
  showToast(`Downloading "${doc.name}"`, 'info')
}

// ── Toast ──────────────────────────────────────────────────────────────────
let toastTimer: ReturnType<typeof setTimeout>
function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3500)
}

// ── Formatters ─────────────────────────────────────────────────────────────
function getDocumentIcon(type: string) {
  const map: Record<string, string> = { pdf: '📄', doc: '📝', docx: '📝', sheet: '📊', xlsx: '📊', ppt: '📽️', pptx: '📽️', image: '🖼️' }
  return map[type] ?? '📁'
}

function getDocumentIconBg(type: string) {
  const map: Record<string, string> = {
    pdf: 'from-red-500 to-red-600', doc: 'from-blue-500 to-blue-600', docx: 'from-blue-500 to-blue-600',
    sheet: 'from-green-500 to-green-600', xlsx: 'from-green-500 to-green-600',
    ppt: 'from-orange-500 to-orange-600', pptx: 'from-orange-500 to-orange-600',
    image: 'from-purple-500 to-purple-600',
  }
  return map[type] ?? 'from-gray-500 to-gray-600'
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--color-white, #fff);
  border-radius: 1rem;
  width: 500px;
  max-width: 92vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.25);
}
.dark .modal-content { background: #111827; border: 1px solid #1f2937; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.dark .modal-header { border-color: #1f2937; }
.modal-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; color: #111827; }
.dark .modal-header h3 { color: rgba(255,255,255,0.9); }
.close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #6b7280; padding: 0.25rem 0.5rem; border-radius: 0.375rem; }
.close-btn:hover { background: #f3f4f6; color: #374151; }
.dark .close-btn:hover { background: #1f2937; color: #d1d5db; }
.modal-body { padding: 1.5rem; }
.modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 0.75rem; }
.dark .modal-footer { border-color: #1f2937; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: #374151; }
.dark .form-group label { color: #d1d5db; }
.form-input { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; background: #fff; color: #111827; box-sizing: border-box; }
.dark .form-input { background: #1f2937; border-color: #374151; color: #f3f4f6; }
.form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-select { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; background: #fff; color: #111827; cursor: pointer; }
.dark .form-select { background: #1f2937; border-color: #374151; color: #f3f4f6; }
.cancel-btn { padding: 0.625rem 1.25rem; background: transparent; border: 1px solid #d1d5db; border-radius: 0.5rem; color: #6b7280; font-weight: 500; cursor: pointer; font-size: 0.875rem; }
.cancel-btn:hover { background: #f9fafb; color: #374151; }
.dark .cancel-btn { border-color: #374151; color: #9ca3af; }
.dark .cancel-btn:hover { background: #1f2937; color: #d1d5db; }
.send-btn { padding: 0.625rem 1.25rem; background: #6366f1; border: none; border-radius: 0.5rem; color: #fff; font-weight: 500; cursor: pointer; font-size: 0.875rem; }
.send-btn:hover:not(:disabled) { background: #4f46e5; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>