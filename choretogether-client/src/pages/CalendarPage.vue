<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">Kalendar</div>
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
            {{ stavka.naziv }}
          </q-badge>
        </div>
      </template>
    </q-calendar-month>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar/QCalendarMonth'
import '@quasar/quasar-ui-qcalendar/QCalendarMonth.css'
import { useTasksStore } from '@/stores/tasks-store'

defineOptions({ components: { QCalendarMonth } })

const tasksStore = useTasksStore()
const kalendarRef = ref(null)
const odabraniDatum = ref(new Date().toISOString().slice(0, 10))
const nazivMjeseca = ref('')

function stavkeZaDan(datumString) {
  return tasksStore.stavke.filter((s) => s.datum === datumString)
}

function bojaZnacke(stavka) {
  if (stavka.gotovo) return 'grey'
  return stavka.boja || 'blue'
}

function osvjeziNazivMjeseca(podaci) {
  nazivMjeseca.value = `${podaci.month}. ${podaci.year}.`
}

onMounted(() => {
  const d = new Date()
  nazivMjeseca.value = `${d.getMonth() + 1}. ${d.getFullYear()}.`
})
</script>
