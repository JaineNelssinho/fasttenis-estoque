import { useState, useMemo, useEffect, useCallback } from "react";

const CATEGORIES = ["Todos", "Alimentos", "Bebidas", "Limpeza", "Higiene", "Eletrônicos", "Outros"];
const API_KEY = "$2a$10$ioulsKYYmd97C2AG.H4rtOpCaMvjHtAaeEZKxRksaBh0eooX/5gwq";
const BIN_ID = "69ced41536566621a873b6cc";
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const H = { "Content-Type": "application/json", "X-Master-Key": API_KEY, "X-Bin-Meta": "false" };
export default function App() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncTime, setSyncTime] = useState(null);
  const [view, setView] = useState("dashboard");
  const [filterCat, setFilterCat] = useState("Todos");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "Outros", qty: "", minQty: "", price: "" });
  const [moveForm, setMoveForm] = useState({ productId: "", type: "entrada", qty: "", note: "", responsavel: "" });
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`${URL}/latest`, { headers: H });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products || []);
      setHistory(data.history || []);
      setSyncTime(new Date().toLocaleTimeString("pt-BR"));
    } catch {
      if (!silent) showToast("Erro de conexão.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (loading) return;
    const iv = setInterval(() => loadData(true), 20000);
    return () => clearInterval(iv);
  }, [loading, loadData]);

  const save = async (np, nh) => {
    setSaving(true);
    try {
      await fetch(URL, { method: "PUT", headers: H, body: JSON.stringify({ products: np, history: nh }) });
      setSyncTime(new Date().toLocaleTimeString("pt-BR"));
    } catch {
      showToast("Erro ao salvar!", "error");
    } finally {
      setSaving(false);
    }
  };

  const commit = (np, nh) => { setProducts(np); setHistory(nh); save(np, nh); };
  const entry = (h, e) => [{ ...e, id: Date.now(), date: new Date().toLocaleString("pt-BR") }, ...h];
Me 
  Confirmado! Está certo. Parte 3 — cola logo abaixo:
