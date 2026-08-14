type Note = {
  severity: 'info' | 'success';
  message: string;
};

const notesData: Note[] = [
  { severity: 'info', message: 'This demo loads two files through docs-infra.' },
  { severity: 'success', message: 'Its data comes from a relative import.' },
];

export default notesData;
