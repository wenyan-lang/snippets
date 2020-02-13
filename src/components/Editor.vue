<template>
<div class="editor">
  <div class="header">

  </div>
  <iframe src="https://ide.wy-lang.org/embed?show-bars" ref="iframe"/>
</div>
</template>

<script>
export default {
  name: 'Editor',
  props: {
    snippet: Object
  },
  methods: {
    updateCode() {
      this.$refs.iframe.onload = () => {
        this.$refs.iframe.contentWindow.postMessage({ action: 'config', field:'title', value: this.snippet.title }, '*')
        this.$refs.iframe.contentWindow.postMessage({ action: 'code', value: this.snippet.code }, '*')
        this.$refs.iframe.contentWindow.postMessage({ action: 'run' }, '*')
      }
    }
  },
  watch:{
    snippet() {
      this.updateCode()
    }
  },
  mounted(){
    this.updateCode()
  }
}
</script>

<style lang="stylus" scoped>
.editor
  border 1px solid gainsboro
  border-radius 5px
  background white

  iframe
    border 0
    width 100%
    min-height 30rem
    height 100%
</style>