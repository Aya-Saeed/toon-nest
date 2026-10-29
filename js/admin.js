const accessToken = localStorage.getItem('accessToken');
const logoutBtn = document.getElementById('logout-btn');

const usersContainer = document.getElementById('users');
const userForm = document.getElementById('user-form');
const userEditForm = document.getElementById('edit-form');

const firstNameInput = document.getElementById('firstName');
const ageInput = document.getElementById('age');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

const editModalElement = document.getElementById('editModal');
const firstNameInputModal = document.getElementById('editFirstName');
const ageInputModal = document.getElementById('editAge');
const emailInputModal = document.getElementById('editEmail');
const phoneInputModal = document.getElementById('editPhone');

const loader = document.getElementById('loader');
const errorMsg = document.getElementById('errorMsg');

let allUsers = [];
let selectedUserId = null;
let table;
let modal;

async function checkAdmin() {
    if (!accessToken) {
        window.location.replace('index.html');
        return false;
    }

    const currentUser = await authService.getCurrentUser();

    if (currentUser.role !== 'admin') {
        window.location.replace('movies.html');
        return false;
    }

    return true;
}

function initializeTable() {
    table = new DataTable('#users', {
        rowId: row => `user-${row.id}`,

        columnDefs: [
            { width: '6%', targets: 0 },
            { width: '9%', targets: 1 },
            { width: '13%', targets: 2 },
            { width: '27%', targets: 3 },
            { width: '19%', targets: 4 },
            { width: '8%', targets: 5 },
            { width: '18%', targets: 6 }
        ],

        columns: [
            {
                data: 'id',
                render: data => `#${String(data)}`
            },
            {
                data: 'image',
                render: data => `
                    <img
                        src="${data || 'https://ui-avatars.com/api/?name=User&background=e9ecef&color=495057&size=100'}"
                        alt="User"
                        width="50"
                        height="50"
                        class="user-image"
                    >
                `
            },
            { data: 'firstName' },
            { data: 'email' },
            { data: 'phone' },
            { data: 'age' },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: (data, type, row) => `
                    <div class="action-btns">
                        <button
                            class="btn btn-sm edit-btn"
                            data-id="${row.id}"
                        >Edit</button>

                        <button
                            class="btn btn-sm del-btn"
                            data-id="${row.id}"
                        >Delete</button>
                    </div>
                `
            }
        ]
    });

    const searchInput = document.querySelector('.dt-search input');

    if (searchInput) {
        searchInput.placeholder = 'Search users...';
    }
}

async function loadUsers() {
    loader.style.display = 'block';
    errorMsg.textContent = '';

    try {
        allUsers = await userService.getUsers();

        if (allUsers.length === 0) {
            errorMsg.textContent = 'No users found.';
            return;
        }

        table.clear();
        table.rows.add(allUsers).draw();
    } catch (error) {
        console.error('Failed to load users:', error);
        errorMsg.textContent = 'Failed to load users. Please try again.';
    } finally {
        loader.style.display = 'none';
    }
}

async function addUser(event) {
    event.preventDefault();

    const newUser = {
        firstName: firstNameInput.value.trim(),
        age: Number(ageInput.value),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
    };

    try {
        const userData = await userService.addUser(newUser);

        if (!userData) return;

        allUsers.push(userData);
        table.row.add(userData).draw(false);

        errorMsg.textContent = '';
        userForm.reset();
    } catch (error) {
        console.error('Failed to add user:', error);
        errorMsg.textContent = 'Failed to add user. Please try again.';
    }
}

function handleTableClick(event) {
    const editButton = event.target.closest('.edit-btn');
    const deleteButton = event.target.closest('.del-btn');

    if (editButton) {
        selectedUserId = Number(editButton.dataset.id);

        const currentUser = allUsers.find(
            user => user.id === selectedUserId
        );

        if (!currentUser) return;

        firstNameInputModal.value = currentUser.firstName;
        ageInputModal.value = currentUser.age;
        emailInputModal.value = currentUser.email;
        phoneInputModal.value = currentUser.phone;

        modal.show();
    }

    if (deleteButton) {
        deleteUser(Number(deleteButton.dataset.id), deleteButton);
    }
}

async function deleteUser(userId, button) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    button.disabled = true;

    try {
        await userService.deleteUser(userId);

        allUsers = allUsers.filter(user => user.id !== userId);
        table.row(`#user-${userId}`).remove().draw(false);

        errorMsg.textContent = '';
    } catch (error) {
        console.error('Failed to delete user:', error);
        errorMsg.textContent = 'Failed to delete user. Please try again.';
        button.disabled = false;
    }
}

async function editUser(event) {
    event.preventDefault();

    if (selectedUserId === null) return;

    const updatedUser = {
        firstName: firstNameInputModal.value.trim(),
        age: Number(ageInputModal.value),
        email: emailInputModal.value.trim(),
        phone: phoneInputModal.value.trim()
    };

    try {
        const updatedUserData = await userService.updateUser(
            selectedUserId,
            updatedUser
        );

        const userIndex = allUsers.findIndex(
            user => user.id === selectedUserId
        );

        if (userIndex !== -1) {
            allUsers[userIndex] = {
                ...allUsers[userIndex],
                ...updatedUserData
            };

            table
                .row(`#user-${selectedUserId}`)
                .data(allUsers[userIndex])
                .draw(false);
        }

        modal.hide();
        selectedUserId = null;
        errorMsg.textContent = '';
    } catch (error) {
        console.error('Failed to update user:', error);
        errorMsg.textContent = 'Failed to update user. Please try again.';
    }
}

async function initAdmin() {
    try {
        const isAdmin = await checkAdmin();

        if (!isAdmin) return;

        document.body.style.visibility = 'visible';

        modal = new bootstrap.Modal(editModalElement);

        initializeTable();

        await loadUsers();

        userForm.addEventListener('submit', addUser);
        userEditForm.addEventListener('submit', editUser);
        usersContainer.addEventListener('click', handleTableClick);

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            window.location.replace('index.html');
        });
    } catch (error) {
        console.error('Admin initialization failed:', error);
        localStorage.removeItem('accessToken');
        window.location.replace('index.html');
    }
}

initAdmin();