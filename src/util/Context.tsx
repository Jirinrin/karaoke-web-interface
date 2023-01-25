import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { Alert, AlertModal } from "../components/AlertModal";
import { EnhancedSongList, Q, SongList } from '../util/types';
import { useLastNonNull } from "./hoox";

export type Genre = `w-${string}` | `j-${string}` | string
export const isGenre = (g: Genre) => g !== 'unincluded';

type ViewMode = 'list'|'tiled'

interface AppContext {
  songlist: EnhancedSongList|null
  genres: Genre[]
  userName: string
  setUserName: (to: string) => void
  queue: Q|null
  setQueue: (to: Q) => void
  inclFilters: Record<Genre, boolean>
  setInclFilters: (to: Record<Genre, boolean>) => void
  setAlert: (alert: Alert) => void
  viewMode: ViewMode
  setViewMode: (to: ViewMode) => void
  adminToken: string|null
  setAdminToken: (to: string|null) => void
}

const Ctx = createContext<AppContext>({} as AppContext)

export function useAppContext() {
  return useContext(Ctx)
}

const SONGLISTS_BY_DOMAIN: Record<string, string> = {'dz-owee': 'songlist-w', q42: 'songlist-w'}

export default function ApplicationContext({children}: {children: React.ReactNode}) {
  const [songlist, setSonglist] = useState<EnhancedSongList|null>(null)
  const [userName, setUserName] = useState(localStorage.getItem('username') ?? '')
  const [queue, setQueue] = useState<Q|null>(null)

  const domain = useLocation().pathname.match(/^\/([^/]+)/)?.[1]
  const songlistName = domain === 'songlist' ? 'songlist' : SONGLISTS_BY_DOMAIN[domain ?? ''] ?? 'songlist'
  useEffect(() => {
    fetch(`/${songlistName}.json`).then(r => r.json())
      .then((sl: SongList) => setSonglist(Object.fromEntries(Object.entries(sl).map(([g,ss]) => [g, ss.map(s => ({...s, g}))]))))
  }, [songlistName])

  const genres = useMemo(() => songlist ? Object.keys(songlist) : [], [songlist])

  // todo: allow some init filters set through the querystring or sth (e.g. west=true)
  const [inclFilters, setInclFilters] = useState<Record<Genre, boolean>>({})
  const [adminToken, setAdminToken] = useState<string|null>(localStorage.getItem('admintoken') || null)

  useEffect(() => { setInclFilters(genres.filter(isGenre).reduce((acc, g) => ({...acc, [g]: false}), {})) }, [genres])

  const [viewMode, setViewMode] = useState<ViewMode>(window.location.search.includes('tiled') ? 'tiled' : 'list') // debug feature to activate tile mode (don't want to activate it with a btn yet)

  const [alert, setAlert] = useState<Alert|null>(null)
  const shownAlert = useLastNonNull(alert)

  useEffect(() => { localStorage.setItem('username', userName) }, [userName])
  useEffect(() => { adminToken && localStorage.setItem('admintoken', adminToken) }, [adminToken])

  return (
    <Ctx.Provider value={{songlist, genres, userName, setUserName, queue, setQueue, inclFilters, setInclFilters, setAlert, viewMode, setViewMode, adminToken, setAdminToken}}>
      {children}
      <AlertModal visible={!!alert} alert={shownAlert} hide={() => setAlert(null)} />
    </Ctx.Provider>
  )
}
