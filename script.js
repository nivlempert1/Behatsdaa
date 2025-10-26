const RETAILERS_JSON_PATH = 'data/aggregations/retailers-enriched.json';
const CARTS_JSON_PATH = 'data/aggregations/carts.json';

const state = {
  retailers: [],
  carts: {},
  filteredRetailers: [],
  categories: [],
  activeCategory: null
};

async function fetchData() {
  try {
    state.retailers = await fetchRetailers();
    const cartsData = await fetchCarts();

    state.carts = processCartsData(cartsData);
    extractCategories();
    state.filteredRetailers = [...state.retailers];

    displayRetailers();
    renderCategoryButtons();
    initializeSearch();
  } catch (error) {
    showErrorMessage(error);
  }
}

function extractCategories() {
  const categoriesSet = new Set();
  state.retailers.forEach(retailer => {
    if (retailer.categories && retailer.categories.length > 0) {
      retailer.categories.forEach(category => categoriesSet.add(category));
    }
  });
  state.categories = Array.from(categoriesSet).sort();
}

function renderCategoryButtons() {
  const searchContainer = document.querySelector('.search-container');
  const categoryButtonsContainer = createCategoryButtonsContainer();

  categoryButtonsContainer.appendChild(createAllCategoryButton());
  appendCategoryButtons(categoryButtonsContainer);

  searchContainer.appendChild(categoryButtonsContainer);
}

function createCategoryButtonsContainer() {
  const container = document.createElement('div');
  container.className = 'category-buttons';
  return container;
}

function createAllCategoryButton() {
  const allButton = document.createElement('button');
  allButton.textContent = 'All';
  allButton.className = 'category-button active';
  allButton.addEventListener('click', () => filterByCategory(null, allButton));
  return allButton;
}

function appendCategoryButtons(container) {
  state.categories.forEach(category => {
    container.appendChild(createCategoryButton(category));
  });
}

function createCategoryButton(category) {
  const button = document.createElement('button');
  button.textContent = category;
  button.className = 'category-button';
  button.addEventListener('click', () => filterByCategory(category, button));
  return button;
}

function filterByCategory(category, clickedButton) {
  state.activeCategory = category;
  updateActiveButton(clickedButton);
  applyFilters();
}

function updateActiveButton(clickedButton) {
  document.querySelectorAll('.category-button').forEach(button => {
    button.classList.remove('active');
  });
  clickedButton.classList.add('active');
}

function displayRetailers() {
  const retailersContainer = document.getElementById('retailers-container');
  retailersContainer.innerHTML = '';

  if (state.filteredRetailers.length === 0) {
    showNoResultsMessage(retailersContainer);
    return;
  }

  state.filteredRetailers.forEach(retailer => {
    retailersContainer.appendChild(createRetailerCard(retailer));
  });
}

function handleSearch() {
  applyFilters();
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  state.filteredRetailers = state.retailers.filter(retailer => {
    if (!matchesActiveCategory(retailer)) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    return matchesSearchTerm(retailer, searchTerm);
  });

  displayRetailers();
}

function matchesActiveCategory(retailer) {
  if (!state.activeCategory) {
    return true;
  }
  return retailer.categories && retailer.categories.includes(state.activeCategory);
}

function matchesSearchTerm(retailer, searchTerm) {
  if (retailer.name.toLowerCase().includes(searchTerm)) {
    return true;
  }

  if (containsTermInArray(retailer.categories, searchTerm)) {
    return true;
  }

  if (containsTermInArray(retailer.subcategories, searchTerm)) {
    return true;
  }

  if (containsTermInArray(retailer.keywords, searchTerm)) {
    return true;
  }

  return false;
}

function containsTermInArray(array, term) {
  return array && array.some(item => item.toLowerCase().includes(term));
}

async function fetchRetailers() {
  const response = await fetch(RETAILERS_JSON_PATH);
  return response.json();
}

async function fetchCarts() {
  const response = await fetch(CARTS_JSON_PATH);
  return response.json();
}

function processCartsData(cartsData) {
  const result = {};
  cartsData.carts.forEach(cart => {
    result[cart.id] = cart;
  });
  return result;
}

function createRetailerCard(retailer) {
  const card = document.createElement('div');
  card.className = 'retailer-card';

  card.appendChild(createImageElement(retailer));
  card.appendChild(createInfoContainer(retailer));

  return card;
}

