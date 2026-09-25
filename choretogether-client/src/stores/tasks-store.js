import { defineStore } from 'pinia'
import { api } from '@/boot/axios'
import { useShoppingStore } from './shopping-store'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    stavke: [],
  }),

  actions: {
    async ucitajStavke() {
      const { data } = await api.get('/stavke')
      this.stavke = data
    },

    async dodajStavku(nova) {
      const { data } = await api.post('/stavke', nova)
      this.stavke.push(data)
      if (data.item_type === 'zadatak') {
        await useShoppingStore().ucitajListe()
      }
    },

    async oznaciGotovo(stavka) {
      const { data } = await api.patch(`/stavke/${stavka.id}`, { completed: !stavka.completed })
      const indeks = this.stavke.findIndex((s) => s.id === stavka.id)
      if (indeks !== -1) this.stavke[indeks] = data
      if (data.completed) {
        useShoppingStore().ukloniZaZadatak(stavka.id)
      }
    },
    async azurirajBoju(stavka, colour) {
      const { data } = await api.patch(`/stavke/${stavka.id}`, { colour })
      const indeks = this.stavke.findIndex((s) => s.id === stavka.id)
      if (indeks !== -1) this.stavke[indeks] = data
    },

    async obrisiStavku(id) {
      await api.delete(`/stavke/${id}`)
      this.stavke = this.stavke.filter((s) => s.id !== id)
      // The database removes the linked list through ON DELETE CASCADE;
      // remove it from the frontend state immediately as well.
      useShoppingStore().ukloniZaZadatak(id)
    },
  },
})
