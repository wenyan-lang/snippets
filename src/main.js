import Vue from 'vue'
import { store } from './store'
import { router } from './router'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    this.$store.commit('init')
  }
}).$mount('#app')
