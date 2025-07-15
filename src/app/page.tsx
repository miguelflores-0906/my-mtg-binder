'use client';
import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { set } from 'mongoose';
import { json } from 'stream/consumers';
import { stringify } from 'querystring';

interface identifiers {
  identifiers: string[];
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

        const jsonArray = JSON.stringify(responseData);

        const scryfallResponse = await fetch('https://api.scryfall.com/cards/collection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonArray,
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
