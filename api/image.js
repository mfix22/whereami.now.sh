/* global domtoimage */
const chrome = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')

module.exports = async (req, res) => {
  const id = req.query.id

  const [latitude, longitude] = id.split(',').map(s => (typeof s === 'string' ? s.trim() : s))
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).end()
  }

  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless
  })

  try {
    const page = await browser.newPage()

    const host = (req.headers && req.headers.host) || 'https://whereamiright.now.sh/'
    await page.goto(`https://${host}/${id}`)
    await page.addScriptTag({
      url: 'https://unpkg.com/retina-dom-to-image@2.5.6/src/dom-to-image.js'
    })

    await page.waitForSelector('.coord', { visible: true, timeout: 9999 })

    const dataUrl = await page.evaluate(id => {
      const [latitude, longitude] = id.split(',').map(Number)

      function hex(x) {
        return Math.floor(x)
          .toString(16)
          .padStart(6, '0')
      }

      const color1 = hex((latitude + 90) * (16777215 / 180))
      const color2 = hex((longitude + 180) * (16777215 / 360))

      const gradient = `${
        color1 && color2 ? `linear-gradient(90deg, #${color1}, #${color2})` : 'black'
      }`

      const config = {
        filter: n => {
          if (n.className && String(n.className).indexOf('share') > -1) {
            return false
          }
          return true
        },
        bgcolor: gradient,
        style: {
          background: gradient,
          backgroundImage: gradient,
          'background-image': gradient
        }
      }

      return domtoimage.toPng(document.body, config)
    }, id)

    res.setHeader('Content-Type', 'image/png')
    const data = new Buffer(dataUrl.split(',')[1], 'base64')
    return res.send(data)
  } catch (e) {
    // eslint-disable-next-line
    console.error(e)
    return res.status(500).end()
  } finally {
    await browser.close()
  }
}
