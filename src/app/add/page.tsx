'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface ImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

interface Prices {
  usd: string;
  usd_foil: string;
  eur: string;
  tix: string;
}

interface CardFace {
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  image_uris?: ImageUris;
}

interface Card {
  id: string;
  name: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  image_uris?: ImageUris;
  mana_cost?: string;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  prices: Prices;
  set_name: string;
  set: string;
  collector_number: string;
  card_faces?: CardFace[];
}

export default function Add() {

  const [cardName, setCardName] = useState<string>('');
  const [cardPrints, setCardPrints] = useState<Card[]>([]);
  const [chosenPrint, setChosenPrint] = useState<Card | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fetchCard = useCallback(async (nameToFetch?: string) => {
    const finalCardName = nameToFetch || cardName;
    if (!finalCardName) {
      setError('Enter Card Name.');
      return;
    }

    setLoading(true);
    setError('');
    setCardPrints([]);
    setChosenPrint(null);
    setSuggestions([]);
    

    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?unique=prints&q=!"${encodeURIComponent(cardName)}"`);

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
        const response = await fetch('https://api.scryfall.com/cards/search?unique=prints&q=!"Nekusar the Mind Razer"');
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

    const fetchSuggestions = async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        setSuggestions(data.data || []);
      }
      catch (err) {
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      }
    };

    // limit api calls to scryfall
    const debounce = (func: (...args: any[]) => void, delay: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCardName(value);
      debouncedFetchSuggestions(value);
    };

    const handleSuggestionClick = (suggestion: string) => {
      // console.log(`Suggestion clicked: ${suggestion}`);
      // console.log(`Current cardName: ${cardName}`);
      setCardName(suggestion);
      // console.log(`Updated cardName: ${cardName}`);
      setSuggestions([]);
      // console.log(suggestions)
      // fetchCard(suggestion);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
          setSuggestions([]);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchCard();
      }
    }

    const handleAddToBinder = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!chosenPrint) {
        setError('No card selected');
        return;
      }

      try {
        const response = await axios.post('/api/addCard', {
          scryfallId: chosenPrint.id,
        });

        if (response.status === 200) {
          // alert('Card added successfully!');
        } else {
          throw new Error('Failed to add card');
        }
      } catch (err) {
        setError((err as Error).message);
      }
    }

    return (
      <div className='text-white min-h-screen flex flex-col items-center p-4 sm:p-6 font-sans'>
        <div className='w-full max-w-5xl mx-auto bg-gray-900 shadow-lg p-6'>
          <h1 className='text-2xl font-bold text-white mb-4'>Add a Card to your Binder</h1>

          {/* user input */}
          <div className='flex flex-col sm:flex-row gap-2 mb-6' ref={searchContainerRef}>
            <div className='relative flex-grow'>
              <input 
                type="text"
                value={cardName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter card name...my favorite is Counterspell :b"
                className='flex-grow w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300'
              />
              { suggestions.length > 0 && (
                <ul className='absolute z-10 w-full rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto bg-gray-600'>
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index} 
                      onClick={() => handleSuggestionClick(suggestion)}
                      className='px-4 py-2 hover:bg-gray-700 cursor-pointer'
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
                )}
            </div>
            
            <button 
              onClick={() => fetchCard()}
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
          {chosenPrint && (
            <div className='rounded-2x-1 p-6 animate-fade-in mb-8'>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* image */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

                  {chosenPrint.card_faces ? (
                    chosenPrint.card_faces.map((face, index) => (
                      <img
                        key={index}
                        src={face.image_uris?.large || face.image_uris?.png || face.image_uris?.art_crop || 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg/revision/latest?cb=20140813141013'}
                        alt={face.name}
                        className="rounded-xl shadow-2xl w-full max-w-xs h-auto"
                      />
                    ))
                  ) : (
                    <img 
                      src={chosenPrint.image_uris?.large || 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg/revision/latest?cb=20140813141013'}
                      alt={chosenPrint.name}
                      className="rounded-xl shadow-2xl w-full h-auto max-w-md mx-auto"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg/revision/latest?cb=20140813141013'; }} // fallback image
                    />
                  )}
                </div>

                {/* details */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl sm:text-3xl font-semibold">{chosenPrint.name}</h2>

                  {chosenPrint.card_faces ? (
                    chosenPrint.card_faces.map((face, index) => (
                      <div key={index} className="border-t border-gray-600 pt-4">
                        <h3 className="text-xl font-semibold">{face.name}</h3>
                        <p className="text-lg italic text-gray-300">{face.type_line}</p>
                        <p className="text-gray-200">{face.oracle_text}</p>
                          <div className='flex items-center text-lg mt-2'>
                            <span className='font-semibold'>Mana Cost:</span>
                            <div dangerouslySetInnerHTML={{ __html: face.mana_cost ? face.mana_cost.replace(/\{/g, '<span class="mana-symbol">').replace(/\}/g, '</span>') : 'N/A' }} />
                          </div>
                        {face.power && face.toughness && (
                          <p className="text-gray-200  text-lg mt-2">
                            <span className="font-semibold">Power/Toughness:</span> {face.power}/{face.toughness}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <p className='text-lg italic text-gray-300'>{chosenPrint.type_line}</p>
                      <p className='text-gray-200'>{chosenPrint.oracle_text}</p>
                      <div className='flex items-center text-lg mt-2'>
                        <span className='font-semibold'>Mana Cost:</span>
                        <div dangerouslySetInnerHTML={{ __html: chosenPrint.mana_cost ? chosenPrint.mana_cost.replace(/\{/g, '<span class="mana-symbol">').replace(/\}/g, '</span>') : 'N/A' }} />
                      </div>
                      {chosenPrint.power && chosenPrint.toughness && (
                        <p className='text-gray-200 text-lg mt-2'>
                          <span className='font-semibold'>Power/Toughness:</span> {chosenPrint.power}/{chosenPrint.toughness}
                        </p>
                      )}
                    </>
                  )}

                  {/* Print details */}
                  <div className='border-t border-gray-600 pt-4 mt-2'>
                    <h3 className='text-xl font-semibold mb-2'>Print Details</h3>
                    <p className='text-gray-300'>Set: {chosenPrint.set_name}</p>
                    <p className='text-gray-300'>Set Code: {chosenPrint.set}</p>
                    <p className='text-gray-300'>Collector Number: {chosenPrint.collector_number}</p>
                    <p className='text-gray-300'>Released: {new Date(chosenPrint.released_at).toLocaleDateString()}</p>
                  </div>

                  {/* Prices */}
                  <div className='border-t border-gray-600 pt-4 mt-2'>
                    <h3 className='text-xl font-semibold mb-2'>Prices</h3>
                    <p className='text-lg'><span className='font-bold text-green-400'>USD:</span> ${chosenPrint.prices.usd || 'N/A'}</p>
                    <p className='text-lg'><span className='font-bold text-green-400'>USD Foil:</span> ${chosenPrint.prices.usd_foil || 'N/A'}</p>
                    <p className='text-lg'><span className='font-bold text-red-400'>PHPx50:</span> ₱{(Number(chosenPrint.prices.usd) * 50 )|| 'N/A'}</p>
                    <p className='text-lg'><span className='font-bold text-red-400'>PHPx50 Foil:</span> ₱{(Number(chosenPrint.prices.usd_foil) * 50 ) || 'N/A'}</p>
                  </div>

                  <button
                    rel="noopener noreferrer"
                    className='mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
                    onClick={handleAddToBinder}
                  >
                    Add to My Binder
                  </button>

                </div>

              </div>
            </div>
          )}

          {/* Card prints list */}
          {cardPrints.length > 1 && (
            <div>
              <h3 className='text-xl font-semibold mb-4'>Other Prints ({cardPrints.length})</h3>
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4'>
                {cardPrints.map((print) => (
                  <div key={print.id} className='cursor-pointer' onClick={() => setChosenPrint(print)}>
                    <img 
                      src={print.image_uris?.small || print.card_faces?.[0].image_uris?.small || 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg/revision/latest?cb=20140813141013'}
                      alt={`${print.name} - ${print.set_name}`}
                      className='rounded-lg shadow-md w-full h-auto hover:scale-105 transition-transform duration-200'
                      onError={(e) =>  { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg/revision/latest?cb=20140813141013'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        

      </div>
    );
  }
  