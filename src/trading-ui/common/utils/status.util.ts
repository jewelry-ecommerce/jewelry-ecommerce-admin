export const getStatusPillSx = (status: string) => {
  const normalized = String(status ?? '').trim();

  // Return & Exchange statuses
  if (normalized === 'Pending' || normalized === 'AwaitingPickup' || normalized === 'Inspection') {
    return { color: '#B54708', backgroundColor: '#FFFAEB' };
  }
  if (normalized === 'Approved' || normalized === 'Collected' || normalized === 'Stored' || normalized === 'AwaitingExchange' || normalized === 'ExchangeReleased' || normalized === 'Completed') {
    return { color: '#027A48', backgroundColor: '#ECFDF3' };
  }
  if (normalized === 'CollectionFailed' || normalized === 'Rejected' || normalized === 'Cancelled') {
    return { color: '#B42318', backgroundColor: '#FEF3F2' };
  }
  if (normalized === 'Processing') {
    return { color: '#175CD3', backgroundColor: '#EFF8FF' };
  }

  // Legacy aliases
  if (status === 'Pending' || status === 'PendingRecall' || status === 'Inspecting') {
    return { color: '#B54708', backgroundColor: '#FFFAEB' };
  }
  if (status === 'Confirmed' || status === 'Recalled' || status === 'StockedIn' || status === 'ReleasedNewOrder') {
    return { color: '#027A48', backgroundColor: '#ECFDF3' };
  }
  if (status === 'RecallFailed' || status === 'Rejected') {
    return { color: '#B42318', backgroundColor: '#FEF3F2' };
  }
  return { color: '#344054', backgroundColor: '#F2F4F7' };
};
