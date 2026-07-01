# Testing Checklist - Vardhman Matrimonials

## Landing Page (Home)

### User Flows (Happy Paths)
- [ ] Load landing page -- page renders successfully with all elements visible
- [ ] Click "Register Now" button when not verified -- redirects to /register
- [ ] Click "Continue filling the form" when mobile verified but not paid -- redirects to /register
- [ ] Click "Go to Dashboard" when paid -- redirects to /dashboard
- [ ] Click "Browse Profiles" button -- redirects to /profiles
- [ ] Click "Vardhman Matrimonials" brand logo -- navigates to home page
- [ ] Click "About" navigation link -- opens mailto:hello@vardhmanmatrimonials.com
- [ ] Click "Process" navigation link -- opens mailto:hello@vardhmanmatrimonials.com
- [ ] Click "Contact" navigation link -- opens mailto:hello@vardhmanmatrimonials.com
- [ ] Engagement frame animation loads and plays smoothly at 24 FPS
- [ ] Animation loops continuously without stuttering
- [ ] Page displays correctly when user is logged in (Header shows user info)
- [ ] Page displays correctly when user is not logged in (Header shows Register/Sign up)

### Edge Cases & Error States
- [ ] Load page with localStorage disabled -- page should render without errors
- [ ] Load page with corrupted localStorage data -- should handle gracefully and default to unverified state
- [ ] Load page when localStorage contains invalid JSON -- should catch error and default to unverified state
- [ ] Animation frame images fail to load -- should display fallback or error state
- [ ] Animation frame images are partially missing -- should handle missing frames gracefully
- [ ] Network is slow -- page should render with loading states
- [ ] Browser doesn't support canvas -- should display fallback content
- [ ] Browser doesn't support ImageBitmap -- should fallback to regular Image elements

### Navigation & Deep Links
- [ ] Direct navigation to / -- renders landing page
- [ ] Navigate to / then back via browser back button -- works correctly
- [ ] Refresh page on / -- state persists from localStorage
- [ ] Deep link to / with verified=true in localStorage -- shows "Continue filling the form"
- [ ] Deep link to / with paid=true in localStorage -- shows "Go to Dashboard"

### Offline/No Internet Behavior
- [ ] Load page offline -- cached assets should display if available
- [ ] Try to navigate when offline -- should show appropriate error or offline state
- [ ] Animation frames fail to load offline -- should handle gracefully

### Performance Checkpoints
- [ ] Initial page load time < 3 seconds on 3G
- [ ] Time to Interactive < 5 seconds
- [ ] Animation frames preload efficiently without blocking main thread
- [ ] Memory usage remains stable during animation playback
- [ ] No memory leaks when navigating away from page
- [ ] Lighthouse performance score > 80

### Platform-Specific Behavior
- [ ] Responsive design on desktop (1920x1080) -- layout displays correctly
- [ ] Responsive design on laptop (1366x768) -- layout displays correctly
- [ ] Responsive design on tablet (768x1024) -- layout stacks correctly
- [ ] Responsive design on mobile (375x667) -- layout is mobile-optimized
- [ ] Touch interactions work on mobile devices
- [ ] Animation plays smoothly on mobile browsers
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces all interactive elements correctly
- [ ] High contrast mode maintains readability
- [ ] Reduced motion preference disables animation

---

## Header Component

### User Flows (Happy Paths)
- [ ] Header displays when user is not logged in -- shows Register/Sign up buttons
- [ ] Header displays when user is logged in -- shows user avatar, name, mobile, and Logout button
- [ ] Click Logout button -- clears localStorage and redirects to home
- [ ] User avatar displays first letter of full name in uppercase
- [ ] User avatar displays "U" if full name is not available
- [ ] Mobile number displays correctly in header when logged in
- [ ] Click Register button -- navigates to /register
- [ ] Click Sign up button -- navigates to /register

### Edge Cases & Error States
- [ ] localStorage contains corrupted profile data -- should handle gracefully and show unauthenticated state
- [ ] localStorage profile data is missing required fields -- should display available data or fallback
- [ ] Full name is empty string -- avatar should display "U"
- [ ] Mobile number is empty -- should not display mobile field
- [ ] Profile data is null or undefined -- should show unauthenticated state
- [ ] localStorage is disabled -- should show unauthenticated state
- [ ] localStorage is full -- should handle write errors gracefully

### Navigation & Deep Links
- [ ] Header persists across all page navigations
- [ ] Header state updates after successful registration
- [ ] Header state updates after logout
- [ ] Header state updates when localStorage changes from another tab

### Offline/No Internet Behavior
- [ ] Header renders correctly offline
- [ ] Logout works offline (clears localStorage)
- [ ] Header displays cached user data offline

### Performance Checkpoints
- [ ] Header renders without layout shift
- [ ] User avatar loads quickly
- [ ] No unnecessary re-renders when other components update

### Platform-Specific Behavior
- [ ] Header is responsive on mobile devices
- [ ] Logout button is easily tappable on mobile
- [ ] Header doesn't overflow on small screens
- [ ] User avatar is visible on high DPI screens

---

## Registration Flow - Step 1: Mobile Verification

### User Flows (Happy Paths)
- [ ] Enter valid 10-digit mobile number and click "Send OTP" -- OTP is sent successfully
- [ ] Enter mobile number with +91 prefix and click "Send OTP" -- OTP is sent successfully
- [ ] After OTP sent, enter 6-digit OTP and click "Verify" -- OTP verifies successfully
- [ ] After successful verification, user is redirected to home page
- [ ] localStorage stores vardhman_mobile_verified = true after verification
- [ ] localStorage stores vardhman_id_token after verification
- [ ] Recaptcha verifier loads invisibly
- [ ] Send OTP button shows "Sending..." while loading
- [ ] Send OTP button is disabled while loading
- [ ] OTP field appears after OTP is sent
- [ ] Success message displays after OTP verification
- [ ] Form progress bar updates to show Step 1 completion

### Edge Cases & Error States
- [ ] Enter mobile number with less than 10 digits -- validation error displays
- [ ] Enter mobile number with more than 10 digits -- validation error displays
- [ ] Enter mobile number with non-digit characters -- validation error displays
- [ ] Enter empty mobile number and click Send OTP -- validation error displays
- [ ] Click Send OTP without entering mobile number -- validation error displays
- [ ] Firebase client not configured (missing env vars) -- error message displays
- [ ] Recaptcha verifier creation fails -- error message displays
- [ ] OTP sending fails (network error) -- error message displays
- [ ] OTP sending fails (Firebase error) -- error message displays with details
- [ ] Enter OTP with less than 6 digits -- error message displays
- [ ] Enter OTP with more than 6 digits -- error message displays
- [ ] Enter OTP with non-digit characters -- validation should handle
- [ ] Enter invalid OTP -- error message displays
- [ ] Enter expired OTP -- error message displays
- [ ] Click Verify without sending OTP first -- error message displays
- [ ] Click Verify when confirmation result is null -- error message displays
- [ ] OTP verification fails (network error) -- error message displays
- [ ] localStorage is full when trying to store verification -- should handle gracefully
- [ ] localStorage is disabled -- should handle gracefully without crashing
- [ ] Recaptcha fails to load -- error message displays
- [ ] Multiple rapid clicks on Send OTP -- should debounce or prevent duplicate requests
- [ ] Multiple rapid clicks on Verify -- should prevent duplicate requests

