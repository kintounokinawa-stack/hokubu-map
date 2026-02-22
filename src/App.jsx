import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import { db } from "./firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

function App() {
  const [markers, setMarkers] = useState([]);
  const [staffList, setStaffList] = useState([]); // データベースから読み込む
  const [selectedStaff, setSelectedStaff] = useState("ALL");
  const [newStaffName, setNewStaffName] = useState("");

  const staffColors = {
    松本: "#ff4444", 比嘉: "#44ff44", 徳田: "#4444ff", 
    島袋: "#ffaa00", 津田: "#9b59b6", 宮里: "#1abc9c", 
    あきな: "#f1c40f", 金城: "#e67e22", その他: "#9ca3af"
  };

  useEffect(() => {
    // 1. ピン情報の取得
    const unsubMarkers = onSnapshot(collection(db, "markers"), (snapshot) => {
      setMarkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. 担当者リストの取得
    const unsubStaff = onSnapshot(collection(db, "staffs"), (snapshot) => {
      const sData = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setStaffList(sData);
    });

    return () => { unsubMarkers(); unsubStaff(); };
  }, []);

  // 担当者を追加する
  const addStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    await addDoc(collection(db, "staffs"), { name: newStaffName });
    setNewStaffName("");
  };

  // 担当者そのものを削除する（辞めた人など）
  const deleteStaff = async (id, name) => {
    if (window.confirm(`担当者「${name}」をリストから削除しますか？\n（※その人が立てたピンは地図に残ります）`)) {
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

  return (
    <div className="App" style={{ fontFamily: "sans-serif", padding: "10px" }}>
      <header style={{ background: "#2c3e50", color: "#fff", padding: "10px", textAlign: "center", borderRadius: "8px" }}>
        <h1 style={{ margin: 0, fontSize: "18px" }}>北部巡回マップ 2026</h1>
      </header>

      <main>
        <MapView
          markers={markers}
          addMarker={addMarker}
          deleteMarker={deleteMarker}
          staffList={staffList.map(s => s.name)} // 名前だけの配列にして渡す
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          staffColors={staffColors}
        />

        <hr style={{ margin: "20px 0" }} />

        {/* ★ここが新機能：担当者の管理 */}
        <section style={{ background: "#fdfdfd", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px" }}>
          <h3 style={{ marginTop: 0 }}>👤 担当者の管理</h3>
          <form onSubmit={addStaff} style={{ marginBottom: "10px" }}>
            <input 
              value={newStaffName} 
              onChange={(e) => setNewStaffName(e.target.value)} 
              placeholder="新しい担当者名"
              style={{ padding: "8px", marginRight: "5px" }}
            />
            <button type="submit" style={{ padding: "8px" }}>追加</button>
          </form>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {staffList.map(s => (
              <span key={s.id} style={{ background: "#eee", padding: "5px 10px", borderRadius: "15px", fontSize: "14px" }}>
                {s.name} 
                <button onClick={() => deleteStaff(s.id, s.name)} style={{ marginLeft: "8px", border: "none", color: "red", cursor: "pointer", fontWeight: "bold" }}>×</button>
              </span>
            ))}
          </div>
        </section>

        <section style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3>📋 巡回先リスト</h3>
          {/* ...（以前と同じテーブル）... */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                <th style={{ padding: "8px" }}>店舗名</th>
                <th style={{ padding: "8px" }}>担当</th>
                <th style={{ padding: "8px", textAlign: "center" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {markers
                .filter(m => selectedStaff === "ALL" || m.staff === selectedStaff)
                .map((m) => (
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