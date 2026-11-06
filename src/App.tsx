import type * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowDownUp, Award, Bell, Check, ChevronDown, CircleHelp, Coins, Compass,
  Download, Gamepad2, Gauge, Gift, Globe2, Home, Image, Link2, LockKeyhole,
  Mic, Monitor, Package, Play, Radio, RotateCcw, Send, Settings, ShieldCheck,
  Smartphone, Sparkles, Star, Trophy, UserRound, Users, Vibrate, Wifi, WifiOff, X, Plus, Minus,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { CompanionMessage, ConnectionMode, MinigameDescriptor, PlayerState, PhoneStatus } from './domain/protocol';
import { makeMessage, MINIGAMES } from './domain/protocol';
import { cloneDemoPlayers, DEMO_SESSION_ID, CHARACTER_PORTRAITS, PLAYER_SLOT_MARKERS, MP7_GAME_LOGO, MIC_CONTROL_ROOM_SPRITE } from './lib/demoSession';

type Page = 'overview' | 'controller' | 'profile' | 'rewards' | 'workshop' | 'settings';
type LogEntry = { id: number; time: string; type: string; detail: string; tone?: 'good' | 'warn' | 'plain' };
type BowserEvent = { id: number; turn: number; title: string; detail: string };

const BOARDS = ['Pagoda Peak', 'Windmillville', 'Neon Heights', 'Grand Canal', 'Pyramid Park', "Bowser's Enchanted Inferno"] as const;
const CHARACTERS = [
  { id: 'mario', name: 'Mario' }, { id: 'luigi', name: 'Luigi' },
  { id: 'peach', name: 'Peach' }, { id: 'yoshi', name: 'Yoshi' },
  { id: 'wario', name: 'Wario' }, { id: 'waluigi', name: 'Waluigi' },
  { id: 'daisy', name: 'Daisy' }, { id: 'birdo', name: 'Birdo' },
  { id: 'toad', name: 'Toad' }, { id: 'boo', name: 'Boo' },
  { id: 'drybones', name: 'Dry Bones' }, { id: 'dk', name: 'Donkey Kong' },
] as const;
const BOWSER_EVENT_PRESETS = [
  { title: 'Bowser Revolution', detail: 'Coins shifted around the board.' },
  { title: 'Bowser Shuffle', detail: 'Player positions were shuffled.' },
  { title: 'Bowser Minigame', detail: 'A Bowser challenge interrupted the cruise.' },
  { title: 'Bowser Coin Event', detail: 'A player was caught in a Bowser coin event.' },
] as const;

const pageLabels: Record<Page, string> = {
  overview: 'Overview', controller: 'Companion view', profile: 'Harbor ID', rewards: 'Rewards', workshop: 'Workshop', settings: 'Settings',
};

function timeLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function statusLabel(status: PhoneStatus) {
  return ({ connected: 'Connected', not_connected: 'Not connected', disconnected: 'Disconnected', reconnecting: 'Reconnecting' })[status];
}

/** Displays a supplied local MP7 portrait, with an initial fallback if the file is missing. */
function CharPortrait({ characterId, characterName }: { characterId: string; characterName: string }) {
  const portraitSrc = CHARACTER_PORTRAITS[characterId];
  return <span className="character-portrait" role="img" aria-label={characterName}>
    <span className="character-initial" aria-hidden="true" style={{ display: portraitSrc ? 'none' : 'grid' }}>{characterName.slice(0, 1)}</span>
    {portraitSrc && <img src={portraitSrc} alt="" aria-hidden="true" onError={(event) => {
      event.currentTarget.style.display = 'none';
      const fallback = event.currentTarget.previousElementSibling as HTMLElement | null;
      if (fallback) fallback.style.display = 'grid';
    }}/>}
  </span>;
}

