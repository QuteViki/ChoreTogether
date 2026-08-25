<template>
  <q-page class="q-pa-md" style="max-width: 600px">
    <div class="text-h6 q-mb-md">{{ t('statistika.naslov') }}</div>
    <q-btn-toggle
      :model-value="statsStore.razdoblje"
      @update:model-value="promijeniRazdoblje"
      spread
      no-caps
      toggle-color="primary"
      color="grey-3"
      text-color="grey-8"
      :options="[
        { label: t('statistika.ovajTjedan'), value: 'tjedan' },
        { label: t('statistika.ovajMjesec'), value: 'mjesec' },
      ]"
      class="q-mb-lg"
    />
    <div v-if="statsStore.ucitavanje" class="flex flex-center q-pa-lg">
      <q-spinner size="2em" color="primary" />
    </div>
    <template v-else>
      <div v-if="statsStore.poKorisniku.length === 0" class="text-grey-6">
        {{ t('statistika.nemaClanova') }}
      </div>
      <div v-else class="column q-gutter-md q-mb-lg">
        <q-banner v-if="statsStore.ukupnoZavrseno === 0" class="bg-grey-3 text-grey-8">
          {{ t('statistika.nemaZavrsenih') }}
        </q-banner>
        <q-card v-for="(clan, indeks) in statsStore.poKorisniku" :key="clan.id" flat bordered>
          <q-card-section class="row items-center q-gutter-md">
            <q-avatar size="40px">
              <img v-if="clan.profil_slika" :src="clan.profil_slika" />
              <q-icon v-else name="person" color="grey-5" />
            </q-avatar>
            <div class="col">
              <div class="row items-center q-gutter-xs">
                <div class="text-subtitle1">{{ clan.ime }}</div>
                <q-icon
                  v-if="indeks === 0 && clan.broj_zavrsenih > 0"
                  name="emoji_events"
                  color="amber-8"
                  size="20px"
                />
                <q-icon
                  v-if="jeNajmanjiClan(clan, indeks)"
                  name="trending_down"
                  color="grey-6"
                  size="18px"
                />
              </div>
              <q-linear-progress
                :value="najviseZavrsenih > 0 ? clan.broj_zavrsenih / najviseZavrsenih : 0"
                color="primary"
                track-color="grey-3"
                rounded
                size="8px"
                class="q-mt-xs"
              />
            </div>
            <div class="text-h6">{{ clan.broj_zavrsenih }}</div>
          </q-card-section>
        </q-card>
      </div>
      <q-card v-if="statsStore.poZadatku.length > 0" flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">{{ t('statistika.najcesceNajmanjeNaslov') }}</div>
          <div class="row items-center q-gutter-sm q-mb-xs">
            <q-icon name="repeat" color="positive" />
            <div>
              {{ t('statistika.najcesce') }}:
              <strong>{{ statsStore.poZadatku[0].naziv }}</strong> ({{
                statsStore.poZadatku[0].broj
              }}×)
            </div>
          </div>
          <div v-if="najmanjeOdradjeni" class="row items-center q-gutter-sm">
            <q-icon name="hourglass_empty" color="grey-6" />
            <div>
              {{ t('statistika.najmanje') }}: <strong>{{ najmanjeOdradjeni.naziv }}</strong> ({{
                najmanjeOdradjeni.broj
              }}×)
            </div>
          </div>
        </q-card-section>
      </q-card>
      <q-card v-if="statsStore.najviseProneseno.length > 0" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">{{ t('statistika.top3Naslov') }}</div>
          <div class="text-caption text-grey-6 q-mb-sm">{{ t('statistika.top3Opis') }}</div>
          <q-list separator>
            <q-item v-for="(stavka, i) in statsStore.najviseProneseno" :key="stavka.naziv">
              <q-item-section avatar>
                <div class="text-weight-bold text-grey-6">#{{ i + 1 }}</div>
              </q-item-section>
              <q-item-section>{{ stavka.naziv }}</q-item-section>
              <q-item-section side>
                <q-badge color="negative"
                  >{{ stavka.broj }}× {{ t('statistika.preneseno') }}</q-badge
                >
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <div v-else class="text-grey-6">{{ t('statistika.nemaPrenesenih') }}</div>
    </template>
  </q-page>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatsStore } from '@/stores/stats-store'

const { t } = useI18n()
const statsStore = useStatsStore()
onMounted(() => {
  statsStore.ucitaj('tjedan')
})
const najviseZavrsenih = computed(() => statsStore.poKorisniku[0]?.broj_zavrsenih || 0)
const najmanjeOdradjeni = computed(() => {
  if (statsStore.poZadatku.length <= 1) return null
  return statsStore.poZadatku[statsStore.poZadatku.length - 1]
})
function promijeniRazdoblje(razdoblje) {
  statsStore.ucitaj(razdoblje)
}
function jeNajmanjiClan(clan, indeks) {
  if (statsStore.poKorisniku.length <= 1) return false
  const najmanje = statsStore.poKorisniku[statsStore.poKorisniku.length - 1].broj_zavrsenih
  return indeks === statsStore.poKorisniku.length - 1 && najmanje < najviseZavrsenih.value
}
</script>
