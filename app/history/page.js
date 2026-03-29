"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoryPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/history")
            .then((res) => res.json())
            .then((res) => {
                setData(res.data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div style={{ padding: 40 }}>Loading...</div>;
    }
    
    return (
       <div style={{ padding: 40 }}>

        {/* ✅ NEW HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h1 style={{ fontSize: 24 }}>
                Test Case History
            </h1>

            <Link href="/">
                <button
    style={{
        background: "#00e5a0",
        color: "#000",
        border: "none",
        padding: "8px 14px",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 700,
    }}
>
    Go Back
</button>
                
            </Link>
        </div>
            {data.length === 0 && <p>No history found.</p>}

            {data.map((item) => (
                <div
                    key={item._id}
                    style={{
                        border: "1px solid #ccc",
                        padding: 16,
                        marginBottom: 12,
                        borderRadius: 8,
                    }}
                >
                    {/* ✅ Clickable content */}
                    <Link href={`/history/${item._id}`}>
                        <div style={{ cursor: "pointer" }}>
                            <h3>{item.requirement}</h3>

                            <p style={{ fontSize: 12, color: "#666" }}>
                                {new Date(item.createdAt).toLocaleString()}
                            </p>

                            <p>
                                <b>{item.testCases.length}</b> test cases generated
                            </p>
                        </div>
                    </Link>

                    {/* ✅ Delete Button */}
                    <button
                        onClick={async () => {
                            await fetch("/api/history", {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ id: item._id }),
                            });

                            // update UI
                            setData((prev) =>
                                prev.filter((d) => d._id !== item._id)
                            );
                        }}
                        style={{
                            marginTop: 10,
                            padding: "6px 12px",
                            background: "red",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                        }}
                    >
                        Delete
                    </button>
                    <div style={{ marginTop: 10 }}>
    
    {/* ⭐ Rating */}
    <select
        defaultValue={item.rating || 0}
        onChange={async (e) => {
            const rating = Number(e.target.value);

            await fetch("/api/history", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: item._id,
                    rating,
                    review: item.review || "",
                }),
            });
        }}
    >
        <option value={0}>Rate</option>
        <option value={1}>⭐ 1</option>
        <option value={2}>⭐ 2</option>
        <option value={3}>⭐ 3</option>
        <option value={4}>⭐ 4</option>
        <option value={5}>⭐ 5</option>
    </select>

    {/* 💬 Review Input */}
    <input
        type="text"
        placeholder="Write review..."
        defaultValue={item.review || ""}
        onBlur={async (e) => {
            const review = e.target.value;

            await fetch("/api/history", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: item._id,
                    rating: item.rating || 0,
                    review,
                }),
            });
        }}
        style={{
            marginLeft: 10,
            padding: 6,
            borderRadius: 4,
            border: "1px solid #ccc",
        }}
    />

</div>
                </div>
            ))}
        </div>
    );
}