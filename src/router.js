import Vue from 'vue'
import Router from 'vue-router'
import Home from './components/Home.vue'

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  routes: [{
    path: '/',
    name: 'home',
    component: Home,
    children: [{ 
      path: '/editor/:editor-id', 
      name: 'editor', 
      component: Home, 
      props: true, 
    }]
  }]
})
