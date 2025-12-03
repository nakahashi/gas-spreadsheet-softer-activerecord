# Test Client for gas-spreadsheet-softer-activerecord

This is a test client to verify the functionality of the gas-spreadsheet-softer-activerecord library in a real Google Apps Script environment.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a Google Spreadsheet with a "Users" sheet with the following structure:

| id | name | status | created_at | メモ |
|----|------|--------|------------|------|
| user1 | Alice | active | 2023-01-01 | テストユーザー1 |
| user2 | Bob | inactive | 2023-01-02 | テストユーザー2 |

**Note**: Japanese column names are fully supported!

3. Login to clasp:
```bash
npx clasp login
```

4. Create a new Google Apps Script project:
```bash
npx clasp create --type standalone --title "ActiveRecord Test Client"
```

5. Update the created `.clasp.json` with your script ID and attach it to your spreadsheet.

6. Deploy the code:
```bash
npm run deploy
```

## Running Tests

Open your Google Spreadsheet and go to Extensions > Apps Script. Then run the following functions:

- `testCrudOperations()` - Tests basic CRUD operations (Create, Read, Update, Delete)
- `testBatchOperations()` - Tests batch operations (updateAll, deleteAll)
- `testCheckUniqueParameter()` - Tests the checkUnique parameter
- `runAllTests()` - Runs all tests

Check the execution log to see the test results.

## Test Functions

### testCrudOperations()
Tests all basic CRUD operations:
- Get all users
- Find a specific user
- Filter users by status
- Create a new user
- Update a user
- Delete a user

### testBatchOperations()
Tests batch operations:
- Update multiple users at once
- Filter by date

### testCheckUniqueParameter()
Tests the checkUnique parameter:
- Default behavior (checkUnique = true)
- Allow duplicates (checkUnique = false)

### runAllTests()
Runs all test functions in sequence.
