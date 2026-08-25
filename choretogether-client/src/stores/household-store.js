import { defineStore } from 'pinia'
import { api } from '@/boot/axios'
import { useAuthStore } from './auth-store'

export const useHouseholdStore = defineStore('household', {
  state: () => ({
    kucanstvo: null,
    clanovi: [],
  }),

  actions: {
    async kreiraj(naziv) {
      const { data } = await api.post('/households/kreiraj', { naziv })
      this.kucanstvo = data
      useAuthStore().azurirajKorisnika({ household_id: data.id })
    },

    async pridruzi(kod) {
      const { data } = await api.post('/households/pridruzi', { kod })
      this.kucanstvo = data
      useAuthStore().azurirajKorisnika({ household_id: data.id })
    },

    async ucitaj() {
      const { clanovi, ...kucanstvo } = (await api.get('/households/moje')).data
      this.kucanstvo = kucanstvo
      this.clanovi = clanovi
    },

    async promijeniNaziv(naziv) {
      const { data } = await api.patch('/households', { naziv })
      this.kucanstvo = { ...this.kucanstvo, ...data }
    },
  },
})
