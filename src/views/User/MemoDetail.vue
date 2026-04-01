<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="loading-spinner"></div>
      <p class="ml-3 text-gray-500 dark:text-gray-400">{{ loadingMessage }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center bg-white rounded-2xl dark:bg-gray-900">
      <svg class="w-16 h-16 mx-auto text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white/90">Kindly Select A Memo You Want To View</h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Click the button below to select a memo</p>
      <button @click="goBack" class="px-4 py-2 mt-4 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600">
        Go Back
      </button>
    </div>

    <!-- Memo Content -->
    <div v-else class="space-y-6">
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
          <span class="memo-title-indicator" v-if="memo.reference">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {{ memo.reference }} - {{ memo.title }}
          </span>
        </div>
        
        <div class="header-actions">
          <!-- Approval Workflow Buttons -->
          <div class="approval-badge" :class="approvalStatusClass">
            <span class="status-dot"></span>
            {{ formatStatus(memo.status) }}
          </div>
          
          <!-- Show Approve/Reject buttons only if user is the current approver -->
          <button 
            v-if="memo.status === 'PENDING_APPROVAL' && isCurrentApprover"
            @click="showApproveModal = true" 
            class="action-btn primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Approve
          </button>
          
          <button 
            v-if="memo.status === 'PENDING_APPROVAL' && isCurrentApprover"
            @click="showRejectModal = true" 
            class="action-btn secondary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Reject
          </button>
          
          <!-- Send to Next Approver button -->
          <button 
            v-if="canSendToNextApprover"
            @click="openApproverModal" 
            class="action-btn primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Send to Next Approver
          </button>
          
          <button 
            v-if="memo.status === 'DRAFT' && memo.authorId === currentUserId"
            @click="editMemo" 
            class="action-btn primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Edit
          </button>
          
          <button @click="handlePrint" class="action-btn secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Print
          </button>
          
          <button @click="exportAsPDF" class="action-btn secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <!-- Approval History Timeline -->
      <div v-if="approvalHistory.length > 0" class="approval-history">
        <div class="history-header">
          <h4>Approval History</h4>
          <button @click="showHistory = !showHistory" class="history-toggle">
            {{ showHistory ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div v-if="showHistory" class="history-timeline">
          <div 
            v-for="(item, index) in approvalHistory" 
            :key="item.id"
            class="history-item"
            :class="{ 'is-last': index === approvalHistory.length - 1 }"
          >
            <div class="history-icon" :class="item.action.toLowerCase()">
              <svg v-if="item.action === 'SENT_FOR_APPROVAL'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              <svg v-else-if="item.action === 'APPROVED'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <svg v-else-if="item.action === 'REJECTED'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>
            <div class="history-content">
              <div class="history-title">
                <strong>{{ item.actorName || item.user?.name || 'Unknown' }}</strong>
                <span class="history-action">{{ item.action }}</span>
                <span class="history-time">{{ formatDateTime(item.createdAt) }}</span>
              </div>
              <div v-if="item.comment" class="history-comment">
                "{{ item.comment }}"
              </div>
              <div v-if="item.action === 'SENT_FOR_APPROVAL' && item.targetApproverName" class="history-details">
                Sent to: {{ item.targetApproverName }}
              </div>
              <div v-else-if="item.action === 'APPROVED'" class="history-details">
                Approved by: {{ item.actorName || item.userName || item.user?.name }}
              </div>
              <div v-else-if="item.action === 'REJECTED'" class="history-details">
                Rejected by: {{ item.rejectorName || item.userName || item.user?.name }}
              </div>
            </div>
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

      <!-- Creator Info Card -->
      <div class="creator-info-card">
        <div class="creator-avatar">
          <span>{{ getInitials(memo.creator?.name || memo.author) }}</span>
        </div>
        <div class="creator-details">
          <h4 class="creator-name">{{ memo.creator?.name || memo.author }}</h4>
          <div class="creator-meta">
            <span class="creator-role">{{ memo.creator?.role || 'Staff' }}</span>
            <span class="creator-department">{{ memo.creator?.department || memo.branch }}</span>
            <span class="creator-date">Created {{ formatDate(memo.createdAt) }}</span>
          </div>
          <div v-if="memo.creator?.email" class="creator-contact">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {{ memo.creator.email }}
          </div>
        </div>
        <div class="creator-status" :class="memo.creator?.status || 'active'">
          {{ memo.creator?.status || 'Active' }}
        </div>
      </div>

      <!-- Document Ruler -->
      <div v-if="showRuler" class="ruler">
        <div class="ruler-container">
          <div class="ruler-base"></div>
          <div v-for="i in 15" :key="i" class="ruler-mark" :style="{ left: (i * 60) + 'px' }"></div>
          <div v-for="i in 15" :key="i + 'num'" class="ruler-number" :style="{ left: (i * 60 - 5) + 'px' }">{{ i }}</div>
        </div>
      </div>

      <!-- Document Content Area with US Letter Format -->
      <div class="document-view-container">
        <div class="document-page" 
             :style="{ 
               fontFamily: memo.metadata?.fontFamily || 'Century Gothic', 
               fontSize: (memo.metadata?.fontSize || 12) + 'px', 
               lineHeight: memo.metadata?.lineHeight || '1.5'
             }">
          <div class="document-content" v-html="memo.content"></div>
          
          <!-- Memo Footer Section - Updated to match new structure -->
          <div class="memo-footer-divider"></div>
          <div class="memo-footer">
            <!-- Signatory Row -->
            <div class="signatory-row">
              <div class="signatory" v-for="(sig, idx) in (memo.metadata?.footerFields?.signatories || [])" :key="idx">
                <div class="signatory-name">{{ sig.name || '_________________________' }}</div>
                <div class="signatory-role">{{ sig.role || '_________________________' }}</div>
              </div>
            </div>

            <!-- Opex/Capex Section -->
            <div class="opex-section">
              <div class="opex-title">Opex/Capex</div>

              <!-- Row 1: Monthly Budget | Expense to Date | Balance -->
              <div class="opex-grid">
                <div class="opex-cell">
                  <div class="opex-label">Monthly Budget ₦</div>
                  <div class="opex-value">{{ formatCurrency(memo.metadata?.footerFields?.monthlyBudget) || '_________________________' }}</div>
                </div>
                <div class="opex-cell">
                  <div class="opex-label">Expense to Date ₦</div>
                  <div class="opex-value">{{ formatCurrency(memo.metadata?.footerFields?.monthlyExpense) || '_________________________' }}</div>
                </div>
                <div class="opex-cell">
                  <div class="opex-label">Balance ₦</div>
                  <div class="opex-value">{{ formatCurrency(memo.metadata?.footerFields?.monthlyBalance) || '_________________________' }}</div>
                </div>
              </div>

              <!-- Row 2: Annual Budget | Expense to Date | Balance -->
              <div class="opex-grid">
                <div class="opex-cell">
                  <div class="opex-label">Annual Budget ₦</div>
                  <div class="opex-value">{{ formatCurrency(memo.metadata?.footerFields?.annualBudget) || '_________________________' }}</div>
                </div>
                <div class="opex-cell">
                  <div class="opex-label">Expense to Date ₦</div>
                  <div class="opex-value">{{ formatCurrency(memo.metadata?.footerFields?.annualExpense) || '_________________________' }}</div>
                </div>
                <div class="opex-cell">
                  <div class="opex-label">Balance ₦</div>
                  <div class="opex-value">{{ formatCurrency(memo.metadata?.footerFields?.annualBalance) || '_________________________' }}</div>
                </div>
              </div>

              <!-- Row 3: FINCON | Signature | Date -->
              <div class="opex-grid">
                <div class="opex-cell">
                  <div class="opex-label">FINCON</div>
                  <div class="opex-value">{{ memo.metadata?.footerFields?.fincon || '_________________________' }}</div>
                </div>
                <div class="opex-cell">
                  <div class="opex-label">Signature</div>
                  <div class="opex-value">{{ memo.metadata?.footerFields?.signature || '_________________________' }}</div>
                </div>
                <div class="opex-cell">
                  <div class="opex-label">Date</div>
                  <div class="opex-value">{{ memo.metadata?.footerFields?.finconDate || '_________________________' }}</div>
                </div>
              </div>

              <!-- Comments -->
              <div class="opex-comments-row">
                <div class="opex-label">Comments</div>
                <div class="opex-value opex-value--wide">{{ memo.metadata?.footerFields?.comments || '_________________________' }}</div>
              </div>
            </div>

            <!-- Concurrence Section -->
            <!-- <div class="concurrence-section">
              <div class="concurrence-title">Concurrence:</div>
              <div class="signoff-block" v-for="(person, idx) in (memo.metadata?.footerFields?.concurrence || [])" :key="'c' + idx">
                <div class="signoff-name-line">
                  <span class="signoff-name">{{ person.name || '_________________________' }}</span>
                  <span class="signoff-line"></span>
                </div>
                <div class="signoff-role">{{ person.role || '_________________________' }}</div>
              </div>
            </div> -->

            <!-- Approved By Section -->
            <div class="approved-section">
              <div class="concurrence-title">Approved By:</div>
              <div class="signoff-block" v-for="(person, idx) in (memo.metadata?.footerFields?.approvedBy || [])" :key="'a' + idx">
                <div class="signoff-name-line">
                  <span class="signoff-name">{{ person.name || '_________________________' }}</span>
                  <span class="signoff-line"></span>
                </div>
                <div class="signoff-role">{{ person.role || '_________________________' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attachments Section -->
      <div v-if="memo.attachments && memo.attachments.length > 0" class="attachments-section">
        <h3 class="attachments-title">Attachments</h3>
        <div class="attachments-list">
          <div v-for="file in memo.attachments" :key="file.name" class="attachment-item">
            <svg class="attachment-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
            <span class="attachment-name">{{ file.name }}</span>
            <span class="attachment-size">{{ file.size }}</span>
            <button @click="downloadAttachment(file)" class="attachment-download">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <div class="comments-header">
          <h3 class="comments-title">Comments ({{ memo.comments?.length || 0 }})</h3>
          <button @click="showCommentInput = !showCommentInput" class="add-comment-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            Add Comment
          </button>
        </div>

        <!-- Add Comment Input -->
        <div v-if="showCommentInput" class="add-comment">
          <div class="comment-avatar">
            <span>{{ currentUserInitials }}</span>
          </div>
          <div class="comment-input-wrapper">
            <textarea
              v-model="newComment"
              placeholder="Write a comment..."
              rows="3"
              class="comment-input"
            ></textarea>
            <div class="comment-actions">
              <button @click="showCommentInput = false" class="cancel-btn small">Cancel</button>
              <button 
                @click="addComment" 
                :disabled="!newComment.trim()"
                class="send-btn small"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="memo.comments && memo.comments.length > 0" class="comments-list">
          <div v-for="comment in sortedComments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              <span>{{ getInitials(comment.author) }}</span>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-role">{{ comment.role }}</span>
                <span class="comment-time">{{ formatTimeAgo(comment.createdAt) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-footer">
                <button @click="replyToComment(comment)" class="comment-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6"/>
                  </svg>
                  Reply
                </button>
                <button v-if="comment.authorId === currentUserId" @click="deleteComment(comment.id)" class="comment-action delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete
                </button>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <div class="comment-avatar small">
                    <span>{{ getInitials(reply.author) }}</span>
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <span class="comment-author">{{ reply.author }}</span>
                      <span class="comment-role">{{ reply.role }}</span>
                      <span class="comment-time">{{ formatTimeAgo(reply.createdAt) }}</span>
                    </div>
                    <p class="comment-text">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="comments-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p>No comments yet</p>
          <button @click="showCommentInput = true" class="text-brand-500 hover:text-brand-600">
            Be the first to comment
          </button>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <div>Words: {{ wordCount }} | Characters: {{ charCount }}</div>
        <div class="status-right">
          <span class="document-indicator">
            📄 {{ memo.reference }}
          </span>
          <span>View Only | Page 1 of 1</span>
        </div>
      </div>
    </div>

    <!-- Approver Selection Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showApproverModal" class="modal-overlay" @click.self="closeApproverModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Send to Next Approver</h3>
            <button @click="closeApproverModal" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Select Next Approver</label>
              <select v-model="selectedApprover" class="approver-select" :disabled="isLoadingApprovers">
                <option value="" disabled>Choose next approver...</option>
                <option v-for="approver in approversList" :key="approver.id" :value="approver.id">
                  {{ approver.name }} - {{ approver.role }} ({{ approver.department }})
                </option>
              </select>
              <div v-if="isLoadingApprovers" class="text-sm text-gray-500 mt-1">Loading approvers...</div>
              <div v-if="!isLoadingApprovers && approversList.length === 0" class="text-sm text-error-500 mt-1">
                No approvers available
              </div>
            </div>
            
            <div class="form-group">
              <label>Priority Level</label>
              <div class="priority-options">
                <label class="priority-option">
                  <input type="radio" v-model="priority" value="LOW">
                  <span class="priority-badge low">Low</span>
                </label>
                <label class="priority-option">
                  <input type="radio" v-model="priority" value="MEDIUM">
                  <span class="priority-badge medium">Medium</span>
                </label>
                <label class="priority-option">
                  <input type="radio" v-model="priority" value="HIGH">
                  <span class="priority-badge high">High</span>
                </label>
                <label class="priority-option">
                  <input type="radio" v-model="priority" value="URGENT">
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
            <button @click="closeApproverModal" class="cancel-btn">Cancel</button>
            <button 
              @click="sendToNextApprover" 
              class="send-btn"
              :disabled="!selectedApprover || isSending || approversList.length === 0"
            >
              {{ isSending ? 'Sending...' : 'Send to Next Approver' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Approve Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showApproveModal" class="modal-overlay" @click.self="showApproveModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Approve Memo</h3>
            <button @click="showApproveModal = false" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Comment (optional)</label>
              <textarea
                v-model="approvalComment"
                rows="3"
                placeholder="Add any comments..."
                class="message-input"
              ></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showApproveModal = false" class="cancel-btn">Cancel</button>
            <button @click="approveMemo" class="send-btn">Approve</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Reject Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Reject Memo</h3>
            <button @click="showRejectModal = false" class="close-btn">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Reason for rejection <span class="text-error-500">*</span></label>
              <textarea
                v-model="rejectionReason"
                rows="3"
                placeholder="Explain why this memo is being rejected..."
                class="message-input"
              ></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="showRejectModal = false" class="cancel-btn">Cancel</button>
            <button 
              @click="rejectMemo" 
              :disabled="!rejectionReason.trim()"
              class="send-btn reject"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const memoId = route.params.id

const currentPageTitle = ref('Memo Details')
const isLoading = ref(true)
const loadingMessage = ref('Loading memo...')
const error = ref(null)
const showRuler = ref(true)
const showHistory = ref(true)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showApproverModal = ref(false)
const approvalComment = ref('')
const rejectionReason = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const wordCount = ref(0)
const charCount = ref(0)
const showCommentInput = ref(false)
const newComment = ref('')
const isLoadingApprovers = ref(false)
const isSending = ref(false)
const approversList = ref([])
const selectedApprover = ref('')
const priority = ref('MEDIUM')
const dueDate = ref('')
const approverMessage = ref('')
const notifyByEmail = ref(true)

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1'

// Auth token helper
const getAuthHeader = () => {
  const token = JSON.parse(localStorage.getItem('token') || '{}')
  return { Authorization: `Bearer ${token}` }
}

// Get current user from localStorage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

// Define getInitials
const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const currentUser = getCurrentUser()
const currentUserId = currentUser?.id
const currentUserInitials = currentUser?.displayName 
  ? getInitials(currentUser.displayName) 
  : (currentUser?.username ? getInitials(currentUser.username) : 'U')

// Memo data
const memo = ref({
  id: null,
  reference: '',
  title: '',
  branch: '',
  author: '',
  authorId: '',
  currentApproverId: '',
  createdAt: '',
  status: 'DRAFT',
  content: '',
  metadata: {
    fontFamily: 'Century Gothic',
    fontSize: 12,
    lineHeight: '1.5',
    footerFields: {}
  },
  creator: {
    name: '',
    role: '',
    department: '',
    email: '',
    status: 'active'
  },
  attachments: [],
  comments: []
})

// Approval history
const approvalHistory = ref([])

// Helper function to format currency
const formatCurrency = (value) => {
  if (!value) return ''
  const num = parseFloat(value.toString().replace(/,/g, ''))
  if (isNaN(num)) return value
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num).replace('NGN', '₦')
}

// Computed
const isCurrentApprover = computed(() => {
  return memo.value.currentApproverId === currentUserId && memo.value.status === 'PENDING_APPROVAL'
})

const canSendToNextApprover = computed(() => {  
  if (memo.value.authorId !== currentUserId) return false
  
  if (memo.value.status !== 'APPROVED') return false
  
  if (approvalHistory.value.length === 0) return false
  
  const sortedHistory = [...approvalHistory.value].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
  
  const lastAction = sortedHistory[0]
  
  if (lastAction?.action !== 'APPROVED') return false
  
  if (memo.value.authorId === currentUserId && memo.value.currentApproverId === currentUserId) {
    return lastAction.userId === currentUserId
  }
  
  return lastAction.userId === memo.value.currentApproverId
})

const approvalStatusClass = computed(() => {
  return {
    'status-draft': memo.value.status === 'DRAFT',
    'status-pending': memo.value.status === 'PENDING_APPROVAL',
    'status-approved': memo.value.status === 'APPROVED',
    'status-rejected': memo.value.status === 'REJECTED',
  }
})

const sortedComments = computed(() => {
  if (!memo.value.comments) return []
  return [...memo.value.comments].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
})

// Methods
const goToDashboard = () => {
  router.push('/main-dashboard')
}

const goBack = () => {
  router.push('/memo-list')
}

const editMemo = () => {
  router.push(`/memo/edit/${memoId}`)
}

const formatStatus = (status) => {
  const statusMap = {
    'DRAFT': 'Draft',
    'PENDING_APPROVAL': 'Pending Approval',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A'
  
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(dateString)
}

// Fetch approval history
const fetchApprovalHistory = async () => {
  if (!memoId) return
  
  try {
    const response = await axios.get(`${API_BASE_URL}/memos/${memoId}/approval-history`, {
      headers: getAuthHeader()
    })
    
    approvalHistory.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching approval history:', error)
  }
}

// Fetch approvers list
const fetchApprovers = async () => {
  try {
    isLoadingApprovers.value = true
    
    const response = await axios.get(`${API_BASE_URL}/auth/users`, {
      headers: getAuthHeader()
    })
    
    const usersData = response.data?.data?.data || []
    
    approversList.value = usersData.map(user => ({
      id: user.id,
      name: user.username,
      role: user.role || 'Staff',
      department: user.department || 'General',
      email: user.email
    })).filter(user => user.id !== currentUserId)
    
  } catch (error) {
    console.error('Error fetching approvers:', error)
    showToastMessage('Failed to load approvers', 'error')
    approversList.value = []
  } finally {
    isLoadingApprovers.value = false
  }
}

// Open approver modal
const openApproverModal = async () => {
  showApproverModal.value = true
  await fetchApprovers()
}

// Close approver modal
const closeApproverModal = () => {
  showApproverModal.value = false
  selectedApprover.value = ''
  priority.value = 'MEDIUM'
  dueDate.value = ''
  approverMessage.value = ''
}

// Send to next approver
const sendToNextApprover = async () => {
  if (!selectedApprover.value) {
    showToastMessage('Please select an approver', 'error')
    return
  }
  
  try {
    isSending.value = true
    
    const payload = {
      approverId: selectedApprover.value,
      priority: priority.value,
      dueDate: dueDate.value || undefined,
      message: approverMessage.value || undefined,
      notifyByEmail: notifyByEmail.value,
    }
    
    await axios.post(
      `${API_BASE_URL}/memos/${memoId}/send-approval`,
      payload,
      { headers: getAuthHeader() }
    )
    
    memo.value.status = 'PENDING_APPROVAL'
    const approver = approversList.value.find(a => a.id === selectedApprover.value)
    memo.value.currentApproverId = selectedApprover.value
    
    await fetchApprovalHistory()
    
    showToastMessage(`Memo sent to ${approver?.name} for approval`, 'success')
    closeApproverModal()
    
  } catch (error) {
    console.error('Error sending for approval:', error)
    showToastMessage('Failed to send for approval', 'error')
  } finally {
    isSending.value = false
  }
}

// API Methods
const fetchMemo = async (id) => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Loading memo...'
    error.value = null
    
    const response = await axios.get(`${API_BASE_URL}/memos/${id}`, {
      headers: getAuthHeader()
    })
    
    const memoData = response.data?.data || response.data
    
    memo.value = {
      ...memoData,
      status: memoData.status || 'DRAFT',
      content: memoData.content || '',
      metadata: memoData.metadata || {
        fontFamily: 'Century Gothic',
        fontSize: 12,
        lineHeight: '1.5',
        footerFields: {}
      },
      attachments: memoData.attachments || [],
      comments: memoData.comments || [],
      creator: {
        name: memoData.authorName || memoData.author || 'Unknown',
        role: memoData.authorRole || 'Staff',
        department: memoData.branch || 'Unknown',
        email: memoData.authorEmail || '',
        status: 'active'
      }
    }
    
    await fetchApprovalHistory()
    calculateWordCount()
    
  } catch (err) {
    console.error('Error fetching memo:', err)
    error.value = err.response?.data?.message || 'Failed to load memo. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const approveMemo = async () => {
  try {
    await axios.post(
      `${API_BASE_URL}/memos/${memoId}/approve`,
      { comment: approvalComment.value },
      { headers: getAuthHeader() }
    )
    
    memo.value.status = 'APPROVED'
    showApproveModal.value = false
    await fetchApprovalHistory()
    
    showToastMessage('Memo approved successfully', 'success')
    approvalComment.value = ''
    
  } catch (err) {
    console.error('Error approving memo:', err)
    showToastMessage('Failed to approve memo', 'error')
  }
}

const rejectMemo = async () => {
  if (!rejectionReason.value.trim()) return
  
  try {
    await axios.post(
      `${API_BASE_URL}/memos/${memoId}/reject`,
      { reason: rejectionReason.value },
      { headers: getAuthHeader() }
    )
    
    memo.value.status = 'REJECTED'
    showRejectModal.value = false
    await fetchApprovalHistory()
    
    showToastMessage('Memo rejected', 'error')
    rejectionReason.value = ''
    
  } catch (err) {
    console.error('Error rejecting memo:', err)
    showToastMessage('Failed to reject memo', 'error')
  }
}

const handlePrint = () => {
  window.print()
}

const exportAsPDF = () => {
  showToastMessage('PDF export coming soon', 'info')
}

const downloadAttachment = (file) => {
  console.log('Downloading attachment:', file.name)
  showToastMessage(`Downloading ${file.name}`, 'success')
}

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Comment methods
const addComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/memos/${memoId}/comments`,
      { content: newComment.value },
      { headers: getAuthHeader() }
    )
    
    const newCommentData = response.data?.data || response.data
    
    if (!memo.value.comments) {
      memo.value.comments = []
    }
    
    memo.value.comments.push(newCommentData)
    newComment.value = ''
    showCommentInput.value = false
    showToastMessage('Comment added', 'success')
    
  } catch (err) {
    console.error('Error adding comment:', err)
    showToastMessage('Failed to add comment', 'error')
  }
}

const replyToComment = async (comment) => {
  const replyText = window.prompt('Enter your reply:')
  if (!replyText) return
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/memos/${memoId}/comments`,
      { 
        content: replyText,
        parentId: comment.id 
      },
      { headers: getAuthHeader() }
    )
    
    const newReply = response.data?.data || response.data
    
    if (!comment.replies) {
      comment.replies = []
    }
    
    comment.replies.push(newReply)
    showToastMessage('Reply added', 'success')
    
  } catch (err) {
    console.error('Error adding reply:', err)
    showToastMessage('Failed to add reply', 'error')
  }
}

const deleteComment = async (commentId) => {
  if (!confirm('Delete this comment?')) return
  
  try {
    await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
      headers: getAuthHeader()
    })
    
    memo.value.comments = memo.value.comments.filter(c => c.id !== commentId)
    showToastMessage('Comment deleted', 'success')
    
  } catch (err) {
    console.error('Error deleting comment:', err)
    showToastMessage('Failed to delete comment', 'error')
  }
}

// Calculate word count from content
const calculateWordCount = () => {
  if (!memo.value.content) return
  const text = memo.value.content.replace(/<[^>]*>/g, ' ')
  const words = text.split(/\s+/).filter(w => w.length > 0)
  wordCount.value = words.length
  charCount.value = text.length
}

// Load memo data on mount
onMounted(() => {
  if (memoId) {
    fetchMemo(memoId)
  } else {
    error.value = 'No memo ID provided'
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Footer Styles - Updated to match new structure */
.memo-footer-divider {
  border: none;
  border-top: 2px solid var(--color-gray-300);
  margin: 2rem 0 1.5rem;
}

.dark .memo-footer-divider {
  border-top-color: var(--color-gray-700);
}

.memo-footer {
  margin-top: 1.5rem;
  font-size: 11px;
  color: var(--color-gray-700);
}

.dark .memo-footer {
  color: var(--color-gray-400);
}

/* Signatory Row */
.signatory-row {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.signatory {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.signatory-name {
  font-weight: 700;
  font-size: 11px;
  border-bottom: 1px dashed var(--color-gray-400);
  padding-bottom: 0.25rem;
}

.signatory-role {
  font-size: 10px;
  color: var(--color-gray-600);
}

.dark .signatory-role {
  color: var(--color-gray-500);
}

/* Opex/Capex Section */
.opex-section {
  margin-bottom: 1.5rem;
  border-top: 1px solid var(--color-gray-300);
  padding-top: 0.75rem;
}

.dark .opex-section {
  border-top-color: var(--color-gray-700);
}

.opex-title {
  font-weight: 700;
  font-size: 11px;
  text-decoration: underline;
  margin-bottom: 0.75rem;
}

.opex-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}

.opex-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.opex-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-gray-600);
}

.dark .opex-label {
  color: var(--color-gray-500);
}

.opex-value {
  border: 1px solid var(--color-gray-300);
  padding: 0.25rem 0.5rem;
  font-size: 10px;
  background-color: var(--color-gray-50);
  border-radius: 2px;
}

.dark .opex-value {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-gray-300);
}

.opex-value--wide {
  width: 100%;
}

.opex-comments-row {
  margin-top: 0.5rem;
}

/* Concurrence & Approved By Sections */
.concurrence-section,
.approved-section {
  margin-bottom: 1.5rem;
  border-top: 1px solid var(--color-gray-300);
  padding-top: 0.75rem;
}

.dark .concurrence-section,
.dark .approved-section {
  border-top-color: var(--color-gray-700);
}

.concurrence-title {
  font-weight: 700;
  font-size: 11px;
  margin-bottom: 0.75rem;
}

.signoff-block {
  margin-bottom: 1rem;
}

.signoff-name-line {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}

.signoff-name {
  font-weight: 600;
  font-size: 11px;
  min-width: 200px;
  border-bottom: 1px dashed var(--color-gray-400);
  padding-bottom: 0.15rem;
}

.signoff-line {
  flex: 1;
  border-bottom: 1px solid var(--color-gray-400);
  margin-bottom: 3px;
}

.signoff-role {
  font-size: 10px;
  color: var(--color-gray-600);
  margin-left: 0.5rem;
}

.dark .signoff-role {
  color: var(--color-gray-500);
}

/* Add footer styles */
.memo-footer-divider {
  border: none;
  border-top: 2px solid var(--color-gray-300);
  margin: 2rem 0 1.5rem;
}

.dark .memo-footer-divider {
  border-top-color: var(--color-gray-700);
}

.memo-footer {
  margin-top: 1.5rem;
  font-size: 11px;
  color: var(--color-gray-700);
}

.dark .memo-footer {
  color: var(--color-gray-400);
}

.footer-signature-block {
  margin-bottom: 1.5rem;
}

.signature-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--color-gray-300);
}

.dark .signature-line {
  border-bottom-color: var(--color-gray-700);
}

.signature-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.signature-field strong {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-gray-600);
}

