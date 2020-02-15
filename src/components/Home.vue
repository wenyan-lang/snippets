<template>
<div class="home">
  <div class="nav">
    <div class="nav-inner">
      <label class="title">文言片語</label>
      <input 
        v-model="searchText"
        @keypress.enter="search"
        class="search" 
        placeholder="Search snippets..." 
      />
      <icon-button @click="search" icon="search"/>
      <div class="right-aligned">
        <icon-button @click="newSnippet" icon="plus"/>
        <icon-button @click="showProfile = !showProfile" icon="account"/>
      </div>
    </div>
  </div>
  <div class="content" ref='content'>
    <template v-if="$route.path !== '/'">
    <div class="page">
      <router-view/>
    </div>
    </template>
    <template v-else>
      <div class="showcase">
        <snippet-preview 
          v-for="(s, idx) in (searchResult || snippets)" 
          :snippet="s" 
          :key="idx" 
          @update="data=>updateSnippet(idx, data)"
          @open="()=>{ editing = true; editingSnippet = s }"
        />
      </div>
      <spinner v-show="loading"/>
      <div class="end-of-pages" v-if='endOfPages'>you reached the end :)</div>
    </template>
  </div>
  <div class="modal" v-if="editing" @click='editing = false'>
    <div class="dialog" :class="{fullscreen: editingFullscreen}">
      <editor 
        :snippet="editingSnippet || undefined"
        @fullscreen="i => editingFullscreen = i"
      ></editor>
    </div>
  </div>
</div>
</template>

<script>
import { API } from '../api'
import SnippetPreview from './SnippetPreview.vue'
import Spinner from './Spinner.vue'
import IconButton from './IconButton.vue'
import Editor from './Editor.vue'

export default {
  name: 'Home',
  components: {
    SnippetPreview,
    Spinner,
    Editor,
    IconButton,
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
    }
  },
  computed: {
    endOfPages(){
      return this.page >= this.totalPages
    }
  },
  methods: {
    async fetchNext() {
      if (this.endOfPages || this.loading)
        return
      this.loading = true
      const { snippets, totalPages, page } = await API.getPage(this.page + 1)
      this.snippets.push(...snippets)
      this.totalPages = totalPages
      this.page = page
      this.loading = false
    },
    async search() {
      if (!this.searchText){
        this.searchResult = null
        return
      }
      this.searchResult = []
      this.loading = true
      const text = this.searchText
      const data = await API.search(text)
      if (text === this.searchText)
        this.searchResult = data
      this.loading = false
    },
    newSnippet() {
      this.editingSnippet = null
      this.editing = true
      console.log('hi')
    },
    updateSnippet(idx, snippet) {
      this.$set(this.snippets, idx, snippet)
    },
    clearSearch() {
      this.searchResult = null
      this.loading = false
      this.searchText = ''
    }
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
    searchText(){
      if (!this.searchText)
        this.clearSearch()
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
    height 100%
    overflow auto

  .showcase
    padding: 1rem
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr))
    max-width $max-width
    margin 0.5rem auto

.nav
  background: #f1f1f1
  border-bottom: 1px solid gainsboro
  white-space: nowrap

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
    padding: 0.1rem 0.5rem
    font-size: 20px

  .title
    color: #777
    margin: 0.5rem 1rem
    font-size: 1.1em

.modal
  z-index 2
  position fixed
  left 0
  top 0
  bottom 0
  right 0
  background rgba(0,0,0,0.6)
  
  .dialog
    position absolute
    left 5rem
    top 5rem
    bottom 5rem
    right 5rem
    border-radius 5px
    overflow hidden

    &.fullscreen
      left 0
      top 0
      bottom 0
      right 0
      height 100vh
      border-radius 0

.end-of-pages
  padding 2rem
  opacity 0.3
  text-align center
  font-style italic
</style>
