<template>
  <q-page class="q-pa-md" style="max-width: 500px">
    <div class="text-h6 q-mb-md">{{ t('profil.naslov') }}</div>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="column items-center">
        <q-avatar size="96px" class="q-mb-sm">
          <img
            v-if="authStore.korisnik?.profile_picture"
            :src="authStore.korisnik.profile_picture"
          />
          <q-icon v-else name="person" size="64px" color="grey-5" />
        </q-avatar>

        <input
          ref="unosDatoteke"
          type="file"
          accept="image/*"
          class="hidden"
          @change="ucitajSliku"
        />
        <q-btn
          flat
          dense
          outline
          :label="t('profil.promijeniSliku')"
          icon="photo_camera"
          class="text-center"
          @click="unosDatoteke.click()"
        />
        <div v-if="greskaSlika" class="text-negative text-caption q-mt-xs">{{ greskaSlika }}</div>

        <q-input
          v-model="username"
          :label="t('profil.ime')"
          dense
          outlined
          class="full-width q-mt-md"
        >
          <template #append>
            <q-btn flat dense round icon="save" size="sm" @click="spremiIme" />
          </template>
        </q-input>
        <div class="text-caption text-grey-7 q-mt-xs full-width">
          {{ authStore.korisnik?.email }}
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">{{ t('profil.kucanstvo') }}</div>
        <div v-if="householdStore.kucanstvo">
          <q-input v-model="nazivKucanstva" dense outlined :label="t('profil.nazivKucanstva')">
            <template #append>
              <q-btn flat dense round icon="save" size="sm" @click="spremiNazivKucanstva" />
            </template>
          </q-input>

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
                  <img v-if="clan.profile_picture" :src="clan.profile_picture" />
                  <q-icon v-else name="person" color="grey-5" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ clan.username }}</q-item-label>
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

const unosDatoteke = ref(null)
const greskaSlika = ref('')
const username = ref(authStore.korisnik?.username || '')
const nazivKucanstva = ref('')

onMounted(async () => {
  await householdStore.ucitaj()
  nazivKucanstva.value = householdStore.kucanstvo?.household_name || ''
})

watch(
  () => householdStore.kucanstvo?.household_name,
  (novi) => {
    if (novi !== undefined) nazivKucanstva.value = novi
  },
)

async function spremiIme() {
  if (!username.value.trim() || username.value === authStore.korisnik?.username) return
  await authStore.azurirajIme(username.value)
}

async function spremiNazivKucanstva() {
  if (
    !nazivKucanstva.value.trim() ||
    nazivKucanstva.value === householdStore.kucanstvo?.household_name
  )
    return
  await householdStore.promijeniNaziv(nazivKucanstva.value)
}

function ucitajSliku(event) {
  const datoteka = event.target.files[0]
  greskaSlika.value = ''
  if (!datoteka) return

  if (datoteka.size > 1.5 * 1024 * 1024) {
    greskaSlika.value = t('profil.slikaPrevelika')
    event.target.value = ''
    return
  }

  const citac = new FileReader()
  citac.onload = async () => {
    try {
      await authStore.azurirajProfilnu(citac.result)
    } catch {
      greskaSlika.value = t('profil.slanjeSlikeNeuspjelo')
    } finally {
      event.target.value = ''
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
