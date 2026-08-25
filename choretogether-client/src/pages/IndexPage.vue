<template>
  <q-page class="q-pa-md">
    <q-form ref="formRef" @submit="posaljiNovuStavku" class="q-mb-lg">
      <div class="row q-col-gutter-sm items-start">
        <div class="col-12 col-sm-4">
          <q-input
            v-model="noviNaziv"
            label="Naziv"
            outlined
            dense
            :rules="[(val) => !!val || 'Obavezno']"
          />
        </div>
        <div class="col-6 col-sm-3">
          <q-input
            v-model="noviDatum"
            label="Datum"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || 'Obavezno']"
          />
        </div>
        <div class="col-6 col-sm-3">
          <q-select
            v-model="noviTip"
            :options="opcijeTipa"
            emit-value
            map-options
            label="Vrsta"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-2">
          <q-btn
            type="submit"
            color="primary"
            label="Dodaj"
            class="full-width"
            :loading="spremaSe"
          />
        </div>
      </div>

      <div class="row items-center q-gutter-xs q-mt-sm">
        <div class="text-caption text-grey-7 q-mr-sm">Boja:</div>
        <q-btn
          v-for="boja in paletaBoja"
          :key="boja"
          round
          dense
          size="sm"
          :color="boja"
          :icon="noviBoja === boja ? 'check' : ''"
          @click="noviBoja = boja"
        />
      </div>
    </q-form>

    <q-tabs v-model="prikaz" class="text-primary q-mb-md" dense align="left">
      <q-tab name="dan" label="Dan" />
      <q-tab name="tjedan" label="Tjedan" />
    </q-tabs>

    <q-tab-panels v-model="prikaz" animated>
      <q-tab-panel name="dan" class="q-pa-none">
        <div v-if="stavkeDanas.length === 0" class="text-grey-6 q-pa-md">Nemaš ništa za danas.</div>
        <q-list v-else bordered separator class="rounded-borders">
          <q-item v-for="stavka in stavkeDanas" :key="stavka.id">
            <q-item-section v-if="stavka.tip === 'zadatak'" avatar>
              <q-checkbox
                :model-value="stavka.gotovo"
                @update:model-value="tasksStore.oznaciGotovo(stavka)"
              />
            </q-item-section>
            <q-item-section v-else avatar>
              <q-icon name="celebration" color="orange" />
            </q-item-section>

            <q-item-section side>
              <q-btn flat round dense size="sm">
                <q-icon name="circle" :color="stavka.boja || 'blue'" size="14px" />
                <q-menu>
                  <div class="row q-pa-sm q-gutter-xs">
                    <q-btn
                      v-for="boja in paletaBoja"
                      :key="boja"
                      round
                      dense
                      size="sm"
                      :color="boja"
                      :icon="stavka.boja === boja ? 'check' : ''"
                      @click="tasksStore.azurirajBoju(stavka, boja)"
                    />
                  </div>
                </q-menu>
              </q-btn>
            </q-item-section>

            <q-item-section>
              <q-item-label :class="{ 'text-strike text-grey-6': stavka.gotovo }">
                {{ stavka.naziv }}
              </q-item-label>
              <q-item-label v-if="jeZaostalo(stavka)" caption class="text-negative">
                Zaostalo ({{ formatirajKratkiDatum(stavka.datum) }})
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="grey-6"
                @click="tasksStore.obrisiStavku(stavka.id)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="tjedan" class="q-pa-none">
        <div class="column q-gutter-md">
          <q-card v-for="kartica in tjedanKartice" :key="kartica.datumString" flat bordered>
            <q-card-section class="q-pb-none">
              <div class="text-subtitle1 text-weight-medium">{{ kartica.naziv }}</div>
              <div class="text-caption text-grey-6">{{ kartica.prikazDatuma }}</div>
            </q-card-section>

            <q-card-section v-if="kartica.stavke.length === 0" class="text-grey-6 text-caption">
              Nema stavki.
            </q-card-section>

            <q-list v-else separator>
              <q-item v-for="stavka in kartica.stavke" :key="stavka.id">
                <q-item-section v-if="stavka.tip === 'zadatak'" avatar>
                  <q-checkbox
                    :model-value="stavka.gotovo"
                    @update:model-value="tasksStore.oznaciGotovo(stavka)"
                  />
                </q-item-section>
                <q-item-section v-else avatar>
                  <q-icon name="celebration" color="orange" />
                </q-item-section>

                <q-item-section side>
                  <q-btn flat round dense size="sm">
                    <q-icon name="circle" :color="stavka.boja || 'blue'" size="14px" />
                    <q-menu>
                      <div class="row q-pa-sm q-gutter-xs">
                        <q-btn
                          v-for="boja in paletaBoja"
                          :key="boja"
                          round
                          dense
                          size="sm"
                          :color="boja"
                          :icon="stavka.boja === boja ? 'check' : ''"
                          @click="tasksStore.azurirajBoju(stavka, boja)"
                        />
                      </div>
                    </q-menu>
                  </q-btn>
                </q-item-section>

                <q-item-section>
                  <q-item-label :class="{ 'text-strike text-grey-6': stavka.gotovo }">
                    {{ stavka.naziv }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="grey-6"
                    @click="tasksStore.obrisiStavku(stavka.id)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useTasksStore } from '@/stores/tasks-store'

const tasksStore = useTasksStore()

const paletaBoja = ['blue', 'teal', 'deep-orange', 'purple', 'indigo', 'brown', 'pink']

const prikaz = ref('dan')
const noviNaziv = ref('')
const noviDatum = ref(danasnjiDatumString())
const noviTip = ref('zadatak')
const noviBoja = ref('blue')
const spremaSe = ref(false)
const formRef = ref(null)

const opcijeTipa = [
  { label: 'Zadatak', value: 'zadatak' },
  { label: 'Događaj', value: 'dogadaj' },
]

function danasnjiDatumString() {
  const d = new Date()
  return formatirajUString(d)
}

function formatirajUString(d) {
  const godina = d.getFullYear()
  const mjesec = String(d.getMonth() + 1).padStart(2, '0')
  const dan = String(d.getDate()).padStart(2, '0')
  return `${godina}-${mjesec}-${dan}`
}

function formatirajKratkiDatum(datumString) {
  const [godina, mjesec, dan] = datumString.slice(0, 10).split('-').map(Number)
  return new Date(godina, mjesec - 1, dan).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'numeric',
  })
}

