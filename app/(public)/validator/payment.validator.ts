export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fields: {
    payerName?: string;
    amount?: string;
    file?: string;
    paymentMethod?: string;
    entries?: string[];
  };
}

export interface PaymentFormData {
  payerName: string;
  amount: string;
  file: File | null;
  paymentMethod: string;
  entries: Array<{
    entryNumber: string;
    entryKey: string;
  }>;
  entryDetails: Record<number, any | null>;
  entryErrors: Record<number, string>;
  totalRequired?: number;
}

export const validatePaymentForm = (data: PaymentFormData): ValidationResult => {
  const errors: string[] = [];
  const fieldErrors: ValidationResult['fields'] = {
    payerName: '',
    amount: '',
    file: '',
    paymentMethod: '',
    entries: []
  };

  if (!data.payerName.trim()) {
    errors.push('Payer name is required');
    fieldErrors.payerName = 'Payer name is required';
  } else if (data.payerName.trim().length < 2) {
    errors.push('Payer name must be at least 2 characters');
    fieldErrors.payerName = 'Payer name must be at least 2 characters';
  } else if (data.payerName.trim().length > 100) {
    errors.push('Payer name must be less than 100 characters');
    fieldErrors.payerName = 'Payer name must be less than 100 characters';
  }

  if (!data.amount) {
    errors.push('Amount is required');
    fieldErrors.amount = 'Amount is required';
  } else {
    const amountNum = parseFloat(data.amount);
    if (isNaN(amountNum)) {
      errors.push('Amount must be a valid number');
      fieldErrors.amount = 'Amount must be a valid number';
    } else if (amountNum <= 0) {
      errors.push('Amount must be greater than 0');
      fieldErrors.amount = 'Amount must be greater than 0';
    } else if (amountNum > 1000000) {
      errors.push('Amount cannot exceed ₱1,000,000');
      fieldErrors.amount = 'Amount cannot exceed ₱1,000,000';
    }
  }

  if (!data.file) {
    errors.push('Proof of payment is required');
    fieldErrors.file = 'Proof of payment is required';
  } else {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(data.file.type)) {
      errors.push('File must be an image (JPEG, PNG, GIF, or WEBP)');
      fieldErrors.file = 'File must be an image (JPEG, PNG, GIF, or WEBP)';
    }

    const maxSize = 5 * 1024 * 1024;
    if (data.file.size > maxSize) {
      errors.push('File size must be less than 5MB');
      fieldErrors.file = 'File size must be less than 5MB';
    }
  }

  const validPaymentMethods = ['GCASH', 'BANK_TRANSFER', 'OVER_THE_COUNTER'];
  if (!data.paymentMethod) {
    errors.push('Payment method is required');
    fieldErrors.paymentMethod = 'Payment method is required';
  } else if (!validPaymentMethods.includes(data.paymentMethod)) {
    errors.push('Invalid payment method');
    fieldErrors.paymentMethod = 'Invalid payment method';
  }

  const entryErrors: string[] = [];
  data.entries.forEach((entry, index) => {
    const entryError = data.entryErrors[index];
    
    if (!entry.entryNumber || !entry.entryKey) {
      const errorMsg = `Entry ${index + 1} requires both Entry Number and Entry Key`;
      entryErrors.push(errorMsg);
      if (!fieldErrors.entries) fieldErrors.entries = [];
      if (!entry.entryNumber) {
        fieldErrors.entries.push(`Entry ${index + 1}: Entry Number is required`);
      }
      if (!entry.entryKey) {
        fieldErrors.entries.push(`Entry ${index + 1}: Entry Key is required`);
      }
    } else if (entryError) {
      entryErrors.push(`Entry ${index + 1}: ${entryError}`);
      if (!fieldErrors.entries) fieldErrors.entries = [];
      fieldErrors.entries.push(`Entry ${index + 1}: ${entryError}`);
    } else if (!data.entryDetails[index]?.entry?._id) {
      const errorMsg = `Entry ${index + 1}: Could not find entry data`;
      entryErrors.push(errorMsg);
      if (!fieldErrors.entries) fieldErrors.entries = [];
      fieldErrors.entries.push(errorMsg);
    }
  });

  if (entryErrors.length > 0) {
    errors.push(...entryErrors);
  }

  // Validate total amount if entries have amounts
  // const totalRequired = data.totalRequired || Object.values(data.entryDetails).reduce((total, details) => {
  //   return total + (details?.amount || 0);
  // }, 0);

  // if (totalRequired > 0) {
  //   const amountNum = parseFloat(data.amount) || 0;
  //   if (amountNum < totalRequired) {
  //     const diff = totalRequired - amountNum;
  //     errors.push(`Amount is insufficient. Missing ₱${diff.toFixed(2)}`);
  //     fieldErrors.amount = `Insufficient amount. Missing ₱${diff.toFixed(2)}`;
  //   }
  // }

  return {
    isValid: errors.length === 0,
    errors,
    fields: fieldErrors
  };
};

export const validatePayerName = (name: string): string => {
  if (!name.trim()) return 'Payer name is required';
  if (name.trim().length < 2) return 'Payer name must be at least 2 characters';
  if (name.trim().length > 100) return 'Payer name must be less than 100 characters';
  return '';
};

export const validateAmount = (amount: string): string => {
  if (!amount) return 'Amount is required';
  
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) return 'Amount must be a valid number';
  if (amountNum <= 0) return 'Amount must be greater than 0';
  if (amountNum > 1000000) return 'Amount cannot exceed ₱1,000,000';
  
  return '';
};

export const validateFile = (file: File | null): string => {
  if (!file) return 'Proof of payment is required';
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'File must be an image (JPEG, PNG, GIF, or WEBP)';
  }
  
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return 'File size must be less than 5MB';
  }
  
  return '';
};

export const validatePaymentMethod = (method: string): string => {
  const validPaymentMethods = ['GCASH', 'BANK_TRANSFER', 'OVER_THE_COUNTER'];
  if (!method) return 'Payment method is required';
  if (!validPaymentMethods.includes(method)) return 'Invalid payment method';
  return '';
};