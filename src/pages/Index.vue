<template>
  <q-page>
    <!-- Hero/Form -->
    <div class="hero" style="background:#333">
      <div class="inner-page text-white q-pa-xl">
        <div class="hero-heading text-center q-mb-lg">
          <span class="text-italic">
            Bitcoin<span class="text-primary">Cash</span>
          </span>
          tags that maintain fiat exchange rates
        </div>
        <div class="row flex flex-center">
          <div class="col-12 col-md-6">
            <q-form @submit.prevent.stop="generate()" @validation-error="result.hasError = true">
              <p>
                Enter a receiving address and an amount with a currency-code supported by Coinbase.
                A QR Code will be generated that will maintain its BCH exchange rate over time.
              </p>
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input outlined bg-color="white" v-model="opts.memo" label="Memo on Invoice" :rules="[bitcoinComWalletCompat]" :hide-bottom-space="true" lazy-rules />
                </div>
                <div class="col-12">
                  <q-input outlined bg-color="white" v-model="opts.to" label="Receiving Address" :rules="[fieldRequired, validCashAddr]" :hide-bottom-space="true" />
                </div>
                <div class="col-6 col-md-4">
                  <q-input outlined bg-color="white" v-model.number="opts.amount" label="Amount" :rules="[amountRequired]" />
                </div>
                <div class="col-6 col-md-4">
                  <currency-select v-model="opts.currency" />
                </div>
                <div class="col-12 col-md-4">
                  <q-btn color="primary" label="Generate" type="submit" size="lg" class="full-width" />
                </div>
              </div>
              <q-expansion-item
                expand-separator
                icon="expand_more"
                label="More Settings"
              >
                <div class="q-gutter-md">
                  <q-input outlined bg-color="white" v-model="opts.server" label="CashTags Server" :rules="[validUrl]" :hide-bottom-space="true" />
                  <q-input outlined bg-color="white" v-model="opts.memoPaid" label="Memo to show after paid" :rules="[bitcoinComWalletCompat]" :hide-bottom-space="true" />
                  <q-input outlined bg-color="white" v-model="opts.webhook" label="Webhook URL" :rules="[validUrl]" :hide-bottom-space="true" hint="Do not touch or set this field unless you know what you are doing" />
                  <q-input outlined bg-color="white" v-model="opts.data" label="Webhook Metadata" :rules="[bitcoinComWalletCompat]" :hide-bottom-space="true" hint="Metadata string to send with Webhook (e.g. 'Table-1')" />
                </div>
              </q-expansion-item>
            </q-form>
          </div>
          <div class="col-12 col-md-6 text-center">
            <div v-show="!result.hasError">
              <a :href="result.paymentUrl">
                <div ref="qrCode"></div>
              </a>
              <div class="q-gutter-sm">
                <q-btn color="primary" label="Save Image" size="sm" class="q-mt-sm" type="a" :href="result.image" :download="result.filename" @click="saveImage" />
                <q-btn color="primary" label="Copy Link" size="sm" class="q-mt-sm" @click="copyLink" />
              </div>
            </div>
            <div v-show="result.hasError" class="text-red">
              <div><q-icon name="warning" style="font-size: 100px;" /></div>
              <div>You have errors in your form</div>
            </div>
          </div>
        </div>
        <div class="q-mt-md text-center">
          <q-btn to="/print" label="Try the Bulk Printing Tool" color="secondary" icon="double_arrow" class="text-black q-pl-lg q-pr-lg" no-caps rounded />
        </div>
      </div>
    </div>

    <div class="inner-page">

      <!-- What does this do? -->
      <div class="page-segment">
        <div class="page-heading">What does this do?</div>
        <p>This service generates printable QR Codes (Payment URLs) whose value amounts can be specified in fiat (e.g. USD). When a user scans these QR Codes/Payment URLs into their wallet, the fiat amount specified is converted to its BCH equivalent using Coinbase Exchange Rates.</p>
        <p>This helps mitigate BCH price volatility relative to fiat. If $1USD is the amount specified on the QR Code, this will always be converted to its BCH equivalent at the time the user scans it, meaning that in real-life self-serve scenarios the QR Codes will not need constant reprinting.</p>
        <p>Some examples of where this may be useful are given below:</p>
        <div class="examples q-mt-xl">
          <div class="row">
            <div class="col-12 col-md-4">
              <div class="example-heading">Market Stalls</div>
              <img src="~assets/market-stall.svg" />
              <p class="example-desc">A QR Code could be printed and attached to each product, allowing customers to self-serve.</p>
            </div>
            <div class="col-12 col-md-4">
              <div class="example-heading">Beer Fridge</div>
              <img src="~assets/beer-fridge.svg" />
              <p class="example-desc">A QR Code could be placed on a fridge encouraging beer-bandits to reimburse the cost of the beer(s) they stole.</p>
            </div>
            <div class="col-12 col-md-4">
              <div class="example-heading">Bills</div>
              <img src="~assets/paper-bill.svg" />
              <p class="example-desc">A QR Code could be placed on a bill with Webhook+Metadata to allow payment in BCH.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- API -->
      <div class="page-segment">
        <div class="page-heading">API</div>
        <div>
          <p>
            CashTags is just a URL with query parameters attached. For example:<br/>
            <code>https://v1.tags.infra.cash?to=<span class="text-positive">YOUR_ADDRESS</span>&amp;a=<span class="text-positive">10USD</span></code>
          </p>

          <p>The following URL Query Parameters are supported:</p>

          <div class="q-markup-table q-table__container q-table__card q-table--horizontal-separator q-table--no-wrap q-mb-lg">
            <table class="q-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Parameter</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>To</td>
                  <td>to</td>
                  <td>Bitcoin Cash Address that the funds should be sent to.</td>
                </tr>
                <tr>
                  <td>Amount</td>
                  <td>a</td>
                  <td>The amount to send with a currency code appended (if no currency code is given amount will be in sats).</td>
                </tr>
                <tr>
                  <td>Memo</td>
                  <td>m</td>
                  <td>
                    Memo to show on Invoice.<br/>
                    <span class="text-negative">(Unfortunately, it does not look the Bitcoin.com Wallet displays BIP70 Payment Request memos at this point in time)</span>
                  </td>
                </tr>
                <tr>
                  <td>Memo Paid</td>
                  <td>mp</td>
                  <td>
                    Memo to show once invoice is paid.<br/>
                    If set to "auto" will generate a reference number between 0-9999 which can be used as an order number for things like food-stands.<br/>
                    <span class="text-negative">(As with the above, it does not look the Bitcoin.com Wallet displays BIP70 PaymentAck memos at this point in time)</span>
                  </td>
                </tr>
                <tr>
                  <td>Webhook</td>
                  <td>wh</td>
                  <td>
                    An optional webhook URL that can be triggered when transaction is broadcasting/broadcast/confirmed.<br/>
                    Webhook is synchronous and the transaction will be aborted if a 200 response is not returned.
                  </td>
                </tr>
                <tr>
                  <td>Webhook Data</td>
                  <td>d</td>
                  <td>An optional data parameter that will be sent in the webhook above.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>To make it so that this QR Code can be opened with a Bitcoin Cash Wallet, this link should then be prefixed with the <span class="text-positive">bitcoincash:?r=</span> protocol handler and the <span class="text-blue">query parameters</span> URL Encoded (see <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent" target="_blank">encodeURIComponent</a>).</p>
          <p><code><span class="text-positive">bitcoincash:?r=</span>https://v1.tags.infra.cash<span class="text-blue">%3Fto%3Dqqx7mqmz2984s3p7r5wzhmm6lulrh3axl5pfsrgnm3%26a%3D1USD</span></code></p>
          <p>For those that would like to create their own custom flow (e.g. for bulk printing), the below Javascript snippet can be used.</p>

<pre class="code"><code>// USE DASHES INSTEAD OF SPACES FOR MEMO TO ENSURE COMPATIBILITY WITH BITCOIN.COM WALLET
function generateCashTagURL(to, amount, options = {}, server = 'https://v1.tags.infra.cash') {
  options = Object.assign({
    to: to,
    a: amount
  }, options)

  const url = new URL(server)

  Object.keys(options).forEach(param => {
    url.searchParams.append(param, options[param])
  })

  return `bitcoincash:${url.origin}${encodeURIComponent(url.searchParams.toString())}`
}</code></pre>

        </div>
      </div>

      <!-- How it works -->
      <div class="page-segment">
        <div class="page-heading">Under the hood</div>
        <div>
          <p>The link generates a BIP70/JSONPaymentProtocol invoice on-the-fly each time it is scanned (with the given address/amount) leveraging CashPayServer.</p>
          <p>This means that the amount given (e.g. 1USD) is converted as per the rates stored in CashPayServer which leverages CoinBase's exchange rates, refreshed every 5 minutes.</p>
          <p>Fundamentally, the endpoint generates an invoice using CashPayServer and then simply 'proxies' the response back to the user's wallet. All other interactions are handled by CashPayServer itself.</p>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="page-segment">
        <div class="page-heading">Disclaimer</div>
        <div>
          <p class="text-negative">No warranty of any form is provided. As such, this service should be used for testing purposes only. For those that wish to use it beyond test-cases, it is advised that you <a href="https://github.com/" target="_blank">self-host</a> an instance of both CashTags and CashPayServer.</p>
          <p>If you need help with this, feel free to <a href="https://t.me/jimtendo" target="_blank">contact me</a>.</p>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { copyToClipboard } from 'quasar'

import CashTagsMixin from '../mixins/cashtags'
import CurrencySelect from '../components/CurrencySelect'

export default defineComponent({
  name: 'PageIndex',

  mixins: [CashTagsMixin],

  components: { CurrencySelect },

  data () {
    return {
      opts: {
        server: process.env.API,
        to: process.env.DEFAULT_ADDRESS,
        amount: '1',
        currency: 'USD',
        memo: 'Example-Item',
        memoPaid: '',
        webhook: '',
        data: ''
      },
      result: {
        paymentUrl: '',
        filename: '',
        image: '',
        qr: null
      }
    }
  },

  mounted () {
    this.generate()
  },

  methods: {
    async generate () {
      this.result.paymentUrl = await this.generatePaymentUrl(this.opts)
      this.result.image = await this.generateQrCode(this.result.paymentUrl, this.$refs.qrCode)
      this.result.filename = `${this.opts.memo || this.opts.to}_${this.opts.amount}.png`
      this.result.hasError = false
    },

    async saveImage () {
      const qrEl = this.$refs.qrCode
      this.result.image = qrEl.firstChild.toDataURL('image/png')
    },

    async copyLink () {
      copyToClipboard(this.result.paymentUrl)
        .then(() => {
          this.$q.notify('Link copied to clipboard')
        })
        .catch(() => {
          // fail
        })
    }
  }
})
</script>

<style lang="scss">
  .page-heading {
    text-align: center;
    font-size: 32px;
    font-weight: bold;
    color: $primary;
    margin-bottom: 1em;
    font-family: 'Gloria Hallelujah', cursive;
  }

  .example-heading {
    text-align: center;
    font-size: 1.3em;
    margin-bottom: 1em;
    font-family: 'Gloria Hallelujah', cursive;
  }

  .examples img {
    max-width: 100%;
    padding: 20px;
  }

  .example-desc {
    font-size: 0.9em;
    padding: 0px 20px 0px 20px;
  }

  .code {
    background: #333;
    color: #fff;
    padding: 10px;
    font-size: 0.8em;
  }
</style>