.dark .signature-field strong {
  color: var(--color-gray-500);
}

.signature-value {
  font-family: monospace;
  font-size: 11px;
  letter-spacing: 1px;
}

.signature-name {
  font-size: 10px;
  color: var(--color-brand-600);
  font-weight: 500;
}

.dark .signature-name {
  color: var(--color-brand-400);
}

.footer-distribution,
.footer-reference,
.footer-department {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-gray-200);
}

.dark .footer-distribution,
.dark .footer-reference,
.dark .footer-department {
  border-top-color: var(--color-gray-700);
}

.footer-distribution strong,
.footer-reference strong,
.footer-department strong {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-gray-600);
  margin-bottom: 0.25rem;
}

.dark .footer-distribution strong,
.dark .footer-reference strong,
.dark .footer-department strong {
  color: var(--color-gray-500);
}

.footer-distribution p,
.footer-reference span,
.footer-department span {
  font-size: 11px;
  line-height: 1.4;
}
/* Approval History Styles */
.approval-history {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.dark .approval-history {
  background-color: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.history-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-800);
}

.dark .history-header h4 {
  color: var(--color-gray-200);
}

.history-toggle {
  font-size: 0.875rem;
  color: var(--color-brand-500);
  background: none;
  border: none;
  cursor: pointer;
}

