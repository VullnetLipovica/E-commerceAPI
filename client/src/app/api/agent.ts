import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { router } from '../router/Routes';
import { request } from "https";
import { PaginatedResponse } from '../models/pagination';
import { store } from "../store/configureStore";

// Krijon një funksion të quajtur 'sleep' që kthen një premtim (Promise)
// Nëse premtimi ekzekutohet me sukses, atëherë do të presë për (0.5 sekonda)
const sleep = () => new Promise(resolve => setTimeout(resolve, 500))

// Konfigurimi i Axios me vlerat e përgjithshme për të gjitha kërkesat
axios.defaults.baseURL = 'http://localhost:5000/api/';
axios.defaults.withCredentials = true;

// Krijon një funksion të quajtur 'responseBody' që pranon një objekt 'AxiosResponse'
// dhe kthen pjesën e të dhënave (data) të kthyer nga përgjigjja
const responseBody = (response: AxiosResponse) => response.data;

// Përdor interceptorin e Axios për të ndryshuar konfiguracionin e kërkesës para se ajo të dërgohet
axios.interceptors.request.use(config => {
    // Merr tokenin e përdoruesit nga gjendja e 'store'
    const token = store.getState().account.user?.token;
    // Nëse tokeni ekziston, shto 'Authorization' header-in në konfigurim
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // Kthej konfigurimin, pasi është ndryshuar (në rast se duhet të kthehet)
    return config;
})
//menyra per me regjistru nje interceptor,interceptoret jan funksione qe ekzektohen para se pergjigjja e serverit te ktheht te useri
axios.interceptors.response.use(async response => {
    //shërben për të shtyrë ekzekutimin për një kohë të caktuar. qe mos me pas mbingarkes ne faqe
    await sleep();
    //merr vleren 
    const pagination = response.headers['pagination'];
    //kontrollon nese paginimi egziston
    if (pagination) {
        response.data = new PaginatedResponse(response.data, JSON.parse(pagination));
        return response;
    }
    return response;
},
    // Përdor interceptorin e Axios për të trajtuar gabimet e përgjigjes së kërkesave HTTP
    (error: AxiosError) => {
        // Merr të dhënat dhe statusin nga përgjigja e gabuar
    const { data, status } = error.response as AxiosResponse;
    switch (status) {
        case 400:
            if (data.errors) {
                const modelStateErrors: string[] = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modelStateErrors.push(data.errors[key])
                    }
                }
                throw modelStateErrors.flat();
            }
            toast.error(data.title);
            break;
        case 401:
            toast.error(data.title);
            break;
        case 403:
            toast.error('You are not allowed to do that!');
            break;
        case 500:
           
            router.navigate('/server-error', { state: { error: data } })
            break;
        default:
            break;
    }
    
    return Promise.reject(error.response);
})

// Definimi i një objekti që përmban funksione të përshtatura për llojet e ndryshme të kërkesave HTTP
const requests = {
    get: (url: string, params?: URLSearchParams) => axios.get(url, { params }).then(responseBody),
    post: (url: string, body: object) => axios.post(url, body).then(responseBody),
    put: (url: string, body: object) => axios.put(url, body).then(responseBody),
    del: (url: string) => axios.delete(url).then(responseBody),
    postForm: (url: string, data: FormData) => axios.post(url, data, {
        headers: { 'Content-type': 'multipart/form-data' }
    }).then(responseBody),
    putForm: (url: string, data: FormData) => axios.put(url, data, {
        headers: { 'Content-type': 'multipart/form-data' }
    }).then(responseBody)
}

// Objekti për përpunimin e kërkesave specifike për katalogun e produkteve
const Catalog = {
    // Funksioni për të marrë një listë të produkteve duke përdorur kërkesën GET
    list: (params: URLSearchParams) => requests.get('products', params),
    // Funksioni për të marrë detajet e një produkti duke përdorur kërkesën GET
    details: (id: number) => requests.get(`products/${id}`),
    // Funksioni për të marrë filtrat e disponueshëm të produkteve duke përdorur kërkesën GET
    fetchFilters: () => requests.get('products/filters')
}

// Objekti për përpunimin e kërkesave për të testuar gabimet
const TestErrors = {
    get400Error: () => requests.get('buggy/bad-request'),
    get401Error: () => requests.get('buggy/unauthorised'),
    get404Error: () => requests.get('buggy/not-found'),
    get500Error: () => requests.get('buggy/server-error'),
    getValidationError: () => requests.get('buggy/validation-error')
}

// Objekti për menaxhimin e shportës së blerjeve
const Basket = {
    // Funksioni për të marrë përmbajtjen e shportës duke përdorur kërkesën GET
    get: () => requests.get('basket'),
    // Funksioni për të shtuar një artikull në shportë duke përdorur kërkesën POST
    // Parametrat e produktit dhe sasisë shtohen në URL
    addItem: (productId: number, quantity = 1) => requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
    // Funksioni për të hequr një artikull nga shporta duke përdorur kërkesën DELETE
    // Parametrat e produktit dhe sasisë shtohen në URL
    removeItem: (productId: number, quantity = 1) => requests.del(`basket?productId=${productId}&quantity=${quantity}`)
}

// Objekti për menaxhimin e llogarisë së përdoruesit
const Account = {
    // Funksioni për të bërë një kërkesë POST për t'u kyçur (login)
    login: (values: any) => requests.post('account/login', values),
    // Funksioni për të bërë një kërkesë POST për të regjistruar një llogari të re
    register: (values: any) => requests.post('account/register', values),
    // Funksioni për të marrë informacionin e përdoruesit aktual duke përdorur kërkesën GET
    currentUser: () => requests.get('account/currentUser'),
    // Funksioni për të marrë adresat e ruajtura të llogarisë duke përdorur kërkesën GET
    fetchAddress: () => requests.get('account/savedAddress')
}

// Objekti për menaxhimin e kërkesave për porosi
const Orders = {
    // Funksioni për të marrë një listë të porosive duke përdorur kërkesën GET
    list: () => requests.get('orders'),
    // Funksioni për të marrë detajet e një porosie duke përdorur kërkesën GET
    fetch: (id: number) => requests.get(`orders/${id}`),
    // Funksioni për të krijuar një porosi duke përdorur kërkesën POST
    create: (values: any) => requests.post('orders', values)
}

// Funksion për krijimin e objektit FormData nga një objekt i thjeshtë
function createFormData(item: any) {
    const formData = new FormData();
    for (const key in item) {
        formData.append(key, item[key])
    }
    return formData;
}

// Objekti për menaxhimin e kërkesave të administratorit
const Admin = {
    createProduct: (product: any) => requests.postForm('products', createFormData(product)),
    updateProduct: (product: any) => requests.putForm('products', createFormData(product)),
    deleteProduct: (id: number) => requests.del(`products/${id}`)
}

// Objekti përfundimtar që përmban të gjitha objektet për menaxhimin e kërkesave të ndryshme
const agent = {
    Catalog,
    TestErrors,
    Basket,
    Account,
    Orders,
    Admin
}

// Eksportimi i objektit përfundimtar për përdorim në pjesën tjetër të kodit
export default agent;