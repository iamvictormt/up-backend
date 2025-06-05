export function getUsername(user: any): string {
  return (
    user.loveDecoration?.name ||
    user.professional?.name ||
    user.partnerSupplier?.tradeName ||
    ''
  );
}
