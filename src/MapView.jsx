import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ====================================
   担当者ごとの色付きピンを作成する関数
==================================== */
const createColoredIcon = (color) => {
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  
  return L.divIcon({
    className: "custom-icon",
    html: svgTemplate,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

/* ====================================
   地図クリックでピンを立てる機能
==================================== */
function LocationMarker({ addMarker, staffList, selectedStaff }) {
  useMapEvents({
    click(e) {
      // ★修正：selectedStaffがALLでない前提のロジックに簡略化
      const defaultStaff = selectedStaff;
      
      const shopName = prompt("店舗名（施設名）を入力してください");
      if (!shopName) return;

      const date = new Date().toISOString().split("T")[0];

      addMarker({
        shopName,
        date,
        staff: defaultStaff || "未設定",
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return null;
}

/* ====================================
   地図本体
==================================== */
export default function MapView({
  markers,
  addMarker,
  deleteMarker,
  staffList,
  selectedStaff,
  setSelectedStaff,
  staffColors,
}) {
  const center = [26.6622, 127.8891];

  return (
    <div
      style={{
        height: "70vh",   
        width: "100%",
        position: "relative",
      }}
    >
      {/* 担当者フィルター */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "8px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>
          担当者フィルター：
        </span>
        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          style={{ marginLeft: "4px" }}
        >
          {/* ★修正1: 「ALL」を削除 */}
          {staffList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        {/* ★修正4: 山や標高を消し、道路をスッキリ見せるデザイン（CartoDB Positron）に変更 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <LocationMarker
          addMarker={addMarker}
          staffList={staffList}
          selectedStaff={selectedStaff}
        />

        {markers.map((m) => {
          const color = staffColors[m.staff] || "#9ca3af";
          const icon = createColoredIcon(color);

          return (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
              <Popup>
                <div style={{ minWidth: "150px" }}>
                  <div style={{ fontSize: "12px", color: color, fontWeight: "bold" }}>
                    担当：{m.staff}
                  </div>
                  <strong style={{ fontSize: "16px" }}>{m.shopName}</strong>
                  <p style={{ margin: "4px 0", color: "#666", fontSize: "12px" }}>
                    {m.address}
                  </p>
                  <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #eee" }} />
                  <button
                    onClick={() => deleteMarker(m.id)}
                    style={{
                      background: "#fee2e2",
                      color: "#b91c1c",
                      border: "1px solid #f87171",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    削除する
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}