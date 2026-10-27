import { useState } from 'react';

export function useCounter() {
  return useState(0);
}