function App() {
  const [page, setPage] = useState<Page>('overview');
  const [players, setPlayers] = useState<PlayerState[]>(cloneDemoPlayers);
  const [activePlayerId, setActivePlayerId] = useState('P1');
  const [mode, setMode] = useState<ConnectionMode>('local');
  const [sessionActive, setSessionActive] = useState(true);
  const [pairingOpen, setPairingOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeMinigame, setActiveMinigame] = useState<MinigameDescriptor | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, time: timeLabel(), type: 'PLAYER_STATE', detail: 'Player 1 dashboard synchronized.', tone: 'good' },
    { id: 2, time: timeLabel(), type: 'SESSION_READY', detail: 'Demo session Harbor Cruise is ready.', tone: 'plain' },
  ]);
  const [micEnabled, setMicEnabled] = useState(false);
  const [tiltValue, setTiltValue] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [downloadPrompt, setDownloadPrompt] = useState<string | null>(null);
  const [installedItems, setInstalledItems] = useState<string[]>([]);
  const [currentBoard, setCurrentBoard] = useState<string>(BOARDS[0]);
  const [currentTurn, setCurrentTurn] = useState(7);
  const [bowserEvents, setBowserEvents] = useState<BowserEvent[]>([]);
  const [characterPickerPlayerId, setCharacterPickerPlayerId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [canvasHasInk, setCanvasHasInk] = useState(false);

  const activePlayer = useMemo(() => players.find((player) => player.playerId === activePlayerId) ?? players[0], [players, activePlayerId]);
  const connectedCount = players.filter((player) => player.phoneStatus === 'connected').length;

  function log(type: string, detail: string, tone: LogEntry['tone'] = 'plain') {
    setLogs((current) => [{ id: Date.now() + Math.random(), time: timeLabel(), type, detail, tone }, ...current].slice(0, 10));
  }

  function send(message: CompanionMessage, detail: string) {
    const stamped = makeMessage(message);
    log(stamped.type, detail, 'good');
    // In this starter build, messages are recorded by the Windows/phone simulator.
    // The live WebSocket adapter will be connected when the game-side service exists.
    console.info('[MP7 Companion protocol]', stamped);
  }

  function updatePlayer(playerId: string, updater: (player: PlayerState) => PlayerState) {
    setPlayers((current) => current.map((player) => player.playerId === playerId ? updater(player) : player));
  }

  function sendPlayerState(player: PlayerState) {
    send({ type: 'PLAYER_STATE', sessionId: DEMO_SESSION_ID, player, sentAt: Date.now() }, `${player.displayName}'s player dashboard updated.`);
  }

  function setPlayerStatus(playerId: string, status: PhoneStatus) {
    updatePlayer(playerId, (player) => ({ ...player, phoneStatus: status }));
    send({ type: 'PHONE_STATUS', sessionId: DEMO_SESSION_ID, playerId, status, sentAt: Date.now() }, `${playerId} phone status changed to ${statusLabel(status)}.`);
    if (playerId === activePlayerId) {
      setNotice(status === 'connected' ? 'Phone connected. Your player dashboard is ready.' : status === 'not_connected' ? 'Toadsworth: “No phone app connected. That is quite all right! We shall continue with the regular controller.”' : 'Phone connection changed. The match can continue with a regular controller.');
    }
  }

  function startMinigame(game: MinigameDescriptor) {
    if (!sessionActive) {
      setNotice('Start the demo session before sending game events.');
      return;
    }
    if (activePlayer.phoneStatus !== 'connected') {
      setNotice(`Toadsworth: “It seems ${activePlayer.displayName} does not have the phone app connected. That's quite all right! Please use the regular controller.”`);
      log('PHONE_OPTIONAL', `${activePlayer.playerId} has no active phone; traditional controller fallback continues.`, 'warn');
      return;
    }
    setActiveMinigame(game);
    setPage('controller');
    setTapCount(0);
    setSelectedAnswer(null);
    setTiltValue(0);
    setCanvasHasInk(false);
    send({ type: 'MINIGAME_START', sessionId: DEMO_SESSION_ID, playerId: activePlayerId, minigame: game, sentAt: Date.now() }, `${game.title} opened for ${activePlayer.displayName}.`);
  }

  function endMinigame() {
    if (!activeMinigame) return;
    send({ type: 'MINIGAME_END', sessionId: DEMO_SESSION_ID, playerId: activePlayerId, minigameId: activeMinigame.id, result: 'demo_complete', sentAt: Date.now() }, `${activeMinigame.title} ended; returning to player dashboard.`);
    setActiveMinigame(null);
    setMicEnabled(false);
  }

  function sendInput(input: Record<string, unknown>, description: string) {
    if (!activeMinigame) return;
    send({ type: 'MINIGAME_INPUT', sessionId: DEMO_SESSION_ID, playerId: activePlayerId, minigameId: activeMinigame.id, input, sentAt: Date.now() }, description);
  }

  function updatePlayerStat(playerId: string, stat: 'coins' | 'stars', amount: number) {
    const current = players.find((player) => player.playerId === playerId);
    if (!current) return;
    const next = { ...current, [stat]: Math.max(0, current[stat] + amount) };
    updatePlayer(playerId, () => next);
    sendPlayerState(next);
  }

  function updateCoins(amount: number) { updatePlayerStat(activePlayerId, 'coins', amount); }

  function updateTurn(nextTurn: number) {
    const bounded = Math.min(players[0]?.totalTurns ?? 15, Math.max(1, nextTurn));
    setCurrentTurn(bounded);
    setPlayers((current) => current.map((player) => ({ ...player, currentTurn: bounded })));
    log('TURN_CHANGED', `Turn tracker moved to turn ${bounded} of ${players[0]?.totalTurns ?? 15}.`, 'plain');
  }

  function addBowserEvent(title: string) {
    const preset = BOWSER_EVENT_PRESETS.find((event) => event.title === title);
    if (!preset) return;
    const event = { id: Date.now() + Math.random(), turn: currentTurn, ...preset };
    setBowserEvents((current) => [event, ...current].slice(0, 20));
    log('BOWSER_TIME', `${preset.title}: ${preset.detail}`, 'warn');
    setNotice(`${preset.title} recorded for turn ${currentTurn}.`);
  }

  function setPlayerCharacter(playerId: string, characterId: string) {
    const character = CHARACTERS.find((entry) => entry.id === characterId);
    const player = players.find((entry) => entry.playerId === playerId);
    if (!character || !player) return;
    const next = { ...player, characterId: character.id, characterName: character.name };
    updatePlayer(playerId, () => next);
    sendPlayerState(next);
    setCharacterPickerPlayerId(null);
    setNotice(`${player.displayName} is now playing as ${character.name}.`);
  }

  function resetDemo() {
    setPlayers(cloneDemoPlayers());
    setActivePlayerId('P1');
    setActiveMinigame(null);
    setCurrentBoard(BOARDS[0]);
    setCurrentTurn(7);
    setBowserEvents([]);
    setCharacterPickerPlayerId(null);
    setSessionActive(true);
    setNotice('Demo session reset to its starting state.');
    log('DEMO_RESET', 'Restored sample player states and connected devices.', 'plain');
  }

  function sendNotification() {
    send({ type: 'PLAYER_NOTIFICATION', sessionId: DEMO_SESSION_ID, playerId: activePlayerId, title: 'A message from Toadsworth', message: 'Your turn is coming up! Get ready.', sentAt: Date.now() }, `Private notification sent to ${activePlayer.displayName}.`);
    setNotice('Toadsworth: “Your turn is coming up! Get ready.”');
  }

  function requestMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice('Microphone access is not available in this preview. Try the Windows desktop build or a secure phone connection.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
      setMicEnabled(true);
      sendInput({ permissionGranted: true, action: 'microphone_ready' }, 'Microphone permission granted for this minigame.');
    }).catch(() => setNotice('Microphone permission was not granted. You can continue with a supported controller alternative.'));
  }

  function submitDrawing() {
    sendInput({ action: 'drawing_submitted', hasDrawing: canvasHasInk }, 'Drawing input submitted.');
    setNotice('Drawing submitted to the demo session.');
  }

  function handleCanvasPointer(event: React.PointerEvent<HTMLCanvasElement>, action: 'start' | 'move' | 'end') {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * canvas.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * canvas.height;
    if (action === 'start') {
      drawingRef.current = true;
      setCanvasHasInk(true);
      context.beginPath();
      context.moveTo(x, y);
      canvas.setPointerCapture(event.pointerId);
    } else if (action === 'move' && drawingRef.current) {
      context.lineTo(x, y);
      context.strokeStyle = '#FFD700';
      context.lineWidth = 7;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();
    } else if (action === 'end') {
      drawingRef.current = false;
    }
  }

  function installCosmetic(id: string) {
    setInstalledItems((items) => items.includes(id) ? items : [...items, id]);
    setDownloadPrompt(null);
    log('CONTENT_READY', `${id} added to the temporary session cache.`, 'good');
    setNotice('Content added to this demo session. A real game build will validate and load the compatible package.');
  }

  return (
    <div className={`app-shell page-${page}`}>
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><span>✦</span></div>
          <div><div className="brand-name">Grand Star Cruise</div><div className="brand-subtitle">A COMMUNITY HARBOR APP</div></div>
        </div>
        <div className="sidebar-label">YOUR HARBOR</div>
        <nav className="nav-list" aria-label="Main navigation">
          <NavButton active={page === 'overview'} onClick={() => setPage('overview')} icon={<Home size={18}/>} label="Overview" />
          <NavButton active={page === 'controller'} onClick={() => setPage('controller')} icon={<Smartphone size={18}/>} label="Companion view" />
          <NavButton active={page === 'profile'} onClick={() => setPage('profile')} icon={<UserRound size={18}/>} label="Harbor ID" />
          <NavButton active={page === 'rewards'} onClick={() => setPage('rewards')} icon={<Trophy size={18}/>} label="Rewards" />
          <NavButton active={page === 'workshop'} onClick={() => setPage('workshop')} icon={<Package size={18}/>} label="Workshop" />
        </nav>
        <div className="sidebar-label tools-label">APP</div>
        <nav className="nav-list">
          <NavButton active={page === 'settings'} onClick={() => setPage('settings')} icon={<Settings size={18}/>} label="Settings" />
        </nav>
        <div className="sidebar-bottom">
          <div className="harbor-card-mini">
            <div className="mini-wave">〰</div>
            <strong>All aboard!</strong>
            <p>Play together, your way.</p>
            <span className="free-pill"><Sparkles size={11}/> FREE COMMUNITY PROJECT</span>
          </div>
          <div className="sidebar-footer"><span className="online-dot"/> Demo environment <span className="version">v0.1.0</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="crumb"><span className="crumb-brand">GRAND STAR CRUISE</span><span className="crumb-slash">✦</span><img className="crumb-mp7-logo" src={MP7_GAME_LOGO} alt="Mario Party 7" onError={(event) => { event.currentTarget.style.display = "none"; }}/><strong>{pageLabels[page]}</strong></div>
          <div className="topbar-actions">
            <div className="mode-switch" aria-label="Connection mode">
              <button className={mode === 'local' ? 'selected' : ''} onClick={() => setMode('local')}><Wifi size={14}/> Local</button>
              <button className={mode === 'online' ? 'selected' : ''} onClick={() => setMode('online')}><Globe2 size={14}/> Online</button>
            </div>
            <div className="connection-pill"><span className="online-dot"/>{sessionActive ? 'Demo session' : 'Session paused'}</div>
            <button className="avatar-button" onClick={() => setPage('profile')} title="Open Harbor ID">★</button>
          </div>
        </header>

        <div className="content-wrap">
          {notice && <div className="notice-banner"><div><Bell size={16}/><span>{notice}</span></div><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
          {page === 'overview' && <OverviewPage
            players={players} activePlayer={activePlayer} activePlayerId={activePlayerId} setActivePlayerId={setActivePlayerId}
            connectedCount={connectedCount} mode={mode} sessionActive={sessionActive} setSessionActive={setSessionActive}
            onPair={() => setPairingOpen(true)} onStart={startMinigame} onStatus={setPlayerStatus} logs={logs}
            onSendNotification={sendNotification} onReset={resetDemo} onUpdateCoins={updateCoins}
            currentBoard={currentBoard} onBoardChange={setCurrentBoard} currentTurn={currentTurn} onTurnChange={updateTurn}
            bowserEvents={bowserEvents} onAddBowserEvent={addBowserEvent}
            onUpdatePlayerStat={updatePlayerStat} onPickCharacter={setCharacterPickerPlayerId}
          />}
          {page === 'controller' && <ControllerPage
            player={activePlayer} players={players} activePlayerId={activePlayerId} setActivePlayerId={setActivePlayerId}
            activeMinigame={activeMinigame} onStart={startMinigame} onEnd={endMinigame} onInput={sendInput}
            micEnabled={micEnabled} onRequestMic={requestMicrophone} tapCount={tapCount} setTapCount={setTapCount}
            tiltValue={tiltValue} setTiltValue={setTiltValue} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer}
            canvasRef={canvasRef} onCanvasPointer={handleCanvasPointer} canvasHasInk={canvasHasInk} onSubmitDrawing={submitDrawing}
            playersStatus={setPlayerStatus}
          />}
          {page === 'profile' && <ProfilePage player={activePlayer} onPair={() => setPairingOpen(true)}/>}
          {page === 'rewards' && <RewardsPage installedItems={installedItems} />}
          {page === 'workshop' && <WorkshopPage installedItems={installedItems} onInstall={(id) => setDownloadPrompt(id)} />}
          {page === 'settings' && <SettingsPage mode={mode} setMode={setMode} />}
        </div>
      </main>

      {characterPickerPlayerId && <Modal title={`Choose a character for ${players.find((player) => player.playerId === characterPickerPlayerId)?.displayName ?? 'player'}`} onClose={() => setCharacterPickerPlayerId(null)}>
        <div className={`character-select-grid character-picker-${(characterPickerPlayerId ?? 'p1').toLowerCase()}`}>
          {CHARACTERS.map((character) => {
            const current = players.find((player) => player.playerId === characterPickerPlayerId);
            const alreadyUsed = players.some((player) => player.playerId !== characterPickerPlayerId && player.characterId === character.id);
            return <button key={character.id} className={`character-select-option${current?.characterId === character.id ? ' chosen' : ''}`} disabled={alreadyUsed} onClick={() => setPlayerCharacter(characterPickerPlayerId, character.id)}>
              <span className="character-select-portrait"><CharPortrait characterId={character.id} characterName={character.name}/></span>
              <strong>{character.name}</strong>
              <small>{current?.characterId === character.id ? 'SELECTED' : alreadyUsed ? 'IN USE' : 'AVAILABLE'}</small>
            </button>;
          })}
        </div>
        <div className="modal-actions"><button className="button secondary" onClick={() => setCharacterPickerPlayerId(null)}>Cancel</button></div>
      </Modal>}
      {pairingOpen && <Modal title="Connect a phone" onClose={() => setPairingOpen(false)}>
        <div className="pair-modal-content">
          <div className="pair-qr"><QRCodeSVG value={`mp7companion://demo/${DEMO_SESSION_ID}/${activePlayerId}`} size={174} bgColor="#ffffff" fgColor="#0b3045" /></div>
          <div className="pair-instructions"><span className="eyebrow">DEMO PAIRING</span><h3>Pair {activePlayer.displayName}</h3><p>In the finished app, scan this code to securely pair a phone with this player slot. This QR code is a visual placeholder in the current desktop simulator; it does not connect a real phone yet.</p><div className="pair-code"><span>{DEMO_SESSION_ID}</span><button onClick={() => { void navigator.clipboard?.writeText(DEMO_SESSION_ID); setNotice('Demo session code copied.'); }}><Link2 size={15}/> Copy code</button></div><label className="field-label">PLAYER SLOT</label><select value={activePlayerId} onChange={(event) => setActivePlayerId(event.target.value)}>{players.map((p) => <option key={p.playerId} value={p.playerId}>{p.playerId} · {p.displayName}</option>)}</select></div>
        </div>
        <div className="modal-actions"><button className="button secondary" onClick={() => setPairingOpen(false)}>Close</button><button className="button primary" onClick={() => { setPlayerStatus(activePlayerId, 'connected'); setPairingOpen(false); }}>Simulate phone connected</button></div>
      </Modal>}
      {downloadPrompt && <Modal title="Download community content?" onClose={() => setDownloadPrompt(null)}>
        <div className="download-modal"><div className="download-art"><Gift size={36}/></div><div><h3>{downloadPrompt}</h3><p>This sample reward is free. In a live session, the game will check content compatibility and ask before adding a temporary copy to the session cache.</p><div className="safety-note"><ShieldCheck size={16}/> Creator credits and package validation will be part of the real Workshop download flow.</div></div></div>
        <div className="modal-actions"><button className="button secondary" onClick={() => setDownloadPrompt(null)}>Not now</button><button className="button primary" onClick={() => installCosmetic(downloadPrompt)}><Download size={15}/> Download for session</button></div>
      </Modal>}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{active && <span className="nav-indicator"/>}</button>;
}

