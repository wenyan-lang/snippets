<template>
<span class="icon-button" @click='e=>$emit("click",e)'>
  <span class="iconify" :data-icon="icon.includes(':') ? icon : `mdi:${icon}`" data-inline="false"></span>
</span>
</template>

<script>
export default {
  inheritAttrs: true,
  props: {
    icon: String
  }
}
</script>

<style lang="stylus" scoped>
.icon-button
  opacity 0.8
  cursor pointer
  display inline-block
  line-height 0px !important

  .iconify
    font-size 18px
    margin 0 0.2rem

  &:hover
    opacity: 1

  &.active
    color: #E53

  &[disabled]
    opacity 0.5
    pointer-events none
</style>