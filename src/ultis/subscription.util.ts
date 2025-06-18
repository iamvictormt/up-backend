export function getPlanType(amount: string) {
  if (amount === '100000') {
    return 'SILVER';
  } else if (amount === '200000') {
    return 'GOLD';
  } else {
    return 'PREMIUM';
  }
}
