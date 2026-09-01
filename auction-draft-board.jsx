import { useState, useEffect, useMemo, useRef } from "react";
import playerNewsSnapshot from "./player-news.json";

// ---------- Player data (from the 2026 auction sheet) ----------
const RAW = {
  QB: "Josh Allen|BUF,Lamar Jackson|BAL,Jayden Daniels|WAS,Jalen Hurts|PHI,Joe Burrow|CIN,Drake Maye|NE,Patrick Mahomes|KC,C.J. Stroud|HOU,Jordan Love|GB,Kyler Murray|MIN,Brock Purdy|SF,Trevor Lawrence|JAX,Kirk Cousins|ATL,Jared Goff|DET,Matthew Stafford|LAR,Dak Prescott|DAL,Caleb Williams|CHI,Justin Herbert|LAC,Daniel Jones|IND,Aaron Rodgers|PIT,Cam Ward|TEN,Jaxson Dart|NYG,Baker Mayfield|TB,Geno Smith|NYJ,Bo Nix|DEN,Fernando Mendoza|LV,Bryce Young|CAR,Tyler Shough|NO,Sam Darnold|SEA,Will Levis|TEN,Deshaun Watson|CLE,Anthony Richardson|IND",
  RB: "Jahmyr Gibbs|DET,Bijan Robinson|ATL,Jonathan Taylor|IND,Christian McCaffrey|SF,James Cook|BUF,De'Von Achane|MIA,Chase Brown|CIN,Omarion Hampton|LAC,Saquon Barkley|PHI,Ashton Jeanty|LV,Derrick Henry|BAL,Jeremiyah Love|ARI,Kenneth Walker III|KC,Breece Hall|NYJ,Josh Jacobs|GB,Javonte Williams|DAL,Kyren Williams|LAR,Travis Etienne Jr.|NO,Quinshon Judkins|CLE,Cam Skattebo|NYG,D'Andre Swift|CHI,Bhayshul Tuten|JAX,Bucky Irving|TB,David Montgomery|HOU,Jadarian Price|SEA,TreVeyon Henderson|NE,Rhamondre Stevenson|NE,Tony Pollard|TEN,Jaylen Warren|PIT,Kenny Gainwell|TB,Rico Dowdle|PIT,Chuba Hubbard|CAR,Aaron Jones Sr.|MIN,Jonathon Brooks|CAR,Rachaad White|WSH,Kyle Monangai|CHI,J.K. Dobbins|DEN,RJ Harvey|DEN,Blake Corum|LAR,Tyjae Spears|TEN,Jacory Croskey-Merritt|WSH,Tyler Allgeier|ARI,Keaton Mitchell|LAC,Jonah Coleman|DEN,Woody Marks|HOU,Chris Rodriguez|JAX,Zach Charbonnet|SEA,Brian Robinson Jr.|ATL,Nicholas Singleton|TEN,Dylan Sampson|CLE",
  WR: "Ja'Marr Chase|CIN,Puka Nacua|LAR,Amon-Ra St. Brown|DET,CeeDee Lamb|DAL,Justin Jefferson|MIN,A.J. Brown|NE,Drake London|ATL,Nico Collins|HOU,Rashee Rice|KC,George Pickens|DAL,Chris Olave|NO,Tee Higgins|CIN,Zay Flowers|BAL,Ladd McConkey|LAC,DeVonta Smith|PHI,Jaylen Waddle|DEN,Garrett Wilson|NYJ,Mike Evans|SF,Davante Adams|LAR,DJ Moore|CHI,Keenan Allen|CHI,Michael Pittman Jr.|IND,Tank Dell|HOU,Stefon Diggs|HOU,Terry McLaurin|WAS,Jayden Reed|GB,Christian Kirk|JAX,Brian Thomas Jr.|JAX,Calvin Ridley|TEN,Diontae Johnson|CAR,Deebo Samuel|SF,Brandon Aiyuk|SF,Jaxon Smith-Njigba|SEA,Courtland Sutton|DEN,Khalil Shakir|BUF,Marquise Brown|KC,Xavier Worthy|KC,Romeo Doubs|GB,Christian Watson|GB,Chris Godwin|TB,Carnell Tate|TEN,Makai Lemon|PHI,De'Zhaun Stribling|SF,Jordyn Tyson|NO,KC Concepcion|CLE,Denzel Boston|CLE,Jakobi Meyers|LV,Jerry Jeudy|CLE,Jalen Tolbert|DAL,Brandin Cooks|DAL,Jordan Whittington|LAR,Demarcus Robinson|LAR,Tutu Atwell|LAR,Michael Wilson|ARI,Greg Dortch|ARI,Rashod Bateman|BAL,Darnell Mooney|ATL,Trey Palmer|TB,Jalen McMillan|TB,Marvin Mims Jr.|DEN,Troy Franklin|DEN,Ricky Pearsall|SF,Jauan Jennings|SF,Elijah Moore|CLE,Cedric Tillman|CLE,Roman Wilson|PIT,Van Jefferson|PIT,Alec Pierce|IND,Tre Tucker|LV,Javon Baker|NE,Allen Lazard|NYJ,John Metchie III|HOU,Devaughn Vele|DEN,Noah Brown|WAS,Luke McCaffrey|WAS,Jahan Dotson|WAS,Jalen Coker|CAR,Tyler Lockett|SEA,Tyler Boyd|TEN,Malachi Corley|NYJ,Kayshon Boutte|HOU,Michael Thomas|FA,Josh Downs|IND,Gabe Davis|JAX,Adonai Mitchell|IND,Rome Odunze|CHI,Wan'Dale Robinson|NYG,Darius Slayton|NYG,Jalin Hyatt|NYG,Parris Campbell|PHI,Johnny Wilson|PHI,Quentin Johnston|LAC,Joshua Palmer|LAC,DJ Chark Jr.|LAC",
  TE: "Brock Bowers|LV,Trey McBride|ARI,Colston Loveland|CHI,Tyler Warren|IND,Harold Fannin Jr.|CLE,Sam LaPorta|DET,Kyle Pitts|ATL,George Kittle|SF,Tucker Kraft|GB,Jake Ferguson|DAL,Dallas Goedert|PHI,Mark Andrews|BAL,Dalton Kincaid|BUF,Evan Engram|JAX,David Njoku|LAC,Isaiah Likely|BAL,Pat Freiermuth|PIT,Dalton Schultz|HOU,T.J. Hockenson|MIN,Luke Musgrave|GB,Hunter Henry|NE,Tyler Conklin|NYJ,Cade Otton|TB,Chigoziem Okonkwo|TEN,Ben Sinnott|WAS",
  K: "Brandon Aubrey|DAL,Harrison Butker|KC,Jake Elliott|PHI,Ka'imi Fairbairn|HOU,Younghoe Koo|ATL,Jake Moody|SF,Evan McPherson|CIN,Cameron Dicker|LAC,Jason Sanders|MIA,Tyler Bass|BUF,Matt Gay|IND,Jason Myers|SEA,Chase McLaughlin|TB,Cairo Santos|CHI,Greg Zuerlein|NYJ,Chris Boswell|PIT,Blake Grupe|NO,Andre Szmyt|CLE,Tyler Loop|BAL,Daniel Carlson|LV",
  DEF: "49ers|SF,Ravens|BAL,Cowboys|DAL,Jets|NYJ,Browns|CLE,Bills|BUF,Chiefs|KC,Eagles|PHI,Dolphins|MIA,Texans|HOU,Lions|DET,Steelers|PIT,Packers|GB,Seahawks|SEA,Saints|NO,Jaguars|JAX,Buccaneers|TB,Vikings|MIN,Bears|CHI,Bengals|CIN",
};

