import { defineStore } from 'pinia'
import { Dark, setCssVar } from 'quasar'
import { useAuthStore } from './auth-store'

export const BOJE_TEME = [
  { kljuc: 'plava', naziv: 'Plava', boja: '#1976D2' },
  { kljuc: 'zelena', naziv: 'Zelena', boja: '#21BA45' },
  { kljuc: 'ljubicasta', naziv: 'Ljubičasta', boja: '#9C27B0' },
  { kljuc: 'narancasta', naziv: 'Narančasta', boja: '#F2751B' },
  { kljuc: 'roza', naziv: 'Roza', boja: '#EC407A' },
  { kljuc: 'tirkizna', naziv: 'Tirkizna', boja: '#00ACC1' },
  { kljuc: 'crvena', naziv: 'Crvena', boja: '#b70c00' },
  { kljuc: 'siva', naziv: 'Siva', boja: '#a0a0a0' },
]

export const useThemeStore = defineStore('theme', {
  state: () => ({
    nacin: 'auto',
    boja: 'plava',
  }),

  actions: {
    primijeniZaGosta() {
      this.postaviNacinLokalno('auto')
      this.postaviBojuLokalno('plava')
    },

    primijeniOdKorisnika(korisnik) {
      this.postaviNacinLokalno(korisnik?.tema_nacin || 'auto')
      this.postaviBojuLokalno(korisnik?.tema_boja || 'plava')
    },

    postaviNacinLokalno(nacin) {
      this.nacin = nacin
      Dark.set(nacin === 'auto' ? 'auto' : nacin === 'tamna')
    },

    postaviBojuLokalno(kljuc) {
      const boja = BOJE_TEME.find((b) => b.kljuc === kljuc)
      if (!boja) return
      this.boja = kljuc
      setCssVar('primary', boja.boja)
    },

    async postaviNacin(nacin) {
      this.postaviNacinLokalno(nacin)
      await useAuthStore().azurirajPostavkeTeme({ tema_nacin: nacin })
    },

    async postaviBoju(kljuc) {
      this.postaviBojuLokalno(kljuc)
      await useAuthStore().azurirajPostavkeTeme({ tema_boja: kljuc })
    },
  },
})
