'use client';

import {
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { CreateClassDialog } from './CreateClassDialog';
import { AssignChildDialog } from './AssignChildDialog';
import { JoinClassDialog } from './JoinClassDialog';
import { ClassMembershipRole } from '@prisma/client';
import { getUserClasses, removeClass } from './actions/actions';

type ChildType = { id: string; name: string };

type ClassType = {
  id: string;
  name: string;
  userRole: ClassMembershipRole;
  School?: { id: string; name: string } | null;
  children?: ChildType[];
};

export const ClassList = () => {
  const [userClasses, setUserClasses] = useState<ClassType[]>([]);
  const [openCreateClass, setOpenCreateClass] = useState(false);
  const [openJoinClass, setOpenJoinClass] = useState(false);
  const [openAssignChild, setOpenAssignChild] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const fetchUserClasses = async () => {
    const data = await getUserClasses();
    setUserClasses(data);
  };

  useEffect(() => {
    fetchUserClasses();
  }, []);

  const refreshUserClasses = async () => {
    fetchUserClasses();
  };

  const handleDeleteClass = async (id: string) => {
    const confirmed = window.confirm('Czy na pewno chcesz usunąć tę klasę');
    if (!confirmed) return;
    try {
      await removeClass(id);
    } catch (error) {
      console.error(error);
    }
    refreshUserClasses();
  };

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={() => setOpenCreateClass(true)}>
            Stwórz klasę
          </Button>
          <Button variant="outlined" onClick={() => setOpenAssignChild(true)}>
            Przypisz dziecko
          </Button>
          <Button variant="outlined" onClick={() => setOpenJoinClass(true)}>
            Dołącz do klasy
          </Button>
        </Stack>

        <Stack spacing={4}>
          <Paper sx={{ bgcolor: 'grey.100', p: 2, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Klasy do których jesteś przypisany
            </Typography>

            {userClasses.map((cls) => (
              <Card key={cls.id} sx={{ mb: 2 }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Typography variant="h6">{cls.name}</Typography>
                    {cls.School ? (
                      <Typography variant="body2" color="text.secondary">
                        Szkoła: {cls.School.name}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Brak przypisanej szkoły
                      </Typography>
                    )}
                  </div>

                  <Stack direction="row" spacing={1}>
                    {cls.userRole === 'TREASURER' && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        Usuń klasę
                      </Button>
                    )}

                    <Button variant="outlined" onClick={() => toggleExpand(cls.id)}>
                      {expandedId === cls.id ? 'Ukryj dzieci' : 'Pokaż dzieci'}
                    </Button>
                  </Stack>
                </CardContent>

                <Collapse in={expandedId === cls.id} timeout="auto" unmountOnExit>
                  <CardContent sx={{ borderTop: '1px solid #ccc' }}>
                    {cls.children && cls.children.length > 0 ? (
                      cls.children.map((child) => (
                        <Typography key={child.id} variant="body2">
                          {child.name}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Brak przypisanych dzieci
                      </Typography>
                    )}
                  </CardContent>
                </Collapse>
              </Card>
            ))}
          </Paper>
        </Stack>
      </Container>

      <CreateClassDialog open={openCreateClass} onClose={() => setOpenCreateClass(false)} />
      <AssignChildDialog open={openAssignChild} onClose={() => setOpenAssignChild(false)} />
      <JoinClassDialog open={openJoinClass} onClose={() => setOpenJoinClass(false)} />
    </>
  );
};
