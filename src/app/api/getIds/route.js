import Card from "@/model/Card";
import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";

export async function GET(request) {
    await dbConnect();

    try {
        // Fetch all cards from the database
        const cards = await Card.find({}, { identifiers: 1, _id: 0 });

        // Return the identifiers as a JSON response
        return NextResponse.json({ cards }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching cards from database" }, { status: 500 });
    }
}