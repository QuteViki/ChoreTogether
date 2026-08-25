<template>
  <q-page class="q-pa-md">
    <div v-if="shoppingStore.liste.length === 0" class="text-grey-6">
      Trenutno nema aktivnih popisa za kupovinu.
    </div>

    <div class="column q-gutter-md">
      <q-card
        v-for="lista in shoppingStore.liste"
        :key="lista.id"
        flat
        bordered
        :class="klasaPozadine(lista.boja)"
      >
        <q-card-section class="row items-center q-pb-none">
          <q-input
            v-model="lista.naziv"
            dense
            borderless
            input-class="text-h6 text-weight-medium"
            class="col"
            @blur="shoppingStore.azurirajListu(lista.id, { naziv: lista.naziv })"
          />
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="grey-7"
            @click="shoppingStore.obrisiListu(lista.id)"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey-7 q-mb-sm">{{ formatirajDatum(lista.datum) }}</div>

          <div class="row q-gutter-xs q-mb-sm">
            <q-btn
              v-for="boja in paletaBoja"
              :key="boja"
              round
              dense
              size="sm"
              :color="boja"
              :icon="lista.boja === boja ? 'check' : ''"
              @click="odaberiBoju(lista, boja)"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-list separator>
          <q-item v-for="stavka in lista.stavke" :key="stavka.id">
            <q-item-section avatar>
              <q-checkbox
                :model-value="stavka.kupljeno"
                @update:model-value="shoppingStore.oznaciKupljeno(stavka.id, lista.id)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label :class="{ 'text-strike text-grey-6': stavka.kupljeno }">
                {{ stavka.naziv }}
                <span v-if="stavka.kolicina > 1" class="text-grey-6"> × {{ stavka.kolicina }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="grey-6"
                @click="shoppingStore.ukloniStavku(lista.id, stavka.id)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section>
          <q-form @submit="posaljiNovuStavku(lista.id)" class="row q-col-gutter-sm items-center">
            <div class="col-7">
              <q-input v-model="noviNazivi[lista.id]" dense outlined placeholder="Nova stavka" />
            </div>
            <div class="col-3">
              <q-input
                v-model.number="noveKolicine[lista.id]"
                dense
                outlined
                type="number"
                min="1"
                placeholder="Kol."
              />
            </div>
            <div class="col-2">
              <q-btn type="submit" dense flat round icon="add" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useShoppingStore } from '@/stores/shopping-store'

const shoppingStore = useShoppingStore()
const $q = useQuasar()

const paletaBoja = ['blue', 'teal', 'deep-orange', 'purple', 'indigo', 'brown', 'pink']

const noviNazivi = reactive({})
const noveKolicine = reactive({})

function klasaPozadine(boja) {
  return $q.dark.isActive ? `bg-${boja}-10` : `bg-${boja}-1`
}

function odaberiBoju(lista, boja) {
  lista.boja = boja
  shoppingStore.azurirajListu(lista.id, { boja })
}

async function posaljiNovuStavku(listaId) {
  const naziv = noviNazivi[listaId]
  if (!naziv) return
  const kolicina = noveKolicine[listaId] || 1
  await shoppingStore.dodajStavku(listaId, naziv, kolicina)
  noviNazivi[listaId] = ''
  noveKolicine[listaId] = null
}

function formatirajDatum(datumString) {
  if (!datumString) return ''
  const datumSamo = datumString.slice(0, 10)
  const [godina, mjesec, dan] = datumSamo.split('-').map(Number)
  const datum = new Date(godina, mjesec - 1, dan)
  return datum.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
