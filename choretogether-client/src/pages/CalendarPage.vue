<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">{{ t('kalendar.naslov') }}</div>
      <q-btn flat dense icon="chevron_left" @click="kalendarRef.prev()" />
      <div class="q-mx-sm text-subtitle1">{{ nazivMjeseca }}</div>
      <q-btn flat dense icon="chevron_right" @click="kalendarRef.next()" />
    </div>

    <q-calendar-month
      ref="kalendarRef"
      v-model="odabraniDatum"
      animated
      bordered
      :day-min-height="70"
      @moved="osvjeziNazivMjeseca"
    >
      <template #day="{ scope: { timestamp } }">
        <div class="q-pa-xs">
          <q-badge
            v-for="stavka in stavkeZaDan(timestamp.date)"
            :key="stavka.id"
            :color="bojaZnacke(stavka)"
            class="block ellipsis q-mb-xs"
            style="max-width: 100%"
          >
            {{ stavka.item }}
          </q-badge>
        </div>
      </template>
    </q-calendar-month>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar/QCalendarMonth'
import '@quasar/quasar-ui-qcalendar/QCalendarMonth.css'
import { useTasksStore } from '@/stores/tasks-store'

defineOptions({ components: { QCalendarMonth } })

const { t, locale } = useI18n()
const tasksStore = useTasksStore()
const kalendarRef = ref(null)
const odabraniDatum = ref(new Date().toISOString().slice(0, 10))
const nazivMjeseca = ref('')

function stavkeZaDan(datumString) {
  return tasksStore.stavke.filter((s) => s.item_date === datumString)
}

function bojaZnacke(stavka) {
  if (stavka.completed) return 'grey'
  return stavka.colour || 'blue'
}

function formatirajNazivMjeseca(godina, mjesec) {
  return new Date(godina, mjesec - 1, 1).toLocaleDateString(locale.value, {
    month: 'long',
    year: 'numeric',
  })
}

function osvjeziNazivMjeseca(podaci) {
  nazivMjeseca.value = formatirajNazivMjeseca(podaci.year, podaci.month)
}

onMounted(() => {
  const d = new Date()
  nazivMjeseca.value = formatirajNazivMjeseca(d.getFullYear(), d.getMonth() + 1)
})
</script>
