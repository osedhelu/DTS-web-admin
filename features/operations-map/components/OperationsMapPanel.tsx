"use client";

import { Fragment, useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

import {
  DELIVERY_STATUS_LABELS,
  type AdminMapDelivery,
  type AdminMapStore,
  type AdminOperationsMapData,
} from "@/features/admin-map/types";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: LatLngExpression = [4.711, -74.072];

function formatStatus(status: string): string {
  return DELIVERY_STATUS_LABELS[status] ?? status.replaceAll("_", " ");
}

function FitBounds({
  stores,
  deliveries,
}: {
  stores: AdminMapStore[];
  deliveries: AdminMapDelivery[];
}) {
  const map = useMap();

  const bounds = useMemo(() => {
    const points: [number, number][] = stores.map((store) => [
      store.latitude,
      store.longitude,
    ]);

    for (const delivery of deliveries) {
      if (delivery.latest_latitude !== null && delivery.latest_longitude !== null) {
        points.push([delivery.latest_latitude, delivery.latest_longitude]);
      }
      if (
        delivery.destination_latitude !== null &&
        delivery.destination_longitude !== null
      ) {
        points.push([
          delivery.destination_latitude,
          delivery.destination_longitude,
        ]);
      }
    }

    if (points.length === 0) {
      return null;
    }

    return points as LatLngBoundsExpression;
  }, [stores, deliveries]);

  useEffect(() => {
    if (!bounds) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [bounds, map]);

  return null;
}

export interface OperationsMapPanelProps {
  data: AdminOperationsMapData | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  refreshMs?: number;
  testId?: string;
  storesTitle?: string;
  deliveriesTitle?: string;
  emptyStoresMessage?: string;
  emptyDeliveriesMessage?: string;
}

export function OperationsMapPanel({
  data,
  isLoading,
  error,
  onRefresh,
  refreshMs,
  testId = "operations-map",
  storesTitle = "Tiendas",
  deliveriesTitle = "Entregas activas",
  emptyStoresMessage = "No hay tiendas registradas.",
  emptyDeliveriesMessage = "No hay entregas en curso.",
}: OperationsMapPanelProps) {
  useEffect(() => {
    if (!refreshMs) return;
    const timer = window.setInterval(() => {
      onRefresh();
    }, refreshMs);
    return () => window.clearInterval(timer);
  }, [onRefresh, refreshMs]);

  const stores = data?.stores ?? [];
  const deliveries = data?.active_deliveries ?? [];

  return (
    <div data-testid={testId} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-zinc-600">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            Tienda activa ({stores.filter((store) => store.is_active).length})
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
            Conductor en ruta ({deliveries.length})
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-sky-500" />
            Destino cliente
          </span>
        </div>
        <button
          type="button"
          data-testid={`${testId}-refresh`}
          onClick={onRefresh}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Actualizar mapa
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {isLoading && !data ? (
            <div className="flex h-[520px] items-center justify-center text-sm text-zinc-500">
              Cargando mapa…
            </div>
          ) : (
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={12}
              scrollWheelZoom
              className="h-[520px] w-full"
              data-testid={`${testId}-container`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds stores={stores} deliveries={deliveries} />

              {stores.map((store) => (
                <CircleMarker
                  key={`store-${store.id}`}
                  center={[store.latitude, store.longitude]}
                  radius={10}
                  pathOptions={{
                    color: store.is_active ? "#059669" : "#71717a",
                    fillColor: store.is_active ? "#10b981" : "#a1a1aa",
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong>{store.name}</strong>
                    <br />
                    {store.address || "Sin dirección"}
                    <br />
                    <span className="text-xs capitalize">{store.vertical}</span>
                  </Popup>
                </CircleMarker>
              ))}

              {deliveries.map((delivery) => {
                const driverPosition =
                  delivery.latest_latitude !== null &&
                  delivery.latest_longitude !== null
                    ? ([
                        delivery.latest_latitude,
                        delivery.latest_longitude,
                      ] as LatLngExpression)
                    : null;
                const destinationPosition =
                  delivery.destination_latitude !== null &&
                  delivery.destination_longitude !== null
                    ? ([
                        delivery.destination_latitude,
                        delivery.destination_longitude,
                      ] as LatLngExpression)
                    : null;

                return (
                  <Fragment key={`delivery-${delivery.order_id}`}>
                    {destinationPosition ? (
                      <CircleMarker
                        center={destinationPosition}
                        radius={7}
                        pathOptions={{
                          color: "#0284c7",
                          fillColor: "#38bdf8",
                          fillOpacity: 0.9,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <strong>Destino pedido #{delivery.order_id}</strong>
                          <br />
                          {delivery.destination_label || "Cliente"}
                        </Popup>
                      </CircleMarker>
                    ) : null}
                    {driverPosition ? (
                      <>
                        <Polyline
                          positions={[
                            [delivery.store_latitude, delivery.store_longitude],
                            driverPosition,
                          ]}
                          pathOptions={{
                            color: "#f97316",
                            dashArray: "6 8",
                            weight: 3,
                          }}
                        />
                        {destinationPosition ? (
                          <Polyline
                            positions={[driverPosition, destinationPosition]}
                            pathOptions={{
                              color: "#0ea5e9",
                              dashArray: "4 6",
                              weight: 2,
                            }}
                          />
                        ) : null}
                        <CircleMarker
                          center={driverPosition}
                          radius={9}
                          pathOptions={{
                            color: "#c2410c",
                            fillColor: "#f97316",
                            fillOpacity: 0.95,
                            weight: 2,
                          }}
                        >
                          <Popup>
                            <strong>Conductor · Pedido #{delivery.order_id}</strong>
                            <br />
                            {delivery.store_name}
                            <br />
                            {formatStatus(delivery.status)}
                            {delivery.latest_recorded_at ? (
                              <>
                                <br />
                                <span className="text-xs">
                                  GPS:{" "}
                                  {new Date(
                                    delivery.latest_recorded_at,
                                  ).toLocaleString("es-CO")}
                                </span>
                              </>
                            ) : null}
                          </Popup>
                        </CircleMarker>
                      </>
                    ) : null}
                  </Fragment>
                );
              })}
            </MapContainer>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900">
              {storesTitle} ({stores.length})
            </h3>
            <ul
              data-testid={`${testId}-store-list`}
              className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm"
            >
              {stores.length === 0 ? (
                <li className="text-zinc-500">{emptyStoresMessage}</li>
              ) : (
                stores.map((store) => (
                  <li
                    key={store.id}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
                  >
                    <p className="font-medium text-zinc-900">{store.name}</p>
                    <p className="text-xs text-zinc-500">
                      {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900">
              {deliveriesTitle} ({deliveries.length})
            </h3>
            <ul
              data-testid={`${testId}-delivery-list`}
              className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm"
            >
              {deliveries.length === 0 ? (
                <li className="text-zinc-500">{emptyDeliveriesMessage}</li>
              ) : (
                deliveries.map((delivery) => (
                  <li
                    key={delivery.order_id}
                    className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2"
                  >
                    <p className="font-medium text-zinc-900">
                      Pedido #{delivery.order_id} · {delivery.store_name}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {formatStatus(delivery.status)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {delivery.latest_latitude !== null
                        ? `Conductor: ${delivery.latest_latitude.toFixed(4)}, ${delivery.latest_longitude?.toFixed(4)}`
                        : "Sin posición GPS aún"}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
