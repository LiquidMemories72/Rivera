const API_KEY = import.meta.env.VITE_MIREYE_API_KEY;

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('apiForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    
    const statusIndicator = document.getElementById('statusIndicator');
    const responseContainer = document.getElementById('responseContainer');
    
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const askInputs = document.getElementById('askInputs');
    const fetchInputs = document.getElementById('fetchInputs');
    
    const fieldsSelect = document.getElementById('fields');

    // Toggle between Ask and Fetch modes
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'ask') {
                askInputs.classList.remove('hidden');
                fetchInputs.classList.add('hidden');
            } else {
                askInputs.classList.add('hidden');
                fetchInputs.classList.remove('hidden');
            }
        });
    });

    // Populate Fields Dropdown on load
    await loadFieldsCatalog();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const address = document.getElementById('address').value.trim();
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        
        // Update UI state to loading
        setLoadingState(true);
        statusIndicator.textContent = 'Sending Request...';
        statusIndicator.className = 'status-indicator';
        
        try {
            const payload = {};
            
            // Add location (Address OR Lat/Lng)
            if (address) {
                payload.address = address;
            } else if (latitude && longitude) {
                payload.lat = parseFloat(latitude);
                payload.lng = parseFloat(longitude);
            } else {
                throw new Error("Please provide either an Address OR both Latitude and Longitude.");
            }

            let endpoint = '';

            if (mode === 'ask') {
                const query = document.getElementById('query').value.trim();
                if (!query) throw new Error("Please enter a question.");
                payload.question = query;
                endpoint = 'https://api.mireye.com/v1/ask';
            } else {
                // Fetch mode
                const selectedOptions = Array.from(fieldsSelect.selectedOptions);
                if (selectedOptions.length === 0) throw new Error("Please select at least one field.");
                payload.fields = selectedOptions.map(opt => opt.value);
                endpoint = 'https://api.mireye.com/v1/fetch';
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                statusIndicator.textContent = 'Success';
                statusIndicator.className = 'status-indicator success';
                renderResponse(data, mode);
            } else {
                statusIndicator.textContent = `Error ${response.status}`;
                statusIndicator.className = 'status-indicator error';
                renderError(data);
            }
            
        } catch (error) {
            statusIndicator.textContent = 'Error';
            statusIndicator.className = 'status-indicator error';
            responseContainer.innerHTML = `<p style="color: #f87171;">${error.message}</p>`;
        } finally {
            setLoadingState(false);
        }
    });
    
    async function loadFieldsCatalog() {
        try {
            const res = await fetch('https://api.mireye.com/v1/meta/fields', {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });
            if (!res.ok) throw new Error('Failed to fetch catalog');
            
            const data = await res.json();
            // Assuming data is an object where keys are field names, or an array of objects
            // The OpenAPI spec didn't show the exact response shape for /v1/meta/fields
            // We will parse it dynamically based on common patterns
            
            fieldsSelect.innerHTML = '';
            
            let fieldsArray = [];
            if (Array.isArray(data)) {
                fieldsArray = data;
            } else if (data.fields && Array.isArray(data.fields)) {
                fieldsArray = data.fields;
            } else {
                fieldsArray = Object.keys(data); // fallback if it's a dict of fields
            }

            fieldsArray.forEach(field => {
                const fieldName = typeof field === 'string' ? field : field.name;
                const option = document.createElement('option');
                option.value = fieldName;
                option.textContent = fieldName;
                fieldsSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error(error);
            fieldsSelect.innerHTML = '<option value="" disabled>Failed to load fields. (Check console/API Key)</option>';
            // Add some mock fields just in case the catalog is unreachable
            const mockFields = ['elevation', 'slope_degrees', 'tree_canopy_pct', 'ndvi_current', 'lcms_class', 'within_floodplain_polygon'];
            mockFields.forEach(f => {
                const option = document.createElement('option');
                option.value = f;
                option.textContent = f + " (Fallback)";
                fieldsSelect.appendChild(option);
            });
        }
    }

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
    
    function renderResponse(data, mode) {
        const formattedJson = JSON.stringify(data, null, 2);
        let html = '';
        
        if (mode === 'ask' && data.answer) {
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
    
    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
