<template>
  <q-card style="width: 350px" class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ t('auth.resetirajLozinku') }}</div>
    </q-card-section>

    <q-banner v-if="!token" class="bg-red-1 text-red q-mb-md">{{
      t('auth.nedostajeToken')
    }}</q-banner>
    <q-banner v-if="greska" class="bg-red-1 text-red q-mb-md">{{ greska }}</q-banner>
    <q-banner v-if="uspjeh" class="bg-green-1 text-green-9 q-mb-md">{{
      t('auth.lozinkaPromijenjena')
    }}</q-banner>

    <q-form v-if="token && !uspjeh" @submit="posaljiReset">
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="novaLozinka"
          :label="t('auth.novaLozinka')"
          type="password"
          outlined
          :rules="[
            (val) => !!val || t('common.obavezno'),
            (val) => val.length >= 6 || t('auth.lozinkaKratka'),
          ]"
        />
        <q-input
          v-model="potvrdaLozinke"
          :label="t('auth.potvrdaLozinke')"
          type="password"
          outlined
          :rules="[(val) => val === novaLozinka || t('auth.lozinkeSeNePodudaraju')]"
        />
      </q-card-section>

      <q-card-actions vertical>
        <q-btn
          type="submit"
          color="primary"
          :label="t('auth.postaviNovuLozinku')"
          :loading="ucitavanje"
        />
      </q-card-actions>
    </q-form>

    <q-card-actions v-if="uspjeh" vertical>
      <q-btn color="primary" :label="t('auth.prijaviSe')" to="/auth/prijava" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { api } from '@/boot/axios'

const { t } = useI18n()
const route = useRoute()
const token = ref(route.query.token || '')
const novaLozinka = ref('')
const potvrdaLozinke = ref('')
const greska = ref('')
const ucitavanje = ref(false)
const uspjeh = ref(false)

async function posaljiReset() {
  if (novaLozinka.value !== potvrdaLozinke.value) return
  greska.value = ''
  ucitavanje.value = true
  try {
    await api.post('/auth/resetiraj-lozinku', {
      token: token.value,
      novaLozinka: novaLozinka.value,
    })
    uspjeh.value = true
  } catch (err) {
    greska.value = err.response?.data?.greska || t('auth.greskaOpca')
  } finally {
    ucitavanje.value = false
  }
}
</script>
