import React, { useState, useEffect } from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
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
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import UnifiedBackendService from '../services/UnifiedBackendService';

interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_ACCOUNT' | 'MOBILE_MONEY';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

interface PaymentManagementProps {
  user: any;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ user }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as any });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    type: 'CREDIT_CARD',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });

  // Form validation
  const [showCvv, setShowCvv] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const backendService = UnifiedBackendService.getInstance();

  const loadPaymentData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [methods, plans] = await Promise.all([
        backendService.getPaymentMethods(),
        backendService.getSubscriptionPlans()
      ]);
      setPaymentMethods(methods || []);
      setSubscriptionPlans(plans || []);
    } catch (error) {
      console.error('Error loading payment data:', error);
      // setError('Failed to load payment information'); // Removed setError
    } finally {
      setLoading(false);
    }
  }, [backendService, setLoading, setPaymentMethods, setSubscriptionPlans]);

  const handleAddPaymentMethod = async () => {
    // Validate form
    const errors: { [key: string]: string } = {};
    if (!paymentForm.cardNumber) errors.cardNumber = 'Card number is required';
    if (!paymentForm.expiryMonth) errors.expiryMonth = 'Expiry month is required';
    if (!paymentForm.expiryYear) errors.expiryYear = 'Expiry year is required';
    if (!paymentForm.cvv) errors.cvv = 'CVV is required';
    if (!paymentForm.cardholderName) errors.cardholderName = 'Cardholder name is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const newMethod = await backendService.addPaymentMethod(paymentForm);
      setPaymentMethods(prev => [...prev, newMethod]);
      setShowAddPaymentDialog(false);
      resetPaymentForm();
      showNotification('Payment method added successfully!', 'success');
    } catch (error) {
      showNotification('Failed to add payment method', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, paymentMethodId: string) => {
    try {
      setLoading(true);
      await backendService.subscribeToPlan(planId, paymentMethodId);
      setShowSubscribeDialog(false);
      showNotification('Subscription successful!', 'success');
      // Reload payment data to reflect changes
      loadPaymentData();
    } catch (error) {
      showNotification('Subscription failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      type: 'CREDIT_CARD',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      isDefault: false
    });
    setFormErrors({});
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCardIcon />;
      case 'BANK_ACCOUNT':
        return <BankIcon />;
      case 'MOBILE_MONEY':
        return <PaymentIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return 'primary';
      case 'DEBIT_CARD':
        return 'secondary';
      case 'BANK_ACCOUNT':
        return 'success';
      case 'MOBILE_MONEY':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCardNumber = (number: string) => {
    return `**** **** **** ${number}`;
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
        Payment & Subscriptions
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Payment Methods */}
        <Box sx={{ flex: { xs: '1', md: '1' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Payment Methods
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddPaymentDialog(true)}
                >
                  Add Payment Method
                </Button>
              </Box>

              {paymentMethods.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PaymentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography color="text.secondary" gutterBottom>
                    No payment methods added yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add a payment method to start making purchases
                  </Typography>
                </Box>
              ) : (
                <List>
                  {paymentMethods.map((method, index) => (
                    <React.Fragment key={method.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: getPaymentTypeColor(method.type) + '.main' }}>
                            {getPaymentTypeIcon(method.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {method.type.replace('_', ' ')}
                              </Typography>
                              {method.isDefault && (
                                <Chip label="Default" size="small" color="primary" />
                              )}
                              {!method.isActive && (
                                <Chip label="Inactive" size="small" color="error" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatCardNumber(method.last4)}
                              </Typography>
                              {method.brand && (
                                <Typography variant="caption" color="text.secondary">
                                  {method.brand}
                                </Typography>
                              )}
                              {method.expiryMonth && method.expiryYear && (
                                <Typography variant="caption" color="text.secondary">
                                  Expires: {method.expiryMonth}/{method.expiryYear}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < paymentMethods.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Subscription Plans */}
        <Box sx={{ flex: { xs: '1', md: '1' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription Plans
              </Typography>

              {subscriptionPlans.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <StarIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography color="text.secondary">
                    No subscription plans available
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {subscriptionPlans.map((plan) => (
                    <Paper
                      key={plan.id}
                      sx={{
                        p: 2,
                        border: plan.isPopular ? 2 : 1,
                        borderColor: plan.isPopular ? 'primary.main' : 'divider',
                        position: 'relative'
                      }}
                    >
                      {plan.isPopular && (
                        <Chip
                          label="Most Popular"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: 16
                          }}
                        />
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {plan.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {plan.description}
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {plan.currency} {plan.price}
                            <Typography component="span" variant="body2" color="text.secondary">
                              /{plan.interval.toLowerCase()}
                            </Typography>
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        {plan.features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowSubscribeDialog(true);
                        }}
                        disabled={!plan.isActive}
                      >
                        {plan.isActive ? 'Subscribe Now' : 'Coming Soon'}
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={showAddPaymentDialog}
        onClose={() => setShowAddPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={paymentForm.type}
                onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                label="Payment Type"
              >
                <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                <MenuItem value="BANK_ACCOUNT">Bank Account</MenuItem>
                <MenuItem value="MOBILE_MONEY">Mobile Money</MenuItem>
              </Select>
            </FormControl>

            {['CREDIT_CARD', 'DEBIT_CARD'].includes(paymentForm.type) && (
              <>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={paymentForm.cardNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                  error={!!formErrors.cardNumber}
                  helperText={formErrors.cardNumber}
                  placeholder="1234 5678 9012 3456"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Expiry Month"
                    value={paymentForm.expiryMonth}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                    error={!!formErrors.expiryMonth}
                    helperText={formErrors.expiryMonth}
                    placeholder="MM"
                  />
                  <TextField
                    fullWidth
                    label="Expiry Year"
                    value={paymentForm.expiryYear}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                    error={!!formErrors.expiryYear}
                    helperText={formErrors.expiryYear}
                    placeholder="YYYY"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="CVV"
                    type={showCvv ? 'text' : 'password'}
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                    error={!!formErrors.cvv}
                    helperText={formErrors.cvv}
                    placeholder="123"
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowCvv(!showCvv)}
                          edge="end"
                        >
                          {showCvv ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={paymentForm.cardholderName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                  error={!!formErrors.cardholderName}
                  helperText={formErrors.cardholderName}
                  placeholder="John Doe"
                />
              </>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={paymentForm.isDefault}
                  onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                />
              }
              label="Set as default payment method"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddPaymentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddPaymentMethod}
            disabled={loading}
          >
            Add Payment Method
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscribe Dialog */}
      <Dialog
        open={showSubscribeDialog}
        onClose={() => setShowSubscribeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  You will be charged <strong>{selectedPlan.currency} {selectedPlan.price}</strong> {selectedPlan.interval.toLowerCase()}.
                </Typography>
              </Alert>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Plan Features:
                </Typography>
                {selectedPlan.features.map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                ))}
              </Box>

              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  label="Payment Method"
                  defaultValue=""
                >
                  {paymentMethods
                    .filter(method => method.isActive)
                    .map(method => (
                      <MenuItem key={method.id} value={method.id}>
                        {method.type.replace('_', ' ')} - {formatCardNumber(method.last4)}
                        {method.isDefault && ' (Default)'}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <Alert severity="warning" icon={<LockIcon />}>
                <Typography variant="body2">
                  Your payment information is secure and encrypted.
                </Typography>
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubscribeDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedPlan) {
                // Get selected payment method and subscribe
                const paymentMethodId = paymentMethods.find(m => m.isDefault)?.id;
                if (paymentMethodId) {
                  handleSubscribe(selectedPlan.id, paymentMethodId);
                }
              }
            }}
            disabled={loading}
          >
            Subscribe Now
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

export default PaymentManagement;
