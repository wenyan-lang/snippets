<template>
<div id="app">
  <home/>
</div>
</template>

<script>
import Home from './components/Home.vue'

export default {
  name: 'App',
  components: {
    Home,
  },
}
</script>

<style lang="stylus">
html, body 
  padding 0
  margin 0
  height 100vh
  overflow hidden

#app
  font-family Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
</style>
