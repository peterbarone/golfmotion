'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon, 
  useTheme,
  AppBar,
  Toolbar
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

function ResultsContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    // Get the ratio from URL parameters
    const ratioParam = searchParams.get("ratio");
    if (ratioParam) {
      setRatio(parseFloat(ratioParam));
    }
  }, [searchParams]);

  // Helper functions
  const getTempoCategory = (ratio: number) => {
    if (ratio >= 2.8 && ratio <= 3.2) return "Ideal";
    if (ratio > 3.2) return "Too Slow";
    return "Too Fast";
  };

  const getTempoColor = (ratio: number) => {
    if (ratio >= 2.8 && ratio <= 3.2) return theme.palette.success.main;
    if (ratio > 3.2) return theme.palette.info.main;
    return theme.palette.error.main;
  };
  
  const getTempoIcon = (category: string) => {
    switch(category) {
      case "Ideal":
        return <CheckCircleIcon color="success" />;
      case "Too Slow":
        return <WarningIcon color="info" />;
      case "Too Fast":
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'light' 
        ? 'linear-gradient(to bottom, #e8f5fe, #d0e8fd)' 
        : 'linear-gradient(to bottom, #1a2027, #121212)',
      py: 4
    }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <AppBar position="static" color="primary" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
            <Toolbar variant="dense">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Swing Analysis Results
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Your Tempo Ratio
            </Typography>
            
            {ratio !== null ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 5 }}>
                  <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ fontWeight: 'bold', mb: 1, color: getTempoColor(ratio) }}
                  >
                    {ratio.toFixed(1)}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="div"  
                    sx={{ color: getTempoColor(ratio) }}
                  >
                    {getTempoCategory(ratio)}
                  </Typography>
                </Box>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900' 
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    What This Means
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
                    The tempo ratio is the relationship between your backswing and downswing timing.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" component="span" sx={{ fontWeight: 'medium', color: theme.palette.success.main }}>Ideal:</Typography>}
                        secondary="A ratio between 2.8:1 and 3.2:1" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" component="span" sx={{ fontWeight: 'medium', color: theme.palette.info.main }}>Too Slow:</Typography>}
                        secondary="A ratio greater than 3.2:1" 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" component="span" sx={{ fontWeight: 'medium', color: theme.palette.error.main }}>Too Fast:</Typography>}
                        secondary="A ratio less than 2.8:1" 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: 'text.secondary', py: 4 }}>
                No swing data available.
              </Typography>
            )}
          </Box>
        </Paper>
        
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          Record Another Swing
        </Button>
      </Container>
    </Box>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>}>
      <ResultsContent />
    </Suspense>
  );
}
