import axios from "axios";

const API_KEY = "40806483-6440f6558fbf5c5ea7c0e9b5c"

export function fetchSearchUser(textKey, page, perPage) {
    const url = `https://pixabay.com/api/?key=${API_KEY}&q=${textKey}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    return axios.get(url)
}