import { createApi } from 'unsplash-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.UNSPLASH_ACCESS_KEY) {
  throw new Error('UNSPLASH_ACCESS_KEY must be set');
}

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

export default function handler(_: VercelRequest, response: VercelResponse) {
  unsplash.photos
    .getRandom({
      topicIds: [
        'Fzo3zuOHN6w', // "Travel"
        '6sMVjTLSkeQ', // "Nature"
        'xHxYTMHLgOc', // "Street Photography"
        'Jpg6Kidl-Hk', // "Animals"
        'M8jVbLbTRws', // "Architecture & Interiors"
        'S4MKLAsBB74', // "Fashion & Beauty"
        'hmenvQhUmxM', // "Film"
        'towJZFskpGg', // "People"
        '_8zFHuhRhyo', // "Spirituality"
        'aeu6rL-j6ew', // "Business & Work"
        'Bn-DjrcBrwo', // "Athletics"
        '_hb-dl4Q-4U', // "Health & Wellness"
        'bDo48cUhwnY', // "Arts & Culture"
      ],
    })
    .then((result) => {
      console.log(
        '--- Remaining:',
        result.originalResponse.headers.get('x-ratelimit-remaining'),
      );
      if (result.errors) {
        response
          .status(result.originalResponse.status)
          .json({ errors: result.errors });
      } else {
        const image = Array.isArray(result.response)
          ? result.response[0]
          : result.response;
        response.status(200).json({
          url: image.urls.raw + '&w=500&h=500&fit=crop&crop=faces',
          username: image.user.username,
          name: image.user.name,
        });
      }
    });
}
