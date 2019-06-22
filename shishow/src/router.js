import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Signup from './views/Signup.vue'
import Signin from './views/Signin.vue'
import Notification from './views/Notification.vue'
import DirectMessage from './views/DirectMessage.vue'
import SearchResult from './views/SearchResult.vue'

import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/signin',
      name: 'signin',
      component: Signin
    },
    {
      path: '/notification',
      name: 'notification',
      component: Notification
    },
    {
      path: '/directMessage',
      name: 'directMessage',
      component: DirectMessage,
      meta: { requiresAuth: true }
    },
    {
      path: '/SearchResult',
      name: 'SearchResult',
      component: SearchResult
    }
	]
})

router.beforeEach((to, from, next) => {
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log('user is signed in.')
        next()
      } else {
        console.log('user is not signed in.')
        next({
          path: '/signin',
          query: {
            redirect: to.fullPath
          }
        })
      }
    })
  } else {
    next()
  }
})

export default router
