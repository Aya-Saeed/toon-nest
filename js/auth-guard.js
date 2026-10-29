async function requireRole(allowedRoles) {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        window.location.replace('index.html');
        return false;
    }

    try {
        const currentUser = await authService.getCurrentUser();

        if (!allowedRoles.includes(currentUser.role)) {
            if (currentUser.role === 'admin') {
                window.location.replace('admin.html');
            } else if (currentUser.role === 'user') {
                window.location.replace('movies.html');
            } else {
                localStorage.removeItem('accessToken');
                window.location.replace('index.html');
            }

            return false;
        }

        return true;
    } catch (error) {
        localStorage.removeItem('accessToken');
        window.location.replace('index.html');
        return false;
    }
}