### Navigation & Deep Links
- [ ] Direct navigation to /register -- loads Step 1
- [ ] Navigate to /register with existing verified state in localStorage -- skips to Step 2
- [ ] Navigate to /register with existing form data in localStorage -- restores form progress
- [ ] Refresh page during OTP entry -- OTP state and form data persist
- [ ] Navigate away during OTP process -- form data persists in localStorage
- [ ] Come back to /register after verification -- should show verified state

### Offline/No Internet Behavior
- [ ] Try to send OTP offline -- error message displays
- [ ] Try to verify OTP offline -- error message displays
- [ ] Form data persists in localStorage when offline
- [ ] Page renders correctly offline with cached data

### Performance Checkpoints
- [ ] OTP send request completes within 5 seconds
- [ ] OTP verification completes within 5 seconds
- [ ] Recaptcha loads without blocking UI
- [ ] Form validation is instant
- [ ] No memory leaks during OTP process

### Platform-Specific Behavior
- [ ] Mobile number input shows numeric keypad on mobile
- [ ] OTP input shows numeric keypad on mobile
- [ ] Recaptcha works on mobile browsers
- [ ] SMS OTP auto-fill works on supported mobile browsers
- [ ] Touch targets are appropriately sized on mobile

---

## Registration Flow - Step 2: Personal Details

