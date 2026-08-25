import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    razdoblje: 'tjedan',
    poKorisniku: [],
    ukupnoZavrseno: 0,
    poZadatku: [],
    najviseProneseno: [],
    ucitavanje: false,
  }),

  actions: {
    async ucitaj(razdoblje = this.razdoblje) {
      this.ucitavanje = true
      try {
        const { data } = await api.get('/statistika', { params: { razdoblje } })
        this.razdoblje = data.razdoblje
        this.poKorisniku = data.poKorisniku
        this.ukupnoZavrseno = data.ukupnoZavrseno
        this.poZadatku = data.poZadatku
        this.najviseProneseno = data.najviseProneseno
      } finally {
        this.ucitavanje = false
      }
    },
  },
})
