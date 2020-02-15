import { API } from '../api'

export const CommonMixin = {
  computed:{
    userToken() {
      return this.$store.state.user.token
    },
    userName() {
      return this.$store.state.user.name
    },
    draft: {
      get() {
        if (this.$store.state.draft.avaliable)
          return this.$store.state.draft
        return undefined
      },
      set(v) {
        if (v)
          this.$store.commit('saveDraft', v)
        else
          this.$store.commit('clearDraft')
      }
    }
  },
  methods: {
    gotoSnippet(id, snippet) {
      this.$router.push({ name: 'snippet', params: { id, snippet }})
    },
    setSnippetCache(snippet){
      this.$store.commit('updateSnippets', {[snippet.id]: snippet})
    },
    getSnippetFromCache(id) {
      return this.$store.state.temp.snippets[id]
    },
    async getSnippet(id) {
      const cache = this.getSnippetFromCache(id)
      if (cache)
        return cache
      
      try {
        return await API.get(id)
      } catch(e) {
        console.error(e)
        return undefined
      }
    }
  }
}