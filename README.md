# CashTags Frontend

This is the coe for the frontend. For backend see [Backend Repository](https://github.com/developers-cash/cashtags-server).

This service generates printable QR Codes (Payment URLs) whose value amounts can be specified in fiat (e.g. USD). When a user scans these QR Codes/Payment URLs into their wallet, the fiat amount specified is converted to its BCH equivalent using Coinbase Exchange Rates.

This helps mitigate BCH price volatility relative to fiat. If $1USD is the amount specified on the QR Code, this will always be converted to its BCH equivalent at the time the user scans it, meaning that in real-life self-serve scenarios the QR Codes will not need constant reprinting.

Note that this is basically just a proxy to [CashPayServer](https://github.com/developers-cash/cash-pay-server) to allow for the above use-case.

## Setup

Development

```
git clone https://github.com/developers-cash/cashtags-frontend
cd cashtags-frontend
npm install
API=http://URL_TO_CASHPAYSERVER quasar dev -m ssr
```

Building

```
git clone https://github.com/developers-cash/cashtags-frontend
cd cashtags-frontend
npm install
API=http://URL_TO_CASHPAYSERVER quasar build -m ssr
```

Environment variables:

```
API=https://v1.pay.infra.cash # URL to CashPayServer
```
