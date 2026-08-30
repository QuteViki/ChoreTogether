<template>
  <q-card style="width: 350px" class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ t('auth.zaboravljenaLozinka') }}</div>
      <div class="text-caption text-grey-7 q-mt-sm">{{ t('auth.zaboravljenaLozinkaOpis') }}</div>
    </q-card-section>

    <q-banner v-if="greska" class="bg-red-1 text-red q-mb-md">{{ greska }}</q-banner>
    <q-banner v-if="poslano" class="bg-green-1 text-green-9 q-mb-md">{{ poruka }}</q-banner>

    <q-form v-if="!poslano" @submit="posaljiZahtjev">
      <q-card-section>
        <q-input
          v-model="email"
          :label="t('auth.email')"
          type="email"
          outlined
          :rules="[(val) => !!val || t('common.obavezno')]"
        />
      </q-card-section>

      <q-card-actions vertical>
        <q-btn
          type="submit"
          color="primary"
          :label="t('auth.posaljiPoveznicu')"
          :loading="ucitavanje"
        />
        <q-btn flat color="primary" :label="t('auth.natragNaPrijavu')" to="/auth/prijava" />
      </q-card-actions>
    </q-form>

    <q-card-actions v-else vertical>
      <q-btn flat color="primary" :label="t('auth.natragNaPrijavu')" to="/auth/prijava" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/boot/axios'

const { t } = useI18n()
const email = ref('')
const greska = ref('')
const poruka = ref('')
const ucitavanje = ref(false)
const poslano = ref(false)

async function posaljiZahtjev() {
  greska.value = ''
  ucitavanje.value = true
  try {
    const { data } = await api.post('/auth/zaboravljena-lozinka', { email: email.value })
    poruka.value = data.poruka
    poslano.value = true
  } catch (err) {
    greska.value = err.response?.data?.greska || t('auth.greskaOpca')
  } finally {
    ucitavanje.value = false
  }
}
</script>
