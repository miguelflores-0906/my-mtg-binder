import Card from "@/model/Card";
import { NextResponse } from "next/server";
import dbConnect from "@/utils/mongodb";

export async function DELETE(request) {
    await dbConnect();

    try {
        // Parse the request body to get the card ID
        const { id } = await request.json();

        // Validate the ID
        if (!id) {
            return NextResponse.json({ message: "Card ID is required" }, { status: 400 });
        }

        // Delete the card from the database
        const result = await Card.deleteOne({ id });

        // Check if a card was deleted
        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Card not found" }, { status: 404 });
        }

        // Return a success response
        return NextResponse.json({ message: "Card deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting card from database" }, { status: 500 });
    }
}