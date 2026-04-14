import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import { db } from "./firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

function App() {
  const [markers, setMarkers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("ALL");
  const [newStaffName, setNewStaffName] = useState("");

  const staffColors = {
    松本: "#ff4444", 比嘉: "#44ff44", 徳田: "#4444ff",
    島袋: "#ffaa00", 津田: "#9b59b6", 宮里: "#1abc9c",
    あきな: "#f1c40f", 金城: "#e67e22", その他: "#9ca3af"
  };

  useEffect(() => {
    const unsubMarkers = onSnapshot(collection(db, "markers"), (snapshot) => {
      setMarkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubStaff = onSnapshot(collection(db, "staffs"), (snapshot) => {
      setStaffList(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });
    return () => { unsubMarkers(); unsubStaff(); };
  }, []);

  // ★現在地を取得する機能
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("GPSに対応していません。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const event = new CustomEvent("flyToLocation", { 
          detail: { lat: latitude, lng: longitude } 
        });
        window.dispatchEvent(event);
      },
      () => alert("位置情報を許可してください。"),
      { enableHighAccuracy: true }
    );
  };

  const addStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    await addDoc(collection(db, "staffs"), { name: newStaffName });
    setNewStaffName("");
  };

  const deleteStaff = async (id, name) => {
    if (window.confirm(`担当者「${name}」を削除しますか？`)) {
      await deleteDoc(doc(db, "staffs", id));
    }
  };

  const addMarker = async (data) => {
    await addDoc(collection(db, "markers"), { ...data, createdAt: serverTimestamp() });
  };

  const deleteMarker = async (id) => {
    if (window.confirm("このデータを削除しますか？")) {
      await deleteDoc(doc(db, "markers", id));
    }
  };

  const totalCount = markers.length;
  const myCount = selectedStaff === "ALL" ? markers.length : markers.filter(m => m.staff === selectedStaff).length;

  return (
    <div className="App" style={{ fontFamily: "sans-serif", padding: "10px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* ヘッダー：タイトルの横にボタンを配置 */}
      <header style={{ 
        background: "#2c3e50", color: "#fff", padding: "15px", 
        borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" 
      }}>
        <h1 style={{ margin: 0, fontSize: "18px" }}>北部巡回マップ 2026</h1>
        
        <button 
          onClick={handleLocate}
          style={{
            padding: "8px 16px", background: "#e67e22", color: "white", 
            border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer"
          }}
        >
          📍現在地を取得
        </button>
      </header>

      {/* 件数表示 */}
      <section style={{ background: "#f7f9fb", padding: "12px", marginTop: "10px", borderRadius: "8px", border: "1px solid #ddd", textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>総訪問件数：{totalCount}件</div>
        {selectedStaff !== "ALL" && (
          <div style={{ marginTop: "5px", fontSize: "15px" }}>あなたの訪問件数：{myCount}件</div>
        )}
      </section>

      <main>
        <MapView
          markers={markers}
          addMarker={addMarker}
          deleteMarker={deleteMarker}
          staffList={staffList.map(s => s.name)}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          staffColors={staffColors}
        />

        <hr style={{ margin: "20px 0" }} />

        {/* 担当者管理 */}
        <section style={{ background: "#fdfdfd", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px" }}>
          <h3 style={{ marginTop: 0 }}>👤 担当者の管理</h3>
          <form onSubmit={addStaff} style={{ marginBottom: "10px" }}>
            <input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="新しい担当者名" style={{ padding: "8px", marginRight: "5px" }} />
            <button type="submit" style={{ padding: "8px" }}>追加</button>
          </form>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {staffList.map(s => (
              <span key={s.id} style={{ background: "#eee", padding: "5px 10px", borderRadius: "15px", fontSize: "14px" }}>
                {s.name} <button onClick={() => deleteStaff(s.id, s.name)} style={{ border: "none", color: "red", cursor: "pointer" }}>×</button>
              </span>
            ))}
          </div>
        </section>

        {/* 巡回先リスト */}
        <section style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3>📋 巡回先リスト</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                <th style={{ padding: "8px" }}>店舗名</th>
                <th style={{ padding: "8px" }}>担当</th>
                <th style={{ padding: "8px", textAlign: "center" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {markers.filter(m => selectedStaff === "ALL" || m.staff === selectedStaff).map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{m.shopName}</td>
                  <td style={{ padding: "8px" }}>{m.staff}</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <button onClick={() => deleteMarker(m.id)} style={{ background: "#ff7675", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px" }}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;