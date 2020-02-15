import Vue from 'vue'
import Router from 'vue-router'
import Editor from './components/Editor.vue'

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  routes: [{
    path: '/new', 
    name: 'new', 
    component: Editor, 
  }, {
    path: '/snippet/:id', 
    name: 'snippet', 
    component: Editor, 
    props: true,
  }],
})
