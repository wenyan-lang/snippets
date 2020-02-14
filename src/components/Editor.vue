<template>
<div class="editor">
  <spinner v-if="loading"/>
  <iframe src="https://ide.wy-lang.org/embed?show-bars" ref="iframe"/>
</div>
</template>

<script>
import Spinner from './Spinner.vue'

export default {
  name: 'Editor',
  props: {
    snippet: Object
  },
  data() {
    return {
      loading: true,
    }
  },
  components: {
    Spinner,
  },
  methods: {
    send(data){
      this.$refs.iframe.contentWindow.postMessage(data, '*')
    },
    initEditor() {
      this.$refs.iframe.onload = () => {
        this.send({ 
          action: 'custom', 
          value: [{
            id: 'save',
            icon: 'content-save',
          }, {
            id: 'fullscreen',
            icon: 'fullscreen',
            align: 'right'
          }]
        })
        this.send({ action: 'config', field: 'title', value: this.snippet.title })
        this.send({ action: 'code', value: this.snippet.code })
        this.send({ action: 'run' })
        this.loading = false
      }
    },
    registerListener () {
      window.addEventListener('message', this.onListener)
    },
    unregisterListener(){
      window.removeEventListener('message', this.onListener)
    },
    onListener(e) {
      const { action, source, id } = e.data
      if (source !== 'wenyan-ide')
        return
      if (action === 'custom'){
        switch (id){
          case 'fullscreen':
            this.$emit('fullscreen', true)
        }
      }
    }
  },
  watch: {
    snippet() {
      this.initEditor()
    }
  },
  mounted() {
    this.registerListener()
    this.initEditor()
  },
  destroyed() {
    this.unregisterListener()
  }
}
</script>

<style lang="stylus" scoped>
.editor
  border 1px solid gainsboro
  background white
  position relative
  height 100%
  width 100%

  iframe
    border 0
    width 100%
    min-height 30rem
    height 100%

  .spinner
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
</style>