<template>
<div>
  <div class="nav">
    <label class="title">文言片語</label>
    <input class="search" placeholder="Search snippets..." v-model="searchText"/>
    <span @click="search" class="iconify" data-icon="mdi:search" data-inline="false"></span>
    <span @click="newSnippet" class="iconify" data-icon="mdi:plus" data-inline="false"></span>
  </div>
  <div class="showcase">
    <snippet-preview v-for="(s, idx) in snippets" :snippet="s" :key="idx" @update="data=>updateSnippet(idx, data)"/>
  </div>
  <spinner v-show="loading"/>
</div>
</template>

<script>
import { API } from '../api'
import SnippetPreview from './SnippetPreview.vue'
import Spinner from './Spinner.vue'

export default {
  name: 'Home',
  components: {
    SnippetPreview,
    Spinner,
  },
  data() {
    return {
      loading: true,
      searchText: '',
      snippets: {},
      page: 0,
      totalPage: -1,
    }
  },
  methods: {
    async fetch() {
      this.loading = true
      this.snippets = await API.getAll()
      this.loading = false
    },
    async search() {
      // TODO:
    },
    newSnippet() {
      // TODO:
    },
    updateSnippet(idx, snippet) {
      this.$set(this.snippets, idx, snippet)
    }
  },
  mounted(){
    this.fetch()
  }
}
</script>

<style lang="stylus">
.nav
  padding: 5px
  background: #f1f1f1
  border-bottom: 1px solid gainsboro
  position: fixed
  top: 0
  left: 0
  right: 0
  z-index: 100
  white-space: nowrap

  *
    vertical-align: middle

  .iconify 
    font-size: 1.5em
    margin: 0.3rem
    color: #444
    cursor: pointer

  .search
    margin: 0.5rem
    padding: 0.1rem 0.5rem
    font-size: 20px

  .title
    color: #777
    margin: 0.5rem 1rem
    font-size: 1.1em

.showcase
  margin-top: 3.6rem
  padding: 1rem
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr))
</style>
