# STREAK MODAL BUG ANALYSIS - 10 YOE Debug Report

## Issue Description
After user skips streak and logs out, the streak modal does NOT appear on next login.

---

## ROOT CAUSE IDENTIFIED 🎯

### The Problem: Component State Not Reset on New Login

**Location**: [ApplicantDashboard.js Line 62-63](src/components/applicantcomponents/ApplicantDashboard.js#L62-L63)

```javascript
const [sessionSkipped, setSessionSkipped] = useState(() => {
  return sessionStorage.getItem("streak_skipped_today") === "true";
});
```

### Why This Fails

1. **State Lazy Initialization Only Runs Once**
   - Lazy initializer `() => {...}` only executes on **first component mount**
   - NOT re-executed on subsequent user.id changes

2. **Component Lifecycle Issue**
   - When user logs out → sessionStorage.clear() is called
   - But ApplicantDashboard component may NOT unmount
   - Component continues to exist with old state `sessionSkipped = true`
   - When user logs back in → user.id changes
   - fetchStreakDetails() runs (useEffect dep: [user?.id])
   - BUT `sessionSkipped` state is STILL `true` from before logout!

3. **The Logic Gate Fails**
   - Line 180 (approx) checks: `if (!data?.attemptedToday && !sessionSkipped)`
   - Even though sessionStorage was cleared, the React state still holds `sessionSkipped = true`
   - Modal never shows! ❌

---

## Flow Diagrams

### Current Flow (BROKEN)
```
Session A (User 1):
├─ component mount
├─ sessionSkipped = false (init from clean sessionStorage)
├─ user skips streak
├─ sessionStorage.setItem("streak_skipped_today", "true")
├─ setSessionSkipped(true) ← STATE UPDATED
└─ modal closes

Logout:
├─ sessionStorage.clear() ✓
└─ onLogout callback fires

Login (User 1 again):
├─ component STILL MOUNTED (NOT unmounted during logout!)
├─ user.id context updates → triggers fetchStreakDetails useEffect
├─ sessionStorage NOW has: {} (was cleared)
├─ BUT componentState.sessionSkipped = true ← STALE! ❌
├─ Condition: !data?.attemptedToday && !sessionSkipped = false && true = FALSE
└─ Modal does NOT show ❌❌❌
```

### Correct Flow (What Should Happen)
```
Login (User 1 again):
├─ sessionSkipped should be reset to FALSE when user.id changes
├─ Condition: !data?.attemptedToday && !sessionSkipped = false && true = TRUE
└─ Modal SHOWS ✓✓✓
```

---

## Solutions

### ✅ SOLUTION 1: Reset sessionSkipped in useEffect When user.id Changes (RECOMMENDED)

Add a useEffect that monitors user.id and clears sessionSkipped state:

**Location**: After line 63 in ApplicantDashboard.js

```javascript
// Reset sessionSkipped when new user logs in
useEffect(() => {
  setSessionSkipped(false);
}, [user?.id]);
```

**Why This Works**: 
- When user.id changes (new user logged in), sessionSkipped is forced to false
- Ensures state is never out of sync with sessionStorage
- Simple, clean, follows React best practices
- No other components affected

---

### ✅ SOLUTION 2: Improve clearJWTToken to Use Session Context (ADVANCED)

If you want to reset ALL session state across the app:

```javascript
// In clearJWTToken.js
const clearJWTToken = async () => {
  try {
    await axios.post(`${apiUrl}/applicant/applicantsignOut`);
    clearUserData();
    // Dispatch global session reset event
    window.dispatchEvent(new CustomEvent('USER_LOGGED_OUT'));
  } catch (error) {
    console.error('Error logging out:', error);
    throw new Error('Logout failed');
  }
};
```

Then in ApplicantDashboard.js useEffect:
```javascript
useEffect(() => {
  const handleLogout = () => setSessionSkipped(false);
  window.addEventListener('USER_LOGGED_OUT', handleLogout);
  return () => window.removeEventListener('USER_LOGGED_OUT', handleLogout);
}, []);
```

---

### ✅ SOLUTION 3: Use Custom Hook for SessionStorage (ENTERPRISE PATTERN)

Create a custom hook that syncs state with sessionStorage:

```javascript
// In src/hooks/useSessionStorage.js
function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    return sessionStorage.getItem(key) === "true" || initialValue;
  });

  useEffect(() => {
    if (storedValue) {
      sessionStorage.setItem(key, "true");
    } else {
      sessionStorage.removeItem(key);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// Usage in ApplicantDashboard.js
const [sessionSkipped, setSessionSkipped] = useSessionStorage("streak_skipped_today", false);
```

---

## Additional Issues Found 🔍

### Issue 2: localStorage Key Not Cleared on Logout
**Line 1606 in ApplicantDashboard.js**:
```javascript
safeSet(`streak_modal_shown_${currentDay}_${user.id}`, "true");
```

This localStorage key accumulates and is NEVER cleared. While not directly causing the current bug, it should be added to clearJWTToken.js for completeness.

**Fix**: Add to `clearUserData()` in clearJWTToken.js:
```javascript
// Clear all streak-related localStorage
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.startsWith('streak_modal_shown_')) {
    localStorage.removeItem(key);
  }
});
```

---

## Testing Plan ✅

1. **Setup**: 
   - Day 1: User logs in, skips streak
   - Day 2: User logs out, logs back in

2. **Expected**: 
   - Streak modal appears on Day 2

3. **Verify**:
   ```javascript
   // In browser console on fresh login:
   console.log(sessionStorage.getItem("streak_skipped_today")); // Should be null
   console.log(window.__REACT_STATE); // componentState.sessionSkipped should be false
   ```

---

## Recommendation 🎯

**Use SOLUTION 1** - it's the most pragmatic fix:
- Minimal code change (2 lines)
- No external dependencies
- Follows React patterns
- Immediately solves the issue
- Prevents similar bugs in future

---

## Additional Notes for Future

- sessionStorage is cleared on logout (good)
- But React component state CAN persist across logout if component doesn't unmount
- Always reset component-level state when detecting user context changes
- Consider using useEffect dependencies more carefully with auth flows
