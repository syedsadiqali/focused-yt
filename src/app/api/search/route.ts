import { NextRequest, NextResponse } from "next/server";

async function fetchYouTubeSearch(query: string, limit = 10) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();

  const match = html.split("var ytInitialData =")[1];
  if (!match) throw new Error("Could not find ytInitialData");
  const json = JSON.parse(match.split(";</script>")[0].trim());

  const contents =
    json?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents ?? [];

  const items: any[] = [];
  for (const section of contents) {
    if (!section.itemSectionRenderer) continue;
    for (const item of section.itemSectionRenderer.contents) {
      const vr = item.videoRenderer;
      const pr = item.playlistRenderer;
      if (vr?.videoId) {
        items.push({
          id: vr.videoId,
          type: "video",
          title: vr.title?.runs?.[0]?.text ?? "",
          channelTitle: vr.ownerText?.runs?.[0]?.text ?? vr.shortBylineText?.runs?.[0]?.text ?? "",
          thumbnail: vr.thumbnail,
          length: vr.lengthText ?? "",
          publishedTimeText: vr.publishedTimeText?.simpleText ?? "",
          viewCountText: vr.viewCountText?.simpleText ?? vr.shortViewCountText?.simpleText ?? "",
          isLive: vr.badges?.some((b: any) => b?.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW") ?? false,
        });
      } else if (pr?.playlistId) {
        items.push({
          id: pr.playlistId,
          type: "playlist",
          title: pr.title?.simpleText ?? "",
          channelTitle: pr.shortBylineText?.runs?.[0]?.text ?? "",
          thumbnail: pr.thumbnails,
          length: pr.videoCount ?? "",
          publishedTimeText: "",
          viewCountText: "",
          isLive: false,
        });
      }
      if (items.length >= limit) break;
    }
    if (items.length >= limit) break;
  }

  return { items };
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }
  const videos = await fetchYouTubeSearch(query, 10);
  return NextResponse.json(videos);
}
