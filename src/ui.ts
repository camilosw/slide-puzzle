export function setUnsplashCredit(name: string, username: string) {
  const creditContainer = document.getElementById('unsplash-credit');
  const creditAuthor = document.getElementById('unsplash-user');
  if (creditContainer && creditAuthor) {
    creditAuthor.innerHTML = `<a href="https://unsplash.com/@${username}?utm_source=slide_puzzle&utm_medium=referral">${name}</a>`;
    creditContainer.classList.replace('hide', 'show');
  }
}
