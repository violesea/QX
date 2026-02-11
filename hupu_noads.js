/**************************************
 * Hupu 去广告（横幅配置清空）
 * 命中接口：
 * - https://games.mobileapi.hupu.com/.../bplapi/banner/getLocationBanners
 * 抓包返回示例：
 * {"status":200,"msg":"success","result":[{"jumpUrl":...,"img":...}, ...]}
 * 目标：result = []
 **************************************/

(function () {
  let body = $response.body;

  function safeParse(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
  }

  const json = safeParse(body);
  if (!json || typeof json !== "object") {
    return $done({});
  }

  // 标准结构：result 是数组
  if (Array.isArray(json.result)) {
    json.result = [];
  }

  // 兜底：有些版本可能用 data/list
  if (json.data && typeof json.data === "object") {
    if (Array.isArray(json.data.list)) json.data.list = [];
    if (Array.isArray(json.data.result)) json.data.result = [];
    if (Array.isArray(json.data.items)) json.data.items = [];
  }

  // 强制成功，避免客户端把空当异常
  if ("status" in json) json.status = 200;
  if ("code" in json) json.code = 1;
  if ("success" in json) json.success = true;
  if ("msg" in json && typeof json.msg === "string") json.msg = "success";

  body = JSON.stringify(json);
  $done({ body });
})();
