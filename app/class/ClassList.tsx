'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { CreateClassDialog } from './CreateClassDialog';
import { AssignChildDialog } from './AssignChildDialog';
import { JoinClassDialog } from './JoinClassDialog';
import { ClassMembershipRole } from '@prisma/client';
import { getUserClasses, leaveClass, removeChildFromClass, removeClass } from './actions/actions';
import Image from 'next/image';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRouter } from 'next/navigation';

type ChildType = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isOwnChild?: boolean;
};

type ClassType = {
  id: string;
  name: string;
  userRole: ClassMembershipRole;
  School?: { id: string; name: string } | null;
  children?: ChildType[];
};

export const ClassList = () => {
  const router = useRouter();

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

  const handleLeaveClass = async (id: string) => {
    const confirmed = window.confirm('Czy na pewno chcesz opuścić tę klasę?');
    if (!confirmed) return;

    try {
      await leaveClass(id);
    } catch (error) {
      console.log(error);
    }
    refreshUserClasses();
  };

  const handleDeleteClass = async (id: string) => {
    const confirmed = window.confirm('Czy na pewno chcesz usunąć tę klasę?');
    if (!confirmed) return;
    try {
      await removeClass(id);
    } catch (error) {
      console.error(error);
    }
    refreshUserClasses();
  };

  const handleRemoveChild = async (childId: string, childName: string, classId: string) => {
    const confirmed = window.confirm(`Czy na pewno chcesz wypisać ${childName} z tej klasy?`);
    if (!confirmed) return;

    try {
      const response = await removeChildFromClass(childId, classId);
      if (!response.succes) {
        throw new Error('Nie udało się wypisać dziecka z klasy');
      }

      refreshUserClasses();
    } catch (error) {
      console.error('Błąd podczas wypisywania dziecka:', error);
      alert('Wystąpił błąd podczas wypisywania dziecka z klasy');
    }
  };

  const canRemoveChild = (userRole: ClassMembershipRole, isOwnChild: boolean) => {
    return (
      (userRole === ClassMembershipRole.PARENT || userRole === ClassMembershipRole.TREASURER) &&
      isOwnChild
    );
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
              <Card
                key={cls.id}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => {
                  router.push(`collection/${cls.id}`);
                }}
              >
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
                    {cls.userRole === ClassMembershipRole.TREASURER && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          (e.stopPropagation(), handleDeleteClass(cls.id));
                        }}
                      >
                        Usuń klasę
                      </Button>
                    )}
                    {cls.userRole === ClassMembershipRole.PARENT && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveClass(cls.id);
                        }}
                      >
                        Opuść klasę
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(cls.id);
                      }}
                    >
                      {expandedId === cls.id ? 'Ukryj dzieci' : 'Pokaż dzieci'}
                    </Button>
                  </Stack>
                </CardContent>

                <Collapse in={expandedId === cls.id} timeout="auto" unmountOnExit>
                  <CardContent sx={{ borderTop: '1px solid #ccc' }}>
                    {cls.children && cls.children.length > 0 ? (
                      cls.children.map((child) => (
                        <Stack
                          key={child.id}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            {child.avatarUrl ? (
                              <Image
                                src={child.avatarUrl}
                                alt={child.name}
                                width={32}
                                height={32}
                                style={{ borderRadius: '50%' }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: 'grey.400',
                                }}
                              />
                            )}
                            <Typography variant="body2">{child.name}</Typography>
                          </Stack>

                          {canRemoveChild(cls.userRole, child.isOwnChild ?? false) && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveChild(child.id, child.name, cls.id)}
                              title="Wypisz dziecko z klasy"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
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

      <CreateClassDialog
        open={openCreateClass}
        onClose={() => setOpenCreateClass(false)}
        onCreated={refreshUserClasses}
      />
      <AssignChildDialog open={openAssignChild} onClose={() => setOpenAssignChild(false)} />
      <JoinClassDialog
        open={openJoinClass}
        onClose={() => setOpenJoinClass(false)}
        onJoined={refreshUserClasses}
      />
    </>
  );
};
