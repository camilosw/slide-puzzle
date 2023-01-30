import { createApi } from 'unsplash-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!process.env.UNSPLASH_ACCESS_KEY) {
  throw new Error('UNSPLASH_ACCESS_KEY must be set');
}

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

export default function categories(_: VercelRequest, response: VercelResponse) {
  unsplash.topics
    .list({
      page: 1,
      perPage: 30,
    })
    .then((result) => {
      if (result.errors) {
        response
          .status(result.originalResponse.status)
          .json({ errors: result.errors });
      } else {
        response.status(200).json(
          result.response.results.map(({ id, title }) => ({
            id,
            title,
          })),
        );
      }
    });
}
