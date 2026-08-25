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
      this.liste = this.liste.filter((l) => l.stavka_id !== taskId)
    },

    async azurirajListu(listaId, izmjene) {
      const { data } = await api.patch(`/popisi-kupovine/${listaId}`, izmjene)
      const indeks = this.liste.findIndex((l) => l.id === listaId)
      if (indeks !== -1) this.liste[indeks] = { ...this.liste[indeks], ...data }

      // ako je popis vezan uz zadatak i mijenjala se boja, odmah uskladi
      // i boju zadatka u prikazu (bez čekanja na ponovno učitavanje)
      if (data.stavka_id && izmjene.boja) {
        const { useTasksStore } = await import('./tasks-store')
        const tasksStore = useTasksStore()
        const zadatak = tasksStore.stavke.find((s) => s.id === data.stavka_id)
        if (zadatak) zadatak.boja = izmjene.boja
      }
    },

    async obrisiListu(listaId) {
      await api.delete(`/popisi-kupovine/${listaId}`)
      this.liste = this.liste.filter((l) => l.id !== listaId)
    },

    async dodajStavku(listaId, naziv, kolicina = 1) {
      const { data } = await api.post(`/popisi-kupovine/${listaId}/stavke`, { naziv, kolicina })
      const lista = this.liste.find((l) => l.id === listaId)
      if (lista) lista.stavke.push(data)
    },

    async oznaciKupljeno(stavkaId, listaId) {
      const lista = this.liste.find((l) => l.id === listaId)
      const stavka = lista?.stavke.find((s) => s.id === stavkaId)
      if (!stavka) return
      const { data } = await api.patch(`/popisi-kupovine/stavke/${stavkaId}`, {
        kupljeno: !stavka.kupljeno,
      })
      stavka.kupljeno = data.kupljeno
    },

    async ukloniStavku(listaId, stavkaId) {
      await api.delete(`/popisi-kupovine/stavke/${stavkaId}`)
      const lista = this.liste.find((l) => l.id === listaId)
      if (lista) lista.stavke = lista.stavke.filter((s) => s.id !== stavkaId)
    },
  },
})
