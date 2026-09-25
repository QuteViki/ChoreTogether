import { defineStore } from 'pinia'
import { api } from '@/boot/axios'
import { useAuthStore } from './auth-store'

export const useHouseholdStore = defineStore('household', {
  state: () => ({
    kucanstvo: null,
    clanovi: [],
  }),

  actions: {
    async kreiraj(householdName) {
      const { data } = await api.post('/households/kreiraj', { household_name: householdName })
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

    async promijeniNaziv(householdName) {
      const { data } = await api.patch('/households', { household_name: householdName })
      this.kucanstvo = { ...this.kucanstvo, ...data }
    },
  },
})
