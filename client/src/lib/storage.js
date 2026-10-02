// localStorage/sessionStorage podem lançar erro (modo privado, bloqueio de cookies).
// Tudo passa por aqui para o site nunca quebrar por causa disso.

function safe(kind) {
  return {
    get(key, fallback = null) {
      try {
        const v = window[kind].getItem(key)
        return v === null ? fallback : v
      } catch {
        return fallback
      }
    },
    set(key, value) {
      try {
        window[kind].setItem(key, value)
      } catch {
        /* ignora */
      }
    },
  }
}

export const local = safe('localStorage')
export const session = safe('sessionStorage')
