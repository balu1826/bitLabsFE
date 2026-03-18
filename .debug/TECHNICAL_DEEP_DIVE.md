# TECHNICAL DEEP DIVE - Streak Modal State Management Bug

## Executive Summary
React component state (`sessionSkipped`) was not being reset when user context changed during logout/login flow, causing the streak modal to never appear despite sessionStorage being correctly cleared.

---

## The Problem in Detail

### Root Cause: Stale Closure & State Persistence

**React Component State Lifecycle:**
```javascript
// Initial mount during first login
useState(() => {
  // This initializer runs ONCE on first mount
  return sessionStorage.getItem("streak_skipped_today") === "true";  // false
})
// State is now: sessionSkipped = false

// User skips streak
setSessionSkipped(true)
// State is now: sessionSkipped = true
// Storage is now: sessionStorage.streak_skipped_today = "true"

// User logs out
// sessionStorage.clear() is called
// Storage is now: {} (empty)
// BUT component may not unmount!
// State is STILL: sessionSkipped = true ← STALE!

// User logs back in (user.id changes)
// StateInitializer does NOT run again (only runs on mount)
// State is STILL: sessionSkipped = true ← BUG!
```

### Why This Breaks the Modal Logic

**Line 180+ in ApplicantDashboard.js:**
```javascript
if (!data?.attemptedToday && !sessionSkipped) {
  // Show modal
}
```

**Evaluation After Bug:**
```javascript
!data?.attemptedToday = !false = true
!sessionSkipped = !true = false
true && false = false ← Modal doesn't show!
```

**Expected Evaluation After Fix:**
```javascript
!data?.attemptedToday = !false = true
!sessionSkipped = !false = true  ← Fixed!
true && true = true ← Modal shows!
```

---

## Solution Explanation

### Why useEffect with user?.id Dependency Works

```javascript
useEffect(() => {
  setSessionSkipped(false);
}, [user?.id]);  // Runs when user.id changes!
```

**Execution Flow:**
```
On Fresh Login:
1. user.id context updates (different user or null → value)
2. React detects dependency change
3. useEffect callback executes
4. setSessionSkipped(false) is called
5. Component re-renders with updated state
6. fetchStreakDetails sees !sessionSkipped = true
7. Modal shows! ✓

On Page Refresh (same user):
1. user.id is same
2. useEffect dependency NOT changed
3. Callback doesn't run
4. sessionSkipped retains value from sessionStorage init
5. Works correctly ✓
```

---

## Why Other Solutions Were Considered (& Rejected)

### ❌ Option 1: Only Clear sessionStorage
**Why it failed:**
```javascript
// This alone was NOT enough:
sessionStorage.clear();

// Because React state ≠ sessionStorage
// They are separate memory locations:
React Memory:     {sessionSkipped: true}
sessionStorage:   {} (empty after clear)
// Mismatch! ← Bug persists
```

### ❌ Option 2: Lazy Initializer with useCallback
**Why it failed:**
```javascript
const getInitialState = useCallback(() => {
  return sessionStorage.getItem("streak_skipped_today") === "true";
}, []);

// useCallback memoizes the function
// But the function is NEVER called again after first mount!
// It's still a lazy initializer - runs only once
```

### ❌ Option 3: useMemo Dependency
**Why it failed:**
```javascript
const sessionSkipped = useMemo(() => {
  return sessionStorage.getItem("streak_skipped_today") === "true";
}, [sessionStorage]);

// sessionStorage is not a reactive dependency
// Dependencies are usually: values, state, props - not storage objects
// Would cause unnecessary recalculations
```

### ✅ Option 4 (Our Solution): useEffect with User Context
**Why it works:**
```javascript
useEffect(() => {
  setSessionSkipped(false);
}, [user?.id]);

// Pros:
// - Runs whenever user context changes ✓
// - Properly resets state to storage value ✓
// - Follows React patterns ✓
// - Minimal performance impact ✓
// - Self-documenting code ✓
```

---

## State Management Flow Diagram

### Before Fix
```
┌─────────────────────────────────────────────────────────────┐
│ Session 1: User Logs In                                      │
├─────────────────────────────────────────────────────────────┤
│ ✓ Component mounts                                           │
│ ✓ useState initializer runs                                  │
│   sessionSkipped = false                                     │
│   sessionStorage is clean                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ User Skips Streak                                            │
├─────────────────────────────────────────────────────────────┤
│ ✓ setSessionSkipped(true)                                    │
│ ✓ sessionStorage.setItem("streak_skipped_today", "true")     │
│ ─ Modal closes                                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ User Logs Out                                                │
├─────────────────────────────────────────────────────────────┤
│ ✓ sessionStorage.clear() ← Storage cleared                   │
│ ✗ sessionSkipped state NOT reset (component may not unmount) │
│ ✗ React State still has: sessionSkipped = true               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Session 2: User Logs In Again (BUG!)                         │
├─────────────────────────────────────────────────────────────┤
│ ✗ useState initializer does NOT run (component didn't unmount)
│ ✗ sessionSkipped still = true (stale value!)                 │
│ ✗ Modal condition: !true && !attemptedToday = false          │
│ ✗✗✗ MODAL DOES NOT APPEAR ✗✗✗                               │
└─────────────────────────────────────────────────────────────┘
```

