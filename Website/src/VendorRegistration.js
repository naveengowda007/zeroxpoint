import React, { useState, useEffect } from 'react';
import illustration from "assets/img/auth/auth.png";
import DefaultVendorAuth from "layouts/auth/DefaultVendorAuth";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useToast,
  Flex,
  Image,
  Divider,
  Link,
  Heading,
} from '@chakra-ui/react';
import axios from './axios';


const VendorRegistration = () => {
  // State variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [paymentOption, setPaymentOption] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const toast = useToast();

  // Geolocation logic
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (error) => {
          console.error('Error retrieving geolocation:', error);
          toast({
            title: "Geolocation Error",
            description: "Could not retrieve your location.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vendorData = {
      name,
      email,
      phoneNumber,
      shopName,
      address,
      password,
      bankOption: paymentOption,
      paymentFrequency,
      upiId: paymentOption === 'upi' ? upiId : undefined,
      accountHolderName: paymentOption === 'account' ? accountHolderName : undefined,
      accountNumber: paymentOption === 'account' ? accountNumber : undefined,
      ifscCode: paymentOption === 'account' ? ifscCode : undefined,
      lat,
      lng,
    };

    try {
      const response = await axios.post('/addVendor', vendorData);
      console.log(response);
      
      if (response?.message === 'success') {
        toast({
          title: "Vendor Registered.",
          description: "You have successfully registered as a vendor!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        window.location.href = '/auth';
      } else {
        throw new Error(response?.message || "Unexpected response from server.");
      }
    } catch (error) {
      let errorMessage = 'An error occurred.';

      if (error.response) {
        errorMessage = error.response.message || 'Something went wrong.';
      } else if (error.request) {
        errorMessage = 'No response received from the server.';
      } else {
        errorMessage = error.message;
      }

      toast({
        title: "Error.",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <DefaultVendorAuth illustrationBackground={illustration}>
  
    <Box
      flex="1"
      maxW={{ base: "100%", md: "80%", lg: "60%", xl: "45%" }}  // Increased width for form box
      w="100%"
      p={8}  // Adjust padding for breathing room
      borderRadius="10px"
      boxShadow="lg"
      maxHeight="90vh"
        overflowY="auto"
        css={{
    "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for Chrome, Safari, Edge
    "-ms-overflow-style": "none",  // Hide scrollbar for IE and Edge
    "scrollbar-width": "none"  // Hide scrollbar for Firefox
  }}
    >
      <Heading
        fontSize="24px"
        fontWeight="bold"
        textAlign="center"
        color="#333"
        mb={4}
      >
        Vendor Registration
      </Heading>
        <Box as="form" onSubmit={handleSubmit}>
          {/* Form Fields */}
          <FormControl mb={4} isRequired>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} borderRadius="5px" />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" borderRadius="5px" />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} borderRadius="5px" />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Shop Name</FormLabel>
            <Input value={shopName} onChange={(e) => setShopName(e.target.value)} borderRadius="5px" />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Address</FormLabel>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} borderRadius="5px" />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Password</FormLabel>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" borderRadius="5px" />
          </FormControl>
          <FormControl mb={4} isRequired>
            <FormLabel>Payment Option</FormLabel>
            <Select onChange={(e) => setPaymentOption(e.target.value)} value={paymentOption} borderRadius="5px">
              <option value="upi">UPI</option>
              <option value="account">Bank Account</option>
            </Select>
          </FormControl>
          {paymentOption === 'upi' ? (
            <FormControl mb={4} isRequired>
              <FormLabel>UPI ID</FormLabel>
              <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} borderRadius="5px" />
            </FormControl>
          ) : (
            <>
              <FormControl mb={4} isRequired>
                <FormLabel>Account Holder Name</FormLabel>
                <Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} borderRadius="5px" />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>Account Number</FormLabel>
                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} borderRadius="5px" />
              </FormControl>
              <FormControl mb={4} isRequired>
                <FormLabel>IFSC Code</FormLabel>
                <Input value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} borderRadius="5px" />
              </FormControl>
            </>
          )}
          <FormControl mb={4} isRequired>
            <FormLabel>Payment Frequency</FormLabel>
            <Select onChange={(e) => setPaymentFrequency(e.target.value)} value={paymentFrequency} borderRadius="5px">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </FormControl>
          <Divider my={4} />
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            borderRadius="5px"
          >
            Register Vendor
          </Button>
        </Box>
        <Text mt={4} textAlign="center">
          Already have an account?{' '}
          <Link color="blue.500" href="/login">
            Sign in
          </Link>
        </Text>
      </Box>
 
</DefaultVendorAuth>


      );
      
};

export default VendorRegistration;
