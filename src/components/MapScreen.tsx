import React, { useState, useEffect } from 'react'; // eslint-disable-line
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Skeleton,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  TrendingUp as TrendingIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingIcon,
  LocalGroceryStore as GroceryIcon,
  LocalPharmacy as PharmacyIcon,
  LocalGasStation as GasIcon,
  AccountBalance as BankIcon,
  Phone as PhoneIcon,
  LocalOffer as OfferIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { User } from '../services/UnifiedBackendService';
import UnifiedBackendService from '../services/UnifiedBackendService';

interface MapScreenProps {
  user: User;
}

interface PartnerLocation {
  id: string;
  name: string;
  category: 'RESTAURANT' | 'RETAIL' | 'GROCERY' | 'PHARMACY' | 'SERVICE' | 'BANKING' | 'HEALTHCARE';
  address: string;
  city: string;
  distance: number;
  rating: number;
  checkInBonus: number;
  pointsMultiplier: number;
  isOpen: boolean;
  openingHours: string;
  phone: string;
  description: string;
  specialOffers: string[];
  icon: React.ReactNode;
  color: string;
}

const MapScreen: React.FC<MapScreenProps> = ({ user }) => {
  const [backendService] = useState(() => UnifiedBackendService.getInstance());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [partnerLocations, setPartnerLocations] = useState<PartnerLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<PartnerLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<PartnerLocation | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Zimbabwean business partners
  const zimbabweanPartners: PartnerLocation[] = [
    {
      id: '1',
      name: 'Nandos Harare',
      category: 'RESTAURANT',
      address: 'Samora Machel Avenue, Harare',
      city: 'Harare',
      distance: 0.8,
      rating: 4.5,
      checkInBonus: 50,
      pointsMultiplier: 2.0,
      isOpen: true,
      openingHours: '8:00 AM - 10:00 PM',
      phone: '+263 4 123456',
      description: 'Famous for our flame-grilled PERi-PERi chicken. Check in to earn double points on all purchases!',
      specialOffers: ['2x Points on Check-in', 'Free Drink with Main Meal', 'Loyalty Member Discounts'],
      icon: <RestaurantIcon />,
      color: '#FF5722',
    },
    {
      id: '2',
      name: 'Pick n Pay Borrowdale',
      category: 'GROCERY',
      address: 'Borrowdale Road, Harare',
      city: 'Harare',
      distance: 2.1,
      rating: 4.3,
      checkInBonus: 30,
      pointsMultiplier: 1.5,
      isOpen: true,
      openingHours: '7:00 AM - 9:00 PM',
      phone: '+263 4 234567',
      description: 'Your one-stop shop for groceries and household essentials. Earn bonus points on fresh produce!',
      specialOffers: ['Bonus Points on Fresh Produce', 'Member-Only Deals', 'Weekly Specials'],
      icon: <GroceryIcon />,
      color: '#4CAF50',
    },
    {
      id: '3',
      name: 'Edgars Eastgate',
      category: 'RETAIL',
      address: 'Eastgate Shopping Centre, Harare',
      city: 'Harare',
      distance: 1.5,
      rating: 4.2,
      checkInBonus: 40,
      pointsMultiplier: 1.8,
      isOpen: true,
      openingHours: '9:00 AM - 7:00 PM',
      phone: '+263 4 345678',
      description: 'Fashion, beauty, and lifestyle products. Check in for exclusive member discounts!',
      specialOffers: ['Member-Only Sales', 'Fashion Styling Service', 'Beauty Consultation'],
      icon: <ShoppingIcon />,
      color: '#2196F3',
    },
    {
      id: '4',
      name: 'Clicks Pharmacy',
      category: 'PHARMACY',
      address: 'Avondale Shopping Centre, Harare',
      city: 'Harare',
      distance: 3.2,
      rating: 4.6,
      checkInBonus: 25,
      pointsMultiplier: 1.3,
      isOpen: true,
      openingHours: '8:00 AM - 8:00 PM',
      phone: '+263 4 456789',
      description: 'Health and beauty products with professional pharmacy services. Earn points on health essentials!',
      specialOffers: ['Health Check-ups', 'Beauty Product Samples', 'Pharmacy Consultation'],
      icon: <PharmacyIcon />,
      color: '#9C27B0',
    },
    {
      id: '5',
      name: 'Puma Energy',
      category: 'SERVICE',
      address: 'Enterprise Road, Harare',
      city: 'Harare',
      distance: 4.1,
      rating: 4.0,
      checkInBonus: 20,
      pointsMultiplier: 1.2,
      isOpen: true,
      openingHours: '24/7',
      phone: '+263 4 567890',
      description: 'Fuel and convenience store. Check in for fuel discounts and bonus points!',
      specialOffers: ['Fuel Discounts', 'Car Wash Service', 'Convenience Store Items'],
      icon: <GasIcon />,
      color: '#FF9800',
    },
    {
      id: '6',
      name: 'CBZ Bank',
      category: 'BANKING',
      address: 'Corner First Street & Samora Machel, Harare',
      city: 'Harare',
      distance: 0.5,
      rating: 4.4,
      checkInBonus: 35,
      pointsMultiplier: 1.6,
      isOpen: true,
      openingHours: '8:00 AM - 3:00 PM',
      phone: '+263 4 678901',
      description: 'Leading Zimbabwean bank. Check in for financial services and earn loyalty points!',
      specialOffers: ['Financial Advisory', 'Investment Opportunities', 'Loan Services'],
      icon: <BankIcon />,
      color: '#607D8B',
    },
  ];

  const categories = [
    { value: 'ALL', label: 'All Categories', icon: <LocationIcon />, color: '#1976D2' },
    { value: 'RESTAURANT', label: 'Restaurants', icon: <RestaurantIcon />, color: '#FF5722' },
    { value: 'RETAIL', label: 'Retail', icon: <ShoppingIcon />, color: '#2196F3' },
    { value: 'GROCERY', label: 'Grocery', icon: <GroceryIcon />, color: '#4CAF50' },
    { value: 'PHARMACY', label: 'Pharmacy', icon: <PharmacyIcon />, color: '#9C27B0' },
    { value: 'SERVICE', label: 'Services', icon: <GasIcon />, color: '#FF9800' },
    { value: 'BANKING', label: 'Banking', icon: <BankIcon />, color: '#607D8B' },
  ];

  const loadMapData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPartnerLocations(zimbabweanPartners);
    } catch (error) {
      console.error('Failed to load partner locations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setPartnerLocations]);

  const filterLocations = React.useCallback(() => { // eslint-disable-line react-hooks/exhaustive-deps
    let filtered = partnerLocations;

    if (searchQuery) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(location => location.category === selectedCategory);
    }

    setFilteredLocations(filtered);
  }, [partnerLocations, searchQuery, selectedCategory, setFilteredLocations]);

  const handleLocationClick = (location: PartnerLocation) => {
    setSelectedLocation(location);
    setShowLocationDialog(true);
  };

  const handleCheckIn = async () => {
    if (!selectedLocation) return;

    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalPoints = selectedLocation.checkInBonus * selectedLocation.pointsMultiplier;
      await backendService.addLoyaltyPoints(
        user.id,
        totalPoints,
        `Check-in at ${selectedLocation.name}`
      );

      setShowCheckInDialog(true);
      loadMapData();
      
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
    }
  };

  const getCategoryColor = (category: string) => {
    return categories.find(cat => cat.value === category)?.color || '#757575';
  };

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 8 }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)', color: 'white', py: 3, px: 2 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Partner Locations</Typography>
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ mt: -2, px: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Box key={item}>
                <Card elevation={2} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
                    <Skeleton variant="text" height={24} width="80%" sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
          color: 'white',
          py: 3,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Partner Locations
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Discover Zimbabwean businesses and earn points
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={loadMapData} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -2, px: 2 }}>
        {/* Search and Filters */}
        <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, alignItems: 'center' }}>
              <Box>
                <TextField
                  fullWidth
                  placeholder="Search locations, addresses, or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ backgroundColor: 'white' }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {categories.map((category) => (
                    <Chip
                      key={category.value}
                      icon={category.icon}
                      label={category.label}
                      onClick={() => setSelectedCategory(category.value)}
                      variant={selectedCategory === category.value ? 'filled' : 'outlined'}
                      color={selectedCategory === category.value ? 'primary' : 'default'}
                      sx={{
                        backgroundColor: selectedCategory === category.value ? category.color : 'transparent',
                        color: selectedCategory === category.value ? 'white' : 'inherit',
                        '&:hover': {
                          backgroundColor: selectedCategory === category.value ? category.color : 'rgba(0,0,0,0.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card elevation={2} sx={{ borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <LocationIcon sx={{ fontSize: 80, color: '#1976D2', mb: 2, opacity: 0.7 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565C0', mb: 1 }}>
              Interactive Map Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're working on integrating Google Maps to show your location and nearby partner businesses.
              For now, browse our partner list below!
            </Typography>
            <Chip
              icon={<LocationIcon />}
              label={`${filteredLocations.length} locations found`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </CardContent>
        </Card>

        {/* Partner Locations */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Nearby Partners
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {filteredLocations.map((location, index) => (
            <Box key={location.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  },
                }}
                onClick={() => handleLocationClick(location)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: `${location.color}20`,
                        color: location.color,
                        width: 50,
                        height: 50,
                        mr: 2,
                      }}
                    >
                      {location.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {location.name}
                      </Typography>
                      <Chip
                        label={location.category}
                        size="small"
                        sx={{
                          backgroundColor: `${getCategoryColor(location.category)}20`,
                          color: getCategoryColor(location.category),
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {location.address}, {location.city}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ fontSize: 16, color: '#FFD700', mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {location.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {location.distance} km away
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      icon={<FireIcon />}
                      label={`${location.checkInBonus} pts`}
                      color="warning"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Chip
                      icon={<TrendingIcon />}
                      label={`${location.pointsMultiplier}x`}
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {location.isOpen ? (
                    <Chip
                      label="Open Now"
                      color="success"
                      size="small"
                      sx={{ mt: 2, fontWeight: 'bold' }}
                    />
                  ) : (
                    <Chip
                      label="Closed"
                      color="error"
                      size="small"
                      sx={{ mt: 2, fontWeight: 'bold' }}
                    />
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {filteredLocations.length === 0 && (
          <Card elevation={2} sx={{ borderRadius: 3, mt: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 60, color: '#BDBDBD', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>
                No locations found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search criteria or category filter.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Location Detail Dialog */}
      <Dialog
        open={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedLocation?.name}
            </Typography>
            <IconButton onClick={() => setShowLocationDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedLocation && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    backgroundColor: `${selectedLocation.color}20`,
                    color: selectedLocation.color,
                    width: 80,
                    height: 80,
                    mr: 3,
                  }}
                >
                  {selectedLocation.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {selectedLocation.name}
                  </Typography>
                  <Chip
                    label={selectedLocation.category}
                    sx={{
                      backgroundColor: `${getCategoryColor(selectedLocation.category)}20`,
                      color: getCategoryColor(selectedLocation.category),
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Location Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedLocation.address}, {selectedLocation.city}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Distance
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedLocation.distance} km away
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedLocation.rating}/5.0
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Business Info
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Opening Hours
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedLocation.openingHours}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedLocation.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedLocation.isOpen ? 'Open Now' : 'Closed'}
                      color={selectedLocation.isOpen ? 'success' : 'error'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedLocation.description}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Special Offers
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {selectedLocation.specialOffers.map((offer, index) => (
                  <Chip
                    key={index}
                    label={offer}
                    icon={<OfferIcon />}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<FireIcon />}
                  label={`Check-in Bonus: ${selectedLocation.checkInBonus} points`}
                  color="warning"
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip
                  icon={<TrendingIcon />}
                  label={`Points Multiplier: ${selectedLocation.pointsMultiplier}x`}
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PhoneIcon />}
            onClick={() => {
              if (selectedLocation) {
                window.open(`tel:${selectedLocation.phone}`, '_self');
              }
            }}
          >
            Call
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleCheckIn}
            disabled={!selectedLocation?.isOpen}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45A049' },
            }}
          >
            Check In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Check-in Result Dialog */}
      <Dialog
        open={showCheckInDialog}
        onClose={() => setShowCheckInDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckIcon sx={{ color: '#4CAF50' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Check-in Successful
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <TrophyIcon sx={{ fontSize: 60, color: '#FFD700', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 2 }}>
              Successfully checked in!
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              You earned bonus points for checking in at this Zimbabwean business partner!
            </Alert>
            <Typography variant="body1" color="text.secondary">
              Your points have been added to your account. Keep checking in to earn more rewards!
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setShowCheckInDialog(false)}
            variant="contained"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45A049' },
            }}
          >
            Great!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapScreen;
