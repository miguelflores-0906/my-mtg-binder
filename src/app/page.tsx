'use client';
import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { set } from 'mongoose';
import { json } from 'stream/consumers';
import { stringify } from 'querystring';

interface CardIdentifier {
  id: string;
  name: string;
  set: string;
  collector_number: string;
}

// 2. Interface for the object we send TO Scryfall's collection endpoint
interface ScryfallRequestIdentifier {
  id?: string;
  name?: string;
  set?: string;
  collector_number?: string;
}

// 3. Interface for the full card data we get back FROM Scryfall
interface ScryfallCard {
  id: string;
  name: string;
  image_uris?: {
    normal: string;
    large: string;
  };
  prices: {
    usd: string | null;
  };
  card_faces?: Array<{
    name: string;
    image_uris?: {
      normal: string;
      large: string;
    };
  }>;
}


export default function Home() {

  const [cards, setCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        console.log("Response data:", responseData);

        // Transform the response data to JSON array
        const cardsArray = responseData.cards;
        console.log("Cards array:", cardsArray);
        const oneCard = cardsArray[0];
        console.log("One card:", oneCard);

        const jsonArray = JSON.stringify(cardsArray);
        // console.log("Transformed JSON array:", jsonArray);

        const scryfallResponse = await fetch('https://api.scryfall.com/cards/collection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(oneCard),
        });
        console.log("Scryfall response:", scryfallResponse);

        if (!scryfallResponse.ok) {
          throw new Error('Failed to fetch card data from Scryfall.');
        }

        const scryfallData = await scryfallResponse.json();
        setCards(scryfallData.data);
        console.log("Scryfall data:", scryfallData.data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <></>
  );
}
