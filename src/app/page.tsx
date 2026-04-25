//@ts-nocheck
"use client";

import { useState } from "react";
import Player from "./player";
import { ThemeToggle } from "./theme-toggle";
import { Item } from "@/lib/types";
import { Loader2, Search, ListVideo } from "lucide-react";

type GridSize = "comfortable" | "default" | "compact";
type PlayerSize = "sm" | "md" | "theater";

const GRID_COLS: Record<GridSize, string> = {
  comfortable: "grid-cols-2 xl:grid-cols-3",
  default: "grid-cols-3 xl:grid-cols-4",
  compact: "grid-cols-4 xl:grid-cols-6",
};

const PLAYER_DIMS: Record<Exclude<PlayerSize, "theater">, { w: number; h: number; sidebar: string }> = {
  sm: { w: 640, h: 360, sidebar: "w-80" },
  md: { w: 960, h: 540, sidebar: "w-72" },
};

function getBestThumb(video: Item) {
  if (video.type === "video") {
    const thumbs = video.thumbnail?.thumbnails;
    return thumbs?.at(-1) || thumbs?.[0];
  }
  const thumbs = (video.thumbnail as any)?.[0]?.thumbnails;
  return thumbs?.at(-1) || thumbs?.[0];
}

function VideoCard({
  video,
  onClick,
  compact = false,
  active = false,
}: {
  video: Item;
  onClick: () => void;
  compact?: boolean;
  active?: boolean;
}) {
  const thumb = getBestThumb(video);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex gap-2 cursor-pointer rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${active ? "bg-gray-100 dark:bg-gray-800" : ""}`}
      >
        <div className="relative shrink-0 w-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ aspectRatio: "16/9" }}>
          {thumb?.url && (
            <img src={thumb.url} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
          )}
          {video.length?.simpleText && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
              {video.length.simpleText}
            </span>
          )}
        </div>
        <div className="py-0.5 min-w-0">
          <p className="text-xs font-semibold line-clamp-3 text-gray-900 dark:text-gray-100 leading-snug">{video.title}</p>
          {video.channelTitle && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{video.channelTitle}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer group">
      <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800" style={{ aspectRatio: "16/9" }}>
        {thumb?.url && (
          <img
            src={thumb.url}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        )}
        {video.length?.simpleText && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {video.length.simpleText}
          </span>
        )}
        {video.type === "playlist" && (
          <div className="absolute inset-y-0 right-0 w-1/4 bg-black/60 flex flex-col items-center justify-center text-white gap-1 rounded-r-xl">
            <ListVideo className="h-5 w-5" />
            <span className="text-[10px] font-medium">Playlist</span>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 leading-snug">{video.title}</p>
        {video.channelTitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{video.channelTitle}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 flex gap-1.5 flex-wrap">
          {video.viewCountText && <span>{video.viewCountText}</span>}
          {video.viewCountText && video.publishedTimeText && <span>·</span>}
          {video.publishedTimeText && <span>{video.publishedTimeText}</span>}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Item[] | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Item[] | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>("default");
  const [playerSize, setPlayerSize] = useState<PlayerSize>("sm");

  const getData = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setSelectedVideo(null);
    setSelectedPlaylist(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const content = await res.json();
      setVideos(content.items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaylistData = async (playlistId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playlistId }),
      });
      const content = await res.json();
      setSelectedPlaylist(content?.items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const displayVideos = selectedPlaylist || videos;

  const handleVideoClick = (video: Item) => {
    if (video.type === "video") setSelectedVideo(video.id);
    else getPlaylistData(video.id);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 px-4 h-14 max-w-screen-2xl mx-auto">
          <button
            onClick={() => { setSelectedVideo(null); setSelectedPlaylist(null); }}
            className="flex items-center gap-1.5 text-base font-bold shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-red-600 text-xl">▶</span>
            <span className="text-gray-900 dark:text-gray-100">FocusedTube</span>
          </button>

          <div className="flex flex-1 max-w-xl mx-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && getData()}
              placeholder="Search"
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 border-r-0 rounded-l-full outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              onClick={getData}
              disabled={isLoading}
              className="px-5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-r-full flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                : <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              }
            </button>
          </div>

          {/* Grid size toggle */}
          {videos && !selectedVideo && (
            <div className="flex items-center gap-0.5 ml-auto border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
              {(["comfortable", "default", "compact"] as GridSize[]).map((size, i) => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  title={size.charAt(0).toUpperCase() + size.slice(1)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    gridSize === size
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {["L", "M", "S"][i]}
                </button>
              ))}
            </div>
          )}

          <ThemeToggle />
        </div>
      </header>

      {/* Player view */}
      {selectedVideo ? (
        <div className={playerSize === "theater" ? "w-full" : "flex gap-4 p-4 max-w-screen-2xl mx-auto"}>

          {/* Size toggle + back — shown above player in theater, inline otherwise */}
          {playerSize === "theater" && (
            <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← Back to results
              </button>
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 ml-auto">
                {([["sm", "Small"], ["md", "Medium"], ["theater", "Theater"]] as [PlayerSize, string][]).map(([size, label]) => (
                  <button key={size} onClick={() => setPlayerSize(size)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${playerSize === size ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theater: full-width player */}
          {playerSize === "theater" ? (
            <div>
              <div className="w-full bg-black">
                <Player
                  videoId={selectedVideo}
                  width={typeof window !== "undefined" ? document.documentElement.clientWidth : 1280}
                  height={typeof window !== "undefined" ? Math.round(document.documentElement.clientWidth * 9 / 16) : 720}
                />
              </div>
              {displayVideos && (
                <div className="px-4 py-4 max-w-screen-2xl mx-auto">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    {selectedPlaylist ? "Playlist" : "Up next"}
                  </p>
                  <div className={`grid gap-x-4 gap-y-6 ${GRID_COLS["default"]}`}>
                    {displayVideos.map((video, i) =>
                      video.type === "video" ? (
                        <VideoCard key={i} video={video} onClick={() => handleVideoClick(video)}
                          active={video.id === selectedVideo} />
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Small / Medium: side-by-side layout */
            <>
              <div className="flex-1 min-w-0">
                <Player
                  videoId={selectedVideo}
                  width={PLAYER_DIMS[playerSize as "sm" | "md"].w}
                  height={PLAYER_DIMS[playerSize as "sm" | "md"].h}
                />
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    ← Back to results
                  </button>
                  <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5 ml-auto">
                    {([["sm", "Small"], ["md", "Medium"], ["theater", "Theater"]] as [PlayerSize, string][]).map(([size, label]) => (
                      <button key={size} onClick={() => setPlayerSize(size)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${playerSize === size ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {displayVideos && (
                <div className={`${PLAYER_DIMS[playerSize as "sm" | "md"].sidebar} shrink-0 overflow-y-auto`} style={{ maxHeight: "calc(100vh - 72px)" }}>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
                    {selectedPlaylist ? "Playlist" : "Up next"}
                  </p>
                  <div className="space-y-1">
                    {displayVideos.map((video, i) =>
                      video.type === "video" ? (
                        <VideoCard
                          key={i}
                          video={video}
                          onClick={() => handleVideoClick(video)}
                          compact
                          active={video.id === selectedVideo}
                        />
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          {selectedPlaylist && (
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← Back to search
              </button>
              <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Playlist videos</span>
            </div>
          )}

          {displayVideos ? (
            <div className={`grid gap-x-4 gap-y-8 ${GRID_COLS[gridSize]}`}>
              {displayVideos.map((video, index) => (
                <VideoCard
                  key={index}
                  video={video}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 text-gray-300 dark:text-gray-700 select-none">
              <Search className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Search for something to watch</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
