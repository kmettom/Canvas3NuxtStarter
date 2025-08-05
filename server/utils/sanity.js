export async function fetchContent( options = {}) {
    try {
        const baseUrl =  'https://25j4gher.api.sanity.io/v2025-08-05/data/query/production?query=*%5B_type+%3D%3D+%22content%22%5D&perspective=drafts'; // You can set API_BASE_URL in .env

        const res = await fetch(baseUrl, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        return await res.json();
    } catch (error) {
        console.error('[fetchFromApi] Error:', error.message);
        throw error;
    }
}
