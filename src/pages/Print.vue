<template>
  <q-page style="background:#eee">
    <!-- Hero/Form -->
    <div class="hero">
      <div class="inner-page text-white q-pa-xl">
        <div class="hero-heading text-center q-mb-lg">
          <span class="text-primary">Cash</span>Tags Bulk Printing Tool
        </div>
        <div class="row flex flex-center">
          <div class="col-12 col-md-12">
            <q-form ref="form" @submit.prevent.stop="updateTags()" @validation-error="hasError = true">
              <p>
                The below can be used to print several CashTags onto a single A4 sheet of paper.
              </p>
              <ol>
                <li>Insert the address and the currency your CashTags should use below.</li>
                <li>Click the "Add Tag" button and modify your CashTags by clicking the Memo and the Amount text.</li>
                <li>Click the print button and cut out your CashTags.</li>
                <li>(Optional) Enable Kiosk Mode to monitor transactions as they occur in real-time</li>
              </ol>
              <div class="row q-col-gutter-md">
                <div class="col-8 col-md-6">
                  <q-input outlined bg-color="white" v-model="opts.to" label="Receiving Address" :rules="[fieldRequired, validCashAddr]" :hide-bottom-space="true" @blur="updateTags" />
                </div>
                <div class="col-4 col-md-3">
                  <currency-select v-model="opts.currency" @blur="updateTags" />
                </div>
                <div class="col-12 col-md-3 text-center">
                  <q-toggle :model-value="kioskMode" @click="toggleKioskMode()" class="q-mr-sm" size="lg">
                    Kiosk Mode
                  </q-toggle>
                  <q-btn flat round icon="help">
                    <q-tooltip>
                      Kiosk Mode allows you to monitor transactions as they are made in real-time
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
              <div v-if="kioskMode" class="q-mt-md q-mb-md">
                <div class="q-gutter-sm">
                  <q-btn label="Open Kiosk Link" icon="open_in_new" color="primary" size="sm" type="a" target="_blank" :href="kioskLink" />
                  <q-btn label="Copy Kiosk Link" icon="content_copy" color="primary" size="sm" @click="copyKioskLink" />
                </div>
              </div>
              <q-expansion-item
                expand-separator
                icon="expand_more"
                label="More Settings"
              >
                <div class="q-gutter-md">
                  <q-input outlined bg-color="white" v-model="opts.server" label="CashTags Server" :rules="[validUrl]" :hide-bottom-space="true" @blur="updateTags" />
                  <q-input outlined bg-color="white" v-model="opts.memoPaid" label="Memo to show after paid" :rules="[bitcoinComWalletCompat]" :hide-bottom-space="true" @blur="updateTags" />
                  <q-input outlined bg-color="white" v-model="opts.webhook" label="Webhook URL" :rules="[validUrl]" :hide-bottom-space="true" @blur="updateTags" hint="Do not touch or set this field unless you know what you are doing" />
                  <q-input outlined bg-color="white" v-model="opts.data" label="Webhook Metadata" :rules="[bitcoinComWalletCompat]" :hide-bottom-space="true" @blur="updateTags" hint="Metadata string to send with Webhook (e.g. 'Table-1')" />
                </div>
              </q-expansion-item>
            </q-form>
          </div>
        </div>
      </div>
    </div>

    <div ref="qrCode" style="display:none"></div>

    <div class="inner-page">

      <div class="actions row q-mb-lg">
        <q-btn label="Add Tag" icon="add" @click="addTag" color="primary" />
        <q-space />
        <q-btn label="Print" icon="print" @click="print()" color="primary" :disabled="hasError" />
      </div>

      <div class="paper-container">
        <div class="paper printable">
          <div>
            <q-no-ssr>
              <div v-for="(tag, i) in tags" :key="i" style="width:33.3%; float: left;">

                <!-- Individual tag -->
                <div class="tag relative-position">
                  <div class="text-subtitle1 q-pa-sm cursor-pointer">
                    {{ tag.opts.memo }} <q-icon name="edit" color="primary" class="no-print" />
                    <q-popup-edit v-model="tags[i].opts.memo" class="bg-dark text-white" v-slot="scope" @update:model-value="updateTag(i)" :validate="(val) => bitcoinComWalletCompat(val) === true">
                      <q-input dark color="white" v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" :rules="[bitcoinComWalletCompat]">
                        <template v-slot:append>
                          <q-icon name="edit" />
                        </template>
                      </q-input>
                    </q-popup-edit>
                  </div>

                  <a v-if="!hasError" :href="tag.result.paymentUrl">
                    <img :src="tag.result.image" />
                  </a>
                  <div v-else class="text-red">
                    <div><q-icon name="warning" style="font-size: 100px;" /></div>
                  </div>

                  <div class="text-subtitle1 q-pa-sm cursor-pointer">
                    {{ tag.opts.amount }}{{ opts.currency }} <q-icon name="edit" color="primary" class="no-print" />
                    <q-popup-edit v-model="tags[i].opts.amount" class="bg-dark text-white" v-slot="scope" @update:model-value="updateTag(i)" :validate="(val) => amountRequired(val) === true">
                      <q-input dark color="white" v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" :rules="[amountRequired]">
                        <template v-slot:append>
                          <q-icon name="edit" />
                        </template>
                      </q-input>
                    </q-popup-edit>
                  </div>

                  <q-btn @click="removeTag(i)" fab icon="remove" color="negative" padding="none" class="absolute no-print" style="top: 5px; right: 5px;" />
                </div>

              </div>
              <div style="clear:both;"></div>
            </q-no-ssr>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

