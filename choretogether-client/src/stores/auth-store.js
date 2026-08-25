import { defineStore } from 'pinia'
import { api } from '@/boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    korisnik: JSON.parse(localStorage.getItem('korisnik') || 'null'),
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    jePrijavljen: (state) => !!state.token,
    imaKucanstvo: (state) => !!state.korisnik?.household_id,
  },

  actions: {
    async registracija(podaci) {
      const { data } = await api.post('/auth/registracija', podaci)
      this.postaviPrijavu(data)
    },

    async prijava(podaci) {
      const { data } = await api.post('/auth/prijava', podaci)
      this.postaviPrijavu(data)
    },

    postaviPrijavu(data) {
      this.korisnik = data.korisnik
      this.token = data.token
      localStorage.setItem('token', data.token)
      localStorage.setItem('korisnik', JSON.stringify(data.korisnik))
    },

    azurirajKorisnika(noviPodaci) {
      this.korisnik = { ...this.korisnik, ...noviPodaci }
      localStorage.setItem('korisnik', JSON.stringify(this.korisnik))
    },

    async azurirajIme(ime) {
      const { data } = await api.patch('/auth/ime', { ime })
      this.azurirajKorisnika(data)
    },

    async azurirajPostavkeTeme(izmjene) {
      const { data } = await api.patch('/auth/postavke', izmjene)
      this.azurirajKorisnika(data)
    },

    async azurirajLozinku(staraLozinka, novaLozinka) {
      await api.patch('/auth/lozinka', { staraLozinka, novaLozinka })
    },

    async azurirajProfilnu(slika) {
      const { data } = await api.patch('/auth/profilna', { slika })
      this.azurirajKorisnika(data)
    },

    async obrisiProfil() {
      await api.delete('/auth/profil')
      this.odjava()
    },

    odjava() {
      this.korisnik = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('korisnik')
    },
  },
})
