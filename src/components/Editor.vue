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
      token: 'public',
      unlocked: false,
      snapshot: {},
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
      this.snapshot = {...this.snippet}
      this.$refs.iframe.onload = () => {
        this.updateControls()
        this.send({ action: 'title', value: this.snippet.title })
        this.send({ action: 'author', value: this.snippet.author })
        this.send({ action: 'code', value: this.snippet.code })
        this.send({ action: 'config', field: 'readonly', value: this.locked })
        this.send({ action: 'run' })
        this.loading = false
      }
    },
    updateControls() {
      const controls = []

      if (this.new) {
        controls.push({
          id: 'publish',
          icon: 'cloud-upload'
        })
      } else if (this.unsaved) {
        controls.push({
          id: 'save',
          icon: 'content-save',
        })
      }

      controls.push({
        id: 'lock',
        icon: this.public
          ? 'earth'
          : this.unlocked 
            ? 'lock-open-variant-outline'
            : 'lock-outline',
        align: 'right'
      })

      if (!this.new){
        controls.push({
          id: 'fork',
          icon: 'source-fork',
          align: 'right'
        })
      }

      controls.push({
        id: 'fullscreen',
        icon: 'fullscreen',
        align: 'right'
      })

      controls.push({
        id: 'close',
        icon: 'close',
        align: 'right'
      })

      this.send({ 
        action: 'custom', 
        field: 'set',
        value: controls,
      })
    },
    registerListener () {
      window.addEventListener('message', this.onListener)
    },
    unregisterListener(){
      window.removeEventListener('message', this.onListener)
    },
    onListener(e) {
      const { action, source, id, value } = e.data
      if (source !== 'wenyan-ide')
        return
      if (action === 'info') {
        this.snapshot.code = value.code
        this.snapshot.title = value.title
        this.snapshot.author = value.author
        this.updateControls()
      }
      else if (action === 'custom'){
        switch (id){
          case 'fullscreen':
            this.$emit('fullscreen', true)
            break
        }
      }
    }
  },
  computed: {
    public() {
      return this.snippet.token === 'public'
    },
    new() {
      return this.snippet.id == null
    },
    unsaved () {
      return this.snippet.code !== this.snapshot.code
        || this.snippet.title !== this.snapshot.title
        || this.snippet.author !== this.snapshot.author
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