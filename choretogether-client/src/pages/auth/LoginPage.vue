<template>
  <q-card style="width: 350px" class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ t('auth.prijava') }}</div>
    </q-card-section>

    <q-banner v-if="greska" class="bg-red-1 text-red q-mb-md">{{ greska }}</q-banner>

    <q-form @submit="posaljiPrijavu">
      <q-card-section class="q-gutter-md">
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
          :rules="[(val) => !!val || t('common.obavezno')]"
        />
      </q-card-section>

      <q-card-actions vertical>
        <q-btn type="submit" color="primary" :label="t('auth.prijaviSe')" :loading="ucitavanje" />
        <q-btn
          flat
          dense
          color="grey-7"
          :label="t('auth.zaboravljenaLozinka')"
          to="/auth/zaboravljena-lozinka"
        />
        <q-btn flat color="primary" :label="t('auth.nemasRacun')" to="/auth/registracija" />
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
const email = ref('')
const lozinka = ref('')
const greska = ref('')
const ucitavanje = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function posaljiPrijavu() {
  greska.value = ''
  ucitavanje.value = true
  try {
    await authStore.prijava({ email: email.value, lozinka: lozinka.value })
    if (authStore.imaKucanstvo) {
      router.push('/')
    } else {
      router.push('/kucanstvo')
    }
  } catch (err) {
    greska.value = err.response?.data?.greska || t('auth.prijavaNeuspjela')
  } finally {
    ucitavanje.value = false
  }
}
</script>
