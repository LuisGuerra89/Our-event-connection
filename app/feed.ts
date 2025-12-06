import { MetadataRoute } from 'next'

export default function feed(): MetadataRoute.MetadataRoute['feed'] {
  return {
    channel: [
      {
        title: 'Our Love Connection - Dating Events',
        description: 'Meet meaningful connections through carefully curated social events',
        link: 'https://ourloveconnection.com',
        language: 'en',
        copyright: 'Our Love Connection',
      },
    ],
  }
}
