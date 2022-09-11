import { useCallback, useEffect, useRef } from "react"
import FlipMove from 'react-flip-move';
import { Link, useParams } from "react-router-dom";
import { sessionToken, useApi } from "../util/api";
import { useAppContext } from "../util/Context";
import NameWidget from "./NameWidget";

export default function Queue() {
  const {queue, setQueue} = useAppContext()
  const api = useApi()
  const {domain} = useParams()

  const refreshInterval = useRef<NodeJS.Timer>()

  const refreshQueue = useCallback(() => api('get', 'q').then(setQueue), [api, setQueue])
  const vote = useCallback((songId: string) => api('post', 'vote', {songId}).then(setQueue), [api, setQueue])

  useEffect(() => {
    if (refreshInterval.current) clearInterval(refreshInterval.current)
    refreshQueue()
    refreshInterval.current = setInterval(refreshQueue, 10000)
    return () => clearInterval(refreshInterval.current)
  }, [refreshQueue])

  // annoying issue that disallows me from using this for now: https://github.com/joshwcomeau/react-flip-move/issues/273
  const FM = FlipMove as any

  return (
    <div className="Queue">
      <div className="input-block-flekz">
        <NameWidget />
      </div>
      <Link to={`/${domain}/songlist`} className="link-btn sticky-link-btn">REQUEST A SONG</Link>
      <h1>Queue</h1>


      <FM typeName="ul" appearAnimation="fade">
        {queue.map((s, i) =>
          <li className='song-item' key={s.id}>
            {/* <span className="queue-entry-place">{i}</span> */}
            <p className="q-item-label">{i === 0 ? 'Now playing' : i === 1 ? 'Next up' : `${i}.`} <em>(requested by {s.votes[0].match(/[^_]*/)?.[0] || 'Anonymous'})</em></p>
            <div className="q-item-flex">
              <span className="song-name">{s.id.replace(' : ', ' - ')}</span>
              <button className="votes-count vote-btn" disabled={i < 2 || !!s.votes.find(v => v.includes(sessionToken))} onClick={() => vote(s.id)}>
                {i < 2
                  ? `${s.votes.length} votes ■`
                  : s.votes.find(v => v.includes(sessionToken))
                    ? `${s.votes.length} votes ❤`
                    : `Vote (${s.votes.length})`
                }
              </button>
            </div>
          </li>
        )}
      </FM>

    </div>
  )
}
