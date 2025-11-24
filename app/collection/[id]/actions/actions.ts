export interface Transaction {
  id: string;
  type: 'PAYMENT' | 'WITHDRAWAL';
  parent: string;
  child: string;
  amount: number;
  date: string;
  rawDate: Date;
}

export interface AttachmentProps {
  id: string;
  label: string;
}

export const changeCollectionCover = () => {};

export const updateCollectionDescription = (newDescription: string) => {};

export const updateCollectionTitle = (newTitle: string) => {};

export const deleteAttachment = () => {};

export const downloadAttachment = () => {};

export const uploadAttachment = () => {};
