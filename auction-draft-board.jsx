import React, { useState, useEffect, useMemo, useRef } from "react";

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

const TEAM_COLORS = {
  BUF:"#00338D", BAL:"#241773", WAS:"#5A1414", WSH:"#5A1414", PHI:"#004C54",
  CIN:"#FB4F14", NE:"#002244", KC:"#E31837", HOU:"#03202F", GB:"#203731",
  MIN:"#4F2683", SF:"#AA0000", JAX:"#006778", ATL:"#A71930", DET:"#0076B6",
  LAR:"#003594", DAL:"#041E42", CHI:"#C83803", LAC:"#0080C6", IND:"#002C5F",
  PIT:"#FFB612", TEN:"#4B92DB", NYG:"#0B2265", TB:"#D50A0A", NYJ:"#125740",
  DEN:"#FB4F14", LV:"#A5ACAF", CAR:"#0085CA", NO:"#D3BC8D", SEA:"#69BE28",
  CLE:"#FF3C00", MIA:"#008E97", ARI:"#97233F",
};
const RAIN_GLYPHS = ["🏈","🏈","🏈", ...Object.keys(TEAM_COLORS)];

function MatrixRain({ enabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w, h, drops = [], raf;
    const COL_W = 42;
    const newDrop = (x, top) => ({
      x,
      y: top ? -30 - Math.random() * 200 : Math.random() * window.innerHeight,
      speed: 1.2 + Math.random() * 2.6,
      glyph: RAIN_GLYPHS[Math.floor(Math.random() * RAIN_GLYPHS.length)],
    });
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const cols = Math.max(1, Math.floor(w / COL_W));
      drops = Array.from({ length: cols }, (_, i) => newDrop(i * COL_W + 8, false));
    };
    const tick = () => {
      ctx.fillStyle = "rgba(6,13,9,0.14)"; // fading trail
      ctx.fillRect(0, 0, w, h);
      drops.forEach((d, i) => {
        if (d.glyph === "🏈") {
          ctx.font = "20px serif";
          ctx.fillStyle = "#B5813B";
        } else {
          ctx.font = "bold 15px 'Courier New', monospace";
          ctx.fillStyle = TEAM_COLORS[d.glyph] || "#3FA86A";
        }
        ctx.globalAlpha = 0.85;
        ctx.fillText(d.glyph, d.x, d.y);
        ctx.globalAlpha = 1;
        d.y += d.speed;
        if (d.y > h + 40) drops[i] = newDrop(d.x, true);
      });
      raf = requestAnimationFrame(tick);
    };
    resize();
    ctx.fillStyle = "#060D09";
    ctx.fillRect(0, 0, w, h);
    window.addEventListener("resize", resize);
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [enabled]);
  if (!enabled) return null;
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0 }} aria-hidden="true" />;
}

