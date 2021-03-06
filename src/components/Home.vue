<template>
<div class="home">
  <div class="nav" :class='{routed}'>
    <div class="nav-inner">
      <icon-button v-if="routed" @click="goHome" icon="arrow-left"/>
      <label class="title" @click='goHome'>文言片語</label>

      <input 
        :class='{invisible: routed}'
        v-model="searchText"
        @keypress.enter="search()"
        class="search"
        placeholder="Search snippets..." 
      />

      <icon-button 
        v-show="searchResult" 
        :class='{invisible: routed}'
        @click="searchText = ''" 
        icon="close"
      />
      <icon-button 
        v-show="!searchResult" 
        :class='{invisible: routed}'
        @click="search()" 
        icon="search"
      />

      <div class="right-aligned">
        <icon-button @click="newSnippet" v-show='!routed' icon="plus"/>
        <icon-button @click="showProfile = !showProfile" icon="account"/>
      </div>
    </div>
  </div>
  <div class="content" ref='content'>
    <router-view
      v-if="routed" 
      v-show="!searchResult"
      @notify='notify'
    />
    <template v-if="!routed || searchResult">
      <div class="showcase">
        <snippet-preview 
          v-for="(s, idx) in (searchResult || snippets)" 
          :snippet="s" 
          :key="s.id" 
          @update="data=>updateSnippet(idx, data)"
          @open="()=>{ editing = true; editingSnippet = s }"
          @notify='notify'
          @comments='commentId = s.id'
        />
      </div>
      <spinner v-show="loading"/>
      <div class="end-of-pages" v-if='endOfPages'>you reached the end :)</div>
    </template>
  </div>
  <modal v-model="editing" class="editor">
    <editor 
      :snippet="editingSnippet || undefined"
      :in-dialog="true"
      @close='editing = false'
      @notify='notify'
      @comments='commentId = editing.id'
    />
  </modal>
  <modal v-model="showProfile" class="profile">
    <div class="title">Settings</div>
    <label>Username</label>
    <input v-model='userName' placeholder="Username"/>
    <label>Token</label>
    <input v-model='userToken' disabled placeholder="Token"/>
    <button class="icon" @click='enterToken'>
      <span class="iconify" data-icon="mdi:cursor-text" data-inline="false"></span>
    </button>
    <button class="icon" @click='resetToken'>
      <span class="iconify" data-icon="mdi:refresh" data-inline="false"></span>
    </button>
    <div class="description">Token is your account credential, be sure to have a backup elsewhere to prevent losing the access to your snippets.</div>
    <button @click='search(`is:mine`);showProfile = false'>My Snippets</button>
    <button @click='showProfile = false'>Close</button>
  </modal>
  <modal class="comments" :value='!!commentId' @input='commentId = null' v-if='commentId'>
    <vue-disqus shortname="wenyan-snippets" :identifier="commentId.toString()" :url="'http://snippets.wy-lang.org/snippets/'+commentId"></vue-disqus>
  </modal>
  <notification ref='notify'/> 
</div>
</template>

<script>
import nanoid from 'nanoid'
import { API } from '../api'
import { CommonMixin } from '../mixins/common'
import SnippetPreview from './SnippetPreview.vue'
import Spinner from './Spinner.vue'
import IconButton from './IconButton.vue'
import Editor from './Editor.vue'
import Notification from './Notification.vue'
import Modal from './Modal.vue'

