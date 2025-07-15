import Card from "@/model/Card";
import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";

export async function GET(request) {
    await dbConnect();

    try {
        // Fetch all cards from the database
        const identifiers = await Card.find({}, { id: 1, _id: 0 }).lean();

        // Return the identifiers as a JSON response
        return NextResponse.json({ identifiers }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching cards from database" }, { status: 500 });
    }
}