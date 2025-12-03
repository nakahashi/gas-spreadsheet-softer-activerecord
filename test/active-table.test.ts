import { ActiveTable, ActiveTableRow, ActiveTableRowArray } from '../src/index';

// Mock Google Apps Script environment
const mockSheet = {
  getName: jest.fn(() => 'TestSheet'),
  getDataRange: jest.fn(),
  appendRow: jest.fn(),
  deleteRow: jest.fn(),
  getRange: jest.fn(),
};

const mockSpreadsheet = {
  getSheetByName: jest.fn((name: string) => {
    if (name === 'TestSheet') {
      return mockSheet as any;
    }
    return null;
  }),
};

// Mock SpreadsheetApp
global.SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn(() => mockSpreadsheet as any),
} as any;

describe('ActiveTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('bySheetName', () => {
    it('should create an ActiveTable instance for a valid sheet', () => {
      const testData = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
        ['user2', 'Bob', 'inactive'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => testData),
      });

      const table = ActiveTable.bySheetName('TestSheet');
      expect(table).toBeInstanceOf(ActiveTable);
      expect(mockSpreadsheet.getSheetByName).toHaveBeenCalledWith('TestSheet');
    });

    it('should throw an error if sheet is not found', () => {
      expect(() => {
        ActiveTable.bySheetName('NonExistentSheet');
      }).toThrow('Sheet with name "NonExistentSheet" not found');
    });

    it('should throw an error if duplicate IDs exist in first column', () => {
      const testDataWithDuplicates = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
        ['user1', 'Bob', 'inactive'], // duplicate ID
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => testDataWithDuplicates),
      });

      expect(() => {
        ActiveTable.bySheetName('TestSheet');
      }).toThrow('Duplicate values found in the first column of sheet "TestSheet"');
    });

    it('should not check for duplicates when checkUnique is false', () => {
      const testDataWithDuplicates = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
        ['user1', 'Bob', 'inactive'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => testDataWithDuplicates),
      });

      expect(() => {
        ActiveTable.bySheetName('TestSheet', false);
      }).not.toThrow();
    });
  });

  describe('all', () => {
    it('should return all rows', () => {
      const testData = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
        ['user2', 'Bob', 'inactive'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => [...testData]), // Return a new copy each time
      });

      const table = ActiveTable.bySheetName('TestSheet');
      const rows = table.all();

      expect(rows).toBeInstanceOf(ActiveTableRowArray);
      expect(rows.length).toBe(2);
      expect(rows[0].id).toBe('user1');
      expect(rows[0].name).toBe('Alice');
      expect(rows[1].id).toBe('user2');
    });
  });

  describe('find', () => {
    it('should find a row by ID', () => {
      const testData = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
        ['user2', 'Bob', 'inactive'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => [...testData.map(row => [...row])]), // Deep copy
      });

      const table = ActiveTable.bySheetName('TestSheet');
      const row = table.find('user1');

      expect(row).toBeInstanceOf(ActiveTableRow);
      expect(row.id).toBe('user1');
      expect(row.name).toBe('Alice');
    });

    it('should throw an error if row is not found', () => {
      const testData = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => [...testData.map(row => [...row])]),
      });

      const table = ActiveTable.bySheetName('TestSheet');

      expect(() => {
        table.find('user999');
      }).toThrow('Row with id "user999" not found');
    });
  });

  describe('where', () => {
    it('should filter rows by criteria', () => {
      const testData = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
        ['user2', 'Bob', 'inactive'],
        ['user3', 'Charlie', 'active'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => [...testData.map(row => [...row])]),
      });

      const table = ActiveTable.bySheetName('TestSheet');
      const activeUsers = table.where({ status: 'active' });

      expect(activeUsers.length).toBe(2);
      expect(activeUsers[0].name).toBe('Alice');
      expect(activeUsers[1].name).toBe('Charlie');
    });

    it('should handle Date comparisons', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');

      const testData = [
        ['id', 'name', 'date'],
        ['user1', 'Alice', date1],
        ['user2', 'Bob', date2],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => [...testData.map(row => [...row])]),
      });

      const table = ActiveTable.bySheetName('TestSheet');
      const rows = table.where({ date: date1 });

      expect(rows.length).toBe(1);
      expect(rows[0].name).toBe('Alice');
    });
  });

  describe('create', () => {
    it('should create a new row', () => {
      const testData = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => testData),
      });

      const table = ActiveTable.bySheetName('TestSheet');
      table.create({ id: 'user2', name: 'Bob', status: 'inactive' });

      expect(mockSheet.appendRow).toHaveBeenCalledWith(['user2', 'Bob', 'inactive']);
    });

    it('should handle missing values with empty strings', () => {
      const testData = [
        ['id', 'name', 'status'],
        ['user1', 'Alice', 'active'],
      ];

      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn(() => testData),
      });

      const table = ActiveTable.bySheetName('TestSheet');
      table.create({ id: 'user2', name: 'Bob' }); // status is missing

      expect(mockSheet.appendRow).toHaveBeenCalledWith(['user2', 'Bob', '']);
    });
  });
});

