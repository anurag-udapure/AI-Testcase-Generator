import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TestCase from "@/models/TestCase";

export async function GET() {
    try {
        await connectDB();

        const data = await TestCase.find().sort({ createdAt: -1 });

        return NextResponse.json({ data });

    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch history" },
            { status: 500 }
        );
    }
}
export async function DELETE(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return Response.json({ error: "ID required" }, { status: 400 });
        }

        const deleted = await TestCase.findByIdAndDelete(id);

        console.log("DELETED:", deleted);

        return Response.json({ success: true });

    } catch (err) {
        console.error("DELETE ERROR:", err);

        return Response.json(
            { error: "Failed to delete" },
            { status: 500 }
        );
    }
}
export async function PUT(request) {
    try {
        await connectDB();

        const { id, rating, review } = await request.json();

        const updated = await TestCase.findByIdAndUpdate(
            id,
            { rating, review },
            { new: true }
        );

        return Response.json({ success: true, data: updated });

    } catch (err) {
        return Response.json(
            { error: "Failed to update review" },
            { status: 500 }
        );
    }
}