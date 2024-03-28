"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState } from "react";
import Player from "./player";
import { Item } from "@/lib/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Item[] | null>(null);

  const [selected, setSelected] = useState<string | null>(null);

  const getData = async () => {
    let url = `https://pahtvizbiqmajiqjskxz.supabase.co/functions/v1/get-vidoes`;

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
  };

  return (
    <main className="flex flex-row items-center py-4 px-8">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Label>
            <Input
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="what do you want!"
            />
          </Label>
          <Button onClick={getData}>Search Videos</Button>
        </div>
        <div className="h-full max-h-[750px] overflow-y-auto">
          {videos?.map((video, index) => {
            console.log(video);
            return (
              <div key={index}>
                <Image
                  src={video?.thumbnail?.thumbnails[0]?.url || ""}
                  width={video?.thumbnail?.thumbnails[0]?.width || 600}
                  height={video?.thumbnail?.thumbnails[0]?.height || 400}
                  alt={"hello"}
                  onClick={() => setSelected(video?.id)}
                />
                <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 max-w-[500px]">
                  {video?.title}
                </h2>
                {/* <p className="text-md text-muted-foreground max-w-[300px]">
                  {video?.}
                </p> */}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 flex-col mx-auto">
        <Player videoId={selected as string} />
        <Button onClick={() => setSelected(null)} className="mx-auto">
          Unselect
        </Button>
      </div>
    </main>
  );
}
