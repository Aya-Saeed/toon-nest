// movies.js file
const moviesContainer = document.getElementById('movies');

const searchInput = document.getElementById('search-input');

const continueWatchingContainer = document.getElementById('continue-watching');

const moviesLoading = document.getElementById('movies-loading');

const moviesError = document.getElementById('movies-error')

const noResults = document.getElementById('no-results');

const continueWatchingSection = document.getElementById(
    'continue-watching-section'
);

let allMovies = [];

function displayMovies(movies) {

    const cards = movies.map((movie) => {
        return `
            <div class="movie-card">
                <img src="${movie.image}" alt="${movie.title}">
                <h3>${movie.title}</h3>

                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span>${movie.genre}</span>
                    <span>${movie.duration}</span>
                </div>

                <p>${movie.description}</p>

                <a href="movie-det.html?id=${movie.id}">
                    Watch Now
                </a>
            </div>
        `;

    }).join('');

    moviesContainer.innerHTML = cards;

    noResults.hidden = movies.length > 0;

}

function getContinueWatching() {

    return allMovies.filter((movie) => localStorage.getItem(`movie-${movie.id}`) !== null)

}

function displayContinueWatching() {
    const continueWatching = getContinueWatching();

    if (continueWatching.length === 0) {
        continueWatchingSection.hidden = true;
        continueWatchingContainer.innerHTML = '';
        return;
    }

    continueWatchingSection.hidden = false;

    const moviesWithProgress = continueWatching.map((movie) => {
        const savedTime = Number(localStorage.getItem(`movie-${movie.id}`));

        const [minutes, seconds] = movie.duration.split(':').map(Number);

        const durationInSeconds = minutes * 60 + seconds;

        const progress = Math.min(
            (savedTime / durationInSeconds) * 100,
            100
        );

        return {
            ...movie,
            progress
        };
    });

    if (continueWatching.length === 0) {
        continueWatchingContainer.innerHTML = '';
        return;
    }

    continueWatchingContainer.innerHTML = moviesWithProgress
        .map((movie) => {
            return `
                <div class="movie-card">

                    <img src="${movie.image}" alt="${movie.title}">

                    <div class="movie-card-content">

                        <h3>${movie.title}</h3>

                        <p>${movie.description}</p>

                        <div class="progress-bar">
                    
                            <div class="progress" style="width: ${movie.progress}%"></div>

                        </div>
                        
                        <a href="movie-det.html?id=${movie.id}">
                            Continue Watching
                        </a>

                    </div>

                </div>
            `;
        })
        .join('');
}

async function loadMovies() {

    moviesLoading.hidden = false;
    moviesError.hidden = true;
    moviesContainer.innerHTML = '';

    try {

        allMovies = await movieService.getMovies();

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search') || '';

        searchInput.value = searchTerm;

        const filteredMovies = allMovies.filter((movie) =>
            movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
        );

        displayMovies(filteredMovies);
        displayContinueWatching();

    } catch (error) {

        console.log(error);

        moviesError.hidden = false;

    } finally {

        moviesLoading.hidden = true;

    }

}

searchInput.addEventListener('input', (e) => {


    const searchTerm = searchInput.value.toLowerCase();

    console.log(searchInput);

    const filteredMovies = allMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genre.toLowerCase().includes(searchTerm)
    );

    displayMovies(filteredMovies);
})

async function initMovies() {
    const allowed = await requireRole(['user']);

    if (!allowed) return;

    document.body.style.visibility = 'visible';

    await loadMovies();
}

initMovies();

const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    window.location.replace('index.html');
});
const exploreBtn = document.getElementById('explore-btn');

exploreBtn.addEventListener('click', () => {
    document.getElementById('movies').scrollIntoView({
        behavior: 'smooth'
    });
});