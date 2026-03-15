import { createStore, type ActionContext } from 'vuex'
import type { User } from '../types'

export interface AuthState {
  accessToken: string | null
  accessExpiresAt: number
  user: User | null
}

type AuthContext = ActionContext<AuthState, { auth: AuthState }>

const auth = {
  namespaced: true,
  state: (): AuthState => ({
    accessToken: null,
    accessExpiresAt: 0,
    user: null,
  }),
  getters: {
    accessToken: (s: AuthState) => s.accessToken,
    accessExpiresAt: (s: AuthState) => s.accessExpiresAt,
    user: (s: AuthState) => s.user,
    isAuthenticated: (s: AuthState) => !!s.user,
  },
  mutations: {
    SET_ACCESS_TOKEN(s: AuthState, token: string | null) {
      s.accessToken = token
    },
    SET_ACCESS_EXPIRES_AT(s: AuthState, at: number) {
      s.accessExpiresAt = at
    },
    SET_USER(s: AuthState, user: User | null) {
      s.user = user
    },
    CLEAR_AUTH(s: AuthState) {
      s.accessToken = null
      s.accessExpiresAt = 0
      s.user = null
    },
  },
  actions: {
    setSession(
      { commit }: AuthContext,
      payload: {
        accessToken: string
        expiresInSec: number
        user: User
      }
    ) {
      commit('SET_ACCESS_TOKEN', payload.accessToken)
      commit(
        'SET_ACCESS_EXPIRES_AT',
        Date.now() + payload.expiresInSec * 1000
      )
      commit('SET_USER', payload.user)
    },
    clearSession({ commit }: AuthContext) {
      commit('CLEAR_AUTH')
    },
  },
}

export const store = createStore({
  modules: { auth },
})

export type RootState = { auth: AuthState }
