
import { ref } from 'vue'

const BASE_URL =
  import.meta.env.VITE_COLLABORATION_API_URL ?? 'http://localhost:3000/api/v1'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ApiDocument {
  id: string
  name: string
  type: string
  size: string
  sizeBytes: number
  uploadedBy: string
  uploadedById: string
  uploadedAt: string
  storageUrl: string
  sharedWith: SharedWith[]
  commentCount: number
  comments: ApiComment[]
}

export interface SharedWith {
  id: string
  name: string
  permission: 'view' | 'comment' | 'edit'
  shareType: 'user' | 'department' | 'organization'
}

export interface ApiComment {
  id: string
  author: string
  authorId: string
  content: string
  timestamp: string
  parentId: string | null
  mentions: string[]
  replies: ApiReply[]
}

export interface ApiReply {
  id: string
  author: string
  authorId: string
  content: string
  timestamp: string
}

export interface SharePayload {
  shareType: 'user' | 'department' | 'organization'
  targetId?: string
  targetName?: string
  permission: 'view' | 'comment' | 'edit'
  notifyTarget?: boolean
}

// ── Auth header helper ─────────────────────────────────────────────────────
// Replace this with however your app exposes the current user.
function getAuthHeaders(): Record<string, string> {
  // Option A – inject user from your Pinia auth store:
  // import { useAuthStore } from '@/stores/auth'
  // const auth = useAuthStore()
  // return { 'x-user-id': auth.user.id, 'x-user-name': auth.user.name }

  // Option B – Bearer token:
  const token = JSON.parse(localStorage.getItem('token') ?? 'null')
  return { Authorization: `Bearer ${token}` }

  // Placeholder (replace before going live)
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Composable ────────────────────────────────────────────────────────────

export function useCollaborationApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e: any) {
      error.value = e.message ?? 'Something went wrong'
      return null
    } finally {
      loading.value = false
    }
  }

  // ── Documents ────────────────────────────────────────────────────────────

  async function fetchDocuments(params: {
    search?: string
    type?: string
    tab?: string
    page?: number
    limit?: number
  } = {}) {
    const qs = new URLSearchParams()
    if (params.search) qs.set('search', params.search)
    if (params.type && params.type !== 'all') qs.set('type', params.type)
    if (params.tab && params.tab !== 'all') qs.set('tab', params.tab)
    if (params.page) qs.set('page', String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))

    return run<{ data: ApiDocument[]; total: number }>(() =>
      apiFetch(`/documents?${qs.toString()}`),
    )
  }

  async function fetchDocument(id: string) {
    return run<{ data: ApiDocument }>(() => apiFetch(`/documents/${id}`))
  }

  async function uploadDocument(file: File, name?: string, shareWith?: string, permission?: 'view' | 'comment' | 'edit') {
    const form = new FormData()
    form.append('file', file)
    if (name) form.append('name', name)
    if (shareWith) form.append('shareWith', shareWith)
    if (permission) form.append('permission', permission)

    return run<{ data: ApiDocument }>(() =>
      apiFetch('/documents/upload', { 
        method: 'POST', 
        body: form,
        headers: {
          // Don't set Content-Type header when using FormData - browser will set it with boundary
          'Accept': 'application/json',
        },
      }),
    )
  }

  async function deleteDocument(id: string) {
    return run<void>(() =>
      apiFetch(`/documents/${id}`, { method: 'DELETE' }),
    )
  }

  function getDownloadUrl(doc: ApiDocument): string {
    return doc.storageUrl ?? `${BASE_URL}/documents/file/${doc.id}`
  }

  // ── Comments ─────────────────────────────────────────────────────────────

  async function fetchComments(documentId: string) {
    console.log('Documnent ID:', documentId);
    return run<{ data: ApiComment[] }>(() =>
      apiFetch(`/documents/${documentId}/comments`),
    )
  }

  async function postComment(
    documentId: string,
    content: string,
    parentId?: string,
    mentions?: string[],
  ) {
    console.log('Documnent ID:', documentId);
    return run<{ data: ApiComment }>(() =>
      apiFetch(`/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId, mentions }),
      }),
    )
  }

  async function updateComment(documentId: string, commentId: string, content: string) {
    return run<{ data: ApiComment }>(() =>
      apiFetch(`/documents/${documentId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }),
    )
  }

  async function deleteComment(documentId: string, commentId: string) {
    return run<void>(() =>
      apiFetch(`/documents/${documentId}/comments/${commentId}`, {
        method: 'DELETE',
      }),
    )
  }

  // ── Shares ────────────────────────────────────────────────────────────────

  async function shareDocument(documentId: string, payload: SharePayload) {
    return run<{ data: any }>(() =>
      apiFetch(`/documents/${documentId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    )
  }

  async function bulkShareDocument(documentId: string, shares: SharePayload[]) {
    return run<{ data: any[]; count: number }>(() =>
      apiFetch(`/documents/${documentId}/shares/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares }),
      }),
    )
  }

  async function revokeShare(documentId: string, shareId: string) {
    return run<void>(() =>
      apiFetch(`/documents/${documentId}/shares/${shareId}`, {
        method: 'DELETE',
      }),
    )
  }

  return {
    loading,
    error,
    // documents
    fetchDocuments,
    fetchDocument,
    uploadDocument,
    deleteDocument,
    getDownloadUrl,
    // comments
    fetchComments,
    postComment,
    updateComment,
    deleteComment,
    // shares
    shareDocument,
    bulkShareDocument,
    revokeShare,
  }
}