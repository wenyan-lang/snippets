<template>
<div class='snippet-preview'>
  <div class='header'>
    <span class='title'>{{snippet.title}}</span>
    <span class='author'>by {{snippet.author}}</span>
    <span class='id'>#{{snippet.id}}</span>

    <div class='right-aligned'>
      <icon-button @click.native="openAndRun" icon="play"/>
      <icon-button @click.native="edit" icon="pencil"/>
      <icon-button @click.native="fork" icon="source-fork"/>
    </div>
  </div>
  <pre class='preview cm-s-wenyan-light' ref='code'>
    {{snippet.code}}
  </pre>
  <div class='footer'>
    <span class='votes'>{{snippet.votes}}</span>

    <icon-button @click.native="voteUp" icon="thumb-up"/>
    <icon-button @click.native="voteDown" icon="thumb-down"/>

    <div class='right-aligned'>
      <span class='token'>{{snippet.token}}</span>
    </div>
  </div>
</div>
</template>

<script>
import { API } from '../api'
import IconButton from './IconButton.vue'

export default {
  name: 'SnippetPreview',
  components: {
    IconButton,
  },
  data() {
    return {
    }
  },
  props: {
    snippet: Object,
  },
  methods: {
    async voteUp() {
      const data = await API.vote(this.snippet.id, +1)
      this.update(data)
    },
    async voteDown() {
      const data = await API.vote(this.snippet.id, -1)
      this.update(data)
    },
    update(data) {
      this.$emit('update', data)
    },
    highlight() {
      // eslint-disable-next-line no-undef
      CodeMirror.runMode(this.snippet.code, 'wenyan', this.$refs.code);
    },
    openAndRun(){
      // TODO:
    },
    fork() {
      // TODO:
    },
    edit() {
      // TODO:
    }
  },
  mounted(){
    this.highlight()
  }
}
</script>

<style lang="stylus" scope>
.snippet-preview
  margin: 5px
  border-radius: 4px
  border: 1px solid gainsboro
  box-shadow: 1px 1px 1px rgba(0,0,0,0.1)
  overflow: hidden
  display: inline-block

  .header, .footer
    color grey
    font-size 12px
    background whitesmoke
    height 20px
    position relative
    padding 5px

    & > *
      vertical-align middle

    & > span
      line-height 20px

    .right-aligned
      position absolute
      right 0
      top 0
      padding 5px

      & > span
        line-height 20px

    .icon-button
      margin-top 0.1rem

  .header
    border-bottom 1px solid gainsboro
    
    .title
      color black
      padding 0 0.2rem

    .author
      font-style italic
      padding 0 0.2rem
    
    .id
      padding 0 0.2rem
      opacity 0.5

  .footer
    border-top 1px solid gainsboro

    .votes
      padding 0 0.3rem
      font-weight bold

    .token
      text-transform uppercase
      opacity 0.5

  .preview
    width: 100%
    height: 128px !important
    overflow: hidden
    padding: 5px
    margin: 0px
</style>
