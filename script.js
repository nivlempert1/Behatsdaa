const RETAILERS_JSON_PATH = 'data/aggregations/retailers.json';
const CARTS_JSON_PATH = 'data/aggregations/carts.json';

const state = {
  retailers: [],
  carts: {},
  filteredRetailers: []
};

async function fetchData() {
  try {
    state.retailers = await fetchRetailers();
    const cartsData = await fetchCarts();

    state.carts = processCartsData(cartsData);
    state.filteredRetailers = [...state.retailers];

    displayRetailers();
    initializeSearch();
  } catch (error) {
    showErrorMessage(error);
  }
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

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();

  state.filteredRetailers = state.retailers.filter(retailer =>
    retailer.name.toLowerCase().includes(searchTerm)
  );

  displayRetailers();
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
  infoContainer.appendChild(createCartsList(retailer));

  return infoContainer;
}

function createCartsList(retailer) {
  const cartsList = document.createElement('ul');
  cartsList.className = 'carts-list';

  if (retailer.carts && retailer.carts.length > 0) {
    retailer.carts.forEach(cartId => {
      if (state.carts[cartId]) {
        cartsList.appendChild(createCartItem(state.carts[cartId]));
      }
    });
  } else {
    cartsList.appendChild(createNoCartsItem());
  }

  return cartsList;
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
  document.getElementById('searchInput').addEventListener('input', handleSearch);
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
  image.onerror = function () {
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