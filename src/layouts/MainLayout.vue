<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="header text-black">
      <q-toolbar>
        <q-toolbar-title>
          <img class="header-logo cursor-pointer" src="~assets/logo.svg" @click="$router.push('/')" />
        </q-toolbar-title>

        <a href="https://t.me/jimtendo" target="_blank" title="Telegram">
          <img src="~assets/telegram-dark.svg" />
        </a>
        <a href="https://github.com/developers-cash/cashtags-server" target="_blank" title="Github">
          <img src="~assets/github-dark.svg" />
        </a>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition appear enter-active-class="animated fadeIn slower">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <footer class="footer">
      <div class="footer-inner">
        <div class="row">
          <div class="col-6">
            CashTags <span class="text-warning">ALPHA</span>
          </div>
          <div class="col-6 text-right">
            <a @click="tipModal = true" title="Tip">
              <img src="~assets/tip.svg" />
            </a>
            <a href="https://t.me/jimtendo" target="_blank" title="Telegram">
              <img src="~assets/telegram.svg" />
            </a>
            <a href="https://github.com/developers-cash/cashtags-server" target="_blank" title="Github">
              <img src="~assets/github.svg" />
            </a>
          </div>
        </div>
      </div>
    </footer>

    <q-dialog v-model="tipModal" @show="renderTipQR">
      <q-card>
        <q-card-section>
          <div class="text-h6">Tip</div>
        </q-card-section>

        <q-card-section>
          <p class="text-center">Thank you kindly</p>
          <div ref="qrCode"></div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

import QRCode from 'easyqrcodejs'

export default defineComponent({
  name: 'MainLayout',

  data () {
    return {
      tipModal: false,
      qr: null
    }
  },

  methods: {
    renderTipQR () {
      const qrEl = this.$refs.qrCode
      this.qr = new QRCode(qrEl, {
        text: 'bitcoincash:qrfvft8pm33ytevw5razgqkxgszzag0r7she55h23v',
        logo: '/bch.svg',
        logoBackgroundTransparent: true,
        quietZone: 10
      })
    }
  }
})
</script>

<style lang="scss">
  .header {
    background: #fff;
  }

  .header-logo {
    display: block;
    height: 60px;
    padding: 5px;
  }

  .header a {
    margin-right: 10px;
  }

  .header a img {
    width: 32px;
    height: 32px;
  }

  .footer {
    color: #fff;
    background: #333;
    padding: 10px;
  }

  .footer-inner {
    margin: auto;
    width: 1024px;
    max-width: 100%;
    font-size: 1.2em;
  }

  .footer-inner a {
    color: #fff;
    text-decoration: none;
  }

  .footer-inner a img {
    width: 24px;
    height: 24px;
    margin-right: 10px
  }
</style>
