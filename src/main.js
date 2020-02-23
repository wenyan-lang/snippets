import Vue from 'vue'
import { store } from './store'
import { router } from './router'
import App from './App.vue'
import VueDisqus from 'vue-disqus'

Vue.config.productionTip = false
Vue.use(VueDisqus)

new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    this.$store.commit('init')
  }
}).$mount('#app')
