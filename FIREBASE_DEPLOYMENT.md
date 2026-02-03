# Firebase JWT Signature Fix - Deployment Instructions

## Problem
The application was experiencing "Invalid JWT Signature" errors on the deployed domain while working fine locally. This was caused by improper private key formatting in environment variables.

## Solution
Updated the Firebase service to use a JSON service account file (`firebase-service-account.json`) with fallback to environment variables.

## Deployment Steps

### For Your Deployment Platform (Vercel/AWS/etc.)

You need to upload the `firebase-service-account.json` file to your deployment environment. Here are the options:

#### Option 1: Upload the JSON file directly (Recommended)
1. Copy the `firebase-service-account.json` file from your local project
2. Upload it to your deployment platform in the root directory
3. The application will automatically detect and use it

#### Option 2: Use Environment Variables (Fallback)
If you cannot upload files, the application will fall back to using environment variables. Make sure these are set in your deployment platform:

```
FIREBASE_PROJECT_ID=blinkit-be-e491a
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@blinkit-be-e491a.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCf/H44VMwwh1wD\n4IManPyRqvIW+bnr2DkZxUIvJEPH43LRjNhAl3Q94BmxeSpWXkO6IjGhyIQO2s7Z\nQI+mUvMU6oMivqNblU+UrD8Cc34m6Ih2MwpNtkLWHJZwXJcA+IgrojbMQE/jFfei\n89US911kN31KYGYDJCimsmOXtSoqXolAIj2p2OtkHQ/jXATv2mlwcTXET9xOWc4T\nz3OqrXezGjP7W2d5qe4mPjQ0kxU+jsm0aVQpuReyYbE/vLNd8K+M1MuMHnnSryva\nf0WmBQbGGOAFE5IFxLvr80oyuBnNmtF5er8DTFdHMYvad6P4Y7AoS1JrvRJFx2Dy\njBNzWeI7AgMBAAECggEAPL7uXg00iqias44nuY8qB1VVHowrn/U1mSdg/e1THy6p\nhg9ofP4E0QmqN8y92pVoOeCJ39f27H0AVVVCNfEBA0wYBrVD6Z5D3TuZoSChIbzh\nM6AlpWQy9IFeTcOaQnAbpBWvoNY6fwr0QBc9LDpoZ4j6NadslHzCQqkxT4UmQXeS\nCfyZCqIuOdVWBBduBL5Nej55tI835Xu6oi6YNa5DbRM5Rt1YhZ4gajPm+F4JXDCN\natswbN9WaEmt+sdS1Zx0sdsCNvaY/s1LqfZE8geV/n1ehmOy+Z1Vt0F0pv/Q+W4O\n/fUI2ADE3YPuqHO5eVhAllBctYdm3jqdood6oHqRgQKBgQDNX4F8piuF9PDixJ9/\n8UIXyVhiVrrVI+EflrD2nm4/a7lUwkQOmpVKMZSOfFPAyzsMHzNlp/pD5Csqbr5i\niTDBiyIH14cvmWW5QBrHzIMGW7hGcxvdIP90cEZxRzJO3imDd3PmFUsQVsZ8+pHh\n+GCE07zekTuOeJhrcTrT1BObMQKBgQDHbMLLuLVUW0KQXIe+ByatqR0lst7uLhi3\nZhpj0cmESpohP7CEa3Xb9XD4bipTO/WcoIVcQXhX3NyhMH3I5l6gCwBf2lvzYYJK\n+30m+hgJpzR5w1NrA6Fxkw60ibO3qfLX8hnfF3fyjmNxgmtQXw2kk2JZSq6nQb+w\nMfeHD4WhKwKBgH7SGU319y5zgUUnki8Ztmyl4zRmxlzUGTK+hWzljMMRLJMQm6JB\nByuXzlrmn3mQhlgH9F80CbFe9uDvHhYPDdKWrl8VUt+r5EsvMNpsigSlIvguIOi+\ndcFbi8Rr6L8XJZ+PZjyQrZfbXhrTSL63+DJN5nWyTYq/IbBHbcJdVfYhAoGACgLh\nvIxnPfbe3pRmlBmTzYAB4JScMGTMBNjxVjV/4k5EcorZ96vVXNdzdmVBZrBJ4jUE\nvN7khbSmtsjSZ7V45pvmxukVWKB6g/0gCUbg0gs8zSgLFgI2ppb1VAbdqMi1UjXr\nKpHpCZowT9B2RrCe5LYpZ8YiAm+Aif3YKUWUNcUCgYAvQNG/XugLfcqM9Mp+s1gr\nE6WFbyXNhIjKy8ILE9Bnocqa4nmfV4GQFKYlNI4hLQKnH9SwrwUFzrrgmSnpcClz\nNUrCZBa3w58RY0nZedjs/DoEjFMbcYtB+QEPc5vERfx67fxEdqqTMAf2VniBzEVa\nwusv5PsdS34qbqewDtFVVw==\n-----END PRIVATE KEY-----\n
FIREBASE_STORAGE_BUCKET=blinkit-be-e491a.firebasestorage.app
```

**Important:** Make sure the `FIREBASE_PRIVATE_KEY` value includes the `\n` characters as literal text (not actual newlines).

### Verification
After deployment, check the server logs. You should see one of these messages:
- `"Using Firebase service account JSON file"` - JSON file is being used (preferred)
- `"Using Firebase environment variables"` - Environment variables are being used (fallback)

## What Changed
1. Created `firebase-service-account.json` with proper credentials
2. Updated `firebase.service.ts` to try loading JSON file first, then fall back to environment variables
3. Added `firebase-service-account.json` to `.gitignore` for security

## Local Development
The `firebase-service-account.json` file is already in your local project and will work automatically.
