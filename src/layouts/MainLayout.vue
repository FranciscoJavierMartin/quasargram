<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-10" bordered>
      <q-toolbar class="constrain">
        <q-btn
          to="/camera"
          icon="eva-camera-outline"
          class="large-screen-only q-mr-sm"
          size="18px"
          flat
          round
          dense
        />
        <q-separator vertical spaced class="large-screen-only" />
        <q-toolbar-title class="text-grand-hotel text-bold">
          Quasargram
        </q-toolbar-title>
        <q-btn
          to="/"
          icon="eva-home-outline"
          class="large-screen-only"
          size="18px"
          flat
          round
          dense
        />
      </q-toolbar>
    </q-header>

    <q-footer class="bg-white " bordered>
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div v-if="showAppInstallBanner" class=" banner-container bg-primary">
          <div class="constrain">
            <q-banner inline-actions dense class="bg-primary text-white">
              <template v-slot:avatar>
                <q-avatar
                  color="white"
                  text-color="grey-10"
                  font-size="22px"
                  icon="eva-camera-outline"
                />
              </template>
              <b>Install Quasargram?</b>
              <template v-slot:action>
                <q-btn
                  @click="installApp"
                  dense
                  class="q-px-sm"
                  flat
                  label="Yes"
                />
                <q-btn
                  @click="hideAppInstallBanner"
                  dense
                  class="q-px-sm"
                  flat
                  label="Later"
                />
                <q-btn
                  @click="neverShowAppInstallBanner"
                  dense
                  class="q-px-sm"
                  flat
                  label="Never"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </transition>

      <q-tabs
        class="text-grey-10 small-screen-only"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-route-tab icon="eva-home-outline" to="/" exact />
        <q-route-tab icon="eva-camera-outline" to="/camera" />
      </q-tabs>
    </q-footer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import Vue from 'vue';

let deferredPrompt: any;

export default Vue.extend({
  name: 'MainLayout',
  data() {
    return {
      showAppInstallBanner: true,
    };
  },
  methods: {
    installApp() {
      this.showAppInstallBanner = false;

      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          this.neverShowAppInstallBanner();
        } else {
        }
      });
    },
    neverShowAppInstallBanner() {
      this.showAppInstallBanner = false;
      this.$q.localStorage.set('neverShowAppInstallBanner', true);
    },
    hideAppInstallBanner() {
      this.showAppInstallBanner = false;
    },
  },
  mounted() {
    let neverShowAppInstallBanner = this.$q.localStorage.getItem(
      'neverShowAppInstallBanner',
    );

    if (!neverShowAppInstallBanner) {
      window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();

        deferredPrompt = e;

        setTimeout(() => {
          this.showAppInstallBanner = true;
        }, 3000);
      });
    }
  },
});
</script>

<style lang="scss">
.q-footer {
  .q-tab__icon {
    font-size: 30px;
  }
}

.q-toolbar__title {
  @media (max-width: $breakpoint-xs-max) {
    text-align: center;
  }
  font-size: 30px;
}

.q-toolbar {
  @media (min-width: $breakpoint-sm-min) {
    height: 77px;
  }
}
</style>