const PLAYERS = Object.entries(RAW).flatMap(([pos, str]) =>
  str.split(",").map((s, i) => {
    const [name, team] = s.split("|");
    return { id: `${pos}-${i}`, name, team, pos, rank: i + 1 };
  })
);

const POS_COLORS = {
  QB: { bg: "#C8102E", light: "#FCE9EC" },
  RB: { bg: "#0B6E4F", light: "#E7F3EE" },
  WR: { bg: "#1D4E89", light: "#E8EFF7" },
  TE: { bg: "#C46210", light: "#FBEFE3" },
  K:  { bg: "#5B3A8E", light: "#EFEAF7" },
  DEF:{ bg: "#4A4A48", light: "#EDEDEC" },
};
const POSITION_ORDER = { QB: 0, RB: 1, WR: 2, TE: 3, K: 4, DEF: 5 };

function RecentPicksTicker({ picks, findPlayer, onDismiss }) {
  const recent = picks.slice(-6).reverse().map(pk => {
    const player = findPlayer(pk.playerId);
    return `${player.name} — ${pk.mine ? `yours for $${pk.price}` : (pk.price ? `$${pk.price}` : "gone")}`;
  });
  const message = recent.join("  •  ");
  return (
    <div
      role="status"
      aria-label={`Recent picks: ${message}`}
      style={{ display: "flex", alignItems: "center", background: "#EAF2ED", borderBottom: "1px solid #C9D8CF", minHeight: 38, overflow: "hidden" }}
    >
      <style>{`
        @keyframes recent-picks-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .recent-picks-track { animation: recent-picks-scroll 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .recent-picks-track { animation: none; transform: none; } }
      `}</style>
      <div style={{ background: "#123524", color: "#fff", alignSelf: "stretch", display: "flex", alignItems: "center", padding: "0 10px", fontSize: 12, fontWeight: 800, letterSpacing: ".04em", flexShrink: 0, zIndex: 1 }}>
        RECENT
      </div>
      <div aria-hidden="true" style={{ overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
        <div className="recent-picks-track" style={{ display: "inline-flex", width: "max-content", fontSize: 14, fontWeight: 650, color: "#27382E" }}>
          <span style={{ padding: "0 28px" }}>{message}</span>
          <span style={{ padding: "0 28px" }}>{message}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Hide recent picks ticker"
        title="Hide ticker"
        style={{ alignSelf: "stretch", border: "none", borderLeft: "1px solid #C9D8CF", background: "#EAF2ED", color: "#526158", padding: "0 12px", fontSize: 20, cursor: "pointer", flexShrink: 0 }}
      >×</button>
    </div>
  );
}

const DEFAULT_SETTINGS = { budget: 100, rosterSize: 15, ticker: true, syncUrl: "" };
const STORE_KEY = "auction-draft-v1";
const AUTO_BACKUP_KEY = "auction-draft-auto-backups-v1";
const AUTO_BACKUP_INTERVAL = 5 * 60 * 1000;
const MAX_AUTO_BACKUPS = 12;
const BANNER_COLLISION_PASSES = 4;
const BANNER_ANIMATION_MS = (BANNER_COLLISION_PASSES * 2 - 1) * 1000;
const SYNC_HELP_PROMPT = "Help me connect Load's Draft-o-matic to Google Sheets. Use the draft-sync.gs file in https://github.com/TheFireSays/draft-board. Walk me through opening Apps Script from my Google Sheet, pasting the code, deploying it as a web app with access set to Anyone, and tell me which web app URL to paste into the app's Sheet sync field.";

export default function AuctionDraftBoard() {
  const [picks, setPicks] = useState([]); // {playerId, price, mine, ts}
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [selected, setSelected] = useState(null); // player object
  const [price, setPrice] = useState("");
  const [tab, setTab] = useState("draft"); // draft | roster | settings
  const [loaded, setLoaded] = useState(false);
  const [customPlayers, setCustomPlayers] = useState([]);
  const [targetIds, setTargetIds] = useState([]);
  const [playerNotes, setPlayerNotes] = useState({});
  const [addPos, setAddPos] = useState("RB");
  const [addTeam, setAddTeam] = useState("");
  const [syncPromptCopied, setSyncPromptCopied] = useState(false);
  const [autoBackups, setAutoBackups] = useState([]);
  const [autoBackupChoice, setAutoBackupChoice] = useState("");
  const [wide, setWide] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [bannerAnimationFinished, setBannerAnimationFinished] = useState(false);
  const searchRef = useRef(null);
  const latestDraftRef = useRef({ picks: [], settings: DEFAULT_SETTINGS, customPlayers: [], targetIds: [], playerNotes: {} });
  const autoBackupsRef = useRef([]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
    const update = () => setWide(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!wide || reducedMotion) {
      setBannerAnimationFinished(false);
      return undefined;
    }
    setBannerAnimationFinished(false);
    const timeout = window.setTimeout(() => setBannerAnimationFinished(true), BANNER_ANIMATION_MS);
    return () => window.clearTimeout(timeout);
  }, [wide, reducedMotion]);

  // ---------- Load / save persistent state ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORE_KEY);
        if (res?.value) {
          const data = JSON.parse(res.value);
          if (data.picks) setPicks(data.picks);
          if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          if (Array.isArray(data.customPlayers)) setCustomPlayers(data.customPlayers);
          if (Array.isArray(data.targetIds)) setTargetIds(data.targetIds);
          if (data.playerNotes && typeof data.playerNotes === "object") setPlayerNotes(data.playerNotes);
        }
      } catch (e) { /* first run: no saved draft yet */ }
      try {
        const backupRes = await window.storage.get(AUTO_BACKUP_KEY);
        if (backupRes?.value) {
          const savedBackups = JSON.parse(backupRes.value);
          if (Array.isArray(savedBackups)) {
            autoBackupsRef.current = savedBackups;
            setAutoBackups(savedBackups);
          }
        }
      } catch (e) { /* first run: no automatic backups yet */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORE_KEY, JSON.stringify({ picks, settings, customPlayers, targetIds, playerNotes }));
      } catch (e) { console.error("Save failed", e); }
    })();
  }, [picks, settings, customPlayers, targetIds, playerNotes, loaded]);

  useEffect(() => {
    latestDraftRef.current = { picks, settings, customPlayers, targetIds, playerNotes };
  }, [picks, settings, customPlayers, targetIds, playerNotes]);

  useEffect(() => {
    if (!loaded) return;
    const saveAutomaticBackup = async () => {
      const current = latestDraftRef.current;
      if (!current.picks.length) return;
      const latest = autoBackupsRef.current[0];
      const currentData = JSON.stringify(current);
      const latestData = latest
        ? JSON.stringify({ picks: latest.picks, settings: latest.settings, customPlayers: latest.customPlayers, targetIds: latest.targetIds || [], playerNotes: latest.playerNotes || {} })
        : "";
      if (currentData === latestData) return;

      const snapshot = { ...current, saved: new Date().toISOString() };
      const next = [snapshot, ...autoBackupsRef.current].slice(0, MAX_AUTO_BACKUPS);
      autoBackupsRef.current = next;
      setAutoBackups(next);
      try {
        await window.storage.set(AUTO_BACKUP_KEY, JSON.stringify(next));
      } catch (e) { console.error("Automatic backup failed", e); }
    };
    const timer = setInterval(saveAutomaticBackup, AUTO_BACKUP_INTERVAL);
    return () => clearInterval(timer);
  }, [loaded]);

  // combined player pool + safe lookup (guards against a restore from an older backup)
  const ALL = useMemo(() => PLAYERS.concat(customPlayers), [customPlayers]);
  const findP = (id) => ALL.find(x => x.id === id) || { name: "Unknown player", pos: "DEF", team: "?" };

  // ---------- Push updates to the Google Sheet (Apps Script webhook) ----------
  useEffect(() => {
    if (!loaded || !settings.syncUrl) return;
    const t = setTimeout(() => {
      const enriched = picks.map(pk => {
        const p = findP(pk.playerId);
        return { name: p.name, pos: p.pos, team: p.team, price: pk.price, mine: pk.mine };
      });
      const mySpent = picks.filter(p => p.mine).reduce((s, p) => s + p.price, 0);
      fetch(settings.syncUrl, {
        method: "POST",
        mode: "no-cors", // Apps Script web apps accept this; response is opaque (fire-and-forget)
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ picks: enriched, spent: mySpent, remaining: settings.budget - mySpent, updated: new Date().toISOString() }),
      }).catch(() => { /* offline or bad URL — draft still saved locally */ });
    }, 800); // debounce: rapid pick+undo sends one update
    return () => clearTimeout(t);
  }, [picks, loaded, settings.syncUrl, settings.budget]);

  const exportCsv = () => {
    const rows = [["Order", "Player", "Pos", "Team", "Price", "My Team"]];
    picks.forEach((pk, i) => {
      const p = findP(pk.playerId);
      rows.push([i + 1, p.name, p.pos, p.team, pk.price, pk.mine ? "YES" : ""]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "draft-results.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Derived draft math ----------
  const draftedIds = useMemo(() => new Set(picks.map(p => p.playerId)), [picks]);
  const targetIdSet = useMemo(() => new Set(targetIds), [targetIds]);
  const myPicks = picks.filter(p => p.mine);
  const spent = myPicks.reduce((s, p) => s + p.price, 0);
  const remaining = settings.budget - spent;
  const slotsLeft = settings.rosterSize - myPicks.length;
  // must keep $1 for every other unfilled slot
  const maxBid = slotsLeft > 0 ? Math.max(0, remaining - (slotsLeft - 1)) : 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const available = ALL.filter(p => {
      if (posFilter === "TARGETS" && !targetIdSet.has(p.id)) return false;
      if (posFilter !== "ALL" && posFilter !== "TARGETS" && p.pos !== posFilter) return false;
      if (draftedIds.has(p.id)) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q);
    });
    if (posFilter === "TARGETS") return available.slice(0, q ? 12 : 40);
    return available
      .map((player, originalOrder) => ({ player, originalOrder }))
      .sort((a, b) => {
        if (posFilter === "ALL") {
          const positionDifference = POSITION_ORDER[a.player.pos] - POSITION_ORDER[b.player.pos];
          if (positionDifference) return positionDifference;
        }
        const targetDifference = Number(targetIdSet.has(b.player.id)) - Number(targetIdSet.has(a.player.id));
        return targetDifference || a.originalOrder - b.originalOrder;
      })
      .map(({ player }) => player)
      .slice(0, q ? 12 : 40);
  }, [query, posFilter, draftedIds, targetIdSet, ALL]);

  const lastPick = picks.length ? picks[picks.length - 1] : null;
  const lastPlayer = lastPick ? findP(lastPick.playerId) : null;

  // ---------- Actions ----------
  const openPlayer = (p) => { setSelected(p); setPrice(""); };
  const closeModal = () => { setSelected(null); setPrice(""); };

  const confirmPick = (mine) => {
    const val = parseInt(price, 10);
    if (mine && (!val || val < 1)) return;
    setPicks(prev => [...prev, {
      playerId: selected.id,
      price: mine ? val : (val || 0),
      mine,
      ts: Date.now(),
    }]);
    setQuery("");
    closeModal();
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const undo = () => setPicks(prev => prev.slice(0, -1));

  const toggleTarget = (playerId) => {
    setTargetIds(prev => prev.includes(playerId)
      ? prev.filter(id => id !== playerId)
      : [...prev, playerId]);
  };

  const updatePlayerNote = (playerId, note) => {
    setPlayerNotes(prev => {
      const next = { ...prev };
      const clean = note.slice(0, 300);
      if (clean) next[playerId] = clean;
      else delete next[playerId];
      return next;
    });
  };

  const copySyncHelpPrompt = async () => {
    try {
      await navigator.clipboard.writeText(SYNC_HELP_PROMPT);
      setSyncPromptCopied(true);
      setTimeout(() => setSyncPromptCopied(false), 2000);
    } catch {
      window.prompt("Copy this prompt into Gemini:", SYNC_HELP_PROMPT);
    }
  };

  const removePick = (ts, name) => {
    if (window.confirm(`Remove ${name} from the draft?`)) {
      setPicks(prev => prev.filter(p => p.ts !== ts));
    }
  };

  const addCustomPlayer = () => {
    const name = query.trim();
    if (!name) return;
    setCustomPlayers(prev => [...prev, {
      id: `C-${Date.now()}`,
      name,
      team: (addTeam.trim() || "—").toUpperCase().slice(0, 3),
      pos: addPos,
      rank: 999,
    }]);
    setAddTeam("");
  };

  const downloadBackup = () => {
    const blob = new Blob(
      [JSON.stringify({ picks, settings, customPlayers, targetIds, playerNotes, saved: new Date().toISOString() }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "draft-backup.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (!Array.isArray(d.picks)) throw new Error("not a backup");
        setPicks(d.picks);
        if (d.settings) setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
        if (Array.isArray(d.customPlayers)) setCustomPlayers(d.customPlayers);
        setTargetIds(Array.isArray(d.targetIds) ? d.targetIds : []);
        setPlayerNotes(d.playerNotes && typeof d.playerNotes === "object" ? d.playerNotes : {});
        window.alert("Draft restored from backup.");
      } catch {
        window.alert("That file isn't a draft backup. Look for draft-backup.json in Downloads.");
      }
    };
    reader.readAsText(file);
    ev.target.value = "";
  };

  const restoreAutomaticBackup = () => {
    const saved = autoBackupChoice || autoBackups[0]?.saved;
    const backup = autoBackups.find(item => item.saved === saved);
    if (!backup) return;
    const when = new Date(backup.saved).toLocaleString();
    if (!window.confirm(`Restore the automatic backup from ${when}? This replaces the current draft.`)) return;
    setPicks(Array.isArray(backup.picks) ? backup.picks : []);
    if (backup.settings) setSettings({ ...DEFAULT_SETTINGS, ...backup.settings });
    if (Array.isArray(backup.customPlayers)) setCustomPlayers(backup.customPlayers);
    setTargetIds(Array.isArray(backup.targetIds) ? backup.targetIds : []);
    setPlayerNotes(backup.playerNotes && typeof backup.playerNotes === "object" ? backup.playerNotes : {});
    window.alert("Automatic backup restored.");
  };

  const resetDraft = () => {
    if (window.confirm("Start over? This clears every pick.")) {
      setPicks([]);
      setTab("draft");
    }
  };

  const priceNum = parseInt(price, 10) || 0;
  const overMax = selected && priceNum > maxBid;
  const duplicateSpecialPosition = selected && ["K", "DEF"].includes(selected.pos)
    && myPicks.some(pk => findP(pk.playerId).pos === selected.pos);
  const selectedNews = selected ? playerNewsSnapshot.players?.[selected.id] : null;

  // ---------- Styles ----------
  const S = {
    app: {
      fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: "#F6F7F4", minHeight: "100vh", color: "#17211B",
      maxWidth: wide ? 1180 : 560, margin: "0 auto", paddingBottom: wide ? 0 : 90,
      boxShadow: wide ? "0 0 60px rgba(0,0,0,0.5)" : "none",
    },
    scoreboard: {
      backgroundColor: "#123524",
      backgroundImage: wide
        ? `linear-gradient(90deg, rgba(6,35,23,.82), rgba(6,35,23,.58) 32%, rgba(6,27,19,.62) 50%, rgba(6,35,23,.58) 68%, rgba(6,35,23,.82)), url("${reducedMotion || bannerAnimationFinished ? "./assets/banner/football-contact-frame.png" : "./assets/banner/football-snap.gif"}")`
        : "none",
      backgroundPosition: "center", backgroundSize: "cover", backgroundRepeat: "no-repeat",
      color: "#F2F7EF", padding: wide ? "18px 32px 16px" : "14px 18px 12px",
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      position: "sticky", top: 0, zIndex: 20,
      borderBottom: "4px solid #E8B33A",
    },
    money: { fontSize: wide ? 64 : 52, fontWeight: 800, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px", textShadow: wide ? "0 2px 8px rgba(0,0,0,.7)" : "none" },
    moneyLabel: { fontSize: 13, opacity: 0.75, marginTop: 4 },
    statCol: { textAlign: "right" },
    stat: { fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.15, textShadow: wide ? "0 2px 7px rgba(0,0,0,.75)" : "none" },
    statLabel: { fontSize: 12, opacity: 0.75 },
    search: {
      width: "100%", boxSizing: "border-box", fontSize: 22, padding: "16px 18px",
      border: "2px solid #C8CDC6", borderRadius: 14, background: "#fff",
      outline: "none",
    },
    chipRow: { display: "flex", gap: 8, padding: "12px 16px 4px", overflowX: "auto" },
    chip: (active, pos) => ({
      border: "none", borderRadius: 999, padding: "10px 16px", fontSize: 16, fontWeight: 700,
      background: active ? (pos === "ALL" ? "#17211B" : pos === "TARGETS" ? "#9A6B00" : POS_COLORS[pos].bg) : "#E5E8E2",
      color: active ? "#fff" : "#41493F", cursor: "pointer", flexShrink: 0,
    }),
    row: {
      display: "flex", alignItems: "center", gap: 14, width: "100%",
      background: "#fff", border: "none", borderBottom: "1px solid #E7EAE4",
      padding: "16px 18px", cursor: "pointer", textAlign: "left",
    },
    posTag: (pos) => ({
      background: POS_COLORS[pos].bg, color: "#fff", fontWeight: 800, fontSize: 14,
      borderRadius: 8, padding: "6px 9px", minWidth: 38, textAlign: "center", flexShrink: 0,
    }),
    bigBtn: (bg, disabled) => ({
      width: "100%", border: "none", borderRadius: 14, padding: "18px 12px",
      fontSize: 20, fontWeight: 800, color: "#fff", background: bg,
      opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer",
      marginTop: 10,
    }),
    tabBar: {
      position: wide ? "sticky" : "fixed", top: wide ? 104 : "auto", bottom: wide ? "auto" : 0,
      left: 0, right: 0, maxWidth: wide ? "none" : 560, margin: "0 auto",
      display: "flex", background: "#fff", borderTop: "2px solid #DDE1DA",
      borderBottom: wide ? "1px solid #E7EAE4" : "none", zIndex: 30,
    },
    tabBtn: (active) => ({
      flex: 1, padding: "14px 0 16px", border: "none", background: "none",
      fontSize: 16, fontWeight: active ? 800 : 500, color: active ? "#123524" : "#7C857A",
      borderTop: active ? "3px solid #E8B33A" : "3px solid transparent", cursor: "pointer",
    }),
  };

  if (!loaded) return <div style={{ ...S.app, padding: 40, textAlign: "center" }}>Loading your draft…</div>;

  return (
    <div style={{ background: "#E8ECE6", minHeight: "100vh" }}>
    <div style={{ ...S.app, position: "relative", zIndex: 1 }}>
      {/* Scoreboard — always visible */}
      <div style={S.scoreboard}>
        <div>
          <div style={S.money}>${remaining}</div>
          <div style={S.moneyLabel}>left to spend</div>
        </div>
        {wide && (
          <h1 style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", margin: 0, padding: "8px 18px 9px", fontSize: 30, lineHeight: 1.1, fontWeight: 850, letterSpacing: "-0.02em", color: "#F2F7EF", whiteSpace: "nowrap", background: "rgba(5,28,19,.56)", border: "1px solid rgba(255,255,255,.24)", borderRadius: 12, boxShadow: "0 3px 18px rgba(0,0,0,.32)", textShadow: "0 2px 6px rgba(0,0,0,.85)" }}>
            Load's Draft-o-matic
          </h1>
        )}
        <div style={{ display: "flex", gap: 22 }}>
          <div style={S.statCol}>
            <div style={S.stat}>${maxBid}</div>
            <div style={S.statLabel}>max bid</div>
          </div>
          <div style={S.statCol}>
            <div style={S.stat}>{myPicks.length}/{settings.rosterSize}</div>
            <div style={S.statLabel}>roster</div>
          </div>
        </div>
      </div>

      {settings.ticker !== false && picks.length > 0 && (
        <RecentPicksTicker
          picks={picks}
          findPlayer={findP}
          onDismiss={() => setSettings(s => ({ ...s, ticker: false }))}
        />
      )}

      {wide && (
        <nav style={S.tabBar} aria-label="Main navigation">
          <button style={S.tabBtn(tab === "draft")} onClick={() => setTab("draft")}>Draft</button>
          <button style={S.tabBtn(tab === "roster")} onClick={() => setTab("roster")}>My Team</button>
          <button style={S.tabBtn(tab === "settings")} onClick={() => setTab("settings")}>Settings</button>
        </nav>
      )}

      {tab === "draft" && (
        <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ padding: "16px 16px 0" }}>
            <input
              ref={searchRef}
              style={S.search}
              placeholder="Type a player's name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              inputMode="search"
            />
          </div>

          <div style={S.chipRow}>
            {["ALL", "TARGETS", "QB", "RB", "WR", "TE", "K", "DEF"].map(p => (
              <button key={p} style={S.chip(posFilter === p, p)} onClick={() => setPosFilter(p)}>{p === "TARGETS" ? "★ Targets" : p}</button>
            ))}
          </div>

          {lastPlayer && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", fontSize: 15, color: "#41493F" }}>
              <span>
                Last: <b>{lastPlayer.name}</b>{lastPick.mine ? ` — yours for $${lastPick.price}` : " — gone"}
              </span>
              <button onClick={undo} style={{ border: "2px solid #C8CDC6", background: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Undo
              </button>
            </div>
          )}

          <div style={{ marginTop: 6 }}>
            {results.map(p => (
              <button key={p.id} style={S.row} onClick={() => openPlayer(p)}>
                <span style={S.posTag(p.pos)}>{p.pos}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 20, fontWeight: 600 }}>{p.name}</span>
                  {playerNotes[p.id] && <span style={{ display: "block", marginTop: 3, color: "#687269", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playerNotes[p.id]}</span>}
                </span>
                {targetIdSet.has(p.id) && <span title="Target player" aria-label="Target player" style={{ color: "#9A6B00", fontSize: 20 }}>★</span>}
                <span style={{ fontSize: 15, color: "#7C857A", fontWeight: 600 }}>{p.team}</span>
              </button>
            ))}
            {results.length === 0 && posFilter === "TARGETS" && (
              <div style={{ padding: "34px 20px", textAlign: "center", color: "#5C665B", fontSize: 17, lineHeight: 1.5 }}>
                No available targets yet. Open any player and tap <b>Add to Targets</b>.
              </div>
            )}
            {results.length === 0 && posFilter !== "TARGETS" && (
              <div style={{ padding: "26px 20px", textAlign: "center" }}>
                <div style={{ color: "#41493F", fontSize: 18, fontWeight: 600, marginBottom: 14 }}>
                  "{query.trim()}" isn't in the list — add them:
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                  {["QB", "RB", "WR", "TE", "K", "DEF"].map(p => (
                    <button key={p} style={S.chip(addPos === p, p)} onClick={() => setAddPos(p)}>{p}</button>
                  ))}
                </div>
                <input
                  style={{ ...S.search, fontSize: 18, maxWidth: 220, textAlign: "center", margin: "0 auto", display: "block" }}
                  placeholder="Team (e.g. DAL)"
                  value={addTeam}
                  maxLength={3}
                  onChange={e => setAddTeam(e.target.value)}
                />
                <button
                  style={{ ...S.bigBtn("#123524", !query.trim()), maxWidth: 320, margin: "12px auto 0", display: "block" }}
                  onClick={addCustomPlayer}
                  disabled={!query.trim()}
                >
                  Add {query.trim()} at {addPos}
                </button>
              </div>
            )}
          </div>
        </div>

        {wide && (
          <aside aria-label="Current roster" style={{ width: 360, flexShrink: 0, borderLeft: "1px solid #DDE1DA", background: "#FBFCFA" }}>
            <div style={{ padding: "18px 20px 10px", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>My team</span>
              <span style={{ fontSize: 14, color: "#687269", fontWeight: 700 }}>${spent} spent · {myPicks.length}/{settings.rosterSize}</span>
            </div>
            {myPicks.length === 0 && (
              <div style={{ padding: "8px 20px 24px", color: "#7C857A", fontSize: 15, lineHeight: 1.5 }}>
                Players you win appear here as you draft.
              </div>
            )}
            {myPicks.map(pk => {
              const p = findP(pk.playerId);
              return (
                <div key={pk.ts} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderTop: "1px solid #EDF0EA" }}>
                  <span style={{ ...S.posTag(p.pos), fontSize: 12, padding: "4px 7px", minWidth: 32 }}>{p.pos}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    {playerNotes[p.id] && <span style={{ display: "block", marginTop: 2, color: "#687269", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{playerNotes[p.id]}</span>}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>${pk.price}</span>
                  <button
                    onClick={() => removePick(pk.ts, p.name)}
                    aria-label={`Remove ${p.name}`}
                    title={`Remove ${p.name}`}
                    style={{ border: "none", background: "none", color: "#A05656", fontSize: 20, fontWeight: 700, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}
                  >×</button>
                </div>
              );
            })}
          </aside>
        )}
        </div>
      )}

      {tab === "roster" && (
        <div style={{ padding: 16 }}>
          <h2 style={{ margin: "4px 2px 12px", fontSize: 22 }}>My team — ${spent} spent</h2>
          {myPicks.length === 0 && (
            <div style={{ color: "#7C857A", fontSize: 17, padding: "20px 4px" }}>
              No players yet. When you win a bid, they'll show up here.
            </div>
          )}
          {myPicks.map(pk => {
            const p = findP(pk.playerId);
            return (
              <div
                key={pk.ts}
                style={{ ...S.row, cursor: "default", boxSizing: "border-box", border: "1px solid #DDE1DA", borderRadius: 14, marginBottom: 10, padding: "14px 16px" }}
              >
                <span style={S.posTag(p.pos)}>{p.pos}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 19, fontWeight: 600 }}>{p.name}</span>
                  {playerNotes[p.id] && <span style={{ display: "block", marginTop: 3, color: "#687269", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playerNotes[p.id]}</span>}
                </span>
                <span style={{ fontSize: 19, fontWeight: 800, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>${pk.price}</span>
                <button
                  onClick={() => removePick(pk.ts, p.name)}
                  aria-label={`Remove ${p.name}`}
                  style={{ border: "2px solid #E3D3D3", background: "#fff", color: "#8E2F2F", borderRadius: 10, padding: "8px 14px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginLeft: 4 }}
                >
                  Remove
                </button>
              </div>
            );
          })}
          {picks.some(p => !p.mine) && (
            <>
              <h3 style={{ margin: "22px 2px 8px", fontSize: 17, color: "#41493F" }}>Drafted by other teams</h3>
              {picks.filter(p => !p.mine).map(pk => {
                const p = findP(pk.playerId);
                return (
                  <div
                    key={pk.ts}
                    style={{ ...S.row, cursor: "default", boxSizing: "border-box", border: "1px solid #DDE1DA", borderRadius: 14, marginBottom: 10, padding: "14px 16px", opacity: 0.72 }}
                  >
                    <span style={S.posTag(p.pos)}>{p.pos}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 17 }}>{p.name}</span>
                      {playerNotes[p.id] && <span style={{ display: "block", marginTop: 3, color: "#687269", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playerNotes[p.id]}</span>}
                    </span>
                    {pk.price > 0 && <span style={{ fontSize: 15, color: "#7C857A", flexShrink: 0 }}>${pk.price}</span>}
                    <button
                      onClick={() => removePick(pk.ts, p.name)}
                      aria-label={`Remove ${p.name}`}
                      style={{ border: "2px solid #DDE1DA", background: "#fff", color: "#8E2F2F", borderRadius: 10, padding: "6px 12px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginLeft: 4 }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div style={{ padding: 20 }}>
          <h2 style={{ marginTop: 4, fontSize: 22 }}>League settings</h2>
          <label style={{ display: "block", fontSize: 17, fontWeight: 600, margin: "18px 0 6px" }}>Starting budget</label>
          <input
            type="number" value={settings.budget}
            onChange={e => setSettings(s => ({ ...s, budget: parseInt(e.target.value, 10) || 0 }))}
            style={{ ...S.search, fontSize: 20 }}
          />
          <label style={{ display: "block", fontSize: 17, fontWeight: 600, margin: "18px 0 6px" }}>Roster size (total players)</label>
          <input
            type="number" value={settings.rosterSize}
            onChange={e => setSettings(s => ({ ...s, rosterSize: parseInt(e.target.value, 10) || 0 }))}
            style={{ ...S.search, fontSize: 20 }}
          />
          <label style={{ display: "block", fontSize: 17, fontWeight: 600, margin: "18px 0 6px" }}>Recent picks ticker</label>
          <button
            onClick={() => setSettings(s => ({ ...s, ticker: s.ticker === false }))}
            style={{ ...S.chip(settings.ticker !== false, "ALL"), padding: "12px 22px", fontSize: 17 }}
          >
            {settings.ticker !== false ? "On — show recent picks" : "Off"}
          </button>

          <label style={{ display: "block", fontSize: 17, fontWeight: 600, margin: "22px 0 6px" }}>Sheet sync URL (optional)</label>
          <input
            type="url"
            placeholder="Paste your Google Sheets link"
            value={settings.syncUrl}
            onChange={e => setSettings(s => ({ ...s, syncUrl: e.target.value.trim() }))}
            style={{ ...S.search, fontSize: 15 }}
          />
          <p style={{ color: "#7C857A", fontSize: 14, margin: "8px 0 0", lineHeight: 1.5 }}>
            {settings.syncUrl
              ? "Every pick pushes the full draft log to your Google Sheet."
              : "Use the special sync link for your Google Sheet, not its normal browser address."}
          </p>
          {!settings.syncUrl && (
            <div style={{ marginTop: 12, padding: 14, background: "#EAF2ED", border: "1px solid #C9D8CF", borderRadius: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#123524" }}>Need the special sync link?</div>
              <p style={{ margin: "6px 0 10px", color: "#41493F", fontSize: 14, lineHeight: 1.45 }}>
                Copy this setup prompt, open Gemini, paste it, and follow the steps.
              </p>
              <div style={{ padding: 10, background: "#fff", borderRadius: 9, color: "#41493F", fontSize: 13, lineHeight: 1.4 }}>
                “Help me connect Load's Draft-o-matic to Google Sheets using the draft-sync.gs file…”
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={copySyncHelpPrompt}
                  style={{ border: "none", borderRadius: 9, padding: "10px 14px", background: "#123524", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                >
                  {syncPromptCopied ? "Copied!" : "Copy Gemini prompt"}
                </button>
                <a
                  href="https://gemini.google.com/app"
                  target="_blank"
                  rel="noreferrer"
                  style={{ border: "1px solid #AFC1B6", borderRadius: 9, padding: "9px 14px", background: "#fff", color: "#123524", fontSize: 14, fontWeight: 800, textDecoration: "none" }}
                >
                  Open Gemini
                </a>
              </div>
            </div>
          )}

          <div style={{ marginTop: 22, padding: 14, background: "#F0F2EF", border: "1px solid #D5DAD3", borderRadius: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#17211B" }}>Automatic recovery backups</div>
            <p style={{ margin: "6px 0 10px", color: "#5C665B", fontSize: 14, lineHeight: 1.45 }}>
              While the app is open, it saves a snapshot every 5 minutes and keeps the latest 12 on this device.
            </p>
            {autoBackups.length > 0 ? (
              <>
                <select
                  value={autoBackupChoice || autoBackups[0].saved}
                  onChange={e => setAutoBackupChoice(e.target.value)}
                  style={{ ...S.search, fontSize: 15, padding: "11px 12px" }}
                  aria-label="Choose an automatic backup"
                >
                  {autoBackups.map(backup => (
                    <option key={backup.saved} value={backup.saved}>
                      {new Date(backup.saved).toLocaleString()} — {backup.picks?.length || 0} picks
                    </option>
                  ))}
                </select>
                <button onClick={restoreAutomaticBackup} style={{ ...S.bigBtn("#5C665B", false), fontSize: 16, padding: "13px 12px" }}>
                  Restore selected automatic backup
                </button>
              </>
            ) : (
              <div style={{ color: "#7C857A", fontSize: 14 }}>The first snapshot appears within 5 minutes after drafting begins.</div>
            )}
            <p style={{ margin: "10px 0 0", color: "#7C857A", fontSize: 13, lineHeight: 1.4 }}>
              Clearing Chrome site data also removes these snapshots. Use a backup file or Google Sheets for an off-device copy.
            </p>
          </div>

          <button onClick={exportCsv} style={S.bigBtn("#1D4E89", picks.length === 0)} disabled={picks.length === 0}>
            Download draft as CSV
          </button>
          <button onClick={downloadBackup} style={S.bigBtn("#0B6E4F", false)}>
            Save a backup file
          </button>
          <label style={{ display: "block" }}>
            <span style={{ ...S.bigBtn("#5C665B", false), display: "block", textAlign: "center", boxSizing: "border-box" }}>
              Restore from a backup file
            </span>
            <input type="file" accept="application/json,.json" onChange={restoreBackup} style={{ display: "none" }} />
          </label>
          <button onClick={resetDraft} style={S.bigBtn("#8E2F2F", false)}>Clear draft &amp; start over</button>
          <p style={{ color: "#7C857A", fontSize: 14, marginTop: 18, lineHeight: 1.5 }}>
            Max bid keeps $1 aside for every roster spot you still have to fill, so you can always finish your team.
          </p>
        </div>
      )}

      {/* Price modal */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(18,53,36,0.55)", zIndex: 40, display: "flex", alignItems: wide ? "center" : "flex-end", justifyContent: "center", padding: wide ? 24 : 0, boxSizing: "border-box" }}
          onClick={closeModal}
        >
          <div
            style={{ background: "#fff", width: "100%", maxWidth: 560, maxHeight: wide ? "calc(100vh - 48px)" : "92vh", overflowY: "auto", borderRadius: wide ? 22 : "22px 22px 0 0", padding: "22px 20px 30px", boxSizing: "border-box" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={S.posTag(selected.pos)}>{selected.pos}</span>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{selected.name}</div>
                <div style={{ fontSize: 15, color: "#7C857A", fontWeight: 600 }}>{selected.team}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleTarget(selected.id)}
              style={{ width: "100%", border: "1px solid #D8C486", borderRadius: 11, padding: "11px 12px", marginBottom: 12, background: targetIdSet.has(selected.id) ? "#FFF3C9" : "#FFFCF2", color: "#6E4D00", fontSize: 16, fontWeight: 800, cursor: "pointer" }}
            >
              {targetIdSet.has(selected.id) ? "★ In Targets — tap to remove" : "☆ Add to Targets"}
            </button>

            {selectedNews && (
              <div style={{ margin: "0 0 12px", padding: "12px 13px", border: "1px solid #C7D8E8", borderRadius: 11, background: "#F2F7FB" }}>
                <div style={{ color: "#1D4E89", fontSize: 12, fontWeight: 900, letterSpacing: ".04em", marginBottom: 5 }}>LATEST NEWS</div>
                <a href={selectedNews.url} target="_blank" rel="noreferrer" style={{ color: "#173E6A", fontSize: 15, fontWeight: 750, lineHeight: 1.35, textDecoration: "underline" }}>
                  {selectedNews.headline}
                </a>
                <div style={{ marginTop: 5, color: "#687686", fontSize: 12 }}>
                  {selectedNews.publisher || "News source"} · {new Date(selectedNews.publishedAt).toLocaleDateString()} · opens source
                </div>
              </div>
            )}

            <label style={{ display: "block", fontSize: 15, fontWeight: 800, color: "#41493F", margin: "0 0 6px" }}>
              Personal note <span style={{ fontWeight: 500, color: "#7C857A" }}>(optional)</span>
            </label>
            <textarea
              value={playerNotes[selected.id] || ""}
              onChange={e => updatePlayerNote(selected.id, e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Example: Only bid if still under $18"
              style={{ ...S.search, fontFamily: "inherit", fontSize: 15, lineHeight: 1.4, padding: "11px 13px", resize: "vertical", marginBottom: 12 }}
            />

            {duplicateSpecialPosition && (
              <div role="note" style={{ margin: "0 0 12px", padding: "11px 13px", border: "1px solid #E4C66B", borderRadius: 11, background: "#FFF7D9", color: "#664A00", fontSize: 15, lineHeight: 1.4 }}>
                <b>Quick check:</b> You already have a {selected.pos === "K" ? "kicker" : "defense"}. You can still draft another one.
              </div>
            )}

            <input
              autoFocus
              type="number"
              inputMode="numeric"
              placeholder="$ price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{ ...S.search, fontSize: 32, textAlign: "center", fontWeight: 800 }}
            />
            {overMax && (
              <div style={{ color: "#8E2F2F", fontWeight: 700, fontSize: 15, marginTop: 8, textAlign: "center" }}>
                Over your max bid of ${maxBid}
              </div>
            )}

            <button
              style={S.bigBtn("#123524", !priceNum || priceNum < 1)}
              disabled={!priceNum || priceNum < 1}
              onClick={() => confirmPick(true)}
            >
              I won — add to my team {priceNum ? `for $${priceNum}` : ""}
            </button>
            <button style={S.bigBtn("#5C665B", false)} onClick={() => confirmPick(false)}>
              Another team got them
            </button>
            <button
              style={{ width: "100%", background: "none", border: "none", padding: "16px 0 0", fontSize: 17, color: "#7C857A", cursor: "pointer" }}
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <a
        href="https://github.com/TheFireSays"
        target="_blank"
        rel="noreferrer"
        aria-label="Brought to you by TheFireSays on GitHub"
        style={{
          position: "fixed",
          right: wide ? "max(12px, calc((100vw - 1180px) / 2 + 12px))" : 10,
          bottom: wide ? 10 : 72,
          zIndex: 25,
          border: "1px solid rgba(200,205,198,0.9)",
          borderRadius: 999,
          padding: "5px 10px",
          background: "rgba(255,255,255,0.9)",
          color: "#526158",
          fontSize: 11,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        Brought to you by: TheFireSays
      </a>

      {/* Bottom tabs */}
      {!wide && (
        <nav style={S.tabBar} aria-label="Main navigation">
          <button style={S.tabBtn(tab === "draft")} onClick={() => setTab("draft")}>Draft</button>
          <button style={S.tabBtn(tab === "roster")} onClick={() => setTab("roster")}>My Team</button>
          <button style={S.tabBtn(tab === "settings")} onClick={() => setTab("settings")}>Settings</button>
        </nav>
      )}
    </div>
    </div>
  );
}
