import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
});

// Eğer kullanıcı giriş yaptıysa, localStorage’daki token'ı her isteğe ekleyeceğiz.
api.interceptors.request.use(cfg => {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export default api;
