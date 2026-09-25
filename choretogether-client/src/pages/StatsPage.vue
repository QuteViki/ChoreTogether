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
        <q-card
          v-for="(clan, indeks) in statsStore.poKorisniku"
          :key="clan.id"
          flat
          bordered
          clickable
          v-ripple
          @click="otvoriDetalje(clan)"
        >
          <q-card-section class="row items-center q-gutter-md">
            <q-avatar size="40px">
              <img v-if="clan.profile_picture" :src="clan.profile_picture" />
              <q-icon v-else name="person" color="grey-5" />
            </q-avatar>
            <div class="col">
              <div class="row items-center q-gutter-xs">
                <div class="text-subtitle1">{{ clan.username }}</div>
                <q-icon
                  v-if="indeks === 0 && clan.count > 0"
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
                :value="najviseZavrsenih > 0 ? clan.count / najviseZavrsenih : 0"
                color="primary"
                track-color="grey-3"
                rounded
                size="8px"
                class="q-mt-xs"
              />
            </div>
            <div class="text-h6">{{ clan.count }}</div>
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
              <strong>{{ statsStore.poZadatku[0].item }}</strong> ({{
                statsStore.poZadatku[0].count
              }}×)
            </div>
          </div>
          <div v-if="najmanjeOdradjeni" class="row items-center q-gutter-sm">
            <q-icon name="hourglass_empty" color="grey-6" />
            <div>
              {{ t('statistika.najmanje') }}: <strong>{{ najmanjeOdradjeni.item }}</strong> ({{
                najmanjeOdradjeni.count
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
            <q-item v-for="(stavka, i) in statsStore.najviseProneseno" :key="stavka.item">
              <q-item-section avatar>
                <div class="text-weight-bold text-grey-6">#{{ i + 1 }}</div>
              </q-item-section>
              <q-item-section>{{ stavka.item }}</q-item-section>
              <q-item-section side>
                <q-badge color="negative"
                  >{{ stavka.count }}× {{ t('statistika.preneseno') }}</q-badge
                >
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <div v-else class="text-grey-6">{{ t('statistika.nemaPrenesenih') }}</div>
    </template>

    <q-dialog v-model="dialogOtvoren">
      <q-card style="min-width: 320px; max-width: 480px" class="full-width">
        <q-card-section class="row items-center q-gutter-sm">
          <q-avatar size="32px">
            <img v-if="odabraniClan?.profile_picture" :src="odabraniClan.profile_picture" />
            <q-icon v-else name="person" color="grey-5" />
          </q-avatar>
          <div class="text-subtitle1">{{ odabraniClan?.username }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-caption text-grey-6 q-mb-sm">{{ t('statistika.detaljiNaslov') }}</div>
          <div v-if="statsStore.ucitavanjeZadataka" class="flex flex-center q-pa-md">
            <q-spinner size="2em" color="primary" />
          </div>
          <div v-else-if="statsStore.zadaciClana.length === 0" class="text-grey-6">
            {{ t('statistika.nemaOdradjenih') }}
          </div>
          <q-list v-else separator>
            <q-item v-for="zadatak in statsStore.zadaciClana" :key="zadatak.id">
              <q-item-section avatar>
                <q-icon name="circle" :color="zadatak.colour || 'blue'" size="12px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ zadatak.item }}</q-item-label>
                <q-item-label caption>{{ formatirajDatum(zadatak.completed_at) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" :label="t('statistika.zatvori')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatsStore } from '@/stores/stats-store'

const { t, locale } = useI18n()
const statsStore = useStatsStore()

const dialogOtvoren = ref(false)
const odabraniClan = ref(null)

onMounted(() => {
  statsStore.ucitaj('tjedan')
})

const najviseZavrsenih = computed(() => statsStore.poKorisniku[0]?.count || 0)
const najmanjeOdradjeni = computed(() => {
  if (statsStore.poZadatku.length <= 1) return null
  return statsStore.poZadatku[statsStore.poZadatku.length - 1]
})

async function promijeniRazdoblje(razdoblje) {
  await statsStore.ucitaj(razdoblje)
  if (dialogOtvoren.value && odabraniClan.value) {
    statsStore.ucitajZadatkeClana(odabraniClan.value.id)
  }
}

function jeNajmanjiClan(clan, indeks) {
  if (statsStore.poKorisniku.length <= 1) return false
  const najmanje = statsStore.poKorisniku[statsStore.poKorisniku.length - 1].count
  return indeks === statsStore.poKorisniku.length - 1 && najmanje < najviseZavrsenih.value
}

function otvoriDetalje(clan) {
  odabraniClan.value = clan
  dialogOtvoren.value = true
  statsStore.ucitajZadatkeClana(clan.id)
}

function formatirajDatum(datumString) {
  if (!datumString) return ''
  return new Date(datumString).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>
