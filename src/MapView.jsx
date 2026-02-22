import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ピンのアイコン作成
const createColoredIcon = (color) => {
  const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({ 
    className: "custom-icon", 
    html: svgTemplate, 
    iconSize: [32, 32], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
  });
};

function LocationMarker({ addMarker, staffList, selectedStaff }) {
  useMapEvents({
    click(e) {
      const defaultStaff = selectedStaff === "ALL" ? (staffList[0] || "未設定") : selectedStaff;
      const shopName = prompt("店舗名（施設名）を入力してください");
      if (!shopName) return;
      const date = new Date().toISOString().split("T")[0];
      addMarker({ shopName, date, staff: defaultStaff, lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapView({ markers, addMarker, deleteMarker, staffList, selectedStaff, setSelectedStaff, staffColors }) {
  const center = [26.6622, 127.8891];
  const displayedMarkers = selectedStaff === "ALL" ? markers : markers.filter(m => m.staff === selectedStaff);

  return (
    <div style={{ height: "70vh", width: "100%", position: "relative", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, background: "white", padding: "8px", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>表示切替：</span>
        <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
          <option value="ALL">ALL (全員表示)</option>
          {staffList.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
        {/* ★ ローマ字併記が少なく、日本語が読みやすい「Positron」タイルに変更しました */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <LocationMarker addMarker={addMarker} staffList={staffList} selectedStaff={selectedStaff} />

        {displayedMarkers.map((m) => {
          const color = staffColors[m.staff] || "#9ca3af";
          return (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={createColoredIcon(color)}>
              <Popup>
                <div style={{ minWidth: "120px" }}>
                  <strong style={{ fontSize: "16px" }}>{m.shopName}</strong><br/>
                  <span style={{ color: color, fontWeight: "bold" }}>担当：{m.staff}</span><br/>
                  <button onClick={() => deleteMarker(m.id)} style={{ marginTop: "5px", color: "#e74c3c", border: "1px solid", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", background: "none" }}>削除する</button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}