# gas-spreadsheet-softer-activerecord

> **⚠️ Under Development / 検証中です!**
> This library is currently under development and testing. APIs may change without notice.
> このライブラリは現在開発・検証中です。APIは予告なく変更される可能性があります。

[English](#english) | [日本語](#japanese)

<a name="english"></a>
## English

An ActiveRecord-like ORM for Google Spreadsheets in Google Apps Script. This library provides an intuitive interface to work with spreadsheet data as if it were a database table.

### Features

- **ActiveRecord Pattern**: Work with spreadsheet rows as objects with familiar ORM methods
- **Type-Safe**: Written in TypeScript with full type definitions
- **Easy Querying**: Find, filter, and manipulate data with simple method calls
- **CRUD Operations**: Create, read, update, and delete rows easily
- **Date Handling**: Automatic handling of Date objects in comparisons
- **Google Apps Script Ready**: Designed specifically for use with @google/clasp

### Installation

```bash
npm install nakahashi/gas-spreadsheet-softer-activerecord
```

### Usage

#### Basic Setup

```typescript
import { ActiveTable } from 'gas-spreadsheet-softer-activerecord';

// Get a table by sheet name
const Users = ActiveTable.bySheetName('Users');

// By default, checkUnique is true and throws an error if duplicate IDs exist in the first column
// If you want to allow duplicate IDs, set checkUnique to false
const Logs = ActiveTable.bySheetName('Logs', false);
```

Your spreadsheet should have headers in the first row:

| id | name | status | created_at | メモ |
|----|------|--------|------------|------|
| user1 | Alice | active | 2023-01-01 | テストユーザー1 |
| user2 | Bob | inactive | 2023-01-02 | テストユーザー2 |

> **Note**: Japanese column names (like "メモ") are fully supported!

**Note**: By default, the first column is treated as a unique ID. If duplicate values exist in the first column, an error will be thrown unless you set `checkUnique` to `false`.

#### Finding Records

```typescript
// Find a specific record by ID (first column)
const user = Users.find('user1');
console.log(user.name); // "Alice"
console.log(user.status); // "active"

// Get all records
const allUsers = Users.all();
console.log(allUsers.length); // 2

// Filter records
const activeUsers = Users.where({ status: 'active' });
const recentUsers = Users.after({ created_at: new Date('2023-01-01') });
const oldUsers = Users.before({ created_at: new Date('2023-02-01') });
```

#### Creating Records

```typescript
// Create a new record
Users.create({
  id: 'user3',
  name: 'Charlie',
  status: 'active',
  created_at: new Date()
});
```

#### Updating Records

```typescript
// Update a single record
const user = Users.find('user1');
user.update({ status: 'inactive' });

// Update multiple records
const activeUsers = Users.where({ status: 'active' });
activeUsers.updateAll({ status: 'inactive' });
```

#### Deleting Records

```typescript
// Delete a single record
const user = Users.find('user1');
user.delete();

// Delete multiple records
const inactiveUsers = Users.where({ status: 'inactive' });
inactiveUsers.deleteAll();
```

#### Working with Individual Rows

```typescript
const user = Users.find('user1');

// Check if row is persisted
console.log(user.isPersisted()); // true

// Update properties and save
user.name = 'Alice Smith';
user.save();

// Access individual cell
const nameCell = user.cellOf('name');
nameCell.setBackground('#FFFF00'); // Highlight the cell
```

### API Reference

#### `ActiveTable`

- `static bySheetName(sheetName: string, checkUnique = true): ActiveTable`
  - Create an ActiveTable instance for the specified sheet
  - `checkUnique`: If true, throws an error if duplicate IDs exist in the first column

- `all(): ActiveTableRowArray`
  - Get all rows

- `find(id: string): ActiveTableRow`
  - Find a row by ID (first column value)

- `where(criteria: object): ActiveTableRowArray`
  - Filter rows matching the criteria

- `after(criteria: object): ActiveTableRowArray`
  - Filter rows where values are greater than the criteria

- `before(criteria: object): ActiveTableRowArray`
  - Filter rows where values are less than the criteria

- `create(data: object): void`
  - Create a new row

#### `ActiveTableRow`

- `isPersisted(): boolean`
  - Check if the row exists in the spreadsheet

- `save(): void`
  - Save changes to the spreadsheet

- `delete(): void`
  - Delete the row from the spreadsheet

- `update(data: object): void`
  - Update row properties and save

- `cellOf(key: string): Range`
  - Get the cell range for a specific column

#### `ActiveTableRowArray`

- `where(criteria: object): ActiveTableRowArray`
  - Filter rows matching the criteria

- `after(criteria: object): ActiveTableRowArray`
  - Filter rows where values are greater than the criteria

- `before(criteria: object): ActiveTableRowArray`
  - Filter rows where values are less than the criteria

- `deleteAll(): void`
  - Delete all rows in the array

- `updateAll(data: object): void`
  - Update all rows with the given data

### Use in Your Google Apps Script Project

1. Install the package:
```bash
npm install nakahashi/gas-spreadsheet-softer-activerecord
```

2. Import in your TypeScript code:
```typescript
import { ActiveTable } from 'gas-spreadsheet-softer-activerecord';
```

3. Build your project with @google/clasp:
```bash
clasp push
```

### Example Project

See the [test-client example](examples/test-client/) for a complete working example that demonstrates:
- Basic CRUD operations
- Batch operations (updateAll, deleteAll)
- Date filtering (after, before)
- Using the checkUnique parameter

### License

MIT

---

<a name="japanese"></a>
## 日本語

Google Apps ScriptでGoogleスプレッドシートをActiveRecord風に扱うためのORMライブラリです。スプレッドシートのデータをデータベーステーブルのように直感的に操作できます。

### 特徴

- **ActiveRecordパターン**: スプレッドシートの行をオブジェクトとして扱い、使い慣れたORMメソッドで操作
- **型安全**: TypeScriptで記述され、完全な型定義を提供
- **簡単なクエリ**: シンプルなメソッド呼び出しでデータの検索、フィルタリング、操作が可能
- **CRUD操作**: 行の作成、読み取り、更新、削除を簡単に実行
- **日付処理**: Date型オブジェクトの比較を自動処理
- **Google Apps Script対応**: @google/claspでの使用を想定して設計

### インストール

```bash
npm install nakahashi/gas-spreadsheet-softer-activerecord
```

### 使い方

#### 基本的なセットアップ

```typescript
import { ActiveTable } from 'gas-spreadsheet-softer-activerecord';

// シート名を指定してテーブルを取得
const Users = ActiveTable.bySheetName('Users');

// デフォルトではcheckUniqueがtrueで、1列目に重複IDがある場合はエラーをスロー
// 重複IDを許可したい場合は、checkUniqueをfalseに設定
const Logs = ActiveTable.bySheetName('Logs', false);
```

スプレッドシートの1行目にヘッダーが必要です:

| id | name | status | created_at | メモ |
|----|------|--------|------------|------|
| user1 | Alice | active | 2023-01-01 | テストユーザー1 |
| user2 | Bob | inactive | 2023-01-02 | テストユーザー2 |

> **注意**: 日本語のカラム名（「メモ」など）も完全にサポートされています!

**注意**: デフォルトでは、1列目がユニークIDとして扱われます。1列目に重複する値がある場合、`checkUnique`を`false`に設定しない限りエラーがスローされます。

#### レコードの検索

```typescript
// IDで特定のレコードを検索（1列目の値）
const user = Users.find('user1');
console.log(user.name); // "Alice"
console.log(user.status); // "active"

// すべてのレコードを取得
const allUsers = Users.all();
console.log(allUsers.length); // 2

// レコードをフィルタリング
const activeUsers = Users.where({ status: 'active' });
const recentUsers = Users.after({ created_at: new Date('2023-01-01') });
const oldUsers = Users.before({ created_at: new Date('2023-02-01') });
```

#### レコードの作成

```typescript
// 新しいレコードを作成
Users.create({
  id: 'user3',
  name: 'Charlie',
  status: 'active',
  created_at: new Date()
});
```

#### レコードの更新

```typescript
// 単一レコードを更新
const user = Users.find('user1');
user.update({ status: 'inactive' });

// 複数レコードを更新
const activeUsers = Users.where({ status: 'active' });
activeUsers.updateAll({ status: 'inactive' });
```

#### レコードの削除

```typescript
// 単一レコードを削除
const user = Users.find('user1');
user.delete();

// 複数レコードを削除
const inactiveUsers = Users.where({ status: 'inactive' });
inactiveUsers.deleteAll();
```

#### 個別の行を操作

```typescript
const user = Users.find('user1');

// 行が保存されているか確認
console.log(user.isPersisted()); // true

// プロパティを更新して保存
user.name = 'Alice Smith';
user.save();

// 個別のセルにアクセス
const nameCell = user.cellOf('name');
nameCell.setBackground('#FFFF00'); // セルをハイライト
```

### API リファレンス

#### `ActiveTable`

- `static bySheetName(sheetName: string, checkUnique = true): ActiveTable`
  - 指定したシートのActiveTableインスタンスを作成
  - `checkUnique`: trueの場合、1列目に重複IDがあるとエラーをスロー

- `all(): ActiveTableRowArray`
  - すべての行を取得

- `find(id: string): ActiveTableRow`
  - IDで行を検索（1列目の値）

- `where(criteria: object): ActiveTableRowArray`
  - 条件に一致する行をフィルタリング

- `after(criteria: object): ActiveTableRowArray`
  - 指定した値より大きい値を持つ行をフィルタリング

- `before(criteria: object): ActiveTableRowArray`
  - 指定した値より小さい値を持つ行をフィルタリング

- `create(data: object): void`
  - 新しい行を作成

#### `ActiveTableRow`

- `isPersisted(): boolean`
  - 行がスプレッドシートに存在するか確認

- `save(): void`
  - 変更をスプレッドシートに保存

- `delete(): void`
  - スプレッドシートから行を削除

- `update(data: object): void`
  - 行のプロパティを更新して保存

- `cellOf(key: string): Range`
  - 特定の列のセル範囲を取得

#### `ActiveTableRowArray`

- `where(criteria: object): ActiveTableRowArray`
  - 条件に一致する行をフィルタリング

- `after(criteria: object): ActiveTableRowArray`
  - 指定した値より大きい値を持つ行をフィルタリング

- `before(criteria: object): ActiveTableRowArray`
  - 指定した値より小さい値を持つ行をフィルタリング

- `deleteAll(): void`
  - 配列内のすべての行を削除

- `updateAll(data: object): void`
  - 指定したデータですべての行を更新

### Google Apps Scriptプロジェクトでの使用

1. パッケージをインストール:
```bash
npm install nakahashi/gas-spreadsheet-softer-activerecord
```

2. TypeScriptコードでインポート:
```typescript
import { ActiveTable } from 'gas-spreadsheet-softer-activerecord';
```

3. @google/claspでプロジェクトをビルド:
```bash
clasp push
```

### サンプルプロジェクト

完全な動作例は[test-clientサンプル](examples/test-client/)を参照してください。以下の機能を実演しています:
- 基本的なCRUD操作
- バッチ操作 (updateAll, deleteAll)
- 日付フィルタリング (after, before)
- checkUniqueパラメータの使用

### ライセンス

MIT