function StatusChip({ status }: { status: PhoneStatus }) {
  return <span className={`status-chip ${status}`}><span className="status-dot"/>{statusLabel(status)}</span>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function OverviewPage(props: {
  players: PlayerState[]; activePlayer: PlayerState; activePlayerId: string; setActivePlayerId: (id: string) => void;
  connectedCount: number; mode: ConnectionMode; sessionActive: boolean; setSessionActive: (active: boolean) => void;
  onPair: () => void; onStart: (game: MinigameDescriptor) => void; onStatus: (id: string, status: PhoneStatus) => void;
  logs: LogEntry[]; onSendNotification: () => void; onReset: () => void; onUpdateCoins: (amount: number) => void;
  currentBoard: string; onBoardChange: (board: string) => void; currentTurn: number; onTurnChange: (turn: number) => void;
  bowserEvents: BowserEvent[]; onAddBowserEvent: (title: string) => void;
  onUpdatePlayerStat: (playerId: string, stat: 'coins' | 'stars', amount: number) => void; onPickCharacter: (playerId: string) => void;
}) {
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [showBowserEvents, setShowBowserEvents] = useState(false);
  const totalTurns = props.players[0]?.totalTurns ?? 15;
  return <>
    <PageHeading eyebrow="YOUR GAME, IN YOUR POCKET" title="Welcome aboard." description="Your Harbor dashboard, player connections, and the game-event test deck." action={<button className="button primary" onClick={props.onPair}><Link2 size={16}/> Pair a phone</button>} />
    <section className="hero-banner">
      <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/><div className="hero-content">
        <div className="hero-kicker"><span className="hero-spark">★</span> {props.mode === 'local' ? 'LOCAL CRUISE' : 'ONLINE CRUISE'} · TEST SESSION</div>
        <h2>Ready for the<br/><em>next turn?</em></h2>
        <p>A pocket-sized cruise companion for player stats, items, rewards, and phone-powered minigames.</p>
        <div className="hero-actions">
          <button className="button hero-button" onClick={() => props.onStart(MINIGAMES[1])}><Play size={15} fill="currentColor"/> Try a minigame</button>
          <button className="hero-link" onClick={() => props.setSessionActive(!props.sessionActive)}>{props.sessionActive ? 'Pause demo session' : 'Resume demo session'} <ArrowDownUp size={14}/></button>
           
        </div>
      </div>
      <div className="hero-ship" aria-hidden="true"><div className="ship-sail sail-back"/><div className="ship-sail sail-front"/><div className="ship-mast"/><div className="ship-body"/><div className="ship-flag">★</div></div>
      <div className="hero-bottomline"><span><span className="pulse-dot"/> SESSION READY</span><span>SESSION ID <strong>{DEMO_SESSION_ID}</strong></span><span>{props.mode === 'local' ? 'LOCAL NETWORK MODE' : 'ONLINE MODE PREVIEW'}</span></div>
    </section>

    <section className="board-menu-panel">
      <div className="board-menu-heading"><div><div className="eyebrow">CHOOSE YOUR DESTINATION</div><h2>Board selection</h2></div><span className="board-menu-current">NOW SAILING · {props.currentBoard.toUpperCase()}</span></div>
      <div className="board-menu-tiles">
        {BOARDS.map((board, index) => <button key={board} className={`board-menu-tile board-tile-${index + 1}${props.currentBoard === board ? ' selected' : ''}`} onClick={() => props.onBoardChange(board)} aria-pressed={props.currentBoard === board}>
          <span className="board-tile-star">✦</span><strong>{board}</strong><small>{props.currentBoard === board ? 'SELECTED' : 'CHOOSE BOARD'}</small>
        </button>)}
      </div>
    </section>

    <section className="panel turn-tracker-panel">
      <div className="turn-tracker-heading"><div><div className="eyebrow">BOARD PROGRESS</div><h2>Turn tracker</h2><p>{props.currentBoard}</p></div><div className="turn-number"><strong>{props.currentTurn}</strong><span>/ {totalTurns} TURNS</span></div></div>
      <div className="turn-progress-track"><div style={{ width: `${(props.currentTurn / totalTurns) * 100}%` }}/></div>
      <div className="turn-tracker-actions"><span>Turn {props.currentTurn} of {totalTurns}</span><div><button className="small-gold-button" onClick={() => props.onTurnChange(props.currentTurn - 1)} disabled={props.currentTurn <= 1}>− Previous</button><button className="small-gold-button" onClick={() => props.onTurnChange(props.currentTurn + 1)} disabled={props.currentTurn >= totalTurns}>Next turn +</button></div></div>
    </section>

    <div className="stats-grid">
      <StatCard icon={<Smartphone size={19}/>} label="PHONES CONNECTED" value={`${props.connectedCount} / ${props.players.length}`} sub="Optional for every player" accent="teal"/>
      <StatCard icon={<Users size={19}/>} label="PLAYERS IN SESSION" value={String(props.players.length)} sub="Mixed phone + controller" accent="blue"/>
      <StatCard icon={<Radio size={19}/>} label="CONNECTION MODE" value={props.mode === 'local' ? 'Local' : 'Online'} sub="Demo transport preview" accent="gold"/>
      <StatCard icon={<Activity size={19}/>} label="PROTOCOL EVENTS" value={String(props.logs.length).padStart(2, '0')} sub="Latest events shown below" accent="violet"/>
    </div>

    <div className="section-row"><div><div className="eyebrow">SESSION ROSTER</div><h2 className="section-title">Players aboard</h2></div><button className="text-button" onClick={() => setShowAllPlayers(!showAllPlayers)}>{showAllPlayers ? 'Show less' : 'Manage players'} <ChevronDown size={14}/></button></div>
    <div className="players-grid">
      {props.players.slice(0, showAllPlayers ? 8 : 4).map((player, index) => <PlayerCard key={player.playerId} player={player} index={index} selected={player.playerId === props.activePlayerId} onSelect={() => props.setActivePlayerId(player.playerId)} onStatus={props.onStatus} onUpdateStat={props.onUpdatePlayerStat} onPickCharacter={() => props.onPickCharacter(player.playerId)} />)}
    </div>

    <section className="panel bowser-panel">
      <div className="panel-header"><div><div className="eyebrow bowser-eyebrow">UNEXPECTED BOARD EVENTS</div><h2><span className="bowser-mark">♛</span> Bowser Time log</h2></div><button className="bowser-toggle" onClick={() => setShowBowserEvents(!showBowserEvents)}>{showBowserEvents ? 'Collapse' : `View events (${props.bowserEvents.length})`} <ChevronDown size={15}/></button></div>
      {showBowserEvents && <div className="bowser-log-content">
        <div className="bowser-add-row"><span>Record an event for turn {props.currentTurn}</span><div className="bowser-event-actions">{BOWSER_EVENT_PRESETS.map((event) => <button key={event.title} onClick={() => props.onAddBowserEvent(event.title)}>+ {event.title}</button>)}</div></div>
        {props.bowserEvents.length ? <div className="bowser-event-list">{props.bowserEvents.map((event) => <article className="bowser-event-item" key={event.id}><span className="bowser-event-turn">TURN {event.turn}</span><div><strong>{event.title}</strong><p>{event.detail}</p></div></article>)}</div> : <div className="bowser-empty">No Bowser events recorded yet. Add one when Bowser Time strikes.</div>}
      </div>}
    </section>

    <div className="dashboard-columns">
      <section className="panel event-panel">
        <div className="panel-header"><div><div className="eyebrow">TEST THE GAME BRIDGE</div><h2>Game Event Simulator</h2></div><span className="demo-tag">DEMO TOOLS</span></div>
        <p className="panel-description">Send mock game events to the selected player using the same message names planned for the Recomp integration.</p>
        <div className="selected-player-strip"><div className="character-token small-avatar" style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,215,0,0.15)' }}><CharPortrait characterId={props.activePlayer.characterId} characterName={props.activePlayer.characterName}/></div><div><strong>{props.activePlayer.displayName}</strong><span>{props.activePlayer.playerId} · {props.activePlayer.characterName}</span></div><StatusChip status={props.activePlayer.phoneStatus}/></div>
        <div className="sim-controls"><div className="control-group"><label>PLAYER STATE</label><div className="control-buttons"><button onClick={() => props.onUpdateCoins(5)}><Coins size={14}/> +5 coins</button><button onClick={() => props.onUpdateCoins(-5)}><Coins size={14}/> −5 coins</button><button onClick={props.onSendNotification}><Bell size={14}/> Send alert</button></div></div>
          <div className="control-group"><label>START PHONE MINIGAME</label><div className="minigame-quick-grid">{MINIGAMES.map((game) => <button key={game.id} onClick={() => props.onStart(game)}><span>{game.kind === 'draw' ? '✎' : game.kind === 'trivia' ? '?' : game.kind === 'rhythm' ? '♫' : game.kind === 'tilt' ? '↔' : '◖'}</span>{game.title}</button>)}</div></div>
          <div className="sim-foot"><span><CircleHelp size={14}/> Not connected? Toadsworth falls back to controller play.</span><button onClick={props.onReset}><RotateCcw size={13}/> Reset demo</button></div>
        </div>
      </section>
      <section className="panel log-panel"><div className="panel-header"><div><div className="eyebrow">LIVE ACTIVITY</div><h2>Protocol event log</h2></div><span className="live-indicator"><span className="pulse-dot"/> LIVE</span></div>
        <div className="event-list">{props.logs.slice(0, 6).map((entry) => <div className="event-row" key={entry.id}><div className={`event-symbol ${entry.tone || 'plain'}`}><Activity size={15}/></div><div className="event-copy"><strong>{entry.type}</strong><span>{entry.detail}</span></div><time>{entry.time}</time></div>)}</div>
        <div className="log-note"><LockKeyhole size={13}/> Demo messages stay on this device; no account or game server is connected yet.</div>
      </section>
    </div>
    <div className="principles-strip"><div><Sparkles size={18}/><span><strong>Always free.</strong> No microtransactions, paid unlocks, or limited-time cosmetics.</span></div><div><ShieldCheck size={18}/><span><strong>Player choice.</strong> Phone controls are optional; traditional controllers stay supported.</span></div><div><Users size={18}/><span><strong>Community made.</strong> Creator credits travel with compatible content.</span></div></div>
  </>;
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent: string }) {
  return <div className="stat-card"><div className={`stat-icon ${accent}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>;
}

function PlayerCard({ player, index, selected, onSelect, onStatus, onUpdateStat, onPickCharacter }: { player: PlayerState; index: number; selected: boolean; onSelect: () => void; onStatus: (id: string, status: PhoneStatus) => void; onUpdateStat: (id: string, stat: 'coins' | 'stars', amount: number) => void; onPickCharacter: () => void }) {
  const colors = ['coral', 'mint', 'lilac', 'sun'];
  return <div className={`player-card player-color-${player.playerId.toLowerCase()} ${selected ? 'selected' : ''}`} onClick={onSelect} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(); }}>
    <div className="player-card-top">
      <div className={`character-token ${colors[index % colors.length]}`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CharPortrait characterId={player.characterId} characterName={player.characterName}/><span className={`player-slot-badge${PLAYER_SLOT_MARKERS[player.playerId] ? ' has-marker' : ''}`} aria-label={player.playerId}>
        <span>{player.playerId}</span>
        {PLAYER_SLOT_MARKERS[player.playerId] && <img src={PLAYER_SLOT_MARKERS[player.playerId]} alt="" aria-hidden="true" onError={(event) => {
          event.currentTarget.style.display = 'none';
          event.currentTarget.parentElement?.classList.remove('has-marker');
        }}/>}
      </span></div>
      <div className="player-meta"><strong>{player.displayName}</strong><span>{player.playerId} · {player.characterName}</span></div>
      <button className="player-edit-character" title={`Change ${player.displayName}'s character`} aria-label={`Change ${player.displayName}'s character`} onClick={(event) => { event.stopPropagation(); onPickCharacter(); }}>✎</button>
    </div>
    <div className="player-numbers">
      <div><Coins size={14}/><strong>{player.coins}</strong><span>Coins</span><div className="stat-stepper"><button aria-label={`Remove 5 coins from ${player.displayName}`} onClick={(event) => { event.stopPropagation(); onUpdateStat(player.playerId, 'coins', -5); }} disabled={player.coins <= 0}><Minus size={11}/></button><button aria-label={`Add 5 coins to ${player.displayName}`} onClick={(event) => { event.stopPropagation(); onUpdateStat(player.playerId, 'coins', 5); }}><Plus size={11}/></button></div></div>
      <div><Star size={14}/><strong>{player.stars}</strong><span>Stars</span><div className="stat-stepper"><button aria-label={`Remove a Star from ${player.displayName}`} onClick={(event) => { event.stopPropagation(); onUpdateStat(player.playerId, 'stars', -1); }} disabled={player.stars <= 0}><Minus size={11}/></button><button aria-label={`Add a Star to ${player.displayName}`} onClick={(event) => { event.stopPropagation(); onUpdateStat(player.playerId, 'stars', 1); }}><Plus size={11}/></button></div></div>
      <div><Compass size={14}/><strong>{player.position}</strong><span>Space</span></div>
    </div>
    <div className="player-card-bottom"><StatusChip status={player.phoneStatus}/><select aria-label={`Phone status for ${player.displayName}`} value={player.phoneStatus} onClick={(event) => event.stopPropagation()} onChange={(event) => onStatus(player.playerId, event.target.value as PhoneStatus)}><option value="connected">Connected</option><option value="not_connected">Not connected</option><option value="disconnected">Disconnected</option><option value="reconnecting">Reconnecting</option></select></div>
  </div>;
}

function ControllerPage(props: {
  player: PlayerState; players: PlayerState[]; activePlayerId: string; setActivePlayerId: (id: string) => void;
  activeMinigame: MinigameDescriptor | null; onStart: (game: MinigameDescriptor) => void; onEnd: () => void;
  onInput: (input: Record<string, unknown>, description: string) => void; micEnabled: boolean; onRequestMic: () => void;
  tapCount: number; setTapCount: (count: number) => void; tiltValue: number; setTiltValue: (value: number) => void;
  selectedAnswer: number | null; setSelectedAnswer: (answer: number | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>; onCanvasPointer: (event: React.PointerEvent<HTMLCanvasElement>, action: 'start' | 'move' | 'end') => void;
  canvasHasInk: boolean; onSubmitDrawing: () => void; playersStatus: (id: string, status: PhoneStatus) => void;
}) {
  return <>
    <PageHeading eyebrow="PHONE EXPERIENCE PREVIEW" title="Your companion, your way." description="This is the player-facing screen. On a phone, the layout adapts to a compact touch-first view." action={<div className="player-picker"><span>VIEWING PLAYER</span><select value={props.activePlayerId} onChange={(event) => props.setActivePlayerId(event.target.value)}>{props.players.map((player) => <option key={player.playerId} value={player.playerId}>{player.playerId} · {player.displayName}</option>)}</select></div>} />
    <div className="controller-layout">
      <div className="phone-preview-wrap"><div className="preview-label"><Smartphone size={14}/> PHONE SCREEN PREVIEW <span>LIVE DEMO</span></div><div className="phone-frame"><div className="phone-screen"><div className="phone-statusbar"><span>9:41</span><span>●●●  ▰</span></div>
        {!props.activeMinigame ? <PhoneDashboard player={props.player} /> : <MinigameScreen {...props} />}
        <div className="phone-bottom-nav"><span className="active"><Home size={16}/> Home</span><span><Trophy size={16}/> Rewards</span><span><UserRound size={16}/> Profile</span></div>
      </div></div><div className="phone-preview-foot"><span><ShieldCheck size={14}/> Player data is supplied by the game.</span><span>Preview only · no live game linked</span></div></div>
      <div className="controller-tools"><section className="panel current-player-panel"><div className="panel-header"><div><div className="eyebrow">PLAYER CONNECTION</div><h2>{props.player.displayName}</h2></div><StatusChip status={props.player.phoneStatus}/></div><div className="connection-detail"><div className="connection-avatar">{props.player.characterName.slice(0, 1)}</div><div><strong>{props.player.characterName}</strong><span>{props.player.playerId} · Harbor Cruise</span></div></div><div className="connection-actions"><button className="button secondary full" onClick={() => props.playersStatus(props.player.playerId, props.player.phoneStatus === 'connected' ? 'disconnected' : 'connected')}>{props.player.phoneStatus === 'connected' ? <WifiOff size={15}/> : <Wifi size={15}/>} {props.player.phoneStatus === 'connected' ? 'Simulate disconnect' : 'Reconnect phone'}</button></div></section>
        <section className="panel minigame-panel"><div className="panel-header"><div><div className="eyebrow">PHONE-COMPATIBLE GAMES</div><h2>Minigame launcher</h2></div><span className="demo-tag">5 DEMOS</span></div><p className="panel-description">Choose an event to see how the phone automatically changes from player dashboard to a dedicated controller.</p><div className="minigame-list">{MINIGAMES.map((game) => <div className="minigame-option" key={game.id}><div className="minigame-glyph">{game.kind === 'draw' ? '✎' : game.kind === 'trivia' ? '?' : game.kind === 'rhythm' ? '♫' : game.kind === 'tilt' ? '↔' : '◖'}</div><div><strong>{game.title}</strong><span>{game.description}</span></div><button onClick={() => props.onStart(game)} aria-label={`Start ${game.title}`}><Play size={14} fill="currentColor"/></button></div>)}</div>{props.activeMinigame && <button className="button secondary full end-game-button" onClick={props.onEnd}>End minigame and return to dashboard</button>}</section>
      </div>
    </div>
  </>;
}

function PhoneDashboard({ player }: { player: PlayerState }) {
  return <div className="phone-dashboard"><div className="phone-brand"><span className="phone-brand-star">✦</span> GRAND STAR CRUISE <span className="phone-connected-dot"/></div><div className="phone-welcome"><span>AHOY, {player.displayName.toUpperCase()}!</span><h2>It's your<br/><em>adventure.</em></h2></div><div className="phone-character-card"><div className="phone-character-orb" style={{ overflow: 'hidden' }}><CharPortrait characterId={player.characterId} characterName={player.characterName}/></div><div><span>PLAYING AS</span><strong>{player.characterName}</strong><small>{player.playerId} · Turn {player.currentTurn}</small></div><span className="character-star">✦</span></div><div className="phone-stat-grid"><div><Coins size={16}/><span>COINS</span><strong>{player.coins}</strong></div><div><Star size={16}/><span>STARS</span><strong>{player.stars}</strong></div></div><div className="phone-section-title"><strong>YOUR ITEMS</strong><span>{player.inventory.length} slots used</span></div><div className="phone-items">{player.inventory.length ? player.inventory.map((item) => <div className="phone-item" key={item.id}><span>{item.icon}</span><strong>{item.name}</strong><small>×{item.quantity}</small></div>) : <div className="phone-empty-items">No items yet. Keep exploring!</div>}</div><div className="phone-turn-card"><div><span>BOARD POSITION</span><strong>Space {player.position}</strong></div><div className="turn-map-dots"><i/><i/><i/><i/><i/><i/><i/></div></div><div className="phone-toad-note"><span>✦</span><div><strong>Toadsworth says</strong><small>Enjoy your cruise! Your next turn is on the horizon.</small></div></div></div>;
}

function MinigameScreen(props: React.ComponentProps<typeof ControllerPage>) {
  const game = props.activeMinigame!;
  return <div className="phone-minigame"><div className="minigame-phone-top"><button onClick={props.onEnd}><X size={16}/></button><span>MINIGAME CONTROLLER</span><span className="phone-connected-dot"/></div><div className="minigame-phone-heading"><span>READY, {props.player.displayName.toUpperCase()}?</span><h2>{game.title}</h2><p>{game.description}</p></div>
    {game.kind === 'trivia' && <div className="trivia-widget"><div className="question-count">QUESTION 1 OF 1</div><strong>Which item helps you move farther?</strong>{['Mushroom', 'Coin Bag', 'Skeleton Key'].map((answer, index) => <button key={answer} className={props.selectedAnswer === index ? 'chosen' : ''} onClick={() => { props.setSelectedAnswer(index); props.onInput({ answerIndex: index, answer }, `Trivia answer selected: ${answer}.`); }}>{String.fromCharCode(65 + index)} <span>{answer}</span>{props.selectedAnswer === index && <Check size={15}/>}</button>)}</div>}
    {game.kind === 'rhythm' && <div className="rhythm-widget"><div className="rhythm-orbit"><span>♫</span><i/><i/><i/></div><span className="tap-label">TAP TO THE BEAT</span><button className="big-tap-button" onClick={() => { const count = props.tapCount + 1; props.setTapCount(count); props.onInput({ action: 'tap', count, at: Date.now() }, `Rhythm tap ${count} sent.`); }}><span>TAP!</span></button><small>{props.tapCount} taps registered</small></div>}
    {game.kind === 'tilt' && <div className="tilt-widget"><div className="tilt-meter"><div className="tilt-needle" style={{ transform: `translateX(${props.tiltValue * 1.1}px) rotate(${props.tiltValue * 0.35}deg)` }}/><span>← BALANCE →</span></div><div className="tilt-buttons"><button onClick={() => { const value = Math.max(-80, props.tiltValue - 20); props.setTiltValue(value); props.onInput({ axis: 'x', value, simulated: true }, 'Simulated phone tilt left.'); }}>◀ LEFT</button><button onClick={() => { props.setTiltValue(0); props.onInput({ axis: 'x', value: 0, simulated: true }, 'Tilt returned to center.'); }}>CENTER</button><button onClick={() => { const value = Math.min(80, props.tiltValue + 20); props.setTiltValue(value); props.onInput({ axis: 'x', value, simulated: true }, 'Simulated phone tilt right.'); }}>RIGHT ▶</button></div><small>Desktop preview uses buttons. A phone build will read motion sensors after permission.</small></div>}
    {game.kind === 'draw' && <div className="drawing-widget"><span>DRAW: A HAPPY STAR</span><canvas ref={props.canvasRef} width={300} height={230} onPointerDown={(event) => props.onCanvasPointer(event, 'start')} onPointerMove={(event) => props.onCanvasPointer(event, 'move')} onPointerUp={(event) => props.onCanvasPointer(event, 'end')} onPointerLeave={(event) => props.onCanvasPointer(event, 'end')}/><button className="submit-drawing" onClick={props.onSubmitDrawing}><Send size={14}/> SUBMIT DRAWING</button><small>Touch or click and drag to draw.</small></div>}
    {game.kind === 'microphone' && <div className="mic-widget"><div className={`mic-orb ${props.micEnabled ? 'enabled' : ''}`}><Mic size={34} style={{ display: 'none' }}/><img src={MIC_CONTROL_ROOM_SPRITE} alt="" aria-hidden="true" onError={(event) => {
      event.currentTarget.style.display = 'none';
      const fallback = event.currentTarget.previousElementSibling as HTMLElement | null;
      if (fallback) fallback.style.display = 'block';
    }}/></div><strong>{props.micEnabled ? 'MICROPHONE READY' : 'MICROPHONE OPTIONAL'}</strong><p>{props.micEnabled ? 'Permission granted for this demo minigame.' : 'Your microphone is only used after you grant permission.'}</p><button onClick={props.onRequestMic}>{props.micEnabled ? 'MICROPHONE ENABLED' : 'ENABLE MICROPHONE'}</button><small>You can decline and use a traditional controller when supported.</small></div>}
    <div className="minigame-phone-footer"><span>✦</span> INPUT IS SENT TO YOUR GAME SESSION</div>
  </div>;
}

function ProfilePage({ player, onPair }: { player: PlayerState; onPair: () => void }) {
  return <><PageHeading eyebrow="YOUR COMMUNITY IDENTITY" title="Harbor ID" description="Your free player identity for Grand Star Cruise and Community Harbor." action={<button className="button primary" onClick={onPair}><Link2 size={15}/> Connect device</button>} /><div className="profile-hero"><div className="profile-avatar-large">{player.displayName.slice(0, 1).toUpperCase()}<span>✦</span></div><div className="profile-info"><div className="profile-titleline"><h2>{player.displayName}</h2><span className="level-pill">LEVEL 18</span></div><p>Harbor Adventurer · Member profile preview</p><div className="xp-track"><div/><span>720 / 1,000 XP to Level 19</span></div><div className="profile-tags"><span><Trophy size={13}/> 12 achievements</span><span><Star size={13}/> 6 titles earned</span><span><Sparkles size={13}/> All rewards free</span></div></div><div className="profile-showcase"><span>FAVORITE CHARACTER</span><div className="showcase-character">{player.characterName.slice(0, 1)}</div><strong>{player.characterName}</strong></div></div><div className="section-row"><div><div className="eyebrow">PLAYER SNAPSHOT</div><h2 className="section-title">Your journey so far</h2></div></div><div className="stats-grid profile-stats"><StatCard icon={<Gamepad2 size={19}/>} label="MATCHES PLAYED" value="34" sub="Across supported sessions" accent="teal"/><StatCard icon={<Star size={19}/>} label="STARS EARNED" value="86" sub="Lifetime profile total" accent="gold"/><StatCard icon={<Coins size={19}/>} label="COINS COLLECTED" value="2,480" sub="Lifetime profile total" accent="blue"/><StatCard icon={<Award size={19}/>} label="ACHIEVEMENTS" value="12 / 40" sub="Permanent, never limited" accent="violet"/></div><div className="panel account-note"><ShieldCheck size={19}/><div><strong>Account linking is not active yet</strong><p>This first build uses a local demo profile. Real Harbor ID sign-in, website linking, syncing, and account recovery will be added with the Community Harbor service.</p></div></div></>;
}

function RewardsPage({ installedItems }: { installedItems: string[] }) {
  const achievements = [
    ['Star Collector', 'Earn 10 Stars across completed matches.', '🏆', true],
    ['Coin Hoarder', 'Collect 500 coins in total.', '🪙', true],
    ['Cruise Veteran', 'Complete 25 matches.', '🚢', true],
    ['Minigame Explorer', 'Try five different minigame types.', '🎮', false],
    ['Community Contributor', 'Publish your first approved creation.', '🎨', false],
    ['Board Adventurer', 'Play five community-made boards.', '🗺️', false],
  ] as const;
  return <><PageHeading eyebrow="PLAY, DISCOVER, EARN" title="Harbor Rewards" description="Achievements, player levels, and cosmetics earned through play. No purchases, premium currency, or time-limited unlocks." action={<span className="free-pill large"><Sparkles size={13}/> EVERYTHING FREE</span>}/><div className="rewards-banner"><div className="reward-starburst">✦</div><div><span className="eyebrow">YOUR CURRENT PROGRESS</span><h2>Level 18 <em>Harbor Adventurer</em></h2><p>Keep playing and exploring. Every reward stays available to earn.</p></div><div className="reward-xp"><strong>720 <small>/ 1,000 XP</small></strong><div className="xp-track"><div/></div></div></div><div className="section-row"><div><div className="eyebrow">ACHIEVEMENT COLLECTION</div><h2 className="section-title">Milestones & memories</h2></div><span className="collection-count">12 of 40 unlocked</span></div><div className="achievement-grid">{achievements.map(([name, desc, icon, unlocked]) => <div className={`achievement-card ${unlocked ? '' : 'locked'}`} key={name}><div className="achievement-icon">{icon}</div><div><strong>{name}</strong><p>{desc}</p><span className={unlocked ? 'unlocked-label' : 'locked-label'}>{unlocked ? '✓ UNLOCKED' : 'NOT YET UNLOCKED'}</span></div></div>)}</div><div className="panel free-promise"><Gift size={19}/><div><strong>Nothing is exclusive to a timer.</strong><p>Event rewards will remain obtainable through permanent challenges or the event archive. There are no limited-edition drops.</p></div></div><div className="section-row"><div><div className="eyebrow">SESSION CACHE</div><h2 className="section-title">Temporary content</h2></div></div><div className="cache-row"><Package size={18}/><div><strong>{installedItems.length} community item(s) ready in this demo session</strong><span>Real package downloads and compatibility checks are not connected yet.</span></div></div></>;
}

function WorkshopPage({ installedItems, onInstall }: { installedItems: string[]; onInstall: (id: string) => void }) {
  const items = [
    { id: 'Ocean Explorer Costume', creator: 'HarborArtClub', type: 'COSTUME', icon: '🧭', description: 'A bright explorer look for your next board adventure.', compatibility: 'Character cosmetic' },
    { id: 'Starboard Victory Pose', creator: 'PixelBuoy', type: 'ANIMATION', icon: '🌟', description: 'A celebratory star pose for the end of a match.', compatibility: 'Victory animation' },
    { id: 'Captain Coral', creator: 'ShellSmith', type: 'CUSTOM CHARACTER', icon: '🐚', description: 'A community character concept package for compatible builds.', compatibility: 'Custom character · demo entry' },
  ];
  return <><PageHeading eyebrow="MADE BY THE COMMUNITY" title="Harbor Workshop" description="Browse free community creations, with creator credits and compatibility details kept up front." action={<span className="free-pill large"><Sparkles size={13}/> NO PAID CONTENT</span>}/><div className="workshop-banner"><div className="workshop-banner-icon"><Package size={34}/></div><div><span className="eyebrow">COMMUNITY CREATIONS</span><h2>Made by players. Shared with everyone.</h2><p>Creators keep their credits. Players choose what to download. Nothing is artificially limited.</p></div></div><div className="section-row"><div><div className="eyebrow">FEATURED CONTENT · DEMO CATALOG</div><h2 className="section-title">Discover something new</h2></div><span className="collection-count">3 sample entries</span></div><div className="workshop-grid">{items.map((item) => <article className="workshop-card" key={item.id}><div className="workshop-art"><span>{item.icon}</span><label>{item.type}</label><div className="workshop-art-glow"/></div><div className="workshop-card-body"><div className="creator-line">BY {item.creator} <span><ShieldCheck size={12}/> CREATOR CREDIT</span></div><h3>{item.id}</h3><p>{item.description}</p><div className="compat-line"><Check size={13}/>{item.compatibility}</div><button className={`button ${installedItems.includes(item.id) ? 'installed' : 'primary'} full`} onClick={() => !installedItems.includes(item.id) && onInstall(item.id)}>{installedItems.includes(item.id) ? <><Check size={15}/> Added to session</> : <><Download size={15}/> Download for this session</>}</button></div></article>)}</div><div className="panel workshop-safety"><ShieldCheck size={19}/><div><strong>Content safety & compatibility</strong><p>Before real downloads are enabled, packages will need format/version checks, integrity validation, creator attribution, and moderation. This catalog is sample data only.</p></div></div></>;
}

function SettingsPage({ mode, setMode }: { mode: ConnectionMode; setMode: (mode: ConnectionMode) => void }) {
  return <><PageHeading eyebrow="MAKE IT YOURS" title="Settings" description="Device preferences and connection options for the companion preview."/><div className="settings-grid"><section className="panel settings-panel"><div className="settings-icon"><Wifi size={19}/></div><div><h3>Connection mode</h3><p>Choose which connection flow the simulator previews.</p><div className="setting-choice-row"><button className={mode === 'local' ? 'chosen' : ''} onClick={() => setMode('local')}><Wifi size={15}/> Local Wi-Fi</button><button className={mode === 'online' ? 'chosen' : ''} onClick={() => setMode('online')}><Globe2 size={15}/> Online session</button></div><small>Online mode is a UI preview only. The relay service and real-time authentication are not implemented yet.</small></div></section><section className="panel settings-panel"><div className="settings-icon"><Mic size={19}/></div><div><h3>Microphone & sensors</h3><p>Phone permissions will be requested only when a compatible minigame needs them.</p><div className="settings-pills"><span><Mic size={13}/> Microphone</span><span><Gauge size={13}/> Motion sensors</span><span><Image size={13}/> Camera</span><span><Vibrate size={13}/> Haptics</span></div><small>Windows simulator uses mock tilt controls; native phone permission handling is a next-step integration.</small></div></section><section className="panel settings-panel"><div className="settings-icon"><LockKeyhole size={19}/></div><div><h3>Privacy & account</h3><p>Harbor ID is currently a local demo profile. No sign-in, analytics, or cloud syncing is active.</p><small>Real account services will use secure session tokens and explicit consent for optional profile sharing.</small></div></section><section className="panel settings-panel"><div className="settings-icon"><Monitor size={19}/></div><div><h3>Desktop test bench</h3><p>The Windows wrapper shares the same interface and protocol models as the phone app.</p><small>Use the Game Event Simulator on the Overview page to test player state, phone status, minigame events, and inputs.</small></div></section></div></>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><strong>{title}</strong><button onClick={onClose} aria-label="Close"><X size={18}/></button></div>{children}</div></div>;
}

export default App;
