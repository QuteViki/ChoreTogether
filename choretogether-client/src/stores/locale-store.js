import { defineStore } from 'pinia'
import { i18n } from '@/boot/i18n'
import { useAuthStore } from './auth-store'

export const JEZICI = {
  hr: 'Hrvatski',
  'en-US': 'English',
}

export const useLocaleStore = defineStore('lokalizacija', {
  state: () => ({
    jezik: 'hr',
  }),
  actions: {
    primijeniZaGosta() {
      this.postaviJezikLokalno('hr')
    },
    primijeniOdKorisnika(korisnik) {
      if (!korisnik) return this.primijeniZaGosta()
      this.postaviJezikLokalno(korisnik.app_language || 'hr')
    },
    postaviJezikLokalno(jezik) {
      this.jezik = jezik
      i18n.global.locale.value = jezik
    },
    async postaviJezik(jezik) {
      this.postaviJezikLokalno(jezik)
      await useAuthStore().azurirajPostavkeTeme({ app_language: jezik })
    },
  },
})
