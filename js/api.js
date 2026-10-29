// api.js file

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endPoint = '', options = {}) {

        const response = await fetch(`${this.baseUrl}${endPoint}`, options);

        if (!response.ok) {

            throw new Error(`Request failed with status: ${response.status}`);

        }

        return response.json();

    }

}

class UserService extends ApiService {

    async getUsers() {

        const data = await this.request();

        if (data.users.length < 1) {
            return [];
        }

        return data.users

    }

    async addUser(newUser) {

        const userData = await this.request('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        })

        return userData;

    }

    async updateUser(userId, updatedUser) {

        const data = await this.request(`/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser)
        })

        return data;

    }

    async deleteUser(userId) {

        await this.request(`/${userId}`, {
            method: 'DELETE'
        })
    }
}

class MovieService extends ApiService {

    async getMovies() {

        const data = await this.request();
        return data;

    }

}

class AuthService extends ApiService {

    async login(credential) {

        return await this.request('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credential)

        })

    }

    async getCurrentUser() {

        const accessToken = localStorage.getItem('accessToken');

        const data = await this.request('/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        return data;

    }

}

const userService = new UserService('https://dummyjson.com/users');

const movieService = new MovieService('movies.json')

const authService = new AuthService('https://dummyjson.com/auth');