import { useState, useEffect } from "react";
import { userService, INITIAL_MOCK_USERS } from "../api/userService";

export default function UserAccess() {
    const [users, setUsers] = useState(INITIAL_MOCK_USERS);
    const [isActive,setIsActive] = useState(false);
    const [userData, setUserData] = useState({name: "",email: "",role: "",status: ""});
    const [newUser, setNewUser] = useState({name : '', email: '', role: '', status: ''});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // TODO: Fetch users from API
        async function loadUsers() {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
            setLoading(false);
        }
        loadUsers();
    }, []);


    const addUser = (e) => {
        e.preventDefault();
        if(!newUser.name || !newUser.email) return;
        // TODO: Implement add user logic   

        const createdUser = {
            id: Date.now().toString(),
            ...newUser,
            status: 'active'
        };
        
        setUsers([...users, createdUser]);
        setNewUser({name : '', email: '', role: '', status: 'Viewer'});
    }
    

    const handleActivate = () => {
        if(!isActive) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.id]: e.target.value
        })
    }


    const deleteUser = () => {
        setUsers(users.slice(0, -1))
    }

    

    return (
        <div>
            {/* navbar */}
            <div className="flex justify-between items-center mb-4 mx-4 py-4">
                <h1 className="text-2xl font-bold">Users & Access Management</h1>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={addUser}>Add User</button>
            </div>

            {/* Add user popup */}
            <div className="bg-white p-4 rounded shadow mx-4 my-4 border border-gray-200 flex flex-col gap-2 max-w-md mx-auto">
                <label htmlFor="name">Name</label>
                <input className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" id="name" value={userData.name} onChange={handleChange} />

                <label htmlFor="email">Email</label>
                <input className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" id="email" value={userData.email} onChange={handleChange} />

                <label htmlFor="role">Role</label>
                <select className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange}>
                    <option value="default">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                </select>
            </div>
            
            {/* table */}
            <div className="mx-auto"   >
                <table className="w-full gap-2">
                    <thead>
                        <tr>
                            <th className="text-left">Name</th>
                            <th className="text-left">Email</th>
                            <th className="text-left">Role</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.status}</td>
                                <td><button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={deleteUser}>Delete</button></td>
                                {isActive ? (
                                    <td><button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleActivate}>Deactivate</button></td>
                                ) : (
                                    <td><button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleActivate}>Activate</button></td>
                                )}
                                <td><button className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}