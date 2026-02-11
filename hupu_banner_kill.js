/**
 * Hupu Banner Kill (精准版)
 * 仅处理：/bplapi/banner/getLocationBanners
 * 不碰任何主内容接口（比如 /users/topics）
 */
let body = $response.body;
if (!body) $done({});

try {
  const obj = JSON.parse(body);
  if (obj && Array.isArray(obj.result)) {
    obj.result = [];
    obj.msg = obj.msg || "success";
    obj.status = obj.status || 200;
  }
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
