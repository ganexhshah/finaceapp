# Alert Component Usage Guide

The Alert component is a reusable modal dialog for displaying messages, confirmations, and notifications.

## Import

```typescript
import Alert from '@/components/alert';
```

## Basic Usage

### 1. Success Alert
```typescript
const [showSuccess, setShowSuccess] = useState(false);

<Alert
  visible={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="Success!"
  message="Your transaction has been saved successfully."
  type="success"
  confirmText="OK"
/>
```

### 2. Error Alert
```typescript
const [showError, setShowError] = useState(false);

<Alert
  visible={showError}
  onClose={() => setShowError(false)}
  title="Error"
  message="Something went wrong. Please try again."
  type="error"
  confirmText="OK"
/>
```

### 3. Warning Alert
```typescript
const [showWarning, setShowWarning] = useState(false);

<Alert
  visible={showWarning}
  onClose={() => setShowWarning(false)}
  title="Warning"
  message="You are about to exceed your budget limit."
  type="warning"
  confirmText="Got it"
/>
```

### 4. Info Alert
```typescript
const [showInfo, setShowInfo] = useState(false);

<Alert
  visible={showInfo}
  onClose={() => setShowInfo(false)}
  title="Information"
  message="Your data has been synced with the cloud."
  type="info"
  confirmText="OK"
/>
```

### 5. Confirmation Dialog (with Cancel button)
```typescript
const [showConfirm, setShowConfirm] = useState(false);

<Alert
  visible={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Delete Category"
  message="Are you sure you want to delete this category? This action cannot be undone."
  type="confirm"
  confirmText="Delete"
  cancelText="Cancel"
  showCancel={true}
  onConfirm={() => {
    // Handle delete action
    console.log('Confirmed');
  }}
  onCancel={() => {
    // Handle cancel action
    console.log('Cancelled');
  }}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | boolean | Yes | - | Controls alert visibility |
| `onClose` | function | Yes | - | Called when alert is closed |
| `title` | string | Yes | - | Alert title text |
| `message` | string | Yes | - | Alert message text |
| `type` | 'success' \| 'error' \| 'warning' \| 'info' \| 'confirm' | No | 'info' | Alert type (affects icon and color) |
| `confirmText` | string | No | 'OK' | Text for confirm button |
| `cancelText` | string | No | 'Cancel' | Text for cancel button |
| `onConfirm` | function | No | - | Called when confirm button is pressed |
| `onCancel` | function | No | - | Called when cancel button is pressed |
| `showCancel` | boolean | No | false | Show cancel button |

## Alert Types

- **success**: Green checkmark icon - for successful operations
- **error**: Red X icon - for errors and failures
- **warning**: Orange warning icon - for warnings and cautions
- **info**: Blue info icon - for informational messages
- **confirm**: Blue question icon - for confirmation dialogs

## Complete Example

```typescript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Alert from '@/components/alert';

export default function MyScreen() {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      // Perform delete operation
      console.log('Deleting item:', itemToDelete);
    }
    setItemToDelete(null);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => handleDeleteClick(1)}>
        <Text>Delete Item</Text>
      </TouchableOpacity>

      <Alert
        visible={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false);
          setItemToDelete(null);
        }}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        type="confirm"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
}
```

## Styling

The Alert component uses the app's design system:
- Google Sans font (web) / System font (mobile)
- Consistent colors matching the app theme
- Responsive design with proper spacing
- Shadow and elevation for depth
- Smooth fade animation

## Notes

- The alert automatically closes when confirm button is pressed
- If `onConfirm` or `onCancel` callbacks are provided, they are called before closing
- The overlay is semi-transparent and dismisses the alert when tapped
- Maximum width is 400px for better readability on larger screens
