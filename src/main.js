import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Home from './components/Home.vue'

Vue.config.productionTip = false

Vue.use(Router)

const router = new Router({
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

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
