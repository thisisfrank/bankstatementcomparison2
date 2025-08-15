# Feedback System Setup

## Overview
The feedback system has been added to both the Settings page and the Comparison Results view. Users can click the "Feedback" button to submit feedback about categorization, comparison results, or general app experience.

## How It Works
1. **User clicks "Feedback" button** - Opens a modal form
2. **User types feedback** - Context-aware (categorization, comparison, general)
3. **User submits** - Opens their email client with pre-filled subject and body
4. **Email sent** - Feedback goes directly to your email

## Customization

### Change Email Address
To change where feedback emails are sent, edit `src/components/FeedbackForm.tsx`:

```typescript
// Line ~60: Change this email address
const mailtoLink = `mailto:YOUR-EMAIL@example.com?subject=${subject}&body=${body}`;
```

### Email Format
Feedback emails include:
- **Subject**: "Bank Statement Comparison Feedback - [context]"
- **Body**: 
  - Feedback context (categorization/comparison/general)
  - User's feedback text
  - Timestamp
  - User's email (if they're signed in)

## Locations
- **Settings Page**: Full feedback section with description
- **Results View**: Small feedback button below export options

## Benefits
- ✅ **No backend required** - Uses client-side mailto
- ✅ **Context-aware** - Different feedback types
- ✅ **User-friendly** - Simple form interface
- ✅ **Easy to customize** - Just change email address
- ✅ **Dark mode support** - Matches app theme

## Future Enhancements
- Add feedback analytics dashboard
- Implement feedback categories
- Add user satisfaction ratings
- Track feedback response times
