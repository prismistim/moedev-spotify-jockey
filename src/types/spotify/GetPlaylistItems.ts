export interface ResponseGetPlaylistItems {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: Item2[];
}

interface Item2 {
  added_at: string;
  added_by: Addedby;
  is_local: boolean;
  item: Item;
  track: Item;
}

interface Item {
  album: Album;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: Externalids;
  external_urls: Externalurls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: Linkedfrom;
  restrictions: Restrictions;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

interface Linkedfrom {
}

interface Externalids {
  isrc: string;
  ean: string;
  upc: string;
}

interface Album {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: Externalurls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions: Restrictions;
  type: string;
  uri: string;
  artists: Artist[];
}

interface Artist {
  external_urls: Externalurls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface Restrictions {
  reason: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

interface Addedby {
  external_urls: Externalurls;
  href: string;
  id: string;
  type: string;
  uri: string;
}

interface Externalurls {
  spotify: string;
}