import { defaults, omit } from 'lodash'

import CashTagsMixin from '../mixins/cashtags'
import CurrencySelect from '../components/CurrencySelect'

import { copyToClipboard } from 'quasar'

export default defineComponent({
  name: 'PageIndex',

  mixins: [CashTagsMixin],

  components: { CurrencySelect },

  data () {
    return {
      // Global Opts
      opts: {
        server: process.env.API,
        to: '',
        amount: 0,
        currency: 'USD',
        memo: 'Example-Item',
        memoPaid: '',
        webhook: '',
        data: ''
      },

      // CashTags
      tags: [],

      // Is there an error?
      hasError: false
    }
  },

  computed: {
    kioskMode () {
      return this.opts.webhook.startsWith(`${process.env.API}/wh/`)
    },

    kioskLink () {
      const id = this.opts.webhook.replace(`${process.env.API}/wh/`, '')
      return `${window.location.origin}/kiosk/${id}`
    }
  },

  mounted () {
    this.loadFromLocalStorage()
  },

  methods: {
    async addTag () {
      const tag = {
        opts: {
          memo: 'Example-Item',
          amount: '1',
          server: undefined,
          to: undefined,
          currency: undefined,
          memoPaid: undefined,
          webhook: undefined,
          data: undefined
        },
        result: {
          paymentUrl: '',
          image: ''
        }
      }

      this.tags.push(tag)

      await this.updateTag(this.tags.length - 1)
    },

    async removeTag (index) {
      this.tags.splice(index, 1)
    },

    async updateTag (index) {
      try {
        if (!await this.$refs.form.validate()) {
          throw new Error('Errors in form')
        }

        const tag = this.tags[index]
        tag.result.paymentUrl = await this.generatePaymentUrl(defaults({}, tag.opts, this.opts))
        tag.result.image = await this.generateQrCode(tag.result.paymentUrl, this.$refs.qrCode)
      } catch (err) {
        this.hasError = true
      }
    },

    async updateTags () {
      try {
        this.$q.loading.show()

        if (!await this.$refs.form.validate()) {
          throw new Error('Errors in form')
        }

        for (const i in this.tags) {
          await this.updateTag(i)
        }

        this.hasError = false
      } catch (err) {
        console.log(err)
        this.hasError = true
      } finally {
        this.$q.loading.hide()
      }
    },

    print () {
      window.print()
    },

    toggleKioskMode () {
      if (this.kioskMode) {
        this.opts.webhook = ''
        return
      }

      const makeId = (length) => {
        let result = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
      }

      const id = makeId(6)

      this.opts.webhook = `${process.env.API}/wh/${id}`
    },

    async copyKioskLink () {
      copyToClipboard(this.kioskLink)
        .then(() => {
          this.$q.notify('Kiosk Link copied to clipboard')
        })
        .catch(() => {
          // fail
        })
    },

    async loadFromLocalStorage () {
      if (window.localStorage) {
        const opts = window.localStorage.getItem('opts')
        if (opts) {
          this.opts = JSON.parse(opts)
        }

        const tags = window.localStorage.getItem('tags')
        if (tags) {
          this.tags = JSON.parse(tags)
        }

        if (this.tags.length) {
          setTimeout(() => {
            this.updateTags()
          }, 1000)
        }
      }
    },

    async saveToLocalStorage () {
      if (window.localStorage) {
        window.localStorage.setItem('opts', JSON.stringify(this.opts))
        window.localStorage.setItem('tags', JSON.stringify(this.tags.map(tag => {
          return omit(tag, ['paymentUrl', 'image'])
        })))
      }
    }
  },

  // Hacks to save state (Vuex is too painful for this)
  watch: {
    'opts.to' () {
      this.saveToLocalStorage()
    },
    'opts.server' () {
      this.saveToLocalStorage()
    },
    'opts.amount' () {
      this.saveToLocalStorage()
    },
    'opts.currency' () {
      this.saveToLocalStorage()
    },
    'opts.memo' () {
      this.saveToLocalStorage()
    },
    'opts.memoPaid' () {
      this.saveToLocalStorage()
    },
    'opts.webhook' () {
      this.saveToLocalStorage()
    },
    'opts.data' () {
      this.saveToLocalStorage()
    },
    tags: {
      handler () {
        this.saveToLocalStorage()
      },
      deep: true
    }
  }
})
</script>

<style lang="scss">
  .paper-container {
    overflow-x: auto;
  }

  .paper {
    width: 21cm;
    min-height: 29.7cm;
    padding: 2cm;
    margin: 1cm auto;
    border: 1px #D3D3D3 solid;
    border-radius: 5px;
    background: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }

  .tag {
    padding: 10px;
    text-align: center;
    border: 1px dashed #eee;

  }

  .tag img {
    display: block;
    width: 100%;
  }

  @media print {
    body {
      margin: 0;
      padding: 0;
    }

    .paper {
      margin: 0;
      border: initial;
      border-radius: initial;
      width: initial;
      min-height: initial;
      box-shadow: initial;
      background: initial;
      page-break-after: always;
      padding: 0;
    }

    .paper-container {
      overflow-x: visible;
    }

    .paper * {
      break-inside: avoid;
      page-break-before: auto;
      page-break-after: auto;
      page-break-inside: avoid;
      display: block;
    }

    header,
    footer, .footer,
    .hero,
    .actions,
    .no-print {
      display: none;
    }
  }
</style>
