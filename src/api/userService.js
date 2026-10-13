import api from './axios'; 

//Mockup data

export const INITIAL_MOCK_USERS = [
    { id : 1, name : 'John Doe', email : 'john.doe@example.com', role : 'Admin', status : 'Active' },
    { id : 2, name : 'Jane Smith', email : 'jane.smith@example.com', role : 'User', status : 'Active' },
    { id : 3, name : 'Bob Johnson', email : 'bob.johnson@example.com', role : 'User', status : 'Inactive' }
];

export const userService = {
    getUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch {
            return INITIAL_MOCK_USERS;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch {
            return INITIAL_MOCK_USERS;
        }
    },
    updateUserRole: async (id, newRole) => {
        try {
            const response = await api.patch(`/users/${id}/role`, { role: newRole });
            return response.data;
        } catch {
            return {id, role: newRole};
        }
    },

    deleteUser: async (id) => {
        try {
            await api.delete(`/users/${id}`);
        } catch {
            // Silent fail - user not found or already deleted
            console.log(`User with id ${id} not found or already deleted`);
        }
    },
};
