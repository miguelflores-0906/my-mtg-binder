import Card from "@/model/Card";
import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";

export async function POST(request) {
    await dbConnect();

    const {scryfallId, name, imageUrl} = await request.json();

    try {
        const newCard = new Card({
            scryfallId,
            name,
            imageUrl
        });

        await newCard.save();
    }
    catch (error) {
        return NextResponse.json({message:"Error saving card to database"}, {status: 500});
    }
    return NextResponse.json({message: "Card added successfully"}, {status: 200});
}