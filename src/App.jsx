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
    松本: "#ff4444", 比嘉: "#44ff44", 徳田: "#4444ff", 島袋: "#ffaa00",
    津田: "#9b59b6", 宮里: "#1abc9c", あきな: "#f1c40f", 金城: "#e67e22", その他: "#9ca3af"
  };

  useEffect(() => {
    const unsubMarkers = onSnapshot(collection(db, "markers"), (snapshot) => {
      const sorted = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMarkers(sorted);
    });
    const unsubStaff = onSnapshot(collection(db, "staffs"), (snapshot) => {
      setStaffList(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });
    return () => { unsubMarkers(); unsubStaff(); };
  }, []);

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

  const addStaff = async () => {
    if (!newStaffName) return;
    await addDoc(collection(db, "staffs"), { name: newStaffName });
    setNewStaffName("");
  };

  const deleteStaff = async (id) => {
    if (window.confirm("スタッフを削除しますか？")) await deleteDoc(doc(db, "staffs", id));
  };

  const addMarker = async (newMarker) => {
    await addDoc(collection(db, "markers"), { ...newMarker, createdAt: serverTimestamp() });
  };

  const deleteMarker = async (id) => {
    if (window.confirm("記録を削除しますか？")) await deleteDoc(doc(db, "markers", id));
  };

  const displayCount = selectedStaff === "ALL" 
    ? markers.length 
    : markers.filter(m => m.staff === selectedStaff).length;

  return (
    <div style={{ padding: "10px", maxWidth: "1250px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      
      {/* 🛠 ヘッダーを「横並び一行」に特化 */}
      <header style={{ 
        background: "#2c3e50", color: "#fff", padding: "10px 20px", 
        borderRadius: "8px", marginBottom: "15px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h1 style={{ margin: "0", fontSize: "20px" }}>北部巡回マップ</h1>
          {/* ボタンの背景色を赤っぽくして、出た瞬間にすぐ気づくようにします */}
          <button 
            onClick={handleLocate}
            style={{
              padding: "8px 12px", background: "#e67e22", color: "#white", border: "none",
              borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "14px"
            }}
          >
            📍現在地を取得
          </button>
        </div>

        <div style={{ fontSize: "14px" }}>
          {selectedStaff === "ALL" ? "総件数" : `${selectedStaff}さん`}: <b>{displayCount}</b> 件
        </div>
      </header>

      <MapView
        markers={markers} 
        addMarker={addMarker}
        deleteMarker={deleteMarker}
        staffList={staffList.map(s => s.name)} 
        selectedStaff={selectedStaff}
        setSelectedStaff={setSelectedStaff} 
        staffColors={staffColors}
      />

      {/* 訪問場所リスト */}
      <section style={{ marginTop: "20px" }}>
        <h3 style={{ fontSize: "15px", color: "#7f8c8d" }}>訪問場所一覧</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
          {markers.map(m => (
            <div key={m.id} style={{ background: "#fff", padding: "10px", borderRadius: "8px", borderLeft: `5px solid ${staffColors[m.staff] || "#ccc"}`, fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{m.shopName}</b>
                <button onClick={() => deleteMarker(m.id)} style={{ border: "none", background: "none", color: "#e74c3c", cursor: "pointer" }}>×</button>
              </div>
              <div>{m.date} / {m.staff}</div>
            </div>
          ))}
        </div>
      </section>

      {/* スタッフ設定 */}
      <div style={{ marginTop: "20px", padding: "15px", background: "#fff", borderRadius: "8px", border: "1px solid #eee" }}>
        <input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="スタッフ名" style={{ padding: "8px" }} />
        <button onClick={addStaff} style={{ marginLeft: "5px", padding: "8px 15px", background: "#34495e", color: "white", border: "none" }}>追加</button>
        <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {staffList.map(s => (
            <span key={s.id} style={{ background: "#eee", padding: "2px 8px", borderRadius: "10px", fontSize: "12px" }}>
              {s.name} <button onClick={() => deleteStaff(s.id)} style={{ border: "none", background: "none", color: "red" }}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;