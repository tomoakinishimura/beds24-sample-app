---
name: beds24-api
description: Beds24 API v2の知見・実装パターン・注意点。Beds24連携の実装時に自動適用。
user_invocable: false
trigger: code imports beds24, mentions Beds24 API, or works with booking/reservation code in this project
---

# Beds24 API v2 実装ガイド

このプロジェクトでBeds24 API連携を実装する際の知見・注意点・パターン集。
実際にAPIを叩いて検証済みの内容。

## API基本情報

- **Base URL**: `https://beds24.com/api/v2/`
- **APIドキュメント**: https://beds24.com/api/v2/ (Swagger UI)
- **OpenAPI仕様**: https://beds24.com/api/v2/apiV2.yaml
- **サンドボックス環境は存在しない** → すべて本番APIに対して実行

## 認証フロー

3段階のトークン方式:

1. **招待コード**（24時間有効） → Beds24コントロールパネルで生成
2. `GET /authentication/setup` にheader `code: {招待コード}` → `token`（24時間）+ `refreshToken`（30日）を取得
3. トークン期限切れ時は `GET /authentication/token` にheader `refreshToken: {リフレッシュトークン}` → 新しい`token`を取得

```typescript
// 認証ヘッダーは "token" キー（Authorizationではない）
headers: { token: "your-access-token" }
```

### スコープ（招待コード生成時に設定、後から変更不可）
- `all:bookings` - 予約の全操作
- `all:inventory` - 在庫・カレンダーの全操作
- `all:properties` - 物件の全操作
- `bookings-personal` - ゲスト個人情報アクセス
- `bookings-financial` - 請求・財務データアクセス

## レスポンス形式の注意点（重要）

**GETのレスポンスはラッパー構造になっている:**

```json
{
  "success": true,
  "type": "booking",
  "count": 3,
  "pages": { "nextPageExists": false, "nextPageLink": null },
  "data": [ ... ]  // ← 実際のデータはここ
}
```

**POSTのレスポンスは配列で返る:**

```json
[
  {
    "success": true,
    "new": { "id": 12345, ... },
    "info": [{ "action": "new booking", "id": 12345, "message": "added new booking" }]
  }
]
```

→ GETは `result.data` を、POSTは `result[0].new` を参照すること。

## レート制限

- **100クレジット / 5分間**（デフォルト）
- レスポンスヘッダーで残量確認:
  - `X-FiveMinCreditLimit-Remaining` - 残りクレジット
  - `X-FiveMinCreditLimit-ResetsIn` - リセットまでの秒数
  - `X-RequestCost` - 今回のリクエストのコスト
- **同時リクエスト禁止** → 1つずつ順次実行すること
- **最大ペイロード**: 1MB / リクエスト

## 主要エンドポイントと実装パターン

### 予約（Bookings）

```typescript
// 取得（フィルター付き）
GET /bookings?propertyId=123&arrival=2026-04-01
// フィルターショートカット: arrivals, departures, new, current

// 作成（配列で送信）
POST /bookings
Body: [{ roomId: 660357, arrival: "2026-04-01", departure: "2026-04-03", ... }]

// 更新（idを含めて送信。作成と同じエンドポイント）
POST /bookings
Body: [{ id: 12345, status: "cancelled" }]

// 削除
DELETE /bookings?id=12345
```

**予約ステータス値**: `confirmed`, `request`, `new`, `cancelled`, `black`, `inquiry`

**API経由の予約は `referer: "API"`, `channel: "direct"` になる。OTAには送信されない。**

### 物件（Properties）

```typescript
// 取得（部屋タイプ込み）
GET /properties?includeAllRooms=true

// 作成（部屋タイプもネストで一括作成可能）
POST /properties
Body: [{ name: "ホテル名", roomTypes: [{ name: "シングル", qty: 5 }] }]
```

### 在庫・カレンダー（Inventory）

```typescript
// 空室確認
GET /inventory/rooms/availability?roomId=123&startDate=2026-04-01&endDate=2026-04-30

// カレンダー（価格・空室・最低泊数）
GET /inventory/rooms/calendar?roomId=123&startDate=2026-04-01&endDate=2026-04-30

// 料金計算
GET /inventory/rooms/offers?roomId=123&arrival=2026-04-01&departure=2026-04-03&numAdults=2
```

**カレンダーデータは約6時間ごとにキャッシュ推奨。**

## 予約分割パターン（5泊無料 + 有料プラン）

このプロジェクトでは1予約で5泊超の場合、同じゲスト情報で2件に分割して登録する:

```typescript
// 5泊超の場合の分割ロジック
const splitDate = addDays(arrival, FREE_NIGHTS); // 無料分の終了日

// 1件目: 無料（最初の5泊）
{ ...guestInfo, arrival, departure: splitDate, price: 0, notes: "[無料プラン]..." }

// 2件目: 有料（6泊目以降）
{ ...guestInfo, arrival: splitDate, departure, price: extraCharge, notes: "[有料プラン]..." }
```

**注意**: Beds24は配列で複数予約を一括送信できるが、分割予約の関連付け（masterId等）は自前で管理する必要がある。

## OTA連携の注意点

- OTA接続設定はBeds24コントロールパネルでのみ可能（API不可）
- テスト時はOTAを接続しないプロパティを使う
- API経由の予約はOTAに同期されない
- Booking.com固有API: `reportInvalidCard`, `reportNoShow`, `reportCancel`
- Airbnb固有API: `importAsNewProperty`, `connectToExistingRoom`

## 開発時のトークン管理

Next.js dev環境ではホットリロードでインメモリが消えるため、**ファイルベースのトークンストア**を使用:

```typescript
// .beds24-tokens.json に保存（.gitignoreに追加済み）
{ "token": "...", "refreshToken": "...", "tokenExpiresAt": 1234567890 }
```

本番ではデータベースまたは暗号化セッションストアを使うこと。

## よくあるハマりポイント

1. **認証ヘッダーが `Authorization` ではなく `token`** - 他のAPIと異なる
2. **GETレスポンスの `data` ラッパー** - 直接配列が返ると思うとハマる
3. **POSTは配列で送る** - オブジェクト単体で送るとエラー
4. **同時リクエスト禁止** - Promise.allで並列実行するとエラーになる
5. **roomTypeの `maxPeople` が設定されないことがある** - POST時に指定しても返却値に含まれない場合あり
6. **price: 0 は明示的に設定しないと反映されない** - 省略すると既定値が使われる
