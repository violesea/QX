let body = $response.body;
if (!body) $done({});

try {
  const obj = JSON.parse(body);

  // 常见结构1：{ data: [] }
  if (Array.isArray(obj.data)) {
    obj.data = [];
  }

  // 常见结构2：{ data: { list: [] } }
  if (obj.data && Array.isArray(obj.data.list)) {
    obj.data.list = [];
  }

  // 常见结构3：{ data: { records/items/ads: [] } }（防御式）
  const keys = ["items", "records", "ads", "adList", "listData"];
  if (obj.data && typeof obj.data === "object") {
    for (const k of keys) {
      if (Array.isArray(obj.data[k])) obj.data[k] = [];
    }
  }

  // 可选：统一标记成功，避免客户端触发降级兜底再次拉广告
  if (typeof obj.result === "boolean") obj.result = true;
  if (typeof obj.errorCode === "number") obj.errorCode = 0;
  if (typeof obj.errorMessage === "string") obj.errorMessage = "";

  body = JSON.stringify(obj);
} catch (e) {
  // JSON 解析失败就放行，不要返回空 body，避免客户端异常
}

$done({ body });
