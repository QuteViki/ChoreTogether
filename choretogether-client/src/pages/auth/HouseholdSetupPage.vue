<template>
  <q-card style="width: 380px" class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ t('kucanstvo.naslov') }}</div>
      <div class="text-caption text-grey-7">{{ t('kucanstvo.opis') }}</div>
    </q-card-section>

    <q-banner v-if="greska" class="bg-red-1 text-red q-mb-md">{{ greska }}</q-banner>

    <q-tabs v-model="tab" class="text-primary" dense>
      <q-tab name="kreiraj" :label="t('kucanstvo.stvoriTab')" />
      <q-tab name="pridruzi" :label="t('kucanstvo.pridruziTab')" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="kreiraj">
        <q-form @submit="posaljiKreiranje" class="q-gutter-md">
          <q-input
            v-model="householdName"
            :label="t('kucanstvo.nazivLabel')"
            outlined
            :rules="[(val) => !!val || t('common.obavezno')]"
          />
          <q-btn
            type="submit"
            color="primary"
            :label="t('kucanstvo.stvori')"
            :loading="ucitavanje"
            class="full-width"
          />
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="pridruzi">
        <q-form @submit="posaljiPridruzivanje" class="q-gutter-md">
          <q-input
            v-model="kodPozivnice"
            :label="t('kucanstvo.kodLabel')"
            outlined
            :rules="[(val) => !!val || t('common.obavezno')]"
          />
          <q-btn
            type="submit"
            color="primary"
            :label="t('kucanstvo.pridruziSe')"
            :loading="ucitavanje"
            class="full-width"
          />
        </q-form>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/household-store'

const { t } = useI18n()
const tab = ref('kreiraj')
const householdName = ref('')
const kodPozivnice = ref('')
const greska = ref('')
const ucitavanje = ref(false)

const householdStore = useHouseholdStore()
const router = useRouter()

async function posaljiKreiranje() {
  greska.value = ''
  ucitavanje.value = true
  try {
    await householdStore.kreiraj(householdName.value)
    router.push('/')
  } catch (err) {
    greska.value = err.response?.data?.greska || t('kucanstvo.stvaranjeNeuspjelo')
  } finally {
    ucitavanje.value = false
  }
}

async function posaljiPridruzivanje() {
  greska.value = ''
  ucitavanje.value = true
  try {
    await householdStore.pridruzi(kodPozivnice.value)
    router.push('/')
  } catch (err) {
    greska.value = err.response?.data?.greska || t('kucanstvo.pridruzivanjeNeuspjelo')
  } finally {
    ucitavanje.value = false
  }
}
</script>
