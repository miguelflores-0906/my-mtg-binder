'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';

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

    return (
      <div>
        <h1>Welcome to Add</h1>
      </div>
    );
  }
  