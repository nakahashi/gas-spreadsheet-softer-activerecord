import { ActiveTable } from 'gas-spreadsheet-softer-activerecord';

/**
 * Test function to verify all basic CRUD operations
 */
function testCrudOperations() {
  Logger.log('=== Starting CRUD Tests ===');

  // Get the Users table
  const Users = ActiveTable.bySheetName('Users');

  // Test 1: Get all users
  Logger.log('\n--- Test 1: Get all users ---');
  const allUsers = Users.all();
  Logger.log(`Total users: ${allUsers.length}`);
  allUsers.forEach(user => {
    Logger.log(`  - ${user.id}: ${user.name} (${user.status})`);
  });

  // Test 2: Find a specific user
  Logger.log('\n--- Test 2: Find specific user ---');
  try {
    const user = Users.find('user1');
    Logger.log(`Found user: ${user.name}, status: ${user.status}`);
  } catch (error) {
    Logger.log(`Error: ${error}`);
  }

  // Test 3: Filter users by status
  Logger.log('\n--- Test 3: Filter by status ---');
  const activeUsers = Users.where({ status: 'active' });
  Logger.log(`Active users: ${activeUsers.length}`);
  activeUsers.forEach(user => {
    Logger.log(`  - ${user.id}: ${user.name}`);
  });

  // Test 4: Create a new user (with Japanese column name)
  Logger.log('\n--- Test 4: Create new user ---');
  const newUserId = `user_test_${Date.now()}`;
  Users.create({
    id: newUserId,
    name: 'Test User',
    status: 'active',
    created_at: new Date(),
    メモ: 'テストで作成されたユーザー',
  });
  Logger.log(`Created new user: ${newUserId}`);

  // Test 5: Update a user (including Japanese column)
  Logger.log('\n--- Test 5: Update user ---');
  try {
    const userToUpdate = Users.find(newUserId);
    userToUpdate.update({
      status: 'inactive',
      name: 'Updated Test User',
      メモ: '更新されたテストユーザー',
    });
    Logger.log(`Updated user ${newUserId}: ${userToUpdate.name}, ${userToUpdate.status}`);
    Logger.log(`  メモ: ${userToUpdate.メモ}`);
  } catch (error) {
    Logger.log(`Error: ${error}`);
  }

  // Test 6: Delete the test user
  Logger.log('\n--- Test 6: Delete user ---');
  // try {
  //   const userToDelete = Users.find(newUserId);
  //   userToDelete.delete();
  //   Logger.log(`Deleted user: ${newUserId}`);
  // } catch (error) {
  //   Logger.log(`Error: ${error}`);
  // }

  Logger.log('\n=== All Tests Completed ===');
}

/**
 * Test function for batch operations
 */
function testBatchOperations() {
  Logger.log('=== Starting Batch Operations Tests ===');

  const Users = ActiveTable.bySheetName('Users');

  // Test 1: Update all active users
  Logger.log('\n--- Test 1: Update all active users ---');
  const activeUsers = Users.where({ status: 'active' });
  Logger.log(`Found ${activeUsers.length} active users`);
  // Uncomment to actually update:
  // activeUsers.updateAll({ status: 'updated' });
  // Logger.log('Updated all active users to status: updated');

  // Test 2: Filter by date
  Logger.log('\n--- Test 2: Filter by date ---');
  const recentUsers = Users.after({ created_at: new Date('2023-01-01') });
  Logger.log(`Users created after 2023-01-01: ${recentUsers.length}`);

  Logger.log('\n=== Batch Operations Tests Completed ===');
}

/**
 * Test function for checkUnique parameter
 */
function testCheckUniqueParameter() {
  Logger.log('=== Starting checkUnique Parameter Test ===');

  // Test with checkUnique = true (default)
  Logger.log('\n--- Test 1: checkUnique = true (default) ---');
  try {
    const Users = ActiveTable.bySheetName('Users', true);
    Logger.log('Successfully created table with unique check');
  } catch (error) {
    Logger.log(`Error with unique check: ${error}`);
  }

  // Test with checkUnique = false
  Logger.log('\n--- Test 2: checkUnique = false ---');
  try {
    const UsersNoCheck = ActiveTable.bySheetName('Users', false);
    Logger.log('Successfully created table without unique check');
    Logger.log(`  Found ${UsersNoCheck.all().length} users`);
  } catch (error) {
    Logger.log(`Error: ${error}`);
  }

  Logger.log('\n=== checkUnique Parameter Test Completed ===');
}

/**
 * Main test runner
 */
function runAllTests() {
  try {
    testCrudOperations();
    testBatchOperations();
    testCheckUniqueParameter();
    Logger.log('\n✅ All tests passed!');
  } catch (error) {
    Logger.log(`\n❌ Test failed: ${error}`);
  }
}
