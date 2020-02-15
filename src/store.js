import nanoid from 'nanoid'
import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    user: {
      name: '',
      token: '',
    },
    draft: {
      avaliable: false,
      title: '',
      code: '',
      token: '',
    },
    temp: {
      snippets: {}
    }
  },
  mutations: {
    init(state) {
      if (!state.user.token)
        state.user.token = nanoid(8)
    },
    saveUser(state, data) {
      Object.assign(state.user, data)
    },
    saveDraft(state, data) {
      Object.assign(state.draft, data)
      state.draft.avaliable = true
    },
    clearDraft(state){
      state.draft = {
        avaliable: false,
        title: '',
        code: '',
        token: '',
      }
    },
    updateSnippets(state, data) {
      Object.assign(state.temp.snippets, data)
      Vue.set(state.temp, 'snippets', state.temp.snippets)
    },
    invalidSnippet(state, id) {
      Vue.delete(state.temp.snippets, id)
    }
  },
  plugins: [
    createPersistedState({
      key: 'wenyan-snippets',
      reducer: (state) => ({...state, temp: undefined}),
    })
  ]
})