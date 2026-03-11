import { env } from "cloudflare:workers"
import type { ResponseGetPlaylist } from "../types/spotify/GetPlaylist"
import type { ResponseGetPlaylistItems } from "../types/spotify/GetPlaylistItems"

type ResponseAuth = {
  access_token: string,
  token_type: string,
  expires_in: number
}

const requestHeader = (token: string) => {
  return {
    'Authorization': `Bearer ${token}`
  }
}

export const getToken = async () => {
  const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)
  const formData = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: env.SPOTIFY_REFRESH_TOKEN
  })
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    const resJson = await res.json<ResponseAuth>()
    console.log(resJson)
    return resJson.access_token ?? ''
  } catch (e) {
    console.log(e)
  }
}

export const getPlaylistItemsCount = async (token: string) => {
  if (!token) return

  const res = await fetch(`https://api.spotify.com/v1/playlists/${env.SPOTIFY_PLAYLIST_ID}?fields=items%28total%29`, {
    headers: requestHeader(token)
  })

  const resJson = await res.json<ResponseGetPlaylist>()
  return resJson
}

export const getPlaylistItems = async (token: string, perPage: number, offset: number) => {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${env.SPOTIFY_PLAYLIST_ID}/items?limit=${perPage}&offset=${offset}`, {
    headers: requestHeader(token)
  })

  const resJson = await res.json<ResponseGetPlaylistItems>()
  return resJson
}
