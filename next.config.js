module.exports = {
  exportPathMap: async function () {
    return {
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
