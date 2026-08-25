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
      if (data.tip === 'zadatak') {
        await useShoppingStore().ucitajListe()
      }
    },

    async oznaciGotovo(stavka) {
      const { data } = await api.patch(`/stavke/${stavka.id}`, { gotovo: !stavka.gotovo })
      const indeks = this.stavke.findIndex((s) => s.id === stavka.id)
      if (indeks !== -1) this.stavke[indeks] = data
      if (data.gotovo) {
        useShoppingStore().ukloniZaZadatak(stavka.id)
      }
    },
    async azurirajBoju(stavka, boja) {
      const { data } = await api.patch(`/stavke/${stavka.id}`, { boja })
      const indeks = this.stavke.findIndex((s) => s.id === stavka.id)
      if (indeks !== -1) this.stavke[indeks] = data
    },

    async obrisiStavku(id) {
      await api.delete(`/stavke/${id}`)
      this.stavke = this.stavke.filter((s) => s.id !== id)
      // baza već briše povezani popis (ON DELETE CASCADE) — ovdje samo
      // uskladimo prikaz da popis odmah nestane i iz frontend stanja
      useShoppingStore().ukloniZaZadatak(id)
    },
  },
})
