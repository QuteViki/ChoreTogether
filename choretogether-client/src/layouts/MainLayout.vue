<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawerOtvoren = !drawerOtvoren" />
        <q-toolbar-title>ChoreTogether</q-toolbar-title>
        <div v-if="authStore.korisnik" class="row items-center q-gutter-sm">
          <div class="text-caption">{{ authStore.korisnik.ime }}</div>
          <q-avatar size="28px">
            <img v-if="authStore.korisnik.profil_slika" :src="authStore.korisnik.profil_slika" />
            <q-icon v-else name="person" />
          </q-avatar>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOtvoren" show-if-above bordered>
      <q-list>
        <q-item
          v-for="link in linkovi"
          :key="link.putanja"
          :to="link.putanja"
          clickable
          v-ripple
          exact
        >
          <q-item-section avatar><q-icon :name="link.ikona" /></q-item-section>
          <q-item-section>{{ link.naziv }}</q-item-section>
        </q-item>
      </q-list>

      <q-list class="absolute-bottom">
        <q-separator />
        <q-item clickable v-ripple @click="odjava">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>{{ t('nav.odjava') }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-if="ucitano" />
      <div v-else class="flex flex-center" style="height: 60vh">
        <q-spinner size="3em" color="primary" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useShoppingStore } from '@/stores/shopping-store'
import { useTasksStore } from '@/stores/tasks-store'
import { useAuthStore } from '@/stores/auth-store'
import { useThemeStore } from '@/stores/theme-store'
import { useLocaleStore } from '@/stores/locale-store'

const { t } = useI18n()
const drawerOtvoren = ref(false)
const ucitano = ref(false)

const shoppingStore = useShoppingStore()
const tasksStore = useTasksStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const router = useRouter()

onMounted(async () => {
  themeStore.primijeniOdKorisnika(authStore.korisnik)
  localeStore.primijeniOdKorisnika(authStore.korisnik)
  await Promise.all([tasksStore.ucitajStavke(), shoppingStore.ucitajListe()])
  ucitano.value = true
})

const linkovi = computed(() => {
  const stavke = [
    { naziv: t('nav.pregled'), ikona: 'today', putanja: '/' },
    { naziv: t('nav.kalendar'), ikona: 'event', putanja: '/kalendar' },
    { naziv: t('nav.profil'), ikona: 'person', putanja: '/profil' },
    { naziv: t('nav.postavke'), ikona: 'settings', putanja: '/postavke' },
    { naziv: t('nav.statistika'), ikona: 'bar_chart', putanja: '/statistika' },
  ]
  if (shoppingStore.liste.length > 0) {
    stavke.splice(1, 0, { naziv: t('nav.kupovina'), ikona: 'shopping_cart', putanja: '/kupovina' })
  }
  return stavke
})

function odjava() {
  authStore.odjava()
  router.push('/auth/prijava')
}
</script>
