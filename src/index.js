import './css/styles.css';

import debounce from 'lodash.debounce';
import { fetchCountries } from './js/fetchCountries.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const DELAY = 300;
const inputCountry = document.querySelector('input#search-box');
const CountryList = document.querySelector('.list-country');
const CountryInfo = document.querySelector('.info-country');

const animateCSS = (element, animation, prefix = 'animate__') =>
  // create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
        event.stopPropagation();
        node.classList.remove(`${prefix}animated`, animationName);
        resolve('Animation ended');
        }
        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });

function cleanMarkup(ref) {
  ref.innerHTML = '';
}

function formatNumberToK(num) {
  if (num >= 1000000000)
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';

  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';

  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';

  return num;
}

function inputHandler(e) {
  const searchInput = e.target.value.trim();

  if (!searchInput) {
    cleanMarkup(CountryList);
    cleanMarkup(CountryInfo);
    return;
  }

  fetchCountries(searchInput)
    .then(data => {
      if (data.length > 20) {
        cleanMarkup(CountryList);
        cleanMarkup(CountryInfo);
        Notify.warning(
          'Too many matches found. Please enter a more specific name'
        );
        return;
      }
      renderMarkup(data);
    })
    .catch(err => {
      cleanMarkup(CountryList);
      cleanMarkup(CountryInfo);
      Notify.failure('Oops, there is no country with that name');
    });
}

function renderMarkup(data) {
  if (data.length === 1) {
    cleanMarkup(CountryList);
    const infoMarkup = createInfoMarkup(data);
    CountryInfo.innerHTML = infoMarkup;
  } else {
    cleanMarkup(CountryInfo);
    const listMarkup = createListMarkup(data);
    CountryList.innerHTML = listMarkup;

    const selectCountry = document.querySelectorAll('li');
    selectCountry.forEach(button => {
      button.addEventListener('click', event => {
        const indexCountry = event.currentTarget.dataset.name;

        const clickedCountry = data.filter(
          country => country.name.common === indexCountry
        );
        CountryInfo.innerHTML = createInfoMarkup(clickedCountry);
        animateCSS('.my-element', 'bounceOutLeft');
        setTimeout(() => {
          cleanMarkup(CountryList);
        }, 900);
      });
    });
  }
}

function createInfoMarkup(data) {
  const singleCountry = data[0];
  const { capital, flags, languages, name, region, population } = singleCountry;

  return `
  <li class="animate__animated animate__fadeInLeft animate__delay-1s">
        <h2>${name.official} - </h2>
        <h2><a href="http://wikipedia.org/wiki/${
    name.common
  }" target="_blank" rel="noopener noreferrer">${name.common}</a></h2>
        <p><span>Capital:</span> ${capital}<img src="${flags.svg}" alt="${
    name.common
  }"/></p>
        <p><span>Region:</span> ${region}</p>
        <p><span>Population:</span> ${formatNumberToK(population)}</p>
        <p><span>Languages:</span> ${Object.values(languages).join(', ')}</p>
        </li>`;
}

function createListMarkup(data) {
  return data
    .map(
      ({ name, flags }) =>
        `<li class="animate__animated animate__fadeInDown" data-name="${name.common}"><img src="${flags.svg}" alt="${name.common}"/>${name.common}</li>`
    )
    .join('');
}
inputCountry.addEventListener('input', debounce(inputHandler, DELAY));
