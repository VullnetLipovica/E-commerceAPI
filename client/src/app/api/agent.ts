import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { router } from '../router/Routes';
import { request } from "https";
import { PaginatedResponse } from '../models/pagination';
import { store } from "../store/configureStore";

// Krijon nj� funksion t� quajtur 'sleep' q� kthen nj� premtim (Promise)
// N�se premtimi ekzekutohet me sukses, at�her� do t� pres� p�r (0.5 sekonda)
const sleep = () => new Promise(resolve => setTimeout(resolve, 500))

// Konfigurimi i Axios me vlerat e p�rgjithshme p�r t� gjitha k�rkesat
axios.defaults.baseURL = 'http://localhost:5000/api/';
axios.defaults.withCredentials = true;

// Krijon nj� funksion t� quajtur 'responseBody' q� pranon nj� objekt 'AxiosResponse'
// dhe kthen pjes�n e t� dh�nave (data) t� kthyer nga p�rgjigjja
const responseBody = (response: AxiosResponse) => response.data;

// P�rdor interceptorin e Axios p�r t� ndryshuar konfiguracionin e k�rkes�s para se ajo t� d�rgohet
axios.interceptors.request.use(config => {
    // Merr tokenin e p�rdoruesit nga gjendja e 'store'
    const token = store.getState().account.user?.token;
    // N�se tokeni ekziston, shto 'Authorization' header-in n� konfigurim
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // Kthej konfigurimin, pasi �sht� ndryshuar (n� rast se duhet t� kthehet)
    return config;
})
//menyra per me regjistru nje interceptor,interceptoret jan funksione qe ekzektohen para se pergjigjja e serverit te ktheht te useri
axios.interceptors.response.use(async response => {
    //sh�rben p�r t� shtyr� ekzekutimin p�r nj� koh� t� caktuar. qe mos me pas mbingarkes ne faqe
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
    // P�rdor interceptorin e Axios p�r t� trajtuar gabimet e p�rgjigjes s� k�rkesave HTTP
    (error: AxiosError) => {
        // Merr t� dh�nat dhe statusin nga p�rgjigja e gabuar
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

// Definimi i nj� objekti q� p�rmban funksione t� p�rshtatura p�r llojet e ndryshme t� k�rkesave HTTP
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

// Objekti p�r p�rpunimin e k�rkesave specifike p�r katalogun e produkteve
const Catalog = {
    // Funksioni p�r t� marr� nj� list� t� produkteve duke p�rdorur k�rkes�n GET
    list: (params: URLSearchParams) => requests.get('products', params),
    // Funksioni p�r t� marr� detajet e nj� produkti duke p�rdorur k�rkes�n GET
    details: (id: number) => requests.get(`products/${id}`),
    // Funksioni p�r t� marr� filtrat e disponuesh�m t� produkteve duke p�rdorur k�rkes�n GET
    fetchFilters: () => requests.get('products/filters')
}

// Objekti p�r p�rpunimin e k�rkesave p�r t� testuar gabimet
const TestErrors = {
    get400Error: () => requests.get('buggy/bad-request'),
    get401Error: () => requests.get('buggy/unauthorised'),
    get404Error: () => requests.get('buggy/not-found'),
    get500Error: () => requests.get('buggy/server-error'),
    getValidationError: () => requests.get('buggy/validation-error')
}

// Objekti p�r menaxhimin e shport�s s� blerjeve
const Basket = {
    // Funksioni p�r t� marr� p�rmbajtjen e shport�s duke p�rdorur k�rkes�n GET
    get: () => requests.get('basket'),
    // Funksioni p�r t� shtuar nj� artikull n� shport� duke p�rdorur k�rkes�n POST
    // Parametrat e produktit dhe sasis� shtohen n� URL
    addItem: (productId: number, quantity = 1) => requests.post(`basket?productId=${productId}&quantity=${quantity}`, {}),
    // Funksioni p�r t� hequr nj� artikull nga shporta duke p�rdorur k�rkes�n DELETE
    // Parametrat e produktit dhe sasis� shtohen n� URL
    removeItem: (productId: number, quantity = 1) => requests.del(`basket?productId=${productId}&quantity=${quantity}`)
}

// Objekti p�r menaxhimin e llogaris� s� p�rdoruesit
const Account = {
    // Funksioni p�r t� b�r� nj� k�rkes� POST p�r t'u ky�ur (login)
    login: (values: any) => requests.post('account/login', values),
    // Funksioni p�r t� b�r� nj� k�rkes� POST p�r t� regjistruar nj� llogari t� re
    register: (values: any) => requests.post('account/register', values),
    // Funksioni p�r t� marr� informacionin e p�rdoruesit aktual duke p�rdorur k�rkes�n GET
    currentUser: () => requests.get('account/currentUser'),
    // Funksioni p�r t� marr� adresat e ruajtura t� llogaris� duke p�rdorur k�rkes�n GET
    fetchAddress: () => requests.get('account/savedAddress')
}

// Objekti p�r menaxhimin e k�rkesave p�r porosi
const Orders = {
    // Funksioni p�r t� marr� nj� list� t� porosive duke p�rdorur k�rkes�n GET
    list: () => requests.get('orders'),
    // Funksioni p�r t� marr� detajet e nj� porosie duke p�rdorur k�rkes�n GET
    fetch: (id: number) => requests.get(`orders/${id}`),
    // Funksioni p�r t� krijuar nj� porosi duke p�rdorur k�rkes�n POST
    create: (values: any) => requests.post('orders', values)
}

// Funksion p�r krijimin e objektit FormData nga nj� objekt i thjesht�
function createFormData(item: any) {
    const formData = new FormData();
    for (const key in item) {
        formData.append(key, item[key])
    }
    return formData;
}

// Objekti p�r menaxhimin e k�rkesave t� administratorit
const Admin = {
    createProduct: (product: any) => requests.postForm('products', createFormData(product)),
    updateProduct: (product: any) => requests.putForm('products', createFormData(product)),
    deleteProduct: (id: number) => requests.del(`products/${id}`)
}

// Objekti p�rfundimtar q� p�rmban t� gjitha objektet p�r menaxhimin e k�rkesave t� ndryshme
const agent = {
    Catalog,
    TestErrors,
    Basket,
    Account,
    Orders,
    Admin
}

// Eksportimi i objektit p�rfundimtar p�r p�rdorim n� pjes�n tjet�r t� kodit
export default agent;