const addProduct = () => {
    if (!form.name.trim() || !form.qty || !form.price)
      return showToast("Preencha nome, quantidade e preço.", "error");
    const p = { id: Date.now(), name: form.name.trim(), category: form.category,
      qty: parseInt(form.qty), minQty: parseInt(form.minQty) || 0, price: parseFloat(form.price) };
    commit([...products, p], entry(history, { productId: p.id, productName: p.name,
      type: "cadastro", qty: p.qty, note: "Produto cadastrado", responsavel: "-" }));
    setForm({ name: "", category: "Outros", qty: "", minQty: "", price: "" });
    showToast(`"${p.name}" cadastrado!`);
  };

  const registerMove = () => {
    if (!moveForm.productId || !moveForm.qty)
      return showToast("Selecione produto e quantidade.", "error");
    const qty = parseInt(moveForm.qty);
    const prod = products.find(p => p.id === parseInt(moveForm.productId));
    if (!prod) return;
    if (moveForm.type === "saida" && prod.qty < qty)
      return showToast("Estoque insuficiente!", "error");
    commit(
      products.map(p => p.id === prod.id ? { ...p, qty: moveForm.type === "entrada" ? p.qty + qty : p.qty - qty } : p),
      entry(history, { productId: prod.id, productName: prod.name, type: moveForm.type,
        qty, note: moveForm.note || "-", responsavel: moveForm.responsavel || "Não informado" })
    );
    setMoveForm({ productId: "", type: "entrada", qty: "", note: "", responsavel: "" });
    showToast(`${moveForm.type === "entrada" ? "Entrada" : "Saída"} registrada!`);
  };

  const doDelete = () => {
    commit(
      products.filter(p => p.id !== confirmDelete.id),
      entry(history, { productId: confirmDelete.id, productName: confirmDelete.name,
        type: "remocao", qty: 0, note: "Removido", responsavel: "-" })
    );
    setConfirmDelete(null);
    showToast("Produto removido.");
  };

  const filtered = useMemo(() => products.filter(p =>
    (filterCat === "Todos" || p.category === filterCat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [products, filterCat, search]);

  const alerts = products.filter(p => p.qty <= p.minQty && p.minQty > 0);
  const totalValue = products.reduce((acc, p) => acc + p.qty * p.price, 0);
  if (loading) return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#0f0f13", color: "#e8e6f0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 40 }}>👟</div>
      <div style={{ fontSize: 15, color: "#666" }}>Conectando ao estoque...</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#0f0f13", color: "#e8e6f0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { background: #1e1e2a; border: 1px solid #2e2e42; color: #e8e6f0; border-radius: 8px; padding: 10px 14px; font-size: 14px; outline: none; width: 100%; margin-bottom: 10px; }
        button { cursor: pointer; }
        .card { background: #16161f; border: 1px solid #22222e; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
        .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .mini { text-align: center; background: #1a1a24; border-radius: 8px; padding: 8px; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, background: toast.type === "error" ? "#c0392b" : "#27ae60", color: "white", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, maxWidth: 260 }}>
          {toast.msg}
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ maxWidth: 300, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
            <p style={{ marginBottom: 16 }}>Remover <strong>{confirmDelete.name}</strong>?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={doDelete} style={{ background: "#c0392b", color: "white", border: "none", padding: "6px 16px", borderRadius: 6 }}>Confirmar</button>
              <button onClick={() => setConfirmDelete(null)} style={{ background: "#2a2a38", color: "#aaa", border: "none", padding: "6px 16px", borderRadius: 6 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "#13131c", borderBottom: "1px solid #1e1e2c", padding: "0 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6c63ff,#9b59b6)", display: "flex", alignItems: "center", justifyContent: "center" }}>👟</div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Fast Tênis</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {saving && <span style={{ fontSize: 12, color: "#6c63ff" }}>💾 Salvando...</span>}
            {syncTime && !saving && <span style={{ fontSize: 11, color: "#444" }}>✓ {syncTime}</span>}
            {alerts.length > 0 && <div style={{ background: "#3a0a0a", color: "#e74c3c", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>⚠ {alerts.length}</div>}
          </div>
        </div>
      </div>

      <div style={{ background: "#13131c", borderBottom: "1px solid #1e1e2c" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {[["dashboard","📊 Início"],["produtos","📦 Produtos"],["movimentar","🔄 Mover"],["historico","🕐 Histórico"]].map(([k,l]) => (
            <button key={k} onClick={() => setView(k)} style={{ background: "none", border: "none", color: view === k ? "#6c63ff" : "#666", padding: "13px 12px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", borderBottom: view === k ? "2px solid #6c63ff" : "2px solid transparent" }}>{l}</button>
          ))}
        </div>
      </div>
Me avParte 5 — cola abaixo:
<div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {view === "dashboard" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Visão Geral</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[["📦", products.length, "Produtos", "#6c63ff"],["💰", `R$${totalValue.toFixed(0)}`, "Valor Total", "#27ae60"],["🔄", history.length, "Movimentações", "#3498db"],["⚠️", alerts.length, "Alertas", alerts.length > 0 ? "#e74c3c" : "#444"]].map(([icon,val,label,color]) => (
                <div key={label} className="card" style={{ borderLeft: `3px solid ${color}`, padding: 14, marginBottom: 0 }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
                </div>
              ))}
            </div>

            {alerts.length > 0 && (
              <div className="card" style={{ border: "1px solid #c0392b33", background: "#160a0a" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e74c3c", marginBottom: 10 }}>⚠️ Estoque Baixo</div>
                {alerts.map(a => (
                  <div key={a.id} className="row" style={{ padding: "7px 10px", background: "#1e1010", borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</span>
                    <span style={{ color: "#e74c3c", fontSize: 12 }}>{a.qty}/{a.minQty} mín</span>
                  </div>
                ))}
              </div>
            )}

            {history.slice(0,5).length > 0 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🕐 Últimas Movimentações</div>
                {history.slice(0,5).map(h => (
                  <div key={h.id} className="row" style={{ padding: "8px 10px", background: "#1a1a24", borderRadius: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{h.productName}</div>
                      {h.responsavel && h.responsavel !== "-" && <div style={{ color: "#9b8fff", fontSize: 11 }}>👤 {h.responsavel}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="tag" style={{ background: h.type === "entrada" ? "#1a3a1a" : h.type === "saida" ? "#3a1a1a" : "#1a2a3a", color: h.type === "entrada" ? "#2ecc71" : h.type === "saida" ? "#e74c3c" : "#3498db" }}>
                        {h.type === "entrada" ? `+${h.qty}` : h.type === "saida" ? `-${h.qty}` : "novo"}
                      </span>
                      <span style={{ color: "#444", fontSize: 11 }}>{h.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {products.length === 0 && (
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>👟</div>
                <p style={{ color: "#555", fontSize: 14 }}>Nenhum produto cadastrado.</p>
                <button onClick={() => setView("produtos")} style={{ background: "linear-gradient(135deg,#6c63ff,#9b59b6)", color: "white", border: "none", padding: "10px 24px", borderRadius: 8, marginTop: 14, fontWeight: 600 }}>Cadastrar produto</button>
              </div>
            )}
          </div>
        )}
Me avParte 6 — cola abaixo:
{view === "produtos" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Produtos</h2>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9b8fff", marginBottom: 12 }}>+ Novo Produto</div>
              <input placeholder="Nome do produto" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.filter(c => c !== "Todos").map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input style={{ marginBottom: 0 }} type="number" placeholder="Qtd. inicial" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
                <input style={{ marginBottom: 0 }} type="number" placeholder="Qtd. mínima" value={form.minQty} onChange={e => setForm(f => ({ ...f, minQty: e.target.value }))} />
              </div>
              <input style={{ marginTop: 10 }} type="number" placeholder="Preço unitário (R$)" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              <button onClick={addProduct} style={{ background: "linear-gradient(135deg,#6c63ff,#9b59b6)", color: "white", border: "none", padding: "11px", borderRadius: 8, fontWeight: 600, width: "100%" }}>Cadastrar</button>
            </div>

            <input placeholder="🔍 Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? "#6c63ff" : "#1e1e2a", color: filterCat === c ? "white" : "#666", border: "none", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{c}</button>
              ))}
            </div>

            {filtered.map(p => (
              <div key={p.id} className="card">
                <div className="row">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                    <span className="tag" style={{ background: "#1e1e2e", color: "#9b8fff", marginTop: 4 }}>{p.category}</span>
                  </div>
                  <button onClick={() => setConfirmDelete(p)} style={{ background: "#c0392b", color: "white", border: "none", padding: "5px 12px", borderRadius: 6, fontSize: 12 }}>Remover</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
                  <div className="mini">
                    <div style={{ fontSize: 17, fontWeight: 700, color: p.qty <= p.minQty && p.minQty > 0 ? "#e74c3c" : "#2ecc71" }}>{p.qty}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>estoque</div>
                  </div>
                  <div className="mini">
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#666" }}>{p.minQty}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>mínimo</div>
                  </div>
                  <div className="mini">
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1c40f" }}>R${(p.qty * p.price).toFixed(0)}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>valor</div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="card" style={{ textAlign: "center", padding: 40, color: "#555" }}>🔍 Nenhum produto encontrado.</div>}
          </div>
        )}

Claro! Aqui está tudo de uma vez — as partes 7, 8 e 9 (final). Cola tudo abaixo do que já tem:
{view === "movimentar" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Registrar Movimentação</h2>
            <div className="card">
              <div style={{ display: "flex", background: "#1a1a24", borderRadius: 10, padding: 4, marginBottom: 18 }}>
                {["entrada","saida"].map(t => (
                  <button key={t} onClick={() => setMoveForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: moveForm.type === t ? (t === "entrada" ? "#27ae60" : "#c0392b") : "transparent", color: moveForm.type === t ? "white" : "#666", fontWeight: 700, fontSize: 14 }}>
                    {t === "entrada" ? "📥 Entrada" : "📤 Saída"}
                  </button>
                ))}
              </div>
              <select value={moveForm.productId} onChange={e => setMoveForm(f => ({ ...f, productId: e.target.value }))}>
                <option value="">Selecione um produto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Estoque: {p.qty})</option>)}
              </select>
              <input type="number" placeholder="Quantidade" value={moveForm.qty} onChange={e => setMoveForm(f => ({ ...f, qty: e.target.value }))} />
              <input placeholder="👤 Nome do funcionário" value={moveForm.responsavel} onChange={e => setMoveForm(f => ({ ...f, responsavel: e.target.value }))} />
              <input placeholder="Observação (opcional)" value={moveForm.note} onChange={e => setMoveForm(f => ({ ...f, note: e.target.value }))} />
              <button onClick={registerMove} style={{ background: moveForm.type === "entrada" ? "linear-gradient(135deg,#27ae60,#2ecc71)" : "linear-gradient(135deg,#c0392b,#e74c3c)", color: "white", border: "none", padding: "11px", borderRadius: 8, fontWeight: 600, width: "100%" }}>
                {moveForm.type === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
              </button>
              {products.length === 0 && <p style={{ color: "#555", fontSize: 13, marginTop: 12, textAlign: "center" }}>Cadastre produtos primeiro.</p>}
            </div>
          </div>
        )}

        {view === "historico" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Histórico</h2>
            {history.length > 0 ? history.map(h => (
              <div key={h.id} className="card">
                <div className="row">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{h.productName}</div>
                    {h.responsavel && h.responsavel !== "-" && <div style={{ color: "#9b8fff", fontSize: 11 }}>👤 {h.responsavel}</div>}
                    <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>{h.date}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span className="tag" style={{ background: h.type === "entrada" ? "#1a3a1a" : h.type === "saida" ? "#3a1a1a" : "#1a2a3a", color: h.type === "entrada" ? "#2ecc71" : h.type === "saida" ? "#e74c3c" : "#3498db" }}>
                      {h.type === "entrada" ? `+${h.qty}` : h.type === "saida" ? `-${h.qty}` : "cadastro"}
                    </span>
                    {h.note && h.note !== "-" && <span style={{ color: "#555", fontSize: 11 }}>{h.note}</span>}
                  </div>
                </div>
              </div>
            )) : (
              <div className="card" style={{ textAlign: "center", padding: 48, color: "#555" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🕐</div>
                <p>Nenhuma movimentação ainda.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

