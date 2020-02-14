<template>
<div id="app">
  <router-view/>
</div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style lang="stylus">
html, body 
  padding 0
  margin 0

body
  min-height 100vh

#app
  font-family Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
</style>
