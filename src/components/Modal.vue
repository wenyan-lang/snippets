<template>
<div class='modal' :class='{hidden: !value}' @click='exit'>
  <div class='dialog' @click.prevent=''>
    <slot/>
  </div>
</div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: Boolean,
    persist: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    exit() {
      if (!this.persist)
        this.$emit('input', false)
    }
  },
}
</script>

<style lang='stylus' scoped>
.modal
  z-index 2
  position fixed
  left 0
  top 0
  bottom 0
  right 0
  background rgba(0,0,0,0.6)
  
  &.hidden
    visibility hidden
    pointer-events none
    
  .dialog
    position absolute
    border-radius 5px
    overflow hidden
    left 50%
    top 50%
    background white
    transform translate(-50%, -50%)

</style>