import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { fetchSearchUser } from './pixabay-api';
import InfiniteScroll from 'infinite-scroll';


const refs = {
    input: document.querySelector('input[name="searchQuery"]'),
    btn: document.querySelector('button[type="submit"]'),
    form: document.querySelector(".search-form"),
    gallery: document.querySelector(".gallery"),
    btnMore: document.querySelector(".load-more")
}

let picArray = [];
let page = 1;
let perPage = 40;
let previousTextKey = '';

refs.btnMore.style.display = "none"
refs.form.addEventListener("submit", handleSubmit)
refs.btnMore.addEventListener("click", loadMore)

async function handleSubmit(event) {
    event.preventDefault();
    const inputValue = refs.input.value;

    if (inputValue !== previousTextKey) {
        refs.gallery.innerHTML = '';
        page = 1;
        previousTextKey = inputValue
        await fetchAndRender()
    }
}
let lightBox = true;
let gallery;  

async function fetchAndRender() {
    try {
        const response = await fetchSearchUser(previousTextKey, page, perPage)
        handleApiResponse(response)
    }
    catch (error) {
        handleError(error)
    }
}

function handleApiResponse(response) {
    picArray = response.data.hits;
    if (refs.gallery.childElementCount === 0 && picArray.length !== 0) {
        Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    }
    if (picArray.length === 0) {
        throw new Error();
    }
    
  renderGallery(picArray);
  if (lightBox) {
    initializeLightbox();
  } else {
    gallery.refresh()
  }
  handleScrollBehavior(response);
}

let totalHits;

function renderGallery(picArray) {
    const createElement = picArray.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
        `<div class="photo-card">
            <a class="gallery_link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
        </div>`).join("");
    
  refs.gallery.insertAdjacentHTML("beforeend", createElement);
}

function initializeLightbox() {
    gallery = new SimpleLightbox('.gallery a', {
        captionsData: "alt",
        captionPosition: "bottom",
        captionDelay: "250",
        close: true,
    });
  lightBox = false;
}

function handleScrollBehavior(response) {
    if (refs.gallery.childElementCount > perPage) {
        const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();
        window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
        });
    }

    totalHits = response.data.totalHits;
    if (totalHits > page * perPage) {
        refs.btnMore.style.display = "block";
    } else {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        refs.btnMore.style.display = "none";
   }
}

function handleError(error) {
    refs.btnMore.style.display = "none";
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
}



async function loadMore() {
  page += 1;
  fetchAndRender();
}