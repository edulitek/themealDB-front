const DEFAULT_LIMIT = 4;
let currentPage = 0;
let isFetchMore = false;
let noDataEl = document.getElementById('no-data');
let loadingEl = document.getElementById('loading-list');
let searchResultEl = document.getElementById('search-result');
let containerMeals = document.getElementById('container-meals');

function fetchMeals(search, page, limit = DEFAULT_LIMIT) {
  loadingEl.style.display = 'block';
  noDataEl.style.display = 'none';
  return fetch(
    `https://guarded-sierra-03505.herokuapp.com/search?s=${search}&page=${page}&limit=${limit}`
  ).then((resp) => resp.json())
  .then(resp => {
    currentPage = resp.page;
    return resp;
  });
}

function createListHtmlMeals(meals) {
  return meals
    .map((meal) => {
      let tags = [`<span class="badge badge-purple badge-tagged">#themealdb</span> `];
      if (meal.strTags) {
        tags = tags.concat(
          meal.strTags.split(',').map((tag) => {
            return `<span class="badge badge-purple badge-tagged">#${tag}</span> `;
          })
        );
      }

      return `<div class="card">
    <img
      src="${meal.strMealThumb}"
      width="200"
      height="200"
      class="card-img-top"
      alt="${meal.strMeal}"
    />
    <div class="meal-name">${meal.strMeal}</div>
    <div class="card-body">
      <div class="badges mb-2">${tags.join('')}</div>
      <h4>Instructions</h4>
      <p class="card-text">
        ${meal.strInstructions}
      </p>
      <i class="fab fa-youtube"></i> <a href="${meal.strYoutube}" target="_blank">${meal.strYoutube}</a>
    </div>
  </div>
  `;
    })
    .join('');
}

function allMeals() {
  fetchMeals('', 0).then((response) => {
    if (response.meals && response.meals.length > 0) {
      const innerHtml = createListHtmlMeals(response.meals);
      containerMeals.innerHTML = innerHtml;
      loadingEl.style.display = 'none';
      noDataEl.style.display = 'none';
    } else {
      noDataEl.style.display = 'block';
      loadingEl.style.display = 'none';
    }
  });
}

document.getElementById('search').addEventListener('keyup', searchMeal);
// search meal
let searchTimeout = null;
function searchMeal(e) {
  e.preventDefault();
  containerMeals.style.display = 'none';
  searchResultEl.style.display = 'none';
  noDataEl.style.display = 'none';
  loadingEl.style.display = 'block';

  const term = search.value.trim();
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    searchTimeout = null;

    fetchMeals(term, 0).then((response) => {
      const innerHtml = createListHtmlMeals(response.meals);
      if (response.meals && response.meals.length > 0) {
        containerMeals.innerHTML = innerHtml;
        containerMeals.style.display = 'grid';
        searchResultEl.style.display = 'block';
        loadingEl.style.display = 'none';

        if (term) {
          searchResultEl.innerHTML = `Search result for: <b>${term}</b>`;
        } else {
          searchResultEl.innerHTML = '';
        }
      } else {
        noDataEl.style.display = 'block';
        loadingEl.style.display = 'none';
      }
    });
  }, 500);
}

allMeals();

// Scroll Infinite - Pagination

function getDocumentHeight() {
  const body = document.body;
  const html = document.documentElement;

  return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
}

function getScrollTop() {
  return window.pageYOffset !== undefined
    ? window.pageYOffset
    : (document.documentElement || document.body.parentNode || document.body).scrollTop;
}

window.onscroll = function () {
  if (parseInt(getScrollTop()) < parseInt(getDocumentHeight() - window.innerHeight)) return;
  fetchMoreMeals();
};

function fetchMoreMeals() {
  if (isFetchMore) {
    return;
  }
  isFetchMore = true;
  currentPage += 1;
  fetchMeals('', currentPage)
    .then((response) => {
      isFetchMore = false;

      if (response.meals && response.meals.length > 0) {
        const innerHtml = createListHtmlMeals(response.meals);
        containerMeals.innerHTML += innerHtml;
        loadingEl.style.display = 'none';
        noDataEl.style.display = 'none';
      } else {
        noDataEl.style.display = 'block';
        loadingEl.style.display = 'none';
      }
    })
    .catch(() => {
      currentPage -= 1;
      isFetchMore = false;
      loadingEl.style.display = 'none';
      noDataEl.style.display = 'none';
    });
}
