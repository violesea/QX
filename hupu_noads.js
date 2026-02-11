/**************************************
 * Wind 去广告（开屏/横幅配置清空）
 * 适配：
 * - https://m.wind.com.cn/smartad/ad/plan
 * - https://m.wind.com.cn/smartad/ad/getMobileAd
 * - http://114.80.154.45/smartad/ad/terminalMobile
 **************************************/

(function () {
  const url = ($request && $request.url) ? $request.url : "";
  let body = $response.body;

  function safeParse(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
  }

  function emptyArray(x) {
    return Array.isArray(x) ? [] : x;
  }

  const json = safeParse(body);
  if (!json || typeof json !== "object") {
    return $done({});
  }

  // 统一把“看起来像广告列表”的字段清空
  // plan 示例：json.data.list = [...]
  if (json.data && typeof json.data === "object") {
    if (Array.isArray(json.data.list)) json.data.list = [];
    if (Array.isArray(json.data.data)) json.data.data = [];
    if (Array.isArray(json.data.ads)) json.data.ads = [];
    if (Array.isArray(json.data.adList)) json.data.adList = [];
    if (Array.isArray(json.data.items)) json.data.items = [];
  }

  // 某些接口直接 list/ads/items 在根节点
  if (Array.isArray(json.list)) json.list = [];
  if (Array.isArray(json.ads)) json.ads = [];
  if (Array.isArray(json.items)) json.items = [];

  // 你给的 terminalMobile 脚本思路：json.data 是数组
  if (Array.isArray(json.data)) {
    json.data = [];
  }

  // 强制“成功”状态，降低因空数据导致的异常提示概率
  if ("result" in json) json.result = true;
  if ("success" in json) json.success = true;
  if ("errorCode" in json) json.errorCode = 0;
  if ("errorMessage" in json) json.errorMessage = "";
  if ("msg" in json && typeof json.msg === "string") json.msg = "success";

  body = JSON.stringify(json);
  $done({ body });
})();
