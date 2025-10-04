// Script to check for environment variables that might override database connection
console.log('Checking environment variables...');

// List all environment variables (excluding sensitive values)
console.log('\nEnvironment variables that might affect database connection:');
const relevantVars = [
  'DATABASE_URL', 
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'NEXT_PUBLIC_DATABASE_URL',
  'VERCEL_POSTGRES_URL',
  'NODE_ENV'
];

relevantVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask password in connection strings for security
    const maskedValue = varName.includes('URL') && typeof value === 'string' 
      ? value.replace(/:([^:@]+)@/, ':****@')
      : value;
    console.log(`${varName}: ${maskedValue}`);
  }
});

// Check for Vercel-specific environment variables
console.log('\nChecking for Vercel environment:');
if (process.env.VERCEL) {
  console.log('Running in Vercel environment');
} else {
  console.log('Not running in Vercel environment');
}

// Check Next.js environment
console.log('\nNext.js environment:', process.env.NODE_ENV || 'not set');

// Suggest next steps
console.log('\nSuggested actions:');
console.log('1. Make sure only one DATABASE_URL is defined in your environment');
console.log('2. Check for any .env.local or .env.development files that might override .env');
console.log('3. If using Vercel, check for environment variables in the Vercel dashboard');