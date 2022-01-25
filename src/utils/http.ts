export const makeHttpRequest = async function (
  url: string,
  options: {
    [x: string]: string
  } = {
    cache: 'no-cache',
  }
) {
  try {
    const response = await fetch(url, options)
    return await response.json()
  } catch (err) {
    console.error(`Error fetching ${url}: `, err)
    return null
  }
}
