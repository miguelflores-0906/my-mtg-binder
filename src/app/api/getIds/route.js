import Card from "@/model/Card";
import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";

export async function GET(request) {
    await dbConnect();

    try {
        const cards = await Card.find({}, { scryfallId: 1, name: 1, set_code: 1, collector_number: 1 });

        const cardIds = cards.map(card => ({
            scryfallId: card.scryfallId,
            name: card.name,
            set_code: card.set_code,
            collector_number: card.collector_number
        }));

        return NextResponse.json(cardIds, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching cards from database" }, { status: 500 });
    }
}