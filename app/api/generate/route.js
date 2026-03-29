import { connectDB } from "@/lib/db";
import TestCase from "@/models/TestCase";
import { NextResponse } from "next/server";

// ✅ Extract JSON safely
function extractJSON(text) {
    const match = text.match(/\[\s*{[\s\S]*}\s*\]/);
    return match ? match[0] : null;
}
export async function POST(request) {
    try {
        const body = await request.json();
        const { requirement, context = "", maxCases = 10 } = body;

        // ✅ Validation
        if (!requirement || requirement.trim().length < 10) {
            return NextResponse.json(
                { error: "Requirement must be at least 10 characters." },
                { status: 400 }
            );
        }

        if (maxCases > 25) {
            return NextResponse.json(
                { error: "Max 25 test cases allowed." },
                { status: 400 }
            );
        }

        const prompt = `
You are a senior QA engineer.

Return ONLY valid JSON.
No explanation, no markdown.

Format:
[
 {
  "id": "TC001",
  "title": "string",
  "category": "Functional",
  "priority": "High",
  "scenario": "string",
  "steps": ["step1", "step2"],
  "expected_result": "string",
  "test_type": "Positive"
 }
]

Requirement:
${requirement}

Generate exactly ${maxCases} test cases.
`;

        // ✅ API CALL (FIXED HEADERS)
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "TestCase Generator"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
            }),
        });

        const data = await response.json();

        // ✅ DEBUG (VERY IMPORTANT)
    console.log("API KEY LOADED:", !!process.env.OPENROUTER_API_KEY);

        // ✅ Handle API errors
        if (data.error) {
            throw new Error(data.error.message || "OpenRouter API error");
        }

        if (!data.choices || data.choices.length === 0) {
            throw new Error("No response from AI");
        }

        let raw = data.choices[0].message.content.trim();

        console.log("AI RAW:", raw);

        // ✅ Remove markdown if exists
        if (raw.startsWith("```")) {
            raw = raw.replace(/```json|```/g, "").trim();
        }

        // ✅ Extract JSON
        const jsonString = extractJSON(raw);

        if (!jsonString) {
            throw new Error("AI did not return valid JSON");
        }

        let testCases;

        try {
            testCases = JSON.parse(jsonString);
        } catch (err) {
            throw new Error("Failed to parse AI response");
        }

        // ✅ Normalize structure
        testCases = testCases.map((tc, i) => ({
            id: tc.id || `TC${String(i + 1).padStart(3, "0")}`,
            title: tc.title || "Untitled",
            category: tc.category || "Functional",
            priority: tc.priority || "Medium",
            scenario: tc.scenario || "",
            steps: Array.isArray(tc.steps) ? tc.steps : [],
            expected_result: tc.expected_result || "",
            test_type: tc.test_type || "Positive",
        }));

        // ✅ Save to database
        await connectDB();

        await TestCase.create({
            requirement,
            context,
            testCases,
        });

        return NextResponse.json({ testCases });

    } catch (err) {
        console.error("ERROR:", err.message);

        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 500 }
        );
    }
}