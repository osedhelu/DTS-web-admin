export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export class GeolocationError extends Error {
  constructor(
    message: string,
    readonly code: "unsupported" | "denied" | "unavailable" | "timeout" | "unknown",
  ) {
    super(message);
    this.name = "GeolocationError";
  }
}

export function isGeolocationSupported(): boolean {
  return typeof window !== "undefined" && "geolocation" in navigator;
}

export function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export async function requestDeviceLocation(): Promise<DeviceCoordinates> {
  if (!isGeolocationSupported()) {
    throw new GeolocationError(
      "Tu navegador no soporta geolocalización.",
      "unsupported",
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new GeolocationError(
              "Permiso de ubicación denegado. Actívalo en el navegador o marca tu tienda en el mapa.",
              "denied",
            ),
          );
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(
            new GeolocationError(
              "No pudimos obtener tu ubicación. Marca el punto en el mapa.",
              "unavailable",
            ),
          );
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(
            new GeolocationError(
              "La ubicación tardó demasiado. Intenta de nuevo o marca el mapa.",
              "timeout",
            ),
          );
          return;
        }
        reject(
          new GeolocationError(
            "Error al obtener ubicación.",
            "unknown",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20_000,
        maximumAge: 0,
      },
    );
  });
}
