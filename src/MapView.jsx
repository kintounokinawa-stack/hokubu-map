import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 地図の動きをコントロールする機能
function MapController() {
  const map = useMap();
  useEffect(() => {
    const handleFlyTo = (e) => {
      const { lat, lng } = e.detail;
      // 指定した場所（現在地）へスムーズに移動します
      map.flyTo([lat, lng], 16, { duration: 1.5 });
    };
    window.addEventListener("flyToLocation", handleFlyTo);
    return () => window.removeEventListener("flyToLocation", handleFlyTo);
  }, [map]);
  return null;
}

// 地図をクリックして店舗を追加する機能
function LocationMarker({ addMarker, staffList, selectedStaff }) {
  useMapEvents({
    click(e) {
      const defaultStaff = selectedStaff === "ALL" ? (staffList[0] || "未設定") : selectedStaff;
      const shopName = prompt("店舗名を入力してください", ""); 
      if (shopName) {
        const date = new Date().toLocaleDateString("ja-JP", { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-');
        addMarker({ shopName, date, staff: defaultStaff, lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export default function MapView({ markers, myLocation, addMarker, deleteMarker, staffList, selectedStaff, setSelectedStaff, staffColors }) {
  
  // ピン（アイコン）のデザインを作る機能
  const createColoredIcon = (color) => new L.DivIcon({
    html: `<svg width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 41 12.5 41C12.5 41 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="12.5" cy="12.5" r="5" fill="white"/></svg>`,
    className: "", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  });

  // ★「現在地」専用の青いアイコン
  const myLocationIcon = createColoredIcon("#007bff"); // 鮮やかな青色

  return (
    <div style={{ height: "60vh", width: "100%", position: "relative", borderRadius: "10px", overflow: "hidden", border: "2px solid #2c3e50" }}>
      <MapContainer center={[26.6622, 127.8891]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController />
        <LocationMarker addMarker={addMarker} staffList={staffList} selectedStaff={selectedStaff} />

        {/* ★自分の現在地（青いピン）を表示する設定 */}
        {myLocation && (
          <Marker position={[myLocation.lat, myLocation.lng]} icon={myLocationIcon}>
            <Popup>
              <b>📍 あなたの現在地</b>
            </Popup>
          </Marker>
        )}

        {/* 登録された店舗のピンを表示する設定 */}
        {markers.filter(m => selectedStaff === "ALL" || m.staff === selectedStaff).map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={createColoredIcon(staffColors[m.staff] || "#9ca3af")}>
            <Popup>
              <b>{m.shopName}</b><br/>
              担当: {m.staff}<br/>
              <button onClick={() => deleteMarker(m.id)} style={{ marginTop: "10px", cursor: "pointer" }}>削除</button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}