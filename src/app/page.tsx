'use client';
import React, { useState } from 'react';
import axios from 'axios';

export default function Home() {

  const [scryfallId, setScryfallId] = useState('');
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await axios.post('/api/addCard', {scryfallId, name, imageUrl});

    if(response.status === 200) {
      alert('Card added successfully!');
      setScryfallId('');
      setName('');
      setImageUrl('');
    }
    else {
      alert('Failed to add card.');
    }
  }

  return (
    <div>
      <h1>Welcome to My App</h1>

      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type='text' placeholder='scryfallId' value={scryfallId} onChange={(e) => setScryfallId(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
          <input type='text' placeholder='name' value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
          <input type='text' placeholder='imageUrl' value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2 border border-gray-300 rounded" required />
          <button type='submit' className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Card</button>
        </form>
      </div>
    </div>
  );
}
