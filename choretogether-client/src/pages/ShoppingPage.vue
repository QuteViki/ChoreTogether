<template>
  <q-page class="q-pa-md">
    <div v-if="shoppingStore.liste.length === 0" class="text-grey-6">
      {{ t('kupovina.nemaListi') }}
    </div>

    <div class="column q-gutter-md">
      <q-card v-for="lista in shoppingStore.liste" :key="lista.id" flat bordered>
        <div :class="klasaPozadine(lista.list_colour)">
          <q-card-section class="row items-center q-pb-none">
            <q-input
              v-model="lista.list_name"
              dense
              borderless
              input-class="text-h6 text-weight-medium"
              class="col"
              @blur="shoppingStore.azurirajListu(lista.id, { list_name: lista.list_name })"
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
            <div class="text-caption text-grey-7 q-mb-sm">
              {{ formatirajDatum(lista.list_date) }}
            </div>

            <div class="row q-gutter-xs q-mb-sm">
              <q-btn
                v-for="boja in paletaBoja"
                :key="boja"
                round
                dense
                size="sm"
                :color="boja"
                :icon="lista.list_colour === boja ? 'check' : ''"
                @click="odaberiBoju(lista, boja)"
              />
            </div>
          </q-card-section>
        </div>

        <q-card-section>
          <q-form @submit="posaljiNovuStavku(lista.id)" class="row q-col-gutter-sm items-center">
            <div class="col-10">
              <q-input
                v-model="noviNazivi[lista.id]"
                dense
                outlined
                :placeholder="t('kupovina.novaStavka')"
              />
            </div>
            <div class="col-2">
              <q-btn type="submit" dense flat round icon="add" color="primary" />
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-list separator>
          <q-item v-for="stavka in lista.stavke" :key="stavka.id">
            <q-item-section avatar>
              <q-checkbox
                :model-value="stavka.buy"
                @update:model-value="shoppingStore.oznaciKupljeno(stavka.id, lista.id)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label :class="{ 'text-strike text-grey-6': stavka.buy }">
                {{ stavka.article }}
                <span v-if="stavka.quantity > 1" class="text-grey-6"> × {{ stavka.quantity }}</span>
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
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useShoppingStore } from '@/stores/shopping-store'

const { t, locale } = useI18n()
const shoppingStore = useShoppingStore()
const $q = useQuasar()

const paletaBoja = ['blue', 'teal', 'deep-orange', 'purple', 'indigo', 'brown', 'pink']

const noviNazivi = reactive({})

function klasaPozadine(boja) {
  return $q.dark.isActive ? `bg-${boja}-10` : `bg-${boja}-1`
}

function odaberiBoju(lista, boja) {
  lista.list_colour = boja
  shoppingStore.azurirajListu(lista.id, { list_colour: boja })
}

async function posaljiNovuStavku(listaId) {
  const naziv = noviNazivi[listaId]
  if (!naziv) return
  await shoppingStore.dodajStavku(listaId, naziv)
  noviNazivi[listaId] = ''
}

function formatirajDatum(datumString) {
  if (!datumString) return ''
  const datumSamo = datumString.slice(0, 10)
  const [godina, mjesec, dan] = datumSamo.split('-').map(Number)
  const datum = new Date(godina, mjesec - 1, dan)
  return datum.toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
