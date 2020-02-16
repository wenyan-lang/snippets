<template>
<div class="notification" :class='[{shown}, data.type]'>
  <div class="indicator"></div>
  <div class="title">{{data.message}}</div>
</div>
</template>


<script>
export default {
  data() {
    return {
      timer: null,
      data: {
        message: '',
        type: 'info',
        timeout: 3000,
      },
      shown: false,
    }
  },
  methods: {
    show(data) {
      clearTimeout(this.timer)

      const {
        message = '',
        type = 'info',
        timeout = 3000,
      } = data
      this.data = {
        message,
        type,
        timeout
      }
      this.timer = setTimeout(()=>{
        this.shown = false
      }, this.data.timeout)
      this.shown = true
    }
  },
}
</script>

<style lang="stylus" scoped>
.notification
  position fixed
  right 1.5rem
  top 1.5rem
  width 18rem
  background white
  border-radius 3px
  padding 1rem 1.5rem
  overflow hidden
  border 1px solid gainsboro
  box-shadow 2px 2px 10px 0px rgba(50, 50, 50, 0.2)
  transform translateX(30rem)
  transition all .2s ease-in-out
  --color black

  &.shown
    transform translateX(0)

  .indicator
    position absolute
    left 0
    top 0
    bottom 0
    width 3px
    background var(--color)      
  
  &.info
    --color #137ac9
  
  &.success
    --color green

  &.error
    --color red

  &.warning
    --color orange
</style>