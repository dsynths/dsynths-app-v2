module.exports = {
  exportPathMap: async function () {
    return {
      '/markets': {
        page: '/markets',
      },
      '/trade': {
        page: '/trade',
      },
      '/portfolio': {
        page: '/portfolio',
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
