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
  }
}