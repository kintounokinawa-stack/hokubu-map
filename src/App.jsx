import { useEffect, useState, useRef } from "react";
import MapView from "./MapView";
import MarkerList from "./MarkerList";
import { supabase } from "./supabaseClient";

/* =========================
   1. 指導員の名簿と色の設定
========================= */
const initialStaffList = [
  "松本", "比嘉", "島袋", "徳田", "森川", 
  "崎原", "あきな", "津田", "金城"
];

const colorPalette = [
  "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"
];

// ★修正点3: 2026年度から始まるように変更
const getTodayFiscalYear = () => {
  return 2026; 
};

export default function App() {
  const [fiscalYear, setFiscalYear] = useState(getTodayFiscalYear());
  const [markers, setMarkers] = useState([]);
  const [staffList, setStaffList] = useState(initialStaffList);
  const [staffColors, setStaffColors] = useState({});
  // ★修正点1: 初期選択を「ALL」ではなく「名簿の最初の人」に変更
  const [selectedStaff, setSelectedStaff] = useState(initialStaffList[0]);
  const [newStaffName, setNewStaffName] = useState("");

  /* =========================
      2. データ取得（Supabase）
  ========================= */
  const fetchMarkers = async () => {
    const { data, error } = await supabase.from('facilities').select('*');
    if (error) {
      console.error("読み込みエラー:", error);
    } else if (data) {
      const formatted = data.map(m => ({
        id: m.id,
        shopName: m.name,
        address: m.address,
        lat: parseFloat(m.lat),
        lng: parseFloat(m.lng),
        date: m.created_at,
        staff: m.staff || "未設定"
      }));
      setMarkers(formatted);
    }
  };

  useEffect(() => {
    fetchMarkers();
    const colors = {};
    initialStaffList.forEach((name, i) => {
      colors[name] = colorPalette[i % colorPalette.length];
    });
    setStaffColors(colors);
  }, []);

  /* =========================
      3. マーカー操作
  ========================= */
  const addMarker = async (marker) => {
    const { error } = await supabase
      .from('facilities')
      .insert([{ 
        name: marker.shopName, 
        address: marker.address || "", 
        lat: marker.lat, 
        lng: marker.lng,
        staff: marker.staff 
      }]);

    if (error) {
      alert("保存エラー: " + error.message);
    } else {
      fetchMarkers();
    }
  };

  const deleteMarker = async (id) => {
    if (!window.confirm("このデータを削除しますか？")) return;
    const { error } = await supabase.from('facilities').delete().eq('id', id);
    if (error) alert("削除エラー: " + error.message);
    else fetchMarkers();
  };

  /* =========================
      4. 担当者の追加
  ========================= */
  const handleAddStaff = () => {
    const name = newStaffName.trim();
    if (!name || staffList.includes(name)) return;

    setStaffList(prev => [...prev, name]);
    const usedColors = Object.values(staffColors);
    const newColor = colorPalette.find(c => !usedColors.includes(c)) || "#666666";
    setStaffColors(prev => ({ ...prev, [name]: newColor }));
    setNewStaffName("");
  };

  const exportCSV = () => {
    if (markers.length === 0) return alert("データがありません");
    const header = ["店名", "住所", "担当者", "緯度", "経度"];
    const rows = markers.map((m) => [m.shopName, m.address, m.staff, m.lat, m.lng]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `巡回データ_${fiscalYear}.csv`;
    link.click();
  };

  // ★修正点1: selectedStaff が "ALL" の場合の処理を削除（常に誰かを選択）
  const filteredMarkers = markers.filter((m) => m.staff === selectedStaff);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ background: "#0f766e", color: "white", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: "bold" }}>沖縄県北部 指導巡回マップ</div>
        <div style={{ fontSize: "14px" }}>
          年度：
          <select value={fiscalYear} onChange={(e) => setFiscalYear(Number(e.target.value))} style={{ marginLeft: "5px" }}>
            {/* ★修正点3: 2026年を起点にリストを作成 */}
            {[2026, 2027, 2028].map(y => <option key={y} value={y}>{y}年度</option>)}
          </select>
        </div>
      </div>

      {/* ツールバー */}
      <div style={{ padding: "8px 12px", background: "#f3f4f6", display: "flex", gap: "15px", alignItems: "center", borderBottom: "1px solid #ddd" }}>
        <button onClick={exportCSV} style={{ padding: "5px 10px", cursor: "pointer" }}>CSV保存</button>
        <div style={{ borderLeft: "2px solid #ccc", height: "20px" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "13px", fontWeight: "bold" }}>担当者追加:</span>
          <input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="氏名" style={{ padding: "4px", width: "100px", borderRadius: "4px", border: "1px solid #ccc" }} />
          <button onClick={handleAddStaff} style={{ padding: "4px 8px", background: "#0d9488", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>追加</button>
        </div>
      </div>

      {/* 地図 */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapView
          markers={filteredMarkers}
          addMarker={addMarker}
          deleteMarker={deleteMarker}
          staffList={staffList}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          staffColors={staffColors}
        />
      </div>

      {/* ★修正点2: 一覧の再構築（下にリストが表示されるように調整済み） */}
      <div style={{ height: "180px", borderTop: "1px solid #ddd", display: "flex", flexDirection: "column", background: "white" }}>
        <div style={{ padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #eee", fontWeight: "bold", fontSize: "14px", display: "flex", justifyContent: "space-between" }}>
          <span>{selectedStaff} さんの巡回一覧 ({filteredMarkers.length}件)</span>
          <span style={{ fontSize: "12px", color: "#666" }}>※クラウド同期済み</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <MarkerList markers={filteredMarkers} deleteMarker={deleteMarker} />
        </div>
      </div>
    </div>
  );
}