function jeZaostalo(stavka) {
  return stavka.datum?.slice(0, 10) < danasnjiDatumString()
}

async function posaljiNovuStavku() {
  if (noviDatum.value < danasnjiDatumString()) {
    const potvrdjeno = window.confirm(
      `Datum ${formatirajKratkiDatum(noviDatum.value)} je već prošao. Želiš li ipak dodati ovu stavku?`,
    )
    if (!potvrdjeno) return
  }

  spremaSe.value = true
  try {
    await tasksStore.dodajStavku({
      naziv: noviNaziv.value,
      datum: noviDatum.value,
      tip: noviTip.value,
      boja: noviBoja.value,
    })
    noviNaziv.value = ''
    noviDatum.value = danasnjiDatumString()
    noviTip.value = 'zadatak'
    noviBoja.value = 'blue'
    await nextTick()
    formRef.value.resetValidation()
  } finally {
    spremaSe.value = false
  }
}

const stavkeDanas = computed(() => {
  const danas = danasnjiDatumString()
  return tasksStore.stavke.filter((s) => {
    const datumStavke = s.datum?.slice(0, 10)
    if (!datumStavke) return false
    if (datumStavke === danas) return true
    if (s.tip === 'zadatak' && !s.gotovo && datumStavke < danas) return true
    return false
  })
})

const tjedanKartice = computed(() => {
  const kartice = []
  for (let i = 0; i < 7; i++) {
    const datum = new Date()
    datum.setDate(datum.getDate() + i)
    const datumString = formatirajUString(datum)

    kartice.push({
      datumString,
      naziv: i === 0 ? 'Danas' : datum.toLocaleDateString('hr-HR', { weekday: 'long' }),
      prikazDatuma: datum.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long' }),
      stavke: tasksStore.stavke.filter((s) => s.datum?.slice(0, 10) === datumString),
    })
  }
  return kartice
})
</script>
