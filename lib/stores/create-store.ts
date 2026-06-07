/**
 * Convenciones Zustand para web-admin.
 *
 * - Un store por dominio en `features/<modulo>/stores/`.
 * - Estado de servidor (listas, loading, errores) vive en el store; mutaciones llaman BFF/API.
 * - Persistir solo IDs de sesión (ej. tienda activa) con `persist` + sessionStorage.
 */
export { create } from "zustand";
export type { StateCreator } from "zustand";