### User Flows (Happy Paths)
- [ ] Fill all required fields and click Continue -- validates and proceeds to Step 3
- [ ] Select "Profile Created For" dropdown -- all options display correctly
- [ ] Select "Gender" dropdown -- all options display correctly
- [ ] Select "Marital Status" dropdown -- all options display correctly
- [ ] Select "Manglik Status" dropdown -- all options display correctly
- [ ] Select "Diet Preference" dropdown -- all options display correctly
- [ ] Enter valid date of birth -- age field auto-calculates correctly
- [ ] Age calculation is accurate for current date
- [ ] Enter height in cm format -- accepts input
- [ ] Enter height in ft format (e.g., 5'6") -- accepts input
- [ ] Enter weight in kg format -- accepts input
- [ ] Enter weight in lbs format -- accepts input
- [ ] Enter optional fields (time of birth, weight, sub-caste) -- accepts input
- [ ] Form data saves to localStorage on each field change
- [ ] Click Back button -- returns to Step 1
- [ ] Click step indicator to navigate to previous steps -- navigates correctly

### Edge Cases & Error States
- [ ] Leave "Profile Created For" empty -- validation error displays
- [ ] Leave "Full Name" empty -- validation error displays
- [ ] Enter full name with less than 2 characters -- validation error displays
- [ ] Leave "Gender" empty -- validation error displays
- [ ] Leave "Date of Birth" empty -- validation error displays
- [ ] Enter future date of birth -- validation should handle
- [ ] Enter very old date of birth (e.g., 1900) -- validation should handle
- [ ] Leave "Place of Birth" empty -- validation error displays
- [ ] Leave "Height" empty -- validation error displays
- [ ] Leave "Marital Status" empty -- validation error displays
- [ ] Leave "Manglik Status" empty -- validation error displays
- [ ] Leave "Religion" empty -- validation error displays
- [ ] Leave "Caste" empty -- validation error displays
- [ ] Leave "Mother Tongue" empty -- validation error displays
- [ ] Leave "Diet Preference" empty -- validation error displays
- [ ] Enter special characters in name field -- should accept or validate appropriately
- [ ] Enter extremely long name -- should handle gracefully
- [ ] Enter invalid date format -- browser date picker prevents this
- [ ] Age calculation returns negative or unrealistic values -- should handle
- [ ] Try to proceed without mobile verification -- cannot proceed to Step 2
- [ ] localStorage is full when saving form data -- should handle gracefully
- [ ] localStorage is disabled -- should handle gracefully without crashing

### Navigation & Deep Links
- [ ] Direct navigation to /register with step=2 in localStorage -- loads Step 2 with data
- [ ] Refresh page on Step 2 -- form data persists
- [ ] Navigate away and back to Step 2 -- form data persists
- [ ] Click step indicator for Step 1 -- navigates back with validation
- [ ] Click step indicator for Step 3 -- cannot proceed without completing Step 2

### Offline/No Internet Behavior
- [ ] Fill form fields offline -- data saves to localStorage
- [ ] Navigate between steps offline -- works with localStorage data
- [ ] Try to submit offline -- should show appropriate error

### Performance Checkpoints
- [ ] Form validation is instant on field blur
- [ ] Age calculation is instant on date change
- [ ] No lag when typing in fields
- [ ] localStorage writes don't block UI

### Platform-Specific Behavior
- [ ] Date picker works correctly on mobile
- [ ] Dropdowns are touch-friendly on mobile
- [ ] Form fields are appropriately sized on mobile
- [ ] Keyboard navigation works for all fields
- [ ] Screen reader announces field labels and errors correctly

---

## Registration Flow - Step 3: Family Details

### User Flows (Happy Paths)
- [ ] Fill all required fields and click Continue -- validates and proceeds to Step 4
- [ ] Enter father's name and occupation -- accepts input
- [ ] Enter mother's name and occupation -- accepts input
- [ ] Enter number of brothers -- accepts numeric input
- [ ] Enter number of sisters -- accepts numeric input
- [ ] Select "Family Type" dropdown -- all options display correctly
- [ ] Select "Family Values" dropdown -- all options display correctly
- [ ] Enter 0 for number of brothers/sisters -- accepts input
- [ ] Form data saves to localStorage on each field change
- [ ] Click Back button -- returns to Step 2
- [ ] Click step indicator to navigate to previous steps -- navigates correctly

### Edge Cases & Error States
- [ ] Leave "Father's Name" empty -- validation error displays
- [ ] Leave "Father's Occupation" empty -- validation error displays
- [ ] Leave "Mother's Name" empty -- validation error displays
- [ ] Leave "Mother's Occupation" empty -- validation error displays
- [ ] Leave "Number of Brothers" empty -- validation error displays
- [ ] Leave "Number of Sisters" empty -- validation error displays
- [ ] Enter negative number for brothers -- validation should handle
- [ ] Enter negative number for sisters -- validation should handle
- [ ] Enter extremely large number for siblings -- should handle gracefully
- [ ] Leave "Family Type" empty -- validation error displays
- [ ] Leave "Family Values" empty -- validation error displays
- [ ] Enter special characters in name fields -- should accept appropriately
- [ ] localStorage is full when saving form data -- should handle gracefully
- [ ] Try to proceed without completing Step 2 -- cannot proceed to Step 3

### Navigation & Deep Links
- [ ] Direct navigation to /register with step=3 in localStorage -- loads Step 3 with data
- [ ] Refresh page on Step 3 -- form data persists
- [ ] Navigate away and back to Step 3 -- form data persists
- [ ] Click step indicator for Step 2 -- navigates back with validation
- [ ] Click step indicator for Step 4 -- cannot proceed without completing Step 3

### Offline/No Internet Behavior
- [ ] Fill form fields offline -- data saves to localStorage
- [ ] Navigate between steps offline -- works with localStorage data

### Performance Checkpoints
- [ ] Form validation is instant on field blur
- [ ] No lag when typing in fields
- [ ] localStorage writes don't block UI

### Platform-Specific Behavior
- [ ] Numeric inputs show numeric keypad on mobile
- [ ] Dropdowns are touch-friendly on mobile
- [ ] Form fields are appropriately sized on mobile
- [ ] Keyboard navigation works for all fields

---

## Registration Flow - Step 4: Education & Career

### User Flows (Happy Paths)
- [ ] Fill all required fields and click Continue -- validates and proceeds to Step 5
- [ ] Enter highest qualification -- accepts input
- [ ] Enter college/university (optional) -- accepts input
- [ ] Enter occupation -- accepts input
- [ ] Enter company/business name (optional) -- accepts input
- [ ] Enter annual income (optional) -- accepts input
- [ ] Form data saves to localStorage on each field change
- [ ] Click Back button -- returns to Step 3
- [ ] Click step indicator to navigate to previous steps -- navigates correctly

### Edge Cases & Error States
- [ ] Leave "Highest Qualification" empty -- validation error displays
- [ ] Leave "Occupation" empty -- validation error displays
- [ ] Enter extremely long qualification name -- should handle gracefully
- [ ] Enter extremely long company name -- should handle gracefully
- [ ] Enter special characters in fields -- should accept appropriately
- [ ] Enter income in various formats (₹12,00,000, 1200000, 12 lakhs) -- should handle
- [ ] localStorage is full when saving form data -- should handle gracefully
- [ ] Try to proceed without completing Step 3 -- cannot proceed to Step 4

### Navigation & Deep Links
- [ ] Direct navigation to /register with step=4 in localStorage -- loads Step 4 with data
- [ ] Refresh page on Step 4 -- form data persists
- [ ] Navigate away and back to Step 4 -- form data persists
- [ ] Click step indicator for Step 3 -- navigates back with validation
- [ ] Click step indicator for Step 5 -- cannot proceed without completing Step 4

### Offline/No Internet Behavior
- [ ] Fill form fields offline -- data saves to localStorage
- [ ] Navigate between steps offline -- works with localStorage data

### Performance Checkpoints
- [ ] Form validation is instant on field blur
- [ ] No lag when typing in fields
- [ ] localStorage writes don't block UI

### Platform-Specific Behavior
- [ ] Form fields are appropriately sized on mobile
- [ ] Keyboard navigation works for all fields

---

## Registration Flow - Step 5: Residence

### User Flows (Happy Paths)
- [ ] Fill all required fields and click Continue -- validates and proceeds to Step 6
- [ ] Enter country -- accepts input
- [ ] Enter state -- accepts input
- [ ] Enter city/village -- accepts input
- [ ] Enter current residence address -- accepts input in textarea
- [ ] Privacy note displays about address remaining private
- [ ] Form data saves to localStorage on each field change
- [ ] Click Back button -- returns to Step 4
- [ ] Click step indicator to navigate to previous steps -- navigates correctly

### Edge Cases & Error States
- [ ] Leave "Country" empty -- validation error displays
- [ ] Leave "State" empty -- validation error displays
- [ ] Leave "City/Village" empty -- validation error displays
- [ ] Leave "Current Residence Address" empty -- validation error displays
- [ ] Enter extremely long address -- should handle gracefully
- [ ] Enter special characters in address -- should accept appropriately
- [ ] Enter multiline address -- textarea handles correctly
- [ ] localStorage is full when saving form data -- should handle gracefully
- [ ] Try to proceed without completing Step 4 -- cannot proceed to Step 5

### Navigation & Deep Links
- [ ] Direct navigation to /register with step=5 in localStorage -- loads Step 5 with data
- [ ] Refresh page on Step 5 -- form data persists
- [ ] Navigate away and back to Step 5 -- form data persists
- [ ] Click step indicator for Step 4 -- navigates back with validation
- [ ] Click step indicator for Step 6 -- cannot proceed without completing Step 5

### Offline/No Internet Behavior
- [ ] Fill form fields offline -- data saves to localStorage
- [ ] Navigate between steps offline -- works with localStorage data

### Performance Checkpoints
- [ ] Form validation is instant on field blur
- [ ] No lag when typing in fields
- [ ] localStorage writes don't block UI

### Platform-Specific Behavior
- [ ] Textarea is appropriately sized on mobile
- [ ] Keyboard navigation works for all fields
- [ ] Address field handles multiline input correctly on mobile

---

## Registration Flow - Step 6: Photos

### User Flows (Happy Paths)
- [ ] Click "Add photos" button -- file picker opens
- [ ] Drag and drop photos into dropzone -- photos upload successfully
- [ ] Select multiple photos at once -- all photos upload
- [ ] Upload 1 photo -- photo displays in preview grid
- [ ] Upload 5 photos (maximum) -- all photos display
- [ ] Photos are compressed automatically during upload
- [ ] Upload progress shows for each photo
- [ ] Click "Crop" button on a photo -- crop modal opens
- [ ] Adjust zoom slider in crop modal -- preview updates
- [ ] Click "Apply Crop" -- photo is cropped and updated
- [ ] Click "Cancel" in crop modal -- modal closes without changes
- [ ] Click "Remove" button on a photo -- photo is removed
- [ ] Click "Close" in crop modal -- modal closes
- [ ] After uploading at least 1 photo, click Continue -- proceeds to Step 7
- [ ] Photo previews display correctly in grid
- [ ] Form data saves to localStorage on photo change
- [ ] Click Back button -- returns to Step 5

### Edge Cases & Error States
- [ ] Try to upload more than 5 photos -- only first 5 are accepted
- [ ] Try to upload non-image file -- file is rejected
- [ ] Try to upload very large image (>10MB) -- compression should handle
- [ ] Try to upload corrupted image file -- error should display
- [ ] Image compression fails -- original image should be used
- [ ] FileReader fails to convert image to data URL -- error should display
- [ ] Try to proceed without uploading any photos -- cannot proceed to Step 7
- [ ] Try to crop photo when canvas context is unavailable -- error should display
- [ ] Try to apply crop with invalid zoom -- should handle gracefully
- [ ] Canvas to blob conversion fails -- error should display
- [ ] localStorage is full when saving photo data -- should handle gracefully
- [ ] Photo data URL is too large for localStorage -- should handle gracefully
- [ ] Drag and drop non-image files -- files are rejected
- [ ] Drop files outside dropzone -- nothing happens
- [ ] Upload photos with very long filenames -- should handle gracefully
- [ ] Upload photos with special characters in filename -- should handle gracefully
- [ ] Try to proceed without completing Step 5 -- cannot proceed to Step 6

### Navigation & Deep Links
- [ ] Direct navigation to /register with step=6 in localStorage -- loads Step 6 with photos
- [ ] Refresh page on Step 6 -- photos persist from localStorage
- [ ] Navigate away and back to Step 6 -- photos persist
- [ ] Click step indicator for Step 5 -- navigates back with validation
- [ ] Click step indicator for Step 7 -- cannot proceed without uploading photos

### Offline/No Internet Behavior
- [ ] Upload photos offline -- photos compress and save to localStorage
- [ ] Navigate between steps offline -- photos persist in localStorage
- [ ] Try to submit with photos offline -- should show appropriate error

### Performance Checkpoints
- [ ] Photo compression completes within 3 seconds per photo
- [ ] Photo preview renders quickly
- [ ] No lag when dragging and dropping multiple photos
- [ ] Crop modal opens and closes smoothly
- [ ] Crop preview updates in real-time when zooming
- [ ] Memory usage remains stable with multiple photos
- [ ] Large photos don't block UI during compression
- [ ] localStorage writes for photos don't block UI

### Platform-Specific Behavior
- [ ] File picker works correctly on mobile
- [ ] Camera option available on mobile for photo capture
- [ ] Drag and drop works on touch devices
- [ ] Photo previews are appropriately sized on mobile
- [ ] Crop modal is responsive on mobile
- [ ] Zoom slider is touch-friendly on mobile
- [ ] Photo compression works on mobile browsers

---

## Registration Flow - Step 7: Partner Preferences

### User Flows (Happy Paths)
- [ ] Fill optional preference fields and click Continue -- proceeds to Step 8
- [ ] Select "Preferred Gender" dropdown -- all options display correctly
- [ ] Leave all preference fields empty -- proceeds to Step 8 (all optional)
- [ ] Enter preferred age range -- accepts input
- [ ] Enter preferred height range -- accepts input
- [ ] Enter preferred religion -- accepts input
- [ ] Enter preferred caste -- accepts input
- [ ] Enter preferred location -- accepts input
- [ ] Form data saves to localStorage on each field change
- [ ] Click Back button -- returns to Step 6
- [ ] Click step indicator to navigate to previous steps -- navigates correctly

### Edge Cases & Error States
- [ ] Enter invalid age range format -- should handle gracefully
- [ ] Enter invalid height range format -- should handle gracefully
- [ ] Enter special characters in preference fields -- should accept appropriately
- [ ] Enter extremely long preference values -- should handle gracefully
- [ ] localStorage is full when saving form data -- should handle gracefully
- [ ] Try to proceed without completing Step 6 -- cannot proceed to Step 7

### Navigation & Deep Links
- [ ] Direct navigation to /register with step=7 in localStorage -- loads Step 7 with data
- [ ] Refresh page on Step 7 -- form data persists
- [ ] Navigate away and back to Step 7 -- form data persists
- [ ] Click step indicator for Step 6 -- navigates back with validation
- [ ] Click step indicator for Step 8 -- can proceed (all fields optional)

### Offline/No Internet Behavior
- [ ] Fill form fields offline -- data saves to localStorage
- [ ] Navigate between steps offline -- works with localStorage data

### Performance Checkpoints
- [ ] Form validation is instant on field blur
- [ ] No lag when typing in fields
- [ ] localStorage writes don't block UI

### Platform-Specific Behavior
- [ ] Form fields are appropriately sized on mobile
- [ ] Keyboard navigation works for all fields

---

## Registration Flow - Step 8: Review & Submit

### User Flows (Happy Paths)
- [ ] Review page displays all entered information correctly
- [ ] Personal summary card shows correct data from Step 2
- [ ] Family details card shows correct data from Step 3
- [ ] Education & career card shows correct data from Step 4
- [ ] Residence card shows correct data from Step 5
- [ ] Partner preferences card shows correct data from Step 7
- [ ] Enter password (min 6 characters) -- accepts input
- [ ] Check "I confirm that all information provided is accurate" -- checkbox is checked
- [ ] Check "I agree to the Privacy Policy and Terms & Conditions" -- checkbox is checked
- [ ] Click "Submit Profile" -- payment flow initiates
- [ ] Razorpay checkout opens successfully
- [ ] Complete payment successfully -- profile submits to API
- [ ] After successful submission, redirect to /dashboard
- [ ] localStorage stores vardhman_user with profile data
- [ ] localStorage stores vardhman_paid = true
- [ ] localStorage stores vardhman_profile_submitted with profile data
- [ ] localStorage clears vardhman_matrimonial_registration (form draft)
- [ ] Submit button shows "Processing..." during submission
- [ ] Submit button is disabled during submission
- [ ] Click Back button -- returns to Step 7

### Edge Cases & Error States
- [ ] Try to submit without entering password -- validation error displays
- [ ] Enter password with less than 6 characters -- validation error displays
- [ ] Try to submit without checking accuracy checkbox -- error message displays
- [ ] Try to submit without checking privacy checkbox -- error message displays
- [ ] Try to submit without mobile verification -- error message displays and redirects to Step 1
- [ ] Try to submit without photos -- error message displays and redirects to Step 6
- [ ] Payment API fails to create order -- error message displays
- [ ] Razorpay checkout fails to load -- error message displays
- [ ] Razorpay script fails to load -- error message displays
- [ ] User cancels payment in Razorpay -- should handle gracefully
- [ ] Payment fails in Razorpay -- error message displays
- [ ] Register API fails after payment -- error message displays
- [ ] Register API returns error response -- error message displays
- [ ] Firebase ID token is invalid or expired -- error message displays
- [ ] Payment signature verification fails -- API returns 401 error
- [ ] Supabase insert fails -- error message displays
- [ ] localStorage is full when saving user data -- should handle gracefully
- [ ] localStorage is disabled -- should handle gracefully without crashing
- [ ] Network error during payment order creation -- error message displays
- [ ] Network error during profile submission -- error message displays
- [ ] Review cards show "-" for missing optional fields
- [ ] Review cards show "Not specified" for missing optional fields
- [ ] Try to proceed without completing Step 7 -- cannot proceed to Step 8

### Navigation & Deep Links
- [ ] Direct navigation to /register with step=8 in localStorage -- loads Step 8 with data
- [ ] Refresh page on Step 8 -- form data persists
- [ ] Navigate away and back to Step 8 -- form data persists
- [ ] Click step indicator for Step 7 -- navigates back with validation
- [ ] Click step indicator for earlier steps -- navigates with validation

### Offline/No Internet Behavior
- [ ] Try to submit offline -- payment order creation fails with error
- [ ] Form data persists in localStorage when offline
- [ ] Review page displays correctly offline

### Performance Checkpoints
- [ ] Review page renders quickly with all data
- [ ] Payment order creation completes within 5 seconds
- [ ] Razorpay checkout loads within 3 seconds
- [ ] Profile submission completes within 5 seconds
- [ ] No lag when checking checkboxes
- [ ] Submit button state updates immediately

### Platform-Specific Behavior
- [ ] Razorpay checkout is responsive on mobile
- [ ] Payment flow works on mobile browsers
- [ ] Checkboxes are touch-friendly on mobile
- [ ] Password field shows/hide toggle on mobile
- [ ] Review cards are readable on mobile screens

---

## Registration Flow - General

### User Flows (Happy Paths)
- [ ] Complete all 8 steps in sequence -- successful registration
- [ ] Navigate between steps using Back/Continue buttons -- works correctly
- [ ] Navigate between steps using step indicators -- works correctly with validation
- [ ] Form data persists across page refreshes
- [ ] Form data persists across browser sessions (localStorage)
- [ ] Form progress bar updates correctly on each step
- [ ] Step labels highlight current step
- [ ] Step labels show completion status
- [ ] Form animations play smoothly between steps
- [ ] Form validation errors display below relevant fields
- [ ] Form validation errors clear when field is corrected
- [ ] Form draft saves automatically to localStorage
- [ ] Form draft is cleared after successful submission

### Edge Cases & Error States
- [ ] Try to skip steps by clicking step indicators -- validation prevents
- [ ] Try to proceed with invalid data in current step -- validation prevents
- [ ] localStorage contains draft from previous session -- draft is restored
- [ ] localStorage draft is corrupted -- should handle gracefully
- [ ] localStorage draft is from different user -- should handle appropriately
- [ ] Form schema validation fails unexpectedly -- should handle gracefully
- [ ] React Hook Form throws error -- should handle gracefully
- [ ] Zod validation throws error -- should handle gracefully
- [ ] Framer Motion animation fails -- should not block form functionality
- [ ] Multiple rapid clicks on Continue -- should prevent duplicate navigation
- [ ] Multiple rapid clicks on Back -- should prevent duplicate navigation
- [ ] Browser back button during form fill -- should warn or handle gracefully
- [ ] Tab close during form fill -- data persists in localStorage
- [ ] Session timeout during form fill -- data persists in localStorage

### Navigation & Deep Links
- [ ] Direct navigation to any step with valid localStorage data -- loads step with data
- [ ] Direct navigation to any step without valid localStorage data -- redirects to Step 1
- [ ] Browser back button during multi-step form -- handles correctly
- [ ] Browser forward button during multi-step form -- handles correctly
- [ ] Deep link to /register from external site -- loads Step 1

### Offline/No Internet Behavior
- [ ] Fill entire form offline -- all data saves to localStorage
- [ ] Navigate all steps offline -- works with localStorage data
- [ ] Try to submit offline -- payment fails with appropriate error
- [ ] Come back online with completed form -- can submit successfully

### Performance Checkpoints
- [ ] Step transitions are smooth (300ms animation)
- [ ] Form validation doesn't block UI
- [ ] localStorage saves don't block UI
- [ ] No memory leaks during form navigation
- [ ] Form renders quickly on initial load
- [ ] Form re-renders are optimized

### Platform-Specific Behavior
- [ ] Form is fully responsive on all screen sizes
- [ ] Touch targets are appropriately sized on mobile
- [ ] Keyboard navigation works for all form elements
- [ ] Screen reader announces all form errors correctly
- [ ] Form works with screen reader navigation
- [ ] High contrast mode maintains form readability
- [ ] Reduced motion preference disables animations

---

## Registration Success Page

### User Flows (Happy Paths)
- [ ] Load success page after successful registration -- page displays correctly
- [ ] Success message displays with checkmark icon
- [ ] Description text displays correctly
- [ ] Click "Return Home" button -- navigates to /
- [ ] Click "Browse Profiles" button -- navigates to /profiles
- [ ] Page styling matches overall design

### Edge Cases & Error States
- [ ] Direct navigation to /register/success without completing registration -- should redirect or show appropriate state
- [ ] Navigate to success page with localStorage cleared -- should handle gracefully

### Navigation & Deep Links
- [ ] Direct navigation to /register/success -- page loads
- [ ] Browser back button from success page -- navigates correctly

### Offline/No Internet Behavior
- [ ] Load success page offline -- page displays correctly

### Performance Checkpoints
- [ ] Page loads instantly
- [ ] No unnecessary API calls

### Platform-Specific Behavior
- [ ] Page is responsive on mobile
- [ ] Buttons are touch-friendly on mobile

---

## Dashboard Page

### User Flows (Happy Paths)
- [ ] Load dashboard after successful registration -- displays user profile
- [ ] User's full name displays correctly
- [ ] User's mobile number displays correctly
- [ ] User's status displays correctly
- [ ] Click "Create account" link when no user data -- navigates to /register
- [ ] Dashboard displays correctly when user is logged in
- [ ] Dashboard shows "-" for missing fields

### Edge Cases & Error States
- [ ] Load dashboard without user data in localStorage -- shows "No user data found" message
- [ ] localStorage contains corrupted profile data -- should handle gracefully
- [ ] localStorage profile data is missing required fields -- should display available data
- [ ] Full name is not a string -- displays "-"
- [ ] Mobile number is not a string -- displays "-"
- [ ] Status is not a string -- displays "Active"
- [ ] localStorage is disabled -- should handle gracefully without crashing
- [ ] Try to access dashboard without payment -- should redirect or show appropriate state

### Navigation & Deep Links
- [ ] Direct navigation to /dashboard with valid user data -- loads dashboard
- [ ] Direct navigation to /dashboard without user data -- shows no data message
- [ ] Refresh page on dashboard -- user data persists
- [ ] Navigate away and back to dashboard -- user data persists

### Offline/No Internet Behavior
- [ ] Load dashboard offline -- displays cached user data
- [ ] Dashboard functions correctly offline

### Performance Checkpoints
- [ ] Dashboard loads quickly
- [ ] No unnecessary API calls
- [ ] localStorage reads don't block UI

### Platform-Specific Behavior
- [ ] Dashboard is responsive on mobile
- [ ] User data is readable on mobile screens

---

## Profiles Page

### User Flows (Happy Paths)
- [ ] Load profiles page after payment -- displays sample profiles
- [ ] Profile 1 displays with correct information
- [ ] Profile 2 displays with correct information
- [ ] Click "Back to Home" button when not paid -- navigates to /
- [ ] Click "Continue Registration" button when not paid -- navigates to /register
- [ ] Page displays correctly when user has paid

### Edge Cases & Error States
- [ ] Load profiles page without payment -- shows payment required message
- [ ] localStorage contains invalid paid status -- should handle gracefully
- [ ] localStorage paid status is "false" -- shows payment required message
- [ ] localStorage is disabled -- should handle gracefully without crashing
- [ ] localStorage is empty -- shows payment required message
- [ ] Page shows loading state while checking payment status

### Navigation & Deep Links
- [ ] Direct navigation to /profiles with paid=true -- displays profiles
- [ ] Direct navigation to /profiles with paid=false -- shows payment required
- [ ] Direct navigation to /profiles without localStorage -- shows payment required
- [ ] Refresh page on profiles -- payment status persists
- [ ] Navigate away and back to profiles -- payment status persists

### Offline/No Internet Behavior
- [ ] Load profiles page offline -- displays based on localStorage
- [ ] Payment check works offline (localStorage only)

### Performance Checkpoints
- [ ] Page loads quickly
- [ ] Payment status check is instant
- [ ] No unnecessary API calls

### Platform-Specific Behavior
- [ ] Page is responsive on mobile
- [ ] Profile cards are readable on mobile
- [ ] Buttons are touch-friendly on mobile

---

## API - Payment Route (/api/payment)

### User Flows (Happy Paths)
- [ ] POST request with valid amount and currency -- creates Razorpay order successfully
- [ ] Response includes order object with amount, currency, id
- [ ] Response includes keyId for Razorpay checkout
- [ ] Order creation with default amount (25000 INR) -- works correctly
- [ ] Order creation with custom amount -- works correctly
- [ ] Razorpay API call succeeds -- returns 201 status

### Edge Cases & Error States
- [ ] Missing RAZORPAY_KEY_ID env var -- returns 500 error with message
- [ ] Missing RAZORPAY_KEY_SECRET env var -- returns 500 error with message
- [ ] Request body is missing -- returns 500 error
- [ ] Request body is invalid JSON -- returns 500 error
- [ ] Amount is not a number -- uses default 25000
- [ ] Amount is negative -- Razorpay API should reject
- [ ] Currency is not provided -- defaults to INR
- [ ] Razorpay API returns error -- returns error with appropriate status
- [ ] Razorpay API is down -- returns 500 error
- [ ] Network error calling Razorpay -- returns 500 error
- [ ] Authorization header generation fails -- returns 500 error

### Performance Checkpoints
- [ ] API response time < 2 seconds
- [ ] No memory leaks in request handling
- [ ] Proper error logging for diagnostics

### Security Considerations
- [ ] Razorpay credentials are never exposed in response
- [ ] Request validation prevents injection attacks
- [ ] Rate limiting is considered (if implemented)

---

## API - Register Route (/api/register)

### User Flows (Happy Paths)
- [ ] POST request with valid idToken, values, payment -- creates profile successfully
- [ ] Firebase ID token verification succeeds
- [ ] Razorpay signature verification succeeds
- [ ] Profile data is inserted into Supabase successfully
- [ ] Response includes created profile object
- [ ] Response returns 201 status
- [ ] User ID from Firebase token is used as profile ID
- [ ] Mobile number from Firebase token or values is used
- [ ] Created timestamp is added to profile
- [ ] All form values are stored in profile

### Edge Cases & Error States
- [ ] Missing idToken in request body -- returns 400 error
- [ ] Missing payment object in request body -- returns 400 error
- [ ] Missing razorpay_order_id in payment -- returns 400 error
- [ ] Missing razorpay_payment_id in payment -- returns 400 error
- [ ] Missing razorpay_signature in payment -- returns 400 error
- [ ] Missing RAZORPAY_KEY_SECRET env var -- returns 500 error
- [ ] Request body is missing -- returns 500 error
- [ ] Request body is invalid JSON -- returns 500 error
- [ ] Firebase ID token is invalid -- returns 401 error
- [ ] Firebase ID token is expired -- returns 401 error
- [ ] Firebase ID token verification fails -- returns 401 error
- [ ] Firebase user has no UID -- returns 401 error
- [ ] Razorpay signature verification fails -- returns 401 error
- [ ] Razorpay signature mismatch -- returns 401 error
- [ ] Missing FIREBASE_SERVICE_ACCOUNT env var -- throws error
- [ ] FIREBASE_SERVICE_ACCOUNT is invalid JSON -- throws error
- [ ] FIREBASE_SERVICE_ACCOUNT is invalid base64 -- throws error
- [ ] Firebase Admin initialization fails -- throws error
- [ ] Missing SUPABASE_URL env var -- throws error
- [ ] Missing SUPABASE_SERVICE_ROLE_KEY env var -- throws error
- [ ] Supabase client creation fails -- throws error
- [ ] Supabase insert fails -- returns 500 error with message
- [ ] Supabase connection error -- returns 500 error
- [ ] Profile data is too large for Supabase -- returns 500 error
- [ ] Network error during Supabase insert -- returns 500 error
- [ ] Duplicate profile insertion -- Supabase should handle based on constraints

### Performance Checkpoints
- [ ] API response time < 3 seconds
- [ ] Firebase token verification is fast
- [ ] Signature verification is fast
- [ ] Supabase insert completes quickly
- [ ] No memory leaks in request handling

### Security Considerations
- [ ] Payment signature verification prevents tampering
- [ ] Firebase token verification prevents unauthorized access
- [ ] Service role key is never exposed in response
- [ ] User data is validated before storage
- [ ] SQL injection is prevented by Supabase client
- [ ] Rate limiting is considered (if implemented)

---

## Firebase Client Integration

### User Flows (Happy Paths)
- [ ] Firebase client initializes with valid env vars -- returns Auth instance
- [ ] Firebase client initializes on first call -- subsequent calls reuse instance
- [ ] Recaptcha verifier creates successfully -- returns verifier instance
- [ ] Recaptcha verifier clears previous instance -- no duplicate verifiers
- [ ] OTP is sent successfully with valid phone number
- [ ] OTP is verified successfully with valid code
- [ ] User is authenticated after OTP verification
- [ ] ID token is retrieved after authentication

### Edge Cases & Error States
- [ ] Missing NEXT_PUBLIC_FIREBASE_API_KEY env var -- returns null
- [ ] Missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN env var -- returns null
- [ ] Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID env var -- returns null
- [ ] Missing NEXT_PUBLIC_FIREBASE_APP_ID env var -- returns null
- [ ] Firebase app already initialized -- reuses existing app
- [ ] Recaptcha verifier creation fails -- returns null
- [ ] Recaptcha verifier clear fails -- catches and ignores error
- [ ] Window is undefined (SSR) -- returns null for verifier
- [ ] Multiple verifier creations -- clears previous before creating new
- [ ] OTP sending fails (network) -- error is caught and displayed
- [ ] OTP sending fails (Firebase error) -- error is caught and displayed
- [ ] OTP verification fails (invalid code) -- error is caught and displayed
- [ ] OTP verification fails (expired) -- error is caught and displayed
- [ ] ID token retrieval fails -- error is caught and displayed

### Performance Checkpoints
- [ ] Firebase initialization is fast
- [ ] Recaptcha verifier creation doesn't block UI
- [ ] OTP sending doesn't block UI
- [ ] OTP verification doesn't block UI

### Platform-Specific Behavior
- [ ] Firebase works on mobile browsers
- [ ] Recaptcha works on mobile browsers
- [ ] SMS OTP works on mobile devices

---

## Firebase Admin Integration

### User Flows (Happy Paths)
- [ ] Firebase Admin initializes with valid service account -- returns admin instance
- [ ] Firebase Admin initializes on first call -- subsequent calls reuse instance
- [ ] Service account is valid JSON -- parses correctly
- [ ] Service account is valid base64 -- decodes and parses correctly
- [ ] ID token verification succeeds with valid token
- [ ] User UID is extracted from verified token
- [ ] Phone number is extracted from verified token

### Edge Cases & Error States
- [ ] Missing FIREBASE_SERVICE_ACCOUNT env var -- throws error
- [ ] FIREBASE_SERVICE_ACCOUNT is invalid JSON -- throws error
- [ ] FIREBASE_SERVICE_ACCOUNT is invalid base64 -- throws error
- [ ] FIREBASE_SERVICE_ACCOUNT is malformed JSON -- throws error
- [ ] Firebase Admin already initialized -- reuses existing instance
- [ ] ID token is null or undefined -- throws error
- [ ] ID token is invalid -- verification throws error
- [ ] ID token is expired -- verification throws error
- [ ] ID token has no UID -- returns null for UID
- [ ] ID token has no phone_number -- uses values.mobileNumber

### Performance Checkpoints
- [ ] Firebase Admin initialization is fast
- [ ] ID token verification is fast
- [ ] No memory leaks from repeated initializations

### Security Considerations
- [ ] Service account key is never exposed in responses
- [ ] Service account key is stored securely in env vars
- [ ] Admin instance is reused to prevent memory leaks

---

## Supabase Integration

### User Flows (Happy Paths)
- [ ] Supabase client initializes with valid env vars -- returns client instance
- [ ] Supabase client initializes on first call -- subsequent calls reuse instance
- [ ] Profile insert succeeds with valid data
- [ ] Profile insert returns no error
- [ ] Service role key is used for elevated permissions

### Edge Cases & Error States
- [ ] Missing SUPABASE_URL env var -- throws error
- [ ] Missing SUPABASE_SERVICE_ROLE_KEY env var -- throws error
- [ ] SUPABASE_URL is invalid -- client creation may fail
- [ ] SUPABASE_SERVICE_ROLE_KEY is invalid -- client creation may fail
- [ ] Supabase connection fails -- insert throws error
- [ ] Supabase table doesn't exist -- insert throws error
- [ ] Profile data violates constraints -- insert throws error
- [ ] Network error during insert -- insert throws error
- [ ] Supabase is down -- insert throws error

### Performance Checkpoints
- [ ] Supabase client initialization is fast
- [ ] Profile insert completes quickly
- [ ] No memory leaks from repeated client creations

### Security Considerations
- [ ] Service role key is never exposed in responses
- [ ] Service role key is stored securely in env vars
- [ ] Client instance is reused to prevent memory leaks
- [ ] Session persistence is disabled for server-side use

---

## Engagement Frame Player Component

### User Flows (Happy Paths)
- [ ] Component mounts with default props -- animation loads and plays
- [ ] Component mounts with custom frameCount -- loads correct number of frames
- [ ] Component mounts with custom basePath -- loads frames from correct path
- [ ] Component mounts with custom framePrefix -- loads frames with correct prefix
- [ ] Component mounts with custom frameNumberPadding -- loads frames with correct padding
- [ ] Component mounts with custom fps -- plays at correct frame rate
- [ ] Component mounts with custom durationSeconds -- plays for correct duration
- [ ] Component mounts with fit="contain" -- frames scale to contain
- [ ] Component mounts with fit="cover" -- frames scale to cover
- [ ] All frames preload successfully -- animation plays smoothly
- [ ] Animation loops continuously -- frames cycle from end to start
- [ ] Canvas resizes on container resize -- animation scales correctly
- [ ] Device pixel ratio is handled -- animation is sharp on high DPI screens
- [ ] onLoadComplete callback fires after frames load
- [ ] onLoadError callback fires on frame load failure

### Edge Cases & Error States
- [ ] Frame images fail to load -- onLoadError callback fires
- [ ] Some frames fail to load -- should handle gracefully
- [ ] basePath is invalid -- frames fail to load
- [ ] frameCount is 0 or negative -- should handle gracefully
- [ ] frameCount is very large (>500) -- should handle memory gracefully
- [ ] fps is 0 or negative -- should handle gracefully
- [ ] fps is very high (>60) -- may impact performance
- [ ] durationSeconds is 0 or negative -- should handle gracefully
- [ ] Canvas 2D context is unavailable -- onLoadError callback fires
- [ ] createImageBitmap is not supported -- falls back to Image
- [ ] ImageBitmap creation fails -- falls back to Image
- [ ] Image decode fails -- continues with loaded image
- [ ] Component unmounts during preload -- aborts preload
- [ ] Component unmounts during playback -- cleans up resources
- [ ] Container is not available -- should handle gracefully
- [ ] ResizeObserver is not supported -- should handle gracefully
- [ ] RequestAnimationFrame is not available -- should handle gracefully
- [ ] Frame URLs are malformed -- frames fail to load
- [ ] Network is slow -- frames load progressively
- [ ] Network fails during preload -- onLoadError callback fires

### Performance Checkpoints
- [ ] Frame preloading doesn't block main thread
- [ ] Animation plays at target FPS (24 FPS by default)
- [ ] Memory usage is stable during playback
- [ ] No memory leaks when component unmounts
- [ ] Frame disposal frees memory correctly
- [ ] Canvas resizing doesn't cause layout thrashing
- [ ] ImageBitmap reduces memory usage when available
- [ ] Animation is smooth on low-end devices

### Platform-Specific Behavior
- [ ] Animation plays on mobile browsers
- [ ] Animation plays on desktop browsers
- [ ] Canvas is responsive on all screen sizes
- [ ] High DPI screens render sharp animation
- [ ] Touch devices handle canvas correctly
- [ ] Reduced motion preference is respected (if implemented)

---

## Authentication & Session Management

### User Flows (Happy Paths)
- [ ] User completes mobile verification -- session stored in localStorage
- [ ] User completes registration -- user data stored in localStorage
- [ ] User completes payment -- paid status stored in localStorage
- [ ] User logs out -- all session data cleared from localStorage
- [ ] Session persists across page refreshes
- [ ] Session persists across browser restarts
- [ ] Session persists across tab closes
- [ ] Header updates when session changes
- [ ] Navigation redirects based on session state

### Edge Cases & Error States
- [ ] localStorage is disabled -- app should handle gracefully
- [ ] localStorage is full -- writes should fail gracefully
- [ ] localStorage contains corrupted data -- should handle gracefully
- [ ] localStorage contains invalid JSON -- should handle gracefully
- [ ] Session data is partially missing -- should handle gracefully
- [ ] Session expires -- should handle appropriately
- [ ] Multiple tabs have different session states -- should handle appropriately
- [ ] Session is cleared externally -- app should update
- [ ] Concurrent writes to localStorage -- should handle race conditions

### Security Considerations
- [ ] ID token is stored in localStorage (consider security implications)
- [ ] User data is stored in localStorage (consider security implications)
- [ ] No sensitive data should be exposed in client-side storage
- [ ] Session data is validated before use

---

## Navigation & Routing

### User Flows (Happy Paths)
- [ ] Navigate between all pages using Link components -- works correctly
- [ ] Browser back button works correctly -- navigates to previous page
- [ ] Browser forward button works correctly -- navigates to next page
- [ ] Direct URL navigation works -- loads correct page
- [ ] Refresh on any page -- page reloads correctly
- [ ] Navigation preserves scroll position where appropriate
- [ ] Navigation doesn't cause unnecessary full page reloads

### Edge Cases & Error States
- [ ] Navigate to invalid route -- should show 404 or appropriate error
- [ ] Navigate with invalid query params -- should handle gracefully
- [ ] Browser history manipulation -- should handle gracefully
- [ ] Navigation during form submission -- should warn or prevent
- [ ] Rapid navigation clicks -- should handle gracefully

### Performance Checkpoints
- [ ] Page transitions are instant (client-side routing)
- [ ] No unnecessary page reloads
- [ ] Navigation doesn't block UI

---

## Responsive Design

### User Flows (Happy Paths)
- [ ] Desktop view (1920x1080) -- layout displays correctly
- [ ] Laptop view (1366x768) -- layout displays correctly
- [ ] Tablet view (768x1024) -- layout displays correctly
- [ ] Mobile view (375x667) -- layout displays correctly
- [ ] Small mobile view (320x568) -- layout displays correctly
- [ ] Layout adapts smoothly between breakpoints
- [ ] Text is readable at all sizes
- [ ] Buttons are tappable at all sizes
- [ ] Form fields are usable at all sizes

### Edge Cases & Error States
- [ ] Very large screen (2560x1440) -- layout should handle gracefully
- [ ] Very small screen (240x320) -- layout should handle gracefully
- [ ] Orientation change (portrait to landscape) -- layout adapts correctly
- [ ] Dynamic font size changes -- layout adapts correctly
- [ ] Zoom in/out -- layout remains usable

### Platform-Specific Behavior
- [ ] Touch interactions work on mobile
- [ ] Hover states work on desktop
- [ ] Keyboard navigation works on desktop
- [ ] Gestures work on touch devices

---

## Accessibility

### User Flows (Happy Paths)
- [ ] Screen reader announces page title correctly
- [ ] Screen reader announces all interactive elements
- [ ] Screen reader announces form errors correctly
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible for keyboard users
- [ ] Color contrast meets WCAG AA standards
- [ ] Text alternatives are provided for images
- [ ] ARIA labels are used where appropriate
- [ ] Form fields have associated labels
- [ ] Error messages are associated with form fields

### Edge Cases & Error States
- [ ] Screen reader encounters dynamic content -- should announce changes
- [ ] Keyboard user encounters modal -- should trap focus appropriately
- [ ] High contrast mode is enabled -- should remain readable
- [ ] Reduced motion preference is enabled -- animations should be disabled
- [ ] Text size is increased -- layout should remain usable

---

## Error Handling

### User Flows (Happy Paths)
- [ ] API errors display user-friendly messages
- [ ] Validation errors display inline with fields
- [ ] Network errors display appropriate messages
- [ ] Errors don't cause app to crash
- [ ] Errors provide context for resolution

### Edge Cases & Error States
- [ ] Multiple errors occur simultaneously -- should display appropriately
- [ ] Error messages are very long -- should handle gracefully
- [ ] Error occurs during error handling -- should not cause infinite loop
- [ ] Error boundary catches React errors -- should show fallback UI

---

## Cross-Browser Compatibility

### User Flows (Happy Paths)
- [ ] App works in Chrome -- all features functional
- [ ] App works in Firefox -- all features functional
- [ ] App works in Safari -- all features functional
- [ ] App works in Edge -- all features functional
- [ ] App works in mobile Safari (iOS) -- all features functional
- [ ] App works in mobile Chrome (Android) -- all features functional

### Edge Cases & Error States
- [ ] App works in older browsers -- should degrade gracefully
- [ ] Feature detection for unsupported features -- should provide fallbacks
- [ ] Polyfills are loaded if needed -- should work correctly

---

## Data Validation

### User Flows (Happy Paths)
- [ ] All required fields are validated -- errors display for missing fields
- [ ] Field formats are validated (email, phone, etc.) -- errors display for invalid formats
- [ ] Field lengths are validated -- errors display for too long/short fields
- [ ] Zod schema validates all form data -- validation works correctly
- [ ] React Hook Form triggers validation on submit -- validation works correctly
- [ ] React Hook Form triggers validation on blur -- validation works correctly

### Edge Cases & Error States
- [ ] User enters SQL injection attempts -- should be sanitized
- [ ] User enters XSS attempts -- should be sanitized
- [ ] User enters very long strings -- should be handled gracefully
- [ ] User enters special characters -- should be accepted or validated appropriately
- [ ] Schema validation fails unexpectedly -- should handle gracefully

---

## Performance Optimization

### Performance Checkpoints
- [ ] Initial page load < 3 seconds on 3G
- [ ] Time to Interactive < 5 seconds
- [ ] First Contentful Paint < 2 seconds
- [ ] Largest Contentful Paint < 3 seconds
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms
- [ ] Total Blocking Time < 300ms
- [ ] Lighthouse performance score > 80
- [ ] Lighthouse accessibility score > 90
- [ ] Lighthouse best practices score > 90
- [ ] Lighthouse SEO score > 90
- [ ] Bundle size is optimized
- [ ] Images are optimized and compressed
- [ ] Code splitting is implemented where appropriate
- [ ] Lazy loading is implemented where appropriate
- [ ] No memory leaks during extended use
- [ ] No memory leaks during navigation
- [ ] Animation performance is smooth (60 FPS)

---

## Security Testing

### Security Considerations
- [ ] Environment variables are not exposed to client
- [ ] API keys are not exposed in client code
- [ ] Sensitive data is not stored in localStorage (or is minimized)
- [ ] User input is sanitized before storage
- [ ] User input is sanitized before display
- [ ] SQL injection is prevented
- [ ] XSS is prevented
- [ ] CSRF protection is considered
- [ ] Rate limiting is considered
- [ ] Payment signature verification prevents tampering
- [ ] Firebase token verification prevents unauthorized access
- [ ] HTTPS is enforced in production
- [ ] Secure headers are implemented
- [ ] Content Security Policy is implemented
- [ ] Subresource Integrity is considered for external scripts

---

## Integration Testing

### User Flows (Happy Paths)
- [ ] Complete end-to-end registration flow -- works correctly
- [ ] Register, logout, and register again -- works correctly
- [ ] Register, payment, dashboard navigation -- works correctly
- [ ] Register with photos, view in dashboard -- photos are preserved
- [ ] Register, browse profiles -- works correctly
- [ ] Multi-tab session sync -- works correctly

### Edge Cases & Error States
- [ ] Register with network interruption -- should handle gracefully
- [ ] Register with payment failure -- should handle gracefully
- [ ] Register with API failure -- should handle gracefully
- [ ] Concurrent registration attempts -- should handle appropriately

---

## Regression Testing

### Critical Test Cases
- [ ] Mobile OTP verification still works after Firebase updates
- [ ] Payment flow still works after Razorpay updates
- [ ] Profile submission still works after Supabase updates
- [ ] Form validation still works after Zod updates
- [ ] Animation still works after React updates
- [ ] Navigation still works after Next.js updates
- [ ] localStorage handling still works after browser updates
- [ ] Responsive design still works after CSS updates

---

## Load Testing

### Performance Under Load
- [ ] Multiple concurrent registration attempts -- system handles gracefully
- [ ] Multiple concurrent payment requests -- Razorpay handles gracefully
- [ ] Multiple concurrent profile submissions -- Supabase handles gracefully
- [ ] Multiple OTP requests -- Firebase handles gracefully
- [ ] Database connection pool handles concurrent requests
- [ ] API response times remain acceptable under load
- [ ] No deadlocks occur under concurrent access
- [ ] No race conditions occur in localStorage

---

## Monitoring & Logging

### Operational Considerations
- [ ] Errors are logged appropriately
- [ ] Performance metrics are collected
- [ ] User actions are tracked (if implemented)
- [ ] API failures are monitored
- [ ] Payment failures are monitored
- [ ] Authentication failures are monitored
- [ ] Database errors are monitored
- [ ] Alerts are configured for critical failures

