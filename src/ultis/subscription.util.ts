export function getPlanType(amount: string) {
  if (amount === '100000') {
    return 'SILVER';
  } else if (amount === '200000') {
    return 'GOLD';
  } else {
    return 'PREMIUM';
  }
}

export function getActiveSubscription(subscriptions: any[]) {
  if (!subscriptions || subscriptions.length === 0) return null;

  const activeSubs = subscriptions.filter((sub) => {
    const isActive =
      sub.subscriptionStatus === 'ACTIVE' ||
      sub.subscriptionStatus === 'TRIALING';
    const isNotExpired =
      new Date(sub.currentPeriodEnd) >= new Date() || sub.isManual;
    return isActive && isNotExpired;
  });

  if (activeSubs.length === 0) return null;

  const planPriority: Record<string, number> = {
    PREMIUM: 3,
    GOLD: 2,
    SILVER: 1,
  };

  activeSubs.sort((a, b) => {
    const priorityA = planPriority[a.planType] || 0;
    const priorityB = planPriority[b.planType] || 0;

    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    return (
      new Date(b.currentPeriodEnd).getTime() -
      new Date(a.currentPeriodEnd).getTime()
    );
  });

  return activeSubs[0];
}
