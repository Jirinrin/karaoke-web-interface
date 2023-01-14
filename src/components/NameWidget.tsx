import { useAppContext } from "../util/Context";

export default function NameWidget() {
  const {userName, setUserName} = useAppContext()

  return (
    <div className="input-block pane name-widget">
      <label htmlFor="name-field">What's your name?</label>
      <div className="input-wrapper">
        <input id="name-field" placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)}></input>
        <button className="clear-btn" onClick={() => setUserName('')}>×</button>
      </div>
    </div>
  )
}
