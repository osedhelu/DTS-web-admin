"use client";

import { useEffect, useState } from "react";
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
  locationSource: "gps" | "manual" | null;
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
  locationSource,
  onChange,
}: StoreLocationPickerProps) {
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [autoRequested, setAutoRequested] = useState(false);

  const hasPosition = hasValidCoordinates(latitude, longitude);
  const markerPosition: LatLngExpression | null = hasPosition
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
    if (autoRequested || hasPosition) {
      return;
    }
    setAutoRequested(true);
    void captureGps(false);
  }, [autoRequested, hasPosition]);

  function handleManualPick(lat: number, lng: number) {
    onChange({
      latitude: lat,
      longitude: lng,
      locationSource: "manual",
      locationAccuracy: null,
    });
    setGpsError(null);
  }

  return (
    <div
      data-testid="onboarding-location-picker"
      className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Ubicación de la tienda</p>
          <p className="text-xs text-zinc-400">
            Necesitamos tu GPS para mostrar el comercio en el mapa operativo del administrador.
          </p>
        </div>
        <button
          type="button"
          data-testid="onboarding-request-gps"
          onClick={() => void captureGps(true)}
          disabled={isLoadingGps}
          className={`${onboardingPrimaryBtnClass} px-3 py-2 text-xs`}
        >
          {isLoadingGps ? "Obteniendo GPS…" : "Usar mi ubicación"}
        </button>
      </div>

      {gpsError ? (
        <p role="alert" className={onboardingAlertWarningClass}>
          {gpsError}
        </p>
      ) : null}

      {hasPosition ? (
        <p
          data-testid="onboarding-location-status"
          className="text-xs text-emerald-300"
        >
          Ubicación {locationSource === "gps" ? "GPS capturada" : "marcada en mapa"}:{" "}
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-zinc-500">
          Esperando permiso de ubicación o selecciona un punto en el mapa.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10">
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

      <p className="text-xs text-zinc-500">
        Tip: si el GPS no es exacto, haz clic en el mapa para ajustar dónde queda tu local.
      </p>
    </div>
  );
}
