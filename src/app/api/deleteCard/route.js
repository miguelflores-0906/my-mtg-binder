import Card from "@/model/Card";
import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";

export async function POST(request) {
    await dbConnect();

    const { scryfallId } = await request.json();

    try {
        // Find and delete the card with the specified scryfallId
        const result = await Card.deleteOne({ id: scryfallId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Card not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Card deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting card from database" }, { status: 500 });
    }
}