// pages/wallets.js
"use client"

import { useState } from 'react';

const Wallets = () => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const fetchWallets = async () => {
        try {

            const res = await fetch('http://localhost:3001/operator/wallets', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await res.json();
            setResponse(data);
            setError(null); // Clear previous error
        } catch (err) {
            setError(err.message);
            setResponse(null); // Clear previous response
        }
    };

    return (
        <div>
            <h1>Fetch Wallets</h1>
            <button onClick={fetchWallets}>Fetch Wallets</button>
            {response && (
                <pre>{JSON.stringify(response, null, 2)}</pre>
            )}
            {error && (
                <pre style={{ color: 'red' }}>Error: {error}</pre>
            )}
        </div>
    );
};

export default Wallets;
