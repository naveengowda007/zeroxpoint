import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Spinner,
  Image,
  InputRightAddon,
  IconButton,
} from "@chakra-ui/react";
import { NavLink, useHistory } from "react-router-dom";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import {
  RiEyeCloseLine,
  RiLockPasswordLine,
  RiMailLine,
  RiPhoneFill,
} from "react-icons/ri";
import { getData, handleNumericScroll, upost } from "res";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import { hpost } from "res";
import { handleUserData } from "Utils/auth";
import logo from "../assets/img/logo.png";

function SignIn() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.500";
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");

  const dispatch = useDispatch();
  const history = useHistory();

  // States
  const downloadLink = "https://zeroxpoint.com/pm/Zeroxpoint-v1.apk";
  const [Loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ShowDownload, setShowDownload] = useState(true);

  // User States
  const [IsUser, setIsUser] = useState(true);
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [OTPsent, setOTPsent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle for Forgot Password view
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [VerifySent, setVerifySent] = useState(false);

  const handleOtpRequest = () => {
    if (!phone) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    upost("/auth/forgetpassword", { phone })
      .then(() => {
        setOtpSent(true);
        setLoading(false);
        toast.success("OTP sent to your phone.");
      })
      .catch(() => {
        setLoading(false);
        toast.error("Failed to send OTP.");
      });
  };

  const handleOtpVerificationReset = () => {
    setLoading(true);
    upost("/auth/verify", { phone, otp, type: "phone" })
      .then(() => {
        setVerifySent(true);
        toast.success("OTP verified. You can now reset your password.");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("OTP verification failed.");
      });
  };

  const handlePasswordReset = () => {
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    setLoading(true);
    upost("/auth/updatepassword", { phone, password: newPassword })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          // Success case, handle the password reset as successful
          setLoading(false);
          toast.success("Password reset successful. You can now log in.");
          setVerifySent(false);
          setIsForgotPassword(false);
          setOtpSent(false);
          setNewPassword("");
          setPhone("");
          setOtp("");
        } else {
          throw new Error("Unexpected response status");
        }
      })
      .catch((error) => {
        // Check if the error is a 201 status code (in case it ends up in catch)
        if (error.status === 201) {
          setLoading(false);
          toast.success("Password reset successful. You can now log in.");
          setVerifySent(false);
          setIsForgotPassword(false);
          setOtpSent(false);
          setNewPassword("");
          setPhone("");
          setOtp("");
        } else {
          setLoading(false);
          console.error("Error:", error);
          toast.error("Password reset failed.");
        }
      });
  };

  const handleClick = () => setShow(!show);

  useEffect(() => {
    let isAuth = getData("token");
    if (isAuth) handleGoToNextScreen();
  }, []);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setOtp("");
    setOTPsent(false);
  }, [IsUser]);

  function toastError(msg) {
    toast.error(msg, {
      position: "bottom-left",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }

  function handleGoToNextScreen() {
    let user = getData("userData");
    user = JSON.parse(user);
    const goToScreen = user?.type === "user" || IsUser ? "/user" : "/admin";
    history.replace(goToScreen);
  }

  function isValidPhoneNumber(phoneNumber) {
    const phoneNumberPattern = /^[6-9]\d{9}$/;
    return phoneNumberPattern.test(phoneNumber);
  }

  function handleEmailLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      toastError("Please fill in all fields.");
      return;
    }

    const data = {
      email: email.toLowerCase().trim(),
      password,
    };

    setLoading(true);
    hpost("/verify", data)
      .then((res) => {
        // console.log(res);
        handleUserData(res, dispatch);
        handleGoToNextScreen();
      })
      .catch((err) => {
        setLoading(false);
        toastError("Login failed.");
      });
  }

  const handleOTPLogin = (e) => {
    e.preventDefault();
    if (!isValidPhoneNumber(PhoneNumber)) {
      toastError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setOTPsent(false);
    upost("/auth/register", { phone: PhoneNumber, type: "phone" })
      .then((res) => {
        if (res?.otp) {
          setOTPsent(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        toastError("Something went wrong.");
      });
  };

  const handleOTPVerification = () => {
    const data = {
      phone: PhoneNumber,
      otp,
      type: "phone",
    };

    if (otp.length !== 4) {
      toastError("Enter a valid OTP");
      return;
    }

    setLoading(true);

    upost("/auth/verify", data)
      .then((res) => {
        if (res.jwt) {
          handleUserData({ ...data, ...res }, dispatch);
          setTimeout(() => {
            handleGoToNextScreen();
          }, 1000);
        } else {
          toastError("Something went wrong.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        toastError("Something went wrong.");
        setLoading(false);
      });
  };

  return (
    <DefaultAuth illustrationBackground={illustration}>
      {ShowDownload ? (
        <Flex
          maxW={{ base: "100%", md: "max-content" }}
          w="100%"
          h="100%"
          alignItems="center"
          justifyContent="center"
          px={{ base: "25px", md: "0px" }}
          flexDirection="column"
        >
          <Box display={{ base: "block", md: "none" }}>
            <Flex align="center">
              <Image src={logo} boxSize="70px" mr="20px" />
              <Heading color={textColor} fontSize="36px">
                ZEROXPOINT
              </Heading>
            </Flex>
          </Box>

          <Box me="auto">
            <Box display={{ base: "none", md: "block" }}>
              <Heading color={textColor} fontSize="36px" mb="10px">
                ZEROXPOINT
              </Heading>
            </Box>
            <Text
              my="20px"
              maxW="500px"
              color={textColorSecondary}
              fontWeight="400"
              fontSize="20px"
            >
              <span
                style={{
                  "white-space": "pre-line",
                  fontSize: 18,
                  fontWeight: "500",
                }}
              >
                {`Welcome to Your Printing Solution!
								A dedicated full-service printing company, bringing your ideas to life in vibrant color and crisp clarity. We offer an array of printing services, including brochures, business cards, banners, and much more.

								But we don't just print. We deliver too! No need to step out of your comfort zone; we bring your printed products right to your doorstep. Experience the convenience of professional printing without leaving your home or office.
								`}
              </span>
            </Text>

            <Flex alignItems="center" ml="15px">
              <Text
                my="20px"
                maxW="500px"
                color={textColorSecondary}
                fontWeight="500"
                fontSize={{ base: "17px", md: "20px" }}
                mx={{ base: "10px", md: "30px" }}
              >
                Get Started Now!!
              </Text>
              <Button
                ml="3px"
                colorScheme="green"
                size="md"
                onClick={() => window.open(downloadLink, "_blank")}
              >
                Download Our App
              </Button>
            </Flex>

            <Flex alignItems="center">
              <Text
                maxW="500px"
                color={textColorSecondary}
                fontWeight="500"
                fontSize={{ base: "17px", md: "20px" }}
                mx={{ base: "10px", md: "30px" }}
              >
                Print From Browser?
              </Text>
              <Button
                ml="3px"
                colorScheme="telegram"
                color="blue"
                size="md"
                px="30px"
                onClick={() => {
                  setIsUser(true);
                  setShowDownload(false);
                }}
              >
                Login / Sign up
              </Button>
            </Flex>

            <Text
              my="10px"
              maxW="500px"
              ml={{ base: "20px", md: "30px" }}
              color={textColorSecondary}
              fontWeight="400"
              fontSize={{ base: "17px", md: "20px" }}
            >
              Let's Print, Deliver, and Impress Together!
            </Text>

            <Flex alignItems="center" ml="30px">
              <Text
                maxW="500px"
                color={textColorSecondary}
                fontWeight="500"
                fontSize={{ base: "17px", md: "20px" }}
                mx={{ base: "10px", md: "30px" }}
              >
                Are you a Vendor?
              </Text>
              <Button
                ml="10px"
                colorScheme="telegram"
                color="blue"
                size="md"
                px="30px"
                onClick={() => {
                  setIsUser(false);
                  setShowDownload(false);
                }}
              >
                Login
              </Button>
            </Flex>
          </Box>
        </Flex>
      ) : (
        <Flex
          maxW={{ base: "100%", md: "max-content" }}
          w="100%"
          mx={{ base: "auto", lg: "0px" }}
          me="auto"
          h="100%"
          alignItems="center"
          justifyContent="center"
          px={{ base: "25px", md: "0px" }}
          flexDirection="column"
        >
          {isForgotPassword ? (
            <Box me="auto">
              <Heading color={textColor} fontSize="36px" mb="10px">
                Forgot Password{" "}
              </Heading>
              <Text
                mb="36px"
                ms="4px"
                color={textColorSecondary}
                fontWeight="400"
                fontSize="md"
              >
                Enter your Phone Number to reset your password!
              </Text>
            </Box>
          ) : (
            <Box me="auto">
              <Heading color={textColor} fontSize="36px" mb="10px">
                Sign In
              </Heading>
              <Text
                mb="36px"
                ms="4px"
                color={textColorSecondary}
                fontWeight="400"
                fontSize="md"
              >
                Enter your Phone / Email and password to sign in!
              </Text>
            </Box>
          )}

          <Flex
            zIndex="2"
            direction="column"
            w={{ base: "100%", md: "420px" }}
            maxW="100%"
            background="transparent"
            borderRadius="15px"
            mx={{ base: "auto", lg: "unset" }}
            me="auto"
          >
            {IsUser ? (
              <form>
                <FormControl id="phone-number">
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Phone Number<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <InputGroup size="md">
                    <Input
                      type="tel"
                      value={PhoneNumber}
                      onWheel={handleNumericScroll}
                      id="phone"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: "0px", md: "0px" }}
                      placeholder="xxx - xxx - xxxx"
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      maxLength="10"
                      pattern="\d{10}"
                      onChange={(event) => {
                        setPhoneNumber(
                          event.target.value.replace(/[^0-9]/g, "")
                        );
                      }}
                      bg="#FFF"
                    />
                    <InputRightAddon
                      borderTopRightRadius="15px"
                      borderBottomRightRadius="15px"
                      py="23px"
                      bg="#FFF"
                      children={
                        <IconButton
                          icon={<RiPhoneFill />}
                          aria-label="Phone Number"
                        />
                      }
                    />
                  </InputGroup>
                </FormControl>
                <FormControl id="otp">
                  {OTPsent ? (
                    <>
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        OTP<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          disabled={!OTPsent}
                          id="otp-input"
                          value={otp}
                          onWheel={handleNumericScroll}
                          isRequired={true}
                          variant="auth"
                          fontSize="sm"
                          ms={{ base: "0px", md: "0px" }}
                          placeholder="Enter OTP"
                          mb="24px"
                          fontWeight="500"
                          size="lg"
                          maxLength="4"
                          pattern="\d{4}"
                          onChange={(event) => {
                            setOtp(event.target.value.replace(/[^0-9]/g, ""));
                          }}
                          bg="#FFF"
                        />
                        <InputRightAddon
                          borderTopRightRadius="15px"
                          borderBottomRightRadius="15px"
                          py="23px"
                          bg="#FFF"
                          children={
                            <IconButton
                              icon={<RiLockPasswordLine />}
                              aria-label="OTP"
                            />
                          }
                        />
                      </InputGroup>
                    </>
                  ) : null}
                  <Button
                    onClick={OTPsent ? handleOTPVerification : handleOTPLogin}
                    type="submit"
                    fontSize="sm"
                    fontWeight="500"
                    colorScheme="blue"
                    w="100%"
                    h="50"
                    mb="24px"
                  >
                    {OTPsent ? "Verify OTP" : "Send OTP"}{" "}
                    {Loading && <Spinner ml="15px" color="#FFF" />}
                  </Button>
                </FormControl>
              </form>
            ) : (
              <div>
                {isForgotPassword ? (
                  <form>
                    <FormControl id="phone" isRequired mb="4">
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </FormControl>

                    {otpSent ? (
                      <>
                        {!VerifySent ? (
                          <>
                            <FormControl id="otp" isRequired mb="4">
                              <FormLabel>OTP</FormLabel>
                              <Input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                              />
                            </FormControl>

                            <Button
                              onClick={handleOtpVerificationReset}
                              colorScheme="blue"
                              w="100%"
                              mt="4"
                            >
                              {Loading ? <Spinner /> : "Verify OTP"}
                            </Button>
                          </>
                        ) : (
                          <>
                            <FormControl id="new-password" isRequired mt="4">
                              <FormLabel>New Password</FormLabel>
                              <Input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                            </FormControl>

                            <Button
                              onClick={handlePasswordReset}
                              colorScheme="green"
                              w="100%"
                              mt="4"
                            >
                              {Loading ? <Spinner /> : "Reset Password"}
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={handleOtpRequest}
                        colorScheme="blue"
                        w="100%"
                        mt="4"
                      >
                        {Loading ? <Spinner /> : "Send OTP"}
                      </Button>
                    )}

                    {/* Link to go back to Sign In */}
                    <Flex justifyContent="space-between" align="center">
                      <Text
                        fontSize="sm"
                        cursor="pointer"
                        color="blue.500"
                        mt="4"
                        onClick={() => {
                          handleOtpRequest();
                        }}
                      >
                        Resend Otp.
                      </Text>
                      <Text
                        fontSize="sm"
                        cursor="pointer"
                        color="blue.500"
                        mt="4"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setNewPassword("");
                          setPhone("");
                          setOtp("");
                        }}
                      >
                        Back to Sign In
                      </Text>
                    </Flex>
                  </form>
                ) : (
                  <form>
                    <FormControl>
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Email<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          id="email"
                          value={email}
                          isRequired={true}
                          variant="auth"
                          fontSize="sm"
                          ms={{ base: "0px", md: "0px" }}
                          placeholder="mail@zp.com"
                          mb="24px"
                          fontWeight="500"
                          size="lg"
                          onChange={(element) => setEmail(element.target.value)}
                          bg="#FFF"
                        />
                        <InputRightAddon
                          borderTopRightRadius="15px"
                          borderBottomRightRadius="15px"
                          display="inline-flex"
                          py="23px"
                          bg="#FFF"
                          children={
                            <IconButton
                              icon={<RiMailLine />}
                              aria-label="Email"
                            />
                          }
                        />
                      </InputGroup>
                      <FormLabel
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        display="flex"
                      >
                        Password<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          id="password"
                          isRequired={true}
                          fontSize="sm"
                          placeholder="Min. 8 characters"
                          size="lg"
                          type={show ? "text" : "password"}
                          variant="auth"
                          onChange={(element) =>
                            setPassword(element.target.value)
                          }
                          bg="#FFF"
                        />
                        <InputRightElement
                          display="flex"
                          alignItems="center"
                          mt="4px"
                        >
                          <Icon
                            color={textColorSecondary}
                            _hover={{ cursor: "pointer" }}
                            as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                            onClick={handleClick}
                          />
                        </InputRightElement>
                      </InputGroup>

                      <Flex
                        justifyContent="space-between"
                        align="center"
                        mb="24px"
                      >
                        <Text
                          color={textColorBrand}
                          cursor="pointer"
                          fontSize="sm"
                          w="124px"
                          fontWeight="500"
                          pt="10px"
                          onClick={() => {
                            setIsForgotPassword(true);
                          }}
                        >
                          Forgot password?
                        </Text>
                        <Text
                          color={textColorBrand}
                          cursor="pointer"
                          fontSize="sm"
                          fontWeight="500"
                          pt="10px"
                          onClick={() => {
                            window.open(
                              "https://zeroxpoint.com/register",
                              "_blank"
                            );
                          }}
                        >
                          New Vendor
                        </Text>
                      </Flex>
                      <Button
                        onClick={handleEmailLogin}
                        type="submit"
                        fontSize="sm"
                        fontWeight="500"
                        colorScheme="blue"
                        w="100%"
                        h="50"
                      >
                        Sign In {Loading && <Spinner ml="15px" color="#FFF" />}
                      </Button>
                    </FormControl>
                  </form>
                )}
              </div>
            )}
          </Flex>

          <Text
            maxW="500px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="17px"
            my="20px"
          >
            Let's Print, Deliver, and Impress Together!
          </Text>

          <Button
            onClick={() => window.open(downloadLink, "_blank")}
            fontSize="sm"
            fontWeight="500"
            colorScheme="green"
            w="100%"
            h="50"
          >
            Download Our App
          </Button>

          <Flex alignItems="center">
            <Text
              maxW="500px"
              color={textColorSecondary}
              fontWeight="500"
              fontSize={{ base: "17px" }}
              mx={{ base: "10px" }}
              my="10px"
            >
              {!IsUser ? "Login as User" : "Login as Vendor?"}
            </Text>
            <Button
              ml="3px"
              colorScheme="telegram"
              color="blue"
              size="md"
              px="30px"
              onClick={() => {
                setIsUser((val) => !val);
              }}
            >
              {!IsUser ? "Login / Sign up" : "Login"}
            </Button>
          </Flex>
        </Flex>
      )}
    </DefaultAuth>
  );
}

export default SignIn;
