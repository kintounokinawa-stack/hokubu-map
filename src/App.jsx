import React, { useEffect, useState, useRef } from 'react';
import Map, { NavigationControl, GeolocateControl, Marker, Popup } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

const GSI_TILE_STYLE = {
  version: 8,
  sources: {
    gsi_tiles: {
      type: 'raster',
      tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '地理院タイル',
    },
  },
  layers: [
    {
      id: 'gsi_tiles',
      type: 'raster',
      source: 'gsi_tiles',
      minzoom: 0,
      maxzoom: 18,
    },
  ],
};

// 名護市役所付近の座標
const INITIAL_VIEW_STATE = {
  longitude: 127.977,
  latitude: 26.591,
  zoom: 12,
};

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Map
        mapLib={maplibregl}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle={GSI_TILE_STYLE}
      >
        {/* 右上のナビゲーション操作（ズームなど） */}
        <NavigationControl position="top-right" />

        {/* 現在地表示ボタン */}
        <GeolocateControl
          position="top-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          showUserLocation={true}
          onGeolocate={(e) => console.log("現在地を取得しました", e)}
        />
      </Map>
    </div>
  );
}

export default App;