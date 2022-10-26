import { Block } from 'notiflix/build/notiflix-block-aio';

const COUNTRY_API_URL = 'https://restcountries.com/v3.1/name/';

function fetchCountries(name) {
  Block.standard('.js-element', {
    backgroundColor: 'rgba(255, 0, 0, 0)',
    svgSize: '56px',
  });
  return fetch(
    `${COUNTRY_API_URL}${name}?fields=name,capital,population,flags,languages,region`
  )
    .then(response => {
      if (response.status === 404) {
        return Promise.reject(
          new Error('Currently, restcountries page is not available')
        );
      }
      return response;
    })
    .then(response => response.json())
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      Block.remove('.js-element', 300);
    });
}

export { fetchCountries };