/**
 * ActiveTable provides an active record pattern for Google Sheets.
 * It allows you to work with spreadsheet data as if it were a database table,
 * providing methods for querying, creating, updating, and deleting rows.
 *
 * @example
 * ```typescript
 * // Get a table by sheet name
 * const User = ActiveTable.bySheetName("Users");
 *
 * // Find a specific row
 * const user = User.find("user123");
 *
 * // Query rows
 * const activeUsers = User.where({ status: "active" });
 *
 * // Create a new row
 * User.create({ id: "user456", name: "John Doe", status: "active" });
 * ```
 */
export class ActiveTable {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  private attributes: { column: number; name: string }[] = [];
  #TableOperable: TableOperable;

  static bySheetName(sheetName: string, checkUnique = true) {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`Sheet with name "${sheetName}" not found`);
    }
    return new ActiveTable(sheet, checkUnique);
  }

  private constructor(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    checkUnique: boolean
  ) {
    this.sheet = sheet;
    this.#TableOperable = {
      addRow: this.create.bind(this),
      deleteRow: this.#deleteRow.bind(this),
      updateRow: this.#updateRow.bind(this),
      cellOf: this.#cellOf.bind(this),
    };

    const rows = this.sheet.getDataRange().getValues();
    const headers = rows.shift() as string[];

    this.attributes = headers.map((name, index) => ({
      column: index + 1,
      name,
    }));

    if (checkUnique) {
      // ヘッダ行以降のデータ行の1番左のカラムのデータに重複がある場合はエラーを返す
      const uniqueValues = new Set(rows.map(row => row[0]));
      if (uniqueValues.size !== rows.length) {
        // エラーメッセージにシート名を含める
        const sheetName = this.sheet.getName();
        throw new Error(
          `Duplicate values found in the first column of sheet "${sheetName}"`
        );
      }
    }
  }

  #rows() {
    const rows = this.sheet.getDataRange().getValues().slice(1);

    const lazyRows = rows.map((row, index) => {
      // 先頭行はヘッダ行なので、行番号は2から始まる
      const lazyRow = new ActiveTableRow(index + 2, this.#TableOperable);
      this.attributes.forEach(attr => {
        lazyRow[attr.name] = row[attr.column - 1];
      });
      return lazyRow;
    });

    return new ActiveTableRowArray(...lazyRows);
  }

  all() {
    return this.#rows();
  }

  where = (obj: { [key: string]: any }): ActiveTableRowArray =>
    this.#rows().where(obj);

  after = (obj: { [key: string]: any }): ActiveTableRowArray =>
    this.#rows().after(obj);

  before = (obj: { [key: string]: any }): ActiveTableRowArray =>
    this.#rows().before(obj);

  find(id: string): ActiveTableRow {
    const rows = this.#rows().filter(
      row => row[this.attributes[0].name] === id
    );
    if (rows.length > 1) {
      throw new Error(`Multiple rows with id "${id}" found`);
    }
    const row = rows[0];
    if (!row) {
      throw new Error(`Row with id "${id}" not found`);
    }
    return row;
  }

  create(obj: { [key: string]: any }) {
    const values = this.attributes.map(attr => obj[attr.name] ?? '');
    this.sheet.appendRow(values);
  }

  #deleteRow(rowNumber: number) {
    this.sheet.deleteRow(rowNumber);
  }

  #updateRow(index: number, row: ActiveTableRow) {
    const values = this.attributes.map(attr => row[attr.name] ?? '');
    this.sheet
      .getRange(index, 1, 1, this.attributes.length)
      .setValues([values]);
  }

  #cellOf(index: number, key: string) {
    return this.sheet.getRange(
      index,
      this.attributes.find(attr => attr.name === key)?.column ?? 0
    );
  }
}

interface TableOperable {
  addRow: (row: ActiveTableRow) => void;
  deleteRow: (index: number) => void;
  updateRow: (index: number, row: ActiveTableRow) => void;
  cellOf: (index: number, key: string) => GoogleAppsScript.Spreadsheet.Range;
}

export class ActiveTableRowArray extends Array<ActiveTableRow> {
  constructor(...items: ActiveTableRow[]) {
    super(...items);
    Object.setPrototypeOf(this, ActiveTableRowArray.prototype);
  }

  where(obj: { [key: string]: any }): ActiveTableRowArray {
    const filteredRows = this.filter(row => {
      return Object.entries(obj).every(([key, value]) => {
        // Date型の場合は特別な比較を行う
        if (value instanceof Date && row[key] instanceof Date) {
          return value.getTime() === row[key].getTime();
        }
        return row[key] === value;
      });
    });
    return new ActiveTableRowArray(...filteredRows);
  }

  after(obj: { [key: string]: any }): ActiveTableRowArray {
    const filteredRows = this.filter(row => {
      return Object.entries(obj).every(([key, value]) => row[key] > value);
    });
    return new ActiveTableRowArray(...filteredRows);
  }

  before(obj: { [key: string]: any }): ActiveTableRowArray {
    const filteredRows = this.filter(row => {
      return Object.entries(obj).every(([key, value]) => {
        const rowValue = row[key];
        return rowValue !== null && rowValue !== '' && rowValue < value;
      });
    });
    return new ActiveTableRowArray(...filteredRows);
  }

  deleteAll() {
    // 行削除時に行が詰められることを考慮し、配列を逆順にループして削除する
    this.reverse().forEach(row => row.delete());
  }

  updateAll(obj: { [key: string]: any }) {
    this.forEach(row => row.update(obj));
  }
}

export class ActiveTableRow {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  #table: TableOperable;
  #rowNumber: number | null = null;

  constructor(rowNumber: number | null = null, TableOperable: TableOperable) {
    this.#table = TableOperable;
    this.#rowNumber = rowNumber;
  }

  isPersisted(): boolean {
    return this.#rowNumber !== null;
  }

  save() {
    if (this.#rowNumber === null) {
      this.#table?.addRow(this);
    } else {
      this.#table?.updateRow(this.#rowNumber, this);
    }
  }

  delete() {
    if (this.#rowNumber !== null) {
      this.#table?.deleteRow(this.#rowNumber);
    }

    this.#rowNumber = null;
  }

  update(obj: { [key: string]: any }) {
    Object.entries(obj).forEach(([key, value]) => (this[key] = value));

    if (this.#rowNumber !== null) {
      this.#table?.updateRow(this.#rowNumber, this);
    }
  }

  cellOf(key: string) {
    if (this.#rowNumber === null) {
      throw new Error('rowNumber is not set');
    }

    return this.#table.cellOf(this.#rowNumber, key);
  }
}
