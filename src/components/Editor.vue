<template>
<div class="editor">
  <spinner v-if="loading"/>
  <iframe src="https://ide.wy-lang.org/embed?show-bars" ref="iframe"/>
</div>
</template>

<script>
import { API } from '../api'
import { CommonMixin } from '../mixins/common'
import Spinner from './Spinner.vue'

export default {
  name: 'Editor',
  mixins: [
    CommonMixin
  ],
  props: {
    snippet: Object,
    inDialog: Boolean,
  },
  data() {
    return {
      loading: true,
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
      if (this.snippet){
        this.snapshot = {...this.snippet}
      }
      else {
        this.snapshot = {
          id: null,
          token: this.userToken,
          author: this.userName,
          title: 'Untitled',
          code: '',
        }
        if (this.draft) {
          this.snapshot.title = this.draft.title
          this.snapshot.code = this.draft.code
          this.snapshot.token = this.draft.token
        }
      }
      this.$refs.iframe.onload = () => {
        this.updateControls()
        this.send({ action: 'title', value: this.snapshot.title })
        this.send({ action: 'author', value: this.snapshot.author })
        this.send({ action: 'code', value: this.snapshot.code })
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

      if (this.inDialog) {
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
      }

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
    toggleLock() {
      if (this.snapshot.token === 'public') 
        this.snapshot.token = this.$store.state.user.token
      else
        this.snapshot.token = 'public'
    },
    onChanged(snap){
      this.snapshot.code = snap.code
      this.snapshot.title = snap.name
      this.snapshot.author = snap.author
      this.draft = this.snapshot
      this.updateControls()
    },
    onListener(e) {
      const { action, source, id, value } = e.data
      if (source !== 'wenyan-ide')
        return
      if (action === 'info') {
        this.onChanged(value)
      }
      else if (action === 'custom') {
        switch (id){
          case 'fullscreen':
            this.$emit('fullscreen', true)
            break
          case 'lock':
            this.toggleLock()
            this.updateControls()
            break
          case 'publish':
            this.publish()
            break
        }
      }
    },
    async publish() {
      if (!confirm(`Publishing this script?\n\nTitle: ${this.snapshot.title}\nAuthor: ${this.snapshot.author}\nToken: ${this.snapshot.token}`))
        return
      
      const { id } = await API.publish(this.snapshot)
      this.draft = null
      this.gotoSnippet(id)
    },
    gotoSnippet(id) {
      id// TODO:
    }
  },
  computed: {
    public() {
      return this.snapshot.token === 'public'
    },
    new() {
      return this.snapshot.id == null
    },
    unsaved () {
      return !this.snippet
        || this.snippet.code !== this.snapshot.code
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
  border 0
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