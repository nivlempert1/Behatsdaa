const RETAILERS_JSON_PATH = 'data/aggregations/retailers.json';
const CARTS_JSON_PATH = 'data/aggregations/carts.json';

let retailers = [];
let carts = {};
let filteredRetailers = [];

async function fetchData() {
    try {
        const retailersResponse = await fetch(RETAILERS_JSON_PATH);
        retailers = await retailersResponse.json();
        
        const cartsResponse = await fetch(CARTS_JSON_PATH);
        const cartsData = await cartsResponse.json();
        
        cartsData.carts.forEach(cart => {
            carts[cart.id] = cart;
        });
        
        filteredRetailers = [...retailers];
        displayRetailers();
        
        document.getElementById('searchInput').addEventListener('input', handleSearch);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('retailers-container').innerHTML = `
            <div class="error-message">
                <p>Error loading data. Please try again later.</p>
            </div>
        `;
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    filteredRetailers = retailers.filter(retailer => 
        retailer.name.toLowerCase().includes(searchTerm)
    );
    
    displayRetailers();
}

function displayRetailers() {
    const retailersContainer = document.getElementById('retailers-container');
    
    retailersContainer.innerHTML = '';
    
    if (filteredRetailers.length === 0) {
        retailersContainer.innerHTML = `
            <div class="no-results">
                <p>No retailers found matching your search.</p>
            </div>
        `;
        return;
    }
    
    filteredRetailers.forEach(retailer => {
        const retailerCard = createRetailerCard(retailer);
        retailersContainer.appendChild(retailerCard);
    });
}

function createRetailerCard(retailer) {
    const card = document.createElement('div');
    card.className = 'retailer-card';
    
    const image = document.createElement('img');
    image.className = 'retailer-image';
    image.src = retailer['image-src'];
    image.alt = retailer.name;
    image.onerror = function() {
        this.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
    };
    
    const infoContainer = document.createElement('div');
    infoContainer.className = 'retailer-info';
    
    const name = document.createElement('h2');
    name.className = 'retailer-name';
    name.textContent = retailer.name;
    
    const cartsList = document.createElement('ul');
    cartsList.className = 'carts-list';
    
    if (retailer.carts && retailer.carts.length > 0) {
        retailer.carts.forEach(cartId => {
            if (carts[cartId]) {
                const cartItem = createCartItem(carts[cartId]);
                cartsList.appendChild(cartItem);
            }
        });
    } else {
        const noCartsItem = document.createElement('li');
        noCartsItem.textContent = 'No supported carts';
        cartsList.appendChild(noCartsItem);
    }
    
    infoContainer.appendChild(name);
    infoContainer.appendChild(cartsList);
    card.appendChild(image);
    card.appendChild(infoContainer);
    
    return card;
}

function createCartItem(cart) {
    const cartItem = document.createElement('li');
    cartItem.className = 'cart-item';
    
    const cartName = document.createElement('div');
    cartName.className = 'cart-name';
    cartName.textContent = cart.name;
    
    const cartDetails = document.createElement('div');
    cartDetails.className = 'cart-details';
    
    const discountInfo = document.createElement('span');
    discountInfo.textContent = `Discount: ${cart.discount}%`;
    
    const maxInfo = document.createElement('span');
    maxInfo.textContent = `Max: ₪${cart.max}`;
    
    cartDetails.appendChild(discountInfo);
    cartDetails.appendChild(maxInfo);
    cartItem.appendChild(cartName);
    cartItem.appendChild(cartDetails);
    
    return cartItem;
}

document.addEventListener('DOMContentLoaded', fetchData);