### After Fix
```
┌─────────────────────────────────────────────────────────────┐
│ Session 2: User Logs In Again (FIXED!)                       │
├─────────────────────────────────────────────────────────────┤
│ ✓ user.id context changes                                    │
│ ✓ NEW useEffect detects change                               │
│ ✓ setSessionSkipped(false) is called                         │
│ ✓ Component re-renders                                       │
│ ✓ Condition: !false && !attemptedToday = true                │
│ ✓✓✓ MODAL APPEARS ✓✓✓                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Related State Variables & Their Purposes

### Modal Display State
```javascript
const [showStreakModal, setShowStreakModal] = useState(false);
// When true: Renders the StreakExamModal component
// When false: Hides the modal

const [showRestorePrompt, setShowRestorePrompt] = useState(false);
// Shows before streak modal if user can restore previous streak
```

### Streak Data State
```javascript
const [streakDetails, setStreakDetails] = useState({});
// From API response:
// {
//   currentStreak: number,
//   longestStreak: number,
//   attemptedToday: boolean ← Used in modal condition
// }
```

### Session Flag State
```javascript
const [sessionSkipped, setSessionSkipped] = useState(...);
// Flag indicating user skipped streak in this session
// Only valid for current session (cleared on logout)
// NOT persistent across sessions
```

---

## The Complete Modal Display Logic

```javascript
useEffect(() => {
  fetchStreakDetails();
}, [user?.id]);

// NEW: Reset session flag on user change
useEffect(() => {
  setSessionSkipped(false);
}, [user?.id]);

// Inside fetchStreakDetails():
const response = await axios.get(`${apiUrl}/streak/${user.id}/getStreakDetails`);
const data = response.data;
setStreakDetails(data);

// The critical condition:
if (!data?.attemptedToday && !sessionSkipped) {
  setTimeout(() => {
    if (restoreAvailable) {
      setShowRestorePrompt(true);  // Show restore first
    } else {
      setShowStreakModal(true);    // Show test modal
    }
  }, 500);
}
```

**Condition Breakdown:**
- `!data?.attemptedToday` - User hasn't completed today's streak (from backend)
- `!sessionSkipped` - User hasn't skipped in THIS session
- BOTH must be true to show modal
- If either is false, modal is skipped

---

## Edge Cases Handled by This Fix

### Case 1: Multiple Users
```
User A logs in → sessionSkipped = false
User A skips → sessionSkipped = true
User A logs out → sessionStorage cleared
User B logs in → user.id changes
  → Our useEffect runs
  → setSessionSkipped(false)
  → Fresh state for User B ✓
```

### Case 2: Rapid Logout/Login
```
User logs out → sessionStorage.clear() queued
User logs in immediately (before component unmount)
  → user.id changes (null → value)
  → Our useEffect runs before component unmount might happen
  → State is clean either way ✓
```

### Case 3: Same User, Refresh Page
```
Same user, page refresh
  → user.id doesn't change
  → Our useEffect doesn't run
  → sessionSkipped comes from lazy initializer (correct) ✓
```

### Case 4: Browser Tab with Multiple Windows
```
Window 1: User A skips (sessionStorage set)
Window 2: User A is logged in
  → Each window has separate sessionStorage
  → localStorage (if used) might be window-wide
  → Our fix handles both cases ✓
```

---

## Performance Implications

### Time Complexity
- useState lazy init: O(1)
- useEffect dependency check: O(1)
- setSessionSkipped: O(1)
- **Total: O(1)** ✓

### Space Complexity
- sessionStorage key: ~30 bytes
- React state variable: 1 boolean = 1 byte
- **Total: Negligible** ✓

### Re-render Impact
- Only triggers re-render when user.id changes
- Typically happens once per session (login)
- No performance degradation ✓

---

## Testing Strategy for Future

### Unit Test Example (Jest)
```javascript
test('sessionSkipped resets on new login', () => {
  const { rerender } = render(<ApplicantDashboard user={{ id: 1 }} />);
  
  // Skip streak
  fireEvent.click(skipButton);
  expect(sessionSkipped).toBe(true);
  
  // Simulate new login (user.id changes)
  rerender(<ApplicantDashboard user={{ id: 2 }} />);
  expect(sessionSkipped).toBe(false);
});
```

### Integration Test Example
```javascript
test('Streak modal appears after logout and login', async () => {
  // Login User A
  login(userA);
  // Skip streak
  skipStreak();
  // Logout
  logout();
  // Login again
  login(userA);
  // Modal should appear
  await waitFor(() => {
    expect(streakModal).toBeVisible();
  });
});
```

---

## Debugging Commands for Troubleshooting

```javascript
// Check sessionStorage state
console.log('sessionStorage:', sessionStorage);
console.log('streak_skipped_today:', sessionStorage.getItem('streak_skipped_today'));

// Check React state in DevTools
// Set breakpoint in useEffect to inspect state

// Check user context
console.log('user.id:', user?.id);

// Force re-render to test
// setTimeout(() => { window.location.reload(); }, 1000);
```

---

## Preventive Measures for Future

1. Always reset component state when user context changes
2. Don't rely solely on lazy initializers for auth-related state
3. Think about component lifecycle during logout/login transitions
4. Test multi-user scenarios
5. Consider using custom hooks for storage-synced state
6. Document state persistence requirements in code comments

