document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const resultsContainer = document.getElementById('results-container');
    const resultsCount = document.getElementById('results-count');

    // API URL setup - using relative path so it automatically uses whatever domain it's deployed on (like Render)
    const API_URL = '/search';

    // Initial load
    fetchInventory();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchInventory();
    });

    async function fetchInventory() {
        // Show loading state
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="spinner"></div>
                <p>Searching inventory...</p>
            </div>
        `;

        try {
            const q = document.getElementById('q').value;
            const category = document.getElementById('category').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;

            if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
                resultsContainer.innerHTML = `
                    <div class="empty-state">
                        <p style="color: #ef4444;">Invalid price range: Min Price cannot exceed Max Price.</p>
                    </div>
                `;
                resultsCount.textContent = "0 items found";
                return;
            }

            // Build query params
            const params = new URLSearchParams();
            if (q) params.append('q', q);
            if (category) params.append('category', category);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const url = `${API_URL}?${params.toString()}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('API response was not ok');
            
            const data = await response.json();
            renderResults(data.results, data.count);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p style="color: #ef4444;">Failed to load inventory. Is the backend running?</p>
                </div>
            `;
            resultsCount.textContent = "0 items found";
        }
    }

    function renderResults(results, count) {
        resultsCount.textContent = `${count} item${count !== 1 ? 's' : ''} found`;

        if (count === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No results found matching your search criteria.</p>
                </div>
            `;
            return;
        }

        const itemsHTML = results.map(item => `
            <div class="item-card">
                <div class="item-info">
                    <h3>${escapeHTML(item.name)}</h3>
                    <div class="item-meta">
                        <span>${escapeHTML(item.category)}</span>
                        <span>ID: #${item.id}</span>
                    </div>
                </div>
                <div class="item-price-col">
                    <div class="item-price">$${item.price.toFixed(2)}</div>
                    <div class="item-stock">${item.stock} in stock</div>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = itemsHTML;
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