describe('ActiveTableRowArray', () => {
  describe('where', () => {
    it('should filter rows', () => {
      const row1 = new ActiveTableRow(2, {} as any);
      row1.status = 'active';
      const row2 = new ActiveTableRow(3, {} as any);
      row2.status = 'inactive';

      const rows = new ActiveTableRowArray(row1, row2);
      const filtered = rows.where({ status: 'active' });

      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe('active');
    });
  });

  describe('after', () => {
    it('should filter rows with values after the given value', () => {
      const row1 = new ActiveTableRow(2, {} as any);
      row1.age = 25;
      const row2 = new ActiveTableRow(3, {} as any);
      row2.age = 30;
      const row3 = new ActiveTableRow(4, {} as any);
      row3.age = 35;

      const rows = new ActiveTableRowArray(row1, row2, row3);
      const filtered = rows.after({ age: 28 });

      expect(filtered.length).toBe(2);
      expect(filtered[0].age).toBe(30);
      expect(filtered[1].age).toBe(35);
    });
  });

  describe('before', () => {
    it('should filter rows with values before the given value', () => {
      const row1 = new ActiveTableRow(2, {} as any);
      row1.age = 25;
      const row2 = new ActiveTableRow(3, {} as any);
      row2.age = 30;
      const row3 = new ActiveTableRow(4, {} as any);
      row3.age = 35;

      const rows = new ActiveTableRowArray(row1, row2, row3);
      const filtered = rows.before({ age: 32 });

      expect(filtered.length).toBe(2);
      expect(filtered[0].age).toBe(25);
      expect(filtered[1].age).toBe(30);
    });

    it('should exclude null and empty values', () => {
      const row1 = new ActiveTableRow(2, {} as any);
      row1.age = null;
      const row2 = new ActiveTableRow(3, {} as any);
      row2.age = '';
      const row3 = new ActiveTableRow(4, {} as any);
      row3.age = 25;

      const rows = new ActiveTableRowArray(row1, row2, row3);
      const filtered = rows.before({ age: 30 });

      expect(filtered.length).toBe(1);
      expect(filtered[0].age).toBe(25);
    });
  });

  describe('deleteAll', () => {
    it('should delete all rows in reverse order', () => {
      const mockDelete = jest.fn();
      const row1 = new ActiveTableRow(2, { deleteRow: mockDelete } as any);
      const row2 = new ActiveTableRow(3, { deleteRow: mockDelete } as any);

      const rows = new ActiveTableRowArray(row1, row2);
      rows.deleteAll();

      expect(mockDelete).toHaveBeenCalledTimes(2);
      // Verify reverse order (row2 deleted before row1)
      expect(mockDelete).toHaveBeenNthCalledWith(1, 3);
      expect(mockDelete).toHaveBeenNthCalledWith(2, 2);
    });
  });

  describe('updateAll', () => {
    it('should update all rows', () => {
      const mockUpdate = jest.fn();
      const row1 = new ActiveTableRow(2, { updateRow: mockUpdate } as any);
      row1.status = 'active';
      const row2 = new ActiveTableRow(3, { updateRow: mockUpdate } as any);
      row2.status = 'active';

      const rows = new ActiveTableRowArray(row1, row2);
      rows.updateAll({ status: 'inactive' });

      expect(row1.status).toBe('inactive');
      expect(row2.status).toBe('inactive');
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
  });
});

describe('ActiveTableRow', () => {
  describe('isPersisted', () => {
    it('should return true for persisted rows', () => {
      const row = new ActiveTableRow(2, {} as any);
      expect(row.isPersisted()).toBe(true);
    });

    it('should return false for new rows', () => {
      const row = new ActiveTableRow(null, {} as any);
      expect(row.isPersisted()).toBe(false);
    });
  });

  describe('save', () => {
    it('should call addRow for new rows', () => {
      const mockAddRow = jest.fn();
      const row = new ActiveTableRow(null, { addRow: mockAddRow } as any);
      row.name = 'Test';

      row.save();

      expect(mockAddRow).toHaveBeenCalledWith(row);
    });

    it('should call updateRow for existing rows', () => {
      const mockUpdateRow = jest.fn();
      const row = new ActiveTableRow(2, { updateRow: mockUpdateRow } as any);
      row.name = 'Test';

      row.save();

      expect(mockUpdateRow).toHaveBeenCalledWith(2, row);
    });
  });

  describe('delete', () => {
    it('should call deleteRow and set rowNumber to null', () => {
      const mockDeleteRow = jest.fn();
      const row = new ActiveTableRow(2, { deleteRow: mockDeleteRow } as any);

      row.delete();

      expect(mockDeleteRow).toHaveBeenCalledWith(2);
      expect(row.isPersisted()).toBe(false);
    });
  });

  describe('update', () => {
    it('should update row properties and call updateRow', () => {
      const mockUpdateRow = jest.fn();
      const row = new ActiveTableRow(2, { updateRow: mockUpdateRow } as any);
      row.name = 'Old Name';
      row.status = 'active';

      row.update({ name: 'New Name', status: 'inactive' });

      expect(row.name).toBe('New Name');
      expect(row.status).toBe('inactive');
      expect(mockUpdateRow).toHaveBeenCalledWith(2, row);
    });

    it('should not call updateRow for non-persisted rows', () => {
      const mockUpdateRow = jest.fn();
      const row = new ActiveTableRow(null, { updateRow: mockUpdateRow } as any);

      row.update({ name: 'Test' });

      expect(row.name).toBe('Test');
      expect(mockUpdateRow).not.toHaveBeenCalled();
    });
  });

  describe('cellOf', () => {
    it('should return the cell range for a given key', () => {
      const mockCellOf = jest.fn(() => ({ range: 'A2' }));
      const row = new ActiveTableRow(2, { cellOf: mockCellOf } as any);

      const cell = row.cellOf('name');

      expect(mockCellOf).toHaveBeenCalledWith(2, 'name');
      expect(cell).toEqual({ range: 'A2' });
    });

    it('should throw an error for non-persisted rows', () => {
      const row = new ActiveTableRow(null, {} as any);

      expect(() => {
        row.cellOf('name');
      }).toThrow('rowNumber is not set');
    });
  });
});
