'use client';
import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { set } from 'mongoose';

interface CardIdentifier {
  scryfallId: string;
  name: string;
  set: string;
  collector_number: string;
}

interface ScryfallRequestIdentifier {
  id?: string;
  name?: string;
  set?: string;
  collector_number?: string;
}

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

        // --- Step 1: Fetch the list of identifiers from your own backend ---
        const localResponse = await fetch('/api/getIds');
        if (!localResponse.ok) {
          throw new Error('Failed to fetch card identifiers from your database.');
        }
        const responseData = await localResponse.json();

        console.log("Data received from /api/get-identifiers:", responseData);

        const identifiersFromDB: CardIdentifier[] = Array.isArray(responseData) ? responseData : responseData.data || [];

        if (!Array.isArray(identifiersFromDB)) {
            throw new TypeError("Data received from the backend is not an array.");
        }
        console.log("Identifiers from DB:", identifiersFromDB);

        if (identifiersFromDB.length === 0) {
          setCards([]);
          setLoading(false); 
          setError('No card identifiers found in the database.');
          return;
        }

        const scryfallRequestIdentifiers: ScryfallRequestIdentifier[] = identifiersFromDB.map(card => ({
          id: card.scryfallId,
          name: card.name,
          set: card.set,
          collector_number: card.collector_number,
        }));

        console.log("Prepared identifiers for Scryfall:", scryfallRequestIdentifiers);

        const scryfallResponse = await fetch('https://api.scryfall.com/cards/collection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ identifiers: scryfallRequestIdentifiers }),
        });
        console.log("Scryfall response:", scryfallResponse);
        console.info("Scryfall response status:", scryfallResponse);

        if (!scryfallResponse.ok) {
          throw new Error('Failed to fetch card data from Scryfall.');
        }

        const scryfallData = await scryfallResponse.json();
        setCards(scryfallData.data);

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
    <>
    </>
  );
}
