// --- Global DOM Elements ---
const cardContainer = document.getElementById('card-container');
const addCardsHOFButton = document.getElementById('addCardsHOF');
const addCardsFetchButton = document.getElementById('addCardsFetch');


/**
 * Helper function to create the HTML string for a single card.
 * @param {object} data - The data for the card.
 * @param {string} data.title - The card title.
 * @param {string} data.body - The card body/content.
 * @param {string} source - The source of the data (e.g., 'HOF' or 'Fetch').
 * @returns {string} The HTML string for the card.
 */
const createCardHTML = (data, source) => {
    return `
        <div class="card">
            <h3>${data.title}</h3>
            <p>${data.body}</p>
            <small>Source: ${source}</small>
        </div>
    `;
};


// --------------------------------------------------------------------------
// TASK 1: Higher-Order Methods (HOF) to Add Cards
// --------------------------------------------------------------------------

// 1. Define the data (local array)
const localCardData = [
    { title: "HOF Card 1", body: "This card was generated using Array.prototype.map(), a Higher-Order Function." },
    { title: "HOF Card 2", body: "HOFs like map, filter, and reduce allow for functional programming." },
    { title: "HOF Card 3", body: "It transforms one array into a new array of the same size." }
];

const handleHOFClick = () => {
    // A. Use the map() Higher-Order Function
    // map() iterates over localCardData and calls the provided function 
    // for each item, returning a NEW array of HTML strings.
    const cardHTMLArray = localCardData.map(card => createCardHTML(card, 'HOF (Map)'));
    
    // B. Join the array of HTML strings into a single string
    const cardsHTML = cardHTMLArray.join('');
    
    // C. Add the new HTML to the container
    cardContainer.innerHTML += cardsHTML;
};

// Attach the handler to the button
addCardsHOFButton.addEventListener('click', handleHOFClick);


// --------------------------------------------------------------------------
// TASK 2: Fetch API to Add Cards
// --------------------------------------------------------------------------

const handleFetchClick = async () => {
    // The API endpoint to fetch data from (JSONPlaceholder - posts)
    const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';
    
    try {
        // 1. Use fetch() to request data
        const response = await fetch(API_URL);
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 2. Convert the response body to a JSON object (an array of posts)
        const posts = await response.json();
        
        // 3. Process the fetched array using a Higher-Order Function (map)
        // This is a great practice: fetch the raw data, then use HOFs to format it.
        const cardHTMLArray = posts.map(post => {
            // Take the first 50 characters of the body for a clean snippet
            const snippet = post.body.substring(0, 50) + '...'; 
            return createCardHTML({ title: post.title, body: snippet }, `Fetch (ID: ${post.id})`);
        });

        // 4. Combine the array and add to the DOM
        const cardsHTML = cardHTMLArray.join('');
        cardContainer.innerHTML += cardsHTML;

    } catch (error) {
        console.error('Error fetching data:', error);
        // Display an error message to the user
        cardContainer.innerHTML += '<p style="color: red;">Failed to load data. See console for details.</p>';
    }
};

// Attach the handler to the button
addCardsFetchButton.addEventListener('click', handleFetchClick);