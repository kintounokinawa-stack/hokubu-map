export default function MarkerList({ markers, deleteMarker }) {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "12px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
        巡回店舗一覧
      </div>

      {markers.length === 0 && (
        <div style={{ color: "#666" }}>登録なし</div>
      )}

      {markers.map((marker) => (
        <div
          key={marker.id}
          style={{
            borderBottom: "1px solid #eee",
            padding: "8px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: "600" }}>
              {marker.shopName}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {marker.date}
            </div>
          </div>

          <button
            onClick={() => deleteMarker(marker.id)}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "6px",
            }}
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
}
