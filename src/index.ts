/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your Worker in action
 * - Run `npm run deploy` to publish your Worker
 *
 * Bind resources to your Worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import type { Note } from './types'
import { env } from 'cloudflare:workers'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'

dayjs.locale('ja')

const mapNoteText = (url: string, userDisplayName: string) => {
  return `#listen_it Spotifyプレイリストに新しい曲が追加されました！\n(by ${userDisplayName})\n${url}`
}

const createNote = async (text: Note['text']) => {
  const note: Note = {
    visibility: 'public',
    localOnly: false,
    text: text
  }

  const res = await fetch(`https://${env.MISSKEY_HOST}/api/notes/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.MISSKEY_API_TOKEN}`
    },
    body: JSON.stringify(note)
  })

  if (!res.ok) {
    throw new Error(`Failed to create note: ${res.status} ${res.statusText}`)
  }
}

export default {
  async fetch(req) {
    const url = new URL(req.url)
    url.pathname = '/__scheduled'
    url.searchParams.append('cron', '* * * * *')
    return new Response(
      `To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`
    )
  },

  // The scheduled handler is invoked at the interval set in our wrangler.jsonc's
  // [[triggers]] configuration.
  async scheduled(event, env, ctx): Promise<void> {
    const api = SpotifyApi.withClientCredentials(
      env.SPOTIFY_CLIENT_ID,
      env.SPOTIFY_CLIENT_SECRET
    )

    const lastPostedTrackId = await env.MoedevSpotifyJockey.get('lastPostedTrackId')
    const lastUpdatedAt = await env.MoedevSpotifyJockey.get('lastUpdatedAt')
    console.log(`Last posted track ID: ${lastPostedTrackId}, Last updated at: ${lastUpdatedAt}`)

    const playlist = await api.playlists.getPlaylist(env.SPOTIFY_PLAYLIST_ID)

    if (!playlist) {
      throw new Error(`Playlist with ID ${env.SPOTIFY_PLAYLIST_ID} not found`)
    }

    if (!playlist.tracks || playlist.tracks.total === 0) {
      console.log('No tracks found in the playlist.')
      return
    }

    const target = {
      url: '',
      trackId: '',
      user: {
        id: '',
        displayName: ''
      },
      updatedAt: ''
    }

    for (let i = 0; i < playlist.tracks.total / 50; i++) {
      const offset = playlist.tracks.total < 100 ? 50 * i : 50 * (playlist.tracks.total / 50 - 1 + i)
      const res = await api.playlists.getPlaylistItems(env.SPOTIFY_PLAYLIST_ID, undefined, undefined, 50, offset)

      if (!res.items || res.items.length === 0) {
        console.log(`No items found in the playlist at offset ${offset}.`)
        continue
      }

      // 最終更新日時より前のものが取れれば次のページへ
      if (dayjs(res.items.reverse()[0].added_at).isBefore(dayjs(lastUpdatedAt))) continue

      // 初回
      if (!lastPostedTrackId && !lastUpdatedAt) {
        target.url = res.items[0].track.external_urls.spotify
        target.trackId = res.items[0].track.id
        target.user.id = res.items[0].added_by.id
        target.updatedAt = res.items[0].added_at
        console.log(`No last posted track ID found, using first track: ${target.url}`)
        break
      }

      // 最後に取得した要素の日時より後のものを探す
      const index = res.items.findIndex(item => dayjs(item.added_at).isAfter(dayjs(lastUpdatedAt)))
      if (index === -1) break

      target.url = res.items[index]?.track.external_urls.spotify
      target.trackId = res.items[index]?.track.id
      target.user.id = res.items[index]?.added_by.id
      target.updatedAt = res.items[index]?.added_at
    }

    if (!target.url || !target.trackId) {
      console.log('No new track found to post.')
      return
    }

    target.user.displayName = (await api.users.profile(target.user.id)).display_name

    console.log(`Posting new track: ${target.url} (ID: ${target.trackId})`)
    await createNote(mapNoteText(target.url, target.user.displayName))

    await env.MoedevSpotifyJockey.put('lastUpdatedAt', target.updatedAt)
    await env.MoedevSpotifyJockey.put('lastPostedTrackId', target.trackId)
    console.log(`Updated last posted track ID to: ${target.trackId}, last updated at: ${target.updatedAt}`)
  }
} satisfies ExportedHandler<Env>

