console.log('auth.js loaded');

const loginForm = document.getElementById('login-form');

const username = document.getElementById('username');
const password = document.getElementById('password');

const loginError = document.getElementById('login-error');

const logoutBtn = document.getElementById('logout-btn');


async function redirectIfLoggedIn() {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) return;

    try {
        const currentUser = await authService.getCurrentUser();

        console.log('Current user role:', currentUser.role);
        console.log('Current user data:', currentUser);
        if (currentUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (currentUser.role === 'user') {
            window.location.href = 'movies.html';
        } else {
            localStorage.removeItem('accessToken');
        }

    } catch (error) {
        localStorage.removeItem('accessToken');
    }
}

redirectIfLoggedIn();
console.log('redirectIfLoggedIn called');

loginForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    const credentials = {
        username: username.value.trim(),
        password: password.value
    };

    try {

        const data = await authService.login(credentials);

        localStorage.setItem('accessToken', data.accessToken);

        const currentUser = await authService.getCurrentUser();

        const role = currentUser.role;

        if (role === 'admin') {
            window.location.href = 'admin.html';
        } else if (role === 'user') {
            window.location.href = 'movies.html';
        } else {
            localStorage.removeItem('accessToken');
            loginError.textContent = 'Unauthorized role';
        }

    } catch (error) {

        loginError.textContent = 'Invalid username or password';

    }
});