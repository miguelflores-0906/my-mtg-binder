'use client';
import React, { useState, useEffect, useCallback } from 'react';

export default function Add() {

  const [cardName, setCardName] = useState('');
  const [cardPrints, setCardPrints] = useState([]);
  const [chosenPrint, setChosenPrint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCard = useCallback(async () => {
    if (!cardName) {
      setError('Enter Card Name.');
      return;
    }

    setLoading(true);
    setError('');
    setCardPrints([]);
    setChosenPrint(null);

    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}`);

      if (response.status === 404) {
        throw new Error('No cards with that name');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch card data');
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        throw new Error('No cards found with that name');
      }

      setCardPrints(data.data);

      // defaults to first printing in the list
      setChosenPrint(data.data[0]);
    }
    catch (err: unknown) {
      setError((err as Error).message);
      setCardPrints([]);
      setChosenPrint(null);
      setLoading(false);
    }
    finally {
      setLoading(false);
    }

  }, [cardName]);

    // initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.scryfall.com/cards/search?q=black+lotus');
        const data = await response.json();
        setCardPrints(data.data);
        setChosenPrint(data.data[0]);
      }
      catch (err) {
        setError('Failed to fetch initial card data');
      }
      finally {
        setLoading(false);
      }
    };

    initialFetch();
  }, []);

    return (
      <div className='text-white min-h-screen flex flex-col items-center p-4 sm:p-6 font-sans'>
        <div className='w-full max-w-5xl mx-auto bg-gray-900 shadow-lg p-6'>
          <h1 className='text-2xl font-bold text-white mb-4'>Add a Card to your Binder</h1>

          {/* user input */}
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <input 
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCard()}
              placeholder="Enter card name...my favorite is Counterspell :b"
              className='flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500'
            />
            <button 
              onClick={fetchCard}
              disabled={loading}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50'
              >
              {loading ? 'Searching...' : 'Search Card'}
            </button>
          </div>

          {error && (
            <div className='border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-center'>
              <p>{error}</p>
            </div>

          )}

          {/* chosen print details */}
          
        </div>
      </div>
    );
  }
  