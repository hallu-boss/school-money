import { Box } from '@mui/material';
import { CollectionList } from './CollectionList';
import CreateCollectionButton from './CreateCollectionButton';

interface PageProps {
  params: { id: string };
}

export default async function Home({ params }: PageProps) {
  const { id } = await params;
  return (
    <Box p={4} maxWidth={900} margin="auto" display="flex" flexDirection="column" gap={4}>
      <CreateCollectionButton classId={id}/>
      <CollectionList />
    </Box>
  );
}
