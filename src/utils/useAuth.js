export const isLogged = typeof window !== "undefined" && !!localStorage.getItem("SESSION_ID");

export const loggedID = typeof window !== "undefined" ? localStorage.getItem("SESSION_ID") : null;
export const loggedName = typeof window !== "undefined" ? localStorage.getItem("SESSION_NAME") : null;
