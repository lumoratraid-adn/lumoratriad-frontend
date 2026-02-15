import axios from "axios";

const api = axios.create({
baseURL: "https://lumoratriad-backend-1.onrender.com",
});

export default api;
