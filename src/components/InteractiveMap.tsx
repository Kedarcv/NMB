import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  MyLocation as LocationIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Directions as DirectionsIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  QrCode as QrCodeIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Map as MapIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';
import UnifiedBackendService from '../services/UnifiedBackendService';

interface Partner {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  commission: number;
  rating: number;
  contactEmail: string;
  contactPhone: string;
  businessHours: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  currentPromotions?: any[];
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface InteractiveMapProps {
  onPartnerSelect?: (partner: Partner) => void;
  onCheckIn?: (partnerId: string) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  onPartnerSelect, 
  onCheckIn 
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -17.8252, lng: 31.0335 }); // Harare, Zimbabwe
  const [zoom, setZoom] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as any });

  const backendService = UnifiedBackendService.getInstance();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserLocation();
    loadPartners();
  }, []);

  useEffect(() => {
    filterPartners();
  }, [partners, searchQuery, categoryFilter, distanceFilter, showOnlyActive]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setUserLocation(location);
          setMapCenter({ lat: location.latitude, lng: location.longitude });
          
          // Update partner distances
          updatePartnerDistances(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const loadPartners = async () => {
    try {
      setLoading(true);
      const partnersData = await backendService.getNearbyPartners();
      setPartners(partnersData || []);
    } catch (error) {
      console.error('Error loading partners:', error);
      setError('Failed to load nearby partners');
    } finally {
      setLoading(false);
    }
  };

  const updatePartnerDistances = (location: UserLocation) => {
    const updatedPartners = partners.map(partner => {
      if (partner.latitude && partner.longitude) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          partner.latitude,
          partner.longitude
        );
        return { ...partner, distance };
      }
      return partner;
    });
    setPartners(updatedPartners);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filterPartners = () => {
    let filtered = partners;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(partner => partner.type === categoryFilter);
    }

    // Distance filter
    if (userLocation) {
      filtered = filtered.filter(partner => 
        partner.distance && partner.distance <= distanceFilter
      );
    }

    // Status filter
    if (showOnlyActive) {
      filtered = filtered.filter(partner => partner.status === 'ACTIVE');
    }

    // Sort by distance
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setFilteredPartners(filtered);
  };

  const handlePartnerSelect = (partner: Partner) => {
    setSelectedPartner(partner);
    if (onPartnerSelect) {
      onPartnerSelect(partner);
    }
  };

  const handleCheckIn = async (partnerId: string) => {
    try {
      await backendService.checkInToLocation(partnerId);
      showNotification('Check-in successful! Points earned.', 'success');
      if (onCheckIn) {
        onCheckIn(partnerId);
      }
    } catch (error) {
      showNotification('Check-in failed. Please try again.', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'RESTAURANT': return 'success';
      case 'RETAIL': return 'primary';
      case 'SERVICE': return 'warning';
      case 'ENTERTAINMENT': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'INACTIVE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card sx={{ m: 2, mb: 1 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MapIcon color="primary" />
            <Typography variant="h6">
              Interactive Map
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadPartners}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search partners, categories, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            size="small"
          />

          {/* Filters */}
          {showFilters && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    <MenuItem value="RESTAURANT">Restaurant</MenuItem>
                    <MenuItem value="RETAIL">Retail</MenuItem>
                    <MenuItem value="SERVICE">Service</MenuItem>
                    <MenuItem value="ENTERTAINMENT">Entertainment</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" gutterBottom>
                    Max Distance: {distanceFilter} km
                  </Typography>
                  <Slider
                    value={distanceFilter}
                    onChange={(_, value) => setDistanceFilter(value as number)}
                    min={1}
                    max={50}
                    marks={[
                      { value: 1, label: '1km' },
                      { value: 10, label: '10km' },
                      { value: 25, label: '25km' },
                      { value: 50, label: '50km' }
                    ]}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnlyActive}
                      onChange={(e) => setShowOnlyActive(e.target.checked)}
                    />
                  }
                  label="Active Only"
                />
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2, m: 2, mt: 0 }}>
        {/* Map Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            <CardContent sx={{ height: '100%', p: 0, position: 'relative' }}>
              {/* Map Placeholder */}
              <Box
                ref={mapRef}
                sx={{
                  height: '100%',
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="grey.600" gutterBottom>
                    Interactive Map
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Map integration will be implemented here
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                  </Typography>
                  <Typography variant="body2" color="grey.500">
                    Zoom: {zoom}x
                  </Typography>
                </Box>

                {/* User Location Indicator */}
                {userLocation && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 20,
                      height: 20,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      border: '2px solid white',
                      boxShadow: 2,
                      zIndex: 10
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                )}

                {/* Partner Markers */}
                {filteredPartners.map((partner, index) => (
                  <Box
                    key={partner.id}
                    sx={{
                      position: 'absolute',
                      top: `${20 + (index * 60)}px`,
                      left: `${20 + (index * 30)}px`,
                      cursor: 'pointer',
                      zIndex: 5
                    }}
                    onClick={() => handlePartnerSelect(partner)}
                  >
                    <Avatar
                      sx={{
                        bgcolor: getCategoryColor(partner.type) + '.main',
                        width: 40,
                        height: 40,
                        border: '2px solid white',
                        boxShadow: 2
                      }}
                    >
                      <BusinessIcon />
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.7rem'
                      }}
                    >
                      {partner.name}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Map Controls */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 15 }}>
                <Stack spacing={1}>
                  <IconButton
                    sx={{ bgcolor: 'white', boxShadow: 2 }}
                    onClick={() => setZoom(prev => Math.min(prev + 1, 20))}
                  >
                    +
                  </IconButton>
                  <IconButton
                    sx={{ bgcolor: 'white', boxShadow: 2 }}
                    onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
                  >
                    -
                  </IconButton>
                  <IconButton
                    sx={{ bgcolor: 'white', boxShadow: 2 }}
                    onClick={getUserLocation}
                  >
                    <LocationIcon />
                  </IconButton>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Partners List */}
        <Box sx={{ width: 400, overflow: 'hidden' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', p: 0, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  Nearby Partners ({filteredPartners.length})
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {filteredPartners.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No partners found in your area
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {filteredPartners.map((partner) => (
                      <ListItem
                        key={partner.id}
                        onClick={() => handlePartnerSelect(partner)}
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: getCategoryColor(partner.type) + '.main' }}>
                            <BusinessIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" noWrap>
                                {partner.name}
                              </Typography>
                              <Chip
                                label={partner.status}
                                size="small"
                                color={getStatusColor(partner.status) as any}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {partner.type} • {partner.location}
                              </Typography>
                              {partner.distance && (
                                <Typography variant="caption" color="primary">
                                  {partner.distance.toFixed(1)} km away
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            icon={<StarIcon />}
                            label={partner.rating.toFixed(1)}
                            size="small"
                            variant="outlined"
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckIn(partner.id);
                            }}
                            sx={{ color: 'success.main' }}
                          >
                            <QrCodeIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Partner Details Dialog */}
      <Dialog
        open={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPartner && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: getCategoryColor(selectedPartner.type) + '.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedPartner.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPartner.type} • {selectedPartner.location}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Business Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={selectedPartner.status}
                      color={getStatusColor(selectedPartner.status) as any}
                      size="small"
                    />
                    <Chip
                      icon={<StarIcon />}
                      label={`${selectedPartner.rating} rating`}
                      size="small"
                      variant="outlined"
                    />
                    {selectedPartner.distance && (
                      <Chip
                        label={`${selectedPartner.distance.toFixed(1)} km away`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Contact Information
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{selectedPartner.contactPhone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{selectedPartner.contactEmail}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">{selectedPartner.businessHours}</Typography>
                    </Box>
                  </Stack>
                </Box>

                {selectedPartner.currentPromotions && selectedPartner.currentPromotions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Promotions
                    </Typography>
                    <Stack spacing={1}>
                      {selectedPartner.currentPromotions.map((promo, index) => (
                        <Chip
                          key={index}
                          icon={<OfferIcon />}
                          label={promo.title}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedPartner(null)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<DirectionsIcon />}
                onClick={() => {
                  // Open directions in maps app
                  if (selectedPartner.latitude && selectedPartner.longitude) {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedPartner.latitude},${selectedPartner.longitude}`,
                      '_blank'
                    );
                  }
                }}
              >
                Get Directions
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<QrCodeIcon />}
                onClick={() => {
                  handleCheckIn(selectedPartner.id);
                  setSelectedPartner(null);
                }}
              >
                Check In
              </Button>
            </DialogActions>
          </>
        )}
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

export default InteractiveMap;
