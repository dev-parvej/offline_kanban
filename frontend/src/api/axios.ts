import axios from "axios";

const baseUrl = (window as any).BACKEND_URL  || "http://localhost:8989";


export const api = axios.create({
    baseURL: baseUrl,
    timeout: 10000, // optional
    headers: {
        "Content-Type": "application/json",
    },
});