/**
 * Wind SmartAd Cleaner
 * Targets:
 *  - /smartad/ad/plan           -> { data: { list: [...] } }
 *  - /smartad/ad/getMobileAd    -> { data: { orderAdList: [...], tagAdList: [...] } }
 *  - /smartad/ad/terminalMobile -> { data: [ ... ] }   (splash + in-app banners)
 *
 * Goal:
 *  - Remove ads at config level (no UI placeholder)
 *  - Keep response structure "successful" to reduce fallback retries
 */

let body = $response.body;
if (!body) $done({});

try {
  const url = ($request && $request.url) ? $request.url : "";
  const obj = JSON.parse(body);

  // ---------- terminalMobile: data is usually an array of ad items ----------
  if (url.includes("/smartad/ad/terminalMobile")) {
    // common: { data: [ {positionId, url, redirectCommand, ...}, ... ] }
    if (Array.isArray(obj.data)) obj.data = [];
    // sometimes: { data: { list: [...] } }
    if (obj.data && Array.isArray(obj.data.list)) obj.data.list = [];
  }

  // ---------- plan: data.list ----------
  if (url.includes("/smartad/ad/plan")) {
    if (obj.data && Array.isArray(obj.data.list)) obj.data.list = [];
    // some versions: data is array
    if (Array.isArray(obj.data)) obj.data = [];
    // optional: keep version but harmless
  }

  // ---------- getMobileAd: orderAdList / tagAdList ----------
  if (url.includes("/smartad/ad/getMobileAd")) {
    if (obj.data && typeof obj.data === "object") {
      if (Array.isArray(obj.data.orderAdList)) obj.data.orderAdList = [];
      if (Array.isArray(obj.data.tagAdList)) obj.data.tagAdList = [];
      // defensive: any *Ad* arrays under data
      for (const k of Object.keys(obj.data)) {
        if (/ad/i.test(k) && Array.isArray(obj.data[k])) obj.data[k] = [];
      }
    }
    if (Array.isArray(obj.data)) obj.data = [];
  }

  // ---------- Defensive: if still has obvious ad arrays, clear them ----------
  // (Prevents minor version changes from leaking ads)
  const clearAdArrays = (node) => {
    if (!node || typeof node !== "object") return;
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (Array.isArray(v) && /ad|banner|splash|open/i.test(k)) node[k] = [];
      else if (v && typeof v === "object") clearAdArrays(v);
    }
  };
  clearAdArrays(obj);

  // ---------- Make response look successful ----------
  if (typeof obj.result === "boolean") obj.result = true;
  if (typeof obj.errorCode === "number") obj.errorCode = 0;
  if (typeof obj.errorMessage === "string") obj.errorMessage = "";

  body = JSON.stringify(obj);
} catch (e) {
  // parsing failed -> do not change body
}

$done({ body });
