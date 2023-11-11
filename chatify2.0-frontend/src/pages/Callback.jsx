import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

const Callback = () => {
    const nav = useNavigate()

    useEffect(() => {
        // Function to parse the JWT token from the URL
        const parseJwtToken = () => {
            const token = new URLSearchParams(window.location.search).get('token');
            return token;
        };

        // Fetch user details from the server using the token
        const fetchUserDetails = async () => {
            const token = parseJwtToken();
            if (token) {
                try {
                    const response = await fetch('https://flawless-candy-turtle.glitch.me/user/getUserDetails', {
                        method: 'GET',
                        headers: {
                            Authorization: `${token}`,
                        },
                    });

                    if (response.ok) {
                        const userDetails = await response.json();

                        // Save user details and token to localStorage
                        localStorage.setItem('user', JSON.stringify(userDetails));
                        localStorage.setItem('token', token);
                        toast.success('Login successful!')

                        // Redirect to the home page
                        nav('/');
                    } else {
                        console.error('Failed to fetch user details');
                        toast.error('Failed to fetch user details');
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    toast.error('Error fetching user details');
                }
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <div>
            <p>Loading...</p>
        </div>
    );
};

export default Callback;
