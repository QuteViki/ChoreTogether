<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle2 q-mb-sm">{{ t('postavke.izgled') }}</div>
          <q-btn-toggle
            v-model="nacin"
            spread
            no-caps
            toggle-color="primary"
            :options="[
              { label: t('postavke.svijetla'), value: 'svijetla' },
              { label: t('postavke.tamna'), value: 'tamna' },
              { label: t('postavke.automatski'), value: 'auto' },
            ]"
            @update:model-value="themeStore.postaviNacin"
          />

          <div class="text-subtitle2 q-mt-md q-mb-sm">{{ t('postavke.bojaNaglaska') }}</div>
          <div class="row q-gutter-sm">
            <div
              v-for="stavka in BOJE_TEME"
              :key="stavka.kljuc"
              class="boja-krug cursor-pointer"
              :style="{ backgroundColor: stavka.boja }"
              @click="themeStore.postaviBoju(stavka.kljuc)"
            >
              <q-icon
                v-if="themeStore.boja === stavka.kljuc"
                name="check"
                color="white"
                size="18px"
              />
            </div>
          </div>

          <div class="text-subtitle2 q-mt-md q-mb-sm">{{ t('postavke.jezik') }}</div>
          <q-btn-toggle
            v-model="jezik"
            spread
            no-caps
            toggle-color="primary"
            :options="
              Object.entries(JEZICI).map(([vrijednost, oznaka]) => ({
                label: oznaka,
                value: vrijednost,
              }))
            "
            @update:model-value="localeStore.postaviJezik"
          />
        </q-card>

        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle2 q-mb-sm">{{ t('postavke.promjenaLozinke') }}</div>
          <q-input
            v-model="staraLozinka"
            type="password"
            :label="t('postavke.staraLozinka')"
            outlined
            dense
            class="q-mb-sm"
            autocomplete="new-password"
          />
          <q-input
            v-model="novaLozinka"
            type="password"
            :label="t('postavke.novaLozinka')"
            outlined
            dense
            class="q-mb-sm"
            autocomplete="new-password"
          />
          <q-btn :label="t('postavke.spremiLozinku')" color="primary" @click="promijeniLozinku" />
        </q-card>

        <q-card flat bordered class="q-pa-md" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-red-1'">
          <div class="text-subtitle1 text-red-9 q-mb-sm">{{ t('postavke.opasnaZona') }}</div>
          <div class="text-caption q-mb-sm">{{ t('postavke.opasnaZonaOpis') }}</div>
          <q-btn
            color="negative"
            outline
            :label="t('postavke.obrisiProfil')"
            @click="potvrdiBrisanje"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useThemeStore, BOJE_TEME } from '@/stores/theme-store'
import { useLocaleStore, JEZICI } from '@/stores/locale-store'

const { t } = useI18n()
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()

const nacin = ref(themeStore.nacin)
const jezik = ref(localeStore.jezik)
const staraLozinka = ref('')
const novaLozinka = ref('')

async function promijeniLozinku() {
  if (!staraLozinka.value || !novaLozinka.value) return
  try {
    await authStore.azurirajLozinku(staraLozinka.value, novaLozinka.value)
    $q.notify({ type: 'positive', message: t('postavke.lozinkaPromijenjena') })
    staraLozinka.value = ''
    novaLozinka.value = ''
  } catch {
    $q.notify({ type: 'negative', message: t('postavke.staraLozinkaNijeIspravna') })
  }
}

function potvrdiBrisanje() {
  $q.dialog({
    title: t('postavke.brisanjeNaslov'),
    message: t('postavke.brisanjePoruka'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await authStore.obrisiProfil()
    router.push('/auth/prijava')
  })
}
</script>

<style scoped>
.boja-krug {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
