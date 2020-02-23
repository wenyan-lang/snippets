import { API } from '../api'

export const CommonMixin = {
  computed: {
    userToken: {
      get() {
        return this.$store.state.user.token
      },
      set(token) {
        this.$store.commit('saveUser', {token})
      }
    },
    userName: {
      get () {
        return this.$store.state.user.name
      },
      set(name) {
        this.$store.commit('saveUser', {name})
      }
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
      
      return await API.get(id, this.userToken)
    },
    goHome() {
      if (this.$route.path !== '/')
        this.$router.push("/")
    },
  }
}