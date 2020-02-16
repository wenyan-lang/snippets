<template>
<div class="error">
  <span class="iconify" data-icon="mdi:alert-octagon" data-inline="false"></span>
  <div class="message">{{error.message}}</div>
  <button @click="$router.go(-1)">Back</button>
</div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default() {
        return {
          message: 'Page not found'
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.error
  position absolute
  top 50%
  left 50%
  transform translate(-50%, -50%)
  text-align center

  .iconify
    font-size 5em
    opacity 0.1

  .message
    opacity 0.4
    margin-bottom 1rem
</style>