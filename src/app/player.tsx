"use client";

import YouTube, { YouTubeProps } from "react-youtube";

export default function Player({
  videoId = "",
  width = 640,
  height = 360,
}: {
  videoId?: string;
  width?: number;
  height?: number;
}) {
  const opts: YouTubeProps["opts"] = {
    height: String(height),
    width: String(width),
    playerVars: {
      autoplay: 1,
      rel: 0,
    },
  };

  return <YouTube videoId={videoId} opts={opts} />;
}
