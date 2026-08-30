<template>
  <q-page class="q-pa-md">
    <q-form ref="formRef" @submit="posaljiNovuStavku" class="q-mb-lg">
      <div class="row q-col-gutter-sm items-start">
        <div class="col-12 col-sm-3">
          <q-input
            v-model="noviNaziv"
            :label="t('pregled.naziv')"
            outlined
            dense
            :rules="[(val) => !!val || t('common.obavezno')]"
          />
        </div>
        <div class="col-6 col-sm-2">
          <q-input
            v-model="noviDatum"
            :label="t('pregled.datum')"
            type="date"
            outlined
            dense
            :rules="[(val) => !!val || t('common.obavezno')]"
          />
        </div>
        <div class="col-6 col-sm-2">
          <q-select
            v-model="noviTip"
            :options="opcijeTipa"
            emit-value
            map-options
            :label="t('pregled.vrsta')"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-sm-3">
          <q-select
            v-model="noviDodijeljenoId"
            :options="opcijeClanova"
            emit-value
            map-options
            clearable
            outlined
            dense
            :label="t('pregled.dodijeljeno')"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar size="24px">
                    <img v-if="scope.opt.slika" :src="scope.opt.slika" />
                    <q-icon v-else name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12 col-sm-2">
          <q-btn
            type="submit"
            color="primary"
            :label="t('pregled.dodaj')"
            class="full-width"
            :loading="spremaSe"
          />
        </div>
      </div>

      <div v-if="prijedlozi.length > 0" class="row q-gutter-xs q-mt-sm">
        <q-chip
          v-for="prijedlog in prijedlozi"
          :key="prijedlog"
          clickable
          dense
          color="grey-3"
          text-color="grey-9"
          @click="odaberiPrijedlog(prijedlog)"
        >
          {{ prijedlog }}
        </q-chip>
      </div>

      <div class="row items-center q-gutter-xs q-mt-sm">
        <div class="text-caption text-grey-7 q-mr-sm">{{ t('pregled.boja') }}:</div>
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
      <q-tab name="dan" :label="t('pregled.dan')" />
      <q-tab name="tjedan" :label="t('pregled.tjedan')" />
    </q-tabs>

    <q-tab-panels v-model="prikaz" animated>
      <q-tab-panel name="dan" class="q-pa-none">
        <div v-if="stavkeDanas.length === 0" class="text-grey-6 q-pa-md">
          {{ t('pregled.nemaZaDanas') }}
        </div>
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
                {{ t('pregled.zaostalo') }} ({{ formatirajKratkiDatum(stavka.datum) }})
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
              {{ t('pregled.nemaStavki') }}
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
import { ref, computed, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/boot/axios'
import { useTasksStore } from '@/stores/tasks-store'
import { useAuthStore } from '@/stores/auth-store'

const { t, tm, locale } = useI18n()
const tasksStore = useTasksStore()
const authStore = useAuthStore()

const paletaBoja = ['blue', 'teal', 'deep-orange', 'purple', 'indigo', 'brown', 'pink']

const prikaz = ref('dan')
const noviNaziv = ref('')
const noviDatum = ref(danasnjiDatumString())
const noviTip = ref('zadatak')
const noviBoja = ref('blue')
const noviDodijeljenoId = ref(null)
const spremaSe = ref(false)
const formRef = ref(null)
const clanovi = ref([])

const opcijeTipa = computed(() => [
  { label: t('pregled.zadatak'), value: 'zadatak' },
  { label: t('pregled.dogadaj'), value: 'dogadaj' },
])

const opcijeClanova = computed(() =>
  clanovi.value.map((c) => ({ label: c.ime, value: c.id, slika: c.profil_slika })),
)

onMounted(async () => {
  try {
    const { data } = await api.get('/households/moje')
    clanovi.value = data.clanovi
  } catch {
    clanovi.value = []
  }
})

// Prijedlozi za brzo dodavanje: prvo osobna povijest (ono što je OVAJ
// korisnik ranije dodavao, poredano po učestalosti), a zatim generic
// baza prijedloga koja postoji od početka (za nove korisnike/kućanstva
// bez povijesti, ili dok ne popune sve slotove).
const prijedlozi = computed(() => {
  const mojId = authStore.korisnik?.id
  const upisano = noviNaziv.value.trim().toLowerCase()

  const brojac = new Map()
  if (mojId) {
    for (const s of tasksStore.stavke) {
      if (s.dodao_id !== mojId) continue
      const naziv = s.naziv?.trim()
      if (!naziv) continue
      brojac.set(naziv, (brojac.get(naziv) || 0) + 1)
    }
  }

  const osobni = [...brojac.entries()].sort((a, b) => b[1] - a[1]).map(([naziv]) => naziv)

  const generic = tm('pregled.prijedloziGeneric')

  const vecDodano = new Set(osobni.map((n) => n.toLowerCase()))
  const spojeno = [...osobni]
  for (const naziv of generic) {
    const kljuc = naziv.toLowerCase()
    if (vecDodano.has(kljuc)) continue
    vecDodano.add(kljuc)
    spojeno.push(naziv)
  }

  return spojeno
    .filter((naziv) => naziv.toLowerCase() !== upisano)
    .filter((naziv) => !upisano || naziv.toLowerCase().includes(upisano))
    .slice(0, 6)
})

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
  return new Date(godina, mjesec - 1, dan).toLocaleDateString(locale.value, {
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
      t('pregled.potvrdaProslogDatuma', { datum: formatirajKratkiDatum(noviDatum.value) }),
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
      dodijeljeno_id: noviDodijeljenoId.value,
    })
    noviNaziv.value = ''
    noviDatum.value = danasnjiDatumString()
    noviTip.value = 'zadatak'
    noviBoja.value = 'blue'
    noviDodijeljenoId.value = null
    await nextTick()
    formRef.value.resetValidation()
  } finally {
    spremaSe.value = false
  }
}

async function odaberiPrijedlog(prijedlog) {
  noviNaziv.value = prijedlog
  noviDodijeljenoId.value = authStore.korisnik?.id ?? null
  await posaljiNovuStavku()
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
      naziv:
        i === 0 ? t('pregled.danas') : datum.toLocaleDateString(locale.value, { weekday: 'long' }),
      prikazDatuma: datum.toLocaleDateString(locale.value, { day: 'numeric', month: 'long' }),
      stavke: tasksStore.stavke.filter((s) => s.datum?.slice(0, 10) === datumString),
    })
  }
  return kartice
})
</script>
