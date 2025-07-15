'use client';
import React, { useState, useEffect, use, useCallback, useRef } from 'react';
import axios from 'axios';
import { set } from 'mongoose';
import { json } from 'stream/consumers';
import { stringify } from 'querystring';

interface ScryfallPrices {
  usd: string | null;
  eur: string | null;
  tix: string | null;
}
interface ScryfallImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}
interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  prices: ScryfallPrices;
  image_uris?: ScryfallImageUris; 
  card_faces?: { image_uris: ScryfallImageUris }[]; 
}
interface ScryfallApiResponse {
  data: ScryfallCard[];
  has_more: boolean;
  next_page: string | null;
}

// Card Component
const Card = ({ card, onRemove }: { card: ScryfallCard; onRemove: (id: string) => void; }) => {
  const imageUrl = card.image_uris ? card.image_uris.normal : card.card_faces ? card.card_faces[0].image_uris.normal : null;
  const price = card.prices.usd ? `$${card.prices.usd}` : (card.prices.eur ? `€${card.prices.eur}` :  'N/A');
  const peso = (Number)(card.prices.usd) * 50; // Assuming 1 USD = 18.5 MXN, adjust as needed
  return (
    <div className='bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 relative group'>
    <div className='relative'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={card.name}
            className='w-full h-auto object-cover' 
            loading='lazy'
          />
        ) : (
          <div className='w-full aspect-[0.714] bg-gray-700 flex items-center justify-center p-4'>
            <p className='text-white text-center text-sm'>{card.name}</p>
          </div>
        )}
    </div>
    <div className='p-4 flex-grow flex flex-col'>
      <h3 className='text-base font-bold text-white break-words'>{card.name}</h3>
      <p className='text-sm text-gray-400 mt-1 mb-2'>{card.set_name} ({card.set.toUpperCase()}) · #{card.collector_number}</p>
      <div className='flex-grow' />
      <div className='mt-2'>
          <p className='text-lg font-semibold text-green-400'>{price}</p>
          <p className='text-lg font-semibold text-red-400'>₱{peso}</p>
      </div>
    </div>
    <button
      onClick={() => onRemove(card.id)}
      className='absolute bottom-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75'
      aria-label={`Remove ${card.name}`}
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
          </svg>
    </button>

  </div>
  );
};

export default function Home() {

  const [cardCollection, setCardCollection] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonArray, setJsonArray] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  
  const handleDeleteCard = async (cardId: string) => {
    try {
    const response = await axios.delete('/api/deleteCard', { data: { id: cardId } });
    if (response.status !== 200) {
        throw new Error('Failed to delete card from the database.');
    }
      // console.log('Card deleted successfully:', response.data);
      setCardCollection((prevCollection) => prevCollection.filter(card => card.id !== cardId));
      setError(null); 
    } catch (err: any) {
      console.error('Error deleting card:', err.message);
      setError('Failed to delete card. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const localResponse = await fetch('/api/getIds');
        if (!localResponse.ok) {
          throw new Error('Failed to fetch card identifiers from the database.');
        }
        const responseData = await localResponse.json();

        // console.log('Response data:', responseData);

        const jsonArray = JSON.stringify(responseData);
        setJsonArray(jsonArray);

        const scryfallResponse = await fetch('https://api.scryfall.com/cards/collection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonArray,
        });
        // console.log('Scryfall response:', scryfallResponse);

        if (!scryfallResponse.ok) {
          throw new Error('Failed to fetch card data from Scryfall.');
        }

        const scryfallData = await scryfallResponse.json();
        // console.log('Scryfall data:', scryfallData.data);
        setCardCollection(scryfallData.data);
        // console.log('Has more:', scryfallData.has_more);
        // console.log('Next page:', scryfallData.next_page);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ jsonArray ]);

  const filteredCards = cardCollection.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='bg-gray-900 text-white min-h-screen font-sans'>

      <main className='p-4 sm:p-6 md:p-8'>
        <div className='mb-8 max-w-lg mx-auto'>
          <input 
            type='text'
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        {loading && (
          <div className='text-center py-10'>
            <p className='text-xl text-gray-400'>Loading binder...</p>
          </div>
        )}

        {error && (
            <div className='text-center py-10'>
                <p className='text-lg text-red-500'>{error}</p>
            </div>
        )}
        {!loading && !error && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredCards.map((card) => (
              <Card key={card.id} card={card} onRemove={handleDeleteCard} />
            ))}
          </div>
        )}

        {!loading && !error && filteredCards.length === 0 && cardCollection.length > 0 && (
            <div className='text-center py-10'>
                <p className='text-lg text-gray-500'>No cards match your search.</p>
            </div>
        )}
      </main>
    </div>
  );
}
