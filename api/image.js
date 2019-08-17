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

    const host = (req.headers && req.headers.host) || 'https://whereami.now.sh/'
    await page.goto(`https://${host}/${id}`)
    await page.addScriptTag({
      url: 'https://unpkg.com/retina-dom-to-image@2.5.6/src/dom-to-image.js'
    })

    await page.waitForSelector('.coord', { visible: true, timeout: 9999 })

    const dataUrl = await page.evaluate(() => {
      const config = {
        filter: n => {
          if (n.className && String(n.className).indexOf('share') > -1) {
            return false
          }
          return true
        }
      }

      return domtoimage.toPng(document.body, config)
    })

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
