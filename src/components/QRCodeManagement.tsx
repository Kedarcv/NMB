import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  Stack,
  Avatar,
  Badge,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode as QrCodeIcon,
  QrCodeScanner as QrCodeScannerIcon,
  History as HistoryIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import UnifiedBackendService from '../services/UnifiedBackendService';

interface QRCode {
  id: string;
  type: 'POINTS' | 'CHECKIN' | 'PROMOTION' | 'REFERRAL' | 'CUSTOM';
  data: string;
  pointsAmount?: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'INVALID';
  expiresAt?: string;
  usedAt?: string;
  usedBy?: string;
  createdAt: string;
  description?: string;
}

interface QRCodeHistory {
  id: string;
  qrCodeId: string;
  action: 'GENERATED' | 'SCANNED' | 'USED' | 'EXPIRED';
  timestamp: string;
  details: string;
  pointsEarned?: number;
}

interface QRCodeManagementProps {
  user: any;
}

const QRCodeManagement: React.FC<QRCodeManagementProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [qrHistory, setQrHistory] = useState<QRCodeHistory[]>([]);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as any });

  // QR Generation form state
  const [qrForm, setQrForm] = useState({
    type: 'POINTS',
    data: '',
    pointsAmount: 50,
    description: '',
    expiresIn: '24'
  });

  // QR Scan state
  const [scannedData, setScannedData] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);

  const backendService = UnifiedBackendService.getInstance();

  useEffect(() => {
    loadQRData();
  }, []);

  const loadQRData = async () => {
    try {
      setLoading(true);
      const [codes, history] = await Promise.all([
        backendService.getQRCodeHistory(),
        backendService.getQRCodeHistory()
      ]);
      setQrCodes(codes || []);
      setQrHistory(history || []);
    } catch (error) {
      console.error('Error loading QR data:', error);
      setError('Failed to load QR code information');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!qrForm.data.trim()) {
      setError('QR code data is required');
      return;
    }

    try {
      setLoading(true);
      const qrCode = await backendService.generateQRCode({
        type: qrForm.type,
        data: qrForm.data,
        pointsAmount: qrForm.pointsAmount,
        description: qrForm.description,
        expiresIn: parseInt(qrForm.expiresIn)
      });
      
      setQrCodes(prev => [qrCode, ...prev]);
      setShowGenerateDialog(false);
      resetQRForm();
      showNotification('QR code generated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to generate QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = async () => {
    if (!scannedData.trim()) {
      setError('Please scan a QR code first');
      return;
    }

    try {
      setLoading(true);
      const result = await backendService.scanQRCode(scannedData);
      setScanResult(result);
      showNotification('QR code scanned successfully!', 'success');
      
      // Add to history
      if (result.success) {
        const newHistoryItem: QRCodeHistory = {
          id: Date.now().toString(),
          qrCodeId: result.qrCodeId || 'unknown',
          action: 'SCANNED',
          timestamp: new Date().toISOString(),
          details: `Scanned QR code: ${result.message}`,
          pointsEarned: result.pointsEarned
        };
        setQrHistory(prev => [newHistoryItem, ...prev]);
      }
    } catch (error) {
      showNotification('Failed to scan QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetQRForm = () => {
    setQrForm({
      type: 'POINTS',
      data: '',
      pointsAmount: 50,
      description: '',
      expiresIn: '24'
    });
    setError(null);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'POINTS':
        return <QrCodeIcon color="primary" />;
      case 'CHECKIN':
        return <QrCodeIcon color="secondary" />;
      case 'PROMOTION':
        return <QrCodeIcon color="success" />;
      case 'REFERRAL':
        return <QrCodeIcon color="warning" />;
      case 'CUSTOM':
        return <QrCodeIcon color="info" />;
      default:
        return <QrCodeIcon />;
    }
  };

  const getQRStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'USED':
        return 'info';
      case 'EXPIRED':
        return 'warning';
      case 'INVALID':
        return 'error';
      default:
        return 'default';
    }
  };

  const getQRStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon color="success" />;
      case 'USED':
        return <InfoIcon color="info" />;
      case 'EXPIRED':
        return <WarningIcon color="warning" />;
      case 'INVALID':
        return <WarningIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        QR Code Management
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowGenerateDialog(true)}
        >
          Generate QR Code
        </Button>
        <Button
          variant="outlined"
          startIcon={<QrCodeScannerIcon />}
          onClick={() => setShowScanDialog(true)}
        >
          Scan QR Code
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={loadQRData}
        >
          Refresh
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="My QR Codes" />
          <Tab label="Scan History" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {qrCodes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <QrCodeIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography color="text.secondary" gutterBottom>
                No QR codes generated yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate your first QR code to start sharing
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {qrCodes.map((qrCode) => (
                <Paper key={qrCode.id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getQRStatusIcon(qrCode.status)}
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {qrCode.type.replace('_', ' ')} QR Code
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {qrCode.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={qrCode.status}
                            color={getQRStatusColor(qrCode.status) as any}
                            size="small"
                          />
                          {qrCode.pointsAmount && (
                            <Chip
                              label={`${qrCode.pointsAmount} points`}
                              color="primary"
                              size="small"
                            />
                          )}
                          {qrCode.expiresAt && (
                            <Chip
                              label={`Expires: ${formatTimestamp(qrCode.expiresAt)}`}
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(qrCode.data)}
                        title="Copy QR data"
                      >
                        <CopyIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(qrCode.id)}
                        title="Copy QR ID"
                      >
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        title="Delete QR code"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatTimestamp(qrCode.createdAt)}
                    </Typography>
                    {qrCode.usedAt && (
                      <Typography variant="caption" color="text.secondary">
                        Used: {formatTimestamp(qrCode.usedAt)}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {qrHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography color="text.secondary">
                No scan history yet
              </Typography>
            </Box>
          ) : (
            <List>
              {qrHistory.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <HistoryIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {item.action.replace('_', ' ')}
                          </Typography>
                          {item.pointsEarned && (
                            <Chip
                              label={`+${item.pointsEarned} points`}
                              color="success"
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.details}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(item.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < qrHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* Generate QR Code Dialog */}
      <Dialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate New QR Code</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>QR Code Type</InputLabel>
              <Select
                value={qrForm.type}
                onChange={(e) => setQrForm({ ...qrForm, type: e.target.value })}
                label="QR Code Type"
              >
                <MenuItem value="POINTS">Points QR Code</MenuItem>
                <MenuItem value="CHECKIN">Check-in QR Code</MenuItem>
                <MenuItem value="PROMOTION">Promotion QR Code</MenuItem>
                <MenuItem value="REFERRAL">Referral QR Code</MenuItem>
                <MenuItem value="CUSTOM">Custom QR Code</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="QR Code Data"
              value={qrForm.data}
              onChange={(e) => setQrForm({ ...qrForm, data: e.target.value })}
              placeholder="Enter data for the QR code"
              multiline
              rows={3}
            />

            {qrForm.type === 'POINTS' && (
              <TextField
                fullWidth
                label="Points Amount"
                type="number"
                value={qrForm.pointsAmount}
                onChange={(e) => setQrForm({ ...qrForm, pointsAmount: parseInt(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Points:</InputAdornment>
                }}
              />
            )}

            <TextField
              fullWidth
              label="Description (Optional)"
              value={qrForm.description}
              onChange={(e) => setQrForm({ ...qrForm, description: e.target.value })}
              placeholder="Describe what this QR code is for"
            />

            <FormControl fullWidth>
              <InputLabel>Expires In</InputLabel>
              <Select
                value={qrForm.expiresIn}
                onChange={(e) => setQrForm({ ...qrForm, expiresIn: e.target.value })}
                label="Expires In"
              >
                <MenuItem value="1">1 hour</MenuItem>
                <MenuItem value="24">24 hours</MenuItem>
                <MenuItem value="168">1 week</MenuItem>
                <MenuItem value="720">1 month</MenuItem>
                <MenuItem value="8760">1 year</MenuItem>
                <MenuItem value="0">Never</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateQR}
            disabled={loading}
          >
            Generate QR Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scan QR Code Dialog */}
      <Dialog
        open={showScanDialog}
        onClose={() => setShowScanDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CameraIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Camera Access Required
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Allow camera access to scan QR codes
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="QR Code Data"
              value={scannedData}
              onChange={(e) => setScannedData(e.target.value)}
              placeholder="Or manually enter QR code data"
              multiline
              rows={3}
            />

            {scanResult && (
              <Alert severity={scanResult.success ? 'success' : 'error'}>
                <Typography variant="body2">
                  {scanResult.message}
                </Typography>
                {scanResult.pointsEarned && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Points earned: <strong>{scanResult.pointsEarned}</strong>
                  </Typography>
                )}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowScanDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleScanQR}
            disabled={loading || !scannedData.trim()}
          >
            Scan QR Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRCodeManagement;
