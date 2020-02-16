<template>
<div class="editor">
  <spinner v-if="loading"/>
  <error-page :error="error" v-if="error"/>
  <iframe v-show="!error" src="https://ide.wy-lang.org/embed?show-bars" ref="iframe"/>
</div>
</template>

<script>
import { API } from '../api'
import { CommonMixin } from '../mixins/common'
import Spinner from './Spinner.vue'
import ErrorPage from './ErrorPage.vue'

export default {
  name: 'Editor',
  mixins: [
    CommonMixin
  ],
  props: {
    id: String,
    snippet: Object,
    inDialog: Boolean,
    error: null
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
    ErrorPage,
  },
  methods: {
    send(data) {
      this.$refs.iframe.contentWindow.postMessage(data, '*')
    },
    async initSnapshot() {
      if (this.snippet) {
        this.snapshot = { ...this.snippet }
      }
      else {
        if (this.id) {
          try {
            this.snippet = await this.getSnippet(this.id)
            this.snapshot = { ...this.snippet }
          }
          catch(error) {
            this.loading = false
            this.error = error
            this.$emit('notify', { error })
          }
        }
        else {
          this.snapshot = {
            id: null,
            token: this.userToken,
            author: this.userName,
            title: 'Untitled',
            code: '',
          }
          if (this.draft && confirm(`Unsaved draft "${this.draft.title}", do you want to load it?`)) {
            this.snapshot.title = this.draft.title
            this.snapshot.code = this.draft.code
            this.snapshot.token = this.draft.token
          }
        }
      }
    },
    async initEditor() {
      await this.initSnapshot()
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
        align: 'right',
        disabled: !this.new,
      })

      if (!this.new) {
        controls.push({
          id: 'share',
          icon: 'link-variant',
          align: 'right'
        })
        
        controls.push({
          id: 'fork',
          icon: 'source-fork',
          align: 'right'
        })
      }

      if (this.inDialog) {
        controls.push({
          id: 'open-in-editor',
          icon: 'open-in-new',
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
      if (this.new) {
        if (snap.code)
          this.draft = this.snapshot
        else
          this.draft = ''
      }
      this.updateControls()
    },
    onListener(e) {
      const { action, source, id, value } = e.data
      if (source !== 'wenyan-ide')
        return
      if (action === 'info') {
        this.onChanged(value)
      }
      else if (action === 'save') {
        if (this.new)
          this.publish()
        else
          this.save()
      }
      else if (action === 'custom') {
        switch (id){
          case 'open-in-editor':
            this.gotoSnippet(this.snapshot.id, this.snapshot)
            this.$emit('close')
            break
          case 'lock':
            this.toggleLock()
            this.updateControls()
            break
          case 'share':
            prompt('Copy the following link', `${window.location.origin}/snippet/${this.snapshot.id}`)
            break
          case 'publish':
            this.publish()
            break
          case 'save':
            this.save()
            break
          case 'close':
            this.$emit('close')
            break
        }
      }
    },
    async publish() {
      if (!confirm(`Publishing this script?\n\nTitle: ${this.snapshot.title}\nAuthor: ${this.snapshot.author}\nToken: ${this.snapshot.token}`))
        return
      
      try {
        const { id } = await API.publish(this.snapshot)
        this.draft = null
        this.$emit('notify', { message: 'Snippet published!', type: 'success' })
        this.gotoSnippet(id.toString())
      } catch (error) {
        this.$emit('notify', { error })
      }
    },
    async save() {
      try {
        await API.modify(this.snapshot.id, this.snapshot)
        this.$set(this, 'snippet', { ...this.snapshot })
        this.$emit('notify', { message: 'Saved', type: 'success' })
        this.setSnippetCache(this.snapshot)
      } catch (error) {
        this.$emit('notify', { error })
      }
      this.updateControls()
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