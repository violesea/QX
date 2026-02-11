/**
 * Hupu KillAds Universal
 * 目标：不拦图，不留坑；从 JSON 源头把广告条目/广告数组清空
 * 命中域：
 * - games.mobileapi.hupu.com
 * - bbs.mobileapi.hupu.com
 * - more.mobileapi.hupu.com
 * - goblin.hupu.com
 */

let body = $response.body;
if (!body) $done({});

function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }

function dropAdItems(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(it => {
    if (!isObj(it)) return true;
    // 常见广告标记字段（命中任意一个就删）
    const flags = [
      it.isAd, it.is_ad, it.ad, it.advert, it.advertisement,
      it.isCommercial, it.commercial, it.isPromotion, it.promotion,
      it.isSponsor, it.sponsor
    ];
    if (flags.some(v => v === 1 || v === true || v === "1")) return false;

    // 常见广告字段存在且有值（更激进一点）
    const keys = Object.keys(it).join("|").toLowerCase();
    if (keys.includes("ad") && (it.img || it.image || it.jumpUrl || it.jump_url || it.url)) return false;

    return true;
  });
}

function walk(node) {
  if (Array.isArray(node)) {
    // 数组：先滤广告条目，再递归
    const filtered = dropAdItems(node).map(walk);
    return filtered;
  }
  if (!isObj(node)) return node;

  for (const k of Object.keys(node)) {
    const lk = k.toLowerCase();
    const v = node[k];

    // 1) 典型广告数组字段：直接清空
    if (Array.isArray(v) && /(ad|ads|banner|banners|commercial|promotion|sponsor|splash|startup)/i.test(lk)) {
      node[k] = [];
      continue;
    }

    // 2) 典型列表字段：滤掉夹杂的广告
    if (Array.isArray(v) && /(list|items|data|result|records|feed|modules|cards)/i.test(lk)) {
      node[k] = dropAdItems(v).map(walk);
      continue;
    }

    // 3) 递归
    node[k] = walk(v);
  }
  return node;
}

try {
  const json = JSON.parse(body);

  const out = walk(json);

  // 让客户端更不容易“因空数组走降级广告”
  if (isObj(out)) {
    if ("status" in out) out.status = 200;
    if ("code" in out && typeof out.code === "number") out.code = 200;
    if ("success" in out) out.success = true;
    if ("msg" in out && typeof out.msg === "string") out.msg = "success";
  }

  body = JSON.stringify(out);
  $done({ body });
} catch (e) {
  // 非 JSON（图片/HTML等）：不动，避免误伤
  $done({});
}
