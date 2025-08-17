// Buckshot Assistant v3.8.3 — инвертер сбрасывается после хода
import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";

export default function BuckshotAssistant() {
  const [players, setPlayers] = useState(["Игрок 1", "Игрок 2"]);
  const [playerCount, setPlayerCount] = useState(2);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [red, setRed] = useState(3);
  const [blue, setBlue] = useState(3);
  const [barrel, setBarrel] = useState([]);
  const [knownShells, setKnownShells] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chance, setChance] = useState(0);
  const [usedInverter, setUsedInverter] = useState(false);
  const [spentCount, setSpentCount] = useState(0);

  const initPlayers = (count) => {
    const arr = [];
    for (let i = 0; i < count; i++) arr.push(`Игрок ${i + 1}`);
    setPlayers(arr);
    setCurrentPlayer(0);
  };

  const generateBarrel = () => {
    const arr = Array(red).fill("к").concat(Array(blue).fill("с"));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setBarrel(arr);
    setKnownShells([]);
    setLogs([]);
    setChance(0);
    setUsedInverter(false);
    setSpentCount(0);
  };

  const log = (msg) => setLogs((prev) => [...prev, msg]);

  const nextTurn = () => {
    setCurrentPlayer((prev) => (prev + 1) % players.length);
  };

  const handleShoot = (target, type) => {
    const shooter = players[currentPlayer];
    const isSelf = target === "self";
    const targetName = isSelf ? shooter : `другого игрока`;
    const bulletText = type === "к" ? "🟥 КРАСНЫЙ" : "🟦 СИНИЙ";

    const inverted = (t) => (t === "к" ? "с" : "к");
    const actualSpentShell = usedInverter ? inverted(type) : type;

    if (actualSpentShell === "к") setRed((r) => r - 1);
    else setBlue((b) => b - 1);

    log(`${shooter} выстрелил в ${targetName} — ${bulletText}`);
    setSpentCount((c) => c + 1);
    setUsedInverter(false);

    const effectiveType = type;
    if (isSelf && effectiveType === "с") return;
    nextTurn();
  };

  const handleSkip = (type) => {
    if (type === "к") setRed((r) => r - 1);
    else setBlue((b) => b - 1);
    log(`${players[currentPlayer]} скинул патрон ${type === "к" ? "🟥" : "🟦"}`);
    setSpentCount((c) => c + 1);
    setUsedInverter(false);
  };

  const handlePhone = (pos, type) => {
    if (pos < 3 || pos > barrel.length) return log("❌ Телефон: недопустимая позиция.");
    setKnownShells((prev) => [...prev, { pos, type }]);
    log(`📱 Телефон: патрон №${pos} — ${type === "к" ? "🟥" : "🟦"}`);
  };

  const toggleInverter = () => {
    setUsedInverter(true);
    log(`${players[currentPlayer]} использовал инвертер.`);
  };

  useEffect(() => {
    let redCount = red;
    let blueCount = blue;

    const total = redCount + blueCount;
    if (total === 0) return setChance(0);
    const shiftedShells = knownShells.map(k => ({ pos: k.pos - spentCount, type: k.type })).filter(k => k.pos > 1);
    const knownRed = shiftedShells.filter(k => k.type === "к").length;
    const knownBlue = shiftedShells.filter(k => k.type === "с").length;
    const unknownTotal = total - knownRed - knownBlue;
    const unknownRed = redCount - knownRed;
    const chancePercent = Math.round((unknownRed / unknownTotal) * 100);
    setChance(isNaN(chancePercent) ? 0 : chancePercent);
  }, [red, blue, knownShells, spentCount]);

  const renderBarrel = () => {
    return barrel.map((_, index) => {
      const pos = index + 1;
      const isSpent = index < spentCount;
      const phoneKnown = knownShells.find(k => k.pos === pos);
      let symbol = "❓";
      if (isSpent) symbol = "⬜";
      else if (phoneKnown) symbol = phoneKnown.type === "к" ? "🟥" : "🟦";
      return <span key={index} className="px-1">{symbol}</span>;
    });
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardContent className="space-y-2">
              <h2 className="text-2xl font-bold">🎯 Buckshot Assistant 3.8.3</h2>

              <div className="flex gap-2 items-center">
                <label>Игроков:</label>
                <Input type="number" value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))} />
                <Button onClick={() => initPlayers(playerCount)}>Создать</Button>
              </div>

              {Array.from({ length: playerCount }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <label>{`Имя ${i + 1}:`}</label>
                  <Input value={players[i] || ""} onChange={(e) => {
                    const updated = [...players];
                    updated[i] = e.target.value;
                    setPlayers(updated);
                  }} />
                </div>
              ))}

              <div className="flex gap-2 items-center">
                <label>🟥</label>
                <Input type="number" value={red} onChange={(e) => setRed(Number(e.target.value))} />
                <label>🟦</label>
                <Input type="number" value={blue} onChange={(e) => setBlue(Number(e.target.value))} />
                <Button onClick={generateBarrel}>🎲 Новый раунд</Button>
                <span>💀 Шанс смерти: <b>{chance}%</b></span>
              </div>

              <p>Ходит: <b>{players[currentPlayer]}</b></p>
              {usedInverter && <p className="text-red-600">🔁 Инвертер активен — патрон поменян</p>}

              <div className="flex flex-wrap gap-2">
                <Button onClick={toggleInverter}>🔁 Инвертер</Button>
                <Button onClick={() => handleShoot("self", "к")}>🟥 В себя (умрёшь)</Button>
                <Button onClick={() => handleShoot("self", "с")}>🟦 В себя (жив)</Button>
                <Button onClick={() => handleShoot("other", "к")}>🟥 В другого</Button>
                <Button onClick={() => handleShoot("other", "с")}>🟦 В другого</Button>
                <Button onClick={() => handleSkip("к")}>🍺 Скип 🟥</Button>
                <Button onClick={() => handleSkip("с")}>🍺 Скип 🟦</Button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {Array.from({ length: barrel.length }).map((_, i) => (
                  i + 1 >= 3 && (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="w-24">Телефон {i + 1}:</span>
                      <Button onClick={() => handlePhone(i + 1, "к")}>🟥</Button>
                      <Button onClick={() => handlePhone(i + 1, "с")}>🟦</Button>
                    </div>
                  )
                ))}
              </div>

              <div className="border p-2 text-sm font-mono bg-white rounded mt-4">
                <div>📜 Лог:</div>
                {logs.map((line, i) => <div key={i}>{line}</div>)}
              </div>
              <div className="mt-4 text-sm">
                <div>🔫 Барабан:</div>
                <div>{renderBarrel()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent>
              <h3 className="text-lg font-bold mb-2">📱 Телефоны (позиции актуальны)</h3>
              {knownShells.length === 0 ? <div>—</div> : knownShells.map((k, i) => (
                k.pos - spentCount > 0 && <div key={i}>#{k.pos - spentCount} — {k.type === "к" ? "🟥 КРАСНЫЙ" : "🟦 СИНИЙ"}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