function createInfoContainer(retailer) {
  const infoContainer = document.createElement('div');
  infoContainer.className = 'retailer-info';

  infoContainer.appendChild(createNameElement(retailer.name));

  appendCategoriesIfAvailable(infoContainer, retailer);
  appendSubcategoriesIfAvailable(infoContainer, retailer);

  infoContainer.appendChild(createCartsList(retailer));

  return infoContainer;
}

function appendCategoriesIfAvailable(container, retailer) {
  if (retailer.categories && retailer.categories.length > 0) {
    container.appendChild(createTagsContainer('Categories', retailer.categories));
  }
}

function appendSubcategoriesIfAvailable(container, retailer) {
  if (retailer.subcategories && retailer.subcategories.length > 0) {
    container.appendChild(createTagsContainer('Subcategories', retailer.subcategories));
  }
}

function createTagsContainer(title, tags) {
  const container = document.createElement('div');
  container.className = 'tags-container';

  container.appendChild(createTagsTitle(title));
  container.appendChild(createTagsElement(tags));

  return container;
}

function createTagsTitle(title) {
  const titleElement = document.createElement('h3');
  titleElement.className = 'tags-title';
  titleElement.textContent = title;
  return titleElement;
}

function createTagsElement(tags) {
  const tagsElement = document.createElement('div');
  tagsElement.className = 'tags';

  tags.forEach(tag => {
    tagsElement.appendChild(createTagElement(tag));
  });

  return tagsElement;
}

function createTagElement(tag) {
  const tagElement = document.createElement('span');
  tagElement.className = 'tag';
  tagElement.textContent = tag;
  return tagElement;
}

function createCartsList(retailer) {
  const cartsList = document.createElement('ul');
  cartsList.className = 'carts-list';

  if (hasValidCarts(retailer)) {
    appendCartItems(cartsList, retailer);
  } else {
    cartsList.appendChild(createNoCartsItem());
  }

  return cartsList;
}

function hasValidCarts(retailer) {
  return retailer.carts && retailer.carts.length > 0;
}

function appendCartItems(cartsList, retailer) {
  retailer.carts.forEach(cartId => {
    if (state.carts[cartId]) {
      cartsList.appendChild(createCartItem(state.carts[cartId]));
    }
  });
}

function createCartItem(cart) {
  const cartItem = document.createElement('li');
  cartItem.className = 'cart-item';

  cartItem.appendChild(createCartNameElement(cart.name));
  cartItem.appendChild(createCartDetailsElement(cart));

  return cartItem;
}

function createCartDetailsElement(cart) {
  const cartDetails = document.createElement('div');
  cartDetails.className = 'cart-details';

  cartDetails.appendChild(createDiscountInfoElement(cart.discount));
  cartDetails.appendChild(createMaxInfoElement(cart.max));

  return cartDetails;
}

function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', handleSearch);
  setupEscapeClearSearch(searchInput);
}

function setupEscapeClearSearch(searchInput) {
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      applyFilters();
    }
  });
}

function showErrorMessage(error) {
  console.error('Error fetching data:', error);
  document.getElementById('retailers-container').innerHTML = `
    <div class="error-message">
      <p>Error loading data. Please try again later.</p>
    </div>
  `;
}

function showNoResultsMessage(container) {
  container.innerHTML = `
    <div class="no-results">
      <p>No retailers found matching your search.</p>
    </div>
  `;
}

function createImageElement(retailer) {
  const image = document.createElement('img');
  image.className = 'retailer-image';
  image.src = retailer['image-src'];
  image.alt = retailer.name;
  image.onerror = function() {
    this.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
  };
  return image;
}

function createNameElement(retailerName) {
  const name = document.createElement('h2');
  name.className = 'retailer-name';
  name.textContent = retailerName;
  return name;
}

function createCartNameElement(name) {
  const cartName = document.createElement('div');
  cartName.className = 'cart-name';
  cartName.textContent = name;
  return cartName;
}

function createNoCartsItem() {
  const noCartsItem = document.createElement('li');
  noCartsItem.textContent = 'No supported carts';
  return noCartsItem;
}

function createDiscountInfoElement(discount) {
  const discountInfo = document.createElement('span');
  discountInfo.textContent = `Discount: ${discount}%`;
  return discountInfo;
}

function createMaxInfoElement(max) {
  const maxInfo = document.createElement('span');
  maxInfo.textContent = `Max: ₪${max}`;
  return maxInfo;
}

document.addEventListener('DOMContentLoaded', fetchData);