module.exports = {
  exportPathMap: async function () {
    return {
      '/trade': {
        page: '/trade/[contract]',
      },
    }
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/trade[contract]',
        permanent: true,
      },
    ]
  },
}
