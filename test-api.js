const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000/api';

async function testStudentSave() {
  console.log('🧪 Testing Student Save...');
  
  const studentData = {
    name: 'Test Student',
    dateOfBirth: '2010-05-15',
    guardianName: 'Test Guardian',
    contactNumber: '+1-555-9999',
    medicalNotes: 'No allergies'
  };

  try {
    const response = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Student save successful:', result.name);
      return result;
    } else {
      console.log('❌ Student save failed:', result.error);
      console.log('Response status:', response.status);
      console.log('Full response:', result);
      return null;
    }
  } catch (error) {
    console.log('❌ Student save error:', error.message);
    return null;
  }
}

async function testCoachSave() {
  console.log('🧪 Testing Coach Save...');
  
  const coachData = {
    name: 'Test Coach',
    paymentType: 'HOURLY',
    hourlyRate: 60.00,
    payoutMethod: 'bank_transfer',
    bankDetails: 'Test Bank - ****1234',
    contactNumber: '+1-555-8888',
    email: 'testcoach@example.com'
  };

  try {
    const response = await fetch(`${BASE_URL}/coaches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(coachData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Coach save successful:', result.name);
      return result;
    } else {
      console.log('❌ Coach save failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Coach save error:', error.message);
    return null;
  }
}

async function testClassSave() {
  console.log('🧪 Testing Class Save...');
  
  // First, get available coaches and courts
  try {
    const coachesResponse = await fetch(`${BASE_URL}/coaches`);
    const coaches = await coachesResponse.json();
    
    const courtsResponse = await fetch(`${BASE_URL}/courts`);
    const courts = await courtsResponse.json();
    
    if (coaches.length === 0 || courts.length === 0) {
      console.log('❌ No coaches or courts available for class test');
      return null;
    }

    const classData = {
      name: 'Test Class',
      coachId: coaches[0].id,
      courtId: courts[0].id,
      dayOfWeek: 5, // Friday
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:00:00Z',
      isRecurring: true
    };

    const response = await fetch(`${BASE_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Class save successful:', result.name);
      return result;
    } else {
      console.log('❌ Class save failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Class save error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting API Save Tests...\n');
  
  const studentResult = await testStudentSave();
  console.log('');
  
  const coachResult = await testCoachSave();
  console.log('');
  
  const classResult = await testClassSave();
  console.log('');
  
  console.log('📊 Test Summary:');
  console.log(`Student Save: ${studentResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Coach Save: ${coachResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Class Save: ${classResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = studentResult && coachResult && classResult;
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Add a delay to ensure the server is ready
setTimeout(runTests, 2000);