export interface ImageData {
  url: string;
  username: string;
  name: string;
}

export async function getRandomImage() {
  const response = await fetch('/api/random');
  if (!response.ok) {
    throw new Error('Could not load image');
  }
  return (await response.json()) as Promise<ImageData>;
}
