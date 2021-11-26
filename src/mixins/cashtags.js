import QRCode from 'easyqrcodejs'
import cashaddr from 'cashaddrjs'

const CashTagsMixin = {
  methods: {
    // Functionality
    async generatePaymentUrl (opts) {
      try {
        // Bitcoin.com Wallet Hack to only use safe characters
        const unsafeChars = /[^A-Za-z0-9]+/g

        // Shorten the 'to' address by removing prefix
        const shortenedTo = opts.to.replace('bitcoincash:', '')

        let params = `?to=${shortenedTo}&a=${opts.amount}${opts.currency}`

        if (opts.memo) {
          params += `&m=${opts.memo.replaceAll(unsafeChars, '-')}`
        }

        if (opts.memoPaid) {
          params += `&mp=${opts.memoPaid.replaceAll(unsafeChars, '-')}`
        }

        if (opts.webhook) {
          params += `&wh=${opts.webhook}`
        }

        if (opts.data) {
          params += `&d=${opts.data.replaceAll(unsafeChars, '-')}`
        }

        const url = `${opts.server}${encodeURIComponent(params)}`
        return `bitcoincash:?r=${url}`
      } catch (err) {
        console.log(err)
      }
    },

    async generateQrCode (paymentUrl, qrEl) {
      qrEl.innerHTML = ''

      return new Promise((resolve, reject) => {
        // eslint-disable-next-line
        new QRCode(qrEl, {
          text: paymentUrl,
          logo: '/bch.svg',
          logoBackgroundTransparent: true,
          quietZone: 10,
          onRenderingEnd: (opts, dataUrl) => {
            resolve(dataUrl)
          }
        })
      })
    },

    // Validations
    bitcoinComWalletCompat (val) {
      return !/[^A-Za-z0-9-]+/g.test(val) || 'Only alphanumeric and dash characters supported'
    },

    fieldRequired (val) {
      return (val.length) || 'Required Field'
    },

    validCashAddr (val) {
      try {
        cashaddr.decode(val)
        return true
      } catch (err) {
        return 'Invalid Cash Address'
      }
    },

    amountRequired (val) {
      return val > 0 || 'Invalid amount'
    },

    validUrl (val) {
      return !val.length || val.startsWith('https://') || val.startsWith('http://') || 'Invalid URL'
    }
  }
}

export default CashTagsMixin
