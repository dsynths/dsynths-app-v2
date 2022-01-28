module.exports = {
  exportPathMap: async function () {
    return {
      '/markets': {
        page: '/markets',
      },
      '/trade': {
        page: '/trade',
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
