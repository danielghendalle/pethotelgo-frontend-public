// Routes the same endpoint strings the real backend would receive to the
// in-memory demoStore, so every service in src/services/* — and every hook
// and page built on top of them — works unmodified against fake data.
import { ApiError } from "../core/types";
import { DEMO_USER } from "./demoData";
import * as store from "./demoStore";
import { DemoNotFoundError } from "./demoStore";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Route {
  method: Method;
  pattern: RegExp;
  handler: (
    params: string[],
    body: unknown,
    query?: Record<string, string>,
  ) => unknown;
}

const DEMO_AUTH = {
  token: "demo-access-token",
  refreshToken: "demo-refresh-token",
};

function authResponse() {
  return {
    user: DEMO_USER,
    token: DEMO_AUTH.token,
    refreshToken: DEMO_AUTH.refreshToken,
    expiresIn: 3600,
    tokenType: "Bearer",
  };
}

// Order matters — more specific patterns must come before their generic
// `:id`-shaped parents.
const routes: Route[] = [
  { method: "POST", pattern: /^\/auth\/login$/, handler: () => authResponse() },
  {
    method: "POST",
    pattern: /^\/auth\/register$/,
    handler: () => authResponse(),
  },
  { method: "POST", pattern: /^\/auth\/logout$/, handler: () => undefined },
  {
    method: "POST",
    pattern: /^\/auth\/refresh$/,
    handler: () => authResponse(),
  },
  { method: "GET", pattern: /^\/auth\/me$/, handler: () => DEMO_USER },

  { method: "GET", pattern: /^\/owners$/, handler: () => store.listOwners() },
  {
    method: "POST",
    pattern: /^\/owners$/,
    handler: (_p, body) => store.createOwner(body as never),
  },
  {
    method: "GET",
    pattern: /^\/owners\/([^/]+)$/,
    handler: ([id]) => store.getOwner(id),
  },
  {
    method: "PUT",
    pattern: /^\/owners\/([^/]+)$/,
    handler: ([id], body) => store.updateOwner(id, body as never),
  },
  {
    method: "DELETE",
    pattern: /^\/owners\/([^/]+)$/,
    handler: ([id]) => store.deleteOwner(id),
  },

  { method: "GET", pattern: /^\/pets$/, handler: () => store.listPets() },
  {
    method: "POST",
    pattern: /^\/pets$/,
    handler: (_p, body) => store.createPet(body as never),
  },
  {
    method: "GET",
    pattern: /^\/pets\/owner\/([^/]+)$/,
    handler: ([ownerId]) => store.listPetsByOwner(ownerId),
  },
  {
    method: "GET",
    pattern: /^\/pets\/([^/]+)\/reservations$/,
    handler: ([petId]) => store.listReservationsByPet(petId),
  },
  {
    method: "GET",
    pattern: /^\/pets\/([^/]+)\/stay-history$/,
    handler: ([petId]) => store.listStayHistoryByPet(petId),
  },
  {
    method: "GET",
    pattern: /^\/pets\/([^/]+)$/,
    handler: ([id]) => store.getPet(id),
  },
  {
    method: "PUT",
    pattern: /^\/pets\/([^/]+)$/,
    handler: ([id], body) => store.updatePet(id, body as never),
  },
  {
    method: "DELETE",
    pattern: /^\/pets\/([^/]+)$/,
    handler: ([id]) => store.deletePet(id),
  },

  {
    method: "GET",
    pattern: /^\/reservations\/capacity\/([^/]+)$/,
    handler: ([date]) => store.checkDayCapacity(decodeURIComponent(date)),
  },
  {
    method: "GET",
    pattern: /^\/reservations\/pet\/([^/]+)$/,
    handler: ([petId]) => store.listReservationsByPet(petId),
  },
  {
    method: "PATCH",
    pattern: /^\/reservations\/([^/]+)\/status$/,
    handler: ([id], body) =>
      store.updateReservationStatus(
        id,
        (body as { status: string }).status,
      ),
  },
  {
    method: "GET",
    pattern: /^\/reservations$/,
    handler: (_p, _b, query) => store.listReservations(query?.date),
  },
  {
    method: "POST",
    pattern: /^\/reservations$/,
    handler: (_p, body) => store.createReservation(body as never),
  },
  {
    method: "GET",
    pattern: /^\/reservations\/([^/]+)$/,
    handler: ([id]) => store.getReservation(id),
  },
  {
    method: "PUT",
    pattern: /^\/reservations\/([^/]+)$/,
    handler: ([id], body) => store.updateReservation(id, body as never),
  },
  {
    method: "DELETE",
    pattern: /^\/reservations\/([^/]+)$/,
    handler: ([id]) => store.deleteReservation(id),
  },

  {
    method: "GET",
    pattern: /^\/stay-history\/pet\/([^/]+)$/,
    handler: ([petId]) => store.listStayHistoryByPet(petId),
  },
  {
    method: "GET",
    pattern: /^\/stay-history$/,
    handler: () => store.listStayHistory(),
  },
  {
    method: "POST",
    pattern: /^\/stay-history$/,
    handler: (_p, body) => store.createStayHistory(body as never),
  },
  {
    method: "PUT",
    pattern: /^\/stay-history\/([^/]+)$/,
    handler: ([id], body) => store.updateStayHistory(id, body as never),
  },

  {
    method: "GET",
    pattern: /^\/settings$/,
    handler: () => store.getSettings(),
  },
  {
    method: "PUT",
    pattern: /^\/settings$/,
    handler: (_p, body) => store.updateSettings(body as never),
  },
];

function randomLatencyMs(): number {
  return 150 + Math.floor(Math.random() * 250);
}

export async function demoRequest<T>(
  method: string,
  rawEndpoint: string,
  body: unknown,
): Promise<T> {
  const [path, rawQuery] = rawEndpoint.split("?");
  const query = rawQuery
    ? Object.fromEntries(new URLSearchParams(rawQuery))
    : undefined;

  const route = routes.find(
    (r) => r.method === method && r.pattern.test(path),
  );

  await new Promise((resolve) => setTimeout(resolve, randomLatencyMs()));

  if (!route) {
    throw new ApiError(404, `[demo] Sem rota simulada para ${method} ${path}`);
  }

  const match = route.pattern.exec(path);
  const params = match ? match.slice(1) : [];

  try {
    return route.handler(params, body, query) as T;
  } catch (error) {
    if (error instanceof DemoNotFoundError) {
      throw new ApiError(404, error.message);
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Erro no demo",
    );
  }
}
