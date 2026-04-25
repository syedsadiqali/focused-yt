import { GetPlaylistData } from "youtube-search-api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Playlist id is required" }, { status: 400 });
  }

  const videos = await GetPlaylistData(id, 10);
  return NextResponse.json(videos);
}
