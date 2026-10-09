import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const KIM_API_KEY = process.env.KIM_API_KEY;
const KIM_BASE_URL = "https://zzz.cried.online";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const rawType = String(formData.get("type") ?? "").trim().toLowerCase();
  const normalizedType = ["icon", "custom"].includes(rawType)
    ? "avatar"
    : rawType;

  if (!file || !["avatar", "background", "cursor"].includes(normalizedType)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const response = await fetch(`${KIM_BASE_URL}/v1/upload`, {
      method: "POST",
      headers: {
        "x-kim-api-key": KIM_API_KEY || "",
        "x-kim-mode": "moe",
        "x-kim-visibility": "public",
        "x-filename": file.name || "upload",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || "Upload to storage provider failed" },
        { status: response.status }
      );
    }

    const result = await response.json();
    if (!result.success || !result.data?.url) {
      return NextResponse.json({ error: "Unexpected response from storage provider" }, { status: 500 });
    }

    return NextResponse.json({ url: result.data.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    // Extract file key from URL
    // KIM URLs are typically: https://zzz.cried.online/FILE_KEY
    const urlObj = new URL(url);
    const key = urlObj.pathname.slice(1); // Remove leading slash

    if (!key) {
      return NextResponse.json({ error: "Could not extract file key from URL" }, { status: 400 });
    }

    const response = await fetch(`${KIM_BASE_URL}/v1/delete`, {
      method: "DELETE",
      headers: {
        "x-kim-api-key": KIM_API_KEY || "",
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || "Deletion from storage provider failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
