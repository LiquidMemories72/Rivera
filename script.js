document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('askForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    
    const statusIndicator = document.getElementById('statusIndicator');
    const responseContainer = document.getElementById('responseContainer');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const apiKey = import.meta.env.VITE_MIREYE_API_KEY;
        const address = document.getElementById('address').value.trim();
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        const query = document.getElementById('query').value.trim();
        
        if (!apiKey || !query) return;
        
        // Update UI state to loading
        setLoadingState(true);
        statusIndicator.textContent = 'Sending Request...';
        statusIndicator.className = 'status-indicator';
        
        try {
            // Build the payload
            const payload = {
                question: query
            };
            
            // Add location (Address OR Lat/Lng)
            if (address) {
                payload.address = address;
            } else if (latitude && longitude) {
                payload.lat = parseFloat(latitude);
                payload.lng = parseFloat(longitude);
            } else {
                throw new Error("Please provide either an Address OR both Latitude and Longitude.");
            }

            // Using standard api.mireye.com domain (adjust if it's different)
            const endpoint = 'https://api.mireye.com/v1/ask';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                statusIndicator.textContent = 'Success';
                statusIndicator.className = 'status-indicator success';
                renderResponse(data);
            } else {
                statusIndicator.textContent = `Error ${response.status}`;
                statusIndicator.className = 'status-indicator error';
                renderError(data);
            }
            
        } catch (error) {
            statusIndicator.textContent = 'Network Error';
            statusIndicator.className = 'status-indicator error';
            responseContainer.innerHTML = `<p style="color: #f87171;">Failed to connect to the Mireye API. Please check your network connection and ensure the endpoint is correct.</p><p class="response-json" style="margin-top: 1rem;">${error.message}</p>`;
        } finally {
            setLoadingState(false);
        }
    });
    
    function setLoadingState(isLoading) {
        if (isLoading) {
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
            submitBtn.disabled = true;
            responseContainer.innerHTML = '<p class="placeholder-text">Processing request...</p>';
        } else {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }
    
    function renderResponse(data) {
        // Pretty print the JSON for a simple interface
        // We can make it fancier later if we know the exact response shape
        const formattedJson = JSON.stringify(data, null, 2);
        
        let html = '';
        
        // If there's a specific answer field, highlight it
        if (data.answer) {
            html += `<div style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${escapeHtml(data.answer)}</div>`;
        }
        
        html += `<div class="response-json">${escapeHtml(formattedJson)}</div>`;
        
        responseContainer.innerHTML = html;
    }
    
    function renderError(data) {
        const formattedJson = JSON.stringify(data, null, 2);
        responseContainer.innerHTML = `
            <p style="color: #f87171; font-weight: 500; margin-bottom: 1rem;">The API returned an error:</p>
            <div class="response-json" style="color: #fca5a5;">${escapeHtml(formattedJson)}</div>
        `;
    }
    
    // Utility to prevent XSS when rendering JSON
    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