export default {
  name: 'Home',
  mixins: [
    CommonMixin,
  ],
  components: {
    SnippetPreview,
    Spinner,
    Editor,
    IconButton,
    Notification,
    Modal,
  },
  data() {
    return {
      loading: false,
      snippets: [],
      searchText: '',
      searchResult: null,
      page: 0,
      totalPages: 9999,
      editing: false,
      editingSnippet: null,
      editingFullscreen: false,
      showProfile: false,
      commentId: null
    }
  },
  computed: {
    endOfPages() {
      return this.page >= this.totalPages
    },
    // page is used for other route instead of snippets listing
    routed() {
      return this.$route.path !== '/'
    }
  },
  methods: {
    async fetchNext() {
      if (this.endOfPages || this.loading || this.routed)
        return
  
      this.loading = true
      const { snippets, totalPages, page } = await API.getPage(this.page + 1, this.userToken)
      this.snippets.push(...snippets)
      this.totalPages = totalPages
      this.page = page
      this.loading = false

      this.$nextTick(() => {
        if (this.$refs.content.scrollHeight === this.$refs.content.clientHeight)
          this.fetchNext()
      })
    },
    async search(v) {
      if (v)
        this.searchText = v
      if (!this.searchText) {
        this.searchResult = null
        return
      }
      this.searchResult = []
      this.loading = true
      const text = this.searchText
      const data = await API.search(text, this.userToken)
      if (text === this.searchText)
        this.searchResult = data
      this.loading = false
    },
    newSnippet() {
      this.$router.push({ name: 'new' })
    },
    updateSnippet(idx, snippet) {
      this.$set(this.snippets, idx, snippet)
    },
    clearSearch() {
      this.searchResult = null
      this.loading = false
      this.searchText = ''
    },
    promptChangeToken(){
      return confirm('Token is your account credential. If you changed it, you will LOSE the control of the snippets you created. \n\nAre you sure to change it?')
    },
    enterToken() {
      if (!this.promptChangeToken())
        return
      
      const token = prompt('Enter the token', this.userToken)

      if (!token || token === 'public')
        alert('Invalid Token. Please try again.')
      else {
        this.userToken = token
        location.reload()
      }
    },
    resetToken() {
      if (!this.promptChangeToken())
        return

      this.userToken = nanoid(12)
      location.reload()
    },
    notify(data) {
      this.$refs.notify.show(data)
    },
  },
  mounted() {
    this.page = 0
    this.fetchNext()

    this.$refs.content.onscroll = () => {
      let bottomOfWindow = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) + window.innerHeight === document.documentElement.offsetHeight

      if (bottomOfWindow)
        this.fetchNext()
    }
  },
  watch: {
    searchText() {
      if (!this.searchText)
        this.clearSearch()
    },
    routed() {
      if (this.page === 0)
        this.fetchNext()
      this.searchText = ''
    }
  }
}
</script>

<style lang="stylus">
$max-width = 85rem

.home 
  height 100vh
  display grid 
  grid-template-rows max-content 1fr

  & > .content
    height calc(100vh - 50px)
    overflow auto

  .showcase
    padding: 1rem
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr))
    max-width $max-width - 2rem
    margin 0.5rem auto

.nav
  background: #f1f1f1
  border-bottom: 1px solid gainsboro
  white-space: nowrap

  &.routed
    .nav-inner
      max-width 100vw
      width 100%

      .right-aligned
        right 1.5rem

  .nav-inner
    max-width $max-width
    margin 0 auto
    padding 0.05rem 1rem
    position relative

    *
      vertical-align: middle

    .right-aligned
      position: absolute
      right: 0
      top: 0
      bottom: 0
      padding: 0.5rem 1.3rem

  .icon-button
    margin: 0.3rem
    color: #444
    cursor: pointer
    opacity: 0.8

    .iconify 
      font-size: 1.5rem !important
      
    &:hover
      opacity: 1

  .search
    margin: 0.5rem
    padding: 0.2rem 0.5rem
    font-size: 20px

  .title
    color: #777
    margin: 0.5rem
    font-size: 1.1em
    line-height 1em

.modal.editor
  .dialog
    height calc(100vh - 10rem)
    width calc(100vw - 10rem)

.modal.profile
  .dialog
    height 250px
    width 280px
    padding 20px

.modal.comments
  .dialog
    min-height min(20rem, 100vh)
    max-height calc(100vh - 10rem)
    min-width min(30rem, 100vw)
    width calc(100vw - 20rem)
    overflow auto

    #disqus_thread
      padding 2rem

.profile
  & > *
    vertical-align middle

  .title
    font-size 1.3em
    padding-bottom 10px

  label
    display block
    margin 0.6rem 0 0 0
    opacity 0.8
    font-size 0.9em

  .description
    opacity 0.6
    font-size 0.75em
    padding 0 5px
    font-style italic 
    padding-bottom 10px
  
  input
    font-size 1em
    margin 0.4rem 0

  button:not(.icon)
    margin 0.8rem 0.4rem 0.8rem 0
    font-size 0.8em
    padding 0.2rem 0.6rem
  
  button.icon
    margin-left 0.4rem

.end-of-pages
  padding 2rem
  opacity 0.3
  text-align center
  font-style italic

.invisible
  visibility hidden
</style>
