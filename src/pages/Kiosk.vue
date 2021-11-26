<template>
  <q-page :key="$route.path" style="background:#eee;">
    <div class="hero">
      <div class="inner-page text-white q-pa-xl text-center">
        <div class="hero-heading text-center q-mb-lg">
          <span class="text-primary">Cash</span>Tags Kiosk
        </div>
        <div class="text-mono text-h5 q-mb-md">Channel ID: {{ $route.params.channel }}</div>
        <div v-if="connected" class="text-primary">Connected and listening for transactions...</div>
        <div v-else class="text-warning">Connecting...</div>
      </div>
    </div>
    <!--<q-btn color="primary" label="Add" @click="addItem" />-->
    <div class="inner-page">
      <h4 v-if="!items.length" class="text-center text-grey">No transactions to display</h4>
      <div class="row q-col-gutter-md">
        <transition-group appear enter-active-class="animated zoomInLeft slow" leave-active-class="animated zoomOutRight slow">
          <div v-for="(item, i) in items" :key="item.broadcasted" class="col-12 col-md-4">
              <q-card v-touch-swipe.mouse.right="() => hide(i)">
                <q-card-section class="text-center">
                  <div class="text-h5 text-primary text-weight-bold">{{ item.memo }}</div>
                </q-card-section>

                <q-separator />

                <q-card-section>
                  <div class="row q-mb-lg">
                    <div class="col-6">
                      <q-chip color="info" text-color="white" size="md">{{ item.bchTotal }}Sats</q-chip>
                    </div>
                    <div class="col-6 text-right">
                      <q-chip color="primary" text-color="white" size="md">{{ item.total }}{{ item.currency }}</q-chip>
                    </div>
                  </div>
                  <div class="q-mb-lg text-center text-weight-bold text-grey">
                    <div class="text-h6">{{ item.memoPaid }}</div>
                    <div class="text-h6">{{ item.ref }}</div>
                  </div>
                  <div class="text-center text-subtitle2 text-grey">{{ item.ago }}</div>
                </q-card-section>

                <q-separator />

                <q-card-actions vertical>
                  <q-btn color="primary" flat @click="hide(i)">Hide</q-btn>
                </q-card-actions>
              </q-card>
          </div>
        </transition-group>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

import SocketIO from 'socket.io-client'

export default defineComponent({
  name: 'PageIndex',

  data () {
    return {
      server: null,
      websocket: null,
      items: [],
      connected: false
    }
  },

  computed: {
    channelUrl () {
      return `${process.env.API}/wh/${this.$route.params.channel}`
    }
  },

  mounted () {
    this.server = this.$route.query.server || process.env.API

    this.websocket = SocketIO(this.server, {
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 60
    })

    this.websocket.on('connect', () => {
      this.connected = true
    })

    this.websocket.on('disconnect', () => {
      this.connected = false
    })

    this.websocket.on('requested', this.onRequested)
    this.websocket.on('broadcasted', this.onBroadcasted)

    this.subscribeToChannel()

    setInterval(this.updateTimeAgo, 1000)
  },

  methods: {
    async subscribeToChannel () {
      this.websocket.emit('subscribe', {
        channel: this.$route.params.channel
      })
    },

    async onRequested (msg) {
      this.items.push(msg)
    },

    async onBroadcasted (msg) {
      this.items.push(msg)
    },

    async hide (index) {
      this.items.splice(index, 1)
    },

    // Probably a nicer way to do this?
    async updateTimeAgo () {
      const formatter = new Intl.RelativeTimeFormat(undefined, {
        numeric: 'auto'
      })

      const DIVISIONS = [
        { amount: 60, name: 'seconds' },
        { amount: 60, name: 'minutes' },
        { amount: 24, name: 'hours' },
        { amount: 7, name: 'days' },
        { amount: 4.34524, name: 'weeks' },
        { amount: 12, name: 'months' },
        { amount: Number.POSITIVE_INFINITY, name: 'years' }
      ]

      this.items.forEach(item => {
        let duration = (new Date(item.broadcasted) - new Date()) / 1000

        for (let i = 0; i <= DIVISIONS.length; i++) {
          const division = DIVISIONS[i]
          if (Math.abs(duration) < division.amount) {
            item.ago = formatter.format(Math.round(duration), division.name)
            return
          }
          duration /= division.amount
        }
      })
    },

    addItem () {
      this.items.push({
        memo: 'Example-Item',
        memoPaid: '#1000',
        currency: 'USD',
        total: 1,
        bchTotal: 1,
        broadcasted: new Date(),
        ago: 0
      })
    }
  }
})
</script>

<style lang="scss">

</style>
