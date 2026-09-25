import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const useShoppingStore = defineStore('shopping', {
  state: () => ({
    liste: [],
  }),

  actions: {
    async ucitajListe() {
      const { data } = await api.get('/popisi-kupovine')
      this.liste = data
    },

    ukloniZaZadatak(taskId) {
      this.liste = this.liste.filter((l) => l.article_id !== taskId)
    },

    async azurirajListu(listaId, izmjene) {
      const { data } = await api.patch(`/popisi-kupovine/${listaId}`, izmjene)
      const indeks = this.liste.findIndex((l) => l.id === listaId)
      if (indeks !== -1) this.liste[indeks] = { ...this.liste[indeks], ...data }

      // Keep the linked item's colour in sync immediately without reloading.
      if (data.article_id && izmjene.list_colour) {
        const { useTasksStore } = await import('./tasks-store')
        const tasksStore = useTasksStore()
        const zadatak = tasksStore.stavke.find((s) => s.id === data.article_id)
        if (zadatak) zadatak.colour = izmjene.list_colour
      }
    },

    async obrisiListu(listaId) {
      await api.delete(`/popisi-kupovine/${listaId}`)
      this.liste = this.liste.filter((l) => l.id !== listaId)
    },

    async dodajStavku(listaId, article, quantity = 1) {
      const { data } = await api.post(`/popisi-kupovine/${listaId}/stavke`, { article, quantity })
      const lista = this.liste.find((l) => l.id === listaId)
      if (lista) lista.stavke.push(data)
    },

    async oznaciKupljeno(stavkaId, listaId) {
      const lista = this.liste.find((l) => l.id === listaId)
      const stavka = lista?.stavke.find((s) => s.id === stavkaId)
      if (!stavka) return
      const { data } = await api.patch(`/popisi-kupovine/stavke/${stavkaId}`, {
        buy: !stavka.buy,
      })
      stavka.buy = data.buy
    },

    async ukloniStavku(listaId, stavkaId) {
      await api.delete(`/popisi-kupovine/stavke/${stavkaId}`)
      const lista = this.liste.find((l) => l.id === listaId)
      if (lista) lista.stavke = lista.stavke.filter((s) => s.id !== stavkaId)
    },
  },
})
