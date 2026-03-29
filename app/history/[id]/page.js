"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("/api/history")
            .then((res) => res.json())
            .then((res) => {
                const item = res.data.find((d) => d._id === id);
                setData(item);
            });
    }, [id]);

    if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

    return (
        <div style={{ padding: 40 }}>
            <h1 style={{ fontSize: 24 }}>{data.requirement}</h1>

            {data.testCases.map((tc) => (
                <div
                    key={tc.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: 16,
                        marginTop: 12,
                        borderRadius: 8,
                    }}
                >
                    <h3>{tc.title}</h3>
                    <p><b>Scenario:</b> {tc.scenario}</p>

                    <p><b>Steps:</b></p>
                    <ul>
                        {tc.steps.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>

                    <p><b>Expected:</b> {tc.expected_result}</p>
                </div>
            ))}
        </div>
    );
}