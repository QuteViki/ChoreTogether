<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ t('statistika.naslov') }}</div>
      <q-btn-toggle
        v-model="razdoblje"
        no-caps
        toggle-color="primary"
        :options="[
          { label: t('statistika.tjedan'), value: 'tjedan' },
          { label: t('statistika.mjesec'), value: 'mjesec' },
        ]"
        @update:model-value="statsStore.ucitaj"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6" v-for="(clan, indeks) in statsStore.poKorisniku" :key="clan.id">
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center q-gutter-sm">
            <q-icon
              :name="
                indeks === 0
                  ? 'emoji_events'
                  : indeks === statsStore.poKorisniku.length - 1
                    ? 'trending_down'
                    : 'person'
              "
              :color="indeks === 0 ? 'amber' : 'grey'"
              size="28px"
            />
            <div class="col">
              <div class="text-subtitle1">{{ clan.ime }}</div>
              <q-linear-progress
                :value="
                  statsStore.ukupnoZavrseno ? clan.broj_zavrsenih / statsStore.ukupnoZavrseno : 0
                "
                color="primary"
                class="q-mt-xs"
              />
            </div>
            <div class="text-h6">{{ clan.broj_zavrsenih }}</div>
          </div>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md q-mt-md" v-if="statsStore.poZadatku.length">
      <div class="text-subtitle2">
        {{ t('statistika.najcesceOdradjen') }}: <b>{{ statsStore.poZadatku[0].naziv }}</b> ({{
          statsStore.poZadatku[0].broj
        }}×)
      </div>
      <div class="text-subtitle2 q-mt-xs">
        {{ t('statistika.najmanjeOdradjen') }}:
        <b>{{ statsStore.poZadatku[statsStore.poZadatku.length - 1].naziv }}</b>
        ({{ statsStore.poZadatku[statsStore.poZadatku.length - 1].broj }}×)
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md q-mt-md" v-if="statsStore.najviseProneseno.length">
      <div class="text-subtitle2 q-mb-sm">{{ t('statistika.top3Naslov') }}</div>
      <q-list dense>
        <q-item v-for="stavka in statsStore.najviseProneseno" :key="stavka.naziv">
          <q-item-section>{{ stavka.naziv }}</q-item-section>
          <q-item-section side>{{ stavka.broj }}×</q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatsStore } from '@/stores/stats-store'

const { t } = useI18n()
const statsStore = useStatsStore()
const razdoblje = ref('tjedan')

onMounted(() => statsStore.ucitaj(razdoblje.value))
</script>
