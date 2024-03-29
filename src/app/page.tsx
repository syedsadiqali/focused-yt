//@ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState } from "react";
import Player from "./player";
import { Item } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Item[] | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const [selectedPlaylist, setSelectedPlaylist] = useState<Item[] | null>(null);

  const getData = async () => {
    setIsLoading(true);
    let url = `https://pahtvizbiqmajiqjskxz.supabase.co/functions/v1/get-vidoes/search`;

    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaHR2aXpiaXFtYWppcWpza3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2NDg1NzEsImV4cCI6MjAyNzIyNDU3MX0.ytsI17W8Sv2C5mUJt-S_js_q11Vt2x1yoePBudJ084I`,
      },
      body: JSON.stringify({ query: searchQuery }),
    });

    const content = await rawResponse.json();

    setVideos(content.items);
    setIsLoading(false);
  };

  const getPlaylistData = async (playlistId: string) => {
    setIsLoading(true);

    let url = `https://pahtvizbiqmajiqjskxz.supabase.co/functions/v1/get-vidoes/playlist`;

    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaHR2aXpiaXFtYWppcWpza3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2NDg1NzEsImV4cCI6MjAyNzIyNDU3MX0.ytsI17W8Sv2C5mUJt-S_js_q11Vt2x1yoePBudJ084I`,
      },
      body: JSON.stringify({ id: playlistId }),
    });

    const content = await rawResponse.json();

    setSelectedPlaylist(content?.items);
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex gap-2 flex-col ">
        <h1 className="text-center my-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Focused Youtube
        </h1>
        <div className="flex gap-2 mx-auto flex-col ">
        <Label className="w-[600px]">
          <Input
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="what do you want!"
          />
        </Label>
        <Button onClick={getData} disabled={isLoading}>
          {" "}
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
          Search Videos
        </Button>
        </div>
      </div>

      <main className="flex flex-row items-center py-4 px-8">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4">
            <div className="h-full max-h-[750px] overflow-y-auto">
              {videos?.map((video, index) => {
                if (video.type === "video") {
                  return (
                    <div key={index}>
                      <Image
                        src={video?.thumbnail?.thumbnails[0]?.url || ""}
                        width={video?.thumbnail?.thumbnails[0]?.width || 600}
                        height={video?.thumbnail?.thumbnails[0]?.height || 400}
                        alt={"hello"}
                        onClick={() => setSelectedVideo(video?.id)}
                      />
                      <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 max-w-[500px]">
                        {video?.title}
                      </h2>
                      {/* <p className="text-md text-muted-foreground max-w-[300px]">
                    {video?.}
                  </p> */}
                    </div>
                  );
                } else if (video.type === "playlist") {
                  return (
                    <div key={index}>
                      <Image
                        src={video?.thumbnail[0]?.thumbnails[0]?.url || ""}
                        width={video?.thumbnail[0]?.thumbnails[0]?.width || 600}
                        height={
                          video?.thumbnail[0]?.thumbnails[0]?.height || 400
                        }
                        alt={"hello"}
                        onClick={() => getPlaylistData(video?.id)}
                      />
                      <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 max-w-[500px]">
                        {video?.title}
                      </h2>
                      {/* <p className="text-md text-muted-foreground max-w-[300px]">
                    {video?.}
                  </p> */}
                    </div>
                  );
                }
              })}
            </div>
          </div>
          {selectedPlaylist && (
            <div>
              <div className="my-2">
                <Button
                  onClick={() => {
                    setSelectedPlaylist(null);
                    setSelectedVideo(null);
                  }}
                  className="mx-auto"
                >
                  Unselect Playlist
                </Button>
              </div>
              <div className="h-full max-h-[750px] overflow-y-auto">
                {selectedPlaylist?.map((video, index) => {
                  if (video.type === "video") {
                    return (
                      <div key={index}>
                        <Image
                          src={video?.thumbnail?.thumbnails[3]?.url || ""}
                          width={video?.thumbnail?.thumbnails[3]?.width || 600}
                          height={
                            video?.thumbnail?.thumbnails[3]?.height || 400
                          }
                          alt={"hello"}
                          onClick={() => setSelectedVideo(video?.id)}
                        />
                        <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 max-w-[500px]">
                          {video?.title}
                        </h2>
                        {/* <p className="text-md text-muted-foreground max-w-[300px]">
                    {video?.}
                  </p> */}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>

        {selectedVideo && (
          <div className="flex gap-4 flex-col mx-auto">
            <Player videoId={selectedVideo as string} />
            <Button onClick={() => setSelectedVideo(null)} className="mx-auto">
              Unselect Video
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
