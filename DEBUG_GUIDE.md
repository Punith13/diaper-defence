# Debugging Network and Redis Issues

## Quick Debug Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Check Server Logs
Look for console output in your terminal. The server now has extensive logging for:
- Health checks
- Redis operations
- Score saving process
- Error details

### 3. Test API Endpoints

#### Option A: Use the Debug Tool (Recommended)
1. Open `debug-api.html` in your browser
2. Click "Test Health Endpoint" to check overall system status
3. Click "Test Redis Operations" to verify Redis connectivity
4. Try saving a test score with the "Save Test Score" button

#### Option B: Manual Testing
Open your browser's developer console and run:

```javascript
// Test health endpoint
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test Redis debug endpoint
fetch('/api/debug/redis')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test save score
fetch('/api/save-score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    score: 1000,
    gameTime: 30000,
    sessionId: 'debug-test',
    gameVersion: '1.0.0'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Common Issues and Solutions

### Issue 1: "Post ID is required but missing from context"
**Cause**: The Devvit context is not properly initialized
**Solution**: 
- Make sure you're running `npm run dev` (not just the client)
- Access the game through the Devvit playtest URL, not localhost directly
- Check that `devvit.json` is properly configured

### Issue 2: Redis Connection Errors
**Symptoms**: 
- "Redis test failed" in health check
- Errors mentioning Redis operations
- Timeouts on save operations

**Debug Steps**:
1. Check the `/api/debug/redis` endpoint
2. Look for Redis-related errors in server logs
3. Verify Devvit Redis service is available

**Potential Solutions**:
- Restart the development server
- Check Devvit service status
- Ensure you're in a proper Devvit environment

### Issue 3: Network/Fetch Errors from Client
**Symptoms**:
- "Failed to fetch" errors
- CORS errors
- Network timeouts

**Debug Steps**:
1. Check browser network tab for failed requests
2. Verify the API endpoints are responding (use debug tool)
3. Check if you're accessing the game through the correct URL

**Solutions**:
- Use the Devvit playtest URL instead of localhost
- Check that the server is running on the correct port
- Verify no firewall/proxy issues

### Issue 4: Score Not Saving
**Debug Process**:
1. Check server logs for "SAVE SCORE REQUEST START"
2. Look for Redis operation logs
3. Check for validation errors
4. Verify the response in browser network tab

**Common Causes**:
- Invalid score data (negative numbers, etc.)
- Redis connection issues
- Missing required fields in request

## Server Logging

The server now logs detailed information:

```
=== SAVE SCORE REQUEST START ===
Request body: { "score": 1000, "gameTime": 30000, ... }
Context postId: abc123
Extracted data: { score: 1000, gameTime: 30000, ... }
Getting current username from Reddit...
Final username: testuser
Checking existing best score with key: diaper-defense:user-best:abc123:testuser
...
```

## Testing in Devvit Environment

**Important**: The high score system requires a proper Devvit environment to work:

1. Run `npm run dev`
2. Use the playtest URL provided (e.g., `https://www.reddit.com/r/my-app_dev?playtest=my-app`)
3. Don't test on `localhost:3000` directly - it won't have the proper Devvit context

## Quick Verification Checklist

- [ ] `npm run dev` is running without errors
- [ ] Accessing game through Devvit playtest URL
- [ ] `/api/health` returns "healthy" status
- [ ] `/api/debug/redis` shows successful Redis operations
- [ ] Server logs show detailed debugging information
- [ ] Browser network tab shows successful API calls

## Getting Help

If issues persist:
1. Share the output from `/api/health` and `/api/debug/redis`
2. Include server console logs from a score save attempt
3. Share any browser console errors
4. Confirm you're using the Devvit playtest URL