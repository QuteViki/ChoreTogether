<template>
  <q-page class="q-pa-md" style="max-width: 500px">
    <div class="text-h6 q-mb-md">{{ t('profil.naslov') }}</div>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="column items-center">
        <q-avatar size="96px" class="q-mb-sm">
          <img v-if="authStore.korisnik?.profil_slika" :src="authStore.korisnik.profil_slika" />
          <q-icon v-else name="person" size="64px" color="grey-5" />
        </q-avatar>

        <q-file
          v-model="odabranaDatoteka"
          :label="t('profil.promijeniSliku')"
          accept="image/*"
          dense
          outlined
          style="max-width: 260px"
          @update:model-value="ucitajSliku"
        />
        <div v-if="greskaSlika" class="text-negative text-caption q-mt-xs">{{ greskaSlika }}</div>

        <q-input
          v-model="ime"
          :label="t('profil.ime')"
          dense
          outlined
          class="full-width q-mt-md"
          @blur="spremiIme"
        />
        <div class="text-caption text-grey-7 q-mt-xs full-width">
          {{ authStore.korisnik?.email }}
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">{{ t('profil.kucanstvo') }}</div>
        <div v-if="householdStore.kucanstvo">
          <q-input
            v-model="nazivKucanstva"
            dense
            outlined
            :label="t('profil.nazivKucanstva')"
            @blur="spremiNazivKucanstva"
          />

          <div class="row items-center q-mt-sm q-gutter-sm">
            <div class="text-caption text-grey-7">{{ t('profil.pozivniKod') }}</div>
            <q-chip color="grey-3" text-color="black">{{
              householdStore.kucanstvo.invite_code
            }}</q-chip>
            <q-btn flat dense round icon="content_copy" size="sm" @click="kopirajKod" />
          </div>

          <div class="text-caption text-grey-7 q-mt-md q-mb-xs">{{ t('profil.clanovi') }}</div>
          <q-list separator>
            <q-item v-for="clan in householdStore.clanovi" :key="clan.id">
              <q-item-section avatar>
                <q-avatar size="32px">
                  <img v-if="clan.profil_slika" :src="clan.profil_slika" />
                  <q-icon v-else name="person" color="grey-5" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ clan.ime }}</q-item-label>
                <q-item-label caption>{{ clan.email }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>

    <q-btn
      color="negative"
      outline
      :label="t('profil.odjava')"
      icon="logout"
      class="full-width"
      @click="odjava"
    />
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useHouseholdStore } from '@/stores/household-store'

const { t } = useI18n()
const authStore = useAuthStore()
const householdStore = useHouseholdStore()
const router = useRouter()

const odabranaDatoteka = ref(null)
const greskaSlika = ref('')
const ime = ref(authStore.korisnik?.ime || '')
const nazivKucanstva = ref('')

onMounted(async () => {
  await householdStore.ucitaj()
  nazivKucanstva.value = householdStore.kucanstvo?.naziv || ''
})

watch(
  () => householdStore.kucanstvo?.naziv,
  (novi) => {
    if (novi !== undefined) nazivKucanstva.value = novi
  },
)

async function spremiIme() {
  if (!ime.value.trim() || ime.value === authStore.korisnik?.ime) return
  await authStore.azurirajIme(ime.value)
}

async function spremiNazivKucanstva() {
  if (!nazivKucanstva.value.trim() || nazivKucanstva.value === householdStore.kucanstvo?.naziv)
    return
  await householdStore.promijeniNaziv(nazivKucanstva.value)
}

function ucitajSliku(datoteka) {
  greskaSlika.value = ''
  if (!datoteka) return

  if (datoteka.size > 1.5 * 1024 * 1024) {
    greskaSlika.value = t('profil.slikaPrevelika')
    odabranaDatoteka.value = null
    return
  }

  const citac = new FileReader()
  citac.onload = async () => {
    try {
      await authStore.azurirajProfilnu(citac.result)
    } catch {
      greskaSlika.value = t('profil.slanjeSlikeNeuspjelo')
    } finally {
      odabranaDatoteka.value = null
    }
  }
  citac.readAsDataURL(datoteka)
}

function kopirajKod() {
  navigator.clipboard.writeText(householdStore.kucanstvo.invite_code)
}

function odjava() {
  authStore.odjava()
  router.push('/auth/prijava')
}
</script>
