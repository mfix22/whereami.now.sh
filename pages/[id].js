import React from 'react'
import Head from 'next/head'

import IndexPage from './index'

class IdPage extends React.PureComponent {
  static async getInitialProps({ req, query }) {
    const [latitude, longitude, heading] = query.id
      .split(',')
      .map(s => (typeof s === 'string' ? s.trim() : s))

    if (latitude && longitude) {
      return {
        host: req.host,
        latitude,
        longitude,
        heading
      }
    }

    return {}
  }

  render() {
    const { latitude, longitude, heading, host } = this.props

    if (!latitude || !longitude) {
      return <IndexPage />
    }

    const latLng = `${latitude},${longitude}`
    return (
      <>
        <Head>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Where I am right now" />
          <meta name="twitter:description" content={`${latitude}, ${longitude}`} />
          <meta
            name="twitter:image"
            content={`https://${host || 'whereami.now.sh'}/api/image/${latLng}`}
          />
        </Head>
        <IndexPage
          initialPosition={{
            coords: {
              latitude,
              longitude,
              heading
            }
          }}
        />
      </>
    )
  }
}

export default IdPage