.history-timeline {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.history-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  position: relative;
}

.history-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 15px;
  top: 40px;
  bottom: -8px;
  width: 2px;
  background-color: var(--color-gray-300);
}

.dark .history-item:not(:last-child)::after {
  background-color: var(--color-gray-600);
}

.history-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.history-icon.sent {
  background-color: #E3F2FD;
  color: #1976D2;
}

.history-icon.approved {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.history-icon.rejected {
  background-color: #FFEBEE;
  color: #C62828;
}

.dark .history-icon.sent {
  background-color: #1A3A4A;
  color: #64B5F6;
}

.dark .history-icon.approved {
  background-color: #1B3A2B;
  color: #81C784;
}

.dark .history-icon.rejected {
  background-color: #4A2A2A;
  color: #E57373;
}

.history-content {
  flex: 1;
  font-size: 0.875rem;
}

.history-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.history-action {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  background-color: var(--color-gray-200);
  color: var(--color-gray-600);
}

.dark .history-action {
  background-color: var(--color-gray-700);
  color: var(--color-gray-300);
}

.history-time {
  font-size: 0.75rem;
  color: var(--color-gray-500);
  margin-left: auto;
}

.history-comment {
  font-style: italic;
  color: var(--color-gray-600);
  margin-bottom: 0.125rem;
}

.dark .history-comment {
  color: var(--color-gray-400);
}

.history-details {
  font-size: 0.75rem;
  color: var(--color-brand-500);
}

/* Priority Options for Modal */
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

/* Editor Header */
.editor-header {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dark .editor-header {
  background-color: var(--color-gray-900);
  border-color: var(--color-gray-800);
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
  max-width: 400px;
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
  gap: 0.75rem;
  flex-wrap: wrap;
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
  padding: 0.5rem 1rem;
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
  background-color: #4A2A2A;
  color: #E57373;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
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

/* Creator Info Card */
.creator-info-card {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dark .creator-info-card {
  background-color: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

.creator-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.creator-details {
  flex: 1;
}

.creator-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 0.25rem;
}

.dark .creator-name {
  color: var(--color-gray-100);
}

.creator-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.creator-role {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
}

.dark .creator-role {
  background-color: var(--color-gray-800);
  color: var(--color-gray-400);
}

.creator-department {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.creator-date {
  font-size: 0.875rem;
  color: var(--color-gray-400);
}

.creator-contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.dark .creator-contact {
  color: var(--color-gray-400);
}

.creator-status {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  flex-shrink: 0;
}

.creator-status.active {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.dark .creator-status.active {
  background-color: #1B3A2B;
  color: #81C784;
}

/* Ruler Styles */
.ruler {
  background-color: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 0.5rem;
  height: 1.5rem;
  padding: 0 2rem;
  display: flex;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.dark .ruler {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
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

/* Document View Container */
.document-view-container {
  background-color: var(--color-gray-100);
  border-radius: 1rem;
  padding: 2rem;
  overflow: auto;
  max-height: calc(100vh - 300px);
}

.dark .document-view-container {
  background-color: var(--color-gray-950);
}

.document-view-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.document-view-container::-webkit-scrollbar-track {
  background: var(--color-gray-200);
  border-radius: 4px;
}

.dark .document-view-container::-webkit-scrollbar-track {
  background: var(--color-gray-800);
}

.document-view-container::-webkit-scrollbar-thumb {
  background: var(--color-gray-500);
  border-radius: 4px;
}

.document-view-container::-webkit-scrollbar-thumb:hover {
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
  font-family: 'Century Gothic', sans-serif;
}

.dark .document-page {
  background-color: var(--color-gray-900);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.document-content {
  max-width: 100%;
  line-height: 1.6;
  color: var(--color-gray-900);
}

.dark .document-content {
  color: var(--color-gray-100);
}

.document-content :deep(h1) {
  font-size: 24px;
  font-weight: bold;
  margin: 0.67em 0;
  color: inherit;
}

.document-content :deep(h2) {
  font-size: 18px;
  font-weight: bold;
  margin: 1.5em 0 0.5em;
  color: inherit;
}

.document-content :deep(p) {
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.document-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  font-size: 12px;
}

.document-content :deep(th) {
  background-color: #f3f4f6;
  font-weight: bold;
  padding: 12px;
  border: 1px solid #d1d5db;
}

.dark .document-content :deep(th) {
  background-color: #1f2937;
  border-color: #4b5563;
}

.document-content :deep(td) {
  padding: 12px;
  border: 1px solid #d1d5db;
}

.dark .document-content :deep(td) {
  border-color: #4b5563;
}

/* Attachments Section */
.attachments-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 0.5rem;
}

.dark .attachments-section {
  background-color: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

.attachments-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: 1rem;
}

.dark .attachments-title {
  color: var(--color-gray-200);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: var(--color-gray-50);
  border-radius: 0.375rem;
}

.dark .attachment-item {
  background-color: var(--color-gray-800);
}

.attachment-icon {
  color: var(--color-brand-500);
  flex-shrink: 0;
}

.attachment-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--color-gray-700);
}

.dark .attachment-name {
  color: var(--color-gray-300);
}

.attachment-size {
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.attachment-download {
  padding: 0.25rem;
  color: var(--color-gray-500);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
}

.attachment-download:hover {
  color: var(--color-brand-500);
  background-color: var(--color-gray-200);
}

.dark .attachment-download:hover {
  background-color: var(--color-gray-700);
}

/* Comments Section */
.comments-section {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.dark .comments-section {
  background-color: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.comments-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-800);
}

.dark .comments-title {
  color: var(--color-gray-200);
}

.add-comment-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-brand-50);
  color: var(--color-brand-600);
  border: 1px solid var(--color-brand-200);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .add-comment-btn {
  background-color: var(--color-brand-500/10);
  color: var(--color-brand-400);
  border-color: var(--color-brand-500/20);
}

.add-comment-btn:hover {
  background-color: var(--color-brand-100);
}

.dark .add-comment-btn:hover {
  background-color: var(--color-brand-500/20);
}

/* Add Comment */
.add-comment {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.comment-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.comment-input-wrapper {
  flex: 1;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background-color: var(--color-white);
  color: var(--color-gray-900);
  font-family: inherit;
  resize: vertical;
  margin-bottom: 0.75rem;
}

.dark .comment-input {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-gray-100);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.comment-author {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-gray-900);
}

.dark .comment-author {
  color: var(--color-gray-100);
}

.comment-role {
  font-size: 0.75rem;
  color: var(--color-gray-500);
  background-color: var(--color-gray-100);
  padding: 0.125rem 0.375rem;
  border-radius: 1rem;
}

.dark .comment-role {
  background-color: var(--color-gray-800);
  color: var(--color-gray-400);
}

.comment-time {
  font-size: 0.75rem;
  color: var(--color-gray-400);
}

.comment-text {
  font-size: 0.875rem;
  color: var(--color-gray-700);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.dark .comment-text {
  color: var(--color-gray-300);
}

.comment-footer {
  display: flex;
  gap: 1rem;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  color: var(--color-gray-500);
  font-size: 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
}

.comment-action:hover {
  background-color: var(--color-gray-100);
  color: var(--color-brand-500);
}

.dark .comment-action:hover {
  background-color: var(--color-gray-800);
}

.comment-action.delete:hover {
  color: var(--color-error-500);
}

/* Replies */
.replies-list {
  margin-top: 1rem;
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-gray-200);
}

.dark .replies-list {
  border-left-color: var(--color-gray-700);
}

.reply-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.reply-item:last-child {
  margin-bottom: 0;
}

/* Comments Empty State */
.comments-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-gray-400);
}

.comments-empty svg {
  margin: 0 auto 1rem;
  stroke: currentColor;
}

.comments-empty p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Button sizes */
.cancel-btn.small,
.send-btn.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Status Bar */
.status-bar {
  background-color: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: var(--color-gray-600);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.dark .status-bar {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-gray-400);
}

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
}

.dark .document-indicator {
  background-color: var(--color-brand-500/10);
  color: var(--color-brand-400);
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
  width: 450px;
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

/* Loading Spinner */
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

/* Print Styles */
@media print {
  .editor-header,
  .ruler,
  .status-bar,
  .attachments-section,
  .modal-overlay,
  .comments-section,
  .creator-info-card,
  .approval-history {
    display: none !important;
  }
  
  .document-view-container {
    padding: 0;
    background: white;
  }
  
  .document-page {
    box-shadow: none;
    padding: 0.5in;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-left {
    flex-direction: column;
    align-items: stretch;
  }
  
  .memo-title-indicator {
    max-width: 100%;
  }
  
  .header-actions {
    justify-content: flex-start;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .document-page {
    width: 100%;
    padding: 0.5in;
  }
  
  .creator-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .creator-meta {
    justify-content: center;
  }
  
  .comment-item {
    flex-direction: column;
  }
  
  .replies-list {
    margin-left: 0;
  }
  
  .priority-options {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>