module.exports = {
  exportPathMap: async function () {
    return {
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
