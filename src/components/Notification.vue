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
        timeout: 2000,
        error: null,
      },
      shown: false,
    }
  },
  methods: {
    show(data) {
      clearTimeout(this.timer)

      if (typeof data === 'string')
        data = { message: data }
        
      let {
        message = '',
        type = 'info',
        timeout = 4000,
        error = null,
      } = data

      if (error) {
        type = 'error'
        if (!message){
          let code = (error.response || {}).status || null
          if (code === 404)
            message = 'Not found'
          else if (code === 403)
            message = 'Unauthorized'
          else
            message += error.message
        }
      }

      this.data = {
        message,
        type,
        timeout,
        error,
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
  z-index 1000
  right 1.5rem
  bottom 1.5rem
  width 18rem
  background white
  border-radius 3px
  padding 1rem 1.5rem
  overflow hidden
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