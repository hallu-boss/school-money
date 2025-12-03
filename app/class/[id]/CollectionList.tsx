'use client';
import { Collection } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getClassCollections, getClassName } from '../actions/actions';
import { Card, CardContent, Paper, Stack, Typography, Button, Box, Container } from '@mui/material';
import Image from 'next/image';

type CollectionDTO = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  startAt: Date;
  endAt: Date;
  classId: string;
};

export const CollectionList = () => {
  const router = useRouter();

  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [className, setClassName] = useState<string | null>('');
  const { id } = useParams<{ id: string }>();

  const fetchClassCollections = async (id: string) => {
    try {
      const collections = await getClassCollections(id);
      if (!collections) {
        throw new Error();
      }
      const className = await getClassName(id);
      setClassName(className || '');
      setCollections(collections);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClassCollections(id);
    }
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper
        sx={{
          p: 3,
          mb: 4,
          border: '2px #ddd',
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Zbiórki klasy {className}
        </Typography>

        <Stack spacing={2}>
          {collections.map((collection) => {
            return (
              <Card
                key={collection.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 1,
                  },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {/* Obrazek */}
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 100,
                        height: 100,
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Image
                        src={collection.coverUrl || '/placeholder.jpg'}
                        alt={collection.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>

                    {/* Tytuł i opis */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {collection.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem',
                        }}
                      >
                        {collection.description || 'Brak opisu zbiórki'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          router.push(`/collection/${collection.id}`);
                        }}
                        sx={{
                          mt: 1,
                          textTransform: 'none',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                        }}
                      >
                        Szczegóły
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Paper>
    </Container>
  );
};
