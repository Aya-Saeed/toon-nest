const params = new URLSearchParams(window.location.search);
const movieId = Number(params.get('id'));

const movieDetails = document.getElementById('movie-details');

const movieVideo = document.getElementById('movie-video');
const movieKey = `movie-${movieId}`;

const videoSource = document.getElementById('video-source');

const moviePoster = document.getElementById('movie-poster');

const movieError = document.getElementById('movie-error');

const videoError = document.getElementById('video-error');

const movieLoading = document.getElementById('movie-loading');

movieVideo.addEventListener('timeupdate', () => {
    localStorage.setItem(movieKey, movieVideo.currentTime);
});


movieVideo.addEventListener('ended', () => {
    localStorage.removeItem(movieKey);
});

movieVideo.addEventListener('error', () => {
    videoError.hidden = false;
});

movieVideo.addEventListener('playing', () => {
    videoError.hidden = true;
});

async function loadMovie() {

    movieLoading.hidden = false;
    movieError.hidden = true;
    videoError.hidden = true;
    try {

        const movies = await movieService.getMovies();

        const movie = movies.find((movie) => movie.id === movieId)

        if (!movie) {
            throw new Error('Movie not found');
        }

        videoSource.src = movie.videoUrl;

        moviePoster.src = movie.image;

        moviePoster.alt = movie.title;

        movieVideo.load();

        movieDetails.innerHTML = ` 

            <h1>${movie.title}</h1>

            <p>${movie.description}</p>

            <div>
                <span>${movie.year}</span>
                <span>${movie.genre}</span>
                <span>${movie.duration}</span>
            </div>
        `;

    } catch (error) {

        console.log(error);

        movieError.hidden = false;

    } finally {

        movieLoading.hidden = true;

    }

}

movieVideo.addEventListener('loadedmetadata', () => {
    const savedTime = localStorage.getItem(movieKey);

    if (savedTime !== null && Number(savedTime) > 0) {
        movieVideo.currentTime = Number(savedTime);
    }
});
async function initMovie() {
    const allowed = await requireRole(['user']);

    if (!allowed) return;

    document.body.style.visibility = 'visible';

    await loadMovie();
}

initMovie();

const searchInput = document.getElementById('search-input');

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();

        window.location.href =
            `movies.html?search=${encodeURIComponent(searchTerm)}`;
    }
});

const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    window.location.replace('index.html');
});