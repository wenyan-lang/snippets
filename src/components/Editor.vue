<template>
<div class="editor">
  <spinner v-if="loading"/>
  <error-page :error="error" v-if="error"/>
  <iframe v-show="!error" src="https://ide.wy-lang.org/embed?show-bars" ref="iframe"/>
  <confirm ref='confirm'/>
</div>
</template>

<script>
import { API } from '../api'
import { CommonMixin } from '../mixins/common'
import Spinner from './Spinner.vue'
import ErrorPage from './ErrorPage.vue'
import Confirm from './Confirm.vue'

export default {
  name: 'Editor',
  mixins: [
    CommonMixin
  ],
  props: {
    id: [String, Number],
    snippet: Object,
    inDialog: Boolean,
    error: null
  },
  data() {
    return {
      loading: true,
      snapshot: {},
      iframeLoaded: false,
    }
  },
  components: {
    Spinner,
    ErrorPage,
    Confirm,
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
            this.snippet = await this.getSnippet(this.id.toString())
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
          if (this.draft) {
            if (confirm(`Unsaved draft "${this.draft.title}" found.\nClick "OK" to load it or "Cancel" to discard it.`)){
              this.snapshot.title = this.draft.title
              this.snapshot.code = this.draft.code
              this.snapshot.token = this.draft.token
            }
            else {
              this.draft = null
            }
          }
        }
      }
    },
    async initEditor() {
      await this.initSnapshot()
      const load = () => {
        this.send({ 
          action: 'custom', 
          field: 'set',
          value: this.controls,
        })
        this.send({ action: 'title', value: this.snapshot.title })
        this.send({ action: 'author', value: this.snapshot.author })
        this.send({ action: 'code', value: this.snapshot.code })
        // this.send({ action: 'config', field: 'readonly', value: this.locked })
        this.send({ action: 'run' })
        this.loading = false
        this.iframeLoaded = true
      }
      if (this.iframeLoaded)
        load()
      else
        this.$refs.iframe.onload = load
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
          case 'fork':
            this.fork()
            break
          case 'close':
            this.$emit('close')
            break
        }
      }
    },
    async publish(data = this.snapshot) {
      if (!confirm(`Publishing this script?\n\nTitle: ${data.title}\nAuthor: ${data.author}\nToken: ${data.token}`))
        return
      
      try {
        const { id } = await API.publish(data)
        this.draft = null
        this.$emit('notify', { message: 'Snippet published!', type: 'success' })
        this.gotoSnippet(id.toString())
      } catch (error) {
        this.$emit('notify', { error })
      }
    },
    async save() {
      const modify = async (snapshot) => {
        try {
          await API.modify(snapshot.id, snapshot)
          this.$set(this, 'snippet', { ...snapshot })
          this.$emit('notify', { message: 'Saved', type: 'success' })
          this.setSnippetCache(snapshot)
        } catch (error) {
          this.$emit('notify', { error })
        }
      }
      // others' snippets
      if (this.locked) {
        const result = await this.$refs.confirm.open({
          title: 'No Access',
          message: "You don't have access to this snippet, would you like to make a fork or enter the token to access?",
          buttons: [
            'Fork',
            'Enter Token',
            'Cancel'
          ]
        })
        // fork
        if (result === 0) {
          await this.publish(this.makeFork())
        }
        // enter token
        else if (result === 1) {
          const token = prompt('Enter token for this snippet')
          // TODO: save token for this snippet to local storage
          await modify({...this.snapshot, token })
        }
        // cancel
        else {
          return
        }
      }
      // your own snippets
      else {
        await modify(this.snapshot)
      }
    },
    async fork() {
      this.$router.push({
        name: 'new', 
        params: {
          id: null,
          snippet: this.makeFork()
        },
      })
      this.$emit('close')
      this.$emit('notify', { message: 'Fork created', type: 'success' })
    },
    makeFork() {
      return {
        ...this.snapshot,
        id: undefined, 
        origin: this.snapshot.id,
        author: this.userName,
      }
    }
  },
  computed: {
    public() {
      return this.snapshot.token === 'public'
    },
    locked() {
      return !this.public && this.snapshot.token !== this.userToken
    },
    new() {
      return this.snapshot.id == null
    },
    unsaved () {
      return !this.snippet
        || this.snippet.code !== this.snapshot.code
        || this.snippet.title !== this.snapshot.title
        || this.snippet.author !== this.snapshot.author
    },
    controls () {
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
          : this.locked 
            ? 'lock-outline'
            : 'lock-open-variant-outline',
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

      return controls
    }
  },
  watch: {
    snippet() {
      this.initEditor()
    },
    controls() {
      this.send({ 
        action: 'custom', 
        field: 'set',
        value: this.controls,
      })
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