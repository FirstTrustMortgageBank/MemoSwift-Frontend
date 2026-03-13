import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/main-dashboard',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'Main Dashboard',
      },
    },
    {
      path: '/approval-dashboard',
      name: 'Approval-Dashboard',
      component: () => import('../views/User/ApprovalDashboard.vue'),
      meta: {
        title: 'Approval Dashboard',
      },
    },
    {
      path: '/memo',
      name: 'Memo-Editor',
      component: () => import('../components/memo/Editor.vue'),
      meta: {
        title: 'Memo Editor',
      },
    },
    {
      path: '/memo-list',
      name: 'Memo-List',
      component: () => import('../views/User/MemoList.vue'),
      meta: {
        title: 'Memo List',
      },
    },
    {
      path: '/memo/:id',
      name: 'Memo-Detail',
      component: () => import('../views/User/MemoDetail.vue'),
      meta: {
        title: 'Memo Detail',
      },
    },
    {
      path: '/document-collaboration',
      name: 'Document-Collaboration',
      component: () => import('../views/User/DocumentCollaboration.vue'),
      meta: {
        title: 'Document Collaboration',
      }
    },
    {
      path: '/archive-search',
      name: 'Archive Search',
      component: () => import('../views/User/ArchiveSearch.vue'),
       meta: {
        title: 'Archive Search',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('../views/User/Chat.vue'),
      meta: {
        title: 'Chat',
      },
    }
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`
  next()
})
