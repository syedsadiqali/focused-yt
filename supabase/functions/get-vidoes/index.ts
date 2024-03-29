// @ts-nocheck

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import * as youtubesearchapi from "npm:youtube-search-api@1.2.1";
import { corsHeaders } from "../cors.ts";

const SEARCH_ROUTE = new URLPattern({ pathname: "/get-vidoes/search" });
const PLAYLIST_ROUTE = new URLPattern({ pathname: "/get-vidoes/playlist" });

const SUGGEST_ROUTE = new URLPattern({ pathname: "/get-vidoes/suggest" });
const CHANNEL_ROUTE = new URLPattern({ pathname: "/get-vidoes/channel" });
const VIDEO_DETAIL_ROUTE = new URLPattern({ pathname: "/get-vidoes/video" });

async function getSearch(req) {
  const { query, playlists, count, type } = await req.json();

  if (!query) {
    return { error: "Query is required" };
  }
  
  let type1 = type ? { type: type } : undefined;
  
  var isTrueSet = (String(playlists).toLowerCase() === 'true');


  const videos = await youtubesearchapi.GetListByKeyword(
    query,
    isTrueSet || true,
    count || 10,
    type1
  );

  return { result: videos };
}

async function getPlaylist(req) {
  const { id, count } = await req.json();

  if (!id) {
    return { error: "Playlist id is required!" };
  }

  const videos = await youtubesearchapi.GetPlaylistData(id, count || 10);

  return { result: videos };
}

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let searchRouteMatch = SEARCH_ROUTE.exec(req.url);
    let playlistRouteMatch = PLAYLIST_ROUTE.exec(req.url);

    let result1, error1;
    if (searchRouteMatch) {
      const { result, error } = await getSearch(req);
      result1 = result;
      error1 = error;
    } else if (playlistRouteMatch) {
      const { result, error } = await getPlaylist(req);
      result1 = result;
      error1 = error;
    }

    if (error1) {
      return new Response(JSON.stringify({ error1 }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result1), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-vidoes' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
