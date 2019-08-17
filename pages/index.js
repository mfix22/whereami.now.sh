import React from 'react'
import domToImage from 'retina-dom-to-image'

export const useGeoPosition = positionOptions => {
  const [position, setPosition] = React.useState(null)

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(p => setPosition(p), console.error, positionOptions)
  }, [positionOptions])

  React.useEffect(() => {
    const listener = navigator.geolocation.watchPosition(
      positionUpdate => setPosition(positionUpdate),
      console.error,
      positionOptions
    )

    return () => navigator.geolocation.clearWatch(listener)
  }, [positionOptions])

  return position
}

const opts = { enableHighAccuracy: true }

function fixed(x, n) {
  return Number(x).toFixed(n)
}
function hex(x) {
  return Math.floor(x)
    .toString(16)
    .padStart(6, '0')
}
const Home = () => {
  const position = useGeoPosition(opts)

  let color1
  let color2
  if (position) {
    // console.log(position.coords.heading)

    color1 = hex((position.coords.latitude + 90) * (16777215 / 180))
    color2 = hex((position.coords.longitude + 180) * (16777215 / 360))
  }

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(console.log, console.error, opts)
  }, [])

  return (
    <div className="container">
      <button
        className="share"
        onClick={() => {
          domToImage
            .toBlob(document.body, {
              filter: n => {
                if (n.className && String(n.className).indexOf('share') > -1) {
                  return false
                }
                return true
              }
              // style: {
              //   transform: `scale(2)`,
              //   'transform-origin': 'center'
              // },
              // width: document.body.offsetWidth * 2,
              // height: document.body.offsetHeight * 2
            })
            .then(data => window.URL.createObjectURL(data))
            .then(url => {
              const link = document.createElement('a')
              link.download = `whereiamrightnow.png`
              link.href = url
              document.body.appendChild(link)
              link.click()
              link.remove()
            })
        }}
      >
        Share
      </button>
      <div className="circle">
        {position ? (
          <div className="text">
            <div className="coord">{fixed(position.coords.latitude, 8)}</div>
            <div className="coord">{fixed(position.coords.longitude, 8)}</div>
          </div>
        ) : (
          <div className="text">Loading...</div>
        )}
      </div>
      <style jsx>
        {`
          .container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
          }
          button {
            position: absolute;
            appearance: none;
            border: 2px solid #111;
            background: transparent;
            top: 1rem;
            right: 2rem;
            font-size: 24px;
            color: #111;
            border-radius: 4px;
            cursor: pointer;
          }
          .circle {
            border-radius: 50%;
            border: 8px solid white;
            width: 80vh;
            height: 80vh;
            max-width: 80vw;
            max-height: 80vw;
          }
          .text {
            color: white;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 48px;
          }
          .coord {
            font-variant-numeric: tabular-nums;
            text-shadow: 0 1px 0 black;
          }
        `}
      </style>
      <style jsx global>
        {`
          body {
            margin: 0;
            padding: 0;
            background: black;
            background-image: ${color1 && color1
              ? `linear-gradient(${(position && position.coords && position.coords.heading) ||
                  '90'}deg, #${color1}, #${color2});`
              : 'black'};
            width: 100vw;
            height: 100vh;
            font-family: sans-serif;
          }
        `}
      </style>
    </div>
  )
}

export default Home
