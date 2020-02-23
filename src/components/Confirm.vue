<template>
<modal v-model='value' class='confirm'>
  <div class='title'>{{title}}</div>
  <div class='message'>{{message}}</div>
  <div class='buttons'>
    <template v-for='(button, idx) in buttons'>
      <button @click='clicked(idx)' :key='idx'>{{button}}</button>
    </template>
  </div>
</modal>
</template>

<script>
import Modal from './Modal.vue'

export default {
  components: {
    Modal,
  },
  data() {
    return {
      value: false,
      title: '',
      message: '',
      buttons: [],
      resolve: null,
      reject: null
    }
  },
  methods: {
    open({ title, message, buttons } = {}) {
      this.title = title
      this.message = message
      this.buttons = buttons
      this.value = true
      
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    close(v) {
      this.value = false
      this.resolve(v)
    },
    clicked(idx) {
      this.close(idx)
    }
  }
}
</script>

<style lang="stylus">
.modal.confirm
  .dialog
    min-height 100px
    width 300px
    padding 1rem

    
    .title
      font-size 1.3em
      padding-bottom 0.5rem

    .message
      display block
      margin 0.4rem 0
      opacity 0.8
      font-size 1em

    .buttons
      text-align right

    button:not(.icon)
      display inline-block
      margin 0.8rem 0.4rem 0rem 0
      font-size 0.9em
      padding 0.2rem 0.6rem
</style>