const BASE_URL = 'https://bams-b633ayn23-ins-projects-12adf696.vercel.app';

async function testProductionAPI() {
  console.log('🧪 Testing Production API Endpoints...\n');

  try {
    // Test Students API
    console.log('📚 Testing Students API...');
    const studentsResponse = await fetch(`${BASE_URL}/api/students`);
    console.log(`Students API Status: ${studentsResponse.status}`);
    
    if (studentsResponse.ok) {
      const students = await studentsResponse.json();
      console.log(`✅ Students loaded: ${students.length} students found`);
    } else {
      const error = await studentsResponse.text();
      console.log(`❌ Students API Error: ${error}`);
    }

    // Test Coaches API
    console.log('\n👨‍🏫 Testing Coaches API...');
    const coachesResponse = await fetch(`${BASE_URL}/api/coaches`);
    console.log(`Coaches API Status: ${coachesResponse.status}`);
    
    if (coachesResponse.ok) {
      const coaches = await coachesResponse.json();
      console.log(`✅ Coaches loaded: ${coaches.length} coaches found`);
    } else {
      const error = await coachesResponse.text();
      console.log(`❌ Coaches API Error: ${error}`);
    }

    // Test Classes API
    console.log('\n🏀 Testing Classes API...');
    const classesResponse = await fetch(`${BASE_URL}/api/classes`);
    console.log(`Classes API Status: ${classesResponse.status}`);
    
    if (classesResponse.ok) {
      const classes = await classesResponse.json();
      console.log(`✅ Classes loaded: ${classes.length} classes found`);
    } else {
      const error = await classesResponse.text();
      console.log(`❌ Classes API Error: ${error}`);
    }

    console.log('\n🎉 Production API Test Complete!');

  } catch (error) {
    console.error('❌ Production API Test Failed:', error.message);
  }
}

testProductionAPI();