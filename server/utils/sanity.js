export async function fetchContent() {
    try {
        const baseUrl =
            "https://25j4gher.api.sanity.io/v2025-08-05/data/query/production?query=*%5B_type+%3D%3D+%22content%22%5D&perspective=drafts"; // You can set API_BASE_URL in .env

        const res = await fetch(baseUrl, {
            method: "GET",
        });

        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        const jsonRes = await res.json();
        console.log("jsonRes", jsonRes)
        return jsonRes
    } catch (error) {
        console.error("[fetchFromApi] Error:", error.message);
        throw error;
    }
}
