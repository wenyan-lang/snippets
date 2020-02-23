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

button
  background: white
  border: 1px solid gainsboro
  border-radius: 3px
  min-height: 22px

  &:not(.icon)
    min-width 60px

  &:hover
    background: gainsboro
    border: 1px solid grey

  &:active
    background: silver

  &:focus
    outline: none

  &.icon
    padding: 0
    text-align: center
    width: 25px
    height: 25px
    font-size: 17px
    line-height: 17px
    cursor: pointer

    & *
      vertical-align: middle

input
  background: white
  border: 1px solid gainsboro
  border-radius: 3px
  padding: 2px 6px

  &[disabled]
    border: 1px solid #eee
</style>
