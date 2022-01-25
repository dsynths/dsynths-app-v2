module.exports = {
  exportPathMap: async function () {
    return {
      '/trade': {
        page: '/trade',
        query: { assetId: '', theme: '' },
      },
    }
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/trade',
        permanent: true,
      },
    ]
  },
}
