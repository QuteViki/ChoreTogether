<template>
  <q-card style="width: 350px" class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ t('auth.registracija') }}</div>
    </q-card-section>

    <q-banner v-if="greska" class="bg-red-1 text-red q-mb-md">{{ greska }}</q-banner>

    <q-form @submit="posaljiRegistraciju">
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="ime"
          :label="t('auth.ime')"
          outlined
          :rules="[(val) => !!val || t('common.obavezno')]"
        />
        <q-input
          v-model="email"
          :label="t('auth.email')"
          type="email"
          outlined
          :rules="[(val) => !!val || t('common.obavezno')]"
        />
        <q-input
          v-model="lozinka"
          :label="t('auth.lozinka')"
          type="password"
          outlined
          :rules="[(val) => (val && val.length >= 6) || t('auth.minZnakova')]"
        />
      </q-card-section>

      <q-card-actions vertical>
        <q-btn
          type="submit"
          color="primary"
          :label="t('auth.registrirajSe')"
          :loading="ucitavanje"
        />
        <q-btn flat color="primary" :label="t('auth.imasRacun')" to="/auth/prijava" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const { t } = useI18n()
const ime = ref('')
const email = ref('')
const lozinka = ref('')
const greska = ref('')
const ucitavanje = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function posaljiRegistraciju() {
  greska.value = ''
  ucitavanje.value = true
  try {
    await authStore.registracija({ ime: ime.value, email: email.value, lozinka: lozinka.value })
    router.push('/kucanstvo')
  } catch (err) {
    greska.value = err.response?.data?.greska || t('auth.registracijaNeuspjela')
  } finally {
    ucitavanje.value = false
  }
}
</script>
