import axios from 'axios';
const BASE_URL = 'http://localhost:8000';
// const BASE_URL = 'https://the-food-app-api.herokuapp.com';
// const BASE_URL = 'http://django-food-app-env-8.eba-ps2fzkz3.us-west-2.elasticbeanstalk.com';

export default axios.create({
    baseURL: BASE_URL
})

// attaching interceptors to the private instance
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
})