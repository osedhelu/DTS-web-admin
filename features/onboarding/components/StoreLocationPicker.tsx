"use client";

import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

import {
  GeolocationError,
  hasValidCoordinates,
  requestDeviceLocation,
} from "@/features/onboarding/lib/geolocation";
import {
  onboardingAlertWarningClass,
  onboardingPrimaryBtnClass,
} from "@/features/onboarding/lib/form-styles";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: LatLngExpression = [4.711, -74.072];

interface StoreLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  locationSource?: "gps" | "manual" | null;
  variant?: "onboarding" | "settings";
  onChange: (patch: {
    latitude: number;
    longitude: number;
    locationSource: "gps" | "manual";
    locationAccuracy: number | null;
  }) => void;
}

function MapFocus({ position }: { position: LatLngExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [map, position]);

  return null;
}

function MapClickHandler({
  onPick,
}: {
  onPick: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export function StoreLocationPicker({
  latitude,
  longitude,
  locationSource = null,
  variant = "onboarding",
  onChange,
}: StoreLocationPickerProps) {
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const autoRequestedRef = useRef(false);

  const hasPosition = hasValidCoordinates(latitude, longitude);
  const markerPosition: LatLngExpression | null =
    hasPosition && latitude !== null && longitude !== null
      ? [latitude, longitude]
      : null;

  async function captureGps(manualTrigger = false) {
    setIsLoadingGps(true);
    setGpsError(null);

    try {
      const coords = await requestDeviceLocation();
      onChange({
        latitude: coords.latitude,
        longitude: coords.longitude,
        locationSource: "gps",
        locationAccuracy: coords.accuracy,
      });
    } catch (error) {
      if (error instanceof GeolocationError) {
        setGpsError(error.message);
      } else {
        setGpsError("No se pudo obtener la ubicación del dispositivo.");
      }
      if (!manualTrigger && !hasPosition) {
        setGpsError(
          (prev) =>
            prev ??
            "Permite el acceso a ubicación o haz clic en el mapa donde está tu tienda.",
        );
      }
    } finally {
      setIsLoadingGps(false);
    }
  }

  useEffect(() => {
    if (autoRequestedRef.current || hasPosition || variant === "settings") {
      return;
    }
    autoRequestedRef.current = true;
    void captureGps(false);
    // captureGps is stable enough for one-time auto-request on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPosition, variant]);

  function handleManualPick(lat: number, lng: number) {
    onChange({
      latitude: lat,
      longitude: lng,
      locationSource: "manual",
      locationAccuracy: null,
    });
    setGpsError(null);
  }

  const isSettings = variant === "settings";
  const containerClass = isSettings
    ? "space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
    : "space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4";
  const titleClass = isSettings ? "text-sm font-semibold text-zinc-900" : "text-sm font-semibold text-white";
  const subtitleClass = isSettings ? "text-xs text-zinc-600" : "text-xs text-zinc-400";
  const statusClass = isSettings ? "text-xs text-emerald-800" : "text-xs text-emerald-300";
  const hintClass = isSettings ? "text-xs text-zinc-500" : "text-xs text-zinc-500";
  const mapBorderClass = isSettings ? "border-zinc-200" : "border-white/10";
  const gpsButtonClass = isSettings
    ? "rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
    : `${onboardingPrimaryBtnClass} px-3 py-2 text-xs`;
  const alertClass = isSettings
    ? "rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900"
    : onboardingAlertWarningClass;

  return (
    <div data-testid="onboarding-location-picker" className={containerClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={titleClass}>Ubicación de la tienda</p>
          <p className={subtitleClass}>
            Marca en el mapa dónde queda tu local. Se usa en el mapa operativo del administrador.
          </p>
        </div>
        <button
          type="button"
          data-testid="onboarding-request-gps"
          onClick={() => void captureGps(true)}
          disabled={isLoadingGps}
          className={gpsButtonClass}
        >
          {isLoadingGps ? "Obteniendo GPS…" : "Usar mi ubicación"}
        </button>
      </div>

      {gpsError ? (
        <p role="alert" className={alertClass}>
          {gpsError}
        </p>
      ) : null}

      {markerPosition ? (
        <p
          data-testid="onboarding-location-status"
          className={statusClass}
        >
          Ubicación {locationSource === "gps" ? "GPS capturada" : "marcada en mapa"}:{" "}
          {markerPosition[0].toFixed(5)}, {markerPosition[1].toFixed(5)}
        </p>
      ) : (
        <p className={hintClass}>
          Esperando permiso de ubicación o selecciona un punto en el mapa.
        </p>
      )}

      <div className={`overflow-hidden rounded-xl border ${mapBorderClass}`}>
        <MapContainer
          center={markerPosition ?? DEFAULT_CENTER}
          zoom={hasPosition ? 16 : 12}
          className="h-64 w-full"
          data-testid="onboarding-location-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFocus position={markerPosition} />
          <MapClickHandler onPick={handleManualPick} />
          {markerPosition ? (
            <CircleMarker
              center={markerPosition}
              radius={12}
              pathOptions={{
                color: "#047857",
                fillColor: "#10b981",
                fillOpacity: 0.9,
                weight: 2,
              }}
            />
          ) : null}
        </MapContainer>
      </div>

      <p className={hintClass}>
        Tip: si el GPS no es exacto, haz clic en el mapa para ajustar dónde queda tu local.
      </p>
    </div>
  );
}
