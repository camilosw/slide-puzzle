export interface ImageData {
  url: string;
  username: string;
  name: string;
}

export async function getRandomImage(debug: boolean) {
  if (debug) {
    return Promise.resolve({
      url: 'https://images.unsplash.com/photo-1660912663223-b57c233c15a8?ixid=MnwxMTcyNjV8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NzYzNTY5NTU&ixlib=rb-4.0.3&w=500&h=500&fit=crop&crop=faces',
      username: 'test',
      name: 'test',
    });
  }

  const response = await fetch('/api/random');
  if (!response.ok) {
    throw new Error('Could not load image');
  }
  return (await response.json()) as Promise<ImageData>;
}
