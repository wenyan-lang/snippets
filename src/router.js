import Vue from 'vue'
import Router from 'vue-router'
import Editor from './components/Editor.vue'

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  routes: [{
    path: '/editor/:id', 
    name: 'editor', 
    component: Editor, 
    props: true,
  }],
})
