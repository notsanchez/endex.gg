export const isLogged = typeof window !== "undefined" && !!localStorage.getItem("SESSION_ID_V2");

export const loggedID = typeof window !== "undefined" ? localStorage.getItem("SESSION_ID_V2") : null;
export const loggedName = typeof window !== "undefined" ? localStorage.getItem("SESSION_NAME_V2") : null;
export const isAdmin = typeof window !== "undefined" ? localStorage.getItem("ADMIN") === '1' ? true : false : null;

export const cart = typeof window !== "undefined" ? localStorage.getItem("ENDEX_CART") : [];