const DEFAULT_SETTINGS = { budget: 100, rosterSize: 15, rain: true, syncUrl: "" };
const STORE_KEY = "auction-draft-v1";

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
  const [addPos, setAddPos] = useState("RB");
  const [addTeam, setAddTeam] = useState("");
  const searchRef = useRef(null);

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
        }
      } catch (e) { /* first run: no saved draft yet */ }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORE_KEY, JSON.stringify({ picks, settings, customPlayers }));
      } catch (e) { console.error("Save failed", e); }
    })();
  }, [picks, settings, customPlayers, loaded]);

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
  const myPicks = picks.filter(p => p.mine);
  const spent = myPicks.reduce((s, p) => s + p.price, 0);
  const remaining = settings.budget - spent;
  const slotsLeft = settings.rosterSize - myPicks.length;
  // must keep $1 for every other unfilled slot
  const maxBid = slotsLeft > 0 ? Math.max(0, remaining - (slotsLeft - 1)) : 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL.filter(p => {
      if (posFilter !== "ALL" && p.pos !== posFilter) return false;
      if (draftedIds.has(p.id)) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q);
    }).slice(0, q ? 12 : 40);
  }, [query, posFilter, draftedIds, ALL]);

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
      [JSON.stringify({ picks, settings, customPlayers, saved: new Date().toISOString() }, null, 2)],
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
        window.alert("Draft restored from backup.");
      } catch {
        window.alert("That file isn't a draft backup. Look for draft-backup.json in Downloads.");
      }
    };
    reader.readAsText(file);
    ev.target.value = "";
  };

  const resetDraft = () => {
    if (window.confirm("Start over? This clears every pick.")) {
      setPicks([]);
      setTab("draft");
    }
  };

  const priceNum = parseInt(price, 10) || 0;
  const overMax = selected && priceNum > maxBid;

  // ---------- Styles ----------
  const S = {
    app: {
      fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: "#F6F7F4", minHeight: "100vh", color: "#17211B",
      maxWidth: 560, margin: "0 auto", paddingBottom: 90,
    },
    scoreboard: {
      background: "#123524", color: "#F2F7EF", padding: "14px 18px 12px",
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      position: "sticky", top: 0, zIndex: 20,
      borderBottom: "4px solid #E8B33A",
    },
    money: { fontSize: 52, fontWeight: 800, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" },
    moneyLabel: { fontSize: 13, opacity: 0.75, marginTop: 4 },
    statCol: { textAlign: "right" },
    stat: { fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.15 },
    statLabel: { fontSize: 12, opacity: 0.75 },
    search: {
      width: "100%", boxSizing: "border-box", fontSize: 22, padding: "16px 18px",
      border: "2px solid #C8CDC6", borderRadius: 14, background: "#fff",
      outline: "none",
    },
    chipRow: { display: "flex", gap: 8, padding: "12px 16px 4px", overflowX: "auto" },
    chip: (active, pos) => ({
      border: "none", borderRadius: 999, padding: "10px 16px", fontSize: 16, fontWeight: 700,
      background: active ? (pos === "ALL" ? "#17211B" : POS_COLORS[pos].bg) : "#E5E8E2",
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
      position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 560, margin: "0 auto",
      display: "flex", background: "#fff", borderTop: "2px solid #DDE1DA", zIndex: 30,
    },
    tabBtn: (active) => ({
      flex: 1, padding: "14px 0 16px", border: "none", background: "none",
      fontSize: 16, fontWeight: active ? 800 : 500, color: active ? "#123524" : "#7C857A",
      borderTop: active ? "3px solid #E8B33A" : "3px solid transparent", cursor: "pointer",
    }),
  };

  if (!loaded) return <div style={{ ...S.app, padding: 40, textAlign: "center" }}>Loading your draft…</div>;

  return (
    <div style={{ background: "#060D09", minHeight: "100vh" }}>
    <MatrixRain enabled={settings.rain} />
    <div style={{ ...S.app, position: "relative", zIndex: 1 }}>
      {/* Scoreboard — always visible */}
      <div style={S.scoreboard}>
        <div>
          <div style={S.money}>${remaining}</div>
          <div style={S.moneyLabel}>left to spend</div>
        </div>
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

      {tab === "draft" && (
        <>
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
            {["ALL", "QB", "RB", "WR", "TE", "K", "DEF"].map(p => (
              <button key={p} style={S.chip(posFilter === p, p)} onClick={() => setPosFilter(p)}>{p}</button>
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
                <span style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 15, color: "#7C857A", fontWeight: 600 }}>{p.team}</span>
              </button>
            ))}
            {results.length === 0 && (
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
        </>
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
              <div key={pk.ts} style={{ ...S.row, cursor: "default", borderRadius: 0 }}>
                <span style={S.posTag(p.pos)}>{p.pos}</span>
                <span style={{ fontSize: 19, fontWeight: 600, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 19, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>${pk.price}</span>
              </div>
            );
          })}
          {picks.some(p => !p.mine) && (
            <>
              <h3 style={{ margin: "22px 2px 8px", fontSize: 17, color: "#41493F" }}>Drafted by other teams</h3>
              {picks.filter(p => !p.mine).map(pk => {
                const p = findP(pk.playerId);
                return (
                  <div key={pk.ts} style={{ ...S.row, cursor: "default", opacity: 0.65 }}>
                    <span style={S.posTag(p.pos)}>{p.pos}</span>
                    <span style={{ fontSize: 17, flex: 1 }}>{p.name}</span>
                    {pk.price > 0 && <span style={{ fontSize: 15, color: "#7C857A" }}>${pk.price}</span>}
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
          <label style={{ display: "block", fontSize: 17, fontWeight: 600, margin: "18px 0 6px" }}>Matrix rain background</label>
          <button
            onClick={() => setSettings(s => ({ ...s, rain: !s.rain }))}
            style={{ ...S.chip(settings.rain, "ALL"), padding: "12px 22px", fontSize: 17 }}
          >
            {settings.rain ? "On — footballs falling" : "Off"}
          </button>

          <label style={{ display: "block", fontSize: 17, fontWeight: 600, margin: "22px 0 6px" }}>Sheet sync URL (optional)</label>
          <input
            type="url"
            placeholder="Paste your Apps Script web app URL"
            value={settings.syncUrl}
            onChange={e => setSettings(s => ({ ...s, syncUrl: e.target.value.trim() }))}
            style={{ ...S.search, fontSize: 15 }}
          />
          <p style={{ color: "#7C857A", fontSize: 14, margin: "8px 0 0", lineHeight: 1.5 }}>
            {settings.syncUrl
              ? "Every pick pushes the full draft log to your Google Sheet."
              : "Leave blank to keep the draft on this device only."}
          </p>

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
          style={{ position: "fixed", inset: 0, background: "rgba(18,53,36,0.55)", zIndex: 40, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={closeModal}
        >
          <div
            style={{ background: "#fff", width: "100%", maxWidth: 560, borderRadius: "22px 22px 0 0", padding: "22px 20px 30px", boxSizing: "border-box" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={S.posTag(selected.pos)}>{selected.pos}</span>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{selected.name}</div>
                <div style={{ fontSize: 15, color: "#7C857A", fontWeight: 600 }}>{selected.team}</div>
              </div>
            </div>

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

      {/* Bottom tabs */}
      <div style={S.tabBar}>
        <button style={S.tabBtn(tab === "draft")} onClick={() => setTab("draft")}>Draft</button>
        <button style={S.tabBtn(tab === "roster")} onClick={() => setTab("roster")}>My Team</button>
        <button style={S.tabBtn(tab === "settings")} onClick={() => setTab("settings")}>Settings</button>
      </div>
    </div>
    </div>
